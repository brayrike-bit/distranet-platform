"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import type { CSSProperties, MutableRefObject } from "react";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useCinematicCanvas } from "./useCinematicCanvas";

const MODEL_URL = "/models/distranet-network-evolution.glb";
const POSTER_URL = "/renders/distranet-network-evolution.webp";

type NetworkEvolutionWorldProps = {
  className?: string;
  style?: CSSProperties;
};

function EvolutionAssembly({ reducedMotion, progress }: { reducedMotion: boolean; progress: MutableRefObject<number> }) {
  const source = useGLTF(MODEL_URL);
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const scrub = useRef(0);
  const actionList = useRef<THREE.AnimationAction[]>([]);
  const signalMaterials = useRef<THREE.MeshStandardMaterial[]>([]);
  const model = useMemo(() => source.scene.clone(true), [source.scene]);
  const { actions, mixer } = useAnimations(source.animations, group);

  useEffect(() => {
    const activeMaterials: THREE.MeshStandardMaterial[] = [];

    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;

      if (/member_signal|signal_conduit|network_core_signal|network_core_outer_ring/i.test(object.name)) {
        const sourceMaterials = Array.isArray(object.material) ? object.material : [object.material];
        const clonedMaterials = sourceMaterials.map((material) => material.clone());
        object.material = Array.isArray(object.material) ? clonedMaterials : clonedMaterials[0];
        clonedMaterials.forEach((material) => {
          if (material instanceof THREE.MeshStandardMaterial) activeMaterials.push(material);
        });
      }
    });

    signalMaterials.current = activeMaterials;
  }, [model]);

  useEffect(() => {
    const active = Object.values(actions).filter((action): action is THREE.AnimationAction => Boolean(action));
    actionList.current = active;
    active.forEach((action) => {
      action.reset().play();
      action.paused = true;
    });

    return () => {
      active.forEach((action) => action?.fadeOut(0.18));
    };
  }, [actions, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;

    const updatePointer = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      pointer.current.y = 1 - (event.clientY / Math.max(1, window.innerHeight)) * 2;
    };
    window.addEventListener("pointermove", updatePointer, { passive: true });
    return () => {
      window.removeEventListener("pointermove", updatePointer);
    };
  }, [reducedMotion]);

  useFrame((state, delta) => {
    if (!group.current) return;

    scrub.current = THREE.MathUtils.damp(scrub.current, progress.current, 4, delta);
    actionList.current.forEach(action => {
      action.paused = true;
      action.time = action.getClip().duration * scrub.current * .7;
    });
    mixer.update(0);

    const motion = reducedMotion ? { x: 0, y: 0 } : pointer.current;
    const scrollProgress = reducedMotion ? 0 : progress.current;
    const targetX = -0.13 + motion.y * 0.07;
    const targetY = -0.2 + motion.x * 0.15 + scrollProgress * 0.16;
    const targetScale = 0.78 + scrollProgress * 0.045;

    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 2.8, delta);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 2.8, delta);
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, -0.28 + motion.y * 0.08, 2.6, delta);
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, 1.25 + motion.x * 0.06, 2.6, delta);
    group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x, targetScale, 2.5, delta));

    if (!reducedMotion) {
      const pulse = 6.2 + Math.sin(state.clock.elapsedTime * 2.1) * 1.7;
      signalMaterials.current.forEach((material, index) => {
        material.emissiveIntensity = Math.max(3.4, pulse + Math.sin(state.clock.elapsedTime * 2.7 + index * 0.3) * 1.1);
      });
    }
  });

  return (
    <group ref={group} position={[1.25, -0.28, 0]} rotation={[-0.13, -0.2, 0]} scale={0.78}>
      <primitive object={model} dispose={null} />
    </group>
  );
}

function PhysicalFallback() {
  return (
    <group position={[1.2, -0.3, 0]} rotation={[-0.12, -0.2, 0]}>
      <mesh>
        <cylinderGeometry args={[1.2, 1.2, 0.45, 24]} />
        <meshStandardMaterial color="#11161b" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.36, 0]}>
        <torusGeometry args={[1.26, 0.08, 8, 32]} />
        <meshStandardMaterial color="#ed1c24" emissive="#ed1c24" emissiveIntensity={5} metalness={0.5} roughness={0.16} />
      </mesh>
    </group>
  );
}

function Poster({ prominent = false }: { prominent?: boolean }) {
  return (
    <img
      src={POSTER_URL}
      alt=""
      draggable={false}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "contain",
        objectPosition: "62% 50%",
        opacity: prominent ? 0.92 : 0.22,
        filter: "saturate(1.05) contrast(1.04)",
        userSelect: "none",
      }}
    />
  );
}

export function NetworkEvolutionWorld({ className = "", style }: NetworkEvolutionWorldProps) {
  const stage = useCinematicCanvas();
  const posterOnly = !stage.renderCanvas;

  return (
    <div
      ref={stage.ref}
      className={`network-evolution-world cine-world ${stage.renderCanvas ? "is-live" : "is-poster"} ${className}`.trim()}
      aria-hidden="true"
      data-quality={stage.quality}
      style={{
        position: "absolute",
        inset: 0,
        minHeight: 480,
        overflow: "hidden",
        pointerEvents: "none",
        ...style,
      }}
    >
      <Poster prominent={posterOnly} />
      {!posterOnly && (
        <Canvas
          frameloop={stage.active ? "always" : "never"}
          shadows={stage.quality === "high" ? "percentage" : false}
          camera={{ position: [0, 0.55, 9.8], fov: 45 }}
          dpr={stage.dpr}
          performance={{ min: 0.55 }}
          onCreated={stage.onCreated}
          gl={{
            alpha: true,
            antialias: stage.quality === "high",
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
          }}
          style={{ position: "absolute", inset: 0 }}
        >
          <ambientLight intensity={0.66} />
          <hemisphereLight args={["#eef4ff", "#17070a", 1.2]} />
          <spotLight position={[3.5, 6.5, 6]} color="#f4f7ff" intensity={175} angle={0.62} penumbra={0.82} castShadow />
          <pointLight position={[-4, -1.5, 3.5]} color="#ff1018" intensity={115} distance={12} />
          <pointLight position={[4.5, 0.5, -2]} color="#ed1c24" intensity={75} distance={10} />
          <Suspense fallback={<PhysicalFallback />}>
            <EvolutionAssembly reducedMotion={false} progress={stage.progress} />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}

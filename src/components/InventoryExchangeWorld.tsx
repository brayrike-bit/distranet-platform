"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, useAnimations, useGLTF } from "@react-three/drei";
import { CSSProperties, Suspense, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { useCinematicCanvas } from "./useCinematicCanvas";

const MODEL_URL = "/models/distranet-inventory-exchange.glb";
const POSTER_URL = "/renders/distranet-inventory-exchange.webp";

type InventoryExchangeWorldProps = {
  className?: string;
  /** Optional chapter progress from 0–1. Falls back to document scroll. */
  progress?: number;
  style?: CSSProperties;
};

function InventoryExchange({ reducedMotion, progress, runtimeProgress }: { reducedMotion: boolean; progress?: number; runtimeProgress: MutableRefObject<number> }) {
  const source = useGLTF(MODEL_URL);
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const scrub = useRef(0);
  const actionList = useRef<THREE.AnimationAction[]>([]);
  const signalMaterials = useRef<THREE.MeshStandardMaterial[]>([]);
  const model = useMemo(() => source.scene.clone(true), [source.scene]);
  const { actions, mixer } = useAnimations(source.animations, group);

  useEffect(() => {
    const signals: THREE.MeshStandardMaterial[] = [];
    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;

      if (/inventory_signal|scanner_signal|route_beacon|liquidity_route_signal|terminal_signal/i.test(object.name)) {
        const sourceMaterials = Array.isArray(object.material) ? object.material : [object.material];
        const clonedMaterials = sourceMaterials.map((material) => material.clone());
        object.material = Array.isArray(object.material) ? clonedMaterials : clonedMaterials[0];
        clonedMaterials.forEach((material) => {
          if (material instanceof THREE.MeshStandardMaterial) signals.push(material);
        });
      }
    });
    signalMaterials.current = signals;
  }, [model]);

  useEffect(() => {
    const allActions = Object.values(actions).filter((action): action is THREE.AnimationAction => Boolean(action));
    actionList.current = allActions;
    allActions.forEach((action) => {
      action.reset().play();
      action.paused = true;
    });

    if (reducedMotion) {
      // Hold on the verification frame: the story remains legible without motion.
      mixer.setTime(3.45);
      allActions.forEach((action) => {
        if (action) action.paused = true;
      });
    }

    return () => allActions.forEach((action) => action?.fadeOut(0.18));
  }, [actions, mixer, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;

    const updatePointer = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      pointer.current.y = -((event.clientY / Math.max(1, window.innerHeight)) * 2 - 1);
    };
    window.addEventListener("pointermove", updatePointer, { passive: true });
    return () => {
      window.removeEventListener("pointermove", updatePointer);
    };
  }, [reducedMotion]);

  useFrame((state, delta) => {
    if (!group.current || reducedMotion) return;

    const chapterProgress = THREE.MathUtils.clamp(progress ?? runtimeProgress.current, 0, 1);
    scrub.current = THREE.MathUtils.damp(scrub.current, chapterProgress, 4, delta);
    actionList.current.forEach(action => {
      action.paused = true;
      action.time = action.getClip().duration * (.04 + scrub.current * .78);
    });
    mixer.update(0);
    const targetRotationX = -0.10 + pointer.current.y * 0.055;
    const targetRotationY = -0.24 + pointer.current.x * 0.15 + chapterProgress * 0.10;
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetRotationX, 3.0, delta);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetRotationY, 3.0, delta);
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, -0.28 + pointer.current.y * 0.06, 3.0, delta);
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, 0.46 + chapterProgress * 0.18, 2.5, delta);

    const pulse = 7.5 + Math.sin(state.clock.elapsedTime * 2.4) * 2.8;
    signalMaterials.current.forEach((material, index) => {
      material.emissiveIntensity = Math.max(2.5, pulse + Math.sin(state.clock.elapsedTime * 3.1 + index * 0.31) * 2.1);
    });
  });

  return (
    <group ref={group} position={[0.46, -0.28, 0]} rotation={[-0.1, -0.24, 0]} scale={0.78}>
      <primitive object={model} />
    </group>
  );
}

export function InventoryExchangeWorld({ className = "", progress, style }: InventoryExchangeWorldProps) {
  const stage = useCinematicCanvas();
  const reducedMotion = stage.quality === "static";

  return (
    <div
      ref={stage.ref}
      className={`inventory-exchange-world real-asset cine-world ${stage.renderCanvas ? "is-live" : "is-poster"} ${className}`.trim()}
      aria-hidden="true"
      data-reduced-motion={reducedMotion ? "true" : "false"}
      data-quality={stage.quality}
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", ...style }}
    >
      <div
        className="inventory-exchange-poster cine-world-poster"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${POSTER_URL})`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          opacity: stage.renderCanvas ? 0.20 : 0.9,
        }}
      />
      {stage.renderCanvas && <Canvas
        frameloop={stage.active ? "always" : "never"}
        shadows={stage.quality === "high" ? "percentage" : false}
        camera={{ position: [0.2, 0.8, 10.4], fov: 43 }}
        dpr={stage.dpr}
        onCreated={stage.onCreated}
        gl={{
          alpha: true,
          antialias: stage.quality === "high",
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        style={{ position: "absolute", inset: 0 }}
      >
        <ambientLight intensity={0.62} />
        <hemisphereLight args={["#eaf1ff", "#17070a", 1.22]} />
        <spotLight position={[4, 7, 7]} intensity={185} angle={0.62} penumbra={0.82} castShadow />
        <pointLight position={[-5, 0, 4]} color="#9fc1ff" intensity={78} distance={13} />
        <pointLight position={[4, -2, 3]} color="#ff151d" intensity={122} distance={12} />
        <Suspense fallback={null}>
          <InventoryExchange reducedMotion={reducedMotion} progress={progress} runtimeProgress={stage.progress} />
        </Suspense>
        {!reducedMotion && stage.quality === "high" && (
          <Sparkles count={28} scale={[10, 4.5, 4]} size={0.8} speed={0.12} color="#ed1c24" opacity={0.22} />
        )}
      </Canvas>}
    </div>
  );
}

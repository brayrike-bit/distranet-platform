"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { useCinematicCanvas } from "./useCinematicCanvas";

const MODEL_URL = "/models/distranet-member-docking.glb";
const POSTER_URL = "/renders/distranet-member-docking.webp";

function DockingAssembly({ progress }: { progress: MutableRefObject<number> }) {
  const source = useGLTF(MODEL_URL);
  const group = useRef<THREE.Group>(null);
  const pointer = useRef(new THREE.Vector2());
  const scrub = useRef(0);
  const actionList = useRef<THREE.AnimationAction[]>([]);
  const signalMaterials = useRef<THREE.MeshStandardMaterial[]>([]);
  const model = useMemo(() => source.scene.clone(true), [source.scene]);
  const { actions, mixer } = useAnimations(source.animations, group);

  useEffect(() => {
    const active: THREE.MeshStandardMaterial[] = [];
    model.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      if (!(object.material instanceof THREE.MeshStandardMaterial)) return;

      if (
        /member_signal|power_pulse|docking_signal|network output/i.test(object.name) ||
        /power signal/i.test(object.material.name)
      ) {
        const material = object.material.clone();
        object.material = material;
        active.push(material);
      }
    });
    signalMaterials.current = active;
  }, [model]);

  useEffect(() => {
    actionList.current = Object.values(actions).filter((action): action is THREE.AnimationAction => Boolean(action));
    actionList.current.forEach(action => { action.reset().play(); action.paused = true; });
    return () => actionList.current.forEach(action => action.stop());
  }, [actions]);

  useEffect(() => {
    const updatePointer = (event: PointerEvent) => {
      pointer.current.set(
        event.clientX / Math.max(1, window.innerWidth) * 2 - 1,
        -(event.clientY / Math.max(1, window.innerHeight) * 2 - 1),
      );
    };

    window.addEventListener("pointermove", updatePointer, { passive: true });
    return () => {
      window.removeEventListener("pointermove", updatePointer);
    };
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;

    scrub.current = THREE.MathUtils.damp(scrub.current, progress.current, 4.2, delta);
    actionList.current.forEach(action => {
      action.paused = true;
      action.time = action.getClip().duration * scrub.current * .62;
    });
    mixer.update(0);

    const targetX = -0.10 + pointer.current.y * 0.055;
    const targetY = -0.31 + pointer.current.x * 0.13 + progress.current * 0.10;
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 3.0, delta);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 3.0, delta);
    group.current.position.y = THREE.MathUtils.damp(
      group.current.position.y,
      -0.18 + pointer.current.y * 0.08,
      2.8,
      delta,
    );
    group.current.position.z = THREE.MathUtils.damp(
      group.current.position.z,
      progress.current * 0.46,
      2.6,
      delta,
    );

    const targetScale = 0.68 + progress.current * 0.035;
    group.current.scale.setScalar(
      THREE.MathUtils.damp(group.current.scale.x, targetScale, 2.7, delta),
    );

    const pulse = 7.5 + Math.sin(state.clock.elapsedTime * 2.4) * 2.4;
    signalMaterials.current.forEach((material, index) => {
      material.emissiveIntensity = Math.max(
        1.2,
        pulse + Math.sin(state.clock.elapsedTime * 3.1 + index * 0.31) * 1.6,
      );
    });
  });

  return (
    <group ref={group} position={[0.15, -0.18, 0]} rotation={[-0.10, -0.31, 0]} scale={0.68}>
      <primitive object={model} />
    </group>
  );
}

export function MemberDockingWorld() {
  const stage = useCinematicCanvas();
  const realtime = stage.renderCanvas;

  return (
    <div
      ref={stage.ref}
      className={`member-docking-world real-asset cine-world ${realtime ? "is-live" : "is-poster"}`}
      aria-hidden="true"
      data-quality={stage.quality}
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}
    >
      <div
        className="member-docking-poster cine-world-poster"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${POSTER_URL})`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          opacity: realtime ? 0.16 : 0.96,
          transition: "opacity 300ms ease-out",
        }}
      />
      {realtime ? (
        <Canvas
          frameloop={stage.active ? "always" : "never"}
          shadows={stage.quality === "high" ? "percentage" : false}
          camera={{ position: [0, 0.7, 10.8], fov: 44 }}
          dpr={stage.dpr}
          gl={{
            alpha: true,
            antialias: stage.quality === "high",
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
          }}
          onCreated={(state) => {
            stage.onCreated(state);
            state.gl.toneMappingExposure = 1.08;
          }}
          style={{ position: "absolute", inset: 0 }}
        >
          <ambientLight intensity={0.68} />
          <hemisphereLight args={["#eef4ff", "#17070a", 1.25]} />
          <spotLight
            position={[3.8, 6.2, 6.5]}
            color="#f4f7ff"
            intensity={175}
            angle={0.60}
            penumbra={0.82}
            castShadow
          />
          <pointLight position={[-5.0, 0.2, 4.0]} color="#ff1119" intensity={120} distance={13} />
          <pointLight position={[5.0, -1.5, 2.2]} color="#ff3038" intensity={72} distance={10} />
          <Suspense fallback={null}>
            <DockingAssembly progress={stage.progress} />
          </Suspense>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.05, 0]} receiveShadow>
            <planeGeometry args={[18, 10]} />
            <shadowMaterial transparent opacity={0.30} />
          </mesh>
        </Canvas>
      ) : null}
    </div>
  );
}

"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, useAnimations, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useCinematicCanvas } from "./useCinematicCanvas";

const MODEL_URL = "/models/distranet-hydraulic-network.glb";

function HydraulicAssembly() {
  const source = useGLTF(MODEL_URL);
  const group = useRef<THREE.Group>(null);
  const scroll = useRef(0);
  const tracers = useRef<THREE.MeshStandardMaterial[]>([]);
  const model = useMemo(() => source.scene.clone(true), [source.scene]);
  const { actions } = useAnimations(source.animations, group);

  useEffect(() => {
    const active: THREE.MeshStandardMaterial[] = [];
    model.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      if (
        object.material instanceof THREE.MeshStandardMaterial &&
        /signal_tracer|member_signal|network_terminal/i.test(object.name)
      ) {
        object.material = object.material.clone();
        active.push(object.material);
      }
    });
    tracers.current = active;
  }, [model]);

  useEffect(() => {
    Object.values(actions).forEach(action => action?.reset().fadeIn(.35).play());
    return () => Object.values(actions).forEach(action => action?.fadeOut(.2));
  }, [actions]);

  useEffect(() => {
    const update = () => { scroll.current = Math.min(1, Math.max(0, window.scrollY / Math.max(1, window.innerHeight))); };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;
    const targetX = -.04 + state.pointer.y * .09 + scroll.current * .18;
    const targetY = -.34 + state.pointer.x * .16 + scroll.current * .55;
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 2.8, delta);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 2.8, delta);
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, -.05 + state.pointer.y * .1, 2.6, delta);
    group.current.position.z = THREE.MathUtils.damp(group.current.position.z, scroll.current * 1.4, 2.5, delta);
    const targetScale = .67 + scroll.current * .12;
    group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x, targetScale, 2.4, delta));
    const pulse = 4.5 + Math.sin(state.clock.elapsedTime * 2.2) * 3.1;
    tracers.current.forEach((material, i) => {
      material.emissiveIntensity = Math.max(.7, pulse + Math.sin(state.clock.elapsedTime * 3 + i * .45) * 2);
    });
  });

  return <group ref={group} position={[1.3, -.1, 0]} rotation={[-.04, -.34, 0]} scale={.67}>
    <primitive object={model} />
  </group>;
}

function SceneFallback(){return <mesh position={[1.4,0,0]}><boxGeometry args={[2.8,1.8,1.8]}/><meshStandardMaterial color="#111318" metalness={.85} roughness={.18}/></mesh>}

export function SignalWorld() {
  const stage = useCinematicCanvas("45% 0px");
  return <div ref={stage.ref} className={`signal-world real-asset cine-world ${stage.renderCanvas ? "is-live" : "is-poster"}`} aria-hidden="true" data-quality={stage.quality}>
    <div className="signal-world-poster cine-world-poster" />
    {stage.renderCanvas && <Canvas frameloop={stage.active ? "always" : "never"} shadows={stage.quality === "high" ? "percentage" : false} camera={{ position: [0, .3, 8.6], fov: 45 }} dpr={stage.dpr} onCreated={stage.onCreated} gl={{ antialias: stage.quality === "high", alpha: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping }}>
      <ambientLight intensity={.85} />
      <hemisphereLight args={["#eef4ff", "#17070a", 1.25]} />
      <spotLight position={[3, 5, 6]} color="#ffffff" intensity={180} angle={.62} penumbra={.82} castShadow />
      <pointLight position={[-4, -2, 4]} color="#ff151d" intensity={115} distance={12} />
      <pointLight position={[4, 0, -2]} color="#ff3038" intensity={80} distance={10} />
      <Suspense fallback={<SceneFallback/>}><HydraulicAssembly/></Suspense>
      {stage.quality === "high" && <Sparkles count={46} scale={[9, 5, 5]} size={1} speed={.18} color="#ef252c" opacity={.34} />}
    </Canvas>}
  </div>;
}

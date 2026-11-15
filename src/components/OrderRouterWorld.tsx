"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, useAnimations, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { useCinematicCanvas } from "./useCinematicCanvas";

const URL = "/models/parts-gopher-order-router.glb";

function RouterMachine({progress}:{progress:MutableRefObject<number>}){
  const source=useGLTF(URL);const group=useRef<THREE.Group>(null);const scrub=useRef(0);const actionList=useRef<THREE.AnimationAction[]>([]);const model=useMemo(()=>source.scene.clone(true),[source.scene]);const {actions,mixer}=useAnimations(source.animations,group);
  useEffect(()=>{model.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=true;o.receiveShadow=true}})},[model]);
  useEffect(()=>{actionList.current=Object.values(actions).filter((a):a is THREE.AnimationAction=>Boolean(a));actionList.current.forEach(a=>{a.reset().play();a.paused=true});return()=>actionList.current.forEach(a=>a.stop())},[actions]);
  useFrame((state,delta)=>{if(!group.current)return;scrub.current=THREE.MathUtils.damp(scrub.current,progress.current,4.2,delta);actionList.current.forEach(a=>{a.paused=true;a.time=a.getClip().duration*(.03+scrub.current*.84)});mixer.update(0);group.current.rotation.x=THREE.MathUtils.damp(group.current.rotation.x,-.18+state.pointer.y*.09,3,delta);group.current.rotation.y=THREE.MathUtils.damp(group.current.rotation.y,-.48+state.pointer.x*.17+progress.current*.08,3,delta);group.current.position.y=THREE.MathUtils.damp(group.current.position.y,-.35+state.pointer.y*.08,3,delta)});
  return <group ref={group} position={[1.5,-.35,.2]} rotation={[-.18,-.48,0]} scale={.68}><primitive object={model}/></group>
}

export function OrderRouterWorld(){const stage=useCinematicCanvas();return <div ref={stage.ref} className={`order-router-world cine-world ${stage.renderCanvas?"is-live":"is-poster"}`} aria-hidden="true" data-quality={stage.quality}><div className="order-router-poster cine-world-poster"/>{stage.renderCanvas&&<Canvas frameloop={stage.active?"always":"never"} shadows={stage.quality==="high"?"percentage":false} camera={{position:[0,.7,9.4],fov:44}} dpr={stage.dpr} onCreated={stage.onCreated} gl={{antialias:stage.quality==="high",alpha:true,powerPreference:"high-performance",toneMapping:THREE.ACESFilmicToneMapping}}><ambientLight intensity={.7}/><hemisphereLight args={["#eef4ff","#17070a",1.2]}/><spotLight position={[3,6,6]} intensity={170} angle={.6} penumbra={.8} castShadow/><pointLight position={[-4,-1,4]} color="#ff1d25" intensity={100} distance={12}/><Suspense fallback={null}><RouterMachine progress={stage.progress}/></Suspense>{stage.quality==="high"&&<Sparkles count={35} scale={[9,5,5]} color="#ed1c24" opacity={.25} speed={.15}/>}</Canvas>}</div>}

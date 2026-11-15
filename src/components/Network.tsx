"use client";
import { useEffect, useRef } from "react";

type Node = {x:number;y:number;vx:number;vy:number;r:number;phase:number};
export function Network() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas=ref.current!; const ctx=canvas.getContext("2d")!; let frame=0; let raf=0;
    const pointer={x:-9999,y:-9999}; const nodes:Node[]=Array.from({length:21},(_,i)=>({x:0,y:0,vx:0,vy:0,r:i===10?5:2.2,phase:i*.74}));
    const resize=()=>{const d=Math.min(devicePixelRatio,1.6);canvas.width=canvas.clientWidth*d;canvas.height=canvas.clientHeight*d;ctx.setTransform(d,0,0,d,0,0)};
    const move=(e:PointerEvent)=>{const b=canvas.getBoundingClientRect();pointer.x=e.clientX-b.left;pointer.y=e.clientY-b.top};
    resize(); window.addEventListener("resize",resize); window.addEventListener("pointermove",move);
    const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
    const draw=()=>{const w=canvas.clientWidth,h=canvas.clientHeight,cx=w*.54,cy=h*.49;ctx.clearRect(0,0,w,h);
      nodes.forEach((n,i)=>{const a=(i/21)*Math.PI*2+.25;const ring=i%3;const rad=Math.min(w,h)*(.18+ring*.115);const tx=i===10?cx:cx+Math.cos(a)*rad;const ty=i===10?cy:cy+Math.sin(a)*rad*.66;n.x+=(tx-n.x)*.05;n.y+=(ty-n.y)*.05;const dx=pointer.x-n.x,dy=pointer.y-n.y,d=Math.hypot(dx,dy);if(d<160){n.x-=dx*(160-d)/160*.012;n.y-=dy*(160-d)/160*.012}});
      ctx.globalCompositeOperation="lighter";nodes.forEach((n,i)=>{if(i===10)return;const core=nodes[10];const grad=ctx.createLinearGradient(n.x,n.y,core.x,core.y);grad.addColorStop(0,"rgba(255,49,55,.08)");grad.addColorStop(.55,"rgba(255,49,55,.5)");grad.addColorStop(1,"rgba(255,255,255,.25)");ctx.strokeStyle=grad;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(n.x,n.y);const bend=Math.sin(frame*.015+n.phase)*22;ctx.bezierCurveTo(n.x+(core.x-n.x)*.4+bend,n.y+(core.y-n.y)*.2,core.x-(core.x-n.x)*.25,core.y-(core.y-n.y)*.2,core.x,core.y);ctx.stroke();const t=(frame*.004+n.phase)%1;const px=n.x+(core.x-n.x)*t,py=n.y+(core.y-n.y)*t;ctx.fillStyle="rgba(255,75,79,.8)";ctx.beginPath();ctx.arc(px,py,1.4,0,Math.PI*2);ctx.fill()});
      nodes.forEach((n,i)=>{const glow=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,i===10?40:14);glow.addColorStop(0,i===10?"rgba(255,255,255,.9)":"rgba(255,63,68,.9)");glow.addColorStop(1,"rgba(255,30,40,0)");ctx.fillStyle=glow;ctx.beginPath();ctx.arc(n.x,n.y,i===10?40:14,0,Math.PI*2);ctx.fill();ctx.fillStyle=i===10?"white":"#ff3137";ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,Math.PI*2);ctx.fill()});ctx.globalCompositeOperation="source-over";frame++;if(!reduced)raf=requestAnimationFrame(draw)};draw();return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);window.removeEventListener("pointermove",move)}} ,[]);
  return <canvas ref={ref} className="network" aria-hidden="true"/>;
}

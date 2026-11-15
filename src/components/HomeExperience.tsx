"use client";

import { useEffect, useRef, useState } from "react";

const chapters = [
  { no: "01", kicker: "Aggregate", title: "Twenty-one companies move as one buyer.", text: "Independent demand becomes collective leverage without sacrificing local identity or autonomy.", metric: "21 → 1", label: "collective buying signal" },
  { no: "02", kicker: "Connect", title: "Distributed inventory becomes one responsive system.", text: "Stock across the network can be discovered, routed, and fulfilled through trusted member relationships.", metric: "$150M+", label: "leadership-confirmed public inventory claim" },
  { no: "03", kicker: "Capture", title: "Parker demand finds the right member.", text: "Parts Gopher turns Parker product discovery into routed opportunity and transaction data that can return as visible member value.", metric: "24 / 7", label: "digital demand capture" },
  { no: "04", kicker: "Learn", title: "Every transaction can sharpen the network.", text: "A governed data layer can reveal performance, opportunity, and operational friction without exposing customer identities.", metric: "1", label: "proposed intelligence layer" },
];

export function ScrollSystem() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!ref.current) return;
      const box = ref.current.getBoundingClientRect();
      const total = ref.current.offsetHeight - innerHeight;
      const p = Math.max(0, Math.min(1, -box.top / Math.max(1, total)));
      ref.current.style.setProperty("--system-progress", p.toFixed(4));
      const next = Math.min(3, Math.floor(p * 4));
      setActive((current) => current === next ? current : next);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
    };
  }, []);
  const selectChapter = (index: number) => {
    const top = (ref.current?.offsetTop || 0) + (index / 4) * (ref.current?.offsetHeight || 0);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  };
  return <section className="scroll-system" ref={ref} data-reactive>
    <div className="system-sticky">
      <div className="system-visual" aria-hidden="true">
        <div className="system-physical-world"><img src="/media/distranet-original/network-test-bench-v1.webp" sizes="(max-width: 680px) 112vw, 50vw" alt="" width={1536} height={1024} loading="lazy" fetchPriority="low" decoding="async" /></div>
        <div className="pressure-rings">{[0,1,2,3,4].map(i => <i key={i} />)}<b /></div>
        <svg viewBox="0 0 800 800"><defs><radialGradient id="nodeGlow"><stop stopColor="#fff"/><stop offset=".18" stopColor="#ff4a50"/><stop offset="1" stopColor="#ef2028" stopOpacity="0"/></radialGradient></defs>{Array.from({length:21},(_,i)=>{const a=i/21*Math.PI*2;const x=(400+Math.cos(a)*(170+(i%3)*52)).toFixed(3);const y=(400+Math.sin(a)*(130+(i%3)*42)).toFixed(3);const qx=(400+Math.sin(i)*50).toFixed(3);const qy=(400+Math.cos(i)*50).toFixed(3);return <g key={i}><path d={`M${x} ${y} Q${qx} ${qy} 400 400`} /><circle cx={x} cy={y} r={active>=0?4:2}/></g>})}<circle className="system-core" cx="400" cy="400" r={20}/></svg>
      </div>
      <div className="system-copy"><p className="section-index">THE NETWORK MULTIPLIER <span>0{active+1} / 04</span></p>{chapters.map((c,i)=><article className={active===i?"active":""} aria-hidden={active !== i} key={c.no}><small>{c.no} — {c.kicker}</small><h2>{c.title}</h2><p>{c.text}</p><div><strong>{c.metric}</strong><span>{c.label}</span></div></article>)}</div>
      <div className="system-rail">{chapters.map((c,i)=><button key={c.no} onClick={()=>selectChapter(i)} className={active===i?"active":""} aria-current={active === i ? "step" : undefined} aria-label={`View chapter ${c.no}: ${c.title}`}><i/></button>)}</div>
    </div>
  </section>;
}

export function PointerField() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el=ref.current; if(!el) return;
    const host=el.parentElement ?? el;
    const motion=matchMedia("(prefers-reduced-motion: reduce)");
    const pointer=matchMedia("(hover: hover) and (pointer: fine)");
    let frame=0; let next:PointerEvent|null=null;
    const render=()=>{frame=0;if(!next)return;const b=el.getBoundingClientRect();el.style.setProperty("--px",`${next.clientX-b.left}px`);el.style.setProperty("--py",`${next.clientY-b.top}px`)};
    const move=(event:PointerEvent)=>{next=event;if(!frame)frame=requestAnimationFrame(render)};
    const bind=()=>{host.removeEventListener("pointermove",move);if(!motion.matches&&pointer.matches)host.addEventListener("pointermove",move,{passive:true});else{el.style.setProperty("--px","50%");el.style.setProperty("--py","50%");}};
    bind();motion.addEventListener("change",bind);pointer.addEventListener("change",bind);
    return()=>{cancelAnimationFrame(frame);host.removeEventListener("pointermove",move);motion.removeEventListener("change",bind);pointer.removeEventListener("change",bind)};
  },[]);
  return <div ref={ref} className="pointer-field" aria-hidden="true"><i/><i/><i/><i/><span/></div>;
}

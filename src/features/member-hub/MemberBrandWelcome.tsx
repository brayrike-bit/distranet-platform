"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { MemberTenantBrand } from "@/domain/member-hub/types";
import { MemberLogo } from "./components/MemberLogo";
import styles from "./MemberBrandWelcome.module.css";

export function MemberBrandWelcome({ tenant }: { tenant: MemberTenantBrand }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > innerHeight) return;
      const progress = Math.max(0, Math.min(1, (innerHeight - rect.top) / (innerHeight + rect.height)));
      element.style.setProperty("--welcome-progress", progress.toFixed(4));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    return () => { cancelAnimationFrame(frame); removeEventListener("scroll", schedule); removeEventListener("resize", schedule); };
  }, []);

  return <section ref={ref} className={styles.hero} aria-labelledby={`welcome-${tenant.slug}`} data-tenant-arrival={tenant.slug} data-arrival-interaction="scroll-only-brand-graphic">
    <div className={styles.copy}>
      <p className={styles.eyebrow}><i />{tenant.displayName} / Distranet member</p>
      <h1 id={`welcome-${tenant.slug}`}>Your business.<br /><span>Connected.</span></h1>
      <p className={styles.summary}>Your Parts Gopher contribution, shared inventory, and member economics. One clear operating view.</p>
      <div className={styles.lanes}>{tenant.arrival.operatingLanes.map(lane => <span key={lane}>{lane}</span>)}</div>
      <a className={styles.enter} href="#member-summary">View your dashboard <span aria-hidden="true">↓</span></a>
    </div>
    <div className={styles.graphic}>
      <svg viewBox="0 0 640 400" fill="none" aria-hidden="true">
        <path className={styles.baseline} d="M0 62H120L215 155H360M0 200H360M0 338H120L215 245H360M360 155H452L522 82H640M360 200H640M360 245H452L522 318H640" />
        <path className={styles.signal} pathLength="1" d="M0 62H120L215 155H360M0 200H360M0 338H120L215 245H360M360 155H452L522 82H640M360 200H640M360 245H452L522 318H640" />
        {[62, 200, 338].map(y => <circle key={y} cx="12" cy={y} r="5" className={styles.node} />)}
        {[82, 200, 318].map(y => <circle key={y} cx="625" cy={y} r="5" className={styles.node} />)}
      </svg>
      <div className={styles.logoPlate}><MemberLogo tenant={tenant} width={290} height={112} priority /><span>YOUR MEMBER WORKSPACE</span></div>
      <div className={styles.companyBase}><span>COMPANY BASE</span><strong>{tenant.operatingContext.territory.value}</strong></div>
    </div>
    <div className={styles.foot}><span>Local identity. Network strength.</span><Link href="/member-hub">Explore member workspaces <span aria-hidden="true">↗</span></Link></div>
  </section>;
}

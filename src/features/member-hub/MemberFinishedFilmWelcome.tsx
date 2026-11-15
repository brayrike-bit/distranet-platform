"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import type { MemberTenantBrand } from "@/domain/member-hub/types";
import { ScrollScrubFilm } from "@/components/cinematic/ScrollScrubFilm";
import type { CinematicFilmAsset } from "@/components/cinematic/mediaManifest";
import { MemberLogo } from "./components/MemberLogo";
import styles from "./MemberFinishedFilmWelcome.module.css";

export function MemberFinishedFilmWelcome({ tenant, asset }: { tenant: MemberTenantBrand; asset: CinematicFilmAsset }) {
  const titleId = `welcome-${tenant.slug}`;
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const headers = Array.from(document.querySelectorAll<HTMLElement>("[data-member-workspace-sticky-header]"));
    const measure = () => {
      const bottom = headers.reduce((value, header) => header.offsetHeight ? Math.max(value, header.getBoundingClientRect().bottom) : value, 0);
      root.style.setProperty("--member-hero-sticky-top", `${Math.ceil(bottom + 16)}px`);
    };
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    headers.forEach(header => observer?.observe(header));
    window.addEventListener("resize", measure, { passive: true });
    measure();
    return () => { observer?.disconnect(); window.removeEventListener("resize", measure); };
  }, []);
  const mobilePoster = asset.mobile?.poster ?? asset.desktop.poster;
  const frameStyle = { "--member-film-desktop-ratio": `${asset.desktop.poster.width} / ${asset.desktop.poster.height}`, "--member-film-mobile-ratio": `${mobilePoster.width} / ${mobilePoster.height}` } as CSSProperties;
  return <div ref={rootRef} style={frameStyle} className={styles.arrival} data-tenant-arrival={tenant.slug} data-arrival-interaction="scroll-only-finished-film">
    <header className={styles.heading}>
      <div><MemberLogo tenant={tenant} width={245} height={68} priority /><p>{tenant.displayName} / member workspace</p><h1 id={titleId}>Your business.<br /><span>Connected.</span></h1></div>
      <div><p className={styles.description}>Your Parts Gopher contribution, inventory availability, and member economics. Clear information, with your identity at the center.</p><a href="#member-summary">View your dashboard <span aria-hidden="true">↓</span></a><small>Illustrative reporting · no live customer data</small></div>
    </header>
    <ScrollScrubFilm asset={asset} ariaLabelledBy={titleId} className={styles.film} frameClassName={styles.frame} mediaClassName={styles.media} scrollSpanVh={360} stickyTop="var(--member-hero-sticky-top, 16px)" fit="contain" priority decorative />
    <div className={styles.caption}><span>Original brand marks baked into the film.</span><span>Brand visualization · not a technical assembly guide</span></div>
  </div>;
}

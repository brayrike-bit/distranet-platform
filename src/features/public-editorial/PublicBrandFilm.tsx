"use client";

import { ScrollScrubFilm } from "@/components/cinematic/ScrollScrubFilm";
import type { CinematicFilmAsset } from "@/components/cinematic/mediaManifest";
import styles from "./public-editorial.module.css";

export const HOME_BRAND_FILM: CinematicFilmAsset = {
  id: "distranet-seedance25-brand-finished",
  title: "Independent strength, connected — Distranet brand film",
  description: "A continuous camera pull-back across an illustrative metal-and-red-hose network on an ivory studio background. The original Distranet logo is tracked into the physical plaque and baked into the video. This conceptual brand visualization is not an assembly guide or product specification.",
  durationSeconds: 169 / 24,
  desktop: {
    id: "distranet-brand-seedance25-1080p-gop6",
    poster: { src: "/media/cinematic/distranet-seedance25-brand-finished/poster.jpg", width: 960, height: 540, focalPoint: "50% 50%" },
    sources: [{ src: "/media/cinematic/distranet-seedance25-brand-finished/desktop.mp4", type: "video/mp4" }],
  },
  beats: [
    { id: "identity", progress: 0, label: "Independent identity", description: "The authentic Distranet mark is fully visible on the central plaque." },
    { id: "network", progress: .5, label: "Connected capability", description: "The camera withdraws to reveal the complete illustrative network." },
    { id: "collective", progress: .9, label: "Shared strength", description: "The whole display resolves without cropping the mark." },
  ],
  delivery: { status: "ready", visualSource: "hybrid", branding: "baked" },
};

export function PublicBrandFilm() {
  return <section className={styles.brandFilm} aria-labelledby="brand-film-title">
    <header><div><span className={styles.eyebrow}>Independent strength, connected.</span><h2 id="brand-film-title">Distinct businesses.<br /><em>A stronger whole.</em></h2></div><p>A shared organization built around independent companies—not around taking their identity away.</p></header>
    <ScrollScrubFilm asset={HOME_BRAND_FILM} className={styles.brandFilmRunway} frameClassName={styles.brandFilmFrame} mediaClassName={styles.brandFilmMedia} scrollSpanVh={280} stickyTop="var(--public-film-header-height, 82px)" fit="contain" decorative />
    <div className={styles.brandFilmCaption}><span>Scroll controls the film. No mouse movement required.</span><span>Original Distranet mark baked into the video.</span></div>
  </section>;
}

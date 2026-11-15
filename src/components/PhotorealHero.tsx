"use client";

import { useEffect, useRef, useState } from "react";

type NetworkInformation = EventTarget & {
  effectiveType?: string;
  saveData?: boolean;
};

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformation;
  deviceMemory?: number;
};

function hasConstrainedConnection() {
  const nav = navigator as NavigatorWithConnection;
  const connection = nav.connection;
  return Boolean(
    connection?.saveData ||
    connection?.effectiveType === "slow-2g" ||
    connection?.effectiveType === "2g" ||
    matchMedia("(pointer: coarse)").matches ||
    (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency < 4) ||
    (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4),
  );
}

/**
 * Photographic hero delivery.
 *
 * Real product photography is the LCP source of truth. A small live industrial
 * macro plate is mounted only after that photograph is decoded and only for an
 * eligible, visible desktop viewport, so motion never competes with the first
 * meaningful render.
 */
export function PhotorealHero() {
  const root = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [posterReady, setPosterReady] = useState(false);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const element = root.current;
    if (!element) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    let active = true;
    let pointerX = 0;
    let pointerY = 0;

    const paint = () => {
      frame = 0;
      const box = element.getBoundingClientRect();
      const pageProgress = Math.max(0, Math.min(1, -box.top / Math.max(1, box.height)));
      element.style.setProperty("--hero-film-scroll", pageProgress.toFixed(4));
      element.style.setProperty("--hero-film-x", pointerX.toFixed(4));
      element.style.setProperty("--hero-film-y", pointerY.toFixed(4));
    };

    const schedule = () => {
      if (active && !frame) frame = requestAnimationFrame(paint);
    };

    const move = (event: PointerEvent) => {
      if (reduced.matches || !finePointer.matches) return;
      const box = element.getBoundingClientRect();
      pointerX = Math.max(-1, Math.min(1, ((event.clientX - box.left) / box.width - .5) * 2));
      pointerY = Math.max(-1, Math.min(1, ((event.clientY - box.top) / box.height - .5) * 2));
      schedule();
    };

    const leave = () => {
      pointerX = 0;
      pointerY = 0;
      schedule();
    };

    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting;
        setHeroVisible(active);
        if (active) schedule();
        else paint();
      },
      { rootMargin: "40% 0px" },
    );

    paint();
    observer?.observe(element);
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule, { passive: true });
    element.addEventListener("pointermove", move, { passive: true });
    element.addEventListener("pointerleave", leave, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", leave);
    };
  }, []);

  useEffect(() => {
    const poster = posterRef.current;
    if (poster?.complete && poster.naturalWidth > 0) setPosterReady(true);

    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = matchMedia("(max-width: 680px)");
    const connection = (navigator as NavigatorWithConnection).connection;
    const update = () => setMotionAllowed(!reduced.matches && !mobile.matches && !hasConstrainedConnection());

    update();
    reduced.addEventListener("change", update);
    mobile.addEventListener("change", update);
    connection?.addEventListener("change", update);

    return () => {
      reduced.removeEventListener("change", update);
      mobile.removeEventListener("change", update);
      connection?.removeEventListener("change", update);
    };
  }, []);

  const showVideo = posterReady && motionAllowed && heroVisible;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      setVideoReady(false);
      return;
    }

    const syncPlayback = () => {
      if (document.hidden || !heroVisible) {
        video.pause();
        return;
      }
      if (!video.ended) void video.play().catch(() => undefined);
    };

    syncPlayback();
    document.addEventListener("visibilitychange", syncPlayback);
    return () => {
      video.pause();
      document.removeEventListener("visibilitychange", syncPlayback);
    };
  }, [heroVisible, showVideo]);

  return (
    <div ref={root} className="photoreal-hero" aria-hidden="true">
      <picture className="photoreal-hero-product">
        <source
          media="(max-width: 680px)"
          srcSet="/media/photographic/home-pvp41-hero-mobile.webp"
        />
        <img
          ref={posterRef}
          src="/media/photographic/home-pvp41-hero.webp"
          alt=""
          width={1920}
          height={1080}
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onLoad={() => setPosterReady(true)}
        />
      </picture>
      <div className="photoreal-hero-proof">
        <div className="photoreal-hero-proof-head"><span>PHYSICAL CONNECTION PLATE</span><i /><small>LIVE / 01</small></div>
        <div className="photoreal-hero-proof-media">
          <img src="/media/photographic/advantage-manifold-poster.webp" alt="" width={1280} height={720} decoding="async" />
          {showVideo && (
            <video
              ref={videoRef}
              className={videoReady ? "is-ready" : undefined}
              muted
              playsInline
              loop
              preload="metadata"
              poster="/media/photographic/advantage-manifold-poster.webp"
              width={1280}
              height={720}
              onLoadedData={() => setVideoReady(true)}
            >
              <source src="/films/industrial/advantage-manifold.mp4" type="video/mp4" />
            </video>
          )}
          <div className="photoreal-hero-reticle"><i /><i /><span /></div>
        </div>
        <div className="photoreal-hero-proof-readout"><span><b>21</b> MEMBER INPUTS</span><span><b>01</b> CONNECTED SYSTEM</span></div>
      </div>
      <div className="photoreal-hero-data-map"><span>CAST SURFACE</span><i /><span>MEASURED COMPONENT</span><i /></div>
      <div className="photoreal-hero-grade" />
      <div className="photoreal-hero-optics"><i /><i /><span>REAL PRODUCT PHOTOGRAPHY / LIVE MACRO PLATE</span></div>
    </div>
  );
}

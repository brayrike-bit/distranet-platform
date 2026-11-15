"use client";

import { useEffect, useRef, useState } from "react";

type BackdropVariant = "advantage" | "network" | "commerce" | "membership" | "about";

type NetworkInformation = EventTarget & {
  effectiveType?: string;
  saveData?: boolean;
};

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformation;
  deviceMemory?: number;
};

type PhotographicBackdropProps = {
  src: string;
  variant: BackdropVariant;
  videoSrc?: string;
  loopVideo?: boolean;
};

const dimensions: Record<BackdropVariant, { width: number; height: number }> = {
  advantage: { width: 1280, height: 720 },
  network: { width: 1280, height: 720 },
  commerce: { width: 1280, height: 720 },
  membership: { width: 1600, height: 900 },
  about: { width: 1280, height: 720 },
};

function motionIsAllowed() {
  const nav = navigator as NavigatorWithConnection;
  const connection = nav.connection;
  return !(
    matchMedia("(max-width: 680px)").matches ||
    matchMedia("(prefers-reduced-motion: reduce)").matches ||
    matchMedia("(pointer: coarse)").matches ||
    connection?.saveData ||
    connection?.effectiveType === "slow-2g" ||
    connection?.effectiveType === "2g" ||
    (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency < 4) ||
    (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4) ||
    document.body.dataset.renderQuality === "static"
  );
}

export function PhotographicBackdrop({
  src,
  variant,
  videoSrc,
  loopVideo = true,
}: PhotographicBackdropProps) {
  const root = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [imageReady, setImageReady] = useState(false);
  const [inViewport, setInViewport] = useState(true);
  const [videoAllowed, setVideoAllowed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    let active = true;
    let x = 0;
    let y = 0;

    const paint = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const scroll = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height)));
      element.style.setProperty("--photo-x", x.toFixed(4));
      element.style.setProperty("--photo-y", y.toFixed(4));
      element.style.setProperty("--photo-scroll", scroll.toFixed(4));
    };
    const schedule = () => { if (active && !frame) frame = requestAnimationFrame(paint); };
    const move = (event: PointerEvent) => {
      if (reduced.matches || !finePointer.matches) return;
      const rect = element.getBoundingClientRect();
      x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - .5) * 2));
      y = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - .5) * 2));
      schedule();
    };
    const leave = () => { x = 0; y = 0; schedule(); };
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting;
        setInViewport(active);
        if (active) schedule();
        else paint();
      },
      { rootMargin: "40% 0px" },
    );

    paint();
    observer?.observe(element);
    element.addEventListener("pointermove", move, { passive: true });
    element.addEventListener("pointerleave", leave, { passive: true });
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", leave);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
    };
  }, []);

  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) setImageReady(true);
    if (!videoSrc) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = matchMedia("(max-width: 680px)");
    const connection = (navigator as NavigatorWithConnection).connection;
    const update = () => setVideoAllowed(motionIsAllowed());
    update();
    reduced.addEventListener("change", update);
    mobile.addEventListener("change", update);
    connection?.addEventListener("change", update);
    return () => {
      reduced.removeEventListener("change", update);
      mobile.removeEventListener("change", update);
      connection?.removeEventListener("change", update);
    };
  }, [videoSrc]);

  const showVideo = Boolean(videoSrc && imageReady && videoAllowed && inViewport);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      setVideoReady(false);
      return;
    }
    const syncPlayback = () => {
      if (document.hidden || !inViewport) video.pause();
      else void video.play().catch(() => undefined);
    };
    syncPlayback();
    document.addEventListener("visibilitychange", syncPlayback);
    return () => {
      video.pause();
      document.removeEventListener("visibilitychange", syncPlayback);
    };
  }, [inViewport, showVideo]);

  const mobileSrc = src.replace(/(\.[^.]+)$/, "-mobile$1");
  const { width, height } = dimensions[variant];

  return (
    <div ref={root} className="photographic-backdrop" data-photo-variant={variant} aria-hidden="true">
      <picture>
        <source media="(max-width: 680px)" srcSet={mobileSrc} />
        <img
          ref={imageRef}
          src={src}
          alt=""
          width={width}
          height={height}
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onLoad={() => setImageReady(true)}
        />
      </picture>
      {showVideo && (
        <video
          ref={videoRef}
          className={videoReady ? "is-ready" : undefined}
          muted
          playsInline
          loop={loopVideo}
          preload="metadata"
          poster={src}
          onLoadedData={() => setVideoReady(true)}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}
      <div className="photographic-backdrop-grade" />
      <div className="photographic-backdrop-lens"><i /><span>PHOTOGRAPHIC INDUSTRIAL STUDY</span></div>
    </div>
  );
}

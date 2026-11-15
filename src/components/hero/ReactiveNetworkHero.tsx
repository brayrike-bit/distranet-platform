"use client";

import type { CSSProperties, MutableRefObject, RefObject } from "react";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { Arrow } from "@/components/Brand";
import {
  HeroMaterialRenderer,
  type HeroMaterialRendererHandle,
  type HeroMaterialMotionRef,
} from "./material-renderer";
import styles from "./ReactiveNetworkHero.module.css";

type NetworkInformation = EventTarget & {
  effectiveType?: string;
  saveData?: boolean;
};

type NavigatorWithCapabilities = Navigator & {
  connection?: NetworkInformation;
  deviceMemory?: number;
};

export type HeroCapability = "full" | "reduced" | "coarse" | "save-data" | "low-end";

type SpringAxis = {
  current: number;
  target: number;
  velocity: number;
};

export type HeroMotionState = {
  pointer: {
    x: SpringAxis;
    y: SpringAxis;
  };
  progress: SpringAxis;
  intersecting: boolean;
  capability: HeroCapability;
};

const NETWORK_PATHS = [
  "M-40 74 C210 58 366 120 538 258 S758 356 955 356",
  "M-30 148 C188 136 330 180 504 288 S748 382 954 380",
  "M-24 224 C166 208 320 228 494 316 S735 404 956 404",
  "M-20 304 C178 288 316 306 474 346 S726 424 958 428",
  "M-18 386 C164 370 330 372 492 388 S744 442 960 452",
  "M-18 472 C182 466 338 454 506 428 S758 462 962 476",
  "M-20 560 C174 568 336 548 510 470 S748 494 962 500",
  "M-24 650 C182 662 348 612 526 508 S776 512 966 524",
  "M-28 742 C192 754 372 674 554 544 S794 538 970 548",
  "M180 -36 C198 138 316 230 526 302 S766 366 982 370",
  "M382 -32 C388 128 458 228 610 312 S798 386 986 394",
  "M602 -34 C598 122 632 242 720 328 S844 402 990 418",
  "M850 -40 C824 124 844 252 862 342 S920 410 994 442",
  "M1160 -34 C1114 140 1100 252 1072 346 S1028 422 998 466",
  "M1642 94 C1450 94 1320 154 1200 264 S1084 382 1004 382",
  "M1640 210 C1454 198 1330 232 1214 304 S1090 408 1006 406",
  "M1640 338 C1462 320 1334 344 1218 372 S1094 430 1008 430",
  "M1640 478 C1458 482 1328 470 1212 444 S1090 452 1008 454",
  "M1640 622 C1454 642 1326 590 1200 512 S1084 484 1006 478",
  "M1358 938 C1328 766 1234 654 1148 574 S1060 512 1002 502",
  "M1032 938 C1050 774 1030 666 1004 582 S988 532 996 526",
] as const;

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function smoothstep(start: number, end: number, value: number) {
  const t = clamp((value - start) / Math.max(0.0001, end - start));
  return t * t * (3 - 2 * t);
}

function advanceSpring(axis: SpringAxis, delta: number, stiffness: number, damping: number) {
  const acceleration = (axis.target - axis.current) * stiffness - axis.velocity * damping;
  axis.velocity += acceleration * delta;
  axis.current += axis.velocity * delta;
}

function detectCapability(): HeroCapability {
  const nav = navigator as NavigatorWithCapabilities;
  const connection = nav.connection;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return "reduced";
  if (connection?.saveData || connection?.effectiveType === "slow-2g" || connection?.effectiveType === "2g") return "save-data";
  if (!matchMedia("(any-pointer: fine) and (any-hover: hover)").matches) return "coarse";
  if (
    (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency < 4) ||
    (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4)
  ) return "low-end";
  return "full";
}

function writeMotionVariables(element: HTMLElement, motion: HeroMotionState) {
  const progress = motion.capability === "reduced" ? 0 : clamp(motion.progress.current);
  const pointerX = motion.capability === "full" ? clamp(motion.pointer.x.current, -1, 1) : 0;
  const pointerY = motion.capability === "full" ? clamp(motion.pointer.y.current, -1, 1) : 0;
  const assembly = smoothstep(0.01, 0.38, progress);
  const connect = smoothstep(0.075, 0.68, progress);
  const release = smoothstep(0.76, 1, progress);
  const copyExit = smoothstep(0.12, 0.52, progress);
  const copyOpacity = clamp(1 - copyExit);

  element.style.setProperty("--hero-progress", progress.toFixed(5));
  element.style.setProperty("--hero-pointer-x", pointerX.toFixed(5));
  element.style.setProperty("--hero-pointer-y", pointerY.toFixed(5));
  element.style.setProperty("--hero-assembly", assembly.toFixed(5));
  element.style.setProperty("--hero-connect", connect.toFixed(5));
  element.style.setProperty("--hero-release", release.toFixed(5));
  element.style.setProperty("--hero-copy-opacity", copyOpacity.toFixed(5));
  element.style.setProperty("--hero-copy-y", `${(-copyExit * 58 - release * 22).toFixed(2)}px`);
  element.style.setProperty("--hero-camera-x", `${(-pointerX * 38 - assembly * 18).toFixed(2)}px`);
  element.style.setProperty("--hero-camera-y", `${(-pointerY * 24 - assembly * 26 + release * 10).toFixed(2)}px`);
  element.style.setProperty("--hero-camera-scale", (1.045 + assembly * 0.17 - release * 0.07).toFixed(5));
  element.style.setProperty("--hero-camera-rx", `${(-pointerY * 1.45).toFixed(3)}deg`);
  element.style.setProperty("--hero-camera-ry", `${(pointerX * 2.1).toFixed(3)}deg`);
  element.style.setProperty("--hero-network-x", `${(-pointerX * 34 - assembly * 14).toFixed(2)}px`);
  element.style.setProperty("--hero-network-y", `${(-pointerY * 21 - assembly * 18 + release * 8).toFixed(2)}px`);
  element.style.setProperty("--hero-network-scale", (1.01 + assembly * 0.14 - release * 0.06).toFixed(5));
  element.style.setProperty("--hero-network-opacity", clamp(connect * (1 - release * 0.32)).toFixed(5));
  element.style.setProperty("--hero-flow", (1.65 - progress * 4.4).toFixed(5));
  element.style.setProperty("--hero-light-x", `${(pointerX * 18 - progress * 6).toFixed(2)}vw`);
  element.style.setProperty("--hero-light-y", `${(pointerY * 14 + assembly * 4).toFixed(2)}vh`);
  element.style.setProperty("--hero-light-scale", (0.86 + assembly * 0.34).toFixed(5));
  element.style.setProperty("--hero-poster-blur", `${(release * 1.35).toFixed(2)}px`);
  element.style.setProperty("--hero-scroll-opacity", clamp(1 - smoothstep(0.02, 0.18, progress)).toFixed(5));

  const copyHidden = progress > 0.53;
  if (element.dataset.copyHidden !== String(copyHidden)) {
    element.dataset.copyHidden = String(copyHidden);
    const copy = element.querySelector<HTMLElement>("[data-hero-copy]");
    copy?.toggleAttribute("inert", copyHidden);
    copy?.setAttribute("aria-hidden", String(copyHidden));
  }
}

/**
 * The single mutable motion source for the hero. A future R3F/CSS renderer can
 * consume the returned ref directly, keeping pointer, scroll and capability
 * detection on this one requestAnimationFrame clock.
 */
export function useReactiveHeroMotion(
  rootRef: RefObject<HTMLElement | null>,
  materialMotionRef?: HeroMaterialMotionRef,
  materialRendererRef?: RefObject<HeroMaterialRendererHandle | null>,
): MutableRefObject<HeroMotionState> {
  const motionRef = useRef<HeroMotionState>({
    pointer: {
      x: { current: 0, target: 0, velocity: 0 },
      y: { current: 0, target: 0, velocity: 0 },
    },
    progress: { current: 0, target: 0, velocity: 0 },
    intersecting: true,
    capability: "full",
  });

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;

    const motion = motionRef.current;
    const reducedQuery = matchMedia("(prefers-reduced-motion: reduce)");
    const coarseQuery = matchMedia("(pointer: coarse)");
    const nav = navigator as NavigatorWithCapabilities;
    const connection = nav.connection;
    const viewport = window.visualViewport;
    let frame = 0;
    let lastTime = performance.now();
    let scrollDirty = true;
    let bounds = { top: 0, travel: 1 };

    const updateBounds = () => {
      const rect = element.getBoundingClientRect();
      const viewportHeight = viewport?.height ?? window.innerHeight;
      bounds = {
        top: rect.top + window.scrollY,
        travel: Math.max(1, rect.height - viewportHeight),
      };
      scrollDirty = true;
    };

    const updateCapability = () => {
      motion.capability = detectCapability();
      element.dataset.capability = motion.capability;
      if (motion.capability !== "full") {
        motion.pointer.x.target = 0;
        motion.pointer.y.target = 0;
        motion.pointer.x.velocity = 0;
        motion.pointer.y.velocity = 0;
      }
      if (motion.capability === "reduced") {
        motion.progress.current = 0;
        motion.progress.target = 0;
        motion.progress.velocity = 0;
      }
      writeMotionVariables(element, motion);
    };

    const tick = (time: number) => {
      frame = 0;
      if (!motion.intersecting || document.hidden) return;

      const delta = Math.min(0.034, Math.max(0.001, (time - lastTime) / 1000));
      lastTime = time;
      if (scrollDirty && motion.capability !== "reduced") {
        motion.progress.target = clamp((window.scrollY - bounds.top) / bounds.travel);
        scrollDirty = false;
      }

      if (motion.capability === "full") {
        advanceSpring(motion.pointer.x, delta, 118, 20);
        advanceSpring(motion.pointer.y, delta, 118, 20);
        advanceSpring(motion.progress, delta, 92, 18);
      } else if (motion.capability !== "reduced") {
        motion.pointer.x.current = 0;
        motion.pointer.y.current = 0;
        motion.progress.current += (motion.progress.target - motion.progress.current) * Math.min(1, delta * 10);
      }

      writeMotionVariables(element, motion);
      if (materialMotionRef) {
        materialMotionRef.current.pointerX = motion.capability === "full" ? motion.pointer.x.current : 0;
        materialMotionRef.current.pointerY = motion.capability === "full" ? motion.pointer.y.current : 0;
        materialMotionRef.current.scrollProgress = motion.progress.current;
        materialRendererRef?.current?.invalidate();
      }
      const unsettled = scrollDirty ||
        Math.abs(motion.pointer.x.target - motion.pointer.x.current) > 0.0005 ||
        Math.abs(motion.pointer.y.target - motion.pointer.y.current) > 0.0005 ||
        Math.abs(motion.progress.target - motion.progress.current) > 0.0005 ||
        Math.abs(motion.pointer.x.velocity) > 0.0005 ||
        Math.abs(motion.pointer.y.velocity) > 0.0005 ||
        Math.abs(motion.progress.velocity) > 0.0005;
      if (unsettled) frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (!frame && motion.intersecting && !document.hidden) {
        lastTime = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };

    const onScroll = () => {
      scrollDirty = true;
      start();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (motion.capability !== "full") return;
      motion.pointer.x.target = clamp((event.clientX / Math.max(1, window.innerWidth) - 0.5) * 2, -1, 1);
      motion.pointer.y.target = clamp((event.clientY / Math.max(1, window.innerHeight) - 0.5) * 2, -1, 1);
      start();
    };

    const onPointerLeave = () => {
      motion.pointer.x.target = 0;
      motion.pointer.y.target = 0;
      start();
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else {
        scrollDirty = true;
        start();
      }
    };

    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateBounds);
    const intersectionObserver = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(
      ([entry]) => {
        motion.intersecting = entry.isIntersecting;
        if (motion.intersecting) {
          scrollDirty = true;
          start();
        } else {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { rootMargin: "20% 0px" },
    );

    updateCapability();
    updateBounds();
    writeMotionVariables(element, motion);
    resizeObserver?.observe(element);
    intersectionObserver?.observe(element);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateBounds, { passive: true });
    viewport?.addEventListener("resize", updateBounds, { passive: true });
    element.addEventListener("pointermove", onPointerMove, { passive: true });
    element.addEventListener("pointerleave", onPointerLeave, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    reducedQuery.addEventListener("change", updateCapability);
    coarseQuery.addEventListener("change", updateCapability);
    connection?.addEventListener("change", updateCapability);
    start();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateBounds);
      viewport?.removeEventListener("resize", updateBounds);
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      reducedQuery.removeEventListener("change", updateCapability);
      coarseQuery.removeEventListener("change", updateCapability);
      connection?.removeEventListener("change", updateCapability);
    };
  }, [materialMotionRef, materialRendererRef, rootRef]);

  return motionRef;
}

export function ReactiveNetworkHero() {
  const rootRef = useRef<HTMLElement>(null);
  const materialRendererRef = useRef<HeroMaterialRendererHandle>(null);
  const materialMotionRef = useRef({ pointerX: 0, pointerY: 0, scrollProgress: 0 });
  useReactiveHeroMotion(rootRef, materialMotionRef, materialRendererRef);

  return (
    <section ref={rootRef} className={styles.root} aria-labelledby="distranet-hero-title" data-capability="full">
      <div className={styles.sticky}>
        <div className={styles.visual} aria-hidden="true">
          <div className={styles.studio} />
          <div className={styles.posterFrame}>
            <picture className={styles.poster}>
              <source
                media="(max-width: 720px)"
                srcSet="/hero/network-machine/v2/end-beauty-mobile-v1.webp"
              />
              <img
                src="/hero/network-machine/v2/end-beauty-v1.webp"
                alt=""
                width={1792}
                height={1024}
                sizes="100vw"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </picture>
            <HeroMaterialRenderer
              ref={materialRendererRef}
              motionRef={materialMotionRef}
              assetBasePath="/hero/network-machine/v2"
            />
            <div className={styles.opticalGrade} />
          </div>

          <svg className={styles.network} viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="network-hose-metal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#151719" />
                <stop offset="0.34" stopColor="#8d9295" />
                <stop offset="0.5" stopColor="#d9dcdd" />
                <stop offset="0.67" stopColor="#5b6063" />
                <stop offset="1" stopColor="#111315" />
              </linearGradient>
            </defs>
            {NETWORK_PATHS.map((path, index) => (
              <g
                key={path}
                className={styles.pipe}
                style={{ "--pipe-phase": `${(index / NETWORK_PATHS.length).toFixed(4)}` } as CSSProperties}
              >
                <path className={styles.pipeShadow} d={path} pathLength="1" />
                <path className={styles.pipeMetal} d={path} pathLength="1" />
                <path className={styles.pipeHighlight} d={path} pathLength="1" />
                <path className={styles.pipeSignal} d={path} pathLength="1" />
              </g>
            ))}
          </svg>

          <div className={styles.softbox} />
          <div className={styles.vignette} />
        </div>

        <div className={styles.copy} data-hero-copy>
          <p className={styles.eyebrow}><i /> The operating network for fluid power</p>
          <h1 id="distranet-hero-title">
            <span>Independent</span>
            <span>strength.</span>
            <em>Connected.</em>
          </h1>
          <p className={styles.lede}>We connect independent distributors into a single operating network—converting collective scale, shared inventory, digital commerce, and governed intelligence into durable advantage.</p>
          <div className={styles.actions}>
            <Link href="/advantage" className={styles.primaryAction}>Enter the network <Arrow /></Link>
            <Link href="/membership" className={styles.secondaryAction}>Explore membership <span aria-hidden="true">↗</span></Link>
          </div>
        </div>

        <div className={styles.scrollCue} aria-hidden="true">
          <span>Scroll to connect 21 members</span>
          <i />
        </div>
      </div>
    </section>
  );
}

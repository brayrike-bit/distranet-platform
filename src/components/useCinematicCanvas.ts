"use client";

import type { RootState } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";

type NavigatorWithSignals = Navigator & {
  deviceMemory?: number;
  connection?: EventTarget & { saveData?: boolean; effectiveType?: string };
};

export function useCinematicCanvas(rootMargin = "85% 0px") {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);
  const [quality, setQuality] = useState<"high" | "balanced" | "static">("static");

  useEffect(() => {
    const nav = navigator as NavigatorWithSignals;
    const coarse = matchMedia("(pointer: coarse)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const narrow = matchMedia("(max-width: 680px)");
    const update = () => {
      const constrained = Boolean(nav.connection?.saveData) || /2g/.test(nav.connection?.effectiveType ?? "");
      const lowEnd =
        (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency < 4) ||
        (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4);
      const capable = !coarse.matches && !constrained && (navigator.hardwareConcurrency ?? 4) >= 6 && (nav.deviceMemory ?? 4) >= 4;
      setQuality(reduced.matches || coarse.matches || narrow.matches || constrained || lowEnd ? "static" : capable ? "high" : "balanced");
    };
    update();
    coarse.addEventListener("change", update);
    reduced.addEventListener("change", update);
    narrow.addEventListener("change", update);
    nav.connection?.addEventListener?.("change", update);
    return () => {
      coarse.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
      narrow.removeEventListener("change", update);
      nav.connection?.removeEventListener?.("change", update);
    };
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const mountObserver = new IntersectionObserver(([entry]) => {
      // Keep only nearby scenes mounted. The persistent poster masks model
      // re-entry while releasing distant WebGL contexts on long pages.
      setMounted(entry.isIntersecting);
    }, { rootMargin, threshold: 0 });
    const activeObserver = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting && !document.hidden);
    }, { rootMargin: "10% 0px", threshold: 0 });
    mountObserver.observe(ref.current);
    activeObserver.observe(ref.current);
    const onVisibility = () => {
      if (document.hidden) setVisible(false);
      else if (ref.current) {
        const box = ref.current.getBoundingClientRect();
        const activeViewport = box.bottom > -innerHeight * .1 && box.top < innerHeight * 1.1;
        setVisible(activeViewport);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      mountObserver.disconnect();
      activeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [rootMargin]);

  useEffect(() => {
    // Posters do not consume scroll progress, so avoid viewport reads until a
    // live canvas is both eligible and near enough to mount.
    if (!mounted || quality === "static" || !ref.current) return;
    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const section = ref.current?.closest<HTMLElement>("[data-cinematic-section]") ?? ref.current;
      if (!section) return;
      const box = section.getBoundingClientRect();
      const travel = Math.max(innerHeight * .85, box.height - innerHeight);
      progress.current = Math.min(1, Math.max(0, -box.top / travel));
    };
    const scheduleProgress = () => {
      if (!frame) frame = requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", scheduleProgress, { passive: true });
    window.addEventListener("resize", scheduleProgress, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleProgress);
      window.removeEventListener("resize", scheduleProgress);
    };
  }, [mounted, quality]);

  const onCreated = useCallback((state: RootState) => {
    state.gl.domElement.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      setFailed(true);
    }, { once: true });
  }, []);

  const renderCanvas = mounted && quality !== "static" && !failed;
  const active = visible && quality !== "static" && !failed;
  return {
    ref,
    renderCanvas,
    active,
    quality,
    progress,
    onCreated,
    dpr: quality === "high" ? [1, 1.5] as [number, number] : [1, 1] as [number, number],
  };
}

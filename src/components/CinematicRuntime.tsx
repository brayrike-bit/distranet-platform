"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type NavigatorWithSignals = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function CinematicRuntime() {
  const pathname = usePathname() ?? "/";
  const railFillRef = useRef<HTMLElement>(null);
  const activeChapterRef = useRef(-1);
  const [chapter, setChapter] = useState({ index: 1, total: 1, label: "Opening signal" });

  useEffect(() => {
    const body = document.body;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const memberOverview = /^\/member-hub\/[^/]+\/?$/.test(pathname);
    const portalPointerSurface = pathname.startsWith("/member-access") || memberOverview;
    const nav = navigator as NavigatorWithSignals;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const constrained = Boolean(nav.connection?.saveData) || /2g/.test(nav.connection?.effectiveType ?? "");
    const lowEnd =
      (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency < 4) ||
      (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4);
    const capable = !coarse && !constrained && (navigator.hardwareConcurrency ?? 4) >= 6 && (nav.deviceMemory ?? 4) >= 4;

    body.dataset.motion = media.matches ? "reduced" : "full";
    body.dataset.renderQuality = coarse || constrained || lowEnd ? "static" : capable ? "high" : "balanced";
    body.dataset.routeState = "enter";

    const sections = Array.from(document.querySelectorAll<HTMLElement>("main section"));
    const sectionLabel = (section: HTMLElement, index: number) => {
      const labelledBy = section.getAttribute("aria-labelledby");
      const labelledNode = labelledBy ? document.getElementById(labelledBy) : null;
      const source = section.querySelector<HTMLElement>(
        '[data-cine-label], [class*="sectionLabel"], [class*="sectionIndex"], [class*="eyebrow"], [class*="kicker"], h2, h1',
      );
      const label = (labelledNode?.textContent ?? source?.textContent ?? `Chapter ${index + 1}`)
        .replace(/\s+/g, " ")
        .trim();
      return label.length > 46 ? `${label.slice(0, 43)}…` : label;
    };
    const labels = sections.map(sectionLabel);
    activeChapterRef.current = -1;
    setChapter({ index: 1, total: Math.max(1, sections.length), label: labels[0] ?? "Opening signal" });
    sections.forEach((section, index) => {
      section.dataset.cinematicSection = String(index + 1).padStart(2, "0");
      section.dataset.cineState = "idle";
      section.style.setProperty("--cine-progress", "0");
    });

    const activeSections = new Set<HTMLElement>();
    const lastSectionProgress = new WeakMap<HTMLElement, number>();
    let frame = 0;
    let lastRailProgress = -1;

    const writeProgress = (section: HTMLElement, progress: number) => {
      const previous = lastSectionProgress.get(section);
      if (previous !== undefined && Math.abs(previous - progress) < 0.0005) {
        return;
      }
      lastSectionProgress.set(section, progress);
      section.style.setProperty("--cine-progress", progress.toFixed(4));
    };

    const updateScroll = () => {
      frame = 0;
      const viewport = window.innerHeight;
      // IntersectionObserver keeps this set to the one-to-three sections near
      // the viewport. Avoid measuring and rewriting every section on long,
      // cinematic pages for each scroll frame.
      const candidates = activeSections.size
        ? Array.from(activeSections)
        : sections.filter((section) => {
          const rect = section.getBoundingClientRect();
          return rect.bottom > -viewport * 0.2 && rect.top < viewport * 1.2;
        });
      let closestSection: HTMLElement | undefined;
      let closestRect: DOMRect | undefined;
      let closestDistance = Number.POSITIVE_INFINITY;

      candidates.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const progress = clamp(
          (viewport - rect.top) / Math.max(1, viewport + rect.height),
        );
        writeProgress(section, progress);
        if (rect.bottom > 0 && rect.top < viewport) {
          const distance = Math.abs(rect.top + rect.height * .5 - viewport * .48);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestSection = section;
            closestRect = rect;
          }
        }
      });

      if (closestSection && closestRect) {
        const closestIndex = sections.indexOf(closestSection);
        const activeProgress = clamp(
          (viewport * .54 - closestRect.top) /
            Math.max(1, closestRect.height),
        );
        if (
          railFillRef.current &&
          Math.abs(lastRailProgress - activeProgress) >= 0.0005
        ) {
          lastRailProgress = activeProgress;
          railFillRef.current.style.transform =
            `scaleY(${activeProgress.toFixed(4)})`;
        }
        if (activeChapterRef.current !== closestIndex) {
          activeChapterRef.current = closestIndex;
          setChapter({
            index: closestIndex + 1,
            total: sections.length,
            label: labels[closestIndex],
          });
        }
      }
    };
    const scheduleScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateScroll);
    };

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const section = entry.target as HTMLElement;
        section.dataset.cineState = entry.isIntersecting ? "active" : "idle";
        if (entry.isIntersecting) {
          activeSections.add(section);
        } else {
          activeSections.delete(section);
          // Preserve a stable terminal value without continuing to animate a
          // section that can no longer contribute pixels to the viewport.
          const terminalProgress = entry.boundingClientRect.top > 0 ? 0 : 1;
          writeProgress(section, terminalProgress);
        }
      });
      scheduleScroll();
    }, { rootMargin: "18% 0px 18%", threshold: [0, .08, .5] });
    sections.forEach(section => observer.observe(section));

    let pointerFrame = 0;
    let pointerEvent: PointerEvent | null = null;
    const updatePointer = () => {
      pointerFrame = 0;
      if (!pointerEvent) return;
      const x = pointerEvent.clientX;
      const y = pointerEvent.clientY;
      const target = (pointerEvent.target as Element | null)?.closest<HTMLElement>("[data-reactive]");
      if (target) {
        const rect = target.getBoundingClientRect();
        target.style.setProperty("--reactive-x", `${x - rect.left}px`);
        target.style.setProperty("--reactive-y", `${y - rect.top}px`);
        target.style.setProperty("--reactive-nx", (((x - rect.left) / rect.width) * 2 - 1).toFixed(4));
        target.style.setProperty("--reactive-ny", (((y - rect.top) / rect.height) * 2 - 1).toFixed(4));
      }
    };
    const onPointer = (event: PointerEvent) => {
      pointerEvent = event;
      if (!pointerFrame) pointerFrame = requestAnimationFrame(updatePointer);
    };
    const onVisibility = () => { body.dataset.cinePaused = document.hidden ? "true" : "false"; };
    const updatePointerBinding = () => {
      window.removeEventListener("pointermove", onPointer);
      if (portalPointerSurface && !media.matches && !coarse) {
        window.addEventListener("pointermove", onPointer, { passive: true });
      }
      else pointerEvent = null;
    };
    const onMotionChange = () => {
      body.dataset.motion = media.matches ? "reduced" : "full";
      updatePointerBinding();
    };

    updateScroll();
    onVisibility();
    window.addEventListener("scroll", scheduleScroll, { passive: true });
    window.addEventListener("resize", scheduleScroll, { passive: true });
    updatePointerBinding();
    document.addEventListener("visibilitychange", onVisibility);
    media.addEventListener("change", onMotionChange);
    const routeTimer = window.setTimeout(() => { body.dataset.routeState = "settled"; }, 760);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      cancelAnimationFrame(pointerFrame);
      clearTimeout(routeTimer);
      window.removeEventListener("scroll", scheduleScroll);
      window.removeEventListener("resize", scheduleScroll);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      media.removeEventListener("change", onMotionChange);
    };
  }, [pathname]);

  const portalRoute = pathname.startsWith("/member-hub") || pathname.startsWith("/member-access");
  const v3PublicRoutes = ["/advantage", "/network", "/parts-gopher", "/distranet-direct", "/membership", "/about"];
  const showRail =
    pathname !== "/" &&
    !v3PublicRoutes.includes(pathname) &&
    !pathname.startsWith("/member-hub") &&
    !pathname.startsWith("/member-access");

  return <>
    {pathname !== "/" && !portalRoute && !v3PublicRoutes.includes(pathname) && (
      <div className="cine-route-transition" aria-hidden="true"><i /><b /></div>
    )}
    {showRail && <div className="cine-section-rail" aria-hidden="true">
      <span>{String(chapter.index).padStart(2, "0")}<small>/{String(chapter.total).padStart(2, "0")}</small></span>
      <i><b ref={railFillRef} /></i>
      <p>{chapter.label}</p>
    </div>}
  </>;
}

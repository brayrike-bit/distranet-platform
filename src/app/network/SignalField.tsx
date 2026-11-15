"use client";

import { useEffect, useRef } from "react";
import { networkMembers } from "./network-data";
import styles from "./network.module.css";

type Point = {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  phase: number;
};

type SignalFieldProps = {
  onActiveMember: (memberIndex: number | null) => void;
};

type NavigatorWithNetworkSignals = Navigator & {
  connection?: { saveData?: boolean; effectiveType?: string };
};

const edges = networkMembers.flatMap((_, index) => [
  [index, (index + 3) % networkMembers.length] as const,
  ...(index % 3 === 0 ? [[index, (index + 8) % networkMembers.length] as const] : []),
]);

export function SignalField({ onActiveMember }: SignalFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbackRef = useRef(onActiveMember);
  callbackRef.current = onActiveMember;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let frame = 0;
    let raf = 0;
    let running = true;
    let inViewport = false;
    let pageVisible = document.visibilityState === "visible";
    let nearestIndex: number | null = null;
    let lastDraw = 0;
    const pointer = { x: -1000, y: -1000, active: false };
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarseQuery = window.matchMedia("(pointer: coarse)");
    const narrowQuery = window.matchMedia("(max-width: 680px)");
    const nav = navigator as NavigatorWithNetworkSignals;
    const constrained = Boolean(nav.connection?.saveData) || /2g/.test(nav.connection?.effectiveType ?? "");
    let staticDevice = coarseQuery.matches || narrowQuery.matches || constrained;
    let reduced = reducedQuery.matches;

    const points: Point[] = networkMembers.map((_, index) => {
      const angle = index * 2.399963 + 0.35;
      const band = 0.16 + (index % 5) * 0.048;
      return {
        x: 0,
        y: 0,
        homeX: 0.67 + Math.cos(angle) * band,
        homeY: 0.5 + Math.sin(angle) * band * 1.2,
        phase: index * 0.71,
      };
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      pixelRatio = Math.min(window.devicePixelRatio || 1, reduced || staticDevice ? 1 : 1.35);
      canvas.width = Math.max(1, Math.round(width * pixelRatio));
      canvas.height = Math.max(1, Math.round(height * pixelRatio));
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      points.forEach((point) => {
        point.x = point.homeX * width;
        point.y = point.homeY * height;
      });
    };

    const updatePointer = (event: PointerEvent) => {
      if (reduced || staticDevice) return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };
    const clearPointer = () => {
      pointer.active = false;
      nearestIndex = null;
      callbackRef.current(null);
    };

    const draw = (timestamp = 0) => {
      const staticMode = reduced || staticDevice;
      if (!staticMode && timestamp > 0 && timestamp - lastDraw < 32) {
        raf = window.requestAnimationFrame(draw);
        return;
      }
      if (timestamp > 0) lastDraw = timestamp;
      context.clearRect(0, 0, width, height);
      const center = { x: width * 0.67, y: height * 0.5 };
      const time = staticMode ? 48 : frame * 0.012;

      context.save();
      context.globalCompositeOperation = "lighter";

      const halo = context.createRadialGradient(center.x, center.y, 0, center.x, center.y, Math.min(width, height) * 0.48);
      halo.addColorStop(0, "rgba(237,28,36,.18)");
      halo.addColorStop(0.28, "rgba(237,28,36,.06)");
      halo.addColorStop(1, "rgba(237,28,36,0)");
      context.fillStyle = halo;
      context.fillRect(0, 0, width, height);

      points.forEach((point, index) => {
          const targetX = point.homeX * width + Math.cos(time * 0.32 + point.phase) * (staticMode ? 0 : 5);
          const targetY = point.homeY * height + Math.sin(time * 0.27 + point.phase) * (staticMode ? 0 : 5);
        let offsetX = 0;
        let offsetY = 0;
        if (pointer.active) {
          const dx = pointer.x - point.x;
          const dy = pointer.y - point.y;
          const distance = Math.max(1, Math.hypot(dx, dy));
          if (distance < 150) {
            const pressure = (150 - distance) / 150;
            offsetX = -(dx / distance) * pressure * 24;
            offsetY = -(dy / distance) * pressure * 24;
          }
        }
        point.x += (targetX + offsetX - point.x) * 0.08;
        point.y += (targetY + offsetY - point.y) * 0.08;

        if (index % 2 === 0) {
          context.strokeStyle = "rgba(255,255,255,.06)";
          context.lineWidth = 0.7;
          context.beginPath();
          context.arc(center.x, center.y, Math.hypot(point.x - center.x, point.y - center.y), 0, Math.PI * 2);
          context.stroke();
        }
      });

      edges.forEach(([from, to], edgeIndex) => {
        const a = points[from];
        const b = points[to];
        const gradient = context.createLinearGradient(a.x, a.y, b.x, b.y);
        gradient.addColorStop(0, "rgba(237,28,36,.08)");
        gradient.addColorStop(0.5, "rgba(255,70,76,.36)");
        gradient.addColorStop(1, "rgba(255,255,255,.06)");
        context.strokeStyle = gradient;
        context.lineWidth = edgeIndex % 4 === 0 ? 1.1 : 0.55;
        context.beginPath();
        context.moveTo(a.x, a.y);
        const bend = Math.sin(time * 0.45 + edgeIndex) * 14;
        const midX = (a.x + b.x) / 2 + bend;
        const midY = (a.y + b.y) / 2 - bend;
        context.quadraticCurveTo(midX, midY, b.x, b.y);
        context.stroke();

        if (!staticMode && edgeIndex % 2 === 0) {
          const progress = (frame * 0.0038 + edgeIndex * 0.071) % 1;
          const inv = 1 - progress;
          const particleX = inv * inv * a.x + 2 * inv * progress * midX + progress * progress * b.x;
          const particleY = inv * inv * a.y + 2 * inv * progress * midY + progress * progress * b.y;
          context.fillStyle = "rgba(255,95,100,.88)";
          context.beginPath();
          context.arc(particleX, particleY, 1.35, 0, Math.PI * 2);
          context.fill();
        }
      });

      let closest: number | null = null;
      let closestDistance = 70;
      points.forEach((point, index) => {
        const distance = pointer.active ? Math.hypot(pointer.x - point.x, pointer.y - point.y) : Infinity;
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = index;
        }
        const isNearest = closest === index;
        const radius = isNearest ? 5.8 : index % 5 === 0 ? 3.4 : 2.3;
        const glow = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, isNearest ? 36 : 18);
        glow.addColorStop(0, isNearest ? "rgba(255,255,255,.92)" : "rgba(255,55,61,.74)");
        glow.addColorStop(1, "rgba(237,28,36,0)");
        context.fillStyle = glow;
        context.beginPath();
        context.arc(point.x, point.y, isNearest ? 36 : 18, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = isNearest ? "#ffffff" : "#ed1c24";
        context.beginPath();
        context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        context.fill();
      });

      context.strokeStyle = "rgba(255,255,255,.34)";
      context.lineWidth = 0.8;
      [34, 51, 72].forEach((radius, index) => {
        context.setLineDash(index === 1 ? [3, 7] : []);
        context.beginPath();
        context.arc(center.x, center.y, radius + Math.sin(time + index) * 2, time * (index % 2 ? -0.14 : 0.11), time * (index % 2 ? -0.14 : 0.11) + Math.PI * (1.15 + index * 0.2));
        context.stroke();
      });
      context.setLineDash([]);
      context.fillStyle = "#ffffff";
      context.beginPath();
      context.arc(center.x, center.y, 4, 0, Math.PI * 2);
      context.fill();
      context.restore();

      if (nearestIndex !== closest) {
        nearestIndex = closest;
        callbackRef.current(closest);
      }
      frame += 1;
      if (running && inViewport && pageVisible && !staticMode) raf = window.requestAnimationFrame(draw);
    };

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting;
      if (inViewport && pageVisible) {
        window.cancelAnimationFrame(raf);
        draw();
      } else {
        window.cancelAnimationFrame(raf);
        nearestIndex = null;
        callbackRef.current(null);
      }
    }, { threshold: 0.02 });
    const handlePreference = () => {
      reduced = reducedQuery.matches;
      staticDevice = coarseQuery.matches || narrowQuery.matches || constrained;
      window.cancelAnimationFrame(raf);
      if (reduced || staticDevice) clearPointer();
      resize();
      if (inViewport && pageVisible) draw();
    };
    const handleVisibility = () => {
      pageVisible = document.visibilityState === "visible";
      window.cancelAnimationFrame(raf);
      if (pageVisible && inViewport) draw();
    };

    resizeObserver.observe(canvas);
    intersectionObserver.observe(canvas);
    canvas.addEventListener("pointermove", updatePointer);
    canvas.addEventListener("pointerleave", clearPointer);
    reducedQuery.addEventListener("change", handlePreference);
    coarseQuery.addEventListener("change", handlePreference);
    narrowQuery.addEventListener("change", handlePreference);
    document.addEventListener("visibilitychange", handleVisibility);
    resize();

    return () => {
      running = false;
      window.cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener("pointermove", updatePointer);
      canvas.removeEventListener("pointerleave", clearPointer);
      reducedQuery.removeEventListener("change", handlePreference);
      coarseQuery.removeEventListener("change", handlePreference);
      narrowQuery.removeEventListener("change", handlePreference);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.signalCanvas} aria-hidden="true" />;
}

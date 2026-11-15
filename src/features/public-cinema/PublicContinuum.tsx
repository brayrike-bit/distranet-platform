"use client";

import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
} from "react";
import styles from "./PublicContinuum.module.css";

type ContinuumStyle = CSSProperties & Record<`--${string}`, string | number>;

type PublicContinuumProps = Readonly<{
  children: ReactNode;
  label: string;
  tone: "home" | "advantage" | "network" | "commerce" | "membership" | "governance";
}>;

function clamp(value: number) {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
}

export function PublicContinuum({ children, label, tone }: PublicContinuumProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef(0);
  const renderedRef = useRef(0);
  const frameRef = useRef(0);
  const previousTimeRef = useRef(0);

  const render = useCallback((progress: number) => {
    const root = rootRef.current;
    if (!root) return;
    const normalized = clamp(progress);
    renderedRef.current = normalized;
    root.style.setProperty("--continuum-progress", normalized.toFixed(5));
    root.style.setProperty("--continuum-percent", `${(normalized * 100).toFixed(3)}%`);
    root.style.setProperty("--continuum-percent-83", `${(normalized * 83).toFixed(3)}%`);
    root.style.setProperty("--continuum-percent-69", `${(normalized * 69).toFixed(3)}%`);
    root.style.setProperty("--continuum-percent-53", `${(normalized * 53).toFixed(3)}%`);
    root.style.setProperty("--continuum-turn", `${(normalized * 288).toFixed(3)}deg`);
    root.style.setProperty("--continuum-turn-half", `${(normalized * 144).toFixed(3)}deg`);
    root.style.setProperty("--continuum-turn-slow", `${(normalized * 63.36).toFixed(3)}deg`);
    root.style.setProperty("--continuum-shift", `${((normalized - 0.5) * 34).toFixed(3)}vh`);
  }, []);

  const animate = useCallback((time: number) => {
    frameRef.current = 0;
    const previous = previousTimeRef.current || time;
    const elapsed = Math.min(64, Math.max(0, time - previous));
    previousTimeRef.current = time;
    const current = renderedRef.current;
    const target = targetRef.current;
    const alpha = 1 - Math.exp(-elapsed / 46);
    const next = Math.abs(target - current) < 0.0003
      ? target
      : current + (target - current) * alpha;
    render(next);
    if (Math.abs(target - next) > 0.0003) {
      frameRef.current = requestAnimationFrame(animate);
    }
  }, [render]);

  const schedule = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    const range = Math.max(1, rect.height - window.innerHeight);
    targetRef.current = clamp(-rect.top / range);
    if (!frameRef.current) {
      previousTimeRef.current = performance.now();
      frameRef.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) {
      render(0.5);
      return;
    }
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [render, schedule]);

  return (
    <div
      ref={rootRef}
      className={styles.root}
      data-public-continuum="true"
      data-continuum-label={label}
      data-tone={tone}
      style={{
        "--continuum-progress": 0,
        "--continuum-percent": "0%",
        "--continuum-percent-83": "0%",
        "--continuum-percent-69": "0%",
        "--continuum-percent-53": "0%",
        "--continuum-turn": "0deg",
        "--continuum-turn-half": "0deg",
        "--continuum-turn-slow": "0deg",
      } as ContinuumStyle}
    >
      <div className={styles.field} aria-hidden="true">
        <div className={styles.progress}><i /></div>
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}

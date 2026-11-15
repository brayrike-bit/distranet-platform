import type { MutableRefObject } from "react";

export type HeroMaterialMotionState = {
  /** Normalized pointer position in the hero: -1..1. */
  pointerX: number;
  /** Normalized pointer position in the hero: -1..1. */
  pointerY: number;
  /** Normalized chapter/hero scroll progress: 0..1. */
  scrollProgress: number;
};

export type HeroMaterialMotionRef = MutableRefObject<HeroMaterialMotionState>;

export type HeroMaterialMotionInvalidator = () => void;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? value : 0));

export function createHeroMaterialMotionRef(): HeroMaterialMotionRef {
  return {
    current: {
      pointerX: 0,
      pointerY: 0,
      scrollProgress: 0,
    },
  };
}

/**
 * High-frequency adapter for pointer handlers. It mutates a shared ref instead
 * of causing a React render, then wakes the sleeping WebGL renderer.
 */
export function setHeroMaterialPointer(
  motionRef: HeroMaterialMotionRef,
  pointerX: number,
  pointerY: number,
  invalidate?: HeroMaterialMotionInvalidator,
) {
  motionRef.current.pointerX = clamp(pointerX, -1, 1);
  motionRef.current.pointerY = clamp(pointerY, -1, 1);
  invalidate?.();
}

/** High-frequency adapter for the shared rAF-throttled scroll clock. */
export function setHeroMaterialScrollProgress(
  motionRef: HeroMaterialMotionRef,
  scrollProgress: number,
  invalidate?: HeroMaterialMotionInvalidator,
) {
  motionRef.current.scrollProgress = clamp(scrollProgress, 0, 1);
  invalidate?.();
}

"use client";

import {
  type CSSProperties,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import { useCinematicMotionPolicy } from "./useCinematicMotionPolicy";
import styles from "./cinematicMedia.module.css";

type DepthStyle = CSSProperties & {
  "--depth-perspective"?: string;
  "--depth-layer-x"?: string;
  "--depth-layer-y"?: string;
  "--depth-layer-z"?: string;
  "--depth-layer-rx"?: string;
  "--depth-layer-ry"?: string;
  "--depth-layer-scale"?: string;
};

export type PointerDepthStageProps =
  & Omit<HTMLAttributes<HTMLDivElement>, "children">
  & Readonly<{
    children: ReactNode;
    layout?: "stack" | "flow";
    perspective?: number;
    travelX?: number;
    travelY?: number;
    travelZ?: number;
    rotation?: number;
    /** Spring convergence per rendered frame. 0.08 is languid; 0.3 is immediate. */
    response?: number;
    disabled?: boolean;
    decorative?: boolean;
  }>;

export type PointerDepthLayerProps =
  & Omit<HTMLAttributes<HTMLDivElement>, "children">
  & Readonly<{
    children: ReactNode;
    /** -1 moves opposite the pointer, 0 is anchored, and 1 is nearest. */
    depth: number;
    scale?: number;
  }>;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? value : 0));

function resetLayer(layer: HTMLElement) {
  layer.style.setProperty("--depth-layer-x", "0px");
  layer.style.setProperty("--depth-layer-y", "0px");
  layer.style.setProperty("--depth-layer-z", "0px");
  layer.style.setProperty("--depth-layer-rx", "0deg");
  layer.style.setProperty("--depth-layer-ry", "0deg");
  layer.style.setProperty("--depth-layer-scale", "1");
}

function writeSceneField(
  target: HTMLElement,
  x: number,
  y: number,
  active: boolean,
) {
  target.style.setProperty("--depth-pointer-x", x.toFixed(5));
  target.style.setProperty("--depth-pointer-y", y.toFixed(5));
  target.style.setProperty("--depth-scene-x", `${(-x * 58).toFixed(2)}px`);
  target.style.setProperty("--depth-scene-y", `${(-y * 38).toFixed(2)}px`);
  target.style.setProperty("--depth-reflection-x", `${(x * 78).toFixed(2)}px`);
  target.style.setProperty("--depth-reflection-y", `${(y * 51).toFixed(2)}px`);
  target.style.setProperty("--depth-scene-rx", `${(-y * 1.9).toFixed(3)}deg`);
  target.style.setProperty("--depth-scene-ry", `${(x * 2.6).toFixed(3)}deg`);
  target.style.setProperty(
    "--depth-light-x",
    `${(50 + x * 32).toFixed(2)}%`,
  );
  target.style.setProperty(
    "--depth-light-y",
    `${(50 + y * 24).toFixed(2)}%`,
  );
  const activeValue = active ? "true" : "false";
  if (target.dataset.pointerSceneActive !== activeValue) {
    target.dataset.pointerSceneActive = activeValue;
  }
}

/**
 * Pointer-owned spatial stage with deliberately large depth separation. It
 * writes transforms outside React's render loop and fully collapses to a static
 * composition for reduced-motion, coarse-pointer, and constrained devices.
 */
export function PointerDepthStage({
  children,
  className = "",
  layout = "stack",
  perspective = 1400,
  travelX = 88,
  travelY = 56,
  travelZ = 130,
  rotation = 7.5,
  response = 0.16,
  disabled = false,
  decorative = false,
  style,
  ...props
}: PointerDepthStageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const policy = useCinematicMotionPolicy();
  const enabled = policy.ready && policy.allowMotion && policy.finePointer &&
    !disabled;
  const stageStyle: DepthStyle = {
    ...style,
    "--depth-perspective": `${Math.max(400, perspective)}px`,
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // ScrollScrubFilm owns the footage as a sibling of this stage. Mirror the
    // pointer field to that shared film root so the plate, optics, and UI move
    // as one camera system instead of leaving the footage visibly static.
    const filmRoot = root.closest<HTMLElement>("[data-cinematic-film]");
    // The layer tree is authored and stable. Cache it once instead of querying
    // the DOM on every animation frame.
    const layers = Array.from(
      root.querySelectorAll<HTMLElement>("[data-depth-layer]"),
    );
    const responsiveness = clamp(response, 0.04, 0.5);
    let bounds = root.getBoundingClientRect();
    let previousFrameTime = 0;

    const paint = (now: number) => {
      frameRef.current = 0;
      const current = currentRef.current;
      const target = targetRef.current;
      const priorTime = previousFrameTime || now - 16.7;
      const elapsedFrames = Math.min(4, Math.max(0.25, (now - priorTime) / 16.7));
      previousFrameTime = now;
      const frameResponse = 1 - Math.pow(1 - responsiveness, elapsedFrames);
      current.x += (target.x - current.x) * frameResponse;
      current.y += (target.y - current.y) * frameResponse;

      const active = root.dataset.pointerActive === "true";
      writeSceneField(root, current.x, current.y, active);
      if (filmRoot && filmRoot !== root) {
        writeSceneField(filmRoot, current.x, current.y, active);
      }

      layers.forEach((layer) => {
        const depth = clamp(Number(layer.dataset.depth), -1, 1);
        const authoredScale = clamp(
          Number(layer.dataset.depthScale ?? 1),
          0.5,
          2,
        );
        layer.style.setProperty(
          "--depth-layer-x",
          `${(current.x * travelX * depth).toFixed(2)}px`,
        );
        layer.style.setProperty(
          "--depth-layer-y",
          `${(current.y * travelY * depth).toFixed(2)}px`,
        );
        layer.style.setProperty(
          "--depth-layer-z",
          `${(depth * travelZ).toFixed(2)}px`,
        );
        layer.style.setProperty(
          "--depth-layer-rx",
          `${(-current.y * rotation * depth).toFixed(3)}deg`,
        );
        layer.style.setProperty(
          "--depth-layer-ry",
          `${(current.x * rotation * depth).toFixed(3)}deg`,
        );
        layer.style.setProperty(
          "--depth-layer-scale",
          `${(authoredScale * (1 + depth * 0.018)).toFixed(5)}`,
        );
      });

      const unsettled = Math.abs(target.x - current.x) > 0.001 ||
        Math.abs(target.y - current.y) > 0.001;
      if (unsettled) frameRef.current = window.requestAnimationFrame(paint);
    };

    const schedule = () => {
      if (!frameRef.current) {
        frameRef.current = window.requestAnimationFrame(paint);
      }
    };

    const move = (event: PointerEvent) => {
      if (
        !enabled ||
        (event.pointerType !== "mouse" && event.pointerType !== "pen")
      ) return;
      if (root.dataset.pointerActive !== "true") {
        bounds = root.getBoundingClientRect();
      }
      if (!bounds.width || !bounds.height) return;
      targetRef.current.x = clamp(
        ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
        -1,
        1,
      );
      targetRef.current.y = clamp(
        ((event.clientY - bounds.top) / bounds.height - 0.5) * 2,
        -1,
        1,
      );
      root.dataset.pointerActive = "true";
      schedule();
    };

    const reset = () => {
      targetRef.current = { x: 0, y: 0 };
      root.dataset.pointerActive = "false";
      if (filmRoot) filmRoot.dataset.pointerSceneActive = "false";
      previousFrameTime = 0;
      schedule();
    };

    const measure = () => {
      bounds = root.getBoundingClientRect();
    };

    if (enabled) {
      root.addEventListener("pointerenter", measure, { passive: true });
      root.addEventListener("pointermove", move, { passive: true });
      root.addEventListener("pointerleave", reset, { passive: true });
      window.addEventListener("resize", measure, { passive: true });
      window.addEventListener("blur", reset);
      frameRef.current = window.requestAnimationFrame(paint);
    } else {
      targetRef.current = { x: 0, y: 0 };
      currentRef.current = { x: 0, y: 0 };
      writeSceneField(root, 0, 0, false);
      if (filmRoot && filmRoot !== root) writeSceneField(filmRoot, 0, 0, false);
      layers.forEach(resetLayer);
    }

    return () => {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      root.removeEventListener("pointerenter", measure);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerleave", reset);
      window.removeEventListener("resize", measure);
      window.removeEventListener("blur", reset);
      if (filmRoot && filmRoot !== root) writeSceneField(filmRoot, 0, 0, false);
    };
  }, [enabled, response, rotation, travelX, travelY, travelZ]);

  return (
    <div
      ref={rootRef}
      className={`${styles.depthStage} ${className}`.trim()}
      style={stageStyle}
      data-depth-layout={layout}
      data-depth-enabled={enabled ? "true" : "false"}
      data-pointer-active="false"
      data-policy={policy.reason}
      aria-hidden={decorative ? true : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

export const PointerDepthLayer = forwardRef<
  HTMLDivElement,
  PointerDepthLayerProps
>(
  function PointerDepthLayer(
    { children, className = "", depth, scale = 1, style, ...props },
    ref,
  ) {
    const layerStyle: DepthStyle = {
      ...style,
      "--depth-layer-x": "0px",
      "--depth-layer-y": "0px",
      "--depth-layer-z": "0px",
      "--depth-layer-rx": "0deg",
      "--depth-layer-ry": "0deg",
      "--depth-layer-scale": `${clamp(scale, 0.5, 2)}`,
    };

    return (
      <div
        ref={ref}
        className={`${styles.depthLayer} ${className}`.trim()}
        style={layerStyle}
        data-depth-layer="true"
        data-depth={clamp(depth, -1, 1)}
        data-depth-scale={clamp(scale, 0.5, 2)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

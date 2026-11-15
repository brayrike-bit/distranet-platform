"use client";

import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AccessibleFilmPoster } from "./AccessibleFilmPoster";
import type {
  CinematicFilmAsset,
  CinematicTimelineBeat,
} from "./mediaManifest";
import { useCinematicMotionPolicy } from "./useCinematicMotionPolicy";
import styles from "./cinematicMedia.module.css";

type VideoWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (
    callback: (now: number, metadata: { mediaTime: number }) => void,
  ) => number;
  cancelVideoFrameCallback?: (handle: number) => void;
};

type ScrollMetrics = Readonly<{
  startY: number;
  runway: number;
  fallbackStartY: number;
  fallbackRunway: number;
}>;

type ScrubStyle = CSSProperties & {
  "--scrub-span"?: string;
  "--scrub-sticky-top"?: string;
  "--scrub-object-fit"?: string;
  "--scrub-object-position"?: string;
  "--scrub-progress"?: string;
  "--scrub-time"?: string;
  "--scrub-travel-y"?: string;
  "--scrub-scale"?: string;
};

export type ScrollScrubFilmProps = Readonly<{
  asset: CinematicFilmAsset;
  id?: string;
  ariaLabelledBy?: string;
  className?: string;
  frameClassName?: string;
  mediaClassName?: string;
  children?: ReactNode;
  /** Total scroll runway. 320 means 3.2 viewport heights. */
  scrollSpanVh?: number;
  stickyTop?: string;
  fit?: "cover" | "contain";
  focalPoint?: string;
  priority?: boolean;
  decorative?: boolean;
  disabled?: boolean;
  /** Optional external master timeline. Values are clamped from 0 through 1. */
  progress?: number;
  onProgressChange?: (progress: number, timeSeconds: number) => void;
  onBeatChange?: (beat: CinematicTimelineBeat) => void;
}>;

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? value : 0));

// Every current cinematic master is authored at 24 fps. Addressing those
// exact frames prevents 60/120 Hz scroll input from flooding the decoder with
// multiple seeks to the same source frame.
const MASTER_FRAME_RATE = 24;
const MASTER_FRAME_DURATION = 1 / MASTER_FRAME_RATE;
const PROGRESS_EPSILON = 0.00008;
const SCROLL_RESPONSE_MS = 54;

function activeBeat(beats: readonly CinematicTimelineBeat[], progress: number) {
  let active = beats[0];
  for (const beat of beats) {
    if (beat.progress > progress) break;
    active = beat;
  }
  return active;
}

function timelineTime(
  asset: CinematicFilmAsset,
  progress: number,
  mediaDuration?: number,
) {
  const authoredDuration = asset.durationSeconds;
  const usableDuration =
    Number.isFinite(mediaDuration) && Number(mediaDuration) > 0
      ? Math.min(authoredDuration, Number(mediaDuration))
      : authoredDuration;
  const frameSafeDuration = Math.max(0, usableDuration - 1 / 120);
  const start = clamp(asset.timeline?.startSeconds ?? 0, 0, frameSafeDuration);
  const requestedEnd = asset.timeline?.endSeconds ?? usableDuration;
  // Avoid the browser's implementation-specific frame after the media end.
  const frameSafeEnd = Math.max(start, frameSafeDuration);
  const end = clamp(requestedEnd, start, frameSafeEnd);
  return start + clamp(progress) * (end - start);
}

function measureScroll(
  element: HTMLElement,
  stickyFrame: HTMLElement | null,
): ScrollMetrics {
  const rect = element.getBoundingClientRect();
  const viewportHeight = Math.max(1, window.innerHeight);
  const stickyHeight = stickyFrame?.getBoundingClientRect().height ??
    viewportHeight;
  const stickyTop = stickyFrame
    ? Number.parseFloat(window.getComputedStyle(stickyFrame).top) || 0
    : 0;
  const documentTop = window.scrollY + rect.top;
  return {
    startY: documentTop - stickyTop,
    runway: rect.height - stickyHeight,
    fallbackStartY: documentTop - viewportHeight,
    fallbackRunway: viewportHeight + rect.height,
  };
}

function measuredScrollProgress(metrics: ScrollMetrics) {
  if (metrics.runway > 1) {
    return clamp((window.scrollY - metrics.startY) / metrics.runway);
  }
  return clamp(
    (window.scrollY - metrics.fallbackStartY) /
      Math.max(1, metrics.fallbackRunway),
  );
}

function frameTime(time: number, duration: number) {
  const safeDuration = Math.max(0, duration - 1 / 120);
  return clamp(
    Math.round(time * MASTER_FRAME_RATE) / MASTER_FRAME_RATE,
    0,
    safeDuration,
  );
}

function useMobileFilmVariant(asset: CinematicFilmAsset) {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 720px)");
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return mobile && asset.mobile ? asset.mobile : asset.desktop;
}

/**
 * A deterministic scroll-owned film: the element is never autoplayed. Each
 * normalized scroll position addresses one exact point in the authored master.
 */
export function ScrollScrubFilm({
  asset,
  id,
  ariaLabelledBy,
  className = "",
  frameClassName = "",
  mediaClassName = "",
  children,
  scrollSpanVh = 320,
  stickyTop = "0px",
  fit = "cover",
  focalPoint,
  priority = false,
  decorative = true,
  disabled = false,
  progress: controlledProgress,
  onProgressChange,
  onBeatChange,
}: ScrollScrubFilmProps) {
  const rootRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollFrameRef = useRef(0);
  const decodedFrameRef = useRef(0);
  const progressRef = useRef(clamp(controlledProgress ?? 0));
  const scrollTargetRef = useRef(progressRef.current);
  const lastScrollFrameTimeRef = useRef(0);
  const targetMediaTimeRef = useRef(0);
  const requestedMediaTimeRef = useRef(Number.NaN);
  const seekInFlightRef = useRef(false);
  const flushVideoSeekRef = useRef<() => void>(() => undefined);
  const activeBeatIdRef = useRef<string | undefined>(undefined);
  const callbacksRef = useRef({ onProgressChange, onBeatChange });
  const [nearViewport, setNearViewport] = useState(priority);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const policy = useCinematicMotionPolicy();
  const variant = useMobileFilmVariant(asset);
  const controlled = typeof controlledProgress === "number";
  const deliveredMotion = asset.delivery.status === "plate-ready" ||
    asset.delivery.status === "ready";
  const motionEnabled = policy.ready && policy.allowMotion && !disabled;
  const posterEligible = asset.delivery.status !== "planned";
  const hasVideoSource = variant.sources.some((source) =>
    source.src.trim().length > 0
  );
  // Scroll is an equally valid film controller on touch. Fine-pointer is only
  // a requirement for PointerDepthStage, never for loading or scrubbing a
  // delivered film. Poster-only assets deliberately collapse to one viewport
  // instead of impersonating a multi-viewport film with an awkward moving JPG.
  const scrubCapable = motionEnabled && deliveredMotion && hasVideoSource &&
    !videoFailed;
  const loadVideo = scrubCapable && nearViewport;

  callbacksRef.current = { onProgressChange, onBeatChange };

  const flushVideoSeek = useCallback(() => {
    const video = videoRef.current as VideoWithFrameCallback | null;
    const element = rootRef.current;
    if (
      !video || !element || seekInFlightRef.current || video.seeking ||
      video.readyState < HTMLMediaElement.HAVE_METADATA ||
      !Number.isFinite(video.duration) || video.duration <= 0
    ) return;

    const requestedTime = frameTime(targetMediaTimeRef.current, video.duration);
    const lastRequested = requestedMediaTimeRef.current;
    if (
      Number.isFinite(lastRequested) &&
      Math.abs(lastRequested - requestedTime) < MASTER_FRAME_DURATION * 0.5
    ) return;

    requestedMediaTimeRef.current = requestedTime;
    seekInFlightRef.current = true;
    element.dataset.requestedTime = requestedTime.toFixed(3);
    video.currentTime = requestedTime;

    if (video.requestVideoFrameCallback) {
      decodedFrameRef.current = video.requestVideoFrameCallback(
        (_now, metadata) => {
          decodedFrameRef.current = 0;
          seekInFlightRef.current = false;
          element.dataset.renderedTime = metadata.mediaTime.toFixed(3);
          setVideoReady(true);
          // Scroll may have advanced while this frame decoded. Only the newest
          // target survives, so stale intermediate seeks never build a queue.
          flushVideoSeekRef.current();
        },
      );
    }
  }, []);

  flushVideoSeekRef.current = flushVideoSeek;

  const style: ScrubStyle = {
    "--scrub-span": `${Math.max(100, scrollSpanVh)}svh`,
    "--scrub-sticky-top": stickyTop,
    "--scrub-object-fit": fit,
    "--scrub-object-position": focalPoint ?? variant.poster.focalPoint ??
      "50% 50%",
    "--scrub-progress": progressRef.current.toFixed(5),
    "--scrub-time": timelineTime(asset, progressRef.current).toFixed(5),
    "--scrub-travel-y": `${((progressRef.current - 0.5) * -18).toFixed(3)}vh`,
    "--scrub-scale": (1.08 + progressRef.current * 0.08).toFixed(5),
  };

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;
    if (typeof IntersectionObserver === "undefined") {
      setNearViewport(true);
      return;
    }

    // Priority eagerly mounts the opening frame, but the observer still
    // retires it once it is far off-screen. This prevents the first homepage
    // film from decoding and handling scroll for the lifetime of the page.
    const observer = new IntersectionObserver(
      ([entry]) => setNearViewport(entry.isIntersecting),
      { rootMargin: "125% 0px", threshold: 0 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [priority]);

  useEffect(() => {
    setVideoReady(false);
    setVideoFailed(false);
    seekInFlightRef.current = false;
    requestedMediaTimeRef.current = Number.NaN;
    targetMediaTimeRef.current = timelineTime(asset, progressRef.current);
  }, [variant.id]);

  useEffect(() => {
    activeBeatIdRef.current = undefined;
  }, [asset.id]);

  useEffect(() => {
    if (!loadVideo) setVideoReady(false);
  }, [loadVideo]);

  const commit = useCallback(
    (nextProgress: number) => {
      const element = rootRef.current;
      if (!element) return;
      const normalized = clamp(nextProgress);
      progressRef.current = normalized;
      const video = videoRef.current as VideoWithFrameCallback | null;
      const time = timelineTime(asset, normalized, video?.duration);
      targetMediaTimeRef.current = time;

      element.style.setProperty("--scrub-progress", normalized.toFixed(5));
      element.style.setProperty("--scrub-time", time.toFixed(5));
      element.style.setProperty(
        "--scrub-travel-y",
        `${((normalized - 0.5) * -18).toFixed(3)}vh`,
      );
      element.style.setProperty(
        "--scrub-scale",
        (1.08 + normalized * 0.08).toFixed(5),
      );
      element.dataset.scrubProgress = normalized.toFixed(4);
      element.dataset.scrubTime = time.toFixed(3);

      if (scrubCapable && video) flushVideoSeek();

      const beat = activeBeat(asset.beats, normalized);
      if (beat && beat.id !== activeBeatIdRef.current) {
        activeBeatIdRef.current = beat.id;
        element.dataset.activeBeat = beat.id;
        callbacksRef.current.onBeatChange?.(beat);
      }
      callbacksRef.current.onProgressChange?.(normalized, time);
    },
    [asset, flushVideoSeek, scrubCapable],
  );

  useEffect(() => {
    const element = rootRef.current;
    const stickyFrame = stickyRef.current;
    if (!element) return;

    if (controlled) {
      const next = clamp(controlledProgress ?? 0);
      scrollTargetRef.current = next;
      progressRef.current = next;
      commit(next);
      return;
    }

    if (!scrubCapable || !nearViewport) {
      if (!scrubCapable) commit(0);
      return;
    }

    let metrics = measureScroll(element, stickyFrame);
    const readTarget = () => {
      scrollTargetRef.current = measuredScrollProgress(metrics);
    };

    const paint = (now: number) => {
      scrollFrameRef.current = 0;
      const previousFrameTime = lastScrollFrameTimeRef.current || now - 16.7;
      const elapsed = Math.min(64, Math.max(1, now - previousFrameTime));
      lastScrollFrameTimeRef.current = now;
      const target = scrollTargetRef.current;
      const current = progressRef.current;
      const response = 1 - Math.exp(-elapsed / SCROLL_RESPONSE_MS);
      const next = Math.abs(target - current) <= PROGRESS_EPSILON
        ? target
        : current + (target - current) * response;

      commit(next);
      if (Math.abs(target - next) > PROGRESS_EPSILON) {
        scrollFrameRef.current = window.requestAnimationFrame(paint);
      }
    };

    const schedule = () => {
      readTarget();
      if (!scrollFrameRef.current) {
        scrollFrameRef.current = window.requestAnimationFrame(paint);
      }
    };

    const measure = () => {
      metrics = measureScroll(element, stickyFrame);
      schedule();
    };

    readTarget();
    progressRef.current = scrollTargetRef.current;
    commit(progressRef.current);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(measure);
    resizeObserver?.observe(element);
    if (stickyFrame) resizeObserver?.observe(stickyFrame);

    return () => {
      window.cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = 0;
      lastScrollFrameTimeRef.current = 0;
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      resizeObserver?.disconnect();
    };
  }, [
    commit,
    controlled,
    controlledProgress,
    scrubCapable,
    nearViewport,
    variant.id,
  ]);

  useEffect(() => {
    const video = videoRef.current as VideoWithFrameCallback | null;
    return () => {
      if (video && decodedFrameRef.current && video.cancelVideoFrameCallback) {
        video.cancelVideoFrameCallback(decodedFrameRef.current);
      }
      decodedFrameRef.current = 0;
      seekInFlightRef.current = false;
      requestedMediaTimeRef.current = Number.NaN;
    };
  }, [loadVideo, variant.id]);

  return (
    <section
      ref={rootRef}
      id={id}
      className={`${styles.scrubRoot} ${className}`.trim()}
      style={style}
      aria-labelledby={ariaLabelledBy}
      data-cinematic-film={asset.id}
      data-delivery-status={asset.delivery.status}
      data-branding-status={asset.delivery.branding}
      data-motion={scrubCapable ? "scrub" : "poster"}
      data-policy={policy.reason}
      data-video-ready={videoReady ? "true" : "false"}
    >
      <div
        ref={stickyRef}
        className={`${styles.stickyFrame} ${frameClassName}`.trim()}
      >
        <figure
          className={`${styles.filmMedia} ${mediaClassName}`.trim()}
          aria-hidden={decorative ? true : undefined}
        >
          {posterEligible && (
            <AccessibleFilmPoster
              asset={asset}
              decorative={decorative}
              priority={priority}
              alt={asset.title}
            />
          )}
          {loadVideo && (
            <video
              key={variant.id}
              ref={videoRef}
              className={styles.scrubVideo}
              muted
              playsInline
              preload="auto"
              poster={variant.poster.src}
              width={variant.poster.width}
              height={variant.poster.height}
              tabIndex={-1}
              onLoadedMetadata={(event) => {
                event.currentTarget.pause();
                targetMediaTimeRef.current = timelineTime(
                  asset,
                  progressRef.current,
                  event.currentTarget.duration,
                );
                requestedMediaTimeRef.current = Number.NaN;
                seekInFlightRef.current = false;
                flushVideoSeek();
              }}
              onLoadedData={(event) => {
                event.currentTarget.pause();
                // loadeddata guarantees a decoded current frame. Reveal it at
                // progress zero instead of waiting for the first seek, which
                // otherwise leaves a final-frame poster visible until scroll.
                setVideoReady(true);
                flushVideoSeek();
              }}
              onSeeked={() => {
                const video = videoRef.current as VideoWithFrameCallback | null;
                // requestVideoFrameCallback is the presentation boundary when
                // available. seeked is the fallback for older Safari/WebViews.
                if (video && !video.requestVideoFrameCallback) {
                  seekInFlightRef.current = false;
                  rootRef.current?.setAttribute(
                    "data-rendered-time",
                    video.currentTime.toFixed(3),
                  );
                  setVideoReady(true);
                  flushVideoSeek();
                }
              }}
              onError={() => {
                setVideoReady(false);
                setVideoFailed(true);
              }}
            >
              {variant.sources.map((source) => (
                <source
                  key={`${source.type}-${source.src}`}
                  src={source.src}
                  type={source.type}
                />
              ))}
            </video>
          )}
          <span className={styles.opticalGrade} aria-hidden="true" />
          {!decorative && (
            <figcaption className={styles.screenReaderOnly}>
              {asset.description}
            </figcaption>
          )}
        </figure>
        {children && <div className={styles.filmOverlay}>{children}</div>}
      </div>
    </section>
  );
}

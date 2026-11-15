"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type NetworkInformation = EventTarget & {
  saveData?: boolean;
  effectiveType?: string;
};

type NavigatorWithSignals = Navigator & {
  connection?: NetworkInformation;
};

type VideoWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (
    callback: (now: number, metadata: { mediaTime: number }) => void,
  ) => number;
  cancelVideoFrameCallback?: (handle: number) => void;
};

type ViewportMetrics = Readonly<{
  startY: number;
  runway: number;
}>;

type FilmStyle = CSSProperties & {
  "--film-position"?: string;
  "--film-scroll-progress"?: string;
  "--film-scroll-y"?: string;
  "--film-scroll-scale"?: string;
};

type FilmPolicy =
  | "initializing"
  | "scroll-scrub"
  | "missing-source"
  | "reduced-motion"
  | "save-data"
  | "slow-network"
  | "static-quality"
  | "video-error";

type ViewportFilmProps = {
  src?: string;
  poster: string;
  /** Separately authored portrait master used below the mobile breakpoint. */
  mobileSrc?: string;
  /** Poster matched to the first frame of the portrait master. */
  mobilePoster?: string;
  className?: string;
  focalPoint?: string;
  mobileFocalPoint?: string;
  /** Portion of the delivered master addressed by this visual. */
  scrubRange?: readonly [number, number];
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? value : 0));

const MASTER_FRAME_RATE = 24;
const MASTER_FRAME_DURATION = 1 / MASTER_FRAME_RATE;
const PROGRESS_EPSILON = 0.0001;
const SCROLL_RESPONSE_MS = 48;

function measureViewport(element: HTMLElement): ViewportMetrics {
  const rect = element.getBoundingClientRect();
  const viewportHeight = Math.max(1, window.innerHeight);
  const start = viewportHeight * 0.92;
  const documentTop = window.scrollY + rect.top;
  return {
    startY: documentTop - start,
    runway: Math.max(1, viewportHeight * 0.84 + rect.height),
  };
}

function measuredViewportProgress(metrics: ViewportMetrics) {
  return clamp((window.scrollY - metrics.startY) / metrics.runway);
}

function frameTime(time: number, duration: number) {
  const safeDuration = Math.max(0, duration - 1 / 120);
  return clamp(
    Math.round(time * MASTER_FRAME_RATE) / MASTER_FRAME_RATE,
    0,
    safeDuration,
  );
}

export function ViewportFilm({
  src,
  poster,
  mobileSrc,
  mobilePoster,
  className = "",
  focalPoint = "50% 50%",
  mobileFocalPoint,
  scrubRange = [0, 1],
}: ViewportFilmProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollFrameRef = useRef(0);
  const progressRef = useRef(0);
  const scrollTargetRef = useRef(0);
  const lastScrollFrameTimeRef = useRef(0);
  const targetMediaTimeRef = useRef(0);
  const requestedMediaTimeRef = useRef(Number.NaN);
  const seekInFlightRef = useRef(false);
  const decodedFrameRef = useRef(0);
  const flushVideoSeekRef = useRef<() => void>(() => undefined);
  const [policy, setPolicy] = useState<FilmPolicy>("initializing");
  const [nearViewport, setNearViewport] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [mobileVariant, setMobileVariant] = useState(false);

  const activeSrc = mobileVariant && mobileSrc ? mobileSrc : src;
  const activePoster = mobileVariant && mobilePoster ? mobilePoster : poster;
  const activeFocalPoint = mobileVariant && mobileFocalPoint
    ? mobileFocalPoint
    : focalPoint;

  const requestedStart = clamp(scrubRange[0]);
  const requestedEnd = clamp(scrubRange[1]);
  const requestedLow = Math.min(requestedStart, requestedEnd);
  const requestedHigh = Math.max(requestedStart, requestedEnd);
  const rangeStart = requestedLow === requestedHigh
    ? Math.max(0, requestedLow - 0.01)
    : requestedLow;
  const rangeEnd = requestedLow === requestedHigh
    ? Math.min(1, requestedHigh + 0.01)
    : requestedHigh;
  const allowScrub = policy === "scroll-scrub" && !videoFailed;
  const mountVideo = allowScrub && nearViewport && Boolean(activeSrc);
  const effectivePolicy = videoFailed ? "video-error" : policy;

  const flushVideoSeek = useCallback(() => {
    const film = videoRef.current as VideoWithFrameCallback | null;
    const root = rootRef.current;
    if (
      !film || !root || seekInFlightRef.current || film.seeking ||
      film.readyState < HTMLMediaElement.HAVE_METADATA ||
      !Number.isFinite(film.duration) || film.duration <= 0
    ) return;

    const requestedTime = frameTime(targetMediaTimeRef.current, film.duration);
    const lastRequested = requestedMediaTimeRef.current;
    if (
      Number.isFinite(lastRequested) &&
      Math.abs(lastRequested - requestedTime) < MASTER_FRAME_DURATION * 0.5
    ) return;

    requestedMediaTimeRef.current = requestedTime;
    seekInFlightRef.current = true;
    root.dataset.filmRequestedTime = requestedTime.toFixed(3);
    film.currentTime = requestedTime;

    if (film.requestVideoFrameCallback) {
      decodedFrameRef.current = film.requestVideoFrameCallback(
        (_now, metadata) => {
          decodedFrameRef.current = 0;
          seekInFlightRef.current = false;
          root.dataset.filmRenderedTime = metadata.mediaTime.toFixed(3);
          setVideoReady(true);
          flushVideoSeekRef.current();
        },
      );
    }
  }, []);

  flushVideoSeekRef.current = flushVideoSeek;

  const commitProgress = useCallback((nextProgress: number) => {
    const root = rootRef.current;
    const film = videoRef.current;
    const progress = clamp(nextProgress);
    const timelineProgress = rangeStart + progress * (rangeEnd - rangeStart);
    progressRef.current = progress;

    root?.style.setProperty("--film-scroll-progress", progress.toFixed(5));
    if (root) {
      root.style.setProperty(
        "--film-scroll-y",
        `${((0.5 - progress) * 38).toFixed(2)}px`,
      );
      root.style.setProperty(
        "--film-scroll-scale",
        (1.09 + Math.sin(progress * Math.PI) * 0.035).toFixed(5),
      );
      root.dataset.filmScrollProgress = progress.toFixed(4);
      root.dataset.filmProgress = timelineProgress.toFixed(4);
    }

    if (film && Number.isFinite(film.duration) && film.duration > 0) {
      const safeDuration = Math.max(0, film.duration - 1 / 120);
      const nextTime = timelineProgress * safeDuration;
      targetMediaTimeRef.current = nextTime;
      if (root) root.dataset.filmTime = nextTime.toFixed(3);
      flushVideoSeek();
    }
  }, [flushVideoSeek, rangeEnd, rangeStart]);

  useEffect(() => {
    const mobile = matchMedia("(max-width: 720px)");
    const update = () => setMobileVariant(mobile.matches);
    update();
    mobile.addEventListener("change", update);
    return () => mobile.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const nav = navigator as NavigatorWithSignals;
    const connection = nav.connection;

    const update = () => {
      const slowNetwork = /(^|-)2g$/.test(connection?.effectiveType ?? "");
      let nextPolicy: FilmPolicy = "scroll-scrub";
      if (!activeSrc) nextPolicy = "missing-source";
      else if (reduced.matches) nextPolicy = "reduced-motion";
      else if (connection?.saveData) nextPolicy = "save-data";
      else if (slowNetwork) nextPolicy = "slow-network";
      else if (document.body.dataset.renderQuality === "static") {
        nextPolicy = "static-quality";
      }
      setPolicy(nextPolicy);
    };

    update();
    reduced.addEventListener("change", update);
    connection?.addEventListener("change", update);
    return () => {
      reduced.removeEventListener("change", update);
      connection?.removeEventListener("change", update);
    };
  }, [activeSrc]);

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;
    if (typeof IntersectionObserver === "undefined") {
      setNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setNearViewport(entry.isIntersecting),
      { rootMargin: "140% 0px", threshold: 0 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setVideoFailed(false);
    setVideoReady(false);
    seekInFlightRef.current = false;
    requestedMediaTimeRef.current = Number.NaN;
    targetMediaTimeRef.current = 0;
  }, [activeSrc]);

  useEffect(() => {
    if (!mountVideo) setVideoReady(false);
  }, [mountVideo]);

  useEffect(() => {
    const element = rootRef.current;
    if (!element || !mountVideo) {
      if (!allowScrub) commitProgress(0);
      return;
    }

    let metrics = measureViewport(element);

    const readTarget = () => {
      scrollTargetRef.current = measuredViewportProgress(metrics);
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

      commitProgress(next);
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
      metrics = measureViewport(element);
      schedule();
    };

    readTarget();
    progressRef.current = scrollTargetRef.current;
    commitProgress(progressRef.current);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(measure);
    resizeObserver?.observe(element);
    return () => {
      window.cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = 0;
      lastScrollFrameTimeRef.current = 0;
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      resizeObserver?.disconnect();
    };
  }, [allowScrub, commitProgress, mountVideo]);

  useEffect(() => {
    return () => {
      window.cancelAnimationFrame(scrollFrameRef.current);
      const video = videoRef.current as VideoWithFrameCallback | null;
      if (video && decodedFrameRef.current && video.cancelVideoFrameCallback) {
        video.cancelVideoFrameCallback(decodedFrameRef.current);
      }
      decodedFrameRef.current = 0;
      seekInFlightRef.current = false;
    };
  }, []);

  const style: FilmStyle = {
    "--film-position": activeFocalPoint,
    "--film-scroll-progress": "0",
    "--film-scroll-y": "19px",
    "--film-scroll-scale": "1.09",
  };

  return (
    <div
      ref={rootRef}
      className={`viewport-film ${className}`.trim()}
      style={style}
      aria-hidden="true"
      data-viewport-film="true"
      data-film-mode={mountVideo ? "scroll-scrub" : "poster"}
      data-film-policy={effectivePolicy}
      data-film-mounted={mountVideo ? "true" : "false"}
      data-film-ready={videoReady ? "true" : "false"}
      data-film-variant={mobileVariant && mobileSrc ? "mobile" : "desktop"}
      data-film-range={`${rangeStart.toFixed(3)}:${rangeEnd.toFixed(3)}`}
      data-film-scroll-progress="0.0000"
      data-film-progress={rangeStart.toFixed(4)}
      data-film-time="0.000"
    >
      <img
        src={activePoster}
        alt=""
        width={mobileVariant && mobilePoster ? 720 : 1280}
        height={mobileVariant && mobilePoster ? 1280 : 720}
        loading="lazy"
        fetchPriority="low"
        decoding="async"
      />
      {mountVideo && activeSrc && (
        <video
          key={activeSrc}
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          poster={activePoster}
          width={mobileVariant && mobileSrc ? 720 : 1280}
          height={mobileVariant && mobileSrc ? 1280 : 720}
          tabIndex={-1}
          onLoadedMetadata={(event) => {
            event.currentTarget.pause();
            requestedMediaTimeRef.current = Number.NaN;
            seekInFlightRef.current = false;
            commitProgress(progressRef.current);
          }}
          onLoadedData={(event) => {
            event.currentTarget.pause();
            commitProgress(progressRef.current);
            setVideoReady(true);
          }}
          onSeeked={() => {
            const video = videoRef.current as VideoWithFrameCallback | null;
            if (video && !video.requestVideoFrameCallback) {
              seekInFlightRef.current = false;
              rootRef.current?.setAttribute(
                "data-film-rendered-time",
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
          <source src={activeSrc} type="video/mp4" />
        </video>
      )}
      <span className="viewport-film-grade" />
      <span className="viewport-film-scan" />
    </div>
  );
}

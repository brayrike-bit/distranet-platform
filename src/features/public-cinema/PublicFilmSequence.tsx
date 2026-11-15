"use client";

import Link from "next/link";
import {
  type CSSProperties,
  type MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Mark } from "@/components/Brand";
import type {
  PublicCinemaBeat,
  PublicCinemaChapter,
} from "./types";
import styles from "./PublicFilmSequence.module.css";
import {
  requestPublicFilmFrame,
  subscribePublicFilmFrame,
} from "./publicFilmFrameBus";

type FilmStyle = CSSProperties & Record<`--${string}`, string | number>;

type NavigatorConnection = EventTarget & {
  effectiveType?: string;
  saveData?: boolean;
};

type NavigatorWithConnection = Navigator & {
  connection?: NavigatorConnection;
};

type MotionPolicy = Readonly<{
  checked: boolean;
  allowMotion: boolean;
  reason: "allowed" | "reduced-motion" | "save-data" | "slow-network";
}>;

type PublicFilmSequenceProps = Readonly<{
  routeLabel: string;
  chapters: readonly PublicCinemaChapter[];
}>;

const RED = "#ed1c24";

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : 0));
}

function fragmentId(hash: string) {
  try { return decodeURIComponent(hash.replace(/^#/, "")); }
  catch { return hash.replace(/^#/, ""); }
}

function lerp(from: number, to: number, progress: number) {
  return from + (to - from) * clamp(progress);
}

function smoothStep(from: number, to: number, value: number) {
  if (from === to) return value >= to ? 1 : 0;
  const normalized = clamp((value - from) / (to - from));
  return normalized * normalized * (3 - 2 * normalized);
}

function useMotionPolicy(): MotionPolicy {
  const [policy, setPolicy] = useState<MotionPolicy>({
    checked: false,
    allowMotion: true,
    reason: "allowed",
  });

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as NavigatorWithConnection).connection;

    const update = () => {
      const saveData = Boolean(connection?.saveData);
      const slowNetwork = /(^|-)2g$/.test(connection?.effectiveType ?? "");
      const reduced = reducedMotion.matches;
      setPolicy({
        checked: true,
        allowMotion: !reduced && !saveData && !slowNetwork,
        reason: reduced
          ? "reduced-motion"
          : saveData
            ? "save-data"
            : slowNetwork
              ? "slow-network"
              : "allowed",
      });
    };

    update();
    reducedMotion.addEventListener("change", update);
    connection?.addEventListener("change", update);
    return () => {
      reducedMotion.removeEventListener("change", update);
      connection?.removeEventListener("change", update);
    };
  }, []);

  return policy;
}

function useMobileBreakpoint() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 720px)");
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return mobile;
}

function activeBeat(
  beats: readonly PublicCinemaBeat[],
  progress: number,
) {
  let active = beats[0];
  for (const beat of beats) {
    if (beat.progress > progress) break;
    active = beat;
  }
  return active;
}

function progressWithinBeat(
  beats: readonly PublicCinemaBeat[],
  progress: number,
) {
  if (beats.length === 0) return 0;
  let index = 0;
  for (let beatIndex = 0; beatIndex < beats.length; beatIndex += 1) {
    if (beats[beatIndex].progress > progress) break;
    index = beatIndex;
  }
  const start = beats[index]?.progress ?? 0;
  const end = beats[index + 1]?.progress ?? 1;
  return clamp((progress - start) / Math.max(0.0001, end - start));
}

function FilmFallback({ chapter }: Readonly<{ chapter: PublicCinemaChapter }>) {
  return (
    <div className={styles.fallback} aria-hidden="true">
      <div className={styles.fallbackField}>
        {Array.from({ length: 7 }, (_, index) => (
          <i
            key={index}
            style={{
              "--rail-y": `${20 + index * 9}%`,
              "--rail-opacity": (0.14 + index * 0.025).toFixed(3),
              "--rail-rotate": `${-5 + index * 1.5}deg`,
            } as FilmStyle}
          />
        ))}
      </div>
      <div className={styles.fallbackAperture}>
        <span />
        <span />
        <span />
      </div>
      <div className={styles.fallbackPlaque}>
        <Mark />
        <small>{chapter.label}</small>
      </div>
    </div>
  );
}

function ChapterTitle({
  first,
  id,
  title,
  accent,
}: Readonly<{
  first: boolean;
  id: string;
  title: string;
  accent: string;
}>) {
  const contents = (
    <>
      <span>{title}</span>
      <em>{accent}</em>
    </>
  );

  return first
    ? <h1 id={id}>{contents}</h1>
    : <h2 id={id}>{contents}</h2>;
}

function PublicFilmChapter({
  chapter,
  displayIndex,
  first,
  policy,
  routeLabel,
  useMobile,
}: Readonly<{
  chapter: PublicCinemaChapter;
  displayIndex: string;
  first: boolean;
  policy: MotionPolicy;
  routeLabel: string;
  useMobile: boolean;
}>) {
  const rootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const renderedProgressRef = useRef(0);
  const pendingSeekRef = useRef<number | null>(null);
  const previousFrameTimeRef = useRef(0);
  const metadataReadyRef = useRef(false);
  const seekInFlightRef = useRef(false);
  const lastIssuedSeekTimeRef = useRef(-Infinity);
  const activeBeatIdRef = useRef(chapter.beats[0]?.id);
  const paceFrameRef = useRef(0);
  const anchorFrameRef = useRef(0);
  const [nearViewport, setNearViewport] = useState(first);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const [beat, setBeat] = useState(chapter.beats[0]);
  const [pace, setPace] = useState<"comfort" | "direct">("comfort");
  const variant = useMobile && chapter.mobile ? chapter.mobile : chapter.desktop;

  const posterDelivered = chapter.delivery !== "planned";
  const filmDelivered = chapter.delivery === "plate-ready" ||
    chapter.delivery === "ready";
  const hasSources = variant.sources.some((source) => source.src.trim());
  const scrubEnabled = filmDelivered && hasSources && policy.checked &&
    policy.allowMotion && !videoFailed;
  const shouldMountVideo = scrubEnabled && nearViewport;
  // Reserve the normal runway before hydration. A 100svh placeholder that
  // expands after an anchor click leaves the visitor inside the opening film.
  const motionMode = !policy.checked && filmDelivered && hasSources
    ? "pending" : scrubEnabled ? "scrub" : "static";

  useEffect(() => {
    if (!first || !policy.checked || !location.hash) return;
    anchorFrameRef.current = requestAnimationFrame(() => {
      anchorFrameRef.current = requestAnimationFrame(() => {
        const target = document.getElementById(fragmentId(location.hash));
        target?.scrollIntoView({ behavior: "instant", block: "start" });
      });
    });
    return () => cancelAnimationFrame(anchorFrameRef.current);
  }, [first, policy.checked]);

  useEffect(() => () => {
    cancelAnimationFrame(paceFrameRef.current);
    cancelAnimationFrame(anchorFrameRef.current);
  }, []);

  useEffect(() => {
    metadataReadyRef.current = false;
    seekInFlightRef.current = false;
    pendingSeekRef.current = null;
    lastIssuedSeekTimeRef.current = -Infinity;
    setVideoReady(false);
    setVideoFailed(false);
    setPosterFailed(false);
    requestPublicFilmFrame();
  }, [variant]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") {
      setNearViewport(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setNearViewport(entry.isIntersecting),
      { rootMargin: "125% 0px" },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldMountVideo) {
      metadataReadyRef.current = false;
      seekInFlightRef.current = false;
      pendingSeekRef.current = null;
      setVideoReady(false);
    }
    requestPublicFilmFrame();
  }, [shouldMountVideo]);

  const pauseVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.paused) return;
    video.pause();
  }, []);

  const revealDecodedFrame = useCallback((video: HTMLVideoElement) => {
    if (
      video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
      !Number.isFinite(video.duration) || video.duration <= 0
    ) return;

    const duration = Math.min(chapter.durationSeconds, video.duration);
    const frameDuration = 1 / Math.max(1, chapter.fps);
    const target = Math.round(
      (renderedProgressRef.current * duration) / frameDuration,
    ) * frameDuration;
    if (Math.abs(video.currentTime - target) <= frameDuration * 0.8) {
      setVideoReady(true);
    }
  }, [chapter.durationSeconds, chapter.fps]);

  const queueLatestSeek = useCallback((progress: number, time: number) => {
    const video = videoRef.current;
    if (
      !video || !metadataReadyRef.current ||
      video.readyState < HTMLMediaElement.HAVE_METADATA ||
      !Number.isFinite(video.duration) || video.duration <= 0
    ) return false;

    const duration = Math.min(chapter.durationSeconds, video.duration);
    const frameDuration = 1 / Math.max(1, chapter.fps);
    const maxTime = Math.max(0, duration - frameDuration);
    const rawTarget = clamp(progress, 0, 1) * duration;
    const frameAlignedTarget = clamp(
      Math.round(rawTarget / frameDuration) * frameDuration,
      0,
      maxTime,
    );

    // Always retain the newest target, including while a prior seek is in
    // flight. Decoder completion will wake the shared RAF bus and admit only
    // this latest frame, so stale scroll positions never build a seek queue.
    pendingSeekRef.current = frameAlignedTarget;

    if (seekInFlightRef.current) {
      if (time - lastIssuedSeekTimeRef.current < 320) return true;
      if (video.seeking) return false;
      seekInFlightRef.current = false;
    }
    if (video.seeking) return false;
    if (time - lastIssuedSeekTimeRef.current < 16) return true;

    if (Math.abs(video.currentTime - frameAlignedTarget) <= frameDuration * 0.42) {
      pendingSeekRef.current = null;
      revealDecodedFrame(video);
      return false;
    }

    pendingSeekRef.current = null;
    seekInFlightRef.current = true;
    lastIssuedSeekTimeRef.current = time;
    try {
      video.currentTime = frameAlignedTarget;
    } catch {
      seekInFlightRef.current = false;
    }
    return false;
  }, [chapter.durationSeconds, chapter.fps, revealDecodedFrame]);

  const renderProgress = useCallback((progress: number) => {
    const root = rootRef.current;
    if (!root) return;
    const normalized = clamp(progress);
    const travel = smoothStep(0, 1, normalized);
    const titleTravel = smoothStep(0.08, 0.82, normalized);
    const detailTravel = smoothStep(0.18, 0.88, normalized);
    const beatTravel = progressWithinBeat(chapter.beats, normalized);
    renderedProgressRef.current = normalized;
    root.style.setProperty("--film-progress", normalized.toFixed(5));
    root.style.setProperty("--film-fill", `${(normalized * 100).toFixed(3)}%`);
    root.style.setProperty(
      "--film-copy-y",
      `${lerp(18, -28, travel).toFixed(2)}px`,
    );
    root.style.setProperty(
      "--film-copy-opacity",
      "1",
    );
    root.style.setProperty(
      "--film-scrim-opacity",
      "1",
    );
    root.style.setProperty(
      "--film-copy-y-mobile",
      `${lerp(2, -8, travel).toFixed(2)}px`,
    );
    root.style.setProperty(
      "--film-title-y",
      `${lerp(0, -16, titleTravel).toFixed(2)}px`,
    );
    root.style.setProperty(
      "--film-accent-x",
      `${lerp(0, 18, titleTravel).toFixed(2)}px`,
    );
    root.style.setProperty(
      "--film-eyebrow-x",
      `${lerp(0, -8, titleTravel).toFixed(2)}px`,
    );
    root.style.setProperty(
      "--film-summary-y",
      `${lerp(10, -7, detailTravel).toFixed(2)}px`,
    );
    root.style.setProperty(
      "--film-detail-y",
      `${lerp(15, -5, detailTravel).toFixed(2)}px`,
    );
    root.style.setProperty(
      "--film-media-x",
      "0px",
    );
    root.style.setProperty(
      "--film-scale",
      "1",
    );
    root.style.setProperty(
      "--film-shutter",
      smoothStep(0.015, 0.12, normalized).toFixed(5),
    );
    root.style.setProperty(
      "--film-route-line",
      `${lerp(24, 100, smoothStep(0, 0.22, normalized)).toFixed(2)}%`,
    );
    root.style.setProperty(
      "--film-timeline-y",
      `${lerp(8, -4, travel).toFixed(2)}px`,
    );
    root.style.setProperty("--film-beat-progress", beatTravel.toFixed(5));
    root.style.setProperty(
      "--film-beat-label-y",
      `${lerp(5, -2, smoothStep(0, 0.72, beatTravel)).toFixed(2)}px`,
    );
    root.style.setProperty(
      "--film-head-rotation",
      `${(normalized * 270).toFixed(2)}deg`,
    );
    root.style.setProperty(
      "--film-pulse",
      lerp(0.72, 1, smoothStep(0, 0.34, beatTravel)).toFixed(4),
    );
    root.dataset.progress = normalized.toFixed(4);

    const nextBeat = activeBeat(chapter.beats, normalized);
    if (nextBeat && nextBeat.id !== activeBeatIdRef.current) {
      activeBeatIdRef.current = nextBeat.id;
      setBeat(nextBeat);
    }
  }, [chapter.beats]);

  const updateFrame = useCallback((time: number, pageVisible: boolean) => {
    const root = rootRef.current;
    if (!root) return false;
    if (!pageVisible) {
      pauseVideo();
      root.dataset.active = "false";
      previousFrameTimeRef.current = time;
      pendingSeekRef.current = null;
      return false;
    }
    if (!scrubEnabled) {
      pauseVideo();
      root.dataset.active = "false";
      previousFrameTimeRef.current = time;
      pendingSeekRef.current = null;
      renderProgress(0);
      return false;
    }

    const rect = root.getBoundingClientRect();
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const frameHeight = root.querySelector<HTMLElement>("[data-public-film-frame]")?.offsetHeight ?? viewportHeight;
    const runway = Math.max(1, rect.height - frameHeight);
    const target = clamp(-rect.top / runway);
    const inViewport = rect.bottom > 0 && rect.top < viewportHeight;
    root.dataset.active = inViewport ? "true" : "false";

    if (!inViewport) {
      pauseVideo();
      previousFrameTimeRef.current = time;
      pendingSeekRef.current = null;
      renderProgress(target);
      return false;
    }

    pauseVideo();
    const previousTime = previousFrameTimeRef.current || time;
    const elapsed = Math.min(50, Math.max(0, time - previousTime));
    previousFrameTimeRef.current = time;
    const current = renderedProgressRef.current;
    const alpha = 1 - Math.exp(-elapsed / 80);
    const next = Math.abs(target - current) < 0.00018
      ? target
      : current + (target - current) * alpha;
    renderProgress(next);
    const seekNeedsAnotherFrame = queueLatestSeek(next, time);

    return Math.abs(target - next) > 0.00018 || seekNeedsAnotherFrame;
  }, [pauseVideo, queueLatestSeek, renderProgress, scrubEnabled]);

  useEffect(() => {
    return subscribePublicFilmFrame(updateFrame);
  }, [updateFrame]);

  const style = useMemo(() => ({
    "--film-runway": `${pace === "comfort" ? Math.max(480, chapter.runwayVh, 100 + chapter.durationSeconds * 24) : Math.max(320, 100 + chapter.durationSeconds * 14)}svh`,
    "--film-focal": variant.poster.focalPoint ?? "50% 50%",
    "--film-red": RED,
  }) as FilmStyle, [chapter.runwayVh, chapter.durationSeconds, pace, variant.poster.focalPoint]);

  function changePace(next: "comfort" | "direct") {
    if (next === pace) return;
    const root = rootRef.current;
    const progress = renderedProgressRef.current;
    setPace(next);
    cancelAnimationFrame(paceFrameRef.current);
    paceFrameRef.current = requestAnimationFrame(() => {
      if (!root || progress <= 0) return;
      const frame = root.querySelector<HTMLElement>("[data-public-film-frame]");
      const start = scrollY + root.getBoundingClientRect().top;
      scrollTo({ top: start + progress * Math.max(1, root.offsetHeight - (frame?.offsetHeight ?? innerHeight)), behavior: "instant" });
      requestPublicFilmFrame();
    });
  }

  function jumpToAnchor(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(fragmentId(chapter.href));
    if (!target) return;
    event.preventDefault();
    cancelAnimationFrame(paceFrameRef.current);
    cancelAnimationFrame(anchorFrameRef.current);
    if (location.hash !== chapter.href) history.pushState(history.state, "", chapter.href);
    anchorFrameRef.current = requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "instant", block: "start" });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  }

  return (
    <section
      ref={rootRef}
      id={chapter.id}
      className={styles.chapter}
      style={style}
      data-motion={motionMode}
      data-policy={policy.reason}
      data-delivery={chapter.delivery}
      data-copy-density={chapter.title.length + chapter.accent.length > 50 ? "dense" : "standard"}
      data-video-ready={videoReady}
      aria-labelledby={`${chapter.id}-title`}
    >
      <div className={styles.stickyFrame} data-public-film-frame>
        <div className={styles.media} aria-hidden="true">
          <FilmFallback chapter={chapter} />
          {posterDelivered && !posterFailed ? (
            <img
              className={styles.poster}
              src={variant.poster.src}
              alt=""
              width={variant.poster.width}
              height={variant.poster.height}
              loading={first ? "eager" : "lazy"}
              decoding="async"
              onError={() => setPosterFailed(true)}
            />
          ) : null}
          {shouldMountVideo ? (
            <video
              ref={videoRef}
              className={styles.video}
              muted
              playsInline
              preload={first ? "auto" : "metadata"}
              tabIndex={-1}
              onLoadedMetadata={(event) => {
                event.currentTarget.pause();
                metadataReadyRef.current = true;
                seekInFlightRef.current = false;
                requestPublicFilmFrame();
              }}
              onLoadedData={(event) => {
                revealDecodedFrame(event.currentTarget);
                requestPublicFilmFrame();
              }}
              onSeeking={() => {
                seekInFlightRef.current = true;
              }}
              onSeeked={(event) => {
                seekInFlightRef.current = false;
                revealDecodedFrame(event.currentTarget);
                requestPublicFilmFrame();
              }}
              onError={() => {
                metadataReadyRef.current = false;
                seekInFlightRef.current = false;
                pendingSeekRef.current = null;
                setVideoReady(false);
                setVideoFailed(true);
              }}
            >
              {variant.sources.map((source) => (
                <source key={`${source.src}-${source.type}`} {...source} />
              ))}
            </video>
          ) : null}
          <div className={styles.grade} />
          <div className={styles.scanline} />
        </div>

        <div className={styles.frameCopy}>
          <span className={styles.progressEdge} aria-hidden="true"><i /></span>

          <div className={styles.routeStamp}>
            <span>{routeLabel}</span>
            <span>{displayIndex}</span>
          </div>

          <div className={styles.copyBlock}>
            <p className={styles.eyebrow}>{chapter.eyebrow}</p>
            <ChapterTitle
              first={first}
              id={`${chapter.id}-title`}
              title={chapter.title}
              accent={chapter.accent}
            />
            <p className={styles.summary}>{chapter.summary}</p>
            <ul className={styles.facts} aria-label="Chapter facts">
              {chapter.facts.map((fact) => <li key={fact}>{fact}</li>)}
            </ul>
            {chapter.href.startsWith("#") ? <a className={styles.action} href={chapter.href} onClick={jumpToAnchor}>
              {chapter.action}<span aria-hidden="true">↓</span>
            </a> : <Link className={styles.action} href={chapter.href}>
              {chapter.action}<span aria-hidden="true">↗</span>
            </Link>}
            {motionMode === "scrub" && <div className={styles.paceControls} role="group" aria-label="Film scroll pace">
              <span>Scroll pace</span>
              <button type="button" aria-pressed={pace === "comfort"} onClick={() => changePace("comfort")}>Comfort</button>
              <button type="button" aria-pressed={pace === "direct"} onClick={() => changePace("direct")}>Direct</button>
            </div>}
          </div>

          <div className={styles.timeline} aria-hidden="true">
            <span className={styles.timelineTrack}>
              <i />
              <span className={styles.timelineHead} />
              <span className={styles.beatTicks}>
                {chapter.beats.map((chapterBeat) => (
                  <span
                    key={chapterBeat.id}
                    style={{
                      "--beat-position": `${clamp(chapterBeat.progress) * 100}%`,
                    } as FilmStyle}
                  />
                ))}
              </span>
            </span>
            <small className={styles.beatLabel}>{beat?.label ?? chapter.label}</small>
            <b>{displayIndex}</b>
          </div>

          <p className={styles.motionNote}>
            {motionMode === "scrub"
              ? "SCROLL CONTROLS THE FILM"
              : policy.reason === "reduced-motion"
                ? "REDUCED MOTION / KEY FRAME"
                : "CONNECTED INDUSTRIAL INTELLIGENCE"}
          </p>
        </div>
      </div>

      <div className={styles.accessibleNarration}>
        <p>{chapter.label}. {chapter.summary}</p>
        <ol>
          {chapter.beats.map((chapterBeat) => (
            <li key={chapterBeat.id}>{chapterBeat.label}: {chapterBeat.description}</li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function PublicFilmSequence({
  routeLabel,
  chapters,
}: PublicFilmSequenceProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeChapter, setActiveChapter] = useState(chapters[0]?.id ?? "");
  const policy = useMotionPolicy();
  const useMobile = useMobileBreakpoint();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActiveChapter(visible.target.id);
    }, { rootMargin: "-38% 0px -38% 0px", threshold: [0, 0.1, 0.5, 1] });
    chapters.forEach((chapter) => {
      const element = document.getElementById(chapter.id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [chapters]);

  return (
    <div ref={rootRef} className={styles.sequence}>
      <nav className={styles.chapterRail} aria-label={`${routeLabel} chapters`}>
        <span>{routeLabel}</span>
        <ol>
          {chapters.map((chapter, index) => (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                aria-label={`Go to ${chapter.label}`}
                aria-current={activeChapter === chapter.id ? "step" : undefined}
              >
                <i />
                <b>{String(index + 1).padStart(2, "0")}</b>
              </a>
            </li>
          ))}
        </ol>
      </nav>
      {chapters.map((chapter, index) => (
        <PublicFilmChapter
          key={chapter.id}
          chapter={chapter}
          displayIndex={`${String(index + 1).padStart(2, "0")} / ${String(chapters.length).padStart(2, "0")}`}
          first={index === 0}
          policy={policy}
          routeLabel={routeLabel}
          useMobile={useMobile}
        />
      ))}
    </div>
  );
}

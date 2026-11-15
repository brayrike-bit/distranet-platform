"use client";

import type { CSSProperties, RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Arrow } from "@/components/Brand";
import { PublicFooter } from "@/components/PublicFooter";
import { ScrollScrubFilm } from "@/components/cinematic/ScrollScrubFilm";
import {
  type CinematicFilmAsset,
  distranetCinematicMedia,
} from "@/components/cinematic/mediaManifest";
import {
  type HomeChapter,
  type HomeChapterId,
  homeChapters,
} from "./home-media";
import styles from "./home-cinematic.module.css";

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function setProgress(element: HTMLElement, progress: number) {
  const focus = clamp(0.16 + Math.sin(progress * Math.PI) * 0.84);
  element.style.setProperty("--chapter-progress", progress.toFixed(5));
  element.style.setProperty("--chapter-focus", focus.toFixed(5));
  element.style.setProperty(
    "--chapter-copy-y",
    `${((progress - 0.5) * -72).toFixed(2)}px`,
  );
  element.style.setProperty(
    "--chapter-scale",
    (1.08 + focus * 0.08).toFixed(5),
  );
  element.style.setProperty(
    "--chapter-orbit",
    `${(progress * 210).toFixed(3)}deg`,
  );
  element.style.setProperty(
    "--chapter-orbit-reverse",
    `${(progress * -210).toFixed(3)}deg`,
  );
  element.style.setProperty("--chapter-line", (1 - progress).toFixed(5));
  element.style.setProperty(
    "--chapter-progress-pct",
    `${(progress * 100).toFixed(3)}%`,
  );
  element.style.setProperty(
    "--chapter-reflection-x",
    `${((progress - 0.5) * 34).toFixed(3)}vw`,
  );
  element.style.setProperty(
    "--chapter-reflection-y",
    `${(Math.sin(progress * Math.PI) * -3.5).toFixed(3)}vh`,
  );
  element.dataset.active = focus > 0.56 ? "true" : "false";
}

function useHomeChapterRail(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const chapters = Array.from(
      root.querySelectorAll<HTMLElement>("[data-cinematic-film][id]"),
    );
    const links = Array.from(
      root.querySelectorAll<HTMLAnchorElement>("[data-home-rail-link]"),
    );
    const activate = (activeId: string) => {
      root.dataset.activeChapter = activeId;
      links.forEach((link) => {
        const active = link.dataset.chapterTarget === activeId;
        link.dataset.active = active ? "true" : "false";
        if (active) link.setAttribute("aria-current", "step");
        else link.removeAttribute("aria-current");
      });
    };

    const chooseCenteredChapter = () => {
      const center = innerHeight * 0.5;
      const active = chapters.find((chapter) => {
        const rect = chapter.getBoundingClientRect();
        return rect.top <= center && rect.bottom >= center;
      });
      activate(active?.id ?? chapters[0]?.id ?? "ignition");
    };

    if (typeof IntersectionObserver === "undefined") {
      chooseCenteredChapter();
      return;
    }

    const observer = new IntersectionObserver(chooseCenteredChapter, {
      rootMargin: "-47% 0px -47% 0px",
      threshold: 0,
    });
    chapters.forEach((chapter) => observer.observe(chapter));
    chooseCenteredChapter();

    return () => {
      observer.disconnect();
    };
  }, [rootRef]);
}

function IgnitionInstrument() {
  return (
    <div className={styles.ignitionInstrument} aria-hidden="true">
      <div className={styles.ignitionOrbit}>
        <i />
        <i />
        <i />
      </div>
      <div className={styles.ignitionCore}>
        <i />
        <i />
      </div>
      <span>21</span>
      <small>MEMBER SIGNALS / ONLINE</small>
    </div>
  );
}

function LeverageInstrument() {
  return (
    <div className={styles.leverageInstrument} aria-hidden="true">
      <div className={styles.memberInputs}>
        {Array.from({ length: 21 }, (_, index) => <i key={index} />)}
      </div>
      <svg viewBox="0 0 520 280" preserveAspectRatio="none">
        {Array.from(
          { length: 7 },
          (_, index) => (
            <path
              key={index}
              d={`M0 ${22 + index * 39} C180 ${
                22 + index * 39
              }, 250 140, 500 140`}
            />
          ),
        )}
      </svg>
      <div className={styles.buyingCore}>
        <small>COMBINED</small>
        <b>1</b>
        <span>BUYING POSITION</span>
      </div>
    </div>
  );
}

function NetworkInstrument() {
  return (
    <div className={styles.networkInstrument} aria-hidden="true">
      <svg viewBox="0 0 900 480">
        <path
          className={styles.continent}
          d="M83 87 190 50l76 21 64-19 103 21 96 62 71 8 34 55-55 26-36 85-85 23-56 60-87-10-44-57-96-23-34-59-76-49 36-54Z"
        />
        <path
          className={styles.route}
          pathLength="1"
          d="M167 223C255 160 331 213 416 191s125-50 228-12"
        />
        <path
          className={styles.route}
          pathLength="1"
          d="M218 116c94 74 143 124 211 138s113 18 191 88"
        />
        <path
          className={styles.route}
          pathLength="1"
          d="M193 326c94-53 156-36 227-81s132-91 231-91"
        />
        {[
          "167,223",
          "218,116",
          "193,326",
          "416,191",
          "429,254",
          "644,179",
          "620,342",
          "651,154",
        ].map((point) => {
          const [cx, cy] = point.split(",");
          return <circle key={point} cx={cx} cy={cy} r="7" />;
        })}
      </svg>
      <div className={styles.networkReadout}>
        <span>
          <i /> DEMAND
        </span>
        <span>
          <i /> IN STOCK
        </span>
        <span>
          <i /> ROUTED
        </span>
      </div>
    </div>
  );
}

function CommerceInstrument() {
  const steps = ["Demand", "Matched", "Routed", "Fulfilled", "Measured"];
  return (
    <div className={styles.commerceInstrument} aria-hidden="true">
      <div className={styles.orderPulse}>
        <span>PG</span>
        <small>ORDER SIGNAL</small>
      </div>
      <svg viewBox="0 0 820 360" preserveAspectRatio="none">
        <path pathLength="1" d="M90 180C250 180 278 75 480 75H790" />
        <path pathLength="1" d="M90 180H790" />
        <path pathLength="1" d="M90 180c160 0 188 105 390 105h310" />
      </svg>
      <div className={styles.fulfillmentOutputs}>
        <span>MEMBER A</span>
        <span>MEMBER B</span>
        <span>MEMBER C</span>
      </div>
      <div className={styles.commerceSteps}>
        {steps.map((step, index) => (
          <span key={step}>
            <b>0{index + 1}</b>
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}

function IntelligenceInstrument() {
  return (
    <div className={styles.intelligenceInstrument} aria-hidden="true">
      <div className={styles.osTopline}>
        <span>AIR HYDRO POWER</span>
        <b>POWERED BY DISTRANET</b>
        <i>PRIVATE</i>
      </div>
      <div className={styles.osStatement}>
        <small>MEMBER OPERATING PORTRAIT</small>
        <strong>
          Value created.<br />Clearly attributed.
        </strong>
      </div>
      <div className={styles.osSignals}>
        <span>
          <small>COMMERCE</small>
          <b>Demand</b>
        </span>
        <span>
          <small>OPERATIONS</small>
          <b>Fulfillment</b>
        </span>
        <span>
          <small>FINANCE</small>
          <b>Proceeds</b>
        </span>
        <span>
          <small>NETWORK</small>
          <b>Benchmark</b>
        </span>
      </div>
      <svg viewBox="0 0 800 150" preserveAspectRatio="none">
        <path
          pathLength="1"
          d="M0 130C88 123 122 83 194 102s112-55 184-31 125-51 192-19 122-28 230-42"
        />
      </svg>
      <div className={styles.privacyLine}>
        AGGREGATE MEMBER DATA · NO CUSTOMER IDENTITIES
      </div>
    </div>
  );
}

function ChapterInstrument({ id }: { id: HomeChapterId }) {
  if (id === "ignition") return <IgnitionInstrument />;
  if (id === "leverage") return <LeverageInstrument />;
  if (id === "network") return <NetworkInstrument />;
  if (id === "commerce") return <CommerceInstrument />;
  return <IntelligenceInstrument />;
}

type BeatPositionStyle = CSSProperties & { "--beat-position": string };

function FilmTimeline({
  asset,
  activeBeatId,
}: {
  asset: CinematicFilmAsset;
  activeBeatId: string;
}) {
  return (
    <div className={styles.filmTimeline} aria-hidden="true">
      <div className={styles.timelineMeta}>
        <span>SCROLL-OWNED FILM</span>
        <b>{asset.durationSeconds.toFixed(0)} SEC / {asset.beats.length} BEATS</b>
      </div>
      <div className={styles.timelineTrack}>
        <i />
        {asset.beats.map((beat, index) => (
          <span
            key={beat.id}
            className={styles.timelineBeat}
            data-active={beat.id === activeBeatId ? "true" : "false"}
            style={{
              "--beat-position": `${(beat.progress * 100).toFixed(3)}%`,
            } as BeatPositionStyle}
          >
            <small>{String(index + 1).padStart(2, "0")}</small>
            <b>{beat.label}</b>
          </span>
        ))}
      </div>
    </div>
  );
}

function Chapter({ chapter, first }: { chapter: HomeChapter; first: boolean }) {
  const Heading = first ? "h1" : "h2";
  const compositionRef = useRef<HTMLDivElement>(null);
  const asset = distranetCinematicMedia[chapter.media.asset];
  const [activeBeatId, setActiveBeatId] = useState(asset.beats[0]?.id ?? "");

  return (
    <ScrollScrubFilm
      id={chapter.id}
      asset={asset}
      className={`${styles.chapter} ${styles[chapter.id]}`}
      frameClassName={styles.stickyStage}
      mediaClassName={styles.mediaWorld}
      ariaLabelledBy={`${chapter.id}-title`}
      scrollSpanVh={225}
      focalPoint={chapter.media.focalPoint}
      priority={first}
      decorative
      onProgressChange={(progress) => {
        if (compositionRef.current) {
          setProgress(compositionRef.current, progress);
        }
      }}
      onBeatChange={(beat) => {
        setActiveBeatId((current) => current === beat.id ? current : beat.id);
      }}
    >
      <div
        ref={compositionRef}
        className={styles.chapterComposition}
        data-media-slot={chapter.media.slot}
        data-baked-copy={chapter.media.bakedCopy}
      >
        <div className={styles.compositionStage}>
          <div className={styles.passiveLayer}>
            <div className={styles.sceneGrid} aria-hidden="true" />
            <span className={styles.mediaReflection} aria-hidden="true" />
          </div>

          <div className={styles.passiveLayer}>
            <div className={styles.sceneGrade} aria-hidden="true" />
            <span className={styles.mediaAperture} aria-hidden="true" />
            <span className={styles.mediaGrain} aria-hidden="true" />
          </div>

          <div className={`${styles.passiveLayer} ${styles.instrumentLayer}`}>
            <ChapterInstrument id={chapter.id} />
          </div>

          <div className={styles.contentLayer}>
            <div className={styles.chapterMeta} aria-hidden="true">
              <span>{chapter.index}</span>
              <i />
              <span>{chapter.label}</span>
            </div>

            <div className={styles.copy}>
              <p className={styles.eyebrow}>
                <i />
                {chapter.eyebrow}
              </p>
              <Heading id={`${chapter.id}-title`}>
                {chapter.title}
                <br />
                {" "}
                <em>{chapter.accent}</em>
              </Heading>
              <p className={styles.summary}>{chapter.summary}</p>
              <div className={styles.proof}>
                <span>
                  <b>01</b>
                  {chapter.proof[0]}
                </span>
                <span>
                  <b>02</b>
                  {chapter.proof[1]}
                </span>
              </div>
              <Link className={styles.action} href={chapter.href}>
                <span>{chapter.action}</span>
                <Arrow />
              </Link>
            </div>

            <p className={styles.mediaTranscript}>{chapter.media.bakedCopy}</p>
            <FilmTimeline asset={asset} activeBeatId={activeBeatId} />
          </div>
        </div>
      </div>
    </ScrollScrubFilm>
  );
}

export function HomeCinematicExperience() {
  const rootRef = useRef<HTMLElement>(null);
  useHomeChapterRail(rootRef);

  return (
    <main id="main-content" className={styles.root} ref={rootRef} tabIndex={-1}>
      <nav className={styles.chapterRail} aria-label="Homepage chapters">
        {homeChapters.map((chapter) => (
          <a
            key={chapter.id}
            className={styles.railLink}
            href={`#${chapter.id}`}
            data-home-rail-link
            data-chapter-target={chapter.id}
            aria-label={`Go to ${chapter.label}`}
          >
            <i />
            <span>{chapter.index.slice(0, 2)}</span>
          </a>
        ))}
      </nav>

      {homeChapters.map((chapter, index) => (
        <Chapter key={chapter.id} chapter={chapter} first={index === 0} />
      ))}

      <PublicFooter />
    </main>
  );
}

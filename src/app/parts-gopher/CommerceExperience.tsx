"use client";

import Link from "next/link";
import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./page.module.css";
import { distranetCinematicMedia, RouteFilmHero } from "@/components/cinematic";
import { PublicFooter } from "@/components/PublicFooter";
import { ViewportFilm } from "@/components/ViewportFilm";

const steps = [
  {
    number: "01",
    label: "Search",
    title: "Intent becomes a signal.",
    copy:
      "A buyer searches the Parker-only storefront by part number, attribute, or application. Parts Gopher translates that intent into structured demand the network can act on.",
    metric: "QUERY 4Z-ALPHA",
    status: "SPEC MATCHED",
  },
  {
    number: "02",
    label: "Order",
    title: "A cart becomes a commitment.",
    copy:
      "Product fit, availability, pricing, and delivery expectations resolve into one clear checkout—without exposing the complexity behind the network.",
    metric: "ORDER PG-08421",
    status: "PAYMENT VERIFIED",
  },
  {
    number: "03",
    label: "Route",
    title: "The network finds the right path.",
    copy:
      "Customer geography is evaluated against shared inventory. Each order line or allocated portion routes to the closest member with stock, so one checkout may create multiple member fulfillment groups.",
    metric: "7 STOCK PATHS",
    status: "LINES ALLOCATED",
  },
  {
    number: "04",
    label: "Fulfill",
    title: "Digital demand becomes physical motion.",
    copy:
      "Each assigned member is seller of record for its fulfillment portion, then picks, verifies, packs, and ships while status events return to Parts Gopher.",
    metric: "PICK 00:08:42",
    status: "CARRIER SCANNED",
  },
  {
    number: "05",
    label: "Report",
    title: "Every outcome returns as intelligence.",
    copy:
      "Attributed sales, product demand, coarse geography, allocations, and proceeds resolve into a company-specific aggregate view—without exposing customer identities.",
    metric: "VALUE ATTRIBUTED",
    status: "MEMBER VISIBLE",
  },
] as const;

// Illustrative route candidates only; distances and stock values are not live records.
const memberNodes = [
  {
    name: "Air Hydro Power",
    code: "AHP",
    x: 27,
    y: 62,
    distance: "18 mi",
    stock: "12 units",
  },
  {
    name: "Hydradyne",
    code: "HYD",
    x: 58,
    y: 72,
    distance: "244 mi",
    stock: "8 units",
  },
  {
    name: "RG Group",
    code: "RGG",
    x: 72,
    y: 38,
    distance: "396 mi",
    stock: "23 units",
  },
  {
    name: "Triad Technologies",
    code: "TRI",
    x: 43,
    y: 30,
    distance: "133 mi",
    stock: "6 units",
  },
  {
    name: "Wilson Company",
    code: "WCO",
    x: 81,
    y: 66,
    distance: "522 mi",
    stock: "17 units",
  },
  {
    name: "Hyspeco",
    code: "HYS",
    x: 16,
    y: 32,
    distance: "641 mi",
    stock: "4 units",
  },
] as const;

const searchParts = [
  {
    id: "flange",
    shortLabel: "Flange",
    query: "4Z-ALPHA hydraulic flange",
    code: "4Z-ALPHA",
    family: "SAE split flange · code 61",
    confidence: "99.8",
    measures: ["Ø 47.6", "M10 × 1.5"],
    checks: [
      ["Exact part match", "Confidence 99.8%"],
      ["Attribute verification", "6 specifications"],
      ["Network availability", "7 inventory signals"],
    ],
  },
  {
    id: "coupler",
    shortLabel: "Coupler",
    query: "HCS-10 quick disconnect coupler",
    code: "HCS-10",
    family: "Hydraulic quick disconnect · ISO A",
    confidence: "97.4",
    measures: ["Ø 38.1", "1/2 IN NPT"],
    checks: [
      ["Family resolved", "ISO A profile"],
      ["Connection verified", "1/2 inch NPT"],
      ["Network availability", "11 inventory signals"],
    ],
  },
  {
    id: "valve",
    shortLabel: "Valve",
    query: "PV-22 inline pressure valve",
    code: "PV-22",
    family: "Inline pressure control · steel body",
    confidence: "94.6",
    measures: ["0–3000 PSI", "G 1/2 PORT"],
    checks: [
      ["Application resolved", "Pressure control"],
      ["Range verified", "0–3000 PSI"],
      ["Network availability", "5 inventory signals"],
    ],
  },
] as const;

const intelligenceSignals = [
  {
    id: "sales",
    label: "Attributed sales",
    value: "$1.84M",
    detail: "Approved order value",
  },
  {
    id: "orders",
    label: "Orders",
    value: "1,246",
    detail: "Allocated transactions",
  },
  {
    id: "margin",
    label: "Margin share",
    value: "$276K",
    detail: "50% gross-margin split",
  },
  {
    id: "product",
    label: "Product demand",
    value: "4Z-ALPHA",
    detail: "Aggregate item signal",
  },
] as const;

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3 10h13M11 5l5 5-5 5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </svg>
  );
}

function Logo() {
  return (
    <span className={styles.logo} aria-label="Distranet Parts Gopher">
      <svg viewBox="0 0 42 42" aria-hidden="true">
        <path d="M7 7 21 21 35 7M7 35 21 21l14 14" />
        <circle cx="7" cy="7" r="3" />
        <circle cx="35" cy="7" r="3" />
        <circle cx="21" cy="21" r="4" />
        <circle cx="7" cy="35" r="3" />
        <circle cx="35" cy="35" r="3" />
      </svg>
      <span className={styles.logoWords}>
        <b>PARTS GOPHER</b>
        <small>BY DISTRANET</small>
      </span>
    </span>
  );
}

function SectionIndex(
  { number, children }: { number: string; children: React.ReactNode },
) {
  return (
    <p className={styles.sectionIndex}>
      <span>{number}</span>
      {children}
    </p>
  );
}

export function CommerceExperience() {
  const pageRef = useRef<HTMLElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [activeMember, setActiveMember] = useState(0);
  const [activePart, setActivePart] = useState(0);
  const [activeIntelligenceSignal, setActiveIntelligenceSignal] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const scenes = Array.from(
      page.querySelectorAll<HTMLElement>("[data-commerce-scene]"),
    );

    let scrollFrame = 0;
    let intelligenceStage = -1;

    type SceneMetric = Readonly<{ top: number; height: number }>;
    type ScenePaintCache = {
      styles: Record<string, string>;
      sceneState?: "active" | "idle";
      intelligenceStage?: string;
      nearby?: boolean;
    };

    const sceneMetrics = new Map<HTMLElement, SceneMetric>();
    const scenePaintCache = new WeakMap<HTMLElement, ScenePaintCache>();

    const clamp = (value: number, min = 0, max = 1) =>
      Math.min(max, Math.max(min, value));

    const cacheFor = (scene: HTMLElement) => {
      let cache = scenePaintCache.get(scene);
      if (!cache) {
        cache = { styles: {} };
        scenePaintCache.set(scene, cache);
      }
      return cache;
    };

    const writeSceneStyle = (
      scene: HTMLElement,
      name: string,
      value: string,
    ) => {
      const cache = cacheFor(scene);
      if (cache.styles[name] === value) return;
      cache.styles[name] = value;
      scene.style.setProperty(name, value);
    };

    const writeSceneState = (
      scene: HTMLElement,
      state: "active" | "idle",
    ) => {
      const cache = cacheFor(scene);
      if (cache.sceneState === state) return;
      cache.sceneState = state;
      scene.dataset.sceneState = state;
    };

    const measureScene = (scene: HTMLElement) => {
      const rect = scene.getBoundingClientRect();
      const metric = {
        top: window.scrollY + rect.top,
        height: rect.height,
      } satisfies SceneMetric;
      sceneMetrics.set(scene, metric);
      return metric;
    };

    const measureScenes = () => {
      scenes.forEach(measureScene);
    };

    const paintScene = (
      scene: HTMLElement,
      metric: SceneMetric,
      viewportHeight: number,
      scrollY: number,
    ) => {
      const top = metric.top - scrollY;
      const bottom = top + metric.height;
      const progress = clamp(
        (viewportHeight - top) /
          Math.max(1, viewportHeight + metric.height),
      );
      const enter = clamp(
        (viewportHeight - top) / Math.max(1, viewportHeight * 0.72),
      );
      const exit = clamp(-top / Math.max(1, metric.height * 0.72));

      writeSceneStyle(scene, "--scene-progress", progress.toFixed(4));
      writeSceneStyle(scene, "--scene-enter", enter.toFixed(4));
      writeSceneStyle(scene, "--scene-exit", exit.toFixed(4));
      writeSceneStyle(
        scene,
        "--scene-shift",
        `${((0.5 - progress) * 54).toFixed(2)}px`,
      );
      writeSceneStyle(
        scene,
        "--scene-scale",
        (0.972 + progress * 0.048).toFixed(4),
      );
      writeSceneStyle(
        scene,
        "--scene-light",
        (0.18 + progress * 0.82).toFixed(4),
      );
      writeSceneState(
        scene,
        bottom > -120 && top < viewportHeight + 120 ? "active" : "idle",
      );

      if (scene.hasAttribute("data-intelligence-scene")) {
        const nextStage = Math.min(
          3,
          Math.floor(clamp((progress - 0.14) / 0.7) * 4),
        );
        const nextStageValue = String(nextStage);
        const cache = cacheFor(scene);
        if (cache.intelligenceStage !== nextStageValue) {
          cache.intelligenceStage = nextStageValue;
          scene.dataset.intelligenceStage = nextStageValue;
        }
        if (nextStage !== intelligenceStage) {
          intelligenceStage = nextStage;
          setActiveIntelligenceSignal(nextStage);
        }
      }
    };

    const paintStaticScenes = () => {
      scenes.forEach((scene) => {
        const cache = cacheFor(scene);
        cache.nearby = false;
        writeSceneStyle(scene, "--scene-progress", ".5");
        writeSceneStyle(scene, "--scene-enter", "1");
        writeSceneStyle(scene, "--scene-exit", "0");
        writeSceneStyle(scene, "--scene-shift", "0px");
        writeSceneStyle(scene, "--scene-scale", "1");
        writeSceneStyle(scene, "--scene-light", ".5");
        writeSceneState(scene, "idle");
      });
    };

    const paintScenes = () => {
      scrollFrame = 0;
      if (reducedMotionQuery.matches) return;

      const viewportHeight = Math.max(1, window.innerHeight);
      const scrollY = window.scrollY;
      const nearbyBuffer = viewportHeight * 0.85;

      scenes.forEach((scene) => {
        const metric = sceneMetrics.get(scene) ?? measureScene(scene);
        const top = metric.top - scrollY;
        const bottom = top + metric.height;
        const nearby = bottom > -nearbyBuffer &&
          top < viewportHeight + nearbyBuffer;
        const cache = cacheFor(scene);
        const proximityChanged = cache.nearby !== nearby;
        cache.nearby = nearby;

        // Paint nearby scenes continuously and write a terminal frame once as
        // a scene leaves the work set. Fully off-screen scenes do no DOM work.
        if (nearby || proximityChanged) {
          paintScene(scene, metric, viewportHeight, scrollY);
        }
      });
    };

    const scheduleScenes = () => {
      if (reducedMotionQuery.matches || scrollFrame) return;
      scrollFrame = requestAnimationFrame(paintScenes);
    };

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "true");
          }
        });
      },
      { threshold: 0.16 },
    );

    page.querySelectorAll("[data-reveal]").forEach((node) =>
      revealObserver.observe(node)
    );
    const handleGeometryChange = () => {
      measureScenes();
      scheduleScenes();
    };

    const sceneResizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver((entries) => {
        if (entries.some((entry) => entry.target === page)) {
          measureScenes();
        } else {
          entries.forEach((entry) => measureScene(entry.target as HTMLElement));
        }
        scheduleScenes();
      });
    sceneResizeObserver?.observe(page);
    scenes.forEach((scene) => sceneResizeObserver?.observe(scene));

    const updateSceneMotionBinding = () => {
      window.removeEventListener("scroll", scheduleScenes);
      cancelAnimationFrame(scrollFrame);
      scrollFrame = 0;

      if (reducedMotionQuery.matches) {
        paintStaticScenes();
        return;
      }

      intelligenceStage = -1;
      measureScenes();
      paintScenes();
      window.addEventListener("scroll", scheduleScenes, { passive: true });
    };

    measureScenes();
    updateSceneMotionBinding();
    reducedMotionQuery.addEventListener("change", updateSceneMotionBinding);
    window.addEventListener("load", handleGeometryChange, { passive: true });
    window.addEventListener("resize", handleGeometryChange, { passive: true });

    return () => {
      cancelAnimationFrame(scrollFrame);
      revealObserver.disconnect();
      sceneResizeObserver?.disconnect();
      window.removeEventListener("scroll", scheduleScenes);
      window.removeEventListener("load", handleGeometryChange);
      window.removeEventListener("resize", handleGeometryChange);
      reducedMotionQuery.removeEventListener("change", updateSceneMotionBinding);
    };
  }, []);

  useEffect(() => {
    const chapters = Array.from(
      document.querySelectorAll<HTMLElement>("[data-journey-step]"),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          setActiveStep(
            Number((visible.target as HTMLElement).dataset.journeyStep),
          );
        }
      },
      { rootMargin: "-28% 0px -28% 0px", threshold: [0.1, 0.35, 0.6] },
    );
    chapters.forEach((chapter) => observer.observe(chapter));
    return () => observer.disconnect();
  }, []);

  const selectedMember = memberNodes[activeMember];
  const selectedPart = searchParts[activePart];

  const handlePartKeys = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = (index + 1) % searchParts.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = (index - 1 + searchParts.length) % searchParts.length;
    } else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = searchParts.length - 1;
    else return;
    event.preventDefault();
    setActivePart(next);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
      "button",
    )[next]?.focus();
  };

  const handleMemberKeys = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = (index + 1) % memberNodes.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = (index - 1 + memberNodes.length) % memberNodes.length;
    } else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = memberNodes.length - 1;
    else return;
    event.preventDefault();
    setActiveMember(next);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
      "button",
    )[next]?.focus();
  };

  return (
    <main className={styles.page} ref={pageRef} id="main-content" tabIndex={-1}>
      <header className={styles.header} style={{ display: "none" }}>
        <Link href="/" className={styles.brandLink} aria-label="Distranet home">
          <Logo />
        </Link>
        <nav
          className={menuOpen ? styles.navOpen : ""}
          aria-label="Parts Gopher navigation"
        >
          <a
            href="#journey"
            onClick={() =>
              setMenuOpen(false)}
          >
            How it works
          </a>
          <a
            href="#routing"
            onClick={() =>
              setMenuOpen(false)}
          >
            The network
          </a>
          <a
            href="#intelligence"
            onClick={() =>
              setMenuOpen(false)}
          >
            Intelligence
          </a>
          <Link
            href="/"
            onClick={() =>
              setMenuOpen(false)}
          >
            Distranet
          </Link>
        </nav>
        <div className={styles.headerActions}>
          <Link href="/member-access" className={styles.portalLink}>
            Hub prototype <ArrowIcon />
          </Link>
          <button
            type="button"
            className={styles.menuButton}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <div data-commerce-scene>
        <RouteFilmHero
          route="parts-gopher"
          asset={distranetCinematicMedia.partsGopherOrderOpportunity}
          titleId="parts-gopher-title"
          eyebrow="The commerce engine of Distranet"
          title={
            <>
              Every part has<br />{" "}<em>a path.</em>
            </>
          }
          description="Parts Gopher turns digital demand into a coordinated member opportunity—searching, routing, fulfilling, and reporting every order across one connected network."
          facts={[
            "Closest in-stock match",
            "Multiple member sellers",
            "50 / 50 gross-margin split",
          ]}
          actions={
            <>
              <a href="#journey">
                Follow an order <ArrowIcon />
              </a>
              <Link href="/member-access">
                Preview the member view <ArrowIcon />
              </Link>
            </>
          }
        />
      </div>

      <section
        className={styles.manifesto}
        data-reveal
        data-commerce-scene
      >
        <SectionIndex number="00">A different kind of storefront</SectionIndex>
        <div className={styles.manifestoGrid}>
          <h2>
            One simple order.<br />{" "}
            <em>An entire network in motion.</em>
          </h2>
          <div>
            <p>
              The customer sees clarity. Behind that clarity, Parts Gopher
              coordinates product data, inventory, member capability,
              fulfillment, and accountable economics.
            </p>
            <div className={styles.manifestoStats}>
              <span>
                <b>01</b> storefront
              </span>
              <span>
                <b>21</b> member companies*
              </span>
              <span>
                <b>05</b> connected stages
              </span>
            </div>
            <small>
              *Current company count confirmed by Distranet leadership after
              member consolidation.
            </small>
          </div>
        </div>
      </section>

      <section
        className={styles.searchLab}
        id="intent"
        aria-labelledby="search-lab-title"
        data-commerce-scene
      >
        <div className={styles.searchLabCopy} data-reveal>
          <SectionIndex number="01">Intent engine</SectionIndex>
          <h2 id="search-lab-title">
            Find the signal<br />{" "}inside the search.
          </h2>
          <p>
            A part number is only the beginning. The storefront resolves
            technical intent, product fit, availability, and confidence before a
            buyer commits.
          </p>
          <div className={styles.specList} aria-live="polite">
            {selectedPart.checks.map(([label, value], index) => (
              <span key={label}>
                <i>{String(index + 1).padStart(2, "0")}</i>
                <b>{label}</b>
                <small>{value}</small>
              </span>
            ))}
          </div>
        </div>

        <div
          className={styles.searchInstrument}
          data-reveal
          data-product={selectedPart.id}
        >
          <div className={styles.instrumentTop}>
            <span>PARTS GOPHER / SEARCH INSTRUMENT</span>
            <i>INTERACTIVE PROTOTYPE</i>
          </div>
          <div className={styles.queryBar}>
            <SearchIcon />
            <span>{selectedPart.query}</span>
            <kbd>↵</kbd>
          </div>
          <div
            className={styles.partPresets}
            role="tablist"
            aria-label="Sample product searches"
          >
            {searchParts.map((part, index) => (
              <button
                type="button"
                role="tab"
                id={`part-tab-${part.id}`}
                aria-controls="part-panel"
                aria-selected={activePart === index}
                tabIndex={activePart === index ? 0 : -1}
                key={part.id}
                onClick={() => setActivePart(index)}
                onKeyDown={(event) => handlePartKeys(event, index)}
              >
                <span>0{index + 1}</span>
                {part.shortLabel}
                <i />
              </button>
            ))}
          </div>
          <div
            key={selectedPart.id}
            className={styles.productStage}
            data-product={selectedPart.id}
            aria-hidden="true"
          >
            <ViewportFilm
              src="/media/cinematic/parts-gopher/split-fulfillment/master-16x9-v1.mp4"
              poster="/media/distranet-original/precision-components-v1.webp"
              className={styles.intentFilm}
              focalPoint="50% 58%"
              scrubRange={[0, 0.38]}
            />
            <div className={styles.intentFilmReadout}>
              <span>ILLUSTRATIVE PRODUCT SIGNAL</span>
              <strong>{selectedPart.code}</strong>
              <small>{selectedPart.family}</small>
            </div>
            <div className={styles.intentFilmBadge}>
              <i /> DISTRANET STUDY / PRODUCT DETAIL
            </div>
            <div className={styles.scanPlane} />
          </div>
          <div
            className={styles.productMeta}
            id="part-panel"
            role="tabpanel"
            aria-labelledby={`part-tab-${selectedPart.id}`}
            tabIndex={0}
          >
            <div>
              <small>RESULT / 001</small>
              <strong>{selectedPart.code}</strong>
              <span>{selectedPart.family}</span>
            </div>
            <div className={styles.confidence}>
              <small>MATCH CONFIDENCE</small>
              <strong>
                {selectedPart.confidence}
                <sup>%</sup>
              </strong>
            </div>
          </div>
          <div className={styles.instrumentFooter}>
            <span>
              <i /> Spec verified
            </span>
            <span>
              <i /> Stock detected
            </span>
            <span>
              <i /> Route ready
            </span>
          </div>
        </div>
      </section>

      <section
        className={styles.journey}
        id="journey"
        aria-label="The Parts Gopher order journey"
        data-commerce-scene
      >
        <div
          className={styles.journeyVisual}
          data-stage={activeStep}
        >
          <div className={styles.visualGrid} aria-hidden="true" />
          <div className={styles.journeyHeader}>
            <span>ORDER EXAMPLE / PG-08421</span>
            <strong>{steps[activeStep].metric}</strong>
          </div>
          <div className={styles.journeyCanvas} aria-hidden="true">
            <svg
              className={styles.journeyPath}
              viewBox="0 0 900 540"
              preserveAspectRatio="xMidYMid meet"
            >
              <path
                className={styles.pathShadow}
                d="M90 270C160 270 177 124 287 124s100 290 218 290 107-261 210-261c61 0 81 117 105 117"
              />
              <path
                className={styles.pathSignal}
                d="M90 270C160 270 177 124 287 124s100 290 218 290 107-261 210-261c61 0 81 117 105 117"
              />
              {[90, 268, 454, 650, 820].map((x, index) => (
                <g key={x} className={styles.pathNode} data-node={index}>
                  <circle cx={x} cy={[270, 126, 411, 158, 270][index]} r="29" />
                  <circle cx={x} cy={[270, 126, 411, 158, 270][index]} r="7" />
                </g>
              ))}
            </svg>
            <div className={styles.orderPacket}>
              <span />
              <b>PG</b>
              <small>08421</small>
            </div>
            <div className={styles.phaseGraphic}>
              <div className={styles.searchPhase}>
                <SearchIcon />
                <span>4Z-ALPHA</span>
              </div>
              <div className={styles.orderPhase}>
                <span>ORDER</span>
                <b>$384.20</b>
                <i>VERIFIED</i>
              </div>
              <div className={styles.routePhase}>
                {memberNodes.slice(0, 5).map((node, index) => (
                  <i key={node.code} style={{ "--i": index } as CSSProperties}>
                    {node.code}
                  </i>
                ))}
              </div>
              <div className={styles.fulfillPhase}>
                <span />
                <span />
                <span />
                <i />
              </div>
              <div className={styles.reportPhase}>
                <b>$384.20</b>
                <span>ATTRIBUTED VALUE</span>
                <svg viewBox="0 0 150 45">
                  <path d="M2 39c20-5 24-19 41-17s19 10 37-1 22-15 35-10 18-5 33-9" />
                </svg>
              </div>
            </div>
          </div>
          <div className={styles.journeyStatus}>
            <span>
              <i /> CURRENT EVENT
            </span>
            <b>{steps[activeStep].status}</b>
            <small>0{activeStep + 1} / 05</small>
          </div>
          <div className={styles.stageNav} aria-hidden="true">
            {steps.map((step, index) => (
              <span key={step.label} data-active={activeStep === index}>
                <i />
                {step.label}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.journeyChapters}>
          <div className={styles.journeyIntro} data-reveal>
            <SectionIndex number="02">The order journey</SectionIndex>
            <h2>
              Five connected events.<br />{" "}
              <em>One accountable outcome.</em>
            </h2>
          </div>
          {steps.map((step, index) => (
            <article
              key={step.label}
              className={styles.journeyChapter}
              data-journey-step={index}
              data-active={activeStep === index}
            >
              <span>{step.number} / 05</span>
              <p>{step.label}</p>
              <h3>{step.title}</h3>
              <p className={styles.chapterCopy}>{step.copy}</p>
              <div>
                <i /> {step.status}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className={styles.routing}
        id="routing"
        aria-labelledby="routing-title"
        data-commerce-scene
      >
        <div className={styles.routingHeading} data-reveal>
          <SectionIndex number="03">Network routing</SectionIndex>
          <h2 id="routing-title">
            The closest stock.<br />{" "}
            <em>Across the network.</em>
          </h2>
          <p>
            nopCommerce order lines and fulfillment allocations are evaluated
            against customer geography and the shared-inventory database. A
            checkout can split across multiple in-stock members when that is the
            closest fulfillment path.
          </p>
        </div>

        <div className={styles.routeConsole} data-reveal>
          <div className={styles.routeToolbar}>
            <span>ROUTING EXAMPLE / PG-08421</span>
            <div>
              <i /> Illustrative model
            </div>
          </div>
          <div
            className={styles.mapPanel}
            role="radiogroup"
            aria-label="Illustrative member route candidates"
          >
            <div className={styles.mapGrid} aria-hidden="true" />
            <svg
              className={styles.mapLines}
              viewBox="0 0 1000 620"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {memberNodes.map((node) => (
                <path
                  key={node.code}
                  d={`M500 310 Q${500 + (node.x - 50) * 4} ${
                    310 + (node.y - 50) * -3
                  },${node.x * 10} ${node.y * 6.2}`}
                />
              ))}
              <circle cx="500" cy="310" r="116" />
              <circle cx="500" cy="310" r="216" />
            </svg>
            <div className={styles.orderOrigin}>
              <span>ORDER</span>
              <b>PG-08421</b>
            </div>
            {memberNodes.map((node, index) => (
              <button
                type="button"
                key={node.code}
                className={styles.mapNode}
                data-active={activeMember === index}
                style={{
                  "--x": `${node.x}%`,
                  "--y": `${node.y}%`,
                } as CSSProperties}
                onClick={() => setActiveMember(index)}
                onKeyDown={(event) => handleMemberKeys(event, index)}
                id={`route-member-${node.code.toLowerCase()}`}
                aria-controls="route-decision"
                aria-label={`Inspect route to ${node.name}`}
                role="radio"
                aria-checked={activeMember === index}
                tabIndex={activeMember === index ? 0 : -1}
              >
                <i />
                <span>{node.code}</span>
              </button>
            ))}
            <div className={`${styles.coordinate} ${styles.left}`}>
              CUSTOMER GEO / PRIVATE
            </div>
            <div className={`${styles.coordinate} ${styles.right}`}>
              MEMBER VIEW / AGGREGATE
            </div>
          </div>
          <aside
            className={styles.routeDecision}
            id="route-decision"
            role="region"
            aria-labelledby={`route-member-${selectedMember.code.toLowerCase()}`}
            aria-live="polite"
          >
            <div className={styles.decisionHead}>
              <span>ROUTE CANDIDATE</span>
              <i>EXAMPLE</i>
            </div>
            <p>MEMBER MATCH</p>
            <h3>{selectedMember.name}</h3>
            <div className={styles.routeScore}>
              <strong>{selectedMember.distance.replace(" mi", "")}</strong>
              <span>
                EXAMPLE<br />MILES
              </span>
            </div>
            <dl>
              <div>
                <dt>Shared-inventory signal</dt>
                <dd>{selectedMember.stock}</dd>
              </div>
              <div>
                <dt>Customer geography</dt>
                <dd>Used privately</dd>
              </div>
              <div>
                <dt>Selection rule</dt>
                <dd>Closest in stock</dd>
              </div>
              <div>
                <dt>Member reporting</dt>
                <dd>Aggregate only</dd>
              </div>
            </dl>
            <div className={styles.scoreFactors}>
              <span>
                <i style={{ "--value": "100%" } as CSSProperties} />Shared
                inventory
              </span>
              <span>
                <i style={{ "--value": "100%" } as CSSProperties} />Customer
                geography
              </span>
              <span>
                <i style={{ "--value": "100%" } as CSSProperties} />Closest
                in-stock rule
              </span>
            </div>
            <small>
              Illustrative route data. No production route score or customer
              location is shown.
            </small>
          </aside>
        </div>
      </section>

      <section
        className={styles.fulfillment}
        id="fulfillment"
        data-commerce-scene
      >
        <div className={styles.fulfillmentBackdrop} aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className={styles.fulfillmentCopy} data-reveal>
          <SectionIndex number="04">Member fulfillment</SectionIndex>
          <h2>
            The handoff<br />{" "}never disappears.
          </h2>
          <p>
            Each operational event—assignment, acceptance, pick, verification,
            shipment, and delivery— stays connected to the original order
            signal.
          </p>
          <div className={styles.eventTimeline}>
            {[
              "Member accepted",
              "Inventory reserved",
              "Part verified",
              "Carrier scanned",
            ].map((event, index) => (
              <span key={event}>
                <i>{String(index + 1).padStart(2, "0")}</i>
                <b>{event}</b>
                <small>
                  {["08:43:02", "08:44:19", "09:07:31", "14:22:08"][index]}
                </small>
              </span>
            ))}
          </div>
        </div>
        <div
          className={styles.fulfillmentMachine}
          data-reveal
          aria-hidden="true"
        >
          <ViewportFilm
            src="/media/cinematic/parts-gopher/split-fulfillment/master-16x9-v1.mp4"
            poster="/media/distranet-original/fulfillment-verification-v1.webp"
            className={styles.fulfillmentFilm}
            focalPoint="53% 50%"
            scrubRange={[0.32, 0.72]}
          />
          <div className={styles.warehouseLabel}>
            MEMBER FULFILLMENT / DISTRANET STUDY
          </div>
          <div className={styles.fulfillmentFilmRail}>
            <span>
              <i /> ASSIGNMENT ACCEPTED
            </span>
            <b>PHYSICAL HANDOFF</b>
            <small>ORDER EVENTS REMAIN CONNECTED</small>
          </div>
          <div className={styles.floorReadout}>
            <span>PICK ACCURACY</span>
            <b>100.0%</b>
            <small>PROTOTYPE</small>
          </div>
        </div>
      </section>

      <section
        className={styles.intelligence}
        id="intelligence"
        data-commerce-scene
        data-intelligence-scene
      >
        <div className={styles.intelligenceHead} data-reveal>
          <SectionIndex number="05">Member intelligence</SectionIndex>
          <h2>
            The order ends.<br />{" "}
            <em>The intelligence begins.</em>
          </h2>
          <p>
            Approved commercial and operational events roll into an aggregate
            company view without exposing customer identities or raw location
            details.
          </p>
        </div>
        <div className={styles.intelligenceJourney}>
          <div className={styles.intelligenceSticky}>
            <div
              className={styles.valueField}
              data-reveal
              data-signal={intelligenceSignals[activeIntelligenceSignal].id}
            >
              <div className={styles.intelligenceSource} aria-hidden="true">
                <ViewportFilm
                  src="/media/cinematic/parts-gopher/split-fulfillment/master-16x9-v1.mp4"
                  poster="/media/cinematic/parts-gopher/split-fulfillment/split-fulfillment-v1.png"
                  className={styles.intelligenceFilm}
                  focalPoint="72% 50%"
                  scrubRange={[0.64, 1]}
                />
                <div className={styles.sourceReadout}>
                  <span>
                    <i /> ORDER COMPLETE
                  </span>
                  <strong>PG-08421</strong>
                  <small>PHYSICAL EVENT / VERIFIED</small>
                </div>
              </div>

              <div className={styles.signalBridge} aria-hidden="true">
                <svg viewBox="0 0 560 520" preserveAspectRatio="none">
                  {intelligenceSignals.map((signal, index) => (
                    <g
                      key={signal.id}
                      data-active={activeIntelligenceSignal === index}
                    >
                      <path
                        className={styles.signalShadow}
                        d={`M18 260 C150 260 158 ${80 + index * 118} 318 ${
                          80 + index * 118
                        } S440 ${82 + index * 106} 548 ${82 + index * 106}`}
                      />
                      <path
                        className={styles.signalLine}
                        d={`M18 260 C150 260 158 ${80 + index * 118} 318 ${
                          80 + index * 118
                        } S440 ${82 + index * 106} 548 ${82 + index * 106}`}
                      />
                    </g>
                  ))}
                </svg>
                <div className={styles.eventPacket}>
                  <i />
                  <span>
                    ORDER<br />EVENT
                  </span>
                  <b>01</b>
                </div>
                {intelligenceSignals.map((signal, index) => (
                  <span
                    key={signal.id}
                    className={styles.streamLabel}
                    data-active={activeIntelligenceSignal === index}
                    style={{ "--lane": index } as CSSProperties}
                  >
                    <i />
                    {signal.label}
                  </span>
                ))}
              </div>

              <div
                className={styles.signalSelector}
                role="group"
                aria-label="Inspect member intelligence signals"
              >
                <span>TRACE SIGNAL</span>
                {intelligenceSignals.map((signal, index) => (
                  <button
                    key={signal.id}
                    type="button"
                    data-active={activeIntelligenceSignal === index}
                    aria-pressed={activeIntelligenceSignal === index}
                    onClick={() => setActiveIntelligenceSignal(index)}
                    onFocus={() => setActiveIntelligenceSignal(index)}
                  >
                    <i /> {String(index + 1).padStart(2, "0")} {signal.label}
                  </button>
                ))}
              </div>

              <div className={styles.dashboardWindow}>
                <div className={styles.dashboardNav}>
                  <Logo />
                  <div>
                    <span>Overview</span>
                    <span>Sales</span>
                    <span>Products</span>
                    <span>Reports</span>
                  </div>
                  <i>BR</i>
                </div>
                <div className={styles.dashboardBody}>
                  <div className={styles.dashboardTitle}>
                    <div>
                      <small>MEMBER COMPANY / EXECUTIVE VIEW</small>
                      <h3>Parts Gopher value</h3>
                    </div>
                    <span>
                      <i /> Prototype snapshot
                    </span>
                  </div>
                  <div className={styles.metricCards}>
                    <article data-active={activeIntelligenceSignal === 0}>
                      <small>Attributed net sales</small>
                      <strong>$1.84M</strong>
                      <span>+18.4% year over year</span>
                    </article>
                    <article data-active={activeIntelligenceSignal === 1}>
                      <small>Orders</small>
                      <strong>1,246</strong>
                      <span>+12.7% year over year</span>
                    </article>
                    <article data-active={activeIntelligenceSignal === 2}>
                      <small>Member margin share</small>
                      <strong>$276K</strong>
                      <span>50% gross-margin split</span>
                    </article>
                  </div>
                  <div className={styles.dashboardLower}>
                    <article
                      className={styles.salesGraph}
                      data-active={activeIntelligenceSignal === 0 ||
                        activeIntelligenceSignal === 3}
                    >
                      <div>
                        <b>
                          {intelligenceSignals[activeIntelligenceSignal].label}
                        </b>
                        <span>
                          {intelligenceSignals[activeIntelligenceSignal].detail}
                        </span>
                      </div>
                      <svg
                        viewBox="0 0 620 210"
                        role="img"
                        aria-label="Illustrative attributed sales trend increasing over twelve months"
                      >
                        <g>
                          <path d="M0 45H620M0 95H620M0 145H620M0 195H620" />
                        </g>
                        <path
                          className={styles.graphArea}
                          d="M0 175C50 163 55 119 110 136s73-45 124-27 68 23 110-20 70-12 115-47 74 5 161-39V210H0Z"
                        />
                        <path
                          className={styles.graphLine}
                          d="M0 175C50 163 55 119 110 136s73-45 124-27 68 23 110-20 70-12 115-47 74 5 161-39"
                        />
                        <circle
                          className={styles.graphCursor}
                          cx={420 + activeIntelligenceSignal * 46}
                          cy={66 - activeIntelligenceSignal * 9}
                          r="8"
                        />
                      </svg>
                      <div className={styles.focusReadout}>
                        <span>ACTIVE SIGNAL</span>
                        <strong>
                          {intelligenceSignals[activeIntelligenceSignal].value}
                        </strong>
                        <small>
                          {intelligenceSignals[activeIntelligenceSignal].detail}
                        </small>
                      </div>
                    </article>
                    <article className={styles.valueTrace}>
                      <b>Order value trace</b>
                      {[
                        "Search captured",
                        "Order allocated by line",
                        "Member fulfillment group",
                        "Margin share example",
                      ].map((item, index) => (
                        <span
                          key={item}
                          data-active={activeIntelligenceSignal === index}
                        >
                          <i />
                          {item}
                          <small>
                            {["08:42", "08:43", "08:43", "DRAFT"][index]}
                          </small>
                        </span>
                      ))}
                    </article>
                  </div>
                </div>
              </div>
              <div className={styles.valueCaption}>
                <span>ONE ORDER</span>
                <i />
                <span>FOUR APPROVED SIGNALS</span>
                <i />
                <span>ONE AGGREGATE VIEW</span>
              </div>
            </div>
          </div>
        </div>
        <p className={styles.prototypeNote}>
          Dashboard values are illustrative prototype data and are not
          production reporting.
        </p>
      </section>

      <section className={styles.finalCta} data-commerce-scene>
        <div className={styles.ctaRings} aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div data-reveal>
          <SectionIndex number="06">Connected commerce</SectionIndex>
          <h2>
            Demand should not<br />{" "}disappear into a storefront.
          </h2>
          <p>
            It should move through the network—and return as visible member
            value.
          </p>
          <div className={styles.heroActions}>
            <Link href="/member-access" className={styles.lightButton}>
              Preview hub prototype <ArrowIcon />
            </Link>
            <Link href="/" className={styles.darkButton}>
              Explore Distranet
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

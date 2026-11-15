"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import styles from "./network.module.css";

const stages = [
  {
    label: "Discover",
    kicker: "00:00.18 / Network query",
    title: "One request searches the shared field.",
    body: "A product inquiry becomes a network-wide availability signal instead of a dead end at one local shelf.",
    metrics: [["21", "member positions"], ["01", "query surface"], ["<1s", "experience target"]],
  },
  {
    label: "Route",
    kicker: "00:00.42 / Best-source logic",
    title: "The closest in-stock source becomes visible.",
    body: "Customer geography is checked against shared inventory so the closest member with stock can be selected for the fulfillment path.",
    metrics: [["02", "confirmed inputs"], ["AHP", "illustrative match"], ["KY", "example region"]],
  },
  {
    label: "Fulfill",
    kicker: "00:01.07 / Member-to-customer",
    title: "Each allocation lands with an in-stock member.",
    body: "The selected member is seller of record for its fulfillment portion. One checkout may split across multiple members when availability requires it.",
    metrics: [["01", "customer checkout"], ["N", "member allocations"], ["50%", "gross-margin share"]],
  },
] as const;

function StageIcon({ stage }: { stage: number }) {
  if (stage === 0) return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 5 5M10.5 7v7M7 10.5h7"/></svg>;
  if (stage === 1) return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h9a4 4 0 0 1 4 4v9M13 3l4 4-4 4M17 20l3-3M17 20l-3-3"/></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 7 9-4 9 4-9 4-9-4Z"/><path d="m3 7 9 4 9-4M3 7v10l9 4 9-4V7M12 11v10"/></svg>;
}

export function InventoryFlow() {
  const [activeStage, setActiveStage] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(false);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const experienceRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setMotionAllowed(!reducedQuery.matches);
    const updateVisibility = () => setPageVisible(document.visibilityState === "visible");
    const node = experienceRef.current;
    const observer = node && "IntersectionObserver" in window
      ? new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
          rootMargin: "10% 0px",
          threshold: .05,
        })
      : null;

    updateMotion();
    updateVisibility();
    if (node && observer) observer.observe(node);
    else setInView(true);
    reducedQuery.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      observer?.disconnect();
      reducedQuery.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (userPaused || !inView || !pageVisible || !motionAllowed) return;
    const timer = window.setInterval(() => setActiveStage((current) => (current + 1) % stages.length), 5200);
    return () => window.clearInterval(timer);
  }, [inView, motionAllowed, pageVisible, userPaused]);

  const selectStage = (index: number) => {
    setUserPaused(true);
    setActiveStage(index);
  };

  const handleTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home"
      ? 0
      : event.key === "End"
        ? stages.length - 1
        : (index + (event.key === "ArrowRight" ? 1 : -1) + stages.length) % stages.length;
    selectStage(next);
    tabRefs.current[next]?.focus();
  };

  const stage = stages[activeStage];
  return <div ref={experienceRef} className={styles.flowExperience} data-paused={userPaused}>
    <div className={styles.flowTabs} role="tablist" aria-label="Inventory flow stages">
      {stages.map((item, index) => <button
        type="button"
        key={item.label}
        role="tab"
        id={`network-flow-tab-${index}`}
        aria-selected={activeStage === index}
        aria-controls="network-flow-panel"
        tabIndex={activeStage === index ? 0 : -1}
        ref={(node) => { tabRefs.current[index] = node; }}
        className={activeStage === index ? styles.flowTabActive : undefined}
        onClick={() => selectStage(index)}
        onKeyDown={(event) => handleTabKey(event, index)}
      >
        <span>{String(index + 1).padStart(2, "0")}</span>
        <StageIcon stage={index} />
        {item.label}
      </button>)}
    </div>

    <div id="network-flow-panel" role="tabpanel" aria-labelledby={`network-flow-tab-${activeStage}`} className={styles.flowPanel}>
      <div className={styles.flowVisual} data-stage={activeStage}>
        <div className={styles.flowHud}>
          <span>MODEL / INVENTORY ROUTING</span>
          <div className={styles.flowHudControls}>
            <span>ILLUSTRATIVE FLOW {String(activeStage + 1).padStart(2, "0")}</span>
            <button
              type="button"
              aria-label={userPaused ? "Resume inventory flow animation and auto-advance" : "Pause inventory flow animation and auto-advance"}
              aria-pressed={userPaused}
              onClick={() => setUserPaused((paused) => !paused)}
            >
              {userPaused ? "Resume" : "Pause"}
            </button>
          </div>
        </div>
        <svg className={styles.flowSvg} viewBox="0 0 1000 560" role="img" aria-label={`${stage.label}: ${stage.body}`}>
          <defs>
            <radialGradient id="flow-core" cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#ffffff" stopOpacity=".98" />
              <stop offset=".16" stopColor="#ed1c24" stopOpacity=".9" />
              <stop offset="1" stopColor="#ed1c24" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="flow-line" x1="0" x2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity=".08" />
              <stop offset=".5" stopColor="#ed1c24" stopOpacity=".92" />
              <stop offset="1" stopColor="#ffffff" stopOpacity=".12" />
            </linearGradient>
            <pattern id="flow-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0V40" fill="none" stroke="#ffffff" strokeOpacity=".055" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="1000" height="560" fill="url(#flow-grid)" />
          <g className={styles.flowScanlines} aria-hidden="true">
            {Array.from({ length: 12 }, (_, index) => <path key={index} d={`M0 ${42 + index * 42}H1000`} />)}
          </g>

          <path className={styles.flowBasePath} d="M128 280C250 280 275 280 388 280" />
          <path className={styles.flowBasePath} d="M510 280C650 280 671 108 852 108" />
          <path className={styles.flowBasePath} d="M510 280C655 280 685 194 852 194" />
          <path className={styles.flowBasePath} d="M510 280C655 280 685 280 852 280" />
          <path className={styles.flowBasePath} d="M510 280C655 280 685 366 852 366" />
          <path className={styles.flowBasePath} d="M510 280C650 280 671 452 852 452" />

          <path className={`${styles.flowSignalPath} ${styles.flowQueryPath}`} d="M128 280C250 280 275 280 388 280" />
          {[108, 194, 280, 366, 452].map((y, index) => <path key={y} className={`${styles.flowSignalPath} ${index === 2 ? styles.flowSelectedPath : ""}`} d={`M510 280C650 280 670 ${y} 852 ${y}`} />)}

          <g className={styles.queryModule}>
            <rect x="48" y="219" width="146" height="122" rx="2" />
            <circle cx="86" cy="263" r="16" />
            <path d="m98 275 17 17" />
            <text x="72" y="316">PRODUCT QUERY</text>
          </g>
          <g className={styles.coreModule}>
            <circle className={styles.coreHalo} cx="449" cy="280" r="92" />
            <circle cx="449" cy="280" r="59" />
            <circle cx="449" cy="280" r="37" />
            <path d="M449 219v-18M449 359v-18M388 280h-18M528 280h-18" />
            <text x="449" y="276" textAnchor="middle">DISTRA</text>
            <text x="449" y="294" textAnchor="middle">NET CORE</text>
          </g>

          {[108, 194, 280, 366, 452].map((y, index) => <g key={y} className={`${styles.memberModule} ${index === 2 ? styles.selectedMember : ""}`}>
            <rect x="852" y={y - 32} width="112" height="64" rx="2" />
            <circle cx="873" cy={y} r="4" />
            <text x="888" y={y - 4}>{index === 2 ? "AHP / KY" : `NODE ${String(index + 7).padStart(2, "0")}`}</text>
            <text className={styles.memberStatus} x="888" y={y + 13}>{index === 2 ? "MATCH READY" : "AVAILABLE"}</text>
          </g>)}

          <g className={styles.flowPacket}>
            <rect x="0" y="0" width="64" height="28" rx="2" />
            <text x="32" y="18" textAnchor="middle">SKU 8514</text>
          </g>
          <g className={styles.flowCoordinates}>
            <text x="34" y="42">CUSTOMER GEO / PRIVATE</text>
            <text x="34" y="58">NETWORK DEPTH / 21</text>
            <text x="815" y="522">ROUTING RULE</text>
            <text x="930" y="522" textAnchor="end">CLOSEST STOCK</text>
          </g>
        </svg>
        <div className={styles.flowTicker}>
          <span>QUERY / SKU 8514-06-06</span>
          <span>AVAILABILITY / DISTRIBUTED</span>
          <span>ORIGIN / MEMBER REQUEST</span>
          <span>MODE / COOPERATIVE</span>
        </div>
      </div>

      <div className={styles.flowNarrative} aria-live={userPaused ? "polite" : "off"}>
        <p className={styles.microLabel}>{stage.kicker}</p>
        <h3>{stage.title}</h3>
        <p>{stage.body}</p>
        <div className={styles.flowMetrics}>
          {stage.metrics.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
        </div>
        <p className={styles.modelNote}>Confirmed principle: customer geography + shared inventory + closest in-stock member. All timing, member matches, and telemetry shown here are illustrative.</p>
      </div>
    </div>
  </div>;
}

"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type {
  AggregateDemandSignal,
  MemberAcquisitionChannel,
  MemberOverviewSnapshot,
  MemberTenantBrand,
} from "@/domain/member-hub/types";
import { MemberIcon } from "./components/MemberIcon";
import styles from "./MemberDecisionDesk.module.css";

type DecisionId = "stock-gap" | "allocation" | "measurement";

type Decision = {
  id: DecisionId;
  index: string;
  eyebrow: string;
  title: string;
  impact: string;
  impactLabel: string;
  summary: string;
  evidence: string;
  missing: string;
  values: readonly [number, number, number];
  labels: readonly [string, string, string];
  tone: "member" | "network" | "caution";
};

function groupThousands(value: number) {
  return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatCompactCurrency(value: number) {
  const absolute = Math.abs(value);
  const sign = value < 0 ? "−" : "";
  if (absolute >= 1_000_000) return `${sign}$${(absolute / 1_000_000).toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}M`;
  if (absolute >= 1_000) return `${sign}$${(absolute / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${sign}$${groupThousands(absolute)}`;
}

function radarPoint(index: number, value: number, radius = 132) {
  const angle = (-90 + index * 120) * (Math.PI / 180);
  const scaled = radius * Math.max(0, Math.min(100, value)) / 100;
  return `${(180 + Math.cos(angle) * scaled).toFixed(1)},${(180 + Math.sin(angle) * scaled).toFixed(1)}`;
}

function gridPoints(ratio: number) {
  return [0, 1, 2].map((index) => radarPoint(index, ratio * 100)).join(" ");
}

export function MemberDecisionDesk({
  tenant,
  snapshot,
  signals,
  channels,
}: {
  tenant: MemberTenantBrand;
  snapshot: MemberOverviewSnapshot;
  signals: readonly AggregateDemandSignal[];
  channels: readonly MemberAcquisitionChannel[];
}) {
  const rootRef = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState<DecisionId>("stock-gap");

  const decisions = useMemo<Decision[]>(() => {
    const stockGap = signals.find((signal) => signal.signal === "stock-gap") ?? signals[0];
    const unattributed = channels.find((channel) => channel.id === "unknown" || channel.id.endsWith("-unknown"));
    const stockGapValue = stockGap?.opportunityValue ?? snapshot.opportunityValue;
    const unknownShare = unattributed?.share ?? 0;
    const unknownSales = unattributed?.attributedSales ?? 0;

    return [
      {
        id: "stock-gap",
        index: "01",
        eyebrow: "Demand capture",
        title: `Review ${stockGap?.label ?? "the leading stock-gap cell"}`,
        impact: formatCompactCurrency(stockGapValue),
        impactLabel: "illustrative opportunity",
        summary: stockGap?.summary ?? "Aggregate demand is outrunning currently matched inventory.",
        evidence: `Demand index ${stockGap?.demandIndex ?? 0} against availability ${stockGap?.availabilityIndex ?? 0}.`,
        missing: "Confirm product-family detail, replenishment economics, and branch ownership before action.",
        values: [stockGap?.demandIndex ?? 0, stockGap?.availabilityIndex ?? 0, 76],
        labels: ["Demand", "Readiness", "Evidence"],
        tone: "member",
      },
      {
        id: "allocation",
        index: "02",
        eyebrow: "Fulfillment readiness",
        title: "Protect the nearest-stock advantage",
        impact: `${snapshot.matchRate.toFixed(1)}%`,
        impactLabel: "illustrative match rate",
        summary: `${groupThousands(snapshot.splitOrders)} of ${groupThousands(snapshot.recognizedOrders)} recognized orders use multi-member fulfillment in this fixed example.`,
        evidence: `Allocation logic can expose where ${tenant.shortName} fulfills the primary line and where another member closes the stock gap.`,
        missing: "Validate inventory freshness, freight logic, returns treatment, and seller-of-record reconciliation.",
        values: [Math.min(100, snapshot.splitRate * 2), snapshot.matchRate, 82],
        labels: ["Network value", "Readiness", "Evidence"],
        tone: "network",
      },
      {
        id: "measurement",
        index: "03",
        eyebrow: "Measurement contract",
        title: "Close the unattributed demand gap",
        impact: `${unknownShare}%`,
        impactLabel: "illustrative unattributed share",
        summary: `${formatCompactCurrency(unknownSales)} of fixed-example demand lacks a defensible acquisition origin.`,
        evidence: "The portal can separate measured demand from assumptions instead of presenting a false certified funnel.",
        missing: "Audit GA4 ecommerce events, transaction joins, refunds, consent, and campaign identifiers.",
        values: [Math.min(100, unknownShare * 10), 62, Math.max(28, 100 - unknownShare * 8)],
        labels: ["Value at risk", "Readiness", "Evidence"],
        tone: "caution",
      },
    ];
  }, [channels, signals, snapshot, tenant.shortName]);

  const active = decisions.find((decision) => decision.id === activeId) ?? decisions[0];
  const activePoints = active.values.map((value, index) => radarPoint(index, value)).join(" ");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || typeof IntersectionObserver === "undefined") {
      root.dataset.reveal = "visible";
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        root.dataset.reveal = "visible";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -14%", threshold: 0.18 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={rootRef}
      id="decisions"
      className={styles.section}
      aria-labelledby="decision-desk-title"
      data-reveal="waiting"
    >
      <header className={styles.heading}>
        <div>
          <p>{tenant.shortName} decision desk / governed next moves</p>
          <h2 id="decision-desk-title">Turn network signals into an executive decision.</h2>
        </div>
        <p>
          A tenant-specific briefing surface that ranks illustrative opportunities, exposes missing evidence,
          and keeps approval with the member, Distranet management, and the board.
        </p>
      </header>

      <div className={styles.console} data-tone={active.tone}>
        <div className={styles.decisionRail} role="group" aria-label="Illustrative decision scenarios">
          <div className={styles.railHead}>
            <span>Signal queue</span>
            <strong>03 scenarios</strong>
          </div>
          {decisions.map((decision) => (
            <button
              type="button"
              key={decision.id}
              aria-pressed={active.id === decision.id}
              aria-controls="decision-lens"
              onClick={() => setActiveId(decision.id)}
            >
              <span>{decision.index}</span>
              <span>
                <small>{decision.eyebrow}</small>
                <strong>{decision.title}</strong>
              </span>
              <span>
                <b>{decision.impact}</b>
                <small>{decision.impactLabel}</small>
              </span>
              <MemberIcon name="arrow" />
            </button>
          ))}
        </div>

        <div id="decision-lens" className={styles.lens} aria-live="polite">
          <div className={styles.lensGrid} aria-hidden="true" />
          <div className={styles.radarWrap}>
            <svg
              className={styles.radar}
              viewBox="0 0 360 360"
              role="img"
              aria-label={`${active.title}: ${active.labels.map((label, index) => `${label} ${Math.round(active.values[index])}`).join(", ")}.`}
            >
              <g className={styles.radarGrid}>
                <polygon points={gridPoints(1)} />
                <polygon points={gridPoints(0.72)} />
                <polygon points={gridPoints(0.44)} />
                {[0, 1, 2].map((index) => (
                  <line key={index} x1="180" y1="180" x2={radarPoint(index, 100).split(",")[0]} y2={radarPoint(index, 100).split(",")[1]} />
                ))}
              </g>
              <polygon key={active.id} className={styles.radarValue} points={activePoints} />
              {active.values.map((value, index) => {
                const [cx, cy] = radarPoint(index, value).split(",");
                return <circle key={`${active.id}-${active.labels[index]}`} className={styles.radarPoint} cx={cx} cy={cy} r="6" />;
              })}
            </svg>
            <div className={styles.radarCore}>
              <span>Priority signal</span>
              <strong>{active.impact}</strong>
              <small>{active.impactLabel}</small>
            </div>
            {active.labels.map((label, index) => (
              <span key={label} className={styles[`axis${index + 1}`]}>
                <b>{Math.round(active.values[index])}</b>{label}
              </span>
            ))}
          </div>

          <div className={styles.lensCopy}>
            <span>{active.eyebrow}</span>
            <h3>{active.title}</h3>
            <p>{active.summary}</p>
            <dl>
              <div><dt>Evidence in view</dt><dd>{active.evidence}</dd></div>
              <div><dt>Before approval</dt><dd>{active.missing}</dd></div>
            </dl>
          </div>
        </div>

        <div className={styles.governancePath} aria-label="Illustrative decision governance path">
          {[
            ["01", "Signal", "Aggregate opportunity surfaced"],
            ["02", "Evidence", "Source and definition reviewed"],
            ["03", "Approval", "Member + Distranet governance"],
            ["04", "Execution", "Production workflow required"],
          ].map(([index, label, detail], position) => (
            <div key={label} style={{ "--decision-index": position } as CSSProperties}>
              <span>{index}</span>
              <strong>{label}</strong>
              <small>{detail}</small>
              {position < 3 && <i aria-hidden="true" />}
            </div>
          ))}
          <p><MemberIcon name="lock" /> Prototype decision support only · no production action is taken</p>
        </div>
      </div>
    </section>
  );
}

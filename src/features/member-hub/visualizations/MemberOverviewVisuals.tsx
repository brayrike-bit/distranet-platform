"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type {
  AggregateDemandSignal,
  MemberBenchmark,
  MemberOverviewSnapshot,
  MemberService,
  MemberTenantBrand,
} from "@/domain/member-hub/types";
import { MemberIcon, type MemberIconName } from "../components/MemberIcon";
import styles from "../MemberOperatingOverview.module.css";

let graphRevealObserver: IntersectionObserver | null = null;

function sharedGraphRevealObserver() {
  if (typeof IntersectionObserver === "undefined") return null;
  if (!graphRevealObserver) {
    graphRevealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).dataset.graphRevealed = "true";
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12%", threshold: 0.08 },
    );
  }
  return graphRevealObserver;
}

/** One shared, reveal-once observer for every analytical scene on the page. */
function useGraphReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const observer = reducedMotion ? null : sharedGraphRevealObserver();
    if (!observer) {
      element.dataset.graphRevealed = "true";
      return;
    }
    observer.observe(element);
    return () => observer.unobserve(element);
  }, []);

  return ref;
}

function groupThousands(value: number) {
  return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatCurrency(value: number) {
  return `$${groupThousands(value)}`;
}

function trimFixed(value: number, digits: number) {
  return value.toFixed(digits).replace(/\.?0+$/, "");
}

function formatCompactCurrency(value: number) {
  const absolute = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absolute >= 1_000_000) {
    return `${sign}$${trimFixed(absolute / 1_000_000, 2)}M`;
  }
  if (absolute >= 1_000) {
    return `${sign}$${trimFixed(absolute / 1_000, absolute >= 100_000 ? 1 : 2)}K`;
  }
  return `${sign}$${groupThousands(absolute)}`;
}

export function MemberOperatingPortrait({
  tenant,
  snapshot,
}: {
  tenant: MemberTenantBrand;
  snapshot: MemberOverviewSnapshot;
}) {
  const memberProceeds = snapshot.productReimbursement + snapshot.memberMarginShare;
  const revealRef = useGraphReveal<HTMLElement>();

  return (
    <section
      ref={revealRef}
      id="portrait"
      className={styles.portrait}
      data-graph-reveal="portrait"
      aria-labelledby="portrait-title"
    >
      <header className={styles.sectionHeadingInverse}>
        <div>
          <p className={styles.kicker}>Member operating portrait</p>
          <h2 id="portrait-title">One living picture of your network value.</h2>
        </div>
        <p>
          Commerce, fulfillment, proceeds, and opportunity resolved at member allocation level.
          Every figure below is an illustrative aggregate prototype.
        </p>
      </header>

      <div className={styles.portraitStage}>
        <div className={styles.portraitGrid} aria-hidden="true" />
        <svg
          className={styles.portraitMachine}
          viewBox="0 0 960 560"
          role="img"
          aria-label={`Illustrative operating portrait for ${tenant.displayName}: ${formatCurrency(snapshot.attributedSales)} attributed sales, ${snapshot.recognizedOrders} recognized orders, ${formatCurrency(memberProceeds)} member proceeds, and ${formatCompactCurrency(snapshot.opportunityValue)} aggregate opportunity.`}
        >
          <defs>
            <linearGradient id="portrait-blue" x1="0" x2="1">
              <stop offset="0" stopColor="var(--tenant-primary)" stopOpacity="0" />
              <stop offset="0.5" stopColor="var(--tenant-primary)" />
              <stop offset="1" stopColor="var(--tenant-primary)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="portrait-red" x1="0" x2="1">
              <stop offset="0" stopColor="#ed1c24" stopOpacity="0" />
              <stop offset="0.5" stopColor="#ff5a60" />
              <stop offset="1" stopColor="#ed1c24" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="portrait-core">
              <stop offset="0" stopColor="var(--tenant-primary)" stopOpacity="0.5" />
              <stop offset="0.62" stopColor="var(--tenant-ink)" />
              <stop offset="1" stopColor="#020609" />
            </radialGradient>
            <filter id="portrait-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <g className={styles.portraitBackplane}>
            <ellipse cx="480" cy="280" rx="336" ry="194" />
            <ellipse cx="480" cy="280" rx="277" ry="157" />
            <ellipse cx="480" cy="280" rx="219" ry="121" />
            <path d="M64 280H896" />
            <path d="M480 38V522" />
          </g>

          <g className={styles.portraitSignals} filter="url(#portrait-glow)">
            <path pathLength="1" d="M112 164C253 110 292 198 386 241" stroke="url(#portrait-blue)" />
            <path pathLength="1" d="M848 147C702 99 662 195 574 240" stroke="url(#portrait-red)" />
            <path pathLength="1" d="M111 407C240 455 302 366 388 319" stroke="url(#portrait-blue)" />
            <path pathLength="1" d="M850 412C719 461 657 366 573 320" stroke="url(#portrait-red)" />
          </g>

          <g className={styles.portraitCoreSvg}>
            <circle cx="480" cy="280" r="111" fill="url(#portrait-core)" />
            <circle cx="480" cy="280" r="96" />
            <circle cx="480" cy="280" r="77" />
            <path d="M480 169v22M480 369v22M369 280h22M569 280h22" />
          </g>

          {[
            [112, 164, "01"],
            [848, 147, "02"],
            [111, 407, "03"],
            [850, 412, "04"],
          ].map(([cx, cy, label], index) => (
            <g
              className={styles.portraitNode}
              key={label}
              transform={`translate(${cx} ${cy})`}
              style={{ "--portrait-node-delay": `${360 + index * 95}ms` } as CSSProperties}
            >
              <circle r="24" />
              <circle r="8" />
              <text y="43" textAnchor="middle">{label}</text>
            </g>
          ))}
        </svg>

        <div className={styles.portraitCoreLogo}>
          <span>Tenant lens</span>
          <div>
            <Image
              unoptimized
              src={tenant.logo.src}
              style={{ background: tenant.logo.background ?? "#fff", objectFit: "contain", padding: 6, borderRadius: 5 }}
              alt={tenant.logo.alt}
              width={tenant.logo.width}
              height={tenant.logo.height}
              priority
              sizes="180px"
            />
          </div>
          <small>Powered by Distranet</small>
        </div>

        <dl className={styles.portraitMetrics}>
          <div className={styles.portraitMetricSales}>
            <dt>Attributed net sales</dt>
            <dd>{formatCompactCurrency(snapshot.attributedSales)}</dd>
            <span>Aggregate · allocation based</span>
          </div>
          <div className={styles.portraitMetricOrders}>
            <dt>Recognized orders</dt>
            <dd>{groupThousands(snapshot.recognizedOrders)}</dd>
            <span>{snapshot.splitRate}% split fulfillment</span>
          </div>
          <div className={styles.portraitMetricProceeds}>
            <dt>Member proceeds</dt>
            <dd>{formatCompactCurrency(memberProceeds)}</dd>
            <span>Reimbursement + margin share</span>
          </div>
          <div className={styles.portraitMetricDemand}>
            <dt>Opportunity field</dt>
            <dd>{formatCompactCurrency(snapshot.opportunityValue)}</dd>
            <span>Anonymous aggregate demand</span>
          </div>
        </dl>
      </div>

      <footer className={styles.portraitFooter}>
        <span><i className={styles.signalTenant} /> Member operating signal</span>
        <span><i className={styles.signalNetwork} /> Distranet network signal</span>
        <span><MemberIcon name="lock" /> No customer identities exposed</span>
      </footer>
    </section>
  );
}

type ProceedsLane = "reimbursement" | "member-margin" | "network-margin" | "adjustments";

export function ProceedsEngine({ snapshot }: { snapshot: MemberOverviewSnapshot }) {
  const revealRef = useGraphReveal<HTMLElement>();
  const [activeLane, setActiveLane] = useState<ProceedsLane>("member-margin");
  const lanes = [
    {
      id: "reimbursement" as const,
      label: "Product reimbursement",
      value: snapshot.productReimbursement,
      detail: "Illustrative payment for the member-supplied part, based on the current draft pricing model.",
    },
    {
      id: "member-margin" as const,
      label: "Member margin share",
      value: snapshot.memberMarginShare,
      detail: "Illustrative 50% share of the gross-margin pool attributed to fulfilled member allocations.",
    },
    {
      id: "network-margin" as const,
      label: "Parts Gopher share",
      value: snapshot.partsGopherMarginShare,
      detail: "Illustrative remaining 50% of the gross-margin pool retained by Parts Gopher.",
    },
    {
      id: "adjustments" as const,
      label: "Reconciliation field",
      value: snapshot.adjustments,
      detail: "Placeholder for governed treatment of shipping, discounts, fees, returns, tax, and chargebacks.",
    },
  ];
  const active = lanes.find((lane) => lane.id === activeLane) ?? lanes[0];
  const memberProceeds = snapshot.productReimbursement + snapshot.memberMarginShare;

  return (
    <section
      ref={revealRef}
      id="proceeds"
      className={styles.proceeds}
      data-graph-reveal="proceeds"
      aria-labelledby="proceeds-title"
    >
      <header className={styles.sectionHeading}>
        <div>
          <p className={styles.kicker}>Proceeds engine</p>
          <h2 id="proceeds-title">Every dollar, physically traceable.</h2>
        </div>
        <p>
          A draft allocation model that separates product reimbursement, gross-margin sharing,
          and reconciliation instead of hiding them in a single total.
        </p>
      </header>

      <div
        className={styles.proceedsMachine}
        data-active={activeLane}
      >
        <svg viewBox="0 0 1100 430" role="img" aria-labelledby="proceeds-svg-title proceeds-svg-desc">
          <title id="proceeds-svg-title">Illustrative proceeds flow</title>
          <desc id="proceeds-svg-desc">
            {formatCurrency(snapshot.attributedSales)} in attributed sales flows through product reimbursement,
            a fifty-fifty gross-margin split, and a draft reconciliation field. Illustrative member proceeds total {formatCurrency(memberProceeds)}.
          </desc>
          <defs>
            <linearGradient id="flow-input" x1="0" x2="1"><stop stopColor="var(--tenant-primary)" /><stop offset="1" stopColor="var(--tenant-tint)" /></linearGradient>
            <linearGradient id="flow-member" x1="0" x2="1"><stop stopColor="var(--tenant-secondary)" /><stop offset="1" stopColor="var(--tenant-tint)" /></linearGradient>
            <linearGradient id="flow-network" x1="0" x2="1"><stop stopColor="#ed1c24" /><stop offset="1" stopColor="#ff666b" /></linearGradient>
          </defs>
          <g className={styles.flowRails}>
            <path pathLength="1" className={styles.flowInput} d="M70 215C188 215 202 215 302 215" />
            <path pathLength="1" className={styles.flowReimbursement} d="M302 215C440 215 460 92 610 92H1015" />
            <path pathLength="1" className={styles.flowPool} d="M302 215C438 215 462 228 610 228H700" />
            <path pathLength="1" className={styles.flowMember} d="M700 228C792 228 811 184 1015 184" />
            <path pathLength="1" className={styles.flowNetwork} d="M700 228C792 228 811 272 1015 272" />
            <path pathLength="1" className={styles.flowAdjustments} d="M302 215C440 215 461 356 610 356H1015" />
          </g>
          <g className={styles.flowPulses} aria-hidden="true">
            <path pathLength="1" data-lane="input" d="M70 215C188 215 202 215 302 215" />
            <path pathLength="1" data-lane="reimbursement" d="M302 215C440 215 460 92 610 92H1015" />
            <path pathLength="1" data-lane="pool" d="M302 215C438 215 462 228 610 228H700" />
            <path pathLength="1" data-lane="member-margin" d="M700 228C792 228 811 184 1015 184" />
            <path pathLength="1" data-lane="network-margin" d="M700 228C792 228 811 272 1015 272" />
            <path pathLength="1" data-lane="adjustments" d="M302 215C440 215 461 356 610 356H1015" />
          </g>
          <g className={styles.flowPorts}>
            <circle cx="70" cy="215" r="22" />
            <circle cx="302" cy="215" r="18" />
            <circle cx="700" cy="228" r="16" />
            <circle cx="1015" cy="92" r="12" />
            <circle cx="1015" cy="184" r="12" />
            <circle cx="1015" cy="272" r="12" />
            <circle cx="1015" cy="356" r="12" />
          </g>
        </svg>

        <div className={`${styles.flowLabel} ${styles.flowLabelInput}`}>
          <span>Attributed net sales</span><strong>{formatCompactCurrency(snapshot.attributedSales)}</strong>
        </div>
        <div className={`${styles.flowLabel} ${styles.flowLabelReimbursement}`}>
          <span>Product reimbursement</span><strong>{formatCompactCurrency(snapshot.productReimbursement)}</strong>
        </div>
        <div className={`${styles.flowLabel} ${styles.flowLabelPool}`}>
          <span>Gross-margin pool</span><strong>{formatCompactCurrency(snapshot.memberMarginShare + snapshot.partsGopherMarginShare)}</strong>
        </div>
        <div className={`${styles.flowLabel} ${styles.flowLabelMember}`}>
          <span>Member 50%</span><strong>{formatCompactCurrency(snapshot.memberMarginShare)}</strong>
        </div>
        <div className={`${styles.flowLabel} ${styles.flowLabelNetwork}`}>
          <span>Parts Gopher 50%</span><strong>{formatCompactCurrency(snapshot.partsGopherMarginShare)}</strong>
        </div>
        <div className={`${styles.flowLabel} ${styles.flowLabelAdjustments}`}>
          <span>Draft adjustments</span><strong>{formatCompactCurrency(snapshot.adjustments)}</strong>
        </div>

        <div className={styles.proceedsResult}>
          <span>Illustrative member proceeds</span>
          <strong>{formatCurrency(memberProceeds)}</strong>
          <small>Before final governed adjustments</small>
        </div>
      </div>

      <div className={styles.proceedsInspector}>
        <div className={styles.laneSwitch} role="group" aria-label="Inspect a proceeds lane">
          {lanes.map((lane) => (
            <button
              type="button"
              key={lane.id}
              aria-pressed={activeLane === lane.id}
              aria-controls="proceeds-lane-definition"
              onClick={() => setActiveLane(lane.id)}
            >
              <i data-lane={lane.id} />
              <span>{lane.label}</span>
              <strong>{formatCompactCurrency(lane.value)}</strong>
            </button>
          ))}
        </div>
        <div id="proceeds-lane-definition" className={styles.laneDefinition} aria-live="polite">
          <span>Selected lane</span>
          <strong>{active.label}</strong>
          <p>{active.detail}</p>
        </div>
      </div>
    </section>
  );
}

const fieldNodePositions = [
  [8, 20, 0.45], [17, 44, 0.72], [25, 17, 0.38], [31, 67, 0.58], [38, 34, 0.81],
  [45, 76, 0.34], [52, 21, 0.67], [57, 50, 0.42], [64, 82, 0.76], [70, 31, 0.52],
  [76, 62, 0.9], [83, 18, 0.43], [89, 45, 0.65], [92, 76, 0.35], [13, 78, 0.5],
] as const;

export function DemandCoverageField({ signals }: { signals: readonly AggregateDemandSignal[] }) {
  const revealRef = useGraphReveal<HTMLElement>();
  const [activeId, setActiveId] = useState(signals[0]?.id ?? "");
  const active = signals.find((signal) => signal.id === activeId) ?? signals[0];

  return (
    <section
      ref={revealRef}
      id="demand"
      className={styles.demand}
      data-graph-reveal="demand"
      aria-labelledby="demand-title"
    >
      <header className={styles.sectionHeadingInverse}>
        <div>
          <p className={styles.kicker}>Demand-coverage field</p>
          <h2 id="demand-title">See the gap before it becomes a missed order.</h2>
        </div>
        <p>
          Anonymous demand density and shared-inventory coverage rendered as an operating field—not a customer map.
        </p>
      </header>

      <div
        className={styles.coverageField}
      >
        <div className={styles.fieldPlane} aria-hidden="true">
          <svg viewBox="0 0 1000 560" preserveAspectRatio="none">
            <defs>
              <linearGradient id="field-scan" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="var(--tenant-primary)" stopOpacity="0" />
                <stop offset=".45" stopColor="#2ea8f4" stopOpacity=".7" />
                <stop offset=".52" stopColor="var(--tenant-secondary)" stopOpacity=".9" />
                <stop offset="1" stopColor="#ed1c24" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path pathLength="1" d="M-40 470C230 219 372 411 533 226S821 161 1040 38" />
            <path pathLength="1" d="M-60 386C219 160 376 345 517 174S812 103 1040 2" />
            <path pathLength="1" d="M-40 546C211 297 400 478 575 291S850 219 1040 101" />
          </svg>
          {fieldNodePositions.map(([left, top, strength], index) => (
            <i
              key={`${left}-${top}`}
              style={{
                "--field-left": `${left}%`,
                "--field-top": `${top}%`,
                "--field-strength": strength,
                "--field-delay": `${220 + index * 42}ms`,
              } as CSSProperties}
            />
          ))}
        </div>

        <div className={styles.signalHotspots}>
          {signals.map((signal, index) => (
            <button
              key={signal.id}
              type="button"
              className={activeId === signal.id ? styles.signalHotspotActive : undefined}
              data-signal={signal.signal}
              aria-pressed={activeId === signal.id}
              aria-controls="demand-signal-readout"
              onClick={() => setActiveId(signal.id)}
              style={{
                "--hotspot-x": `${[24, 48, 69, 82][index] ?? 50}%`,
                "--hotspot-y": `${[33, 69, 27, 66][index] ?? 50}%`,
                "--hotspot-delay": `${720 + index * 95}ms`,
              } as CSSProperties}
            >
              <i /><span>{signal.label}</span>
            </button>
          ))}
        </div>

        {active && (
          <aside id="demand-signal-readout" className={styles.signalReadout} aria-live="polite">
            <div>
              <span>Selected aggregate cell</span>
              <strong>{active.label}</strong>
            </div>
            <dl>
              <div><dt>Demand</dt><dd>{active.demandIndex}</dd></div>
              <div><dt>Availability</dt><dd>{active.availabilityIndex}</dd></div>
              <div><dt>Opportunity</dt><dd>{formatCompactCurrency(active.opportunityValue)}</dd></div>
            </dl>
            <p>{active.summary}</p>
          </aside>
        )}
      </div>

      <footer className={styles.fieldLegend}>
        <span><i data-signal="covered" /> Coverage strong</span>
        <span><i data-signal="watch" /> Watch signal</span>
        <span><i data-signal="stock-gap" /> Stock gap</span>
        <span><MemberIcon name="lock" /> Aggregated and privacy-safe</span>
      </footer>
    </section>
  );
}

export function BenchmarkRibbon({
  memberLabel,
  benchmarks,
}: {
  memberLabel: string;
  benchmarks: readonly MemberBenchmark[];
}) {
  const revealRef = useGraphReveal<HTMLElement>();
  return (
    <section
      ref={revealRef}
      id="benchmark"
      className={styles.benchmark}
      data-graph-reveal="benchmark"
      aria-labelledby="benchmark-title"
    >
      <header className={styles.sectionHeadingCompact}>
        <div>
          <p className={styles.kicker}>Benchmark ribbon</p>
          <h2 id="benchmark-title">Position without exposing peers.</h2>
        </div>
        <span>Illustrative cohort · minimum cohort rules pending</span>
      </header>

      <div className={styles.ribbonTrack}>
        {benchmarks.map((benchmark, index) => (
          <article
            key={benchmark.label}
            style={{ "--ribbon-delay": `${100 + index * 120}ms` } as CSSProperties}
          >
            <header>
              <span>{benchmark.label}</span>
              <strong>{benchmark.percentile}</strong>
            </header>
            <div
              className={styles.ribbonScale}
              role="img"
              aria-label={`${benchmark.label}: illustrative member index ${benchmark.value}, privacy-safe group median ${benchmark.median}, ${benchmark.delta}.`}
            >
              <i className={styles.ribbonFill} style={{ "--member-value": `${benchmark.value}%` } as CSSProperties} />
              <span className={styles.medianMarker} style={{ "--median-value": `${benchmark.median}%` } as CSSProperties}><b>Group median</b></span>
              <span className={styles.memberMarker} style={{ "--member-value": `${benchmark.value}%` } as CSSProperties}><b>{memberLabel}</b></span>
            </div>
            <footer><span>0</span><em>{benchmark.delta} vs. median</em><span>100</span></footer>
          </article>
        ))}
      </div>
    </section>
  );
}

const serviceIcons: Record<string, MemberIconName> = {
  inventory: "inventory",
  pricing: "pricing",
  locations: "locations",
  shipping: "shipping",
  statements: "statements",
  returns: "returns",
  reports: "reports",
  governance: "governance",
};

export function ServiceLauncher({ services }: { services: readonly MemberService[] }) {
  const revealRef = useGraphReveal<HTMLElement>();
  const [activeId, setActiveId] = useState(services[0]?.id ?? "");
  const active = services.find((service) => service.id === activeId) ?? services[0];

  return (
    <section
      ref={revealRef}
      id="services"
      className={styles.services}
      data-graph-reveal="services"
      aria-labelledby="services-title"
    >
      <header className={styles.sectionHeading}>
        <div>
          <p className={styles.kicker}>Service launcher</p>
          <h2 id="services-title">The member relationship, in one governed place.</h2>
        </div>
        <p>
          A reusable launch surface for the current Distranet portal capabilities and the next member services.
        </p>
      </header>

      <div className={styles.serviceConsole}>
        <ul className={styles.serviceGrid} aria-label="Member service previews">
          {services.map((service, index) => (
            <li
              key={service.id}
              style={{ "--service-delay": `${80 + index * 70}ms` } as CSSProperties}
            >
              <button
                type="button"
                aria-pressed={activeId === service.id}
                aria-controls="member-service-readout"
                onClick={() => setActiveId(service.id)}
                className={activeId === service.id ? styles.serviceActive : undefined}
              >
                <span className={styles.serviceIndex}>{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.serviceIcon}><MemberIcon name={serviceIcons[service.id] ?? "portrait"} /></span>
                <span className={styles.serviceCopy}><small>{service.eyebrow}</small><strong>{service.label}</strong></span>
                <MemberIcon name="arrow" className={styles.serviceArrow} />
              </button>
            </li>
          ))}
        </ul>

        {active && (
          <aside
            key={active.id}
            id="member-service-readout"
            className={styles.serviceReadout}
            aria-live="polite"
          >
            <div className={styles.serviceReadoutGlyph}>
              <MemberIcon name={serviceIcons[active.id] ?? "portrait"} />
              <i />
            </div>
            <div>
              <span>{active.eyebrow}</span>
              <h3>{active.label}</h3>
              <p>{active.description}</p>
            </div>
            <div className={styles.serviceStatus} data-status={active.status}>
              <span>Status</span>
              <strong>{active.status === "current-portal" ? "Current portal capability" : active.status === "governance" ? "Governance foundation" : "Planned member service"}</strong>
              <small>Prototype interaction · no production action taken</small>
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}

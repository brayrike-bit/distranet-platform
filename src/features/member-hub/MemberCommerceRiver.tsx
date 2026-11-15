"use client";

import Image from "next/image";
import { readableOnDarkColor } from "@/brands/member-theme";
import {
  useEffect,
  useId,
  useRef,
  type CSSProperties,
} from "react";
import type {
  MemberOverviewSnapshot,
  MemberTenantBrand,
} from "@/domain/member-hub/types";
import styles from "./MemberCommerceRiver.module.css";

type RiverStyle = CSSProperties & Record<`--${string}`, string | number>;

export type MemberCommerceRiverProps = {
  tenant: MemberTenantBrand;
  snapshot: MemberOverviewSnapshot;
  id?: string;
};

type RiverAct = {
  index: string;
  eyebrow: string;
  title: string;
  description: string;
  metrics: readonly {
    label: string;
    value: string;
    detail: string;
  }[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function segmentProgress(progress: number, start: number, end: number) {
  const normalized = Math.max(0, Math.min(1, (progress - start) / (end - start)));
  return normalized * normalized * (3 - 2 * normalized);
}

function brandVariables(tenant: MemberTenantBrand): RiverStyle {
  return {
    "--river-primary": readableOnDarkColor(tenant.palette.tenantBrand ?? tenant.palette.tenantPrimary),
    "--river-secondary": readableOnDarkColor(tenant.palette.tenantSecondary),
    "--river-ink": tenant.palette.tenantInk,
    "--river-tint": tenant.palette.tenantTint,
    "--river-network": tenant.palette.networkSignal,
    "--river-positive": tenant.palette.positive,
    "--river-caution": tenant.palette.caution,
  };
}

function buildActs(
  tenant: MemberTenantBrand,
  snapshot: MemberOverviewSnapshot,
): RiverAct[] {
  return [
    {
      index: "01",
      eyebrow: "Aggregate demand",
      title: "Anonymous intent enters the Parts Gopher storefront.",
      description:
        "The member view begins with aggregate commerce—not customer identities—and frames the selected period as an illustrative operating snapshot.",
      metrics: [
        {
          label: "Attributed sales",
          value: formatCurrency(snapshot.attributedSales),
          detail: snapshot.periodLabel,
        },
        {
          label: "Recognized orders",
          value: snapshot.recognizedOrders.toLocaleString("en-US"),
          detail: "Illustrative aggregate count",
        },
      ],
    },
    {
      index: "02",
      eyebrow: "Nearest-stock resolution",
      title: "Shared inventory turns demand into an explainable route.",
      description: `The routing story first looks for the closest in-stock ${tenant.shortName} location that can cover the requested lines, then widens only when availability requires it.`,
      metrics: [
        {
          label: "Inventory match",
          value: `${snapshot.matchRate.toFixed(1)}%`,
          detail: "Illustrative shared-inventory match",
        },
        {
          label: "Routing principle",
          value: "Nearest",
          detail: "In-stock member location",
        },
      ],
    },
    {
      index: "03",
      eyebrow: "Multi-member fulfillment",
      title: "One order can resolve across several member-owned legs.",
      description:
        "When no single location has every line, the flow branches across available members. Each participating member remains seller of record for its allocated lines.",
      metrics: [
        {
          label: "Split orders",
          value: snapshot.splitOrders.toLocaleString("en-US"),
          detail: snapshot.periodLabel,
        },
        {
          label: "Split rate",
          value: `${snapshot.splitRate.toFixed(1)}%`,
          detail: "Illustrative fulfillment mix",
        },
      ],
    },
    {
      index: "04",
      eyebrow: `${tenant.shortName} settlement`,
      title: "Product reimbursement and the gross-margin pool resolve separately.",
      description: `${tenant.displayName} receives the illustrated product reimbursement plus 50% of gross margin; the other 50% is shown as the Parts Gopher share. Adjustments remain visible rather than being hidden in a net total.`,
      metrics: [
        {
          label: "Product reimbursement",
          value: formatCurrency(snapshot.productReimbursement),
          detail: `${tenant.shortName} illustrated amount`,
        },
        {
          label: `${tenant.shortName} · 50% margin`,
          value: formatCurrency(snapshot.memberMarginShare),
          detail: "Member gross-margin share",
        },
        {
          label: "Parts Gopher · 50% margin",
          value: formatCurrency(snapshot.partsGopherMarginShare),
          detail: "Network gross-margin share",
        },
      ],
    },
  ];
}

export function MemberCommerceRiver({
  tenant,
  snapshot,
  id = "value-flow",
}: MemberCommerceRiverProps) {
  const componentId = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const acts = buildActs(tenant, snapshot);
  const titleId = `${componentId}-title`;
  const svgTitleId = `${componentId}-svg-title`;
  const svgDescriptionId = `${componentId}-svg-description`;
  const gridId = `${componentId}-grid`;
  const demandGradientId = `${componentId}-demand-gradient`;
  const routeGradientId = `${componentId}-route-gradient`;
  const settlementGradientId = `${componentId}-settlement-gradient`;
  const glowId = `${componentId}-glow`;

  useEffect(() => {
    const root = rootRef.current;
    const sticky = stickyRef.current;
    if (!root || !sticky) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const styleCache = new Map<string, string>();
    let near = false;
    let frame = 0;
    let geometryDirty = true;
    let lastAct = -1;
    let lastNear: boolean | null = null;
    let lastReduced: boolean | null = null;
    let geometry = {
      top: 0,
      height: 1,
      viewportHeight: Math.max(1, window.innerHeight),
      travel: 1,
    };

    const setVariable = (property: string, value: string) => {
      if (styleCache.get(property) === value) return;
      styleCache.set(property, value);
      root.style.setProperty(property, value);
    };

    const setAct = (act: number) => {
      if (lastAct === act) return;
      lastAct = act;
      root.dataset.act = String(act);
    };

    const setNear = (nextNear: boolean) => {
      if (lastNear === nextNear) return;
      lastNear = nextNear;
      root.dataset.near = String(nextNear);
    };

    const isReduced = () =>
      motionQuery.matches || document.body.dataset.motion === "reduced";

    const setReduced = (reduced: boolean) => {
      if (lastReduced === reduced) return;
      lastReduced = reduced;
      root.dataset.reduced = String(reduced);
    };

    const measureGeometry = () => {
      const rect = root.getBoundingClientRect();
      const viewportHeight = Math.max(1, window.innerHeight);
      geometry = {
        top: rect.top + window.scrollY,
        height: Math.max(1, rect.height),
        viewportHeight,
        travel: Math.max(1, rect.height - viewportHeight),
      };
      geometryDirty = false;
    };

    const paint = () => {
      frame = 0;
      if (!near) return;
      if (geometryDirty) measureGeometry();

      const reduced = isReduced();
      setReduced(reduced);
      if (reduced) {
        setVariable("--river-progress", "1");
        setVariable("--demand-progress", "1");
        setVariable("--match-progress", "1");
        setVariable("--branch-progress", "1");
        setVariable("--settlement-progress", "1");
        setVariable("--demand-scale", "1");
        setVariable("--match-scale", "1");
        setVariable("--branch-scale", "1");
        setVariable("--settlement-scale", "1");
        setVariable("--river-shift", "0px");
        setAct(3);
        return;
      }

      const progress = Math.max(
        0,
        Math.min(1, (window.scrollY - geometry.top) / geometry.travel),
      );
      const demand = segmentProgress(progress, 0, 0.27);
      const match = segmentProgress(progress, 0.16, 0.49);
      const branch = segmentProgress(progress, 0.39, 0.74);
      const settlement = segmentProgress(progress, 0.65, 1);
      const activeAct = progress < 0.235 ? 0 : progress < 0.485 ? 1 : progress < 0.735 ? 2 : 3;

      setVariable("--river-progress", progress.toFixed(4));
      setVariable("--demand-progress", demand.toFixed(4));
      setVariable("--match-progress", match.toFixed(4));
      setVariable("--branch-progress", branch.toFixed(4));
      setVariable("--settlement-progress", settlement.toFixed(4));
      setVariable("--demand-scale", (0.72 + demand * 0.28).toFixed(4));
      setVariable("--match-scale", (0.72 + match * 0.28).toFixed(4));
      setVariable("--branch-scale", (0.72 + branch * 0.28).toFixed(4));
      setVariable("--settlement-scale", (0.72 + settlement * 0.28).toFixed(4));
      setVariable("--river-shift", `${((0.5 - progress) * 14).toFixed(2)}px`);
      setAct(activeAct);
    };

    const requestPaint = () => {
      if (!near || frame) return;
      frame = window.requestAnimationFrame(paint);
    };

    const requestMeasure = () => {
      geometryDirty = true;
      requestPaint();
    };

    const updateNearState = (nextNear: boolean) => {
      if (near === nextNear) return;
      near = nextNear;
      setNear(near);
      if (near) {
        geometryDirty = true;
        requestPaint();
      } else if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    measureGeometry();
    const initialTop = geometry.top - window.scrollY;
    near =
      initialTop < geometry.viewportHeight * 2 &&
      initialTop + geometry.height > -geometry.viewportHeight;
    setNear(near);
    setReduced(isReduced());

    const intersectionObserver =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            ([entry]) => updateNearState(Boolean(entry?.isIntersecting)),
            { rootMargin: "100% 0px 100% 0px", threshold: 0 },
          );
    intersectionObserver?.observe(root);
    if (!intersectionObserver) updateNearState(true);

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(requestMeasure);
    resizeObserver?.observe(root);
    resizeObserver?.observe(sticky);

    const motionObserver = new MutationObserver(() => {
      setReduced(isReduced());
      requestMeasure();
    });
    motionObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-motion"],
    });

    if (near) requestPaint();
    window.addEventListener("scroll", requestPaint, { passive: true });
    window.addEventListener("resize", requestMeasure, { passive: true });
    root.addEventListener("load", requestMeasure, true);
    motionQuery.addEventListener("change", requestMeasure);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      intersectionObserver?.disconnect();
      resizeObserver?.disconnect();
      motionObserver.disconnect();
      window.removeEventListener("scroll", requestPaint);
      window.removeEventListener("resize", requestMeasure);
      root.removeEventListener("load", requestMeasure, true);
      motionQuery.removeEventListener("change", requestMeasure);
    };
  }, []);

  return (
    <section
      ref={rootRef}
      id={id}
      className={styles.river}
      style={brandVariables(tenant)}
      aria-labelledby={titleId}
      data-act="0"
      data-near="false"
      data-reduced="false"
      data-confidence={snapshot.confidence}
    >
      <div ref={stickyRef} className={styles.sticky}>
        <div className={styles.ambient} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <header className={styles.topRail}>
          <div className={styles.tenantLockup}>
            <span className={styles.logoFrame}>
              <Image
                unoptimized
                src={tenant.logo.src}
                style={{ background: tenant.logo.background ?? "#fff", objectFit: "contain", padding: 5, borderRadius: 5 }}
                alt={tenant.logo.alt}
                width={tenant.logo.width}
                height={tenant.logo.height}
                sizes="(max-width: 760px) 128px, 160px"
              />
            </span>
            <span>
              <strong>{tenant.shortName} commerce river</strong>
              <small>{snapshot.periodLabel}</small>
            </span>
          </div>
          <div className={styles.assurance}>
            <i aria-hidden="true" />
            <span>
              <strong>Illustrative operating flow</strong>
              <small>Aggregate only · no customer identities</small>
            </span>
          </div>
        </header>

        <div className={styles.stage}>
          <div className={styles.intro}>
            <p>Parts Gopher → member economics</p>
            <h2 id={titleId}>See demand become {tenant.shortName} proceeds.</h2>
            <p className={styles.introCopy}>
              A scroll-linked explanation of the proposed allocation and settlement model,
              using the selected prototype snapshot—not live transactional data.
            </p>

            <div className={styles.progressRail} aria-hidden="true">
              <i><span /></i>
              <ol>
                {acts.map((act, index) => (
                  <li key={act.index} data-river-marker={index}>
                    <span>{act.index}</span>
                    <small>{act.eyebrow}</small>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <figure className={styles.figure}>
            <div className={styles.diagramFrame}>
              <svg
                className={styles.diagram}
                viewBox="0 0 1200 720"
                role="img"
                aria-labelledby={`${svgTitleId} ${svgDescriptionId}`}
                preserveAspectRatio="xMidYMid meet"
              >
                <title id={svgTitleId}>{`Illustrative Parts Gopher demand, allocation, and ${tenant.shortName} settlement flow`}</title>
                <desc id={svgDescriptionId}>Aggregate demand enters Parts Gopher, routes toward the nearest available member inventory, can split across multiple member sellers, and resolves into product reimbursement plus equal member and Parts Gopher gross-margin shares.</desc>
                <defs>
                  <pattern id={gridId} width="44" height="44" patternUnits="userSpaceOnUse">
                    <path d="M44 0H0V44" fill="none" stroke="currentColor" strokeWidth="1" />
                  </pattern>
                  <linearGradient id={demandGradientId} x1="0" y1="0" x2="1" y2="0">
                    <stop stopColor="var(--river-primary)" stopOpacity="0" />
                    <stop offset=".42" stopColor="var(--river-primary)" />
                    <stop offset="1" stopColor="var(--river-network)" />
                  </linearGradient>
                  <linearGradient id={routeGradientId} x1="0" y1="0" x2="1" y2="0">
                    <stop stopColor="var(--river-network)" />
                    <stop offset="1" stopColor="var(--river-secondary)" />
                  </linearGradient>
                  <linearGradient id={settlementGradientId} x1="0" y1="0" x2="1" y2="0">
                    <stop stopColor="var(--river-secondary)" />
                    <stop offset="1" stopColor="var(--river-primary)" />
                  </linearGradient>
                  <radialGradient id={`${componentId}-core`}>
                    <stop stopColor="var(--river-network)" stopOpacity=".92" />
                    <stop offset=".54" stopColor="var(--river-network)" stopOpacity=".28" />
                    <stop offset="1" stopColor="var(--river-ink)" stopOpacity="0" />
                  </radialGradient>
                  <filter id={glowId} x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="7" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <rect className={styles.svgGrid} width="1200" height="720" fill={`url(#${gridId})`} />
                <g className={styles.coordinates} aria-hidden="true">
                  <path d="M66 82H1134M66 638H1134" />
                  <path d="M66 82V638M1134 82V638" />
                  <text x="70" y="68">AGGREGATE COMMERCE / FLOW 01</text>
                  <text x="1130" y="68" textAnchor="end">{snapshot.period} · {snapshot.effectiveDate}</text>
                </g>

                <g className={styles.basePaths} aria-hidden="true">
                  <path pathLength="1" d="M72 214C164 214 205 282 310 324" />
                  <path pathLength="1" d="M72 330C170 330 220 330 310 330" />
                  <path pathLength="1" d="M72 446C164 446 205 378 310 336" />
                  <path pathLength="1" d="M438 310C548 278 590 176 704 176" />
                  <path pathLength="1" d="M442 330H704" />
                  <path pathLength="1" d="M438 350C548 382 590 484 704 484" />
                  <path pathLength="1" d="M778 176C870 176 884 274 956 310" />
                  <path pathLength="1" d="M778 330H948" />
                  <path pathLength="1" d="M778 484C870 484 884 386 956 350" />
                  <path pathLength="1" d="M1016 296C1066 266 1078 226 1130 208" />
                  <path pathLength="1" d="M1020 350C1070 382 1084 432 1130 454" />
                  <path pathLength="1" d="M1028 330H1130" />
                </g>

                <g className={styles.demandFlow} aria-hidden="true" filter={`url(#${glowId})`}>
                  <path pathLength="1" d="M72 214C164 214 205 282 310 324" stroke={`url(#${demandGradientId})`} />
                  <path pathLength="1" d="M72 330C170 330 220 330 310 330" stroke={`url(#${demandGradientId})`} />
                  <path pathLength="1" d="M72 446C164 446 205 378 310 336" stroke={`url(#${demandGradientId})`} />
                </g>

                <g className={styles.branchFlow} aria-hidden="true" filter={`url(#${glowId})`}>
                  <path pathLength="1" d="M438 310C548 278 590 176 704 176" stroke={`url(#${routeGradientId})`} />
                  <path pathLength="1" d="M442 330H704" stroke={`url(#${routeGradientId})`} />
                  <path pathLength="1" d="M438 350C548 382 590 484 704 484" stroke={`url(#${routeGradientId})`} />
                </g>

                <g className={styles.mergeFlow} aria-hidden="true" filter={`url(#${glowId})`}>
                  <path pathLength="1" d="M778 176C870 176 884 274 956 310" stroke={`url(#${settlementGradientId})`} />
                  <path pathLength="1" d="M778 330H948" stroke={`url(#${settlementGradientId})`} />
                  <path pathLength="1" d="M778 484C870 484 884 386 956 350" stroke={`url(#${settlementGradientId})`} />
                </g>

                <g className={styles.settlementFlow} aria-hidden="true" filter={`url(#${glowId})`}>
                  <path pathLength="1" d="M1016 296C1066 266 1078 226 1130 208" stroke={`url(#${settlementGradientId})`} />
                  <path pathLength="1" d="M1028 330H1130" stroke={`url(#${settlementGradientId})`} />
                  <path pathLength="1" d="M1020 350C1070 382 1084 432 1130 454" stroke={`url(#${routeGradientId})`} />
                </g>

                <g className={styles.demandNodes} aria-hidden="true">
                  {[214, 330, 446].map((y, index) => (
                    <g key={y} className={styles.demandNode}>
                      <circle cx="72" cy={y} r="24" />
                      <circle className={styles.nodePulse} cx="72" cy={y} r="13" />
                      <text x="72" y={y + 5} textAnchor="middle">{String(index + 1).padStart(2, "0")}</text>
                    </g>
                  ))}
                  <text className={styles.svgLabel} x="72" y="512" textAnchor="middle">AGGREGATE DEMAND</text>
                  <text className={styles.svgSubLabel} x="72" y="535" textAnchor="middle">IDENTITY SUPPRESSED</text>
                </g>

                <g className={styles.partsGopherNode} aria-hidden="true">
                  <circle cx="374" cy="330" r="90" fill={`url(#${componentId}-core)`} />
                  <circle className={styles.orbitOuter} cx="374" cy="330" r="68" />
                  <circle className={styles.orbitInner} cx="374" cy="330" r="48" />
                  <path d="M374 246V270M374 390V414M290 330H314M434 330H458" />
                  <text className={styles.nodeKicker} x="374" y="317" textAnchor="middle">PARTS GOPHER</text>
                  <text className={styles.nodeValue} x="374" y="344" textAnchor="middle">ROUTE</text>
                  <text className={styles.nodeDetail} x="374" y="366" textAnchor="middle">SHARED INVENTORY</text>
                </g>

                <g className={styles.memberNodes} aria-hidden="true">
                  <g className={styles.memberNodePrimary}>
                    <circle cx="742" cy="176" r="50" />
                    <circle className={styles.nodePulse} cx="742" cy="176" r="34" />
                    <text className={styles.nodeKicker} x="742" y="169" textAnchor="middle">{tenant.shortName}</text>
                    <text className={styles.nodeDetail} x="742" y="191" textAnchor="middle">NEAREST STOCK</text>
                  </g>
                  <g className={styles.memberNodeSecondary}>
                    <circle cx="742" cy="330" r="50" />
                    <circle className={styles.nodePulse} cx="742" cy="330" r="34" />
                    <text className={styles.nodeKicker} x="742" y="323" textAnchor="middle">MEMBER 07</text>
                    <text className={styles.nodeDetail} x="742" y="345" textAnchor="middle">IN-STOCK LEG</text>
                  </g>
                  <g className={styles.memberNodeTertiary}>
                    <circle cx="742" cy="484" r="50" />
                    <circle className={styles.nodePulse} cx="742" cy="484" r="34" />
                    <text className={styles.nodeKicker} x="742" y="477" textAnchor="middle">MEMBER 12</text>
                    <text className={styles.nodeDetail} x="742" y="499" textAnchor="middle">STOCK-GAP LEG</text>
                  </g>
                  <text className={styles.svgLabel} x="742" y="562" textAnchor="middle">MULTI-MEMBER FULFILLMENT</text>
                  <text className={styles.svgSubLabel} x="742" y="585" textAnchor="middle">SELLER OWNERSHIP STAYS WITH EACH LEG</text>
                </g>

                <g className={styles.settlementNode} aria-hidden="true">
                  <circle cx="986" cy="330" r="66" />
                  <circle className={styles.nodePulse} cx="986" cy="330" r="46" />
                  <path d="M958 330H1014M986 302V358" />
                  <text className={styles.nodeKicker} x="986" y="420" textAnchor="middle">{tenant.shortName} SETTLEMENT</text>
                  <text className={styles.nodeDetail} x="986" y="443" textAnchor="middle">REIMBURSEMENT + MARGIN</text>
                </g>

                <g className={styles.outputNodes} aria-hidden="true">
                  <g>
                    <rect x="1110" y="169" width="70" height="78" rx="14" />
                    <text className={styles.outputValue} x="1145" y="202" textAnchor="middle">COST</text>
                    <text className={styles.outputDetail} x="1145" y="224" textAnchor="middle">REPAID</text>
                  </g>
                  <g>
                    <rect x="1110" y="291" width="70" height="78" rx="14" />
                    <text className={styles.outputValue} x="1145" y="324" textAnchor="middle">50%</text>
                    <text className={styles.outputDetail} x="1145" y="346" textAnchor="middle">MEMBER</text>
                  </g>
                  <g>
                    <rect x="1110" y="415" width="70" height="78" rx="14" />
                    <text className={styles.outputValue} x="1145" y="448" textAnchor="middle">50%</text>
                    <text className={styles.outputDetail} x="1145" y="470" textAnchor="middle">PG</text>
                  </g>
                </g>

                <g className={styles.particles} aria-hidden="true">
                  <circle className={styles.particleDemandA} cx="166" cy="330" r="5" />
                  <circle className={styles.particleDemandB} cx="234" cy="330" r="3" />
                  <circle className={styles.particleBranchA} cx="562" cy="249" r="5" />
                  <circle className={styles.particleBranchB} cx="592" cy="330" r="4" />
                  <circle className={styles.particleBranchC} cx="562" cy="411" r="5" />
                  <circle className={styles.particleSettleA} cx="862" cy="218" r="4" />
                  <circle className={styles.particleSettleB} cx="864" cy="330" r="5" />
                  <circle className={styles.particleSettleC} cx="862" cy="442" r="4" />
                </g>
              </svg>
            </div>
            <figcaption>
              Scroll through four acts: aggregate demand, nearest-stock matching,
              multi-member fulfillment, and {tenant.shortName} settlement.
            </figcaption>
          </figure>

          <ol className={styles.acts} aria-label="Commerce river stages">
            {acts.map((act, index) => (
              <li key={act.index} className={styles.act} data-river-act={index}>
                <div className={styles.actHeading}>
                  <span>{act.index}</span>
                  <p>{act.eyebrow}</p>
                </div>
                <h3>{act.title}</h3>
                <p>{act.description}</p>
                <dl>
                  {act.metrics.map((metric) => (
                    <div key={metric.label}>
                      <dt>{metric.label}</dt>
                      <dd>{metric.value}</dd>
                      <small>{metric.detail}</small>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ol>
        </div>

        <footer className={styles.bottomRail}>
          <span>
            <i aria-hidden="true" />
            {snapshot.confidence.replace("-", " ")} data · effective {snapshot.effectiveDate}
          </span>
          <span>Adjustments shown separately: {formatCurrency(snapshot.adjustments)}</span>
          <span>Scroll to trace the allocation logic</span>
        </footer>
      </div>
    </section>
  );
}

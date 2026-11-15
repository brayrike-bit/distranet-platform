"use client";

import Image from "next/image";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import type { MemberTenantBrand } from "@/domain/member-hub/types";
import { MemberIcon } from "./components/MemberIcon";
import styles from "./OrderAllocationSettlementLab.module.css";

export type AllocationLeg = {
  id: string;
  label: string;
  shortLabel: string;
  locationLabel: string;
  status: string;
  lineCount: number;
  distanceBand: string;
  saleValue: number;
  tenantOwned: boolean;
  reimbursement?: number;
  marginPool?: number;
};

export type AllocationScenario = {
  id: string;
  orderCode: string;
  title: string;
  summary: string;
  orderValue: number;
  lineCount: number;
  routingOutcome: string;
  legs: AllocationLeg[];
};

function buildIllustrativeScenarios(tenant: MemberTenantBrand): AllocationScenario[] {
  const namedLocations =
    tenant.slug === "air-hydro-power"
      ? ["Louisville", "Bowling Green", "Lexington"]
      : ["Location 01", "Location 02", "Location 03"];

  return [
  {
    id: "complete-match",
    orderCode: "PG-27A",
    title: "Nearest-stock match",
    summary: `One ${tenant.shortName} location can fulfill every requested line.`,
    orderValue: 3_860,
    lineCount: 4,
    routingOutcome: "Complete order routed to the nearest in-stock member",
    legs: [
      {
        id: `${tenant.slug}-location-01`,
        label: `${tenant.displayName} · ${namedLocations[0]}`,
        shortLabel: `${tenant.shortName} ${namedLocations[0]}`,
        locationLabel: "Tenant allocation",
        status: "Nearest complete in-stock match",
        lineCount: 4,
        distanceBand: "42–58 mi routing band",
        saleValue: 3_860,
        tenantOwned: true,
        reimbursement: 2_680,
        marginPool: 1_180,
      },
    ],
  },
  {
    id: "two-member-split",
    orderCode: "PG-58C",
    title: "Two-member split",
    summary: `${tenant.shortName} covers the primary lines; one member closes the stock gap.`,
    orderValue: 5_840,
    lineCount: 6,
    routingOutcome: "Six lines resolved across two in-stock member locations",
    legs: [
      {
        id: `${tenant.slug}-location-02`,
        label: `${tenant.displayName} · ${namedLocations[1]}`,
        shortLabel: `${tenant.shortName} ${namedLocations[1]}`,
        locationLabel: "Tenant allocation",
        status: "Primary nearby allocation",
        lineCount: 3,
        distanceBand: "18–34 mi routing band",
        saleValue: 3_420,
        tenantOwned: true,
        reimbursement: 2_330,
        marginPool: 1_090,
      },
      {
        id: "member-07",
        label: "Distranet member 07",
        shortLabel: "Member 07",
        locationLabel: "Identity suppressed",
        status: "Supplemental in-stock allocation",
        lineCount: 3,
        distanceBand: "Network routing band",
        saleValue: 2_420,
        tenantOwned: false,
      },
    ],
  },
  {
    id: "three-member-split",
    orderCode: "PG-91F",
    title: "Three-member recovery",
    summary: "The network assembles a complete order no single member could cover.",
    orderValue: 9_120,
    lineCount: 11,
    routingOutcome: "Eleven lines recovered through a three-member availability split",
    legs: [
      {
        id: `${tenant.slug}-location-03`,
        label: `${tenant.displayName} · ${namedLocations[2]}`,
        shortLabel: `${tenant.shortName} ${namedLocations[2]}`,
        locationLabel: "Tenant allocation",
        status: "Largest nearby allocation",
        lineCount: 4,
        distanceBand: "26–41 mi routing band",
        saleValue: 4_760,
        tenantOwned: true,
        reimbursement: 3_220,
        marginPool: 1_540,
      },
      {
        id: "member-12",
        label: "Distranet member 12",
        shortLabel: "Member 12",
        locationLabel: "Identity suppressed",
        status: "Secondary in-stock allocation",
        lineCount: 4,
        distanceBand: "Network routing band",
        saleValue: 2_780,
        tenantOwned: false,
      },
      {
        id: "member-18",
        label: "Distranet member 18",
        shortLabel: "Member 18",
        locationLabel: "Identity suppressed",
        status: "Rare-stock completion allocation",
        lineCount: 3,
        distanceBand: "Network routing band",
        saleValue: 1_580,
        tenantOwned: false,
      },
    ],
  },
  ];
}

const ROUTE_Y: Record<number, number[]> = {
  1: [270],
  2: [172, 368],
  3: [116, 270, 424],
};

function getRouteY(index: number, legCount: number) {
  const preset = ROUTE_Y[legCount]?.[index];
  if (preset !== undefined) return preset;

  if (legCount <= 1) return 270;

  const firstRouteY = 72;
  const lastRouteY = 468;
  const safeIndex = Math.min(Math.max(index, 0), legCount - 1);
  return firstRouteY + ((lastRouteY - firstRouteY) * safeIndex) / (legCount - 1);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function brandVariables(tenant: MemberTenantBrand): CSSProperties {
  return {
    "--lab-primary": tenant.palette.tenantPrimary,
    "--lab-secondary": tenant.palette.tenantSecondary,
    "--lab-ink": tenant.palette.tenantInk,
    "--lab-tint": tenant.palette.tenantTint,
    "--lab-network": tenant.palette.networkSignal,
    "--lab-positive": tenant.palette.positive,
    "--lab-caution": tenant.palette.caution,
  } as CSSProperties;
}

export function OrderAllocationSettlementLab({
  tenant,
  scenarios: suppliedScenarios,
}: {
  tenant: MemberTenantBrand;
  scenarios?: readonly AllocationScenario[];
}) {
  const componentId = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLElement>(null);
  const validSuppliedScenarios = suppliedScenarios?.filter((candidate) => candidate.legs.length > 0);
  const scenarios = validSuppliedScenarios?.length
    ? validSuppliedScenarios
    : buildIllustrativeScenarios(tenant);
  const initialScenario = scenarios[Math.min(1, scenarios.length - 1)];
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [scenarioId, setScenarioId] = useState(initialScenario.id);
  const [legId, setLegId] = useState(
    initialScenario.legs.find((leg) => leg.tenantOwned)?.id ?? initialScenario.legs[0].id,
  );
  const [entered, setEntered] = useState(false);
  const scenario =
    scenarios.find((candidate) => candidate.id === scenarioId) ?? scenarios[0];
  const selectedLeg = scenario.legs.find((leg) => leg.id === legId) ?? scenario.legs[0];
  const memberMargin = (selectedLeg.marginPool ?? 0) / 2;
  const networkMargin = (selectedLeg.marginPool ?? 0) / 2;
  const memberProceeds = (selectedLeg.reimbursement ?? 0) + memberMargin;

  useEffect(() => {
    const root = rootRef.current;
    if (!root || entered) return;
    if (typeof IntersectionObserver === "undefined") {
      setEntered(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setEntered(true);
        observer.disconnect();
      },
      { threshold: 0.16, rootMargin: "0px 0px -8%" },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [entered]);

  function chooseScenario(next: AllocationScenario) {
    setScenarioId(next.id);
    setLegId(next.legs.find((leg) => leg.tenantOwned)?.id ?? next.legs[0].id);
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % scenarios.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + scenarios.length) % scenarios.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = scenarios.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    chooseScenario(scenarios[nextIndex]);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <section
      ref={rootRef}
      id="allocation"
      className={styles.lab}
      style={brandVariables(tenant)}
      aria-labelledby={`${componentId}-title`}
      data-illustrative="true"
      data-entered={entered}
    >
      <header className={styles.heading}>
        <div>
          <p>Parts Gopher · allocation + settlement lab</p>
          <h2 id={`${componentId}-title`}>
            Follow one order from anonymous demand to {tenant.shortName} proceeds.
          </h2>
        </div>
        <div className={styles.headingContext}>
          <span><MemberIcon name="lock" /> Illustrative · aggregate only</span>
          <p>
            Explore the operating logic without exposing a customer identity. Every value in
            this lab is fixed example data—not a live Parts Gopher record.
          </p>
        </div>
      </header>

      <div
        className={styles.scenarioTabs}
        role="tablist"
        aria-label="Choose an illustrative order allocation scenario"
      >
        {scenarios.map((candidate, index) => {
          const selected = candidate.id === scenario.id;
          return (
            <button
              ref={(node) => { tabRefs.current[index] = node; }}
              type="button"
              role="tab"
              id={`${componentId}-tab-${candidate.id}`}
              aria-selected={selected}
              aria-controls={`${componentId}-scenario-panel`}
              tabIndex={selected ? 0 : -1}
              key={candidate.id}
              onClick={() => chooseScenario(candidate)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{candidate.title}</strong>
              <small>{candidate.legs.length} fulfillment {candidate.legs.length === 1 ? "member" : "members"}</small>
            </button>
          );
        })}
      </div>

      <div
        id={`${componentId}-scenario-panel`}
        role="tabpanel"
        aria-labelledby={`${componentId}-tab-${scenario.id}`}
        className={styles.scenarioPanel}
      >
        <div className={styles.scenarioReadout} aria-live="polite">
          <div>
            <span>{scenario.orderCode} · illustrative order</span>
            <strong>{scenario.summary}</strong>
          </div>
          <dl>
            <div><dt>Order value</dt><dd>{formatCurrency(scenario.orderValue)}</dd></div>
            <div><dt>Lines resolved</dt><dd>{scenario.lineCount}</dd></div>
            <div><dt>Fulfillers</dt><dd>{scenario.legs.length}</dd></div>
          </dl>
        </div>

        <div className={styles.routeStage} key={scenario.id}>
          <div className={styles.stageGrid} aria-hidden="true" />
          <div className={styles.scanPlane} aria-hidden="true" />

          <svg className={styles.routeLines} viewBox="0 0 1000 540" aria-hidden="true">
            <defs>
              <linearGradient id={`${componentId}-input-gradient`} x1="0" x2="1">
                <stop stopColor="var(--lab-secondary)" stopOpacity=".28" />
                <stop offset="1" stopColor="var(--lab-primary)" />
              </linearGradient>
              <linearGradient id={`${componentId}-tenant-gradient`} x1="0" x2="1">
                <stop stopColor="var(--lab-primary)" />
                <stop offset="1" stopColor="var(--lab-secondary)" />
              </linearGradient>
              <linearGradient id={`${componentId}-network-gradient`} x1="0" x2="1">
                <stop stopColor="var(--lab-primary)" />
                <stop offset="1" stopColor="var(--lab-network)" />
              </linearGradient>
              <filter id={`${componentId}-route-glow`} x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <path
              className={styles.inputRoute}
              d="M126 270C242 270 278 270 405 270"
              stroke={`url(#${componentId}-input-gradient)`}
            />
            {scenario.legs.map((leg, index) => {
              const routeY = getRouteY(index, scenario.legs.length);
              return (
                <path
                  key={leg.id}
                  className={leg.id === selectedLeg.id ? styles.routeSelected : styles.routeMuted}
                  d={`M515 270C626 270 657 ${routeY} 778 ${routeY}`}
                  stroke={`url(#${componentId}-${leg.tenantOwned ? "tenant" : "network"}-gradient)`}
                  filter={`url(#${componentId}-route-glow)`}
                />
              );
            })}
            <circle className={styles.routePort} cx="126" cy="270" r="7" />
            <circle className={styles.routePort} cx="405" cy="270" r="7" />
            <circle className={styles.routePort} cx="515" cy="270" r="7" />
            {scenario.legs.map((leg, index) => (
              <circle
                key={`${leg.id}-port`}
                className={leg.id === selectedLeg.id ? styles.routePortActive : styles.routePort}
                cx="778"
                cy={getRouteY(index, scenario.legs.length)}
                r="7"
              />
            ))}
          </svg>

          <div className={styles.orderSignal}>
            <span>Anonymous order signal</span>
            <strong>{scenario.orderCode}</strong>
            <small>Customer identity withheld</small>
            <i aria-hidden="true" />
          </div>

          <div className={styles.routingCore}>
            <span>Parts Gopher routing core</span>
            <div aria-hidden="true"><i /><i /><i /></div>
            <ol>
              <li><b>01</b> Geolocate privately</li>
              <li><b>02</b> Query shared inventory</li>
              <li><b>03</b> Select nearest in-stock path</li>
            </ol>
          </div>

          <div className={styles.fulfillmentNodes} style={{ "--leg-count": scenario.legs.length } as CSSProperties}>
            {scenario.legs.map((leg) => (
              <button
                type="button"
                key={leg.id}
                className={leg.id === selectedLeg.id ? styles.nodeSelected : undefined}
                aria-pressed={leg.id === selectedLeg.id}
                onClick={() => setLegId(leg.id)}
              >
                <span className={leg.tenantOwned ? styles.tenantNodeMark : styles.networkNodeMark}>
                  {leg.tenantOwned ? (
                    <Image
                      unoptimized
                      src={tenant.logo.src}
                      style={{ background: tenant.logo.background ?? "#fff", objectFit: "contain", padding: 4, borderRadius: 4 }}
                      alt=""
                      width={tenant.logo.width}
                      height={tenant.logo.height}
                      aria-hidden="true"
                      sizes="112px"
                    />
                  ) : (
                    <MemberIcon name="operations" />
                  )}
                </span>
                <span>
                  <small>{leg.locationLabel}</small>
                  <strong>{leg.shortLabel}</strong>
                  <em>{leg.lineCount} {leg.lineCount === 1 ? "line" : "lines"} · {leg.distanceBand}</em>
                </span>
                <MemberIcon name="arrow" />
              </button>
            ))}
          </div>

          <p className={styles.routeOutcome}>
            <MemberIcon name="split" />
            <span><small>Routing outcome</small><strong>{scenario.routingOutcome}</strong></span>
          </p>
        </div>

        <div className={styles.allocationInspector}>
          <div className={styles.selectedAllocation}>
            <span>Selected allocation</span>
            <strong>{selectedLeg.label}</strong>
            <p>{selectedLeg.status}. The fulfilling member is seller of record for its allocation.</p>
            <dl>
              <div><dt>Allocated lines</dt><dd>{selectedLeg.lineCount}</dd></div>
              <div><dt>Allocated sale</dt><dd>{formatCurrency(selectedLeg.saleValue)}</dd></div>
              <div><dt>Customer view</dt><dd>Aggregate only</dd></div>
            </dl>
          </div>

          {selectedLeg.tenantOwned ? (
            <div className={styles.settlementMachine} aria-live="polite">
              <header>
                <span>{tenant.shortName} settlement explanation</span>
                <strong>{formatCurrency(memberProceeds)}</strong>
                <small>Illustrative member proceeds before governed adjustments</small>
              </header>
              <div className={styles.settlementFormula}>
                <div className={styles.reimbursementSegment}>
                  <span>Part-price reimbursement</span>
                  <strong>{formatCurrency(selectedLeg.reimbursement ?? 0)}</strong>
                </div>
                <span aria-hidden="true">+</span>
                <div className={styles.marginSegment}>
                  <span>50% member gross margin</span>
                  <strong>{formatCurrency(memberMargin)}</strong>
                </div>
                <span aria-hidden="true">=</span>
                <div className={styles.proceedsSegment}>
                  <span>{tenant.shortName} proceeds</span>
                  <strong>{formatCurrency(memberProceeds)}</strong>
                </div>
              </div>
              <div className={styles.marginSplit}>
                <span style={{ "--share": "50%" } as CSSProperties}>
                  <i />{tenant.shortName} · {formatCurrency(memberMargin)}
                </span>
                <span style={{ "--share": "50%" } as CSSProperties}>
                  <i />Parts Gopher · {formatCurrency(networkMargin)}
                </span>
              </div>
              <p>
                Gross-margin pool: <strong>{formatCurrency(selectedLeg.marginPool ?? 0)}</strong> · split 50/50.
                Returns, shipping, fees, discounts, tax, and chargebacks remain a governed reconciliation lane.
              </p>
            </div>
          ) : (
            <div className={styles.maskedSettlement} aria-live="polite">
              <MemberIcon name="lock" />
              <div>
                <span>Prototype boundary preview</span>
                <strong>Another member’s illustrative settlement is masked in this example.</strong>
                <p>
                  This interface demonstrates the intended aggregate view for {tenant.shortName}. Production
                  access controls and server-enforced tenant isolation are not connected yet.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className={styles.governanceRail}>
        <p><span>Operating contract</span><strong>What this interface makes explicit</strong></p>
        <ol>
          <li><b>Routing</b><span>Nearest member with available stock</span></li>
          <li><b>Splits</b><span>Multiple members can fulfill one order</span></li>
          <li><b>Economics</b><span>Part price + 50% of gross margin</span></li>
          <li><b>Privacy</b><span>Customer identity never appears here</span></li>
          <li><b>History</b><span>Available for governed reporting</span></li>
          <li><b>Benchmarks</b><span>Permitted at aggregate level</span></li>
        </ol>
        <div>
          <MemberIcon name="governance" />
          <span><small>Definition authority</small><strong>Dave Rike + Distranet board</strong></span>
        </div>
      </footer>
    </section>
  );
}

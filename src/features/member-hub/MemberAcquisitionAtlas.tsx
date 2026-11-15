"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type {
  MemberAcquisitionChannel,
  MemberTenantBrand,
} from "@/domain/member-hub/types";
import { MemberIcon } from "./components/MemberIcon";
import styles from "./MemberAcquisitionAtlas.module.css";

const MEASUREMENT_EVENTS = [
  ["01", "view_item", "Define"],
  ["02", "add_to_cart", "Define"],
  ["03", "begin_checkout", "Define"],
  ["04", "purchase + allocation", "Join"],
  ["05", "refund + adjustment", "Join"],
] as const;

const CHANNEL_ROUTE_PATHS = [
  "M24 76C215 76 257 132 376 202",
  "M24 163C218 163 267 184 376 224",
  "M24 250H376",
  "M24 337C218 337 267 316 376 276",
  "M24 424C215 424 257 368 376 298",
] as const;

function formatCurrency(value: number) {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function AcquisitionReadoutContent({
  channel,
  tenant,
  outgoing = false,
}: {
  channel: MemberAcquisitionChannel;
  tenant: MemberTenantBrand;
  outgoing?: boolean;
}) {
  return (
    <div
      className={`${styles.readoutContent} ${
        outgoing ? styles.readoutOutgoing : styles.readoutCurrent
      }`}
      aria-hidden={outgoing ? true : undefined}
    >
      <span>Selected origin</span>
      <h3>{channel.label}</h3>
      <dl>
        <div><dt>Mix</dt><dd>{channel.share}%</dd></div>
        <div><dt>Orders</dt><dd>{channel.orders.toLocaleString("en-US")}</dd></div>
        <div><dt>Sales</dt><dd>{formatCurrency(channel.attributedSales)}</dd></div>
        <div><dt>Inventory match</dt><dd>{channel.matchRate}%</dd></div>
      </dl>
      <div className={styles.allocationOutcome}>
        <span>Allocation outcome</span>
        <strong>
          {tenant.shortName} inventory match → member seller of record
        </strong>
      </div>
      <p>{channel.insight}</p>
      <small>Illustrative aggregate values · no customer identities</small>
    </div>
  );
}

export function MemberAcquisitionAtlas({
  tenant,
  channels,
}: {
  tenant: MemberTenantBrand;
  channels: readonly MemberAcquisitionChannel[];
}) {
  const [activeId, setActiveId] = useState(channels[0]?.id ?? "");
  const [previousId, setPreviousId] = useState<string | null>(null);
  const [motionReady, setMotionReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const intersectionRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => {
      setReducedMotion(motionQuery.matches);
      setMotionReady(true);
    };
    const updateVisibility = () => {
      setInView(intersectionRef.current && !document.hidden);
    };

    updateMotion();

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        intersectionRef.current = entry.isIntersecting;
        updateVisibility();
      },
      { rootMargin: "12% 0px", threshold: 0.12 },
    );
    intersectionObserver.observe(section);

    motionQuery.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);

    return () => {
      intersectionObserver.disconnect();
      motionQuery.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  const active = channels.find((channel) => channel.id === activeId) ?? channels[0];
  const previous = previousId
    ? channels.find((channel) => channel.id === previousId)
    : undefined;

  if (!active) return null;

  const activeIndex = Math.max(0, channels.indexOf(active));
  const activeRoute = CHANNEL_ROUTE_PATHS[
    Math.min(activeIndex, CHANNEL_ROUTE_PATHS.length - 1)
  ] ?? CHANNEL_ROUTE_PATHS[2];
  const atlasPhase = !motionReady || reducedMotion
    ? "static"
    : inView
    ? "active"
    : "idle";

  const selectChannel = (channelId: string) => {
    if (channelId === active.id) return;
    setPreviousId(active.id);
    setActiveId(channelId);
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
    }
    transitionTimerRef.current = window.setTimeout(() => {
      setPreviousId(null);
      transitionTimerRef.current = null;
    }, 360);
  };

  return (
    <section
      ref={sectionRef}
      id="acquisition"
      className={styles.section}
      aria-labelledby="acquisition-title"
    >
      <header className={styles.heading}>
        <div>
          <p>Demand-origin atlas</p>
          <h2 id="acquisition-title">Know what created the order—not just where it landed.</h2>
        </div>
        <div className={styles.instrumentationStatus}>
          <i aria-hidden="true" />
          <span>
            <strong>Measurement design required</strong>
            <small>GA4 ecommerce implementation has not been verified</small>
          </span>
        </div>
      </header>

      <div
        className={styles.atlas}
        data-atlas-phase={atlasPhase}
        data-atlas-visible={inView ? "true" : "false"}
        style={{
          "--active-channel": active.color,
          "--active-index": activeIndex,
        } as CSSProperties}
      >
        <div className={styles.scanVolume} aria-hidden="true"><i /><i /><i /></div>

        <div className={styles.channelRail} role="group" aria-label="Inspect an illustrative acquisition channel">
          {channels.map((channel, index) => (
            <button
              type="button"
              key={channel.id}
              aria-pressed={activeId === channel.id}
              aria-controls="acquisition-readout"
              onClick={() => selectChannel(channel.id)}
              onFocus={() => selectChannel(channel.id)}
              style={{
                "--channel-color": channel.color,
                "--channel-share": channel.share / 100,
                "--channel-index": index,
              } as CSSProperties}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <i aria-hidden="true" />
              <strong>{channel.label}</strong>
              <b>{channel.share}%</b>
            </button>
          ))}
        </div>

        <div className={styles.signalMachine} aria-hidden="true">
          <svg viewBox="0 0 820 500" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="atlas-selected" x1="0" x2="1">
                <stop stopColor="var(--active-channel)" stopOpacity="0" />
                <stop offset=".45" stopColor="var(--active-channel)" />
                <stop offset="1" stopColor="var(--tenant-primary)" />
              </linearGradient>
              <radialGradient id="atlas-core">
                <stop stopColor="var(--tenant-primary)" stopOpacity=".55" />
                <stop offset=".64" stopColor="var(--tenant-ink)" />
                <stop offset="1" stopColor="#010508" />
              </radialGradient>
              <filter id="atlas-glow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="7" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <g className={styles.machineGrid}>
              <ellipse cx="504" cy="250" rx="245" ry="178" />
              <ellipse cx="504" cy="250" rx="186" ry="126" />
              <path d="M250 250H768M504 58V442" />
            </g>
            <g className={styles.passiveBeams}>
              {CHANNEL_ROUTE_PATHS.map((path, index) => (
                <path
                  key={path}
                  pathLength="1"
                  d={path}
                  data-selected={activeIndex === index}
                  style={{
                    "--route-index": index,
                    "--route-color": channels[index]?.color ??
                      "rgba(255,255,255,.2)",
                  } as CSSProperties}
                />
              ))}
            </g>
            <path
              className={styles.activeBeam}
              pathLength="1"
              d={activeRoute}
              stroke="url(#atlas-selected)"
              filter="url(#atlas-glow)"
            />
            <path
              key={`pulse-${active.id}-${atlasPhase}`}
              className={styles.signalPulse}
              pathLength="1"
              d={activeRoute}
              stroke="var(--active-channel)"
            />
            <g className={styles.core}>
              <circle cx="504" cy="250" r="108" fill="url(#atlas-core)" />
              <circle cx="504" cy="250" r="90" />
              <circle cx="504" cy="250" r="68" />
              <path d="M504 142v22M504 336v22M396 250h22M590 250h22" />
            </g>
            <g className={styles.outputBeam}>
              <path d="M612 250H790" />
              <circle cx="790" cy="250" r="12" />
            </g>
          </svg>

          <div className={styles.coreLabel}>
            <span>{tenant.shortName} inventory match</span>
            <strong key={active.id} className={styles.metricSwap}>
              {active.matchRate}%
            </strong>
            <small>illustrative match rate</small>
          </div>
          <div className={styles.outputLabel}>
            <span>Member allocation</span>
            <strong>Seller of record</strong>
          </div>
        </div>

        <aside id="acquisition-readout" className={styles.readout}>
          <span
            className={styles.screenReaderStatus}
            aria-live="polite"
            aria-atomic="true"
          >
            {active.label}: {active.share}% of illustrative orders, {active.matchRate}% inventory match.
          </span>
          {previous && previous.id !== active.id && (
            <AcquisitionReadoutContent
              key={`outgoing-${previous.id}-${active.id}`}
              channel={previous}
              tenant={tenant}
              outgoing
            />
          )}
          <AcquisitionReadoutContent
            key={`current-${active.id}`}
            channel={active}
            tenant={tenant}
          />
        </aside>
      </div>

      <div className={styles.measurementRail}>
        <div>
          <MemberIcon name="governance" />
          <span><strong>Measurement contract</strong><small>Storefront event → order → member line allocation → settlement</small></span>
        </div>
        <ol>
          {MEASUREMENT_EVENTS.map(([index, event, status]) => (
            <li key={event}><span>{index}</span><strong>{event}</strong><small>{status}</small></li>
          ))}
        </ol>
      </div>
    </section>
  );
}

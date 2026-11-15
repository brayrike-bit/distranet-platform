"use client";

import Link from "next/link";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import type {
  MemberTenantBrand,
  MemberViewerProfile,
} from "@/domain/member-hub/types";
import { MemberCommerceRiver } from "./MemberCommerceRiver";
import { MemberDecisionDesk } from "./MemberDecisionDesk";
import { MemberTenantArrivalHero } from "./MemberTenantArrivalHero";
import { MemberIcon } from "./components/MemberIcon";
import { memberDataForPeriod } from "./member-demo-data";
import { useMemberReportingPeriod } from "./workspace/MemberWorkspaceShell";
import { REPORT_PERIODS } from "./workspace/demonstration-report-export";
import { memberWorkspacePeriodHref } from "./workspace/member-workspace-navigation";
import {
  BenchmarkRibbon,
  MemberOperatingPortrait,
} from "./visualizations/MemberOverviewVisuals";
import styles from "./MemberOperatingOverview.module.css";

type SectionId = "flow" | "portrait" | "decisions" | "benchmark";

const navigation: { id: SectionId; label: string }[] = [
  { id: "flow", label: "Value flow" },
  { id: "portrait", label: "Operating portrait" },
  { id: "decisions", label: "Decision desk" },
  { id: "benchmark", label: "Benchmarks" },
];

function scrollToSection(id: SectionId) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const compactNavigation = window.matchMedia("(max-width: 860px)").matches;
  const section = document.getElementById(id);
  if (!section) return;
  const offset = Number.parseFloat(
    window.getComputedStyle(section).scrollMarginTop,
  ) || 0;
  let layoutTop = 0;
  let node: HTMLElement | null = section;
  while (node) {
    layoutTop += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  window.scrollTo({
    top: Math.max(0, layoutTop - offset),
    behavior: reducedMotion || compactNavigation ? "auto" : "smooth",
  });
}

export function MemberOperatingOverview({
  tenant: sourceTenant,
  viewer,
}: {
  tenant: MemberTenantBrand;
  viewer?: MemberViewerProfile;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mobileNavigationRef = useRef<HTMLElement>(null);
  const activeSectionRef = useRef<SectionId>("flow");
  const { period, selectPeriod } = useMemberReportingPeriod();
  const tenant = { ...sourceTenant, data: memberDataForPeriod(sourceTenant, period) };
  const activeViewer = viewer ?? tenant.demoViewer;
  const [activeSection, setActiveSection] = useState<SectionId>("flow");
  const snapshot = tenant.data.snapshots[period];

  useLayoutEffect(() => {
    // The member workspace is a tenant-branded product surface. Some browser
    // dark-mode injectors ignore the standards-based color-scheme meta tag and
    // rewrite every generated class with !important rules. Suspend only those
    // injected sheets while this route is mounted so member colors remain
    // contractually accurate; restore the visitor's prior browser state after.
    const root = document.documentElement;
    const extensionSheetIds = ["dark-mode-native-style", "dark-mode-native-sheet"];
    const rootWasDark = root.hasAttribute("native-dark-active");
    const priorSheetStates = new Map<CSSStyleSheet, boolean>();
    let frame = 0;

    const preserveTenantColor = () => {
      frame = 0;
      root.removeAttribute("native-dark-active");
      extensionSheetIds.forEach((id) => {
        const owner = document.getElementById(id);
        if (!owner) return;
        const sheet = Array.from(document.styleSheets).find(
          (candidate) => candidate.ownerNode === owner,
        );
        if (!sheet) return;
        if (!priorSheetStates.has(sheet)) priorSheetStates.set(sheet, sheet.disabled);
        sheet.disabled = true;
      });
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(preserveTenantColor);
    };

    preserveTenantColor();
    const observer = new MutationObserver(schedule);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["native-dark-active"],
    });
    if (document.head) observer.observe(document.head, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      priorSheetStates.forEach((disabled, sheet) => {
        sheet.disabled = disabled;
      });
      if (rootWasDark) root.setAttribute("native-dark-active", "");
    };
  }, []);

  useEffect(() => {
    const navigationElement = mobileNavigationRef.current;
    const activeLink = navigationElement?.querySelector<HTMLAnchorElement>(
      `[data-section="${activeSection}"]`,
    );
    if (!navigationElement || !activeLink) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targetLeft =
      activeLink.offsetLeft -
      (navigationElement.clientWidth - activeLink.offsetWidth) / 2;
    navigationElement.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [activeSection]);

  function navigateFromMobile(event: MouseEvent<HTMLAnchorElement>, id: SectionId) {
    event.preventDefault();
    window.history.pushState(null, "", `#${id}`);
    if (activeSectionRef.current !== id) {
      activeSectionRef.current = id;
      setActiveSection(id);
    }
    scrollToSection(id);
  }

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sectionElements = navigation.flatMap(({ id }) => {
      const element = document.getElementById(id);
      return element ? [{ id, element }] : [];
    });
    const nearSections = new Set<HTMLElement>();
    type CachedSectionGeometry = {
      id: SectionId;
      element: HTMLElement;
      top: number;
    };
    let sectionGeometry: CachedSectionGeometry[] = [];
    let geometryByElement = new Map<HTMLElement, CachedSectionGeometry>();
    let markerOffset = 24;
    let pageRange = 1;
    let lastPageProgress = -1;
    let frame = 0;
    let measureFrame = 0;
    let disposed = false;

    const documentTop = (element: HTMLElement) => {
      let top = 0;
      let node: HTMLElement | null = element;
      while (node) {
        top += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      return top;
    };

    const commitActiveSection = (id: SectionId) => {
      if (activeSectionRef.current === id) return;
      activeSectionRef.current = id;
      setActiveSection(id);
    };

    const resolveActiveSection = (marker: number) => {
      // IntersectionObserver normally limits this to the one-to-three sections
      // surrounding the viewport. The cached binary-search fallback preserves
      // correct navigation through gaps without forcing any layout reads.
      let nearby: CachedSectionGeometry | undefined;
      nearSections.forEach((element) => {
        const entry = geometryByElement.get(element);
        if (
          entry && entry.top <= marker &&
          (!nearby || entry.top > nearby.top)
        ) {
          nearby = entry;
        }
      });
      if (nearby) return nearby.id;

      let low = 0;
      let high = sectionGeometry.length - 1;
      let resolved = navigation[0].id;
      while (low <= high) {
        const middle = Math.floor((low + high) / 2);
        const entry = sectionGeometry[middle];
        if (entry.top <= marker) {
          resolved = entry.id;
          low = middle + 1;
        } else {
          high = middle - 1;
        }
      }
      return resolved;
    };

    const paint = () => {
      frame = 0;
      if (!sectionGeometry.length) return;

      // Page progress is decorative motion. Reduced-motion users still receive
      // fully accurate section navigation, but no per-scroll progress rewrite.
      if (!motionQuery.matches) {
        const progress = Math.min(1, window.scrollY / pageRange);
        if (Math.abs(progress - lastPageProgress) >= 0.0005) {
          lastPageProgress = progress;
          root.style.setProperty("--page-progress", progress.toFixed(4));
        }
      }

      commitActiveSection(
        resolveActiveSection(window.scrollY + markerOffset),
      );
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(paint);
    };

    const measure = () => {
      measureFrame = 0;
      pageRange = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const firstSection = sectionElements[0]?.element;
      markerOffset = (
        firstSection
          ? Number.parseFloat(window.getComputedStyle(firstSection).scrollMarginTop)
          : 0
      ) + 24;
      sectionGeometry = sectionElements
        .map(({ id, element }) => {
          const top = documentTop(element);
          return { id, element, top };
        })
        .sort((left, right) => left.top - right.top);
      geometryByElement = new Map(
        sectionGeometry.map((entry) => [entry.element, entry]),
      );
      schedule();
    };

    const scheduleMeasure = () => {
      if (!measureFrame) measureFrame = window.requestAnimationFrame(measure);
    };

    const onMotionChange = () => {
      if (motionQuery.matches) {
        lastPageProgress = 0;
        root.style.setProperty("--page-progress", "0");
      } else {
        lastPageProgress = -1;
      }
      schedule();
    };

    const onHashChange = () => {
      const hash = window.location.hash.slice(1) as SectionId;
      if (navigation.some(({ id }) => id === hash)) commitActiveSection(hash);
      scheduleMeasure();
    };

    const sectionObserver = typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const element = entry.target as HTMLElement;
            if (entry.isIntersecting) nearSections.add(element);
            else nearSections.delete(element);
          });
          schedule();
        },
        { rootMargin: "30% 0px", threshold: 0 },
      );
    sectionElements.forEach(({ element }) => sectionObserver?.observe(element));

    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(scheduleMeasure);
    resizeObserver?.observe(root);
    sectionElements.forEach(({ element }) => resizeObserver?.observe(element));

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", scheduleMeasure, { passive: true });
    window.addEventListener("load", scheduleMeasure, { once: true });
    window.addEventListener("hashchange", onHashChange);
    motionQuery.addEventListener("change", onMotionChange);
    root.dataset.ready = "true";
    const initialHash = window.location.hash.slice(1) as SectionId;
    if (navigation.some(({ id }) => id === initialHash)) {
      commitActiveSection(initialHash);
    }
    measure();
    void document.fonts?.ready.then(() => {
      if (!disposed) scheduleMeasure();
    });

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(measureFrame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("load", scheduleMeasure);
      window.removeEventListener("hashchange", onHashChange);
      motionQuery.removeEventListener("change", onMotionChange);
      sectionObserver?.disconnect();
      resizeObserver?.disconnect();
    };
  }, []);

  function exportPrototype() {
    const payload = {
      prototype: true,
      aggregateOnly: true,
      member: tenant.displayName,
      generatedAt: new Date().toISOString(),
      snapshot,
      notice:
        "Publicly reachable prototype with no live authentication. Illustrative data only. No customer identities. No production source connected. Definitions require Dave Rike and Distranet board approval.",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `distranet-${tenant.slug}-${period.toLowerCase()}-prototype.json`;
    anchor.click();
    URL.revokeObjectURL(href);
  }

  return (
    <div
      ref={rootRef}
      className={styles.shell}
      data-member-motion="hero-reactive-dashboard-calm"
      data-tenant={tenant.slug}
    >
      <div className={styles.main}>
        <MemberTenantArrivalHero tenant={tenant} />
        <header id="member-summary" className={styles.overviewHeader}>
          <div className={styles.overviewIdentity}>
            <p>{tenant.workspaceLabel}</p>
            <h2>{tenant.slug === "air-hydro-power" ? `Good morning, ${activeViewer.name.split(" ")[0]}.` : `${tenant.shortName} at a glance.`}</h2>
            <span>{tenant.displayName} · illustrative operating snapshot</span>
          </div>
          <div className={styles.overviewActions}>
            <button type="button" className={styles.secondaryAction} onClick={() => window.print()}>
              <MemberIcon name="reports" />Print brief
            </button>
            <button type="button" className={styles.primaryAction} onClick={exportPrototype}>
              <MemberIcon name="download" />Export aggregate prototype
            </button>
          </div>
        </header>

        <section className={styles.controlDeck} aria-label="Reporting controls and data status">
          <div className={styles.periodControl} role="group" aria-label="Illustrative reporting period">
            {REPORT_PERIODS.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => selectPeriod(item)}
                aria-pressed={period === item}
              >
                {item}
              </button>
            ))}
          </div>
          <div className={styles.periodReadout} aria-live="polite">
            <span>Reporting window</span>
            <strong>{snapshot.periodLabel}</strong>
          </div>
          <div className={styles.dataStatus}>
            <i />
            <span><strong>Illustrative aggregate snapshot</strong><small>Privacy-safe example · effective {snapshot.effectiveDate}</small></span>
          </div>
        </section>

        <div className={styles.quickMetrics} aria-label="Illustrative member performance">
          {[
            { label: "Attributed sales", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(snapshot.attributedSales), path: "commerce" as const, detail: "Parts Gopher contribution" },
            { label: "Recognized orders", value: snapshot.recognizedOrders.toLocaleString("en-US"), path: "orders" as const, detail: "Member-attributed orders" },
            { label: "Member margin share", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(snapshot.memberMarginShare), path: "financials" as const, detail: "50% of gross-margin pool" },
            { label: "Inventory match", value: `${snapshot.matchRate}%`, path: "inventory" as const, detail: "Availability-to-demand match" },
          ].map(metric => <Link key={metric.path} href={memberWorkspacePeriodHref(tenant.slug, metric.path, period)}><span>{metric.label}<i aria-hidden="true">↗</i></span><strong>{metric.value}</strong><small>{metric.detail}</small></Link>)}
        </div>

        <nav
          ref={mobileNavigationRef}
          className={styles.overviewJumpNav}
          aria-label="Overview data sections"
        >
          {navigation.map((item, index) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              data-section={item.id}
              aria-current={activeSection === item.id ? "location" : undefined}
              onClick={(event) => navigateFromMobile(event, item.id)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.label}</strong>
            </a>
          ))}
        </nav>

        <div className={styles.operatingCanvas} data-period={period}>
          <MemberCommerceRiver id="flow" tenant={tenant} snapshot={snapshot} />
          <MemberOperatingPortrait tenant={tenant} snapshot={snapshot} />
          <MemberDecisionDesk
            tenant={tenant}
            snapshot={snapshot}
            signals={tenant.data.demandSignals}
            channels={tenant.data.acquisitionChannels}
          />
          <BenchmarkRibbon
            memberLabel={tenant.shortName}
            benchmarks={tenant.data.benchmarks}
          />
        </div>
      </div>
    </div>
  );
}

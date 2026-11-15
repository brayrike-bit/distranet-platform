"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import styles from "./hub.module.css";
import polish from "./hub-polish.module.css";

type IconName =
  | "overview"
  | "sales"
  | "traffic"
  | "value"
  | "products"
  | "reports"
  | "settings"
  | "menu"
  | "close"
  | "calendar"
  | "download"
  | "shield"
  | "info"
  | "chevron"
  | "trend"
  | "package"
  | "lock"
  | "database"
  | "clock"
  | "route"
  | "arrow";

function Icon({ name, className }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    overview: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="4.5" rx="1.5"/><rect x="13.5" y="11" width="7" height="9.5" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/></>,
    sales: <><path d="M4 19V9m6 10V5m6 14v-7m4 7H2"/><path d="m4 7 5-4 5 3 6-4"/></>,
    traffic: <><circle cx="12" cy="12" r="8.5"/><path d="M3.8 9h16.4M3.8 15h16.4M12 3.5c2.2 2.4 3.3 5.2 3.3 8.5S14.2 18.1 12 20.5M12 3.5C9.8 5.9 8.7 8.7 8.7 12s1.1 6.1 3.3 8.5"/></>,
    value: <><path d="M4 7.5 12 3l8 4.5-8 4.5-8-4.5Z"/><path d="m4 12.5 8 4.5 8-4.5M4 17l8 4 8-4"/></>,
    products: <><path d="m4 7 8-4 8 4v10l-8 4-8-4V7Z"/><path d="m4 7 8 4 8-4M12 11v10"/></>,
    reports: <><path d="M6 3.5h8l4 4v13H6v-17Z"/><path d="M14 3.5v4h4M9 12h6M9 16h6"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.1h-4v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3.1 14H3v-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.5V3h4v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1v4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    close: <path d="m5 5 14 14M19 5 5 19"/>,
    calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M8 3v4M16 3v4M3.5 9.5h17"/></>,
    download: <><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 19.5h16"/></>,
    shield: <><path d="M12 3 5 6v5c0 4.6 2.8 8.2 7 10 4.2-1.8 7-5.4 7-10V6l-7-3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 10.5V17M12 7h.01"/></>,
    chevron: <path d="m8 10 4 4 4-4"/>,
    trend: <><path d="m4 16 5-5 4 3 7-8"/><path d="M15 6h5v5"/></>,
    package: <><path d="m4 7 8-4 8 4v10l-8 4-8-4V7Z"/><path d="m4 7 8 4 8-4M8 5l8 4M12 11v10"/></>,
    lock: <><rect x="4.5" y="10" width="15" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></>,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></>,
    route: <><circle cx="5" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M7 6h3a3 3 0 0 1 3 3v6a3 3 0 0 0 3 3h1M9 18H7a3 3 0 0 1-3-3v-3"/></>,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5"/>,
  };

  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function DistranetLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={styles.logoLockup}>
      <svg viewBox="0 0 52 52" aria-hidden="true">
        <path d="M9 9 26 26 43 9M9 43 26 26l17 17" />
        <circle cx="9" cy="9" r="4" />
        <circle cx="43" cy="9" r="4" />
        <circle cx="26" cy="26" r="5" />
        <circle cx="9" cy="43" r="4" />
        <circle cx="43" cy="43" r="4" />
      </svg>
      {!compact && <strong>DISTRA<span>NET</span></strong>}
    </span>
  );
}

const modules = [
  { id: "overview", label: "Overview", icon: "overview" as IconName, eyebrow: "Executive overview", title: "Network performance, made legible.", description: "A privacy-safe summary of commerce, fulfillment, and member-value signals designed to sit alongside the existing shared-inventory, pricing, location, and shipping tools." },
  { id: "sales", label: "Sales performance", icon: "sales" as IconName, eyebrow: "Sales performance", title: "See sales attributed to member fulfillment.", description: "Trace aggregate net merchandise sales to member fulfillment allocations without exposing customer identities." },
  { id: "traffic", label: "Traffic & conversion", icon: "traffic" as IconName, eyebrow: "Traffic and conversion", title: "Turn anonymous demand into decisions.", description: "A future view of acquisition and conversion once the GA4 ecommerce implementation has been audited." },
  { id: "value", label: "Member value", icon: "value" as IconName, eyebrow: "Member value", title: "Make every settlement reproducible.", description: "Separate product reimbursement, the member's 50% gross-margin share, and approved adjustments at allocation level." },
  { id: "products", label: "Products & opportunity", icon: "products" as IconName, eyebrow: "Products and opportunity", title: "Find demand the network can fulfill.", description: "Rank aggregate product performance and surface stock, match-rate, and unavailable-demand opportunities." },
  { id: "reports", label: "Reports", icon: "reports" as IconName, eyebrow: "Governed reports", title: "Bring historical evidence into view.", description: "Future reports can surface available order and allocation history plus approved privacy-safe network benchmarks, with planned tenant isolation, metric versions, and reconciliation status." },
] as const;

type ModuleId = typeof modules[number]["id"];
type RangeKey = "MTD" | "QTD" | "YTD" | "12M" | "CUSTOM";
type MetricKey = "sales" | "orders" | "margin";

const rangeDates: Record<Exclude<RangeKey, "CUSTOM">, string> = {
  MTD: "Jul 1 – Jul 9, 2026",
  QTD: "Jul 1 – Jul 9, 2026",
  YTD: "Jan 1 – Jul 9, 2026",
  "12M": "Jul 10, 2025 – Jul 9, 2026",
};

const prototypeSnapshots = {
  MTD: { sales: 286420, salesChange: 16.2, orders: 191, orderChange: 9.8, splitRate: 32.5, splitCount: 62, margin: 42960, pending: 4260, reimbursement: 188600 },
  QTD: { sales: 286420, salesChange: 16.2, orders: 191, orderChange: 9.8, splitRate: 32.5, splitCount: 62, margin: 42960, pending: 4260, reimbursement: 188600 },
  YTD: { sales: 1840260, salesChange: 18.4, orders: 1246, orderChange: 12.7, splitRate: 31.8, splitCount: 396, margin: 276040, pending: 16420, reimbursement: 1218740 },
  "12M": { sales: 3124880, salesChange: 17.6, orders: 2090, orderChange: 11.9, splitRate: 30.6, splitCount: 640, margin: 468730, pending: 22780, reimbursement: 2043900 },
} as const;

const chartMetrics = {
  sales: {
    label: "Attributed net sales",
    shortLabel: "Net sales",
    unit: "$k",
    max: 400,
    current: [184, 228, 256, 315, 280, 350, 227],
    previous: [165, 194, 221, 244, 236, 287, 206],
    summary: "Illustrative attributed net sales trend rises above the prior-year comparison in each displayed month.",
  },
  orders: {
    label: "Recognized orders",
    shortLabel: "Orders",
    unit: "orders",
    max: 240,
    current: [142, 160, 175, 193, 181, 213, 182],
    previous: [128, 146, 153, 172, 166, 190, 151],
    summary: "Illustrative recognized order volume is above the prior-year comparison across the displayed period.",
  },
  margin: {
    label: "Member margin share",
    shortLabel: "Margin share",
    unit: "$k",
    max: 60,
    current: [27, 34, 38, 47, 42, 53, 35],
    previous: [24, 29, 33, 36, 35, 43, 28],
    summary: "Illustrative member margin share reflects 50% of a draft gross-margin pool attributed to member allocations.",
  },
} as const;

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

type ProductRow = {
  sku: string;
  brand: string;
  category: string;
  sales: number;
  growth: number;
};

const products: ProductRow[] = [
  { sku: "PX-1250-4", brand: "Parker", category: "Tube fitting", sales: 184320, growth: 24.8 },
  { sku: "H2-62-10", brand: "Parker", category: "Hydraulic hose", sales: 142880, growth: 18.1 },
  { sku: "D1VW004CNJW", brand: "Parker", category: "Directional valve", sales: 98420, growth: 31.4 },
  { sku: "P33FA92ESMBN", brand: "Parker", category: "Filter regulator", sales: 76940, growth: 8.7 },
];

const sourceMix = [
  { label: "Organic search", value: 42.6, color: "#ed1c24" },
  { label: "Direct", value: 28.1, color: "#25272a" },
  { label: "Paid search", value: 18.4, color: "#74777c" },
  { label: "Referral and other", value: 10.9, color: "#d7d6d1" },
];

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const integer = new Intl.NumberFormat("en-US");

function formatDate(value: string) {
  if (!value) return "Select date";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

function chartGeometry(values: readonly number[], max: number) {
  const points = values.map((value, index) => ({
    x: index * (720 / (values.length - 1)),
    y: 220 - (value / max) * 190,
    value,
  }));
  const line = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  return { points, line, area: `${line} L720 220 L0 220 Z` };
}

function MetricMeta({ period }: { period: string }) {
  return (
    <div className={styles.metricMeta} aria-label="Metric context">
      <span><Icon name="calendar" />{period}</span>
      <span><Icon name="clock" />Prototype snapshot</span>
      <span><Icon name="shield" />Definition v0 draft</span>
    </div>
  );
}

export default function LegacyMemberHub() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeModule, setActiveModule] = useState<ModuleId>("overview");
  const [range, setRange] = useState<RangeKey>("YTD");
  const [comparison, setComparison] = useState("prior-year");
  const [chartMetric, setChartMetric] = useState<MetricKey>("sales");
  const [openDefinition, setOpenDefinition] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [customStart, setCustomStart] = useState("2026-01-01");
  const [customEnd, setCustomEnd] = useState("2026-07-09");
  const [appliedCustom, setAppliedCustom] = useState({ start: "2026-01-01", end: "2026-07-09" });
  const [sort, setSort] = useState<{ key: keyof ProductRow; direction: "asc" | "desc" }>({ key: "sales", direction: "desc" });
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let frame = 0;

    const paint = () => {
      frame = 0;
      const scrollRange = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      root.style.setProperty("--hub-scroll", Math.min(1, scrollY / scrollRange).toFixed(4));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };

    root.dataset.ready = "true";
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule, { passive: true });
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
    };
  }, []);

  const selectedModule = modules.find((module) => module.id === activeModule) ?? modules[0];
  const snapshotKey = range === "CUSTOM" ? "YTD" : range;
  const snapshot = prototypeSnapshots[snapshotKey];
  const periodLabel = range === "CUSTOM"
    ? `${formatDate(appliedCustom.start)} – ${formatDate(appliedCustom.end)}`
    : rangeDates[range];

  const selectedChart = chartMetrics[chartMetric];
  const currentGeometry = useMemo(() => chartGeometry(selectedChart.current, selectedChart.max), [selectedChart]);
  const priorGeometry = useMemo(() => chartGeometry(selectedChart.previous, selectedChart.max), [selectedChart]);
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const aValue = a[sort.key];
      const bValue = b[sort.key];
      const result = typeof aValue === "number" && typeof bValue === "number"
        ? aValue - bValue
        : String(aValue).localeCompare(String(bValue));
      return sort.direction === "asc" ? result : -result;
    });
  }, [sort]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    const backgroundSurfaces = [
      document.getElementById("main-content"),
      document.querySelector<HTMLElement>(`.${styles.mobileBar}`),
      document.querySelector<HTMLElement>(`.${styles.sidebar}`),
    ].filter((surface): surface is HTMLElement => Boolean(surface));
    const backgroundState = backgroundSurfaces.map((surface) => ({
      surface,
      inert: surface.hasAttribute("inert"),
      ariaHidden: surface.getAttribute("aria-hidden"),
    }));

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    backgroundSurfaces.forEach((surface) => {
      surface.setAttribute("inert", "");
      surface.setAttribute("aria-hidden", "true");
    });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        menuButtonRef.current?.focus();
      }
      if (event.key === "Tab") {
        const focusable = Array.from(drawerRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input:not([disabled]), select:not([disabled])") ?? []);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      backgroundState.forEach(({ surface, inert, ariaHidden }) => {
        if (!inert) surface.removeAttribute("inert");
        if (ariaHidden === null) surface.removeAttribute("aria-hidden");
        else surface.setAttribute("aria-hidden", ariaHidden);
      });
    };
  }, [mobileOpen]);

  function chooseModule(id: ModuleId) {
    setActiveModule(id);
    setMobileOpen(false);
    if (id === "sales") setChartMetric("sales");
    if (id === "value") setChartMetric("margin");
    if (id === "traffic") setChartMetric("orders");
  }

  function closeMobile() {
    setMobileOpen(false);
    window.setTimeout(() => menuButtonRef.current?.focus(), 0);
  }

  function applyCustomRange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customStart || !customEnd || customStart > customEnd) return;
    setAppliedCustom({ start: customStart, end: customEnd });
    setRange("CUSTOM");
    setDateOpen(false);
  }

  function updateSort(key: keyof ProductRow) {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === "desc" ? "asc" : "desc",
    }));
  }

  const kpis = [
    {
      id: "sales",
      label: "Attributed net sales",
      value: currency.format(snapshot.sales),
      trend: `Up ${snapshot.salesChange}%`,
      supporting: comparison === "prior-year" ? "versus prior year" : "versus preceding period",
      definition: "Fulfilled member-allocation merchandise value less allocated discounts, cancellations, and returned merchandise value. Shipping and tax are excluded unless the board approves another definition.",
      source: "nopCommerce order lines, fulfillment allocations, and return records",
      status: "Draft definition · source mapping not connected",
    },
    {
      id: "orders",
      label: "Recognized orders",
      value: integer.format(snapshot.orders),
      trend: `Up ${snapshot.orderChange}%`,
      supporting: comparison === "prior-year" ? "versus prior year" : "versus preceding period",
      definition: "Customer orders meeting the approved recognition rule. The final qualifying nopCommerce lifecycle statuses still require reconciliation and board approval.",
      source: "nopCommerce orders plus fulfillment-allocation records",
      status: "Recognition rule TBD · prototype count",
    },
    {
      id: "split",
      label: "Split-member order rate",
      value: `${snapshot.splitRate}%`,
      trend: `${integer.format(snapshot.splitCount)} orders`,
      supporting: "fulfilled by more than one member",
      definition: "Recognized customer orders fulfilled by more than one member divided by all recognized customer orders. One checkout can contain multiple member fulfillment groups.",
      source: "Order header joined to versioned member fulfillment allocations",
      status: "Draft definition · aggregate only",
    },
    {
      id: "margin",
      label: "Member margin share",
      value: currency.format(snapshot.margin),
      trend: `Example pending ${currency.format(snapshot.pending)}`,
      supporting: "not a live balance",
      definition: `50% of an illustrative draft gross-margin pool attributable to this member's fulfillment allocations. The example pool for this period is ${currency.format(snapshot.margin * 2)}; product reimbursement is reported separately.`,
      source: "Pricing version, product cost, fulfillment allocations, returns, and settlement records",
      status: "Draft calculation · cost treatments still TBD",
    },
  ];

  function Navigation({ mobile = false }: { mobile?: boolean }) {
    return (
      <>
        <div className={styles.sidebarTop}>
          <Link href="/" className={styles.logoLink} aria-label="Return to Distranet public website">
            <DistranetLogo />
          </Link>
          {mobile && (
            <button ref={closeButtonRef} className={styles.iconButton} type="button" onClick={closeMobile} aria-label="Close member hub navigation">
              <Icon name="close" />
            </button>
          )}
        </div>
        <div className={styles.companyBlock}>
          <span className={styles.companyAvatar} aria-hidden="true">AH</span>
          <span><strong>Air Hydro Power</strong><small>Prototype member workspace</small></span>
        </div>
        <nav className={styles.navigation} aria-label="Member hub modules">
          <p>Workspace</p>
          {modules.map((module) => (
            <button
              key={module.id}
              type="button"
              className={activeModule === module.id ? styles.navActive : undefined}
              onClick={() => chooseModule(module.id)}
              aria-current={activeModule === module.id ? "page" : undefined}
            >
              <Icon name={module.icon} />
              <span>{module.label}</span>
            </button>
          ))}
        </nav>
        <div className={styles.sidebarBottom}>
          <button type="button" onClick={() => chooseModule("reports")}><Icon name="settings" /><span>Workspace settings</span></button>
          <div className={styles.userBlock}>
            <span aria-hidden="true">BR</span>
            <span><strong>Brayden Rike</strong><small>Member admin · prototype</small></span>
          </div>
        </div>
      </>
    );
  }

  return (
    <div ref={rootRef} className={`${styles.shell} ${polish.shell}`}>
      <div className={polish.ambient} aria-hidden="true"><i /><i /><span /></div>
      <aside className={styles.sidebar} aria-label="Member hub sidebar">
        <Navigation />
      </aside>

      <header className={styles.mobileBar}>
        <Link href="/" aria-label="Return to Distranet public website"><DistranetLogo compact /></Link>
        <span><strong>Air Hydro Power</strong><small>Prototype member workspace</small></span>
        <button
          ref={menuButtonRef}
          type="button"
          className={styles.iconButton}
          onClick={() => setMobileOpen(true)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-member-navigation"
          aria-label="Open member hub navigation"
        >
          <Icon name="menu" />
        </button>
      </header>

      {mobileOpen && (
        <div className={styles.mobileNavigation} id="mobile-member-navigation">
          <button className={styles.scrim} type="button" onClick={closeMobile} aria-label="Close member hub navigation" />
          <aside ref={drawerRef} className={styles.drawer} aria-label="Mobile member hub navigation" aria-modal="true" role="dialog">
            <Navigation mobile />
          </aside>
        </div>
      )}

      <main className={`${styles.main} ${polish.main}`} id="main-content" tabIndex={-1}>
        <header className={styles.pageHeader}>
          <div>
            <p className={styles.eyebrow}>{selectedModule.eyebrow} · Prototype persona</p>
            <h1>Good morning, Brayden.</h1>
            <p className={styles.headerSummary}>{selectedModule.title}</p>
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.statusButton}
              onClick={() => setStatusOpen((open) => !open)}
              aria-expanded={statusOpen}
              aria-controls="data-status-panel"
            >
              <span className={styles.statusDot} aria-hidden="true" />
              Prototype · no live sources
              <Icon name="chevron" />
            </button>
            <button
              type="button"
              className={styles.exportButton}
              onClick={() => setExportOpen((open) => !open)}
              aria-expanded={exportOpen}
              aria-controls="export-policy-panel"
            >
              <Icon name="download" />
              Export policy
            </button>
          </div>
        </header>

        <section className={`${styles.privacyBanner} ${polish.privacyBanner}`} aria-label="Privacy and prototype status">
          <span className={styles.privacyIcon}><Icon name="lock" /></span>
          <div>
            <strong>Aggregate-only member intelligence</strong>
            <p>No customer names, emails, phone numbers, street addresses, account IDs, or raw identifiers are exposed in this experience.</p>
          </div>
          <span className={styles.guardrail}>Illustrative values</span>
          <span className={styles.guardrail}>Authenticated benchmarks only</span>
        </section>

        {statusOpen && (
          <section className={styles.statusPanel} id="data-status-panel" aria-labelledby="data-status-title">
            <div className={styles.panelIcon}><Icon name="database" /></div>
            <div>
              <p className={styles.eyebrow}>Data status</p>
              <h2 id="data-status-title">This is an interaction prototype, not a connected report.</h2>
              <p>Every number is an aggregate example. Production certification requires source reconciliation across nopCommerce, shared inventory, routing allocations, returns, chargebacks, pricing, and settlement records. GA4 ecommerce requires a separate instrumentation audit.</p>
            </div>
            <dl>
              <div><dt>Freshness</dt><dd>Illustrative snapshot · Jul 9, 2026</dd></div>
              <div><dt>Source state</dt><dd>Disconnected</dd></div>
              <div><dt>Metric authority</dt><dd>Dave Rike and Distranet board</dd></div>
              <div><dt>Definitions</dt><dd>Contract v0 · not accounting policy</dd></div>
            </dl>
            <button className={styles.panelClose} type="button" onClick={() => setStatusOpen(false)} aria-label="Close data status panel"><Icon name="close" /></button>
          </section>
        )}

        {exportOpen && (
          <section className={styles.exportPanel} id="export-policy-panel" aria-labelledby="export-policy-title">
            <Icon name="shield" />
            <div>
              <strong id="export-policy-title">Production export is intentionally disabled.</strong>
              <p>Future production exports require server-enforced tenant isolation, aggregate-only customer privacy, metric versions, period, freshness, and reconciliation status. Prototype values will never be presented as certified data.</p>
            </div>
            <button type="button" onClick={() => setExportOpen(false)}>Understood</button>
          </section>
        )}

        <section className={`${styles.moduleFocus} ${polish.moduleFocus}`} aria-live="polite">
          <span className={styles.moduleIcon}><Icon name={selectedModule.icon} /></span>
          <div>
            <span>Selected module</span>
            <h2>{selectedModule.label}</h2>
            <p>{selectedModule.description}</p>
          </div>
          <div className={styles.moduleTags}>
            <span><Icon name="shield" />Aggregate only</span>
            <span><Icon name="clock" />Prototype snapshot</span>
          </div>
        </section>

        <section className={styles.toolbar} aria-label="Reporting period controls">
          <div className={styles.rangeGroup} role="group" aria-label="Preset reporting period">
            {(["MTD", "QTD", "YTD", "12M"] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={range === item ? styles.rangeActive : undefined}
                onClick={() => setRange(item)}
                aria-pressed={range === item}
              >
                {item}
              </button>
            ))}
          </div>
          <div className={styles.dateControl}>
            <button
              type="button"
              className={range === "CUSTOM" ? styles.dateActive : undefined}
              onClick={() => setDateOpen((open) => !open)}
              aria-expanded={dateOpen}
              aria-controls="custom-date-panel"
            >
              <Icon name="calendar" />
              <span>{periodLabel}</span>
              <Icon name="chevron" />
            </button>
            {dateOpen && (
              <form className={styles.datePanel} id="custom-date-panel" onSubmit={applyCustomRange}>
                <div>
                  <label htmlFor="report-start">Start date</label>
                  <input id="report-start" type="date" value={customStart} max={customEnd} onChange={(event) => setCustomStart(event.target.value)} />
                </div>
                <div>
                  <label htmlFor="report-end">End date</label>
                  <input id="report-end" type="date" value={customEnd} min={customStart} onChange={(event) => setCustomEnd(event.target.value)} />
                </div>
                <p>Custom dates update the prototype period label. Example values remain the fixed YTD reference snapshot until live sources are connected.</p>
                <button type="submit" disabled={!customStart || !customEnd || customStart > customEnd}>Apply dates</button>
              </form>
            )}
          </div>
          <label className={styles.comparisonControl}>
            <span>Compare with</span>
            <select value={comparison} onChange={(event) => setComparison(event.target.value)}>
              <option value="prior-year">Prior year</option>
              <option value="prior-period">Preceding period</option>
            </select>
          </label>
          <p className={styles.toolbarNote}><span /> Example values · effective Jul 9, 2026</p>
        </section>

        <section className={styles.kpiGrid} aria-label="Prototype key performance indicators">
          {kpis.map((kpi) => {
            const open = openDefinition === kpi.id;
            return (
              <article key={kpi.id} className={`${polish.calmCard} ${open ? styles.kpiOpen : ""}`}>
                <div className={styles.kpiLabel}>
                  <span>{kpi.label}</span>
                  <button
                    type="button"
                    onClick={() => setOpenDefinition(open ? null : kpi.id)}
                    aria-expanded={open}
                    aria-controls={`definition-${kpi.id}`}
                    aria-label={`Show definition for ${kpi.label}`}
                  >
                    <Icon name="info" />
                  </button>
                </div>
                <strong className={styles.kpiValue}>{kpi.value}</strong>
                <p className={styles.kpiTrend}><Icon name="trend" /><b>{kpi.trend}</b><span>{kpi.supporting}</span></p>
                <div className={styles.kpiStamp}><span>Prototype</span><span>{range}</span></div>
                {open && (
                  <div className={styles.definitionPanel} id={`definition-${kpi.id}`}>
                    <strong>Definition</strong>
                    <p>{kpi.definition}</p>
                    <dl>
                      <div><dt>Period</dt><dd>{periodLabel}</dd></div>
                      <div><dt>Freshness</dt><dd>Fixed example · Jul 9, 2026</dd></div>
                      <div><dt>Source</dt><dd>{kpi.source}</dd></div>
                      <div><dt>Status</dt><dd>{kpi.status}</dd></div>
                    </dl>
                  </div>
                )}
              </article>
            );
          })}
        </section>

        <div className={styles.dashboardGrid}>
          <section className={`${styles.card} ${styles.trendCard} ${polish.calmCard} ${polish.chartCard}`} aria-labelledby="trend-title">
            <header className={styles.cardHeader}>
              <div>
                <p className={styles.cardKicker}>Performance trend · fixed YTD example</p>
                <h2 id="trend-title">{selectedChart.label}</h2>
                <p>{selectedChart.summary}</p>
              </div>
              <div className={styles.metricSwitch} role="group" aria-label="Chart metric">
                {(Object.keys(chartMetrics) as MetricKey[]).map((key) => (
                  <button key={key} type="button" onClick={() => setChartMetric(key)} aria-pressed={chartMetric === key} className={chartMetric === key ? styles.metricActive : undefined}>
                    {chartMetrics[key].shortLabel}
                  </button>
                ))}
              </div>
            </header>
            <MetricMeta period="Fixed YTD · Jan–Jul 2026" />
            <div className={styles.legend} aria-label="Chart legend">
              <span><i className={styles.currentSwatch} />Fixed YTD example</span>
              <span><i className={styles.priorSwatch} />Prior-year example</span>
              <strong>Unit: {selectedChart.unit}</strong>
            </div>
            <div className={styles.chartArea}>
              <div className={styles.yAxis} aria-hidden="true">
                {[100, 75, 50, 25, 0].map((tick) => <span key={tick}>{Math.round((selectedChart.max * tick) / 100)}{selectedChart.unit === "$k" ? "k" : ""}</span>)}
              </div>
              <div className={styles.plot}>
                <svg viewBox="0 0 720 240" role="img" aria-label={`${selectedChart.summary} Fixed January through July YTD example; reporting-period controls do not alter this chart.`}>
                  <defs>
                    <linearGradient id="hub-chart-fill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#ed1c24" stopOpacity=".18" />
                      <stop offset="100%" stopColor="#ed1c24" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <g className={styles.gridLines}>
                    {[30, 77.5, 125, 172.5, 220].map((y) => <line key={y} x1="0" x2="720" y1={y} y2={y} />)}
                  </g>
                  <path className={styles.chartAreaFill} d={currentGeometry.area} />
                  <path pathLength="1" className={styles.priorLine} d={priorGeometry.line} />
                  <path pathLength="1" className={styles.currentLine} d={currentGeometry.line} />
                  {currentGeometry.points.map((point, index) => (
                    <circle key={months[index]} className={styles.chartPoint} cx={point.x} cy={point.y} r="4">
                      <title>{`${months[index]}: ${point.value}${selectedChart.unit === "$k" ? " thousand dollars" : " orders"}`}</title>
                    </circle>
                  ))}
                </svg>
                <div className={styles.xAxis} aria-hidden="true">{months.map((month) => <span key={month}>{month}</span>)}</div>
              </div>
            </div>
            <details className={styles.chartData}>
              <summary>View accessible chart data</summary>
              <div className={styles.chartTableWrap}>
                <table>
                  <caption>{selectedChart.label} fixed January through July YTD example values</caption>
                  <thead><tr><th>Month</th><th>Fixed YTD example</th><th>Prior-year example</th></tr></thead>
                  <tbody>{months.map((month, index) => <tr key={month}><th>{month}</th><td>{selectedChart.current[index]} {selectedChart.unit}</td><td>{selectedChart.previous[index]} {selectedChart.unit}</td></tr>)}</tbody>
                </table>
              </div>
            </details>
          </section>

          <section className={`${styles.card} ${styles.sourcesCard} ${polish.calmCard}`} aria-labelledby="sources-title">
            <header className={styles.cardHeader}>
              <div>
                <p className={styles.cardKicker}>Acquisition mix</p>
                <h2 id="sources-title">Demand sources</h2>
                <p>Illustrative session mix. GA4 ecommerce audit required before certification.</p>
              </div>
              <span className={styles.pendingBadge}>Instrumentation pending</span>
            </header>
            <div className={styles.donutLayout}>
              <div className={styles.donut} role="img" aria-label="Illustrative demand source mix: 42.6% organic search, 28.1% direct, 18.4% paid search, and 10.9% referral and other.">
                <div><strong>7,842</strong><span>example sessions</span></div>
              </div>
              <ul className={styles.sourceList}>
                {sourceMix.map((source) => (
                  <li key={source.label}><span><i style={{ background: source.color }} />{source.label}</span><strong>{source.value}%</strong></li>
                ))}
              </ul>
            </div>
            <div className={styles.auditNote}><Icon name="info" /><p><strong>Not a certified funnel.</strong> Ecommerce events, attribution rules, and session completeness have not been verified.</p></div>
          </section>

          <section className={`${styles.card} ${styles.settlementCard} ${polish.calmCard}`} aria-labelledby="settlement-title">
            <header className={styles.cardHeader}>
              <div>
                <p className={styles.cardKicker}>Member value model</p>
                <h2 id="settlement-title">From allocation to member proceeds</h2>
                <p>Calculated at order line × fulfilling member, never only at the order header.</p>
              </div>
              <span className={styles.draftBadge}>Draft rule v0</span>
            </header>
            <MetricMeta period={range} />
            <div className={styles.proceedsFlow}>
              <div className={styles.flowStep}>
                <span><Icon name="route" /></span>
                <small>Fulfillment allocation</small>
                <strong>Member is seller of record for its portion</strong>
              </div>
              <Icon name="arrow" className={styles.flowArrow} />
              <div className={styles.flowStep}>
                <span><Icon name="package" /></span>
                <small>Product reimbursement</small>
                <strong>{currency.format(snapshot.reimbursement)}</strong>
              </div>
              <span className={styles.flowOperator} aria-hidden="true">+</span>
              <div className={styles.flowStep}>
                <span><Icon name="value" /></span>
                <small>Member margin share</small>
                <strong>{currency.format(snapshot.margin)}</strong>
              </div>
            </div>
            <div className={styles.marginSplit} role="img" aria-label="Illustrative draft gross margin pool is split 50 percent to the fulfilling member and 50 percent to Parts Gopher.">
              <div><span>Fulfilling member</span><strong>50%</strong></div>
              <div><span>Parts Gopher</span><strong>50%</strong></div>
            </div>
            <div className={styles.proceedsSummary}>
              <div><span>Illustrative subtotal before adjustments</span><strong>{currency.format(snapshot.reimbursement + snapshot.margin)}</strong></div>
              <p>Returns, discounts, shipping subsidy, payment fees, chargebacks, and final cost treatment remain subject to reconciliation and board approval.</p>
            </div>
          </section>

          <section className={`${styles.card} ${styles.opportunityCard} ${polish.calmCard}`} aria-labelledby="opportunity-title">
            <header className={styles.cardHeader}>
              <div>
                <p className={styles.cardKicker}>Aggregate opportunity signals</p>
                <h2 id="opportunity-title">Demand your team can act on</h2>
                <p>Prototype signals contain no customer identities or identifiable location details.</p>
              </div>
            </header>
            <div className={styles.signalList}>
              <article>
                <span>01</span>
                <div><strong>Unavailable product demand</strong><p>184 aggregate searches ended without a purchasable result.</p></div>
                <em>$48.2k</em>
              </article>
              <article>
                <span>02</span>
                <div><strong>High-interest products</strong><p>12 SKUs show aggregate traffic with a low example conversion rate.</p></div>
                <em>12 SKUs</em>
              </article>
              <article>
                <span>03</span>
                <div><strong>Shared-inventory lift</strong><p>{integer.format(snapshot.splitCount)} recognized orders used more than one member in this example.</p></div>
                <em>{snapshot.splitRate}%</em>
              </article>
            </div>
          </section>

          <section className={`${styles.card} ${styles.productsCard} ${polish.calmCard}`} aria-labelledby="products-title">
            <header className={styles.cardHeader}>
              <div>
                <p className={styles.cardKicker}>Product intelligence</p>
                <h2 id="products-title">Products driving growth</h2>
                <p>Illustrative aggregate values ranked by attributed net sales.</p>
              </div>
              <button type="button" className={styles.textButton} onClick={() => chooseModule("products")}>Open product module<Icon name="arrow" /></button>
            </header>
            <div className={styles.tableWrap}>
              <table>
                <caption>Illustrative products driving aggregate attributed net sales</caption>
                <thead>
                  <tr>
                    {([
                      ["sku", "Product"],
                      ["brand", "Brand"],
                      ["category", "Category"],
                      ["sales", "Net sales"],
                      ["growth", "Growth"],
                    ] as [keyof ProductRow, string][]).map(([key, label]) => (
                      <th key={key} aria-sort={sort.key === key ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}>
                        <button type="button" onClick={() => updateSort(key)}>{label}<Icon name="chevron" className={sort.key === key && sort.direction === "asc" ? styles.sortAscending : undefined} /></button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedProducts.map((product) => (
                    <tr key={product.sku}>
                      <td data-label="Product"><span className={styles.productGlyph}><Icon name="package" /></span><strong>{product.sku}</strong></td>
                      <td data-label="Brand">{product.brand}</td>
                      <td data-label="Category">{product.category}</td>
                      <td data-label="Net sales" className={styles.numeric}>{currency.format(product.sales)}</td>
                      <td data-label="Growth" className={styles.growthCell}><Icon name="trend" />+{product.growth}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <footer className={styles.footer}>
          <div>
            <strong>Distranet member intelligence</strong>
            <span>Prototype experience · Air Hydro Power workspace</span>
          </div>
          <p><Icon name="lock" />All values are illustrative aggregate examples. No customer identities are exposed. No production source is connected.</p>
          <div className={styles.footerActions}>
            <button type="button" onClick={() => { setOpenDefinition("sales"); document.getElementById("main-content")?.scrollIntoView(); }}>Metric definitions</button>
            <button type="button" onClick={() => setStatusOpen(true)}>Data status</button>
            <span>Governed by Dave Rike + Distranet board</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

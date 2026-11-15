"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type {
  AggregateDemandSignal,
  MemberOverviewSnapshot,
  MemberService,
  MemberTenantBrand,
} from "@/domain/member-hub/types";
import { MemberIcon, type MemberIconName } from "../components/MemberIcon";
import type { MemberDashboardId } from "./member-workspace-routes";
import styles from "./MemberWorkspacePage.module.css";
import { memberDataForPeriod } from "../member-demo-data";
import { createDemonstrationReport, REPORT_PERIODS } from "./demonstration-report-export";
import { useMemberReportingPeriod } from "./MemberWorkspaceShell";
import { memberWorkspacePeriodHref } from "./member-workspace-navigation";

const periods = REPORT_PERIODS;
const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const wholeNumber = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const pageCopy: Record<
  MemberDashboardId,
  { eyebrow: string; title: string; description: string; icon: MemberIconName }
> = {
  commerce: {
    eyebrow: "Parts Gopher commerce",
    title: "See the demand the network routes into your business.",
    description:
      "A calm, aggregate view of attributed sales, demand origin, inventory matching, and split fulfillment—without exposing customer identities.",
    icon: "commerce",
  },
  orders: {
    eyebrow: "Allocation + order operations",
    title: "Follow every recognized order from allocation to shipment.",
    description:
      "A readable operating view of member allocation, split-order participation, shipment speed, returns, and seller-of-record context.",
    icon: "shipping",
  },
  financials: {
    eyebrow: "Member economics",
    title: "Trace illustrative proceeds without losing the definition behind them.",
    description:
      "Separate product reimbursement, member gross-margin share, Parts Gopher share, and adjustments in one finance-grade summary.",
    icon: "finance",
  },
  inventory: {
    eyebrow: "Inventory + availability",
    title: "See where shared inventory is ready—and where demand is escaping.",
    description:
      "Review product-family availability, stockout pressure, source freshness, and match readiness before taking operational action.",
    icon: "inventory",
  },
  customers: {
    eyebrow: "Privacy-safe customer intelligence",
    title: "Understand customer demand by cohort without exposing an identity.",
    description:
      "A privacy-safe rollup of sales, orders, inventory match, split participation, fill rate, and service speed across aggregate fulfillment areas.",
    icon: "locations",
  },
  benchmarks: {
    eyebrow: "Permitted network benchmarks",
    title: "Know where your operating performance leads—and where it trails.",
    description:
      "Compare privacy-safe member measures with the network median, then connect outliers to governed demand and availability signals.",
    icon: "pulse",
  },
  reports: {
    eyebrow: "Report center",
    title: "Move from one annual review to a dependable reporting rhythm.",
    description:
      "Open board-ready views, understand the definitions behind each report, and see what must be certified before governed exports are enabled.",
    icon: "reports",
  },
  settings: {
    eyebrow: "Workspace settings + services",
    title: "Keep member data, locations, access, and governance in one place.",
    description:
      "Review current portal capabilities, planned integrations, and the production controls required for a tenant-safe member workspace.",
    icon: "settings",
  },
};

function percent(value: number) {
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;
}

function chartScale(value: number, maximum: number): CSSProperties {
  return {
    "--chart-scale": Math.max(0.02, Math.min(1, value / Math.max(1, maximum))),
  } as CSSProperties;
}

function MetricCard({
  label,
  value,
  detail,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  detail: string;
  icon: MemberIconName;
  tone?: "default" | "positive" | "caution";
}) {
  return (
    <article className={styles.metricCard} data-tone={tone} data-reveal>
      <header>
        <span>{label}</span>
        <MemberIcon name={icon} />
      </header>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function Panel({
  eyebrow,
  title,
  aside,
  className,
  children,
}: {
  eyebrow: string;
  title: string;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`${styles.panel} ${className ?? ""}`} data-reveal>
      <header className={styles.panelHeader}>
        <div>
          <p>{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        {aside}
      </header>
      {children}
    </section>
  );
}

function ConfidenceNote({
  snapshot,
  tenant,
}: {
  snapshot: MemberOverviewSnapshot;
  tenant: MemberTenantBrand;
}) {
  return (
    <div className={styles.confidenceNote}>
      <span><i />Illustrative fixed example</span>
      <span>{tenant.shortName} tenant-scoped view</span>
      <span>Effective {snapshot.effectiveDate}</span>
      <span>Aggregate only</span>
    </div>
  );
}

function CommerceDashboard({
  tenant,
  snapshot,
}: {
  tenant: MemberTenantBrand;
  snapshot: MemberOverviewSnapshot;
}) {
  const channels = tenant.data.acquisitionChannels;
  const maxShare = Math.max(...channels.map((channel) => channel.share));
  const singleOrders = snapshot.recognizedOrders - snapshot.splitOrders;

  return (
    <>
      <div className={styles.metricGrid}>
        <MetricCard label="Attributed sales" value={currency.format(snapshot.attributedSales)} detail={`${snapshot.periodLabel} · illustrative gross sales`} icon="commerce" />
        <MetricCard label="Recognized orders" value={wholeNumber.format(snapshot.recognizedOrders)} detail="Aggregate Parts Gopher orders attributed to this member" icon="reports" />
        <MetricCard label="Inventory match" value={percent(snapshot.matchRate)} detail="Illustrative shared-inventory match rate" icon="inventory" tone="positive" />
        <MetricCard label="Split fulfillment" value={percent(snapshot.splitRate)} detail={`${wholeNumber.format(snapshot.splitOrders)} multi-member orders`} icon="split" />
      </div>

      <Panel
        eyebrow="Demand origin"
        title="Channel mix and attributed sales"
        aside={<span className={styles.definitionTag}>Aggregate channel reporting</span>}
      >
        <div className={styles.channelChart} role="img" aria-label="Illustrative demand origin by channel share">
          {channels.map((channel) => (
            <div className={styles.chartRow} key={channel.id}>
              <div className={styles.chartLabel}>
                <strong>{channel.label}</strong>
                <span>{channel.share}% of orders</span>
              </div>
              <div className={styles.barTrack}>
                <i
                  className={styles.barFill}
                  style={{ ...chartScale(channel.share, maxShare), background: channel.color }}
                />
              </div>
              <strong className={styles.chartValue}>{currency.format(channel.attributedSales)}</strong>
            </div>
          ))}
        </div>
      </Panel>

      <div className={styles.twoColumn}>
        <Panel eyebrow="Fulfillment mix" title="Single-member and split orders">
          <div className={styles.donutLayout}>
            <div
              className={styles.donut}
              style={{
                background: `conic-gradient(var(--tenant-primary) 0 ${100 - snapshot.splitRate}%, var(--tenant-secondary) ${100 - snapshot.splitRate}% 100%)`,
              }}
              role="img"
              aria-label={`${percent(100 - snapshot.splitRate)} single-member orders and ${percent(snapshot.splitRate)} split orders`}
            >
              <span><strong>{wholeNumber.format(snapshot.recognizedOrders)}</strong><small>orders</small></span>
            </div>
            <dl className={styles.legendList}>
              <div><dt><i data-color="primary" />Single-member</dt><dd>{wholeNumber.format(singleOrders)}</dd></div>
              <div><dt><i data-color="secondary" />Split fulfillment</dt><dd>{wholeNumber.format(snapshot.splitOrders)}</dd></div>
            </dl>
          </div>
        </Panel>

        <Panel eyebrow="Commerce interpretation" title="What the current view says">
          <div className={styles.insightList}>
            <article><MemberIcon name="pulse" /><span><strong>Match before acquisition</strong><p>Channel efficiency is only defensible after demand is reconciled with available shared inventory.</p></span></article>
            <article><MemberIcon name="split" /><span><strong>Split orders are normal</strong><p>Multiple members can participate when the closest in-stock source changes by line item.</p></span></article>
            <article><MemberIcon name="lock" /><span><strong>Prototype output is aggregate only</strong><p>This example contains no customer identities. Live authentication and tenant isolation are not connected yet.</p></span></article>
          </div>
        </Panel>
      </div>

      <Panel eyebrow="Channel detail" title="Commerce performance table">
        <div
          className={styles.tableWrap}
          role="region"
          aria-label="Commerce performance table"
          tabIndex={0}
        >
          <table>
            <thead><tr><th>Channel</th><th>Order share</th><th>Orders</th><th>Attributed sales</th><th>Match rate</th></tr></thead>
            <tbody>
              {channels.map((channel) => (
                <tr key={channel.id}>
                  <th scope="row"><i style={{ background: channel.color }} />{channel.label}</th>
                  <td>{channel.share}%</td>
                  <td>{wholeNumber.format(channel.orders)}</td>
                  <td>{currency.format(channel.attributedSales)}</td>
                  <td>{channel.matchRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

function ProductsDashboard({
  tenant,
}: {
  tenant: MemberTenantBrand;
}) {
  const products = tenant.data.productPerformance;
  const totalSales = products.reduce((sum, product) => sum + product.attributedSales, 0);
  const totalOrders = products.reduce((sum, product) => sum + product.recognizedOrders, 0);
  const totalMargin = products.reduce((sum, product) => sum + product.memberMarginShare, 0);
  const maximumSales = Math.max(...products.map((product) => product.attributedSales));
  const stockGapCount = products.filter((product) => product.signal === "stock-gap").length;
  const brandRollup = Array.from(
    products.reduce((groups, product) => {
      const current = groups.get(product.brand) ?? { sales: 0, orders: 0, margin: 0 };
      current.sales += product.attributedSales;
      current.orders += product.recognizedOrders;
      current.margin += product.memberMarginShare;
      groups.set(product.brand, current);
      return groups;
    }, new Map<string, { sales: number; orders: number; margin: number }>()),
  );

  return (
    <>
      <div className={styles.metricGrid}>
        <MetricCard label="Product-family sales" value={currency.format(totalSales)} detail="Illustrative sales across the product-family rollup" icon="commerce" />
        <MetricCard label="Recognized orders" value={wholeNumber.format(totalOrders)} detail={`${wholeNumber.format(products.length)} product families in view`} icon="reports" />
        <MetricCard label="Member margin share" value={currency.format(totalMargin)} detail="Illustrative member share across the product mix" icon="finance" tone="positive" />
        <MetricCard label="Stock-gap families" value={wholeNumber.format(stockGapCount)} detail="Product families requiring evidence review" icon="inventory" tone={stockGapCount ? "caution" : "positive"} />
      </div>

      <Panel
        eyebrow="Category contribution"
        title="Attributed sales by product family"
        aside={<span className={styles.definitionTag}>Illustrative aggregate product data</span>}
      >
        <div className={styles.familyChart} role="img" aria-label="Illustrative attributed sales by product family">
          {products.map((product) => (
            <div key={product.id}>
              <div>
                <span>{product.category}</span>
                <strong>{product.family}</strong>
                <small>{product.brand}</small>
              </div>
              <div className={styles.barTrack}>
                <i className={styles.barFill} data-tone={product.signal} style={chartScale(product.attributedSales, maximumSales)} />
              </div>
              <strong>{currency.format(product.attributedSales)}</strong>
            </div>
          ))}
        </div>
      </Panel>

      <div className={styles.twoColumn}>
        <Panel eyebrow="Brand rollup" title="Authorized-line contribution">
          <div className={styles.brandSummary}>
            {brandRollup.map(([brand, totals]) => (
              <article key={brand}>
                <span>{brand}</span>
                <strong>{currency.format(totals.sales)}</strong>
                <dl>
                  <div><dt>Orders</dt><dd>{wholeNumber.format(totals.orders)}</dd></div>
                  <div><dt>Member margin</dt><dd>{currency.format(totals.margin)}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </Panel>

        <Panel eyebrow="Availability lens" title="Match rate versus stockout pressure">
          <div className={styles.riskList}>
            {products.map((product) => (
              <article key={product.id} data-signal={product.signal}>
                <div><strong>{product.family}</strong><span>{product.signal.replace("-", " ")}</span></div>
                <div>
                  <span>Match <strong>{percent(product.matchRate)}</strong></span>
                  <span>Stockout <strong>{percent(product.stockoutRate)}</strong></span>
                  <span>Growth <strong>{product.growthRate > 0 ? "+" : ""}{percent(product.growthRate)}</strong></span>
                </div>
              </article>
            ))}
          </div>
        </Panel>
      </div>

      <Panel eyebrow="Product-family detail" title="Performance table">
        <div
          className={styles.tableWrap}
          role="region"
          aria-label="Product-family performance table"
          tabIndex={0}
        >
          <table>
            <caption className={styles.srOnly}>Illustrative product-family performance for {tenant.displayName}</caption>
            <thead><tr><th>Category / family</th><th>Brand</th><th>Sales</th><th>Orders</th><th>Member margin</th><th>Growth</th><th>Match</th><th>Stockout</th></tr></thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <th scope="row"><span className={styles.tablePrimary}>{product.category}</span><small>{product.family}</small></th>
                  <td>{product.brand}</td>
                  <td>{currency.format(product.attributedSales)}</td>
                  <td>{wholeNumber.format(product.recognizedOrders)}</td>
                  <td>{currency.format(product.memberMarginShare)}</td>
                  <td>{product.growthRate > 0 ? "+" : ""}{percent(product.growthRate)}</td>
                  <td>{percent(product.matchRate)}</td>
                  <td>{percent(product.stockoutRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

function TerritoriesDashboard({
  tenant,
}: {
  tenant: MemberTenantBrand;
}) {
  const territories = tenant.data.territoryPerformance;
  const totalSales = territories.reduce((sum, territory) => sum + territory.attributedSales, 0);
  const totalOrders = territories.reduce((sum, territory) => sum + territory.recognizedOrders, 0);
  const weightedMatch = territories.reduce((sum, territory) => sum + territory.matchRate * territory.recognizedOrders, 0) / Math.max(1, totalOrders);
  const weightedShipTime = territories.reduce((sum, territory) => sum + territory.averageShipHours * territory.recognizedOrders, 0) / Math.max(1, totalOrders);
  const maximumSales = Math.max(...territories.map((territory) => territory.attributedSales));

  return (
    <>
      <div className={styles.metricGrid}>
        <MetricCard label="Territory sales" value={currency.format(totalSales)} detail="Illustrative sales assigned to aggregate service areas" icon="commerce" />
        <MetricCard label="Recognized orders" value={wholeNumber.format(totalOrders)} detail="No customer address or identity is shown" icon="reports" />
        <MetricCard label="Weighted match" value={percent(weightedMatch)} detail="Order-weighted inventory match across service areas" icon="inventory" tone="positive" />
        <MetricCard label="Average ship time" value={`${weightedShipTime.toFixed(1)} hr`} detail="Illustrative order-weighted allocation-to-ship time" icon="shipping" />
      </div>

      <Panel
        eyebrow="Territory comparison"
        title="Sales, match, and speed by aggregate service area"
        aside={<span className={styles.definitionTag}>Customer identity suppressed</span>}
      >
        <div className={styles.territoryRows}>
          {territories.map((territory) => (
            <article key={territory.id}>
              <div><strong>{territory.label}</strong><span>{territory.scope}</span></div>
              <div className={styles.barTrack}><i className={styles.barFill} style={chartScale(territory.attributedSales, maximumSales)} /></div>
              <dl>
                <div><dt>Sales</dt><dd>{currency.format(territory.attributedSales)}</dd></div>
                <div><dt>Match</dt><dd>{percent(territory.matchRate)}</dd></div>
                <div><dt>Ship time</dt><dd>{territory.averageShipHours.toFixed(1)} hr</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </Panel>

      <div className={styles.twoColumn}>
        <Panel eyebrow="Coverage quality" title="Fill rate and split participation">
          <div className={styles.coverageList}>
            {territories.map((territory) => (
              <article key={territory.id}>
                <strong>{territory.label}</strong>
                <div><span>Fill rate</span><i><b style={chartScale(territory.fillRate, 100)} /></i><em>{percent(territory.fillRate)}</em></div>
                <div><span>Split rate</span><i><b data-tone="split" style={chartScale(territory.splitRate, 100)} /></i><em>{percent(territory.splitRate)}</em></div>
              </article>
            ))}
          </div>
        </Panel>

        <Panel eyebrow="Privacy threshold" title="Useful geography without customer exposure">
          <div className={styles.insightList}>
            <article><MemberIcon name="locations" /><span><strong>Service areas, not customer dots</strong><p>The portal reports aggregate fulfillment areas and never exposes a customer address or identity.</p></span></article>
            <article><MemberIcon name="lock" /><span><strong>Small cells roll up</strong><p>Low-volume geography is grouped into the other-served-territory row before member presentation.</p></span></article>
            <article><MemberIcon name="governance" /><span><strong>Territory rules remain governed</strong><p>Commercial territory definitions and overlap require Distranet leadership and board approval.</p></span></article>
          </div>
        </Panel>
      </div>

      <Panel eyebrow="Territory detail" title="Aggregate operating table">
        <div
          className={styles.tableWrap}
          role="region"
          aria-label="Aggregate territory operating table"
          tabIndex={0}
        >
          <table>
            <caption className={styles.srOnly}>Illustrative aggregate territory performance for {tenant.displayName}</caption>
            <thead><tr><th>Service area</th><th>Sales</th><th>Orders</th><th>Match</th><th>Fill</th><th>Split</th><th>Avg. ship time</th></tr></thead>
            <tbody>
              {territories.map((territory) => (
                <tr key={territory.id}>
                  <th scope="row"><span className={styles.tablePrimary}>{territory.label}</span><small>{territory.scope}</small></th>
                  <td>{currency.format(territory.attributedSales)}</td>
                  <td>{wholeNumber.format(territory.recognizedOrders)}</td>
                  <td>{percent(territory.matchRate)}</td>
                  <td>{percent(territory.fillRate)}</td>
                  <td>{percent(territory.splitRate)}</td>
                  <td>{territory.averageShipHours.toFixed(1)} hr</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

function OperationsDashboard({
  tenant,
  snapshot,
}: {
  tenant: MemberTenantBrand;
  snapshot: MemberOverviewSnapshot;
}) {
  const signals = tenant.data.demandSignals;
  const inventory = tenant.data.inventoryPerformance;
  const availableSkuCount = inventory.reduce((sum, item) => sum + item.availableSkuCount, 0);
  const averageStockout = inventory.reduce((sum, item) => sum + item.stockoutRate, 0) / Math.max(1, inventory.length);
  const maximumFreshness = Math.max(...inventory.map((item) => item.freshnessHours));

  return (
    <>
      <div className={styles.metricGrid}>
        <MetricCard label="Inventory match" value={percent(snapshot.matchRate)} detail="Illustrative shared-inventory match rate" icon="inventory" tone="positive" />
        <MetricCard label="Available SKU records" value={wholeNumber.format(availableSkuCount)} detail="Illustrative available records across product families" icon="operations" />
        <MetricCard label="Average stockout" value={percent(averageStockout)} detail="Simple product-family average for this prototype" icon="returns" tone="caution" />
        <MetricCard label="Oldest inventory update" value={`${maximumFreshness.toFixed(1)} hr`} detail="Illustrative source freshness in the current view" icon="pulse" />
      </div>

      <Panel
        eyebrow="Product-family availability"
        title="Demand, availability, and stockout pressure"
        aside={<span className={styles.definitionTag}>Shared inventory · illustrative</span>}
      >
        <div className={styles.inventoryRows}>
          {inventory.map((item) => (
            <article key={item.id} data-signal={item.status}>
              <div><strong>{item.family}</strong><span>{item.status.replace("-", " ")}</span></div>
              <div className={styles.indexPair}>
                <span>Demand <strong>{item.demandIndex}</strong></span>
                <i><b style={chartScale(item.demandIndex, 100)} /></i>
                <span>Availability <strong>{item.availabilityIndex}</strong></span>
                <i><b data-tone="availability" style={chartScale(item.availabilityIndex, 100)} /></i>
              </div>
              <dl>
                <div><dt>Available SKUs</dt><dd>{wholeNumber.format(item.availableSkuCount)}</dd></div>
                <div><dt>Match</dt><dd>{percent(item.matchRate)}</dd></div>
                <div><dt>Stockout</dt><dd>{percent(item.stockoutRate)}</dd></div>
                <div><dt>Freshness</dt><dd>{item.freshnessHours.toFixed(1)} hr</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </Panel>

      <Panel eyebrow="Demand coverage" title="Where demand and current availability diverge">
        <div className={styles.signalGrid}>
          {signals.map((signal) => (
            <article className={styles.signalCard} key={signal.id} data-signal={signal.signal}>
              <header><span>{signal.label}</span><strong>{signal.signal.replace("-", " ")}</strong></header>
              <p>{signal.summary}</p>
              <div className={styles.signalBars}>
                <div><span>Demand</span><i><b style={chartScale(signal.demandIndex, 100)} /></i><strong>{signal.demandIndex}</strong></div>
                <div><span>Availability</span><i><b style={chartScale(signal.availabilityIndex, 100)} /></i><strong>{signal.availabilityIndex}</strong></div>
              </div>
            </article>
          ))}
        </div>
      </Panel>

      <Panel eyebrow="Allocation readiness" title="The governed operating sequence">
        <ol className={styles.processList}>
          <li><span>01</span><MemberIcon name="opportunity" /><div><strong>Aggregate demand appears</strong><p>Customer identity remains outside the member view.</p></div></li>
          <li><span>02</span><MemberIcon name="inventory" /><div><strong>Shared inventory is evaluated</strong><p>Location and availability determine the illustrative allocation path.</p></div></li>
          <li><span>03</span><MemberIcon name="split" /><div><strong>Lines may split across members</strong><p>Multiple sellers can participate based on in-stock availability.</p></div></li>
          <li><span>04</span><MemberIcon name="governance" /><div><strong>Results require certified definitions</strong><p>Operational action waits for governed source, freshness, and approval.</p></div></li>
        </ol>
      </Panel>

      <Panel eyebrow="Inventory detail" title="Availability and source-freshness table">
        <div
          className={styles.tableWrap}
          role="region"
          aria-label="Inventory availability and source-freshness table"
          tabIndex={0}
        >
          <table>
            <caption className={styles.srOnly}>Illustrative product-family inventory availability for {tenant.displayName}</caption>
            <thead><tr><th>Product family</th><th>Available SKUs</th><th>Demand index</th><th>Availability index</th><th>Match</th><th>Stockout</th><th>Freshness</th></tr></thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id}>
                  <th scope="row"><span className={styles.tablePrimary}>{item.family}</span><small>{item.status.replace("-", " ")}</small></th>
                  <td>{wholeNumber.format(item.availableSkuCount)}</td>
                  <td>{item.demandIndex}</td>
                  <td>{item.availabilityIndex}</td>
                  <td>{percent(item.matchRate)}</td>
                  <td>{percent(item.stockoutRate)}</td>
                  <td>{item.freshnessHours.toFixed(1)} hr</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

function FulfillmentDashboard({
  tenant,
  snapshot,
}: {
  tenant: MemberTenantBrand;
  snapshot: MemberOverviewSnapshot;
}) {
  const fulfillment = tenant.data.fulfillmentPerformance;
  const totalLines = fulfillment.reduce((sum, lane) => sum + lane.allocatedLines, 0);
  const totalOrders = fulfillment.reduce((sum, lane) => sum + lane.recognizedOrders, 0);
  const weightedSameDay = fulfillment.reduce((sum, lane) => sum + lane.sameDayRate * lane.recognizedOrders, 0) / Math.max(1, totalOrders);
  const weightedShip = fulfillment.reduce((sum, lane) => sum + lane.averageShipHours * lane.recognizedOrders, 0) / Math.max(1, totalOrders);
  const maximumLines = Math.max(...fulfillment.map((lane) => lane.allocatedLines));

  return (
    <>
      <div className={styles.metricGrid}>
        <MetricCard label="Allocated lines" value={wholeNumber.format(totalLines)} detail="Illustrative line-level allocations across fulfillment lanes" icon="split" />
        <MetricCard label="Split orders" value={wholeNumber.format(snapshot.splitOrders)} detail={`${percent(snapshot.splitRate)} of recognized orders`} icon="operations" />
        <MetricCard label="Same-day readiness" value={percent(weightedSameDay)} detail="Order-weighted illustrative fulfillment readiness" icon="shipping" tone="positive" />
        <MetricCard label="Average ship time" value={`${weightedShip.toFixed(1)} hr`} detail="Illustrative allocation-to-ship duration" icon="pulse" />
      </div>

      <Panel
        eyebrow="Allocation lanes"
        title="Line volume and speed by fulfillment source"
        aside={<span className={styles.definitionTag}>Other-member identities suppressed</span>}
      >
        <div className={styles.fulfillmentLanes}>
          {fulfillment.map((lane) => (
            <article key={lane.id}>
              <div><strong>{lane.label}</strong><span>{lane.allocationType}</span></div>
              <div className={styles.barTrack}><i className={styles.barFill} style={chartScale(lane.allocatedLines, maximumLines)} /></div>
              <strong>{wholeNumber.format(lane.allocatedLines)} lines</strong>
              <dl>
                <div><dt>Same day</dt><dd>{percent(lane.sameDayRate)}</dd></div>
                <div><dt>Ship time</dt><dd>{lane.averageShipHours.toFixed(1)} hr</dd></div>
                <div><dt>Split share</dt><dd>{percent(lane.splitShare)}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </Panel>

      <div className={styles.twoColumn}>
        <Panel eyebrow="Split-order composition" title="One checkout can become several sellers">
          <div className={styles.donutLayout}>
            <div
              className={styles.donut}
              style={{ background: `conic-gradient(var(--tenant-primary) 0 ${100 - snapshot.splitRate}%, var(--tenant-secondary) ${100 - snapshot.splitRate}% 100%)` }}
              role="img"
              aria-label={`${percent(100 - snapshot.splitRate)} single-member orders and ${percent(snapshot.splitRate)} split orders`}
            >
              <span><strong>{wholeNumber.format(snapshot.recognizedOrders)}</strong><small>orders</small></span>
            </div>
            <dl className={styles.legendList}>
              <div><dt><i data-color="primary" />Single member</dt><dd>{wholeNumber.format(snapshot.recognizedOrders - snapshot.splitOrders)}</dd></div>
              <div><dt><i data-color="secondary" />Split fulfillment</dt><dd>{wholeNumber.format(snapshot.splitOrders)}</dd></div>
            </dl>
          </div>
        </Panel>

        <Panel eyebrow="Seller-of-record rules" title="What the member needs to understand">
          <div className={styles.insightList}>
            <article><MemberIcon name="locations" /><span><strong>Closest stocked member wins the line</strong><p>Illustrative routing begins with customer geography and current shared-inventory availability.</p></span></article>
            <article><MemberIcon name="split" /><span><strong>Multiple members can participate</strong><p>Each participating member remains seller of record for the lines allocated to it.</p></span></article>
            <article><MemberIcon name="returns" /><span><strong>Returns stay visible</strong><p>Return and chargeback treatment belongs in settlement reconciliation, not inside a hidden net number.</p></span></article>
          </div>
        </Panel>
      </div>

      <Panel eyebrow="Fulfillment detail" title="Allocation-to-ship operating table">
        <div
          className={styles.tableWrap}
          role="region"
          aria-label="Fulfillment performance table"
          tabIndex={0}
        >
          <table>
            <caption className={styles.srOnly}>Illustrative fulfillment performance for {tenant.displayName}</caption>
            <thead><tr><th>Fulfillment lane</th><th>Allocated lines</th><th>Orders</th><th>Same day</th><th>Avg. ship time</th><th>Split share</th><th>Return signal</th></tr></thead>
            <tbody>
              {fulfillment.map((lane) => (
                <tr key={lane.id}>
                  <th scope="row"><span className={styles.tablePrimary}>{lane.label}</span><small>{lane.allocationType}</small></th>
                  <td>{wholeNumber.format(lane.allocatedLines)}</td>
                  <td>{wholeNumber.format(lane.recognizedOrders)}</td>
                  <td>{percent(lane.sameDayRate)}</td>
                  <td>{lane.averageShipHours.toFixed(1)} hr</td>
                  <td>{percent(lane.splitShare)}</td>
                  <td>{percent(lane.returnRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

function FinanceDashboard({ snapshot }: { snapshot: MemberOverviewSnapshot }) {
  const financeRows = [
    { label: "Product reimbursement", amount: snapshot.productReimbursement, tone: "primary" },
    { label: "Member gross-margin share", amount: snapshot.memberMarginShare, tone: "positive" },
    { label: "Parts Gopher gross-margin share", amount: snapshot.partsGopherMarginShare, tone: "network" },
    { label: "Adjustments shown separately", amount: snapshot.adjustments, tone: "caution" },
  ] as const;
  const maxAmount = Math.max(...financeRows.map((row) => row.amount));
  const returnAmount = Math.round(snapshot.adjustments * 0.44);
  const discountAmount = Math.round(snapshot.adjustments * 0.24);
  const shippingAmount = Math.round(snapshot.adjustments * 0.17);
  const chargebackAmount = Math.round(snapshot.adjustments * 0.1);
  const taxReviewAmount = Math.max(
    0,
    snapshot.adjustments - returnAmount - discountAmount - shippingAmount - chargebackAmount,
  );
  const adjustmentRows = [
    { label: "Returns", amount: returnAmount, treatment: "Reduce the applicable sale and reconcile the allocated seller lines." },
    { label: "Discounts", amount: discountAmount, treatment: "Show separately before the approved gross-margin definition is applied." },
    { label: "Shipping adjustments", amount: shippingAmount, treatment: "Keep freight and handling outside hidden margin assumptions." },
    { label: "Chargebacks", amount: chargebackAmount, treatment: "Assign only after the responsible order lines and dispute outcome are known." },
    { label: "Tax nexus review", amount: taxReviewAmount, treatment: "Ohio and Florida Parts Gopher nexus is flagged for certified tax handling." },
  ];

  return (
    <>
      <div className={styles.metricGrid}>
        <MetricCard label="Product reimbursement" value={currency.format(snapshot.productReimbursement)} detail="Illustrative reimbursement for fulfilled product" icon="statements" />
        <MetricCard label="Member margin share" value={currency.format(snapshot.memberMarginShare)} detail="50% of the illustrative gross-margin pool" icon="finance" tone="positive" />
        <MetricCard label="Parts Gopher share" value={currency.format(snapshot.partsGopherMarginShare)} detail="Matching 50% illustrative gross-margin share" icon="commerce" />
        <MetricCard label="Adjustments" value={currency.format(snapshot.adjustments)} detail="Presented separately pending certified treatment" icon="returns" tone="caution" />
      </div>

      <Panel eyebrow="Settlement composition" title="Keep every economic layer visible">
        <div className={styles.financeChart} role="img" aria-label="Illustrative finance summary by settlement component">
          {financeRows.map((row) => (
            <div key={row.label}>
              <span>{row.label}</span>
              <div className={styles.barTrack}><i className={styles.barFill} data-tone={row.tone} style={chartScale(row.amount, maxAmount)} /></div>
              <strong>{currency.format(row.amount)}</strong>
            </div>
          ))}
        </div>
      </Panel>

      <div className={styles.twoColumn}>
        <Panel eyebrow="Gross-margin economics" title="The illustrative 50 / 50 split">
          <div className={styles.splitEconomics}>
            <article><span>Member</span><strong>50%</strong><p>{currency.format(snapshot.memberMarginShare)}</p></article>
            <i aria-hidden="true" />
            <article><span>Parts Gopher</span><strong>50%</strong><p>{currency.format(snapshot.partsGopherMarginShare)}</p></article>
          </div>
          <p className={styles.panelNote}>Product reimbursement is reported separately from the illustrative gross-margin pool.</p>
        </Panel>

        <Panel eyebrow="Statement controls" title="What must be certified before production">
          <ul className={styles.controlList}>
            <li><MemberIcon name="governance" /><span><strong>Metric definitions</strong><small>Owner: Dave Rike and Distranet board</small></span></li>
            <li><MemberIcon name="returns" /><span><strong>Adjustment treatment</strong><small>Returns, fees, tax, discounts, and chargebacks</small></span></li>
            <li><MemberIcon name="pulse" /><span><strong>Source lineage and freshness</strong><small>nopCommerce and shared-inventory reconciliation</small></span></li>
            <li><MemberIcon name="lock" /><span><strong>Planned tenant-safe export</strong><small>Production requires server-enforced scope and an audit receipt</small></span></li>
          </ul>
        </Panel>
      </div>

      <Panel
        eyebrow="Returns + adjustments"
        title="Reconciliation categories stay outside the 50 / 50 headline"
        aside={<span className={styles.definitionTag}>Illustrative · definitions pending approval</span>}
      >
        <div className={styles.adjustmentRows}>
          {adjustmentRows.map((row) => (
            <article key={row.label}>
              <div><strong>{row.label}</strong><p>{row.treatment}</p></div>
              <span>{currency.format(row.amount)}</span>
            </article>
          ))}
        </div>
        <div className={styles.statementNotice}><MemberIcon name="governance" /><p>Returns, shipping, discounts, chargebacks, fees, and tax treatment require certified definitions approved by Dave Rike and the Distranet board before this can become a payable statement.</p></div>
      </Panel>

      <Panel eyebrow="Illustrative statement" title="Period summary">
        <div className={styles.statementRows}>
          {financeRows.map((row) => (
            <div key={row.label}><span>{row.label}</span><strong>{currency.format(row.amount)}</strong></div>
          ))}
        </div>
        <div className={styles.statementNotice}><MemberIcon name="lock" /><p>This is a presentation prototype, not a payable statement or certified settlement record.</p></div>
      </Panel>
    </>
  );
}

function signalLabel(signal: AggregateDemandSignal["signal"]) {
  if (signal === "stock-gap") return "Stock gap";
  if (signal === "watch") return "Watch";
  return "Covered";
}

function OpportunitiesDashboard({
  tenant,
  snapshot,
}: {
  tenant: MemberTenantBrand;
  snapshot: MemberOverviewSnapshot;
}) {
  const signals = [...tenant.data.demandSignals].sort(
    (left, right) => right.opportunityValue - left.opportunityValue,
  );
  const maximumOpportunity = Math.max(...signals.map((signal) => signal.opportunityValue));
  const stockGaps = signals.filter((signal) => signal.signal === "stock-gap").length;
  const actions = tenant.data.actionItems;

  return (
    <>
      <div className={styles.metricGrid}>
        <MetricCard label="Opportunity value" value={currency.format(snapshot.opportunityValue)} detail="Illustrative period-level opportunity signal" icon="opportunity" tone="positive" />
        <MetricCard label="Stock-gap cells" value={wholeNumber.format(stockGaps)} detail="Aggregate demand cells requiring review" icon="inventory" tone="caution" />
        <MetricCard label="Signals under review" value={wholeNumber.format(signals.length)} detail="No customer identities are exposed" icon="pulse" />
        <MetricCard label="Highest demand index" value={wholeNumber.format(Math.max(...signals.map((signal) => signal.demandIndex)))} detail="Index only · not a production forecast" icon="reports" />
      </div>

      <Panel eyebrow="Ranked opportunity flow" title="Opportunity value by aggregate signal">
        <div className={styles.opportunityBars}>
          {signals.map((signal, index) => (
            <article key={signal.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><strong>{signal.label}</strong><small>{signalLabel(signal.signal)}</small></div>
              <div className={styles.barTrack}><i className={styles.barFill} data-tone={signal.signal} style={chartScale(signal.opportunityValue, maximumOpportunity)} /></div>
              <strong>{currency.format(signal.opportunityValue)}</strong>
            </article>
          ))}
        </div>
      </Panel>

      <div className={styles.signalGrid}>
        {signals.map((signal) => (
          <article className={styles.opportunityCard} key={signal.id} data-signal={signal.signal} data-reveal>
            <header><span>{signal.label}</span><strong>{signalLabel(signal.signal)}</strong></header>
            <p>{signal.summary}</p>
            <dl>
              <div><dt>Demand</dt><dd>{signal.demandIndex}</dd></div>
              <div><dt>Availability</dt><dd>{signal.availabilityIndex}</dd></div>
              <div><dt>Opportunity</dt><dd>{currency.format(signal.opportunityValue)}</dd></div>
            </dl>
          </article>
        ))}
      </div>

      <Panel
        eyebrow="Governed action queue"
        title="What should be reviewed next—and who owns the evidence"
        aside={<span className={styles.definitionTag}>No automatic execution</span>}
      >
        <div className={styles.actionQueue}>
          {actions.map((action) => (
            <article key={action.id} data-priority={action.priority}>
              <span>{action.category}</span>
              <div><strong>{action.title}</strong><p>{action.evidence}</p></div>
              <dl>
                <div><dt>Owner</dt><dd>{action.owner}</dd></div>
                <div><dt>Illustrative value</dt><dd>{currency.format(action.value)}</dd></div>
              </dl>
              <em>{action.status.replaceAll("-", " ")}</em>
            </article>
          ))}
        </div>
      </Panel>

      <Panel eyebrow="Decision governance" title="Insight is not execution">
        <ol className={styles.approvalPath}>
          <li><span>Signal</span><p>Aggregate demand and availability reveal a possible gap.</p></li>
          <li><span>Evidence</span><p>Inventory source, freshness, and commercial assumptions are validated.</p></li>
          <li><span>Approval</span><p>Authorized member and Distranet owners review the recommendation.</p></li>
          <li><span>Execution</span><p>A separate governed workflow records the action and outcome.</p></li>
        </ol>
        <div className={styles.statementNotice}><MemberIcon name="governance" /><p>This prototype ranks signals only. It does not place inventory, change pricing, or launch campaigns.</p></div>
      </Panel>
    </>
  );
}

function BenchmarksDashboard({
  tenant,
  snapshot,
}: {
  tenant: MemberTenantBrand;
  snapshot: MemberOverviewSnapshot;
}) {
  const benchmarks = tenant.data.benchmarks;
  const signals = [...tenant.data.demandSignals].sort(
    (left, right) => right.opportunityValue - left.opportunityValue,
  );
  const leadingMeasures = benchmarks.filter(
    (benchmark) => benchmark.value > benchmark.median,
  ).length;
  const averageLead = benchmarks.reduce(
    (sum, benchmark) => sum + benchmark.value - benchmark.median,
    0,
  ) / Math.max(1, benchmarks.length);
  const maximumOpportunity = Math.max(...signals.map((signal) => signal.opportunityValue));

  return (
    <>
      <div className={styles.metricGrid}>
        <MetricCard label="Measures compared" value={wholeNumber.format(benchmarks.length)} detail="Privacy-safe measures permitted for the member workspace" icon="pulse" />
        <MetricCard label="Above network median" value={wholeNumber.format(leadingMeasures)} detail="Illustrative member measures currently ahead of the median" icon="reports" tone="positive" />
        <MetricCard label="Average lead" value={`${averageLead >= 0 ? "+" : ""}${averageLead.toFixed(1)} pts`} detail="Simple illustrative difference from the network median" icon="finance" tone={averageLead >= 0 ? "positive" : "caution"} />
        <MetricCard label="Demand opportunity" value={currency.format(snapshot.opportunityValue)} detail="Aggregate signal only · not an approved forecast" icon="opportunity" />
      </div>

      <Panel
        eyebrow="Network comparison"
        title="Member performance against the privacy-safe median"
        aside={<span className={styles.definitionTag}>Benchmarks permitted · definitions illustrative</span>}
      >
        <div className={styles.readinessList}>
          {benchmarks.map((benchmark) => (
            <article key={benchmark.label}>
              <div>
                <strong>{benchmark.label}</strong>
                <span>{benchmark.percentile} · {benchmark.delta}</span>
              </div>
              <div
                className={styles.comparisonTrack}
                role="img"
                aria-label={`${benchmark.label}: ${tenant.shortName} ${benchmark.value}; network median ${benchmark.median}`}
              >
                <i className={styles.medianMarker} style={{ left: `${benchmark.median}%` }} />
                <i className={styles.memberBar} style={chartScale(benchmark.value, 100)} />
              </div>
              <div className={styles.comparisonValues}>
                <span>Network median {benchmark.median}</span>
                <strong>{tenant.shortName} {benchmark.value}</strong>
              </div>
            </article>
          ))}
        </div>
      </Panel>

      <Panel
        eyebrow="Demand-gap context"
        title="Connect benchmark outliers to the aggregate signals behind them"
        aside={<span className={styles.definitionTag}>No customer identities</span>}
      >
        <div className={styles.opportunityBars}>
          {signals.map((signal, index) => (
            <article key={signal.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><strong>{signal.label}</strong><small>{signalLabel(signal.signal)}</small></div>
              <div className={styles.barTrack}><i className={styles.barFill} data-tone={signal.signal} style={chartScale(signal.opportunityValue, maximumOpportunity)} /></div>
              <strong>{currency.format(signal.opportunityValue)}</strong>
            </article>
          ))}
        </div>
      </Panel>

      <Panel
        eyebrow="Governed follow-up"
        title="Benchmark exceptions move to review—not automatic execution"
        aside={<span className={styles.definitionTag}>Dave Rike + board definition authority</span>}
      >
        <div className={styles.actionQueue}>
          {tenant.data.actionItems.map((action) => (
            <article key={action.id} data-priority={action.priority}>
              <span>{action.category}</span>
              <div><strong>{action.title}</strong><p>{action.evidence}</p></div>
              <dl>
                <div><dt>Owner</dt><dd>{action.owner}</dd></div>
                <div><dt>Illustrative value</dt><dd>{currency.format(action.value)}</dd></div>
              </dl>
              <em>{action.status.replaceAll("-", " ")}</em>
            </article>
          ))}
        </div>
      </Panel>
    </>
  );
}

function ReportsDashboard({
  tenant,
  snapshot,
}: {
  tenant: MemberTenantBrand;
  snapshot: MemberOverviewSnapshot;
}) {
  const [downloadStatus, setDownloadStatus] = useState("Choose CSV for analysis or JSON for the complete demonstration receipt. No upload or live data transfer occurs.");

  useEffect(() => {
    setDownloadStatus("Choose CSV for analysis or JSON for the complete demonstration receipt. No upload or live data transfer occurs.");
  }, [tenant.slug, snapshot.period]);

  function downloadDemonstration(format: "csv" | "json") {
    let href: string | undefined;
    let anchor: HTMLAnchorElement | undefined;
    try {
      const report = createDemonstrationReport({ company: { slug: tenant.slug, name: tenant.displayName }, snapshot, generatedAt: new Date().toISOString() });
      const filename = `${report.fileBase}.${format}`;
      const blob = new Blob([report[format]], { type: format === "csv" ? "text/csv;charset=utf-8" : "application/json;charset=utf-8" });
      href = URL.createObjectURL(blob);
      anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      setDownloadStatus(`${format.toUpperCase()} prepared for ${tenant.displayName}, ${snapshot.period}. Your browser will handle the download. The file contains illustrative aggregate data and its source notice—not a certified report.`);
    } catch {
      setDownloadStatus("The demonstration file could not be prepared. Please try again. No data was uploaded or changed.");
    } finally {
      anchor?.remove();
      if (href) {
        const downloadHref = href;
        // Allow the browser to consume the click before releasing its local Blob URL.
        window.setTimeout(() => URL.revokeObjectURL(downloadHref), 30_000);
      }
    }
  }

  const reports = [
    {
      label: "Commerce performance",
      description: "Attributed sales, channel mix, orders, and product-family performance.",
      workspace: "commerce" as const,
      icon: "commerce" as const,
      cadence: "Monthly operating view",
    },
    {
      label: "Order + fulfillment review",
      description: "Allocated lines, split participation, shipment speed, and return signals.",
      workspace: "orders" as const,
      icon: "shipping" as const,
      cadence: "Weekly operations view",
    },
    {
      label: "Member economics",
      description: "Product reimbursement, gross-margin share, and visible adjustments.",
      workspace: "financials" as const,
      icon: "finance" as const,
      cadence: "Monthly finance view",
    },
    {
      label: "Network benchmark review",
      description: "Permitted member-versus-network comparison with governed demand signals.",
      workspace: "benchmarks" as const,
      icon: "pulse" as const,
      cadence: "Quarterly board view",
    },
  ];

  return (
    <>
      <div className={styles.metricGrid}>
        <MetricCard label="Reporting views" value={wholeNumber.format(reports.length)} detail="Purpose-built operating and board reporting destinations" icon="reports" />
        <MetricCard label="Reporting windows" value={wholeNumber.format(periods.length)} detail="MTD, QTD, YTD, and rolling 12-month examples" icon="pulse" />
        <MetricCard label="Current effective date" value={snapshot.effectiveDate} detail="Illustrative fixed data · no live source connected" icon="statements" />
        <MetricCard label="Customer identities" value="0" detail="All member reporting remains aggregate only" icon="lock" tone="positive" />
      </div>

      <Panel eyebrow="Demonstration downloads" title="Take this illustrative snapshot with you" aside={<span className={styles.definitionTag}>Local file only · not certified</span>}>
        <div className={styles.statementRows}>
          <div><span>Selected company</span><strong>{tenant.displayName}</strong></div>
          <div><span>Reporting window</span><strong>{snapshot.periodLabel}</strong></div>
          <div><span>Source status</span><strong>Illustrative · {snapshot.effectiveDate}</strong></div>
        </div>
        <p className={styles.panelNote}>Both formats contain the same ten aggregate summary measures, company identifier, reporting window, generation time, reporting timezone, and draft-definition notice. No customer identities, detailed order records, or uploaded documents are included.</p>
        <div className={styles.periodBlock} style={{ maxWidth: 480, minWidth: 0, marginTop: 18 }}>
          <span>Choose a file format</span>
          <div style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
            <button type="button" onClick={() => downloadDemonstration("csv")} aria-describedby="demonstration-download-status">Download CSV</button>
            <button type="button" onClick={() => downloadDemonstration("json")} aria-describedby="demonstration-download-status">Download JSON</button>
          </div>
        </div>
        <p id="demonstration-download-status" className={styles.panelNote} role="status" aria-live="polite" aria-atomic="true">{downloadStatus}</p>
        <div className={styles.statementNotice}><MemberIcon name="lock" /><p>This public prototype has no live authentication or server-enforced company isolation. Downloads are generated locally from demonstration data only. Real document uploads and governed production exports are not enabled.</p></div>
      </Panel>

      <Panel
        eyebrow="Report library"
        title="Open the view that matches the decision in front of you"
        aside={<span className={styles.definitionTag}>Interactive views available · governed exports planned</span>}
      >
        <div className={styles.reportLibrary}>
          {reports.map((report) => (
            <Link
              key={report.workspace}
              href={memberWorkspacePeriodHref(tenant.slug, report.workspace, snapshot.period)}
              className={styles.reportCard}
            >
              <span className={styles.reportIcon}><MemberIcon name={report.icon} /></span>
              <span className={styles.reportCopy}>
                <small>{report.cadence}</small>
                <strong>{report.label}</strong>
                <p>{report.description}</p>
              </span>
              <span className={styles.reportAction}>Open view <MemberIcon name="arrow" /></span>
            </Link>
          ))}
        </div>
      </Panel>

      <div className={styles.twoColumn}>
        <Panel eyebrow="Definition register" title="Every reported number needs an owner">
          <ul className={styles.controlList}>
            <li><MemberIcon name="governance" /><span><strong>Metric approval</strong><small>Dave Rike and the Distranet board resolve definitions and disputes.</small></span></li>
            <li><MemberIcon name="inventory" /><span><strong>Inventory lineage</strong><small>Shared-inventory source, location scope, and freshness must remain visible.</small></span></li>
            <li><MemberIcon name="commerce" /><span><strong>Commerce reconciliation</strong><small>nopCommerce orders must join to allocated member lines and adjustments.</small></span></li>
            <li><MemberIcon name="lock" /><span><strong>Privacy boundary</strong><small>Members receive aggregate reporting without customer identities.</small></span></li>
          </ul>
        </Panel>

        <Panel eyebrow="Governed export roadmap" title="What must be true before a file can leave the workspace">
          <ol className={styles.reportRequirements}>
            <li><span>01</span><p><strong>Authenticate the member</strong> with server-enforced tenant and role scope.</p></li>
            <li><span>02</span><p><strong>Certify the metric set</strong> with approved definitions, source lineage, and freshness.</p></li>
            <li><span>03</span><p><strong>Apply export policy</strong> for aggregate thresholds, time range, and authorized fields.</p></li>
            <li><span>04</span><p><strong>Issue an audit receipt</strong> recording who exported what and when.</p></li>
          </ol>
        </Panel>
      </div>
    </>
  );
}

function ServiceGroup({
  label,
  services,
}: {
  label: string;
  services: readonly MemberService[];
}) {
  return (
    <section className={styles.serviceGroup} data-reveal>
      <header><h2>{label}</h2><span>{services.length}</span></header>
      <div className={styles.serviceGrid}>
        {services.map((service) => (
          <article key={service.id}>
            <div><MemberIcon name={service.id === "inventory" ? "inventory" : service.id === "pricing" ? "pricing" : service.id === "locations" ? "locations" : service.id === "shipping" ? "shipping" : service.id === "returns" ? "returns" : service.id === "statements" ? "statements" : service.id === "governance" ? "governance" : "reports"} /></div>
            <p>{service.eyebrow}</p>
            <h3>{service.label}</h3>
            <span>{service.description}</span>
            <footer>{service.status.replace("-", " ")}</footer>
          </article>
        ))}
      </div>
    </section>
  );
}

function ServicesDashboard({ tenant }: { tenant: MemberTenantBrand }) {
  const current = tenant.data.services.filter((service) => service.status === "current-portal");
  const planned = tenant.data.services.filter((service) => service.status === "planned");
  const governance = tenant.data.services.filter((service) => service.status === "governance");

  return (
    <>
      <div className={styles.metricGrid}>
        <MetricCard label="Current capabilities" value={wholeNumber.format(current.length)} detail="Functions represented in today’s portal" icon="operations" tone="positive" />
        <MetricCard label="Planned workflows" value={wholeNumber.format(planned.length)} detail="Prototype services awaiting implementation" icon="settings" />
        <MetricCard label="Governance centers" value={wholeNumber.format(governance.length)} detail="Definition, lineage, privacy, and approval" icon="governance" />
        <MetricCard label="Customer identities" value="0" detail="Aggregate member view only" icon="lock" tone="positive" />
      </div>

      <ServiceGroup label="Available member operations" services={current} />
      <ServiceGroup label="Planned member workflows" services={planned} />
      <ServiceGroup label="Data trust and governance" services={governance} />

      <Panel eyebrow="Connection roadmap" title="What turns this prototype into a production workspace">
        <div className={styles.connectionGrid}>
          <article><span>01</span><MemberIcon name="inventory" /><strong>Shared inventory</strong><p>Tenant-authorized availability, location, and freshness.</p></article>
          <article><span>02</span><MemberIcon name="commerce" /><strong>nopCommerce</strong><p>Orders, allocation lines, returns, and transaction status.</p></article>
          <article><span>03</span><MemberIcon name="lock" /><strong>Planned identity boundary</strong><p>Prototype only; production requires server-enforced tenant, role, export, cache, and audit scope.</p></article>
          <article><span>04</span><MemberIcon name="governance" /><strong>Certified metrics</strong><p>Approved definitions, lineage, freshness, and dispute workflow.</p></article>
        </div>
      </Panel>
    </>
  );
}

export function MemberWorkspacePage({
  tenant: sourceTenant,
  workspace,
}: {
  tenant: MemberTenantBrand;
  workspace: MemberDashboardId;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { period, selectPeriod } = useMemberReportingPeriod();
  const tenant = { ...sourceTenant, data: memberDataForPeriod(sourceTenant, period) };
  const snapshot = tenant.data.snapshots[period];
  const copy = pageCopy[workspace];

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (typeof IntersectionObserver === "undefined") {
      items.forEach((item) => { item.dataset.visible = "true"; });
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).dataset.visible = "true";
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.04, rootMargin: "0px 0px -2%" },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [workspace]);

  return (
    <div
      ref={rootRef}
      className={styles.page}
      data-member-motion="calm-dashboard"
      data-tenant={tenant.slug}
    >
      <header className={styles.pageHeader} data-reveal>
        <div className={styles.pageTitle}>
          <div className={styles.tenantSignature}>
            <div className={styles.tenantSignatureMark}>
              <Image
                unoptimized
                src={tenant.logo.src}
                style={{ background: tenant.logo.background ?? "#fff", objectFit: "contain", padding: 5, borderRadius: 5 }}
                alt={tenant.logo.alt}
                width={tenant.logo.width}
                height={tenant.logo.height}
                sizes="136px"
                loading="eager"
              />
            </div>
            <div className={styles.tenantSignatureCopy}>
              <span>Tenant operating context</span>
              <strong>{tenant.displayName}</strong>
              <small>{tenant.arrival.operatingLanes.join(" · ")}</small>
            </div>
          </div>
          <span><MemberIcon name={copy.icon} />{copy.eyebrow}</span>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
        </div>
        <div className={styles.periodBlock}>
          <span>Reporting window</span>
          <div role="group" aria-label="Illustrative reporting period">
            {periods.map((item) => (
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
          <strong>{snapshot.periodLabel}</strong>
        </div>
      </header>

      <ConfidenceNote snapshot={snapshot} tenant={tenant} />

      {workspace === "commerce" && (
        <>
          <CommerceDashboard tenant={tenant} snapshot={snapshot} />
          <section className={styles.workspaceChapter} aria-labelledby="product-drilldown-title" data-reveal>
            <span>Commerce detail</span>
            <h2 id="product-drilldown-title">Product + brand drilldown</h2>
            <p>Category performance belongs inside Commerce—not in a competing top-level destination.</p>
          </section>
          <ProductsDashboard tenant={tenant} />
        </>
      )}
      {workspace === "orders" && <FulfillmentDashboard tenant={tenant} snapshot={snapshot} />}
      {workspace === "financials" && <FinanceDashboard snapshot={snapshot} />}
      {workspace === "inventory" && <OperationsDashboard tenant={tenant} snapshot={snapshot} />}
      {workspace === "customers" && <TerritoriesDashboard tenant={tenant} />}
      {workspace === "benchmarks" && <BenchmarksDashboard tenant={tenant} snapshot={snapshot} />}
      {workspace === "reports" && <ReportsDashboard tenant={tenant} snapshot={snapshot} />}
      {workspace === "settings" && <ServicesDashboard tenant={tenant} />}
    </div>
  );
}

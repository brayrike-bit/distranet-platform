"use client";

import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { MemberIcon, type MemberIconName } from "../../components/MemberIcon";
import {
  demoInventoryFeeBasisPoints, findStock, lotPrice, makeSampleStock, matchStatuses, recoveryStatuses,
  sampleMonths, stockCsv, stockKinds, stockQuantity, transferBalance, type MatchStatus, type RecoveryStatus,
  type StockGroup, type StockKind,
} from "./sample-stock-model";
import styles from "./MemberStockDesk.module.css";
import { InventoryReview, type InventoryReviewRecord } from "./InventoryReview";
import { usePreviewState } from "./ParityUI";

const views = [
  { id: "parts-search", name: "Parts Search", icon: "opportunity", about: "Compare available quantities, branch locations and stock-class pricing before you source." },
  { id: "shared-inventory", name: "Shared Inventory", icon: "inventory", about: "Reconcile sample network purchases and sales with an itemized inventory-sharing fee ledger." },
  { id: "buy-sell", name: "Buy / Sell Opportunities", icon: "commerce", about: "Review demand matches and evaluate which buying or selling opportunities your team should follow up on." },
  { id: "dead-excess", name: "Dead & Excess Stock", icon: "operations", about: "Find slow-moving inventory, see its sample replacement value, and track recovery actions." },
] as const satisfies readonly { id: string; name: string; icon: MemberIconName; about: string }[];
type ViewId = (typeof views)[number]["id"];
const legacyHashes = new Map<string, ViewId>([
  ["#search", "parts-search"], ["#shared", "shared-inventory"],
  ["#buysell", "buy-sell"], ["#stock", "dead-excess"],
]);
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const number = new Intl.NumberFormat("en-US");
const usd = (cents: number) => currency.format(cents / 100);
const subscribeHash = (notify: () => void) => {
  window.addEventListener("hashchange", notify);
  return () => window.removeEventListener("hashchange", notify);
};
const defaultView = (): ViewId => "parts-search";
const hashView = () => views.find(({ id }) => `#${id}` === window.location.hash)?.id ?? legacyHashes.get(window.location.hash) ?? defaultView();
const statusEvent = "distranet-stock-desk-status";
const subscribeStatus = (notify: () => void) => {
  window.addEventListener(statusEvent, notify);
  return () => window.removeEventListener(statusEvent, notify);
};
const emptyStatus = () => "";

function useSessionChoices<T extends string>(member: string, layer: string, choices: readonly T[]) {
  const key = `distranet:stock-desk:v1:${member}:${layer}`;
  const [memory, setMemory] = useState<Record<string, T>>({});
  const saved = useSyncExternalStore(subscribeStatus, () => {
    try { return sessionStorage.getItem(key) ?? ""; } catch { return ""; }
  }, emptyStatus);
  const savedChoices = useMemo(() => {
    try {
      const entries = Object.entries(JSON.parse(saved) ?? {}).filter((entry): entry is [string, T] => choices.includes(entry[1] as T));
      return Object.fromEntries(entries);
    } catch { return {} as Record<string, T>; }
  }, [saved, choices]);
  const all = { ...savedChoices, ...memory };
  return [all, (id: string, value: T) => {
    const next = { ...all, [id]: value };
    setMemory(next);
    try {
      sessionStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new Event(statusEvent));
    } catch { /* The preview still works if browser storage is unavailable. */ }
  }] as const;
}

function ExportButton({ name, headers, rows }: { name: string; headers: readonly string[]; rows: ReadonlyArray<ReadonlyArray<string | number>>; }) {
  function exportRows() {
    const url = URL.createObjectURL(new Blob([stockCsv(headers, rows)], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${name}-illustrative.csv`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <button className={styles.button} type="button" onClick={exportRows} disabled={!rows.length}><MemberIcon name="download" /> Export CSV</button>;
}

function Stats({ values }: { values: readonly { label: string; total: string | number; context: string }[] }) {
  return <dl className={styles.stats}>{values.map(({ label, total, context }) => (
    <div key={label}><dt>{label}</dt><dd>{total}<span>{context}</span></dd></div>
  ))}</dl>;
}

function Panel({ heading, action, sub, children }: { heading: string; action?: ReactNode; sub?: ReactNode; children: ReactNode }) {
  return <section className={styles.panel}><header className={styles.panelHeader}><div><h3>{heading}</h3>{sub && <p>{sub}</p>}</div>{action}</header>{children}</section>;
}

function Empty({ children }: { children: ReactNode }) {
  return <div className={styles.empty}><MemberIcon name="opportunity" /><p>{children}</p></div>;
}

function Table({ caption, headers, rows }: { caption: string; headers: readonly string[]; rows: ReadonlyArray<{ id: string; cells: ReactNode[] }> }) {
  return <div className={styles.tableFrame}>
    <table className={styles.table} role="table">
      <caption className={styles.srOnly}>{caption}</caption>
      <thead role="rowgroup"><tr role="row">{headers.map((header) => <th scope="col" role="columnheader" key={header}>{header}</th>)}</tr></thead>
      <tbody role="rowgroup">{rows.map(({ id, cells }) => <tr role="row" key={id}>{cells.map((cell, index) => index === 0
        ? <th scope="row" role="rowheader" key={headers[index]} data-label={headers[index]}>{cell}</th>
        : <td role="cell" key={headers[index]} data-label={headers[index]}>{cell}</td>)}</tr>)}</tbody>
    </table>
  </div>;
}

function StockClass({ group, kind }: { group: StockGroup; kind: StockKind }) {
  const lots = group.lots.filter((lot) => lot.kind === kind);
  if (!lots.length) return <span className={styles.muted}>0 · no offer</span>;
  return <div className={styles.offer}>
    {lots.map((lot) => <div key={lot.id}>
      <strong>{lot.location ? `${number.format(lot.quantity)} ${lot.uom}` : `${number.format(lot.quantity)} flagged`}</strong>
      <small>{usd(lotPrice(lot))} / {lot.uom}{!lot.location && " · Confirm location"}</small>
    </div>)}
  </div>;
}

type StockSample = ReturnType<typeof makeSampleStock>;

function PartsSearch({ lots }: Pick<StockSample, "lots">) {
  const [query, setQuery] = useState("");
  const [owner, setOwner] = useState("");
  const [kind, setKind] = useState<"All" | StockKind>("All");
  const [available, setAvailable] = useState(false);
  const groups = findStock(lots, query, owner, kind, available);
  const owners = Array.from(new Set(lots.map((lot) => lot.owner))).sort();
  const rows = groups.map((group) => [
    group.sku, group.description, group.maker, group.owner, group.location ?? "Confirm location", group.uom,
    ...stockKinds.flatMap((className) => [
      stockQuantity(group, className),
      group.lots.filter((lot) => lot.kind === className).map((lot) => usd(lotPrice(lot))).join("; "),
    ]),
    group.lots.reduce((total, lot) => total + (!lot.location ? lot.quantity : 0), 0),
  ]);
  return <Panel heading="Stocking locations" sub={<span role="status">{groups.length} matching {groups.length === 1 ? "location row" : "location rows"}. USD per unit; flagged stock is not counted as available.</span>} action={
    <ExportButton name="parts-search" headers={["Part", "Description", "Manufacturer", "Stocking member", "Location", "UOM", "Standard confirmed quantity", "Standard unit prices", "Excess confirmed quantity", "Excess unit prices", "Dead confirmed quantity", "Dead unit prices", "Flagged, unconfirmed quantity"]} rows={rows} />
  }>
    <div className={styles.filters}>
      <label>Search parts<input type="search" placeholder="Part number, description, or maker" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      <label>Stocking member<select value={owner} onChange={(event) => setOwner(event.target.value)}><option value="">All demo members</option>{owners.map((choice) => <option key={choice}>{choice}</option>)}</select></label>
      <label>Stock class<select value={kind} onChange={(event) => setKind(event.target.value as "All" | StockKind)}><option value="All">All stock classes</option>{stockKinds.map((choice) => <option key={choice}>{choice}</option>)}</select></label>
      <label className={styles.check}><input type="checkbox" checked={available} onChange={(event) => setAvailable(event.target.checked)} /> Confirmed locations only</label>
    </div>
    {groups.length ? <Table caption="Illustrative stock offers by part and location" headers={["Part", "Stocking member", "Standard", "Excess", "Dead", "Offer details"]} rows={groups.map((group) => ({
      id: group.id,
      cells: [
        <><strong>{group.sku}</strong><small>{group.description}</small></>,
        <><strong>{group.owner}</strong><small>{group.location ?? "Confirm location"}</small></>,
        ...stockKinds.map((choice) => <StockClass key={choice} group={group} kind={choice} />),
        <details className={styles.details}><summary>Details<span className={styles.srOnly}> for {group.sku}, {group.owner}, {group.location ?? "unconfirmed location"}</span></summary>
          <p>{group.maker} · {group.uom}</p>
          <ul>{group.lots.map((lot) => <li key={lot.id}>{lot.kind}: {usd(lotPrice(lot))} / {lot.uom}{lot.kind === "Dead" ? ` (30% below ${usd(lot.replacementCents)} demo replacement cost)` : lot.kind === "Excess" ? " (demo replacement cost)" : ""}{!lot.location && " · unconfirmed, not available to promise"}</li>)}</ul>
        </details>,
      ],
    }))} /> : <Empty>No stock matches these filters. Try a shorter description or clear the stocking member filter.</Empty>}
  </Panel>;
}

function SharedInventory({ transfers, member }: Pick<StockSample, "transfers"> & { member: string }) {
  const [month, setMonth] = useState("");
  const [flow, setFlow] = useState("");
  const [journal, setJournal] = usePreviewState<InventoryReviewRecord[]>(member + ":inventory-review", []);
  const scoped = transfers.map(item => ({
    ...item,
    exemptionCents: item.exemptionCents + journal.reduce((sum, row) => row.kind === "Prior-agreement exemption" && row.transfer === item.id && !row.reversal ? sum + row.cents : sum, 0),
  }));
  const selected = scoped.filter((item) => (!month || item.month === month) && (!flow || item.flow === flow));
  const totals = selected.reduce((sum, item) => {
    const { adjusted, fee } = transferBalance(item);
    return { sales: sum.sales + (item.flow === "Sold" ? adjusted : 0), purchases: sum.purchases + (item.flow === "Purchased" ? adjusted : 0), fees: sum.fees + fee };
  }, { sales: 0, purchases: 0, fees: 0 });
  const charts = sampleMonths.filter((item) => !month || item === month).map((label) => ({ label,
    sold: selected.filter((item) => item.month === label && item.flow === "Sold").reduce((total, item) => total + transferBalance(item).adjusted, 0),
    bought: selected.filter((item) => item.month === label && item.flow === "Purchased").reduce((total, item) => total + transferBalance(item).adjusted, 0),
  }));
  const maximum = Math.max(1, ...charts.flatMap(({ sold, bought }) => [sold, bought]));
  return <>
    <Stats values={[
      { label: "Adjusted sales", total: usd(totals.sales), context: "Sold to demo members" },
      { label: "Adjusted purchases", total: usd(totals.purchases), context: "Bought from demo members" },
      { label: "Sample inventory fees", total: usd(totals.fees), context: `${demoInventoryFeeBasisPoints.Sold / 100}% sold + ${demoInventoryFeeBasisPoints.Purchased / 100}% purchased · not payable` },
    ]} />
    <Panel heading="Sales & purchases" sub="Adjusted after sample exemptions. Labels and amounts accompany the bars.">
      <ul className={styles.trend}>{charts.map(({ label, sold, bought }) =>
        <li key={label}><strong>{label}</strong>
          {([["Sold", sold], ["Purchased", bought]] as const).map(([title, value]) => (
            <div key={title}><span>{title}</span><span className={styles.track} aria-hidden="true"><i data-flow={title} style={{ width: `${100 * value / maximum}%` }} /></span><strong>{usd(value)}</strong></div>
          ))}
        </li>)}
      </ul>
    </Panel>
    <Panel heading="Reconciliation ledger" sub="Adjusted amount = gross less sample exemptions, including active practice adjustments from this tab. Loss reports are tracked separately and never booked as sales."
      action={<ExportButton name="shared-inventory" headers={["Demo transfer", "Sample month", "Direction", "Trading partner", "Units", "Gross (USD)", "Sample exemption (USD)", "Adjusted (USD)", "Example fee (USD)"]} rows={selected.map((item) => {
        const { adjusted, fee } = transferBalance(item);
        return [item.id, item.month, item.flow, item.partner, item.units, item.grossCents / 100, item.exemptionCents / 100, adjusted / 100, fee / 100];
      })} />}>
      <div className={styles.filters}>
        <label>Sample month<select value={month} onChange={(event) => setMonth(event.target.value)}><option value="">All sample months</option>{sampleMonths.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Direction<select value={flow} onChange={(event) => setFlow(event.target.value)}><option value="">Both directions</option><option>Sold</option><option>Purchased</option></select></label>
      </div>
      <Table caption="Illustrative shared inventory reconciliation rows" headers={["Transfer", "Flow", "Partner", "Gross", "Exemption", "Adjusted", "Sample fee"]} rows={selected.map((item) => {
        const { adjusted, fee } = transferBalance(item);
        return { id: item.id, cells: [<><strong>{item.id}</strong><small>{item.month} · {item.units} units</small></>, item.flow, item.partner, usd(item.grossCents), usd(item.exemptionCents), usd(adjusted), usd(fee)] };
      })} />
    </Panel>
    <InventoryReview transfers={scoped} journal={journal} setJournal={setJournal} member={member} />
  </>;
}

function BuySell({ matches, member }: Pick<StockSample, "matches"> & { member: string }) {
  const [status, setStatus] = useSessionChoices<MatchStatus>(member, "matches", matchStatuses);
  const [side, setSide] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [notice, setNotice] = useState("");
  const selected = matches.filter((match) => (!side || match.side === side) && (!statusFilter || (status[match.id] ?? "New") === statusFilter));
  const active = matches.filter((match) => status[match.id] !== "Dismissed");
  return <>
    <Stats values={[
      { label: "Buy matches", total: active.filter((match) => match.side === "Buy").length, context: "Sample sources across the network" },
      { label: "Sell matches", total: active.filter((match) => match.side === "Sell").length, context: "Sample demand for your inventory" },
      { label: "Potential value", total: usd(active.reduce((amount, match) => amount + match.valueCents, 0)), context: "Illustrative, not committed" },
    ]} />
    <Panel heading="Opportunity queue" sub="Review a match or dismiss it. Updates stay in this browser tab; no purchase, reservation, or message is sent."
      action={<ExportButton name="buy-sell" headers={["Reference", "Side", "Part", "Description", "Demo counterparty", "Units", "Indicative value (USD)", "Status"]} rows={selected.map((match) => [match.id, match.side, match.sku, match.description, match.partner, match.units, match.valueCents / 100, status[match.id] ?? "New"])} />}>
      <div className={styles.filters}>
        <label>Opportunity side<select value={side} onChange={(event) => setSide(event.target.value)}><option value="">Buy and sell</option><option>Buy</option><option>Sell</option></select></label>
        <label>Review status<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">All statuses</option>{matchStatuses.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
      <p className={styles.status} role="status">{notice}</p>
      {selected.length ? <Table caption="Illustrative buy and sell matches" headers={["Opportunity", "Side", "Demo counterparty", "Units", "Indicative value", "Review status"]} rows={selected.map((match) => ({
        id: match.id, cells: [
          <><strong>{match.sku}</strong><small>{match.description} · {match.due}</small></>, match.side, match.partner, match.units, usd(match.valueCents),
          <select aria-label={`Review status for ${match.sku}`} value={status[match.id] ?? "New"} onChange={(event) => { const value = event.target.value as MatchStatus; setStatus(match.id, value); setNotice(`${match.sku} updated to ${value} for this demo tab.`); }}>{matchStatuses.map((item) => <option key={item}>{item}</option>)}</select>,
        ],
      }))} /> : <Empty>No opportunities match the selected side and status.</Empty>}
    </Panel>
    <Panel heading="Weekly opportunity digest" sub="Preview of the open demo matches. No recipients or outbound delivery are connected.">
      <details className={styles.digest}><summary>Preview digest</summary>
        {active.length ? <ul>{active.map((match) => <li key={match.id}><strong>{match.side} · {match.sku}</strong> — {match.units} units · {usd(match.valueCents)} illustrative value</li>)}</ul> : <p>No open matches to include.</p>}
      </details>
    </Panel>
  </>;
}

function Recovery({ lots, name, member }: Pick<StockSample, "lots"> & { name: string; member: string }) {
  const [status, setStatus] = useSessionChoices<RecoveryStatus>(member, "recovery", recoveryStatuses);
  const [kind, setKind] = useState("");
  const [notice, setNotice] = useState("");
  const mine = lots.filter((lot) => lot.owner === name && lot.kind !== "Standard");
  const selected = mine.filter((lot) => !kind || lot.kind === kind);
  const value = (type: "Dead" | "Excess") => mine.filter((lot) => lot.kind === type && lot.location).reduce((total, lot) => total + lot.replacementCents * lot.quantity, 0);
  return <>
    <Stats values={[
      { label: "Dead stock at cost", total: usd(value("Dead")), context: "Confirmed units at replacement cost" },
      { label: "Excess at cost", total: usd(value("Excess")), context: "Confirmed units at replacement cost" },
      { label: "Recovery logged", total: mine.filter((lot) => status[lot.id] === "Recovered").length, context: "Items marked recovered in this tab" },
    ]} />
    <Panel heading="Stock recovery queue" sub="Only this member’s demo records are shown. Flagged records without a verified branch are excluded from totals."
      action={<ExportButton name="stock-recovery" headers={["Part", "Description", "Stock class", "Demo location", "Confirmed units", "Unconfirmed flagged units", "Illustrative unit offer (USD)", "Recovery status"]} rows={selected.map((lot) => [lot.sku, lot.description, lot.kind, lot.location ?? "Confirm location", lot.location ? lot.quantity : 0, lot.location ? 0 : lot.quantity, lotPrice(lot) / 100, status[lot.id] ?? "Unassigned"])} />}>
      <div className={styles.filters}><label>Stock class<select value={kind} onChange={(event) => setKind(event.target.value)}><option value="">Dead and excess stock</option><option>Dead</option><option>Excess</option></select></label></div>
      <p className={styles.status} role="status">{notice}</p>
      {selected.length ? <Table caption="Illustrative dead and excess stock" headers={["Part", "Class", "Location", "Quantity", "Sample unit offer", "Recovery status"]} rows={selected.map((lot) => ({
        id: lot.id, cells: [<><strong>{lot.sku}</strong><small>{lot.description}</small></>, lot.kind, lot.location ?? "Confirm location", `${lot.quantity} ${lot.location ? lot.uom : "flagged"}`, usd(lotPrice(lot)),
          <select aria-label={`Recovery status for ${lot.sku} ${lot.kind} stock`} value={status[lot.id] ?? "Unassigned"} onChange={(event) => { const value = event.target.value as RecoveryStatus; setStatus(lot.id, value); setNotice(`${lot.sku} recovery status set to ${value} for this demo tab.`); }}>{recoveryStatuses.map((item) => <option key={item}>{item}</option>)}</select>],
      }))} /> : <Empty>No records in this stock class.</Empty>}
    </Panel>
  </>;
}

export function MemberStockDesk({ member, name }: { member: string; name: string }) {
  const activeId = useSyncExternalStore(subscribeHash, hashView, defaultView);
  const active = views.find((view) => view.id === activeId) ?? views[0];
  const sample = useMemo(() => makeSampleStock(member, name), [member, name]);
  return <div className={styles.desk}>
    <header className={styles.hero}>
      <span className={styles.kicker}><MemberIcon name="inventory" /> Network stock desk</span>
      <h1>Inventory Exchange</h1>
      <p>Find stock, see how it moves through the network, and act on buying, selling, and recovery opportunities.</p>
      <p className={styles.boundary}><MemberIcon name="lock" /> {name} · Illustrative data only</p>
    </header>
    <nav className={styles.navigation} aria-label="Inventory Exchange views">
      {views.map((view) => <a key={view.id} href={`#${view.id}`} aria-current={view.id === active.id ? "location" : undefined}><MemberIcon name={view.icon} /> {view.name}</a>)}
    </nav>
    <section className={styles.active} id={active.id} aria-label={active.name} key={`${member}:${active.id}`}>
      <header className={styles.viewTitle}><h2>{active.name}</h2><p>{active.about}</p></header>
      {active.id === "parts-search" && <PartsSearch lots={sample.lots} />}
      {active.id === "shared-inventory" && <SharedInventory transfers={sample.transfers} member={member} />}
      {active.id === "buy-sell" && <BuySell matches={sample.matches} member={member} />}
      {active.id === "dead-excess" && <Recovery lots={sample.lots} member={member} name={name} />}
    </section>
  </div>;
}

"use client";

import Link from "next/link";
import { useState } from "react";
import type { MemberSlug } from "@/domain/member-hub/types";
import { useMemberReportingPeriod } from "../MemberWorkspaceShell";
import { memberWorkspacePeriodHref } from "../member-workspace-navigation";
import { DataTable, Metrics, number, Section, styles, usePreviewState, WorkspaceIntro } from "./ParityUI";
import { demandFixture, downloadPreview, evidenceScore, memberSeed, previewCsv, summarizeDemand } from "./parity-data";

const sections = [
  ["demand-signal", "DemandSignal"], ["edi", "EDI compliance"], ["scorecard", "Scorecard"],
  ["exceptions", "Exception reporting"], ["data-pool", "Industry Data Pool"],
] satisfies [string, string][];
const statuses = ["Open", "In progress", "Resolved"] as const;
const caseTypes = ["Inventory mismatch", "EDI acknowledgment", "Product data gap", "Order exception"] as const;
type Exception = { id: string; kind: string; severity: string; status: typeof statuses[number]; evidence?: boolean };

export function MemberPerformanceDesk({ member }: { member: MemberSlug }) {
  const { period } = useMemberReportingPeriod();
  const seed = memberSeed(member);
  const [part, setPart] = useState("all");
  const [chart, setChart] = useState<"searches" | "impressions" | "top" | "lost">("searches");
  const [ediFilter, setEdiFilter] = useState("all");
  const [caseFilter, setCaseFilter] = useState("all");
  const [manufacturer, setManufacturer] = useState("");
  const [notice, setNotice] = useState("");
  const [cases, setCases] = usePreviewState<Exception[]>(member + ":exceptions", [
    { id: "DEMO-EX-01", kind: caseTypes[0], severity: "High", status: "Open" },
    { id: "DEMO-EX-02", kind: caseTypes[1], severity: "Medium", status: "In progress" },
    { id: "DEMO-EX-03", kind: caseTypes[2], severity: "Low", status: "Resolved", evidence: true },
  ]);
  const demand = demandFixture(member);
  const parts = [...new Set(demand.map(row => row.part))];
  const filtered = demand.filter(row => part === "all" || row.part === part);
  const monthly = [...new Set(filtered.map(row => row.month))].map(month => ({ month, ...summarizeDemand(filtered.filter(row => row.month === month)) }));
  const totals = summarizeDemand(filtered);
  const asRate = (value: number | null) => value === null ? "Not available" : value.toFixed(1) + "%";
  const chartValue = (value: number | null) => chart === "top" || chart === "lost" ? asRate(value) : number.format(value ?? 0);
  const maximum = chart === "top" || chart === "lost" ? 100 : Math.max(1, ...monthly.map(row => row[chart] ?? 0));
  const connections = ["Demo Partner A", "Demo Partner B", "Demo Partner C"].flatMap((name, i) =>
    (["Buying", "Selling"] as const).map((direction, j) => ({ name, direction,
      status: i === 0 || (i === 1 && (seed + j) % 2 === 0) ? "Live" : j ? "Testing" : "Open" })));
  const live = connections.filter(row => row.status === "Live").length;
  const resolved = cases.filter(item => item.status === "Resolved").length;
  const evidence = [
    { label: "EDI directions live", value: 100 * live / connections.length, weight: 35, note: "Confirm the outstanding buying and selling connections.", link: "edi" },
    { label: "Inventory accuracy", value: 82 + seed % 14, weight: 30, note: "Reconcile inventory quantities and refresh the feed.", link: "edi", inventory: true },
    { label: "Product data completeness", value: seed % 4 === 0 ? null : 77 + seed % 15, weight: 25, note: "Review missing specifications and exact part identifiers.", link: "data-pool" },
    { label: "Member-owned remediation", value: cases.length ? 100 * resolved / cases.length : null, weight: 10, note: "Resolve outstanding exceptions with supporting evidence.", link: "exceptions" },
  ];
  const { score, weight } = evidenceScore(evidence);
  const catalog = [["Demo Hydraulics", "Directional valves", 183 + seed], ["Demo Motion", "Filters and gauges", 119 + seed], ["Demo Connect", "Couplings and fittings", 205 + seed]] as const;
  const matchingCatalog = catalog.filter(row => row.join(" ").toLowerCase().includes(manufacturer.trim().toLowerCase()));
  const caseRows = cases.filter(row => caseFilter === "all" || row.status === caseFilter);
  const exportCsv = (id: string, rows: Parameters<typeof previewCsv>[0]) =>
    downloadPreview(member + "-" + id + "-illustrative.csv", previewCsv([["Illustrative data; not a live report"], ...rows]));

  return <div className={styles.workspace}>
    <WorkspaceIntro icon="pulse" title="Operational performance" description="Connect market demand, EDI readiness, product coverage and exceptions to the actions your team can take next." sections={sections} />
    <Section id="demand-signal" title="DemandSignal" description="Six sample months of national search activity by part. There is no connection to Google and no searcher-level data."
      action={<button className={styles.button} onClick={() => exportCsv("demand", [["Month", "Searches", "Impressions", "Top impression rate", "Lost impression share"], ...monthly.map(row => [row.month, row.searches, row.impressions, asRate(row.top), asRate(row.lost)])])}>Export monthly CSV</button>}>
      <div className={styles.toolbar}>
        <label className={styles.field}>Part<select value={part} onChange={e => setPart(e.target.value)}><option value="all">All sample parts</option>{parts.map(id => <option key={id}>{id}</option>)}</select></label>
        <label className={styles.field}>Chart metric<select value={chart} onChange={e => setChart(e.target.value as typeof chart)}>
          <option value="searches">Parts searched</option><option value="impressions">Search impressions</option><option value="top">Top impression rate</option><option value="lost">Lost impression share</option>
        </select></label>
      </div>
      <Metrics items={[["Parts searched", number.format(totals.searches), "Aggregated sample demand"], ["Impressions", number.format(totals.impressions), "Sample search appearances"], ["Top impression rate", asRate(totals.top), "Impression-weighted"], ["Lost impression share", asRate(totals.lost), "Impression-weighted"]]} />
      <ul className={styles.bars} aria-label="Monthly demand metric">{monthly.map(row => <li key={row.month}><span>{row.month}</span><meter min={0} max={maximum} value={row[chart] ?? 0} aria-label={row.month + " " + chart} /><strong>{chartValue(row[chart])}</strong></li>)}</ul>
      <details><summary>Review individual parts</summary><DataTable caption="Sample parts and recommended follow-up" heads={["Part", "Searches", "Lost share", "Suggested review"]} rows={parts.filter(id => part === "all" || id === part).map(id => {
        const result = summarizeDemand(demand.filter(row => row.part === id));
        return [id, number.format(result.searches), asRate(result.lost), (result.lost ?? 0) >= 30 ? "Check availability and ad coverage" : "Monitor demand"];
      })} /></details>
    </Section>
    <Section id="edi" title="EDI compliance" description="Each buying and selling direction is tracked separately. The sample matrix is not a real ERP connectivity check."
      action={<button className={styles.button} onClick={() => exportCsv("edi-matrix", [["Trading partner", "Direction", "Status"], ...connections.map(r => [r.name, r.direction, r.status])])}>Export matrix CSV</button>}>
      <Metrics items={[["Live directions", live, connections.length + " applicable connections"], ["Outstanding", connections.length - live, "Testing or open"], ["Readiness", asRate(100 * live / connections.length), "Sample matrix only"]]} />
      <label className={styles.field} style={{ width: "max-content" }}>Connection status<select value={ediFilter} onChange={e => setEdiFilter(e.target.value)}>
        <option value="all">All statuses</option>{["Live", "Testing", "Open"].map(status => <option key={status}>{status}</option>)}</select></label>
      <DataTable caption="Illustrative EDI readiness matrix" heads={["Trading partner", "Direction", "Status"]} rows={connections.filter(row => ediFilter === "all" || row.status === ediFilter).map(row => [row.name, row.direction, <span className={styles.badge}>{row.status}</span>])} />
    </Section>
    <Section id="scorecard" title="Member scorecard" description="The score weights only applicable evidence. Missing evidence is excluded, not treated as a failure.">
      <Metrics items={[["Illustrative score", score === null ? "Not scored" : score.toFixed(1) + " / 100", "Not a rated member assessment"], ["Evidence weight", weight + " / 100", "Available metric weights"]]} />
      <DataTable caption="Scorecard evidence and ways to improve" heads={["Measure", "Result", "Weight", "Next action"]} rows={evidence.map(item => [item.label, asRate(item.value), item.weight + "%", item.inventory
        ? <Link href={memberWorkspacePeriodHref(member, "trade-desk", period) + "#parts-search"}>{item.note}</Link>
        : <a href={"#" + item.link}>{item.note}</a>])} />
    </Section>
    <Section id="exceptions" title="Exception reporting" description="Review cases, practice triage and export your sample ledger. Changes are kept only in this browser tab."
      action={<button className={styles.button} onClick={() => exportCsv("exceptions", [["Case", "Category", "Severity", "Status", "Sample evidence"], ...caseRows.map(r => [r.id, r.kind, r.severity, r.status, r.evidence ? "Yes" : "No"])])}>Export filtered CSV</button>}>
      <Metrics items={statuses.map(status => [status, cases.filter(row => row.status === status).length, "Sample cases"])} />
      <label className={styles.field} style={{ width: "max-content" }}>Case status<select value={caseFilter} onChange={e => setCaseFilter(e.target.value)}><option value="all">All cases</option>{statuses.map(status => <option key={status}>{status}</option>)}</select></label>
      <DataTable caption="Demonstration exception ledger" heads={["Case", "Category", "Severity", "Status", "Evidence"]} rows={caseRows.map(row => [row.id, row.kind, row.severity,
        <select className={styles.button} aria-label={"Change status for " + row.id} value={row.status} onChange={e => {
          const value = e.target.value as Exception["status"];
          setCases(cases.map(r => r.id === row.id ? { ...r, status: value } : r));
          setNotice(row.id + " changed to " + value + ".");
        }}>{statuses.map(status => <option key={status}>{status}</option>)}</select>,
        <button className={styles.button} onClick={() => { setCases(cases.map(r => r.id === row.id ? { ...r, evidence: true } : r)); setNotice("Sample evidence attached to " + row.id + ". No file was uploaded."); }} disabled={row.evidence}>{row.evidence ? "Sample attached" : "Attach sample"}</button>])} />
      <details><summary>Log an illustrative exception</summary><form className={styles.toolbar} onSubmit={event => {
        event.preventDefault();
        const input = new FormData(event.currentTarget);
        const id = "DEMO-EX-" + String(cases.length + 1).padStart(2, "0");
        setCases([...cases, { id, kind: String(input.get("kind")), severity: String(input.get("severity")), status: "Open" }]);
        setCaseFilter("all"); setNotice(id + " added to this preview.");
      }}>
        <label className={styles.field}>Category<select name="kind">{caseTypes.map(kind => <option key={kind}>{kind}</option>)}</select></label>
        <label className={styles.field}>Severity<select name="severity">{["Low", "Medium", "High"].map(severity => <option key={severity}>{severity}</option>)}</select></label>
        <button className={styles.button} data-action="primary">Add demo case</button>
      </form></details>
      <p role="status" className={notice ? styles.note : styles.srOnly}>{notice}</p>
    </Section>
    <Section id="data-pool" title="Fluid Power Industry Data Pool" description="Explore a synthetic catalog and its data-quality flags. The source catalog, rights and current coverage have not been verified here.">
      <Metrics items={[["Manufacturers", catalog.length, "Fictional manufacturer names"], ["Part records", number.format(catalog.reduce((sum, item) => sum + item[2], 0)), "Synthetic part counts"], ["Needs validation", 19 + seed % 18, "Sample quality queue"]]} />
      <label className={styles.field} style={{ width: "min(100%, 340px)" }}>Filter manufacturer coverage<input type="search" value={manufacturer} onChange={event => setManufacturer(event.target.value)} placeholder="Manufacturer or product family" /></label>
      <DataTable caption="Fictional manufacturer coverage" heads={["Manufacturer", "Product family", "Part records", "Source"]} rows={matchingCatalog.map(row => [row[0], row[1], number.format(row[2]), "Illustrative only"])} />
    </Section>
  </div>;
}

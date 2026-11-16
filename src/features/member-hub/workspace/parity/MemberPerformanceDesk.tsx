"use client";

import Link from "next/link";
import { useState } from "react";
import type { MemberSlug } from "@/domain/member-hub/types";
import { useMemberReportingPeriod } from "../MemberWorkspaceShell";
import { memberWorkspacePeriodHref } from "../member-workspace-navigation";
import type { MemberModuleRoute, MemberWorkspaceId } from "../member-workspace-routes";
import { DataTable, Metrics, ModuleWorkspace, number, Section, styles, usePreviewState, WorkspaceIntro } from "./ParityUI";
import { demandFixture, downloadPreview, evidenceScore, memberSeed, previewCsv, summarizeDemand } from "./parity-data";
import { ediFixture, summarizeEdi } from "./edi-preview-data";

const sections = [
  ["demand-signal", "DemandSignal"], ["edi", "EDI compliance"], ["scorecard", "Scorecard"],
  ["exceptions", "Exception reporting"], ["data-pool", "Industry Data Pool"],
] satisfies [string, string][];
const statuses = ["Open", "In progress", "Resolved"] as const;
const caseTypes = ["Inventory mismatch", "EDI acknowledgment", "Product data gap", "Order exception"] as const;
type Responsibility = "Member" | "Network";
type Exception = { id: string; kind: string; severity: string; status: typeof statuses[number]; evidence?: boolean;
  responsibility?: Responsibility; activity?: string[] };

export function MemberPerformanceDesk({ member, selected }: { member: MemberSlug; selected?: MemberModuleRoute }) {
  const { period } = useMemberReportingPeriod();
  const seed = memberSeed(member);
  const [part, setPart] = useState("all");
  const [chart, setChart] = useState<"searches" | "impressions" | "top" | "lost">("searches");
  const [caseFilter, setCaseFilter] = useState("all");
  const [responsibilityFilter, setResponsibilityFilter] = useState("all");
  const [manufacturer, setManufacturer] = useState("");
  const [notice, setNotice] = useState("");
  const [cases, setCases] = usePreviewState<Exception[]>(member + ":exceptions", [
    { id: "DEMO-EX-01", kind: caseTypes[0], severity: "High", status: "Open" },
    { id: "DEMO-EX-02", kind: caseTypes[1], severity: "Medium", status: "In progress", responsibility: "Network" },
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
  const edi = summarizeEdi(ediFixture(member));
  const owned = cases.filter(item => (item.responsibility ?? "Member") === "Member");
  const resolved = owned.filter(item => item.status === "Resolved").length;
  const evidence = [
    { label: "EDI directions live", value: edi.completion, weight: 35, note: "Confirm the outstanding buying and selling connections.", link: "edi-compliance" },
    { label: "Inventory accuracy", value: 82 + seed % 14, weight: 30, note: "Reconcile inventory quantities and refresh the feed.", link: "parts-search" },
    { label: "Product data completeness", value: seed % 4 === 0 ? null : 77 + seed % 15, weight: 25, note: "Review missing specifications and exact part identifiers.", link: "industry-data-pool" },
    { label: "Member-owned remediation", value: owned.length ? 100 * resolved / owned.length : null, weight: 10, note: "Resolve outstanding exceptions with supporting evidence.", link: "exception-reporting" },
  ] satisfies { label: string; value: number | null; weight: number; note: string; link: MemberWorkspaceId }[];
  const { score, weight } = evidenceScore(evidence);
  const catalog = [["Demo Hydraulics", "Directional valves", 183 + seed], ["Demo Motion", "Filters and gauges", 119 + seed], ["Demo Connect", "Couplings and fittings", 205 + seed]] as const;
  const matchingCatalog = catalog.filter(row => row.join(" ").toLowerCase().includes(manufacturer.trim().toLowerCase()));
  const caseRows = cases.filter(row => (caseFilter === "all" || row.status === caseFilter)
    && (responsibilityFilter === "all" || (row.responsibility ?? "Member") === responsibilityFilter));
  const logCase = (row: Exception, activity: string, updates: Partial<Exception> = {}) => {
    setCases(cases.map(item => item.id === row.id ? { ...item, ...updates, activity: [...(item.activity ?? ["Sample case opened."]), activity] } : item));
    setNotice(row.id + ": " + activity);
  };
  const exportCsv = (id: string, rows: Parameters<typeof previewCsv>[0]) =>
    downloadPreview(member + "-" + id + "-illustrative.csv", previewCsv([["Illustrative data; not a live report"], ...rows]));

  return <ModuleWorkspace selected={selected} intro={<WorkspaceIntro icon="pulse" title="Operational performance" description="Connect market demand, EDI readiness, product coverage and exceptions to the actions your team can take next." sections={sections} />}>
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
      action={<Link className={styles.button} href={memberWorkspacePeriodHref(member, "edi-compliance", period)}>Open EDI Compliance</Link>}>
      <Metrics items={[["Live directions", edi.live, edi.total + " applicable connections"], ["Outstanding", edi.testing + edi.open, "Testing or open"], ["Readiness", asRate(edi.completion), "Sample matrix only"]]} />
    </Section>
    <Section id="scorecard" title="Member scorecard" description="The score weights only applicable evidence. Missing evidence is excluded, not treated as a failure.">
      <Metrics items={[["Illustrative score", score === null ? "Not scored" : score.toFixed(1) + " / 100", "Not a rated member assessment"], ["Evidence weight", weight + " / 100", "Available metric weights"]]} />
      <DataTable caption="Scorecard evidence and ways to improve" heads={["Measure", "Result", "Weight", "Next action"]} rows={evidence.map(item => [item.label, asRate(item.value), item.weight + "%", <Link href={memberWorkspacePeriodHref(member, item.link, period)}>{item.note}</Link>])} />
    </Section>
    <Section id="exceptions" title="Exception ledger" description="Review the owner, responsibility and history of each case. Changes are kept only in this browser tab."
      action={<button className={styles.button} onClick={() => exportCsv("exceptions", [["Case", "Category", "Responsibility", "Severity", "Status", "Sample evidence"], ...caseRows.map(r => [r.id, r.kind, r.responsibility ?? "Member", r.severity, r.status, r.evidence ? "Yes" : "No"])])}>Export filtered CSV</button>}>
      <Metrics items={[...statuses.map(status => [status, cases.filter(row => row.status === status).length, "Sample cases"] as const), ["Member-owned", owned.length, "Network-owned cases stay separate"]]} />
      <div className={styles.toolbar}>
        <label className={styles.field}>Case status<select value={caseFilter} onChange={e => setCaseFilter(e.target.value)}><option value="all">All cases</option>{statuses.map(status => <option key={status}>{status}</option>)}</select></label>
        <label className={styles.field}>Responsibility<select value={responsibilityFilter} onChange={e => setResponsibilityFilter(e.target.value)}><option value="all">All responsibilities</option><option>Member</option><option>Network</option></select></label>
      </div>
      <DataTable caption="Demonstration exception ledger" heads={["Case", "Category", "Responsibility", "Severity", "Status", "Case details"]} rows={caseRows.map(row => [row.id, row.kind, row.responsibility ?? "Member", row.severity,
        <select className={styles.button} aria-label={"Change status for " + row.id} value={row.status} onChange={e => {
          const value = e.target.value as Exception["status"];
          logCase(row, row.status + " → " + value, { status: value });
        }}>{statuses.map(status => <option key={status}>{status}</option>)}</select>,
        <details><summary>Open {row.id}</summary><p>Owner: {(row.responsibility ?? "Member") === "Member" ? "Sample member operations" : "Sample network operations"}</p>
          <ol aria-label={"Activity for " + row.id}>{(row.activity ?? ["Sample case opened."]).map((event, index) => <li key={index}>{event}</li>)}</ol>
          <div className={styles.toolbar}>
            <button className={styles.button} onClick={() => logCase(row, "Sample remediation note recorded.")}>Add sample note</button>
            {!row.evidence
              ? <button className={styles.button} onClick={() => logCase(row, "Sample evidence attached; no file uploaded.", { evidence: true })}>Attach sample</button>
              : <button className={styles.button} onClick={() => downloadPreview(member + "-" + row.id + "-sample-evidence.txt", "Illustrative evidence only\n" + row.id + " · " + row.kind + "\nNo source file was uploaded.\n", "text/plain")}>Download sample evidence</button>}
          </div>
        </details>])} />
      <details><summary>Log an illustrative exception</summary><form className={styles.toolbar} onSubmit={event => {
        event.preventDefault();
        const input = new FormData(event.currentTarget);
        const id = "DEMO-EX-" + String(cases.length + 1).padStart(2, "0");
        setCases([...cases, { id, kind: String(input.get("kind")), severity: String(input.get("severity")), status: "Open",
          responsibility: input.get("responsibility") === "Network" ? "Network" : "Member", activity: ["Sample case opened."] }]);
        setCaseFilter("all"); setResponsibilityFilter("all"); setNotice(id + " added to this preview.");
      }}>
        <label className={styles.field}>Category<select name="kind">{caseTypes.map(kind => <option key={kind}>{kind}</option>)}</select></label>
        <label className={styles.field}>Severity<select name="severity">{["Low", "Medium", "High"].map(severity => <option key={severity}>{severity}</option>)}</select></label>
        <label className={styles.field}>Responsible team<select name="responsibility"><option>Member</option><option>Network</option></select></label>
        <button className={styles.button} data-action="primary">Add demo case</button>
      </form></details>
      <p role="status" className={notice ? styles.note : styles.srOnly}>{notice}</p>
    </Section>
    <Section id="data-pool" title="Fluid Power Industry Data Pool" description="Explore a synthetic catalog and its data-quality flags. The source catalog, rights and current coverage have not been verified here.">
      <Metrics items={[["Manufacturers", catalog.length, "Fictional manufacturer names"], ["Part records", number.format(catalog.reduce((sum, item) => sum + item[2], 0)), "Synthetic part counts"], ["Needs validation", 19 + seed % 18, "Sample quality queue"]]} />
      <label className={styles.field} style={{ width: "min(100%, 340px)" }}>Filter manufacturer coverage<input type="search" value={manufacturer} onChange={event => setManufacturer(event.target.value)} placeholder="Manufacturer or product family" /></label>
      <DataTable caption="Fictional manufacturer coverage" heads={["Manufacturer", "Product family", "Part records", "Source"]} rows={matchingCatalog.map(row => [row[0], row[1], number.format(row[2]), "Illustrative only"])} />
      <details><summary>Source QA and member delivery path</summary>
        <DataTable caption="Illustrative product data QA categories" heads={["QA classification", "Sample record count", "Meaning"]} rows={[
          ["Enhanced", 72 + seed, "Sample specifications have passed initial checks."],
          ["Partial reference", 90 + seed, "Not certified for completeness or media rights."],
          ["Needs validation", 19 + seed % 18, "Exact identifiers or attributes need review."],
        ]} />
        <p className={styles.note}>The sample QA categories are not a source audit. Real delivery requires provenance, exact manufacturer and part matching, attribute and media QA, entitlements, and approved syndication.</p>
      </details>
    </Section>
  </ModuleWorkspace>;
}

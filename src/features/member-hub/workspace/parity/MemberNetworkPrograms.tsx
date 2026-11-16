"use client";

import Link from "next/link";
import { useState } from "react";
import type { MemberTenantBrand } from "@/domain/member-hub/types";
import { memberDataForPeriod } from "../../member-demo-data";
import { useMemberReportingPeriod } from "../MemberWorkspaceShell";
import { memberWorkspacePeriodHref } from "../member-workspace-navigation";
import type { MemberModuleRoute } from "../member-workspace-routes";
import { DataTable, Metrics, money, ModuleWorkspace, Section, styles, WorkspaceIntro } from "./ParityUI";
import { downloadPreview, memberSeed, previewCsv } from "./parity-data";

const exampleGpoNetworkSharePercent = 30;
const exampleAccountMarginPercent = 20;
const exampleAccountRoles = [
  { role: "Originator", percent: 5, purpose: "Introduces and develops the relationship" },
  { role: "Territory member", percent: 10, purpose: "Coordinates local coverage and account support" },
  { role: "Fulfilling member", percent: 75, purpose: "Provides inventory, service and fulfillment" },
  { role: "Distranet", percent: 10, purpose: "Coordinates and administers the program" },
] as const;
const moneyWithCents = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const displayCents = (cents: number | null) => cents === null ? "—" : moneyWithCents.format(cents / 100);
const csvCents = (cents: number | null) => cents === null ? null : (cents / 100).toFixed(2);

function gpoSavings(baseline: number | null, actual: number | null) {
  if (baseline === null || actual === null) return { grossCents: null, networkCents: null, retainedCents: null };
  const grossCents = Math.round(baseline * 100) - Math.round(actual * 100);
  const networkCents = Math.round(grossCents * exampleGpoNetworkSharePercent / 100);
  return { grossCents, networkCents, retainedCents: grossCents - networkCents };
}

function nationalAllocation(sales: number) {
  const poolCents = Math.round(Math.round(sales * 100) * exampleAccountMarginPercent / 100);
  let remainder = poolCents;
  const allocations = exampleAccountRoles.map((role, index) => {
    // Keep the total exact even when a role percentage produces fractional cents.
    const cents = index === exampleAccountRoles.length - 1 ? remainder : Math.round(poolCents * role.percent / 100);
    remainder -= cents;
    return { ...role, cents };
  });
  return { poolCents, allocations, fulfillmentCents: allocations[2].cents };
}

export function MemberNetworkPrograms({ tenant, selected }: { tenant: MemberTenantBrand; selected?: MemberModuleRoute }) {
  const { period, selectPeriod } = useMemberReportingPeriod();
  const snapshot = memberDataForPeriod(tenant, period).snapshots[period];
  const seed = memberSeed(tenant.slug);
  const [programFilter, setProgramFilter] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const programs = [
    { label: "Express freight", category: "Logistics", stage: "Enrolled", baseline: 32000 + seed * 100, actual: 29100 + seed * 100, potential: null },
    { label: "Facility supplies", category: "Operations", stage: "Enrolled", baseline: 16000 + seed * 80, actual: 14700 + seed * 80, potential: null },
    { label: "Workforce services", category: "People", stage: "Reviewing", baseline: null, actual: null, potential: 960 + seed * 9 },
    { label: "Travel and lodging", category: "Operations", stage: "Available", baseline: null, actual: null, potential: 510 + seed * 6 },
  ].map(row => ({ ...row, ...gpoSavings(row.baseline, row.actual) }));
  const sum = (key: "baseline" | "grossCents" | "networkCents" | "retainedCents" | "potential") => programs.reduce((total, row) => total + (row[key] ?? 0), 0);
  const filtered = programs.filter(row => programFilter === "all" || row.stage === programFilter);
  const accounts = [
    { name: "Demo National Account A", territory: "Central", assignment: "Primary service", sales: 42000 + seed * 205, status: "Active" },
    { name: "Demo National Account B", territory: "Multi-region", assignment: "Overflow fulfillment", sales: 23000 + seed * 125, status: "Pilot" },
  ].map(row => ({ ...row, ...nationalAllocation(row.sales) }));
  const filteredAccounts = accounts.filter(row => accountFilter === "all" || row.status === accountFilter);
  const allSales = filteredAccounts.reduce((total, row) => total + row.sales, 0);
  const accountPool = filteredAccounts.reduce((total, row) => total + row.poolCents, 0);
  const roleTotals = exampleAccountRoles.map((role, index) => ({
    ...role,
    cents: filteredAccounts.reduce((total, row) => total + row.allocations[index].cents, 0),
  }));
  const display = (value: number | null) => value === null ? "—" : money.format(value);
  const channelLabels = ["PartsGopher", "DistraNetDirect"];
  const totalNet = Math.round(snapshot.attributedSales * 100);
  const totalProceeds = Math.round((snapshot.productReimbursement + snapshot.memberMarginShare) * 100);
  const partsNetCents = Math.round(totalNet * (62 + seed % 13) / 100);
  const impactRows = [partsNetCents, totalNet - partsNetCents].flatMap((net, i) => {
    const first = Math.round(net * .54);
    return [first, net - first].map((netCents, j) => ({
      id: "DEMO-ALLOC-" + String(i * 2 + j + 1).padStart(2, "0"), channel: channelLabels[i], netCents,
      creditCents: Math.min(netCents, (seed + i + j) * 50),
    }));
  }).reduce<{ remaining: number; rows: { id: string; channel: string; netCents: number; creditCents: number; proceeds: number }[] }>((acc, row, index, items) => {
    const proceeds = index === items.length - 1 ? acc.remaining : Math.min(acc.remaining, totalNet ? Math.round(row.netCents * totalProceeds / totalNet) : 0);
    return { remaining: acc.remaining - proceeds, rows: [...acc.rows, { ...row, proceeds }] };
  }, { remaining: totalProceeds, rows: [] }).rows;
  return <ModuleWorkspace selected={selected} intro={<WorkspaceIntro icon="opportunity" title="Network programs" description="See how the network contributes to member commerce, purchasing savings and national-account reach." sections={[["impact", "Distranet impact"], ["gpo", "GPO programs"], ["national-accounts", "National Accounts"]]} />}>
    <Section id="impact" title="Revenue and savings" description="The sample channel split and allocations reconcile to the illustrative commerce period. Proceeds are a portion of sales economics; purchasing savings are reported separately."
      action={<button className={styles.button} onClick={() => downloadPreview(tenant.slug + "-impact-" + period.toLowerCase() + "-illustrative.csv", previewCsv([
        ["Illustrative channel allocation examples; not actual transactions"], ["Allocation", "Channel", "Gross", "Credits", "Net", "Proceeds"],
        ...impactRows.map(row => [row.id, row.channel, csvCents(row.netCents + row.creditCents), csvCents(row.creditCents), csvCents(row.netCents), csvCents(row.proceeds)]),
      ]))}>Export impact ledger</button>}>
      <div className={styles.toolbar}><label className={styles.field}>Commerce reporting period<select value={period} onChange={e => selectPeriod(e.target.value as typeof period)}>
        {(["MTD", "QTD", "YTD", "12M"] as const).map(value => <option key={value}>{value}</option>)}
      </select></label></div>
      <Metrics items={[["PartsGopher revenue", displayCents(partsNetCents), period + " net sample sales"], ["DistraNetDirect revenue", displayCents(totalNet - partsNetCents), period + " net sample sales"], ["Member proceeds", displayCents(totalProceeds), "Sample reimbursement plus margin share"], ["GPO savings retained", displayCents(sum("retainedCents")), "Fixed illustrative program period"]]} />
      <DataTable caption="Illustrative storefront allocation ledger" heads={["Allocation", "Channel", "Gross", "Credits", "Net sales", "Member proceeds"]} rows={impactRows.map(row => [
        row.id, row.channel, displayCents(row.netCents + row.creditCents), displayCents(row.creditCents), displayCents(row.netCents), displayCents(row.proceeds),
      ])} />
      <div className={styles.toolbar}>
        <Link className={styles.button} href={memberWorkspacePeriodHref(tenant.slug, "commerce", period)}>Open Commerce</Link>
        <Link className={styles.button} href={memberWorkspacePeriodHref(tenant.slug, "financials", period)}>Open Financials</Link>
      </div>
    </Section>
    <Section id="gpo" title="GPO purchasing programs" description="Compare like-for-like baseline and program spend. The sample model allocates enrolled savings 70% to the member and 30% to Distranet. Estimates for programs not yet enrolled never count as realized savings."
      action={<button className={styles.button} onClick={() => downloadPreview(tenant.slug + "-gpo-illustrative.csv", previewCsv([
        ["Illustrative 70/30 sample model; not actual program terms"], ["Program", "Category", "Status", "Baseline", "Actual", "Gross savings", "Distranet share", "Member retained", "Eligible estimate (not realized)"],
        ...filtered.map(row => [row.label, row.category, row.stage, row.baseline, row.actual, csvCents(row.grossCents), csvCents(row.networkCents), csvCents(row.retainedCents), row.potential]),
      ]))}>Export filtered CSV</button>}>
      <Metrics items={[["Comparable spend", money.format(sum("baseline")), "Enrolled baseline only"], ["Gross savings", displayCents(sum("grossCents")), "Baseline less program spend"], ["Distranet share", displayCents(sum("networkCents")), "Illustrative 30% share"], ["Member retained", displayCents(sum("retainedCents")), "Illustrative 70% share"], ["Eligible opportunity", money.format(sum("potential")), "Estimate; excluded from realized savings"]]} />
      <div className={styles.toolbar}><label className={styles.field}>Program status<select value={programFilter} onChange={e => setProgramFilter(e.target.value)}><option value="all">All programs</option>{["Enrolled", "Reviewing", "Available"].map(status => <option key={status}>{status}</option>)}</select></label></div>
      <DataTable caption="Illustrative GPO savings and enrollment" heads={["Program", "Category", "Enrollment", "Baseline", "Program spend", "Gross savings", "Distranet share", "Member retained", "Eligible estimate"]} rows={filtered.map(row => [
        row.label, row.category, <span className={styles.badge}>{row.stage}</span>, display(row.baseline), display(row.actual), displayCents(row.grossCents), displayCents(row.networkCents), displayCents(row.retainedCents), display(row.potential),
      ])} />
      <div className={styles.toolbar}><Link className={styles.button} href={memberWorkspacePeriodHref(tenant.slug, "downloads", period) + "#gpo-documents"}>Find GPO resources</Link></div>
    </Section>
    <Section id="national-accounts" title="National Accounts" description="Review fictional account assignments and territory responsibilities. The example uses a 20% gross-profit pool split by role. It is separate from Parts Gopher and Distranet Direct revenue, and is not a payout or a commitment."
      action={<button className={styles.button} onClick={() => downloadPreview(tenant.slug + "-national-accounts-illustrative.csv", previewCsv([
        ["Illustrative data and role splits; not a live report"], ["Account", "Territory", "Assignment", "Program sales", "Gross-profit pool", ...exampleAccountRoles.map(role => role.role), "Status"],
        ...filteredAccounts.map(row => [row.name, row.territory, row.assignment, row.sales, csvCents(row.poolCents), ...row.allocations.map(role => csvCents(role.cents)), row.status]),
      ]))}>Export account assignments</button>}>
      <Metrics items={[["Account assignments", filteredAccounts.length, "Matching sample assignments"], ["Program sales", money.format(allSales), "Illustrative national-account activity"], ["Gross-profit pool", displayCents(accountPool), "Illustrative 20% margin"]]} />
      <div className={styles.toolbar}><label className={styles.field}>Assignment status<select value={accountFilter} onChange={e => setAccountFilter(e.target.value)}><option value="all">All assignments</option><option>Active</option><option>Pilot</option></select></label></div>
      <DataTable caption="Fictional national-account assignments" heads={["Account", "Territory", "Responsibility", "Sample sales", "Profit pool", "Fulfilling member share", "Status"]} rows={filteredAccounts.map(row => [
        row.name, row.territory, row.assignment, money.format(row.sales), displayCents(row.poolCents), displayCents(row.fulfillmentCents), <span className={styles.badge}>{row.status}</span>,
      ])} />
      <details><summary>Gross-profit allocation model</summary>
        <DataTable caption="Sample profit allocation for matching account assignments" heads={["Role", "Allocation", "Illustrative amount", "Responsibility"]} rows={roleTotals.map(role => [
          role.role, role.percent + "%", displayCents(role.cents), role.purpose,
        ])} />
      </details>
    </Section>
  </ModuleWorkspace>;
}

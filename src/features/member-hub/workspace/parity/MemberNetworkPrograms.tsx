"use client";

import Link from "next/link";
import { useState } from "react";
import type { MemberTenantBrand } from "@/domain/member-hub/types";
import { memberDataForPeriod } from "../../member-demo-data";
import { useMemberReportingPeriod } from "../MemberWorkspaceShell";
import { memberWorkspacePeriodHref } from "../member-workspace-navigation";
import { DataTable, Metrics, money, number, Section, styles, WorkspaceIntro } from "./ParityUI";
import { downloadPreview, memberSeed, previewCsv } from "./parity-data";

export function MemberNetworkPrograms({ tenant }: { tenant: MemberTenantBrand }) {
  const { period, selectPeriod } = useMemberReportingPeriod();
  const snapshot = memberDataForPeriod(tenant, period).snapshots[period];
  const seed = memberSeed(tenant.slug);
  const [programFilter, setProgramFilter] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const programs = [
    { label: "Express freight", category: "Logistics", stage: "Enrolled", baseline: 32000 + seed * 100, actual: 29100 + seed * 100, fee: 300 },
    { label: "Facility supplies", category: "Operations", stage: "Enrolled", baseline: 16000 + seed * 80, actual: 14700 + seed * 80, fee: 140 },
    { label: "Workforce services", category: "People", stage: "Reviewing", baseline: null, actual: null, fee: null },
    { label: "Travel and lodging", category: "Operations", stage: "Available", baseline: null, actual: null, fee: null },
  ].map(row => {
    const gross = row.baseline === null || row.actual === null ? null : row.baseline - row.actual;
    return { ...row, gross, retained: gross === null || row.fee === null ? null : gross - row.fee };
  });
  const sum = (key: "baseline" | "gross" | "retained") => programs.reduce((total, row) => total + (row[key] ?? 0), 0);
  const filtered = programs.filter(row => programFilter === "all" || row.stage === programFilter);
  const accounts = [
    { name: "Demo National Account A", territory: "Central", assignment: "Primary service", sales: 42000 + seed * 205, status: "Active" },
    { name: "Demo National Account B", territory: "Multi-region", assignment: "Overflow fulfillment", sales: 23000 + seed * 125, status: "Pilot" },
  ];
  const allSales = accounts.reduce((total, row) => total + row.sales, 0);
  const display = (value: number | null) => value === null ? "—" : money.format(value);
  return <div className={styles.workspace}>
    <WorkspaceIntro icon="opportunity" title="Network programs" description="See how the network contributes to member commerce, purchasing savings and national-account reach." sections={[["impact", "Distranet impact"], ["gpo", "GPO programs"], ["national-accounts", "National Accounts"]]} />
    <Section id="impact" title="Distranet impact" description="Commerce metrics honor the reporting period. Fixed program examples appear separately and are not added to storefront revenue.">
      <div className={styles.toolbar}><label className={styles.field}>Commerce reporting period<select value={period} onChange={e => selectPeriod(e.target.value as typeof period)}>
        {(["MTD", "QTD", "YTD", "12M"] as const).map(value => <option key={value}>{value}</option>)}
      </select></label></div>
      <Metrics items={[["Attributed sales", money.format(snapshot.attributedSales), period + " sample commerce"], ["Recognized orders", number.format(snapshot.recognizedOrders), period + " sample commerce"], ["Member margin share", money.format(snapshot.memberMarginShare), "Separate from reimbursement"], ["GPO savings retained", money.format(sum("retained")), "Fixed illustrative program period"]]} />
      <div className={styles.toolbar}>
        <Link className={styles.button} href={memberWorkspacePeriodHref(tenant.slug, "commerce", period)}>Open Commerce</Link>
        <Link className={styles.button} href={memberWorkspacePeriodHref(tenant.slug, "financials", period)}>Open Financials</Link>
      </div>
    </Section>
    <Section id="gpo" title="GPO purchasing programs" description="Compare like-for-like baseline and program spend. Retained savings are gross savings less the sample fee; non-enrolled programs have no calculated savings."
      action={<button className={styles.button} onClick={() => downloadPreview(tenant.slug + "-gpo-illustrative.csv", previewCsv([["Illustrative data; not a live report"], ["Program", "Category", "Status", "Baseline", "Actual", "Gross savings", "Fee", "Retained"], ...filtered.map(row => [row.label, row.category, row.stage, row.baseline, row.actual, row.gross, row.fee, row.retained])]))}>Export filtered CSV</button>}>
      <Metrics items={[["Comparable spend", money.format(sum("baseline")), "Enrolled baseline only"], ["Gross savings", money.format(sum("gross")), "Before illustrative fees"], ["Member retained", money.format(sum("retained")), "After illustrative fees"]]} />
      <div className={styles.toolbar}><label className={styles.field}>Program status<select value={programFilter} onChange={e => setProgramFilter(e.target.value)}><option value="all">All programs</option>{["Enrolled", "Reviewing", "Available"].map(status => <option key={status}>{status}</option>)}</select></label></div>
      <DataTable caption="Illustrative GPO savings and enrollment" heads={["Program", "Category", "Enrollment", "Baseline", "Program spend", "Retained"]} rows={filtered.map(row => [row.label, row.category, <span className={styles.badge}>{row.stage}</span>, display(row.baseline), display(row.actual), display(row.retained)])} />
      <div className={styles.toolbar}><Link className={styles.button} href={memberWorkspacePeriodHref(tenant.slug, "resources", period) + "#downloads"}>Find GPO resources</Link></div>
    </Section>
    <Section id="national-accounts" title="National Accounts" description="Review fictional account assignments and territory responsibilities. These sample sales are a separate program lens, not Parts Gopher or Distranet Direct revenue."
      action={<button className={styles.button} onClick={() => downloadPreview(tenant.slug + "-national-accounts-illustrative.csv", previewCsv([["Illustrative data; not a live report"], ["Account", "Territory", "Assignment", "Program sales", "Status"], ...accounts.filter(r => accountFilter === "all" || r.status === accountFilter).map(row => [row.name, row.territory, row.assignment, row.sales, row.status])]))}>Export account assignments</button>}>
      <Metrics items={[["Account assignments", accounts.length, "Sample portfolio"], ["Program sales", money.format(allSales), "Illustrative national-account activity"]]} />
      <div className={styles.toolbar}><label className={styles.field}>Assignment status<select value={accountFilter} onChange={e => setAccountFilter(e.target.value)}><option value="all">All assignments</option><option>Active</option><option>Pilot</option></select></label></div>
      <DataTable caption="Fictional national-account assignments" heads={["Account", "Territory", "Responsibility", "Sample sales", "Status"]} rows={accounts.filter(row => accountFilter === "all" || row.status === accountFilter).map(row => [row.name, row.territory, row.assignment, money.format(row.sales), <span className={styles.badge}>{row.status}</span>])} />
    </Section>
  </div>;
}

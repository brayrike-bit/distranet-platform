import type { MemberOverviewPeriod, MemberOverviewSnapshot } from "@/domain/member-hub/types";

export const REPORT_PERIODS: readonly MemberOverviewPeriod[] = ["MTD", "QTD", "YTD", "12M"];
const SCHEMA_VERSION = "distranet.demonstration-report/v1";
const SOURCE_NOTICE = "Illustrative fixed examples only. No live production source, authentication, or server-enforced tenant isolation is connected. Aggregate data only; no customer identities. Not a payable statement or certified financial record.";

const METRICS = [
  ["attributedSales", "Attributed sales", "USD"],
  ["recognizedOrders", "Recognized orders", "orders"],
  ["splitOrders", "Split orders", "orders"],
  ["splitRate", "Split fulfillment rate", "percent"],
  ["productReimbursement", "Product reimbursement", "USD"],
  ["memberMarginShare", "Member gross-margin share", "USD"],
  ["partsGopherMarginShare", "Parts Gopher gross-margin share", "USD"],
  ["adjustments", "Adjustments shown separately", "USD"],
  ["opportunityValue", "Illustrative opportunity value", "USD"],
  ["matchRate", "Inventory match rate", "percent"],
] as const;

export function parseDemonstrationPeriod(value: string | null): MemberOverviewPeriod {
  return REPORT_PERIODS.includes(value as MemberOverviewPeriod) ? value as MemberOverviewPeriod : "YTD";
}

/** Only local member routes are accepted; a query string is not authorization. */
export function withDemonstrationPeriod(href: string, period: MemberOverviewPeriod) {
  if (!href.startsWith("/member-hub/") || !REPORT_PERIODS.includes(period)) {
    throw new Error("Expected a member workspace route and valid reporting period.");
  }
  const url = new URL(href, "https://distranet.invalid");
  if (url.origin !== "https://distranet.invalid" || !url.pathname.startsWith("/member-hub/")) throw new Error("Expected a local member route.");
  url.searchParams.set("period", period);
  return `${url.pathname}${url.search}${url.hash}`;
}

/** Quote every cell and neutralize spreadsheet formulas in text, not numeric values. */
export function demonstrationCsvCell(value: string | number | boolean) {
  let text = String(value);
  if (typeof value === "string") {
    const firstMeaningful = text.replace(/^[\s\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2060-\u206f]*/u, "");
    if (/^[=+\-@]/u.test(firstMeaningful) || /^[\t\r\n]/u.test(text)) text = `'${text}`;
  }
  return `"${text.replaceAll('"', '""')}"`;
}

/** Pure serialization of a whitelisted demonstration snapshot; never a live export service. */
export function createDemonstrationReport({
  company,
  snapshot,
  generatedAt,
}: {
  company: { slug: string; name: string };
  snapshot: MemberOverviewSnapshot;
  generatedAt: string;
}) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(company.slug) || !company.name.trim()) {
    throw new Error("A company identity is required for a demonstration download.");
  }
  if (!REPORT_PERIODS.includes(snapshot.period) || snapshot.confidence !== "illustrative") {
    throw new Error("Only an explicitly illustrative reporting snapshot can use this download.");
  }
  const time = new Date(generatedAt);
  if (!Number.isFinite(time.getTime())) throw new Error("A valid generation timestamp is required.");
  const metrics = METRICS.map(([id, label, unit]) => {
    const value = snapshot[id];
    if (!Number.isFinite(value)) throw new Error(`Invalid demonstration metric: ${id}.`);
    return { id, label, value, unit };
  });
  const payload = {
    schemaVersion: SCHEMA_VERSION,
    prototype: true,
    aggregateOnly: true,
    report: "aggregate-operating-snapshot",
    company: { slug: company.slug, name: company.name },
    period: { code: snapshot.period, label: snapshot.periodLabel, effectiveDate: snapshot.effectiveDate },
    generatedAt: time.toISOString(),
    reportingTimeZone: "America/New_York",
    definitionStatus: "draft-awaiting-dave-and-board-approval",
    confidence: "illustrative",
    sourceNotice: SOURCE_NOTICE,
    metrics,
  };
  const headers = ["schema_version", "prototype", "aggregate_only", "company_slug", "company_name", "report", "period", "period_label", "effective_date", "generated_at", "reporting_timezone", "definition_status", "confidence", "metric", "metric_label", "value", "unit", "source_notice"];
  const rows = metrics.map(metric => [SCHEMA_VERSION, true, true, company.slug, company.name, payload.report, snapshot.period, snapshot.periodLabel, snapshot.effectiveDate, payload.generatedAt, payload.reportingTimeZone, payload.definitionStatus, payload.confidence, metric.id, metric.label, metric.value, metric.unit, SOURCE_NOTICE]);
  return {
    payload,
    fileBase: `distranet-${company.slug}-${snapshot.period.toLowerCase()}-demonstration-${time.toISOString().slice(0, 10)}`,
    json: `${JSON.stringify(payload, null, 2)}\n`,
    csv: `\ufeff${[headers, ...rows].map(row => row.map(demonstrationCsvCell).join(",")).join("\r\n")}\r\n`,
  };
}

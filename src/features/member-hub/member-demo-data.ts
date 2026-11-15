import type { MemberIdentity } from "@/brands/member-directory";
import type { MemberOverviewPeriod, MemberTenantBrand } from "@/domain/member-hub/types";

/** Fictional design fixtures. Never clone another member's operational data.
 * Every company receives separately scoped records with neutral sample labels.
 * Values intentionally match across companies: they are not a member ranking.
 */
export function createMemberDemoData(identity: MemberIdentity): MemberTenantBrand["data"] {
  const id = (value: string) => `${identity.slug}-sample-${value}`;
  const periods = ["MTD", "QTD", "YTD", "12M"] as const;
  const totals = [24500, 124600, 624000, 920000];
  const snapshots = Object.fromEntries(periods.map((period, index) => {
    const total = totals[index];
    const orders = [28, 142, 710, 1040][index];
    return [period, {
      period, periodLabel: `${period} · demonstration period`, effectiveDate: "Sample data",
      confidence: "illustrative", attributedSales: total, recognizedOrders: orders,
      splitOrders: Math.round(orders * 0.25), splitRate: 25,
      productReimbursement: total * 0.7, memberMarginShare: total * 0.15,
      partsGopherMarginShare: total * 0.15, adjustments: 0,
      opportunityValue: Math.round(total * 0.08), matchRate: 88,
    }];
  })) as MemberTenantBrand["data"]["snapshots"];
  const channels = [
    ["Organic search", 40, 284, 249600, "#405c76"],
    ["Direct", 30, 213, 187200, "#67889e"],
    ["Referral", 15, 106, 93600, "#80999f"],
    ["Campaigns", 10, 71, 62400, "#a5b5b2"],
    ["Unattributed", 5, 36, 31200, "#7b8790"],
  ] as const;
  const categories = ["Hose + fittings", "Hydraulic components", "Pneumatic components"];
  return {
    snapshots: snapshots as Record<MemberOverviewPeriod, MemberTenantBrand["data"]["snapshots"]["YTD"]>,
    demandSignals: categories.map((label, i) => ({ id: id(`demand-${i}`), label: `Sample ${label.toLowerCase()} demand`, demandIndex: [72, 61, 48][i], availabilityIndex: [54, 65, 71][i], opportunityValue: [29952, 11981, 7987][i], signal: i === 0 ? "stock-gap" : "covered", summary: "Fictional aggregate signal for dashboard review. No live demand source is connected." })),
    acquisitionChannels: channels.map(([label, share, orders, attributedSales, color], i) => ({ id: id(i === 4 ? "unknown" : `channel-${i}`), label, share, orders, attributedSales, matchRate: 88, color: i === 0 ? identity.primary : color, insight: "Sample channel mix; acquisition measurement has not been connected or certified." })),
    benchmarks: [
      { label: "Inventory match", value: 88, median: 85, percentile: "Sample", delta: "+3 pts in sample" },
      { label: "Same-day dispatch", value: 91, median: 87, percentile: "Sample", delta: "+4 pts in sample" },
      { label: "Split participation", value: 25, median: 22, percentile: "Sample", delta: "+3 pts in sample" },
    ],
    productPerformance: categories.map((category, i) => ({ id: id(`product-${i}`), category, brand: "Parker", family: `${category} · sample`, attributedSales: [280800, 218400, 124800][i], recognizedOrders: [320, 249, 141][i], memberMarginShare: [42120, 32760, 18720][i], growthRate: [8, 5, -2][i], matchRate: [90, 88, 82][i], stockoutRate: [3, 5, 8][i], signal: i === 2 ? "watch" : "leading" })),
    territoryPerformance: ["Sample service area A", "Sample service area B", "Other aggregate areas"].map((label, i) => ({ id: id(`territory-${i}`), label, scope: "Fictional coarse geography; not a claimed service territory", attributedSales: [312000, 187200, 124800][i], recognizedOrders: [355, 213, 142][i], matchRate: 88, splitRate: 25, averageShipHours: 12, fillRate: 92 })),
    inventoryPerformance: categories.map((family, i) => ({ id: id(`inventory-${i}`), family, availableSkuCount: [1200, 860, 420][i], demandIndex: [72, 61, 48][i], availabilityIndex: [54, 65, 71][i], matchRate: 88, stockoutRate: [8, 5, 3][i], freshnessHours: 2, status: i === 0 ? "stock-gap" : "covered" })),
    fulfillmentPerformance: ["Primary allocation", "Network-assisted allocation"].map((label, i) => ({ id: id(`fulfillment-${i}`), label, allocationType: i === 0 ? "Primary member" : "Network-assisted", allocatedLines: [600, 200][i], recognizedOrders: [532, 178][i], sameDayRate: 91, averageShipHours: 12, splitShare: [0, 25][i], returnRate: 2 })),
    actionItems: [
      { id: id("action-data"), category: "measurement", title: "Connect the member reporting source", evidence: "This workspace currently displays demonstration figures.", owner: "Member reporting team", value: 0, priority: "high", status: "evidence-needed" },
      { id: id("action-review"), category: "inventory", title: "Review the sample availability gap", evidence: "Example signal for demonstrating the review workflow.", owner: "Member operations", value: 29952, priority: "monitor", status: "monitoring" },
    ],
    services: [
      { id: id("service-inventory"), label: "Shared inventory", eyebrow: "Availability", description: "Member inventory and source freshness in one reporting view.", status: "planned" },
      { id: id("service-commerce"), label: "Parker commerce reporting", eyebrow: "Parts Gopher", description: "Aggregate attributed sales and allocation outcomes.", status: "planned" },
      { id: id("service-governance"), label: "Metric definitions", eyebrow: "Governance", description: "Definitions and disputes governed by Dave Rike and the board.", status: "governance" },
    ],
  };
}

/** Keeps the illustrative detail views in the same selected window as the KPIs. */
export function memberDataForPeriod(tenant: MemberTenantBrand, period: MemberOverviewPeriod): MemberTenantBrand["data"] {
  if (tenant.slug === "air-hydro-power" || period === "YTD") return tenant.data;
  const data = tenant.data;
  const snapshot = data.snapshots[period];
  const moneyRatio = snapshot.attributedSales / data.snapshots.YTD.attributedSales;
  const orderRatio = snapshot.recognizedOrders / data.snapshots.YTD.recognizedOrders;
  const apportion = (values: readonly number[], total: number) => {
    let allocated = 0;
    const denominator = values.reduce((sum, n) => sum + n, 0) || 1;
    return values.map((n, i) => { const value = i === values.length - 1 ? total - allocated : Math.round(n / denominator * total); allocated += value; return value; });
  };
  const channelOrders = apportion(data.acquisitionChannels.map(row => row.orders), snapshot.recognizedOrders);
  const productOrders = apportion(data.productPerformance.map(row => row.recognizedOrders), snapshot.recognizedOrders);
  const territoryOrders = apportion(data.territoryPerformance.map(row => row.recognizedOrders), snapshot.recognizedOrders);
  const fulfillmentOrders = apportion(data.fulfillmentPerformance.map(row => row.recognizedOrders), snapshot.recognizedOrders);
  const opportunities = apportion(data.demandSignals.map(row => row.opportunityValue), snapshot.opportunityValue);
  return {
    ...data,
    demandSignals: data.demandSignals.map((row, i) => ({ ...row, opportunityValue: opportunities[i] })),
    actionItems: data.actionItems.map(row => row.id.endsWith("action-review") ? { ...row, value: opportunities[0] } : row),
    acquisitionChannels: data.acquisitionChannels.map((row, i) => ({ ...row, orders: channelOrders[i], attributedSales: row.attributedSales * moneyRatio })),
    productPerformance: data.productPerformance.map((row, i) => ({ ...row, recognizedOrders: productOrders[i], attributedSales: row.attributedSales * moneyRatio, memberMarginShare: row.memberMarginShare * moneyRatio })),
    territoryPerformance: data.territoryPerformance.map((row, i) => ({ ...row, recognizedOrders: territoryOrders[i], attributedSales: row.attributedSales * moneyRatio })),
    fulfillmentPerformance: data.fulfillmentPerformance.map((row, i) => ({ ...row, recognizedOrders: fulfillmentOrders[i], allocatedLines: Math.round(row.allocatedLines * orderRatio) })),
  };
}

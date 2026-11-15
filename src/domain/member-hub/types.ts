import type { DistranetCinematicMediaKey } from "@/components/cinematic/mediaManifest";
import type { VerifiedMemberSlug } from "@/brands/member-directory";

export type MemberSlug = VerifiedMemberSlug;

export type MemberRole =
  | "executive"
  | "finance"
  | "operations"
  | "sales-ecommerce"
  | "branch-manager"
  | "member-admin";

export type MetricConfidence = "illustrative" | "definition-draft" | "certified";

export type MemberBrandPalette = {
  /** Exact observed brand hue; controls/text use the contrast-safe primary. */
  tenantBrand?: string;
  tenantPrimary: string;
  tenantSecondary: string;
  tenantInk: string;
  tenantTint: string;
  networkSignal: string;
  positive: string;
  caution: string;
};

export type MemberViewerProfile = {
  name: string;
  initials: string;
  roleLabel: string;
};

export type MemberTenantOperatingContext = {
  territory: {
    label: string;
    value: string;
    detail: string;
  };
  network: {
    label: string;
    value: string;
    detail: string;
  };
};

export type MemberTenantArrivalMotion = {
  scrollSpanVh: number;
  pointerDepth: {
    perspective: number;
    travelX: number;
    travelY: number;
    travelZ: number;
    rotation: number;
    response: number;
  };
};

export type MemberAcquisitionChannel = {
  id: string;
  label: string;
  share: number;
  orders: number;
  attributedSales: number;
  matchRate: number;
  color: string;
  insight: string;
};

export type MemberBenchmark = {
  label: string;
  value: number;
  median: number;
  percentile: string;
  delta: string;
};

export type MemberProductPerformance = {
  id: string;
  category: string;
  brand: string;
  family: string;
  attributedSales: number;
  recognizedOrders: number;
  memberMarginShare: number;
  growthRate: number;
  matchRate: number;
  stockoutRate: number;
  signal: "leading" | "watch" | "stock-gap";
};

export type MemberTerritoryPerformance = {
  id: string;
  label: string;
  scope: string;
  attributedSales: number;
  recognizedOrders: number;
  matchRate: number;
  splitRate: number;
  averageShipHours: number;
  fillRate: number;
};

export type MemberInventoryPerformance = {
  id: string;
  family: string;
  availableSkuCount: number;
  demandIndex: number;
  availabilityIndex: number;
  matchRate: number;
  stockoutRate: number;
  freshnessHours: number;
  status: "covered" | "watch" | "stock-gap";
};

export type MemberFulfillmentPerformance = {
  id: string;
  label: string;
  allocationType: string;
  allocatedLines: number;
  recognizedOrders: number;
  sameDayRate: number;
  averageShipHours: number;
  splitShare: number;
  returnRate: number;
};

export type MemberActionItem = {
  id: string;
  category: "inventory" | "fulfillment" | "measurement" | "finance";
  title: string;
  evidence: string;
  owner: string;
  value: number;
  priority: "high" | "medium" | "monitor";
  status: "ready-for-review" | "evidence-needed" | "monitoring";
};

export type MemberTenantBrand = {
  id: string;
  slug: MemberSlug;
  legalName: string;
  displayName: string;
  shortName: string;
  workspaceLabel: string;
  logo: {
    src: string;
    alt: string;
    width: number;
    height: number;
    background?: string;
  };
  website?: string;
  brandReviewedAt?: string;
  /** Approved, member-scoped context used by the arrival and future summaries. */
  operatingContext: MemberTenantOperatingContext;
  arrival: {
    /** Manifest key for the tenant-specific, pixel-branded arrival film. */
    film: DistranetCinematicMediaKey | null;
    /** Keeps the cinematic arrival configurable without leaking motion into dashboards. */
    motion: MemberTenantArrivalMotion;
    eyebrow: string;
    headlineLead: string;
    headlineSignal: string;
    description: string;
    operatingLanes: readonly string[];
    signals: readonly {
      label: string;
      value: string;
      detail: string;
    }[];
  };
  palette: MemberBrandPalette;
  /** Prototype-only viewer. Production replaces this with the authenticated session. */
  demoViewer: MemberViewerProfile;
  data: {
    snapshots: Record<MemberOverviewPeriod, MemberOverviewSnapshot>;
    demandSignals: readonly AggregateDemandSignal[];
    acquisitionChannels: readonly MemberAcquisitionChannel[];
    benchmarks: readonly MemberBenchmark[];
    productPerformance: readonly MemberProductPerformance[];
    territoryPerformance: readonly MemberTerritoryPerformance[];
    inventoryPerformance: readonly MemberInventoryPerformance[];
    fulfillmentPerformance: readonly MemberFulfillmentPerformance[];
    actionItems: readonly MemberActionItem[];
    services: readonly MemberService[];
  };
};

export type MemberOverviewPeriod = "MTD" | "QTD" | "YTD" | "12M";

export type MemberOverviewSnapshot = {
  period: MemberOverviewPeriod;
  periodLabel: string;
  effectiveDate: string;
  confidence: MetricConfidence;
  attributedSales: number;
  recognizedOrders: number;
  splitOrders: number;
  splitRate: number;
  productReimbursement: number;
  memberMarginShare: number;
  partsGopherMarginShare: number;
  adjustments: number;
  opportunityValue: number;
  matchRate: number;
};

export type AggregateDemandSignal = {
  id: string;
  label: string;
  demandIndex: number;
  availabilityIndex: number;
  opportunityValue: number;
  signal: "covered" | "watch" | "stock-gap";
  summary: string;
};

export type MemberService = {
  id: string;
  label: string;
  eyebrow: string;
  description: string;
  status: "current-portal" | "planned" | "governance";
};

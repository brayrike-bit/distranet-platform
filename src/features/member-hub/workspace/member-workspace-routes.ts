import type { MemberSlug } from "@/domain/member-hub/types";
import type { MemberIconName } from "../components/MemberIcon";

export type MemberWorkspaceGroup =
  | "Workspace"
  | "Business"
  | "Intelligence"
  | "Administration";

const moduleRoute = <Id extends string, Surface extends string, Section extends string>(
  id: Id, label: string, icon: MemberIconName, description: string, surface: Surface, section: Section, group: MemberWorkspaceGroup,
) => ({ id, segment: id, label, shortLabel: label, icon, description, surface, section, group, legacySegments: [] as const });

export const MEMBER_MODULE_ROUTES = [
  moduleRoute("impact", "DistraNet Impact", "pulse", "See the network's illustrative sales and purchasing contribution.", "programs", "impact", "Workspace"),
  moduleRoute("buy-sell-opportunities", "Buy/Sell Opportunities", "commerce", "Review sample buying and selling opportunities and update follow-up status.", "trade", "buy-sell", "Business"),
  moduleRoute("dead-excess-stock", "Dead & Excess Stock", "operations", "Find slow-moving sample inventory and track recovery.", "trade", "dead-excess", "Business"),
  moduleRoute("shared-inventory", "Shared Inventory", "inventory", "Reconcile illustrative network purchases, sales, fees and adjustments.", "trade", "shared-inventory", "Business"),
  moduleRoute("demand-signal", "DemandSignal", "pulse", "Review sample national demand and part-level opportunities.", "performance", "demand-signal", "Business"),
  moduleRoute("exception-reporting", "Exception Reporting", "governance", "Log and triage illustrative exceptions and review supporting evidence.", "performance", "exceptions", "Intelligence"),
  moduleRoute("member-scorecard", "Member Scorecard", "pulse", "Review evidence-weighted measures, exclusions and follow-up actions.", "performance", "scorecard", "Intelligence"),
  moduleRoute("gpo-dashboard", "GPO Dashboard", "finance", "Explore sample purchasing programs, retained savings and open opportunities.", "programs", "gpo", "Intelligence"),
  moduleRoute("national-accounts", "National Accounts", "locations", "Review fictional account assignments and program economics.", "programs", "national-accounts", "Intelligence"),
  moduleRoute("industry-data-pool", "Industry Data Pool", "operations", "Review illustrative catalog coverage and data quality.", "performance", "data-pool", "Intelligence"),
  moduleRoute("communications", "Communications", "statements", "Read sample notices and preview communications without sending.", "resources", "communications", "Administration"),
  moduleRoute("downloads", "Downloads", "download", "Find illustrative reports, document slots, and sample files.", "resources", "downloads", "Administration"),
  moduleRoute("email-recipients", "Email Recipients", "statements", "Review sample buy, sell and weekly digest preferences.", "admin", "recipients", "Administration"),
  moduleRoute("locations", "Locations", "locations", "Review sample branch records, shipping settings and locations.", "admin", "locations", "Administration"),
  moduleRoute("manage-users", "Manage Users", "portrait", "Preview roles and module access without creating live credentials.", "admin", "users", "Administration"),
  moduleRoute("manage-network", "Manage Network", "governance", "Review sample members, manufacturers and division registries.", "admin", "network-admin", "Administration"),
] as const;
export type MemberModuleRoute = typeof MEMBER_MODULE_ROUTES[number];
export type MemberModuleId = MemberModuleRoute["id"];

export type MemberWorkspaceRoute = {
  id:
    | "overview"
    | "parts-search"
    | "edi-compliance"
    | "tools"
    | "commerce"
    | "orders"
    | "financials"
    | "trade-desk"
    | "programs"
    | "inventory"
    | "customers"
    | "benchmarks"
    | "performance"
    | "reports"
    | "resources"
    | "administration"
    | "settings"
    | MemberModuleId;
  segment: string;
  legacySegments: readonly string[];
  label: string;
  shortLabel: string;
  icon: MemberIconName;
  description: string;
  group: MemberWorkspaceGroup;
};

/**
 * The member portal's canonical information architecture.
 * Legacy prototype paths remain resolvable, while every generated link points
 * to this grouped workspace taxonomy.
 */
export const MEMBER_WORKSPACE_ROUTES = [
  {
    id: "overview",
    segment: "",
    legacySegments: [],
    label: "Overview",
    shortLabel: "Overview",
    icon: "portrait",
    description: "Executive orientation, network value, and the next actions that need attention.",
    group: "Workspace",
  },
  {
    id: "parts-search",
    segment: "parts-search",
    legacySegments: [],
    label: "Parts Search",
    shortLabel: "Parts Search",
    icon: "opportunity",
    description: "Find standard, excess, and dead stock by part number, manufacturer, and stocking branch.",
    group: "Workspace",
  },
  {
    id: "edi-compliance",
    segment: "edi-compliance",
    legacySegments: [],
    label: "EDI Compliance",
    shortLabel: "EDI Compliance",
    icon: "split",
    description: "Review the buying and selling directions of the illustrative EDI partner matrix.",
    group: "Workspace",
  },
  {
    id: "tools",
    segment: "tools",
    legacySegments: [],
    label: "All Member Tools",
    shortLabel: "All Tools",
    icon: "operations",
    description: "Find every member workflow by name, from Parts Search to Manage Network.",
    group: "Workspace",
  },
  {
    id: "commerce",
    segment: "commerce",
    legacySegments: ["products"],
    label: "Commerce",
    shortLabel: "Commerce",
    icon: "commerce",
    description: "Attributed sales, channels, products, and demand contribution.",
    group: "Business",
  },
  {
    id: "orders",
    segment: "orders",
    legacySegments: ["fulfillment"],
    label: "Orders",
    shortLabel: "Orders",
    icon: "shipping",
    description: "Allocation lines, split participation, shipping, returns, and service speed.",
    group: "Business",
  },
  {
    id: "financials",
    segment: "financials",
    legacySegments: ["finance"],
    label: "Financials",
    shortLabel: "Financials",
    icon: "finance",
    description: "Product reimbursement, member margin share, adjustments, and statements.",
    group: "Business",
  },
  {
    id: "trade-desk",
    segment: "trade-desk",
    legacySegments: [],
    label: "Trade Desk",
    shortLabel: "Trade Desk",
    icon: "split",
    description: "Part search, buy/sell matches, excess stock, and Shared Inventory reconciliation.",
    group: "Business",
  },
  {
    id: "programs",
    segment: "programs",
    legacySegments: [],
    label: "Network Programs",
    shortLabel: "Programs",
    icon: "opportunity",
    description: "Distranet impact, GPO purchasing savings, and National Account assignments.",
    group: "Business",
  },
  {
    id: "inventory",
    segment: "inventory",
    legacySegments: ["operations"],
    label: "Inventory",
    shortLabel: "Inventory",
    icon: "inventory",
    description: "Shared availability, match readiness, stock gaps, and source freshness.",
    group: "Intelligence",
  },
  {
    id: "customers",
    segment: "customers",
    legacySegments: ["territories"],
    label: "Customers",
    shortLabel: "Customers",
    icon: "locations",
    description: "Privacy-safe customer cohorts and aggregate service-area performance.",
    group: "Intelligence",
  },
  {
    id: "benchmarks",
    segment: "benchmarks",
    legacySegments: ["opportunities"],
    label: "Benchmarks",
    shortLabel: "Benchmarks",
    icon: "pulse",
    description: "Permitted network comparisons, demand gaps, and governed action signals.",
    group: "Intelligence",
  },
  {
    id: "performance",
    segment: "performance",
    legacySegments: [],
    label: "Performance",
    shortLabel: "Performance",
    icon: "operations",
    description: "DemandSignal, EDI readiness, scorecards, exception reporting, and product data coverage.",
    group: "Intelligence",
  },
  {
    id: "reports",
    segment: "reports",
    legacySegments: [],
    label: "Reports",
    shortLabel: "Reports",
    icon: "reports",
    description: "Board-ready reporting views, definitions, and planned governed exports.",
    group: "Administration",
  },
  {
    id: "resources",
    segment: "resources",
    legacySegments: [],
    label: "Resources",
    shortLabel: "Resources",
    icon: "download",
    description: "Communications, a named download catalog, and sample file validation.",
    group: "Administration",
  },
  {
    id: "administration",
    segment: "administration",
    legacySegments: [],
    label: "Administration",
    shortLabel: "Admin",
    icon: "governance",
    description: "Shipping locations, digest recipients, user permission previews, and network registries.",
    group: "Administration",
  },
  {
    id: "settings",
    segment: "settings",
    legacySegments: ["services"],
    label: "Settings",
    shortLabel: "Settings",
    icon: "settings",
    description: "Member services, data sources, governance definitions, and handoff planning.",
    group: "Administration",
  },
  ...MEMBER_MODULE_ROUTES,
] as const satisfies readonly MemberWorkspaceRoute[];

export type MemberWorkspaceId = (typeof MEMBER_WORKSPACE_ROUTES)[number]["id"];
export type MemberDashboardId = Exclude<MemberWorkspaceId, "overview">;
export type MemberWorkspaceSegment = Exclude<
  (typeof MEMBER_WORKSPACE_ROUTES)[number]["segment"],
  ""
>;

export function resolveMemberWorkspace(
  segment: string,
): (typeof MEMBER_WORKSPACE_ROUTES)[number] | undefined {
  return MEMBER_WORKSPACE_ROUTES.find(
    (route) => route.segment === segment
      || (route.legacySegments as readonly string[]).includes(segment),
  );
}

export function memberWorkspaceHref(
  member: MemberSlug,
  workspace: MemberWorkspaceId,
): string {
  const route = MEMBER_WORKSPACE_ROUTES.find((candidate) => candidate.id === workspace);
  if (!route || !route.segment) return `/member-hub/${member}`;
  return `/member-hub/${member}/${route.segment}`;
}

/** Canonical segments plus old public-prototype paths retained for redirects. */
export const MEMBER_DASHBOARD_SEGMENTS = MEMBER_WORKSPACE_ROUTES.flatMap(
  (route) => route.segment ? [route.segment, ...route.legacySegments] : [],
) as readonly string[];

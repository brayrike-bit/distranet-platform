import type { MemberSlug } from "@/domain/member-hub/types";
import type { MemberIconName } from "../components/MemberIcon";

export type MemberWorkspaceGroup =
  | "Workspace"
  | "Business"
  | "Intelligence"
  | "Administration";

export type MemberWorkspaceRoute = {
  id:
    | "overview"
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
    | "settings";
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

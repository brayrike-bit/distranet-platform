import type { MemberOverviewPeriod, MemberSlug } from "@/domain/member-hub/types";
import type { MemberIconName } from "../../components/MemberIcon";
import { memberWorkspacePeriodHref } from "../member-workspace-navigation";
import type { MemberWorkspaceId } from "../member-workspace-routes";

export type MemberTool = {
  label: string;
  route: MemberWorkspaceId;
  icon: MemberIconName;
  description: string;
  keywords?: string;
};

type ToolGroup = { title: string; tools: readonly MemberTool[] };

// Match Dave's information architecture and spelling, using our workspace links.
export const MEMBER_TOOL_GROUPS: readonly ToolGroup[] = [
  { title: "Your Workspace", tools: [
    { label: "Overview", route: "overview", icon: "portrait", description: "Return to your branded member dashboard." },
    { label: "DistraNet Impact", route: "impact", icon: "pulse", description: "Review trade, storefront and purchasing contribution." },
  ]},
  { title: "Trade & Inventory", tools: [
    { label: "Parts Search", route: "parts-search", icon: "opportunity", description: "Look up parts, branch availability and prices by stock class.", keywords: "sku part lookup connector search find" },
    { label: "Buy/Sell Opportunities", route: "buy-sell-opportunities", icon: "commerce", description: "Review buying and selling matches and track follow-up." },
    { label: "Dead & Excess Stock", route: "dead-excess-stock", icon: "operations", description: "Identify stock to recover and review sample values." },
    { label: "Shared Inventory", route: "shared-inventory", icon: "inventory", description: "Reconcile sales, purchases, fees, exemptions and inventory losses." },
    { label: "DemandSignal", route: "demand-signal", icon: "pulse", description: "Explore monthly search demand and part-level opportunities.", keywords: "demand signal" },
  ]},
  { title: "Performance", tools: [
    { label: "EDI Compliance", route: "edi-compliance", icon: "split", description: "Filter buying and selling connections and export the EDI matrix.", keywords: "electronic data interchange matrix connections acknowledgement" },
    { label: "Exception Reporting", route: "exception-reporting", icon: "governance", description: "Log and triage sample cases and review supporting evidence." },
    { label: "Member Scorecard", route: "member-scorecard", icon: "pulse", description: "Review weighted measures and the actions behind each score." },
    { label: "GPO Dashboard", route: "gpo-dashboard", icon: "finance", description: "Compare enrolled spend, fees and retained savings." },
    { label: "National Accounts", route: "national-accounts", icon: "locations", description: "Review national assignments, territories and program economics." },
  ]},
  { title: "Connected Knowledge", tools: [
    { label: "Industry Data Pool", route: "industry-data-pool", icon: "operations", description: "Review illustrative manufacturer coverage and data quality." },
    { label: "Communications", route: "communications", icon: "statements", description: "Read sample notices and preview a team communication." },
    { label: "Downloads", route: "downloads", icon: "download", description: "Find report exports, document slots and example files." },
  ]},
  { title: "Member Administration", tools: [
    { label: "Email Recipients", route: "email-recipients", icon: "statements", description: "Preview buy, sell and digest preferences without sending email." },
    { label: "Locations", route: "locations", icon: "locations", description: "Review sample shipping locations and branch status." },
    { label: "Manage Users", route: "manage-users", icon: "portrait", description: "Explore role and section-access examples with no live accounts." },
  ]},
  { title: "Network Administration", tools: [
    { label: "Manage Network", route: "manage-network", icon: "governance", description: "Explore sample organization, manufacturer and division registries." },
  ]},
];

export function memberToolHref(member: MemberSlug, period: MemberOverviewPeriod, tool: MemberTool) {
  return memberWorkspacePeriodHref(member, tool.route, period);
}

export function filterMemberTools(query: string) {
  const tokens = query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  return MEMBER_TOOL_GROUPS.map(group => ({ ...group, tools: group.tools.filter(tool => {
    const search = [group.title, tool.label, tool.description, tool.keywords].join(" ").toLowerCase();
    return tokens.every(token => search.includes(token));
  }) })).filter(group => group.tools.length);
}

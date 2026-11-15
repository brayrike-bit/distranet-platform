import type { MemberOverviewPeriod, MemberSlug } from "@/domain/member-hub/types";
import { REPORT_PERIODS, withDemonstrationPeriod } from "./demonstration-report-export";
import { memberWorkspaceHref, type MemberWorkspaceId } from "./member-workspace-routes";

/**
 * Build a fresh destination from the selected company and workspace. Only the
 * reporting period travels between pages/companies; never forward record IDs,
 * company-scoped filters, or a previous page's hash. This is not authorization.
 */
export function memberWorkspacePeriodHref(
  member: MemberSlug,
  workspace: MemberWorkspaceId,
  period: MemberOverviewPeriod,
): string {
  return withDemonstrationPeriod(memberWorkspaceHref(member, workspace), period);
}

export function memberDirectoryPeriodHref(period: MemberOverviewPeriod): string {
  if (!REPORT_PERIODS.includes(period)) throw new Error("Expected a valid reporting period.");
  return `/member-hub?period=${period}`;
}

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  listMemberTenantSlugs,
  resolveMemberTenant,
} from "@/brands/member-tenants";
import { MemberWorkspacePage } from "@/features/member-hub/workspace/MemberWorkspacePage";
import { MemberWorkspaceShell } from "@/features/member-hub/workspace/MemberWorkspaceShell";
import { MemberAdminDesk } from "@/features/member-hub/workspace/parity/MemberAdminDesk";
import { MemberNetworkPrograms } from "@/features/member-hub/workspace/parity/MemberNetworkPrograms";
import { MemberPerformanceDesk } from "@/features/member-hub/workspace/parity/MemberPerformanceDesk";
import { MemberResourceCenter } from "@/features/member-hub/workspace/parity/MemberResourceCenter";
import { MemberStockDesk } from "@/features/member-hub/workspace/parity/MemberStockDesk";
import {
  MEMBER_DASHBOARD_SEGMENTS,
  memberWorkspaceHref,
  resolveMemberWorkspace,
  type MemberDashboardId,
} from "@/features/member-hub/workspace/member-workspace-routes";

export function generateStaticParams() {
  return listMemberTenantSlugs().flatMap((member) =>
    MEMBER_DASHBOARD_SEGMENTS.map((workspace) => ({ member, workspace })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ member: string; workspace: string }>;
}): Promise<Metadata> {
  const { member, workspace } = await params;
  const tenant = resolveMemberTenant(member);
  const route = resolveMemberWorkspace(workspace);
  if (!tenant || !route || route.id === "overview") {
    return { title: "Member workspace unavailable" };
  }
  return {
    title: `${route.label} — ${tenant.displayName} — Distranet Member OS Prototype`,
    description: `${route.description} Publicly reachable aggregate-only presentation prototype for ${tenant.displayName}, with no live authentication.`,
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function MemberDashboardRoute({
  params,
}: {
  params: Promise<{ member: string; workspace: string }>;
}) {
  const { member, workspace } = await params;
  const tenant = resolveMemberTenant(member);
  const route = resolveMemberWorkspace(workspace);
  if (!tenant || !route || route.id === "overview") notFound();

  if (workspace !== route.segment) {
    redirect(memberWorkspaceHref(tenant.slug, route.id));
  }

  const dashboard = route.id as MemberDashboardId;
  const content = (() => {
    switch (dashboard) {
      case "trade-desk": return <MemberStockDesk member={tenant.slug} name={tenant.displayName} key={tenant.slug} />;
      case "programs": return <MemberNetworkPrograms tenant={tenant} key={tenant.slug} />;
      case "performance": return <MemberPerformanceDesk member={tenant.slug} key={tenant.slug} />;
      case "resources": return <MemberResourceCenter member={tenant.slug} key={tenant.slug} />;
      case "administration": return <MemberAdminDesk member={tenant.slug} name={tenant.displayName} key={tenant.slug} />;
      default: return <MemberWorkspacePage tenant={tenant} workspace={dashboard} />;
    }
  })();
  return (
    <MemberWorkspaceShell tenant={tenant} activeWorkspace={dashboard}>
      {content}
    </MemberWorkspaceShell>
  );
}

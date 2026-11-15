import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  listMemberTenantSlugs,
  resolveMemberTenant,
} from "@/brands/member-tenants";
import { MemberWorkspacePage } from "@/features/member-hub/workspace/MemberWorkspacePage";
import { MemberWorkspaceShell } from "@/features/member-hub/workspace/MemberWorkspaceShell";
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
  return (
    <MemberWorkspaceShell tenant={tenant} activeWorkspace={dashboard}>
      <MemberWorkspacePage tenant={tenant} workspace={dashboard} />
    </MemberWorkspaceShell>
  );
}

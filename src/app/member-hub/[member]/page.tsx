import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  listMemberTenantSlugs,
  resolveMemberTenant,
} from "@/brands/member-tenants";
import { MemberOperatingOverview } from "@/features/member-hub/MemberOperatingOverview";
import { MemberWorkspaceShell } from "@/features/member-hub/workspace/MemberWorkspaceShell";

export function generateStaticParams() {
  return listMemberTenantSlugs().map((member) => ({ member }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ member: string }>;
}): Promise<Metadata> {
  const { member } = await params;
  const tenant = resolveMemberTenant(member);
  if (!tenant) return { title: "Member workspace unavailable" };
  return {
    title: `${tenant.displayName} — Distranet Member OS Prototype`,
    description: `Publicly reachable presentation prototype for ${tenant.displayName}; illustrative aggregate data only, with no live authentication.`,
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function MemberTenantWorkspace({
  params,
}: {
  params: Promise<{ member: string }>;
}) {
  const { member } = await params;
  const tenant = resolveMemberTenant(member);
  if (!tenant) notFound();
  return (
    <MemberWorkspaceShell tenant={tenant} activeWorkspace="overview">
      <MemberOperatingOverview tenant={tenant} />
    </MemberWorkspaceShell>
  );
}

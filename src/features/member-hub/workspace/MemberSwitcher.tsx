"use client";

import { useRouter } from "next/navigation";
import { MEMBER_DIRECTORY } from "@/brands/member-directory";
import type { MemberOverviewPeriod, MemberSlug } from "@/domain/member-hub/types";
import type { MemberWorkspaceId } from "./member-workspace-routes";
import { memberWorkspacePeriodHref } from "./member-workspace-navigation";

export function MemberSwitcher({ member, workspace, period, id }: { member: MemberSlug; workspace: MemberWorkspaceId; period: MemberOverviewPeriod; id: string }) {
  const router = useRouter();

  function switchMember(value: string) {
    const selected = MEMBER_DIRECTORY.find(item => item.slug === value);
    if (!selected || selected.slug === member) return;
    router.push(memberWorkspacePeriodHref(selected.slug, workspace, period));
  }

  return <label htmlFor={id} style={{ display: "grid", gap: 6, fontSize: 10, fontWeight: 650, color: "#4c626d" }}>
    Preview company
    <select id={id} value={member} onChange={event => switchMember(event.target.value)} style={{ width: "100%", minWidth: 0, minHeight: 44, font: "inherit", fontSize: 12, color: "#14232b", background: "#fff", border: "1px solid #b8c8d1", borderRadius: 6, padding: "8px 10px" }}>
      {MEMBER_DIRECTORY.map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}
    </select>
  </label>;
}

"use client";

import type { MemberOverviewPeriod, MemberSlug } from "@/domain/member-hub/types";
import { MEMBER_TOOL_GROUPS, memberToolHref } from "./parity/member-tool-directory";
import type { MemberWorkspaceId } from "./member-workspace-routes";
import styles from "./MemberWorkspaceShell.module.css";

const groups = MEMBER_TOOL_GROUPS;

export function MemberWorkspaceMobileNav({
  tenantSlug,
  activeWorkspace,
  period,
}: {
  tenantSlug: MemberSlug;
  activeWorkspace: MemberWorkspaceId;
  period: MemberOverviewPeriod;
}) {
  const current = groups.flatMap(group => group.tools).find(tool => tool.route === activeWorkspace);
  const currentHref = current ? memberToolHref(tenantSlug, period, current) : "";
  return <form className={styles.mobileToolMenu} aria-label="Member workspace pages" onSubmit={event => {
    event.preventDefault();
    const item = new FormData(event.currentTarget).get("tool");
    const target = groups.flatMap(group => group.tools).find(tool => memberToolHref(tenantSlug, period, tool) === item);
    if (target) window.location.assign(memberToolHref(tenantSlug, period, target));
  }}>
    <label htmlFor="member-workspace-tool">Member tools</label>
    <select id="member-workspace-tool" name="tool" key={currentHref} defaultValue={currentHref} required>
      <option value="">Choose a member tool</option>
      {groups.map(group => <optgroup key={group.title} label={group.title}>
        {group.tools.map(tool => <option key={tool.label} value={memberToolHref(tenantSlug, period, tool)}>{tool.label}</option>)}
      </optgroup>)}
    </select>
    <button type="submit">Open</button>
  </form>;
}

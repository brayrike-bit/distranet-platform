"use client";

import Link from "next/link";
import { useState } from "react";
import type { MemberSlug } from "@/domain/member-hub/types";
import { MemberIcon } from "../../components/MemberIcon";
import { useMemberReportingPeriod } from "../MemberWorkspaceShell";
import { Section, styles, WorkspaceIntro } from "./ParityUI";
import { filterMemberTools, memberToolHref } from "./member-tool-directory";
import directory from "./MemberToolDirectory.module.css";

export function MemberToolDirectory({ member }: { member: MemberSlug }) {
  const { period } = useMemberReportingPeriod();
  const [query, setQuery] = useState("");
  const groups = filterMemberTools(query);
  const matches = groups.reduce((sum, group) => sum + group.tools.length, 0);
  return <div className={styles.workspace}>
    <WorkspaceIntro icon="operations" title="All member tools" description="Find the exact workflow you need. Everything here uses illustrative data; no live member records are connected." />
    <div className={directory.find}>
      <label className={styles.field}>Find a member tool<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Try parts, EDI, GPO or downloads" /></label>
      {query && <button className={styles.button} onClick={() => setQuery("")}>Clear search</button>}
      <span role="status">{matches} {matches === 1 ? "tool" : "tools"}</span>
    </div>
    {!groups.length && <p className={styles.note}>No tools matched. Try the name of a workflow or clear the search to show everything.</p>}
    {groups.map(group => <Section key={group.title} id={group.title.toLowerCase().replace(/[^a-z]+/g, "-")} title={group.title}>
      <div className={styles.cards}>{group.tools.map(tool => {
        const href = memberToolHref(member, period, tool);
        const content = <><span className={directory.icon}><MemberIcon name={tool.icon} /></span>
          <span><strong>{tool.label}</strong><small>{tool.description}</small></span><span aria-hidden="true">↗</span></>;
        return <Link key={tool.label} className={directory.tool} href={href} prefetch={false}>{content}</Link>;
      })}</div>
    </Section>)}
  </div>;
}

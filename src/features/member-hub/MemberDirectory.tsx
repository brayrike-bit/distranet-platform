"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type CSSProperties } from "react";
import { MEMBER_DIRECTORY } from "@/brands/member-directory";
import type { MemberOverviewPeriod } from "@/domain/member-hub/types";
import { MemberLogo } from "./components/MemberLogo";
import { parseDemonstrationPeriod } from "./workspace/demonstration-report-export";
import { memberWorkspacePeriodHref } from "./workspace/member-workspace-navigation";
import styles from "./MemberDirectory.module.css";

export function MemberDirectory() {
  return <Suspense fallback={<MemberDirectoryView period="YTD" />}><DirectoryWithPeriod /></Suspense>;
}

function DirectoryWithPeriod() {
  const params = useSearchParams();
  return <MemberDirectoryView period={parseDemonstrationPeriod(params.get("period"))} />;
}

function MemberDirectoryView({ period }: { period: MemberOverviewPeriod }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLocaleLowerCase();
  const members = MEMBER_DIRECTORY.filter(member => [member.name, member.shortName, member.headquarters, ...member.capabilities].join(" ").toLocaleLowerCase().includes(normalized));
  return <main className={styles.page} id="main-content" tabIndex={-1}>
    <header className={styles.header}>
      <Link className={styles.network} href="/">DISTRA<span>NET</span><small>MEMBER WORKSPACES</small></Link>
      <Link className={styles.back} href="/member-access">Member access <span aria-hidden="true">↗</span></Link>
    </header>
    <section className={styles.intro} aria-labelledby="member-directory-title">
      <div><p className={styles.eyebrow}>21 companies. One connected network.</p><h1 id="member-directory-title">Your company.<br /><span>Your operating view.</span></h1><p>One familiar workspace, in your own identity. Explore your commerce, orders, financials, inventory, and network contribution.</p></div>
      <aside className={styles.context}><span>THE MEMBER EXPERIENCE</span><strong>Local identity.<br />Shared intelligence.</strong><p>Each company keeps its own brand, its own operating context, and its own reporting view.</p><small>Design preview · demonstration data</small></aside>
    </section>
    <section aria-label="Choose a member workspace" className={styles.directory}>
      <div className={styles.toolbar}><label htmlFor="member-search">Find your company<input id="member-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Company, location, or capability" autoComplete="off" /></label><span role="status" aria-live="polite">{members.length} of {MEMBER_DIRECTORY.length} members</span></div>
      <div className={styles.grid}>
        {members.map((member, index) => <article key={member.slug} className={styles.member} style={{ "--member-brand": member.primary } as CSSProperties} data-member={member.slug}>
          <div className={styles.memberTop}><span>{String(MEMBER_DIRECTORY.indexOf(member) + 1).padStart(2, "0")}</span><div className={styles.swatches} aria-label={`Brand colors ${member.primary} and ${member.secondary}`}><i style={{ background: member.primary }} /><i style={{ background: member.secondary }} /></div></div>
          <div className={styles.logoSlot}><MemberLogo tenant={{ displayName: member.name, logo: { src: member.logo, alt: member.name, width: 500, height: 160, background: member.logoBackground } }} width={240} height={88} priority={index < 6} /></div>
          <h2>{member.name}</h2><p className={styles.location}>{member.headquarters}</p>
          <div className={styles.capabilities}>{member.capabilities.map(capability => <span key={capability}>{capability}</span>)}</div>
          <Link className={styles.open} href={memberWorkspacePeriodHref(member.slug, "overview", period)} aria-label={`Open ${member.name} workspace`}>Open workspace <span aria-hidden="true">↗</span></Link>
        </article>)}
      </div>
      {!members.length && <div className={styles.empty}><h2>No companies found</h2><p>Try a company name, headquarters location, or a capability such as hydraulics.</p><button type="button" onClick={() => setQuery("")}>Show all members</button></div>}
    </section>
    <footer className={styles.footer}><strong>Workspace preview</strong><p>Company branding is based on the members’ official websites. Dashboard values are illustrative. Live reporting and authenticated access will be connected separately.</p><a href="https://www.distranet.com/member-directory.php" target="_blank" rel="noreferrer">Official member directory ↗</a></footer>
  </main>;
}

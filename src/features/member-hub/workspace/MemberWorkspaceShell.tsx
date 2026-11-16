"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createContext, Suspense, useContext, useEffect, useRef, type ReactNode } from "react";
import { memberBrandVariables } from "@/brands/member-theme";
import type { MemberOverviewPeriod, MemberTenantBrand } from "@/domain/member-hub/types";
import { MemberLogo } from "../components/MemberLogo";
import { MemberSwitcher } from "./MemberSwitcher";
import { MemberIcon } from "../components/MemberIcon";
import { MemberWorkspaceMobileNav } from "./MemberWorkspaceMobileNav";
import {
  MEMBER_WORKSPACE_ROUTES,
  type MemberWorkspaceId,
} from "./member-workspace-routes";
import { memberDirectoryPeriodHref, memberWorkspacePeriodHref } from "./member-workspace-navigation";
import { parseDemonstrationPeriod, withDemonstrationPeriod } from "./demonstration-report-export";
import { MEMBER_TOOL_GROUPS, memberToolHref } from "./parity/member-tool-directory";
import styles from "./MemberWorkspaceShell.module.css";

type ReportingPeriodContext = {
  period: MemberOverviewPeriod;
  selectPeriod: (period: MemberOverviewPeriod) => void;
};

const MemberReportingPeriodContext = createContext<ReportingPeriodContext | null>(null);

export function useMemberReportingPeriod() {
  const context = useContext(MemberReportingPeriodContext);
  if (!context) throw new Error("Member reporting controls require the workspace shell.");
  return context;
}

function selectReportingPeriod(period: MemberOverviewPeriod) {
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (new URLSearchParams(window.location.search).get("period") === period) return;
  // Next's native-history integration updates useSearchParams without a reload.
  // pushState keeps each selected window reachable with Back and Forward.
  window.history.pushState(null, "", withDemonstrationPeriod(current, period));
}

type WorkspaceShellProps = {
  tenant: MemberTenantBrand;
  activeWorkspace: MemberWorkspaceId;
  children: ReactNode;
};

export function MemberWorkspaceShell(props: WorkspaceShellProps) {
  return (
    // Keep the existing illustrative YTD layout in prerendered HTML. The URL
    // reader resolves under Suspense on hydration, then provides one period to
    // the controls, figures, navigation, and company switchers together.
    <Suspense fallback={<WorkspaceShellFrame {...props} period="YTD" />}>
      <UrlReportingWorkspaceShell {...props} />
    </Suspense>
  );
}

function UrlReportingWorkspaceShell(props: WorkspaceShellProps) {
  const searchParams = useSearchParams();
  return <WorkspaceShellFrame {...props} period={parseDemonstrationPeriod(searchParams.get("period"))} />;
}

function WorkspaceShellFrame({
  tenant,
  activeWorkspace,
  children,
  period,
}: WorkspaceShellProps & { period: MemberOverviewPeriod }) {
  const activeRoute = MEMBER_WORKSPACE_ROUTES.find(
    (route) => route.id === activeWorkspace,
  ) ?? MEMBER_WORKSPACE_ROUTES[0];
  const sidebarNavigation = useRef<HTMLElement>(null);
  useEffect(() => {
    const navigation = sidebarNavigation.current;
    const active = navigation?.querySelector('[aria-current]');
    if (!navigation || !active || navigation.clientHeight === 0) return;
    const menuBounds = navigation.getBoundingClientRect();
    const routeBounds = active.getBoundingClientRect();
    if (routeBounds.top < menuBounds.top) navigation.scrollTop += routeBounds.top - menuBounds.top - 8;
    if (routeBounds.bottom > menuBounds.bottom) navigation.scrollTop += routeBounds.bottom - menuBounds.bottom + 8;
  }, [activeWorkspace]);

  const frame = (
    <div className={styles.shell} style={memberBrandVariables(tenant)} data-member-workspace={tenant.slug}>
      <aside className={styles.sidebar} aria-label="Member workspace navigation">
        <div className={styles.memberBrand}>
          <MemberLogo tenant={tenant} width={208} height={74} priority />
          <p>{tenant.workspaceLabel}</p>
        </div>

        <div className={styles.memberSwitcher}><MemberSwitcher member={tenant.slug} workspace={activeWorkspace} period={period} id="desktop-member-switcher" /></div>

        <div className={styles.productBrand}>
          <span>
            <small>Member network</small>
            <strong>DISTRA<i>NET</i></strong>
          </span>
        </div>

        <nav ref={sidebarNavigation} className={styles.navigation} aria-label="Member workspace pages">
          {MEMBER_TOOL_GROUPS.map((group) => (
            <div className={styles.navigationGroup} key={group.title}>
              <p>{group.title}</p>
              {group.tools.map(tool => {
                const isActive = tool.route === activeWorkspace;
                const href = memberToolHref(tenant.slug, period, tool);
                const content = <><MemberIcon name={tool.icon} /><span><strong>{tool.label}</strong></span></>;
                const className = isActive ? styles.activeRoute : undefined;
                return <Link key={tool.label} href={href} aria-current={isActive ? "page" : undefined} className={className} prefetch={false}>{content}</Link>;
              })}
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFoot}>
          <MemberIcon name="lock" />
          <span>
            <strong>Publicly reachable prototype</strong>
            <small>No live authentication · aggregate only</small>
          </span>
        </div>
      </aside>

      <section className={styles.workspaceFrame}>
        <header className={styles.mobileHeader} data-member-workspace-sticky-header>
          <div className={styles.mobileIdentity}>
            <MemberLogo tenant={tenant} width={146} height={54} priority />
            <span>
              <strong>Member workspace</strong>
              <small>Public prototype · no live auth</small>
            </span>
          </div>
          <div className={styles.mobileSwitcher}><MemberSwitcher member={tenant.slug} workspace={activeWorkspace} period={period} id="mobile-member-switcher" /></div>
          <MemberWorkspaceMobileNav
            tenantSlug={tenant.slug}
            activeWorkspace={activeWorkspace}
            period={period}
          />
        </header>

        <header className={styles.topbar} data-member-workspace-sticky-header>
          <div>
            <p>
              <Link href={memberWorkspacePeriodHref(tenant.slug, "overview", period)}>Member OS</Link>
              <span>/</span>
              {activeRoute.label}
            </p>
            <span>{tenant.displayName}</span>
          </div>
          <div className={styles.topbarStatus}>
            <span className={styles.prototypeStatus}>
              <i /> Public prototype · no live auth
            </span>
            <span className={styles.viewerBadge}>{tenant.demoViewer.initials}</span>
            <span className={styles.viewerName}>
              <strong>{tenant.demoViewer.name}</strong>
              <small>{tenant.demoViewer.roleLabel}</small>
            </span>
          </div>
        </header>

        <main id="main-content" className={styles.content} tabIndex={-1}>
          <div className={styles.demoNotice}><span><i />Demonstration data</span><p>Illustrative figures for workspace review. Live member reporting is not connected.</p><Link href={memberDirectoryPeriodHref(period)}>All members <span aria-hidden="true">↗</span></Link></div>
          <nav className={styles.quickTools} aria-label="Member tool shortcuts">
            {MEMBER_WORKSPACE_ROUTES.filter(route => route.id === "parts-search" || route.id === "edi-compliance" || route.id === "tools").map(route => (
              <Link key={route.id} href={memberWorkspacePeriodHref(tenant.slug, route.id, period)}
                aria-current={route.id === activeWorkspace ? "page" : undefined} prefetch={false}>
                <MemberIcon name={route.icon} />{route.label}
              </Link>
            ))}
          </nav>
          {children}
        </main>

        <footer className={styles.footer}>
          <span>Distranet Member OS · publicly reachable prototype</span>
          <p>
            No live authentication or server-enforced tenant isolation is connected. All values are illustrative aggregate examples and no production source is connected.
            Definitions and disputes require approval by Dave Rike and the Distranet board.
          </p>
        </footer>
      </section>
    </div>
  );

  return <MemberReportingPeriodContext.Provider value={{ period, selectPeriod: selectReportingPeriod }}>{frame}</MemberReportingPeriodContext.Provider>;
}

"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { MemberOverviewPeriod, MemberSlug } from "@/domain/member-hub/types";
import { MemberIcon } from "../components/MemberIcon";
import {
  MEMBER_WORKSPACE_ROUTES,
  type MemberWorkspaceId,
} from "./member-workspace-routes";
import { memberWorkspacePeriodHref } from "./member-workspace-navigation";

export function MemberWorkspaceMobileNav({
  tenantSlug,
  activeWorkspace,
  period,
}: {
  tenantSlug: MemberSlug;
  activeWorkspace: MemberWorkspaceId;
  period: MemberOverviewPeriod;
}) {
  const navigationRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const navigation = navigationRef.current;
    const activeRoute = navigation?.querySelector<HTMLElement>(
      '[aria-current="page"]',
    );
    if (!navigation || !activeRoute) return;

    navigation.scrollTo({
      left: Math.max(
        0,
        activeRoute.offsetLeft
          - (navigation.clientWidth - activeRoute.clientWidth) / 2,
      ),
      behavior: "auto",
    });
  }, [activeWorkspace]);

  return (
    <nav ref={navigationRef} aria-label="Member workspace pages">
      {MEMBER_WORKSPACE_ROUTES.map((route) => (
        <Link
          key={route.id}
          href={memberWorkspacePeriodHref(tenantSlug, route.id, period)}
          aria-current={route.id === activeWorkspace ? "page" : undefined}
        >
          <MemberIcon name={route.icon} />
          <span>{route.shortLabel}</span>
        </Link>
      ))}
    </nav>
  );
}

import Link from "next/link";
import type { MemberTenantBrand } from "@/domain/member-hub/types";
import { MemberIcon } from "../components/MemberIcon";
import { memberWorkspaceHref } from "./member-workspace-routes";
import styles from "./MemberWorkspaceEntryDock.module.css";

export function MemberWorkspaceEntryDock({ tenant }: { tenant: MemberTenantBrand }) {
  return (
    <Link
      className={styles.dock}
      href={memberWorkspaceHref(tenant.slug, "commerce")}
      aria-label={`Open ${tenant.displayName} member workspace`}
    >
      <MemberIcon name="reports" />
      <span>
        <small>Public prototype · no live auth</small>
        <strong>Open member workspace</strong>
      </span>
      <MemberIcon name="arrow" />
    </Link>
  );
}

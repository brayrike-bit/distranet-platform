import Image from "next/image";
import type { MemberTenantBrand } from "@/domain/member-hub/types";

/** A protected plate preserves white/inverted logos and never crops the mark. */
export function MemberLogo({ tenant, width = 180, height = 64, priority = false }: {
  tenant: Pick<MemberTenantBrand, "logo" | "displayName">;
  width?: number;
  height?: number;
  priority?: boolean;
}) {
  return <Image
    unoptimized
    loading="eager"
    src={tenant.logo.src}
    alt={tenant.logo.alt || tenant.displayName}
    width={tenant.logo.width}
    height={tenant.logo.height}
    sizes={`${width}px`}
    priority={priority}
    style={{ display: "block", width, height, maxWidth: "100%", objectFit: "contain", padding: 8, borderRadius: 6, background: tenant.logo.background ?? "#ffffff" }}
  />;
}

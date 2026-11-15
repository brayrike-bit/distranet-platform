import type { CSSProperties } from "react";
import type { MemberTenantBrand } from "@/domain/member-hub/types";

function channels(hex: string) {
  return [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
}

export function contrastRatio(a: string, b: string): number {
  const luminance = (hex: string) => channels(hex).map((n) => {
    const c = n / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }).reduce((sum, n, i) => sum + n * [0.2126, 0.7152, 0.0722][i], 0);
  const aa = luminance(a), bb = luminance(b);
  return (Math.max(aa, bb) + 0.05) / (Math.min(aa, bb) + 0.05);
}

/** Preserve hue while giving small labels and white-on-color buttons AA contrast. */
export function readableBrandColor(hex: string): string {
  let rgb = channels(hex);
  let candidate = hex;
  while (contrastRatio(candidate, "#ffffff") < 5) {
    rgb = rgb.map((n) => Math.max(0, Math.floor(n * 0.92)));
    candidate = `#${rgb.map((n) => n.toString(16).padStart(2, "0")).join("")}`;
  }
  return candidate;
}

export function readableOnDarkColor(hex: string): string {
  let rgb = channels(hex);
  let candidate = hex;
  while (contrastRatio(candidate, "#14232b") < 5) {
    rgb = rgb.map((n) => Math.min(255, Math.ceil(n + (255 - n) * 0.12)));
    candidate = `#${rgb.map((n) => n.toString(16).padStart(2, "0")).join("")}`;
  }
  return candidate;
}

export function memberTint(hex: string): string {
  return `#${channels(hex).map(n => Math.round(n * 0.05 + 255 * 0.95).toString(16).padStart(2, "0")).join("")}`;
}

export function memberBrandVariables(tenant: MemberTenantBrand): CSSProperties {
  const palette = tenant.palette;
  return {
    "--tenant-brand": palette.tenantBrand ?? palette.tenantPrimary,
    "--tenant-primary": palette.tenantPrimary,
    "--tenant-secondary": palette.tenantSecondary,
    "--tenant-on-dark": readableOnDarkColor(palette.tenantBrand ?? palette.tenantPrimary),
    "--tenant-on-dark-secondary": readableOnDarkColor(palette.tenantSecondary),
    "--tenant-ink": palette.tenantInk,
    "--tenant-tint": palette.tenantTint,
    "--tenant-logo-surface": tenant.logo.background ?? "#ffffff",
    "--network-signal": palette.networkSignal,
    "--positive": palette.positive,
    "--caution": palette.caution,
  } as CSSProperties;
}

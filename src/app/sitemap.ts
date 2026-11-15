import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://distranet-platform.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ["/", 1],
    ["/advantage", 0.9],
    ["/network", 0.9],
    ["/parts-gopher", 0.9],
    ["/distranet-direct", 0.9],
    ["/membership", 0.8],
    ["/about", 0.7],
  ].map(([path, priority]) => ({
    url: new URL(String(path), siteUrl).toString(),
    lastModified: new Date("2026-08-28T00:00:00-04:00"),
    changeFrequency: "monthly" as const,
    priority: Number(priority),
  }));
}

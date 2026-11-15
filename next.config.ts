import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // ExFAT creates ._ sidecars in the local optimizer cache. Static originals
  // avoid selecting metadata as an image; Vercel's Linux cache is unaffected.
  images: { unoptimized: process.env.VERCEL !== "1" },
  experimental: {
    cpus: 2,
    staticGenerationMaxConcurrency: 2,
    webpackMemoryOptimizations: true,
  },
};
export default nextConfig;

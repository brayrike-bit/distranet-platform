import type { Metadata } from "next";
import "./globals.css";
import "./asset-overrides.css";
import "./cinematic-runtime.css";
import "./public-editorial-overrides.css";
import { SiteChrome } from "@/components/SiteChrome";
import { CinematicRuntime } from "@/components/CinematicRuntime";
import {
  funnelDisplay,
  funnelSans,
  hubotSans,
  monaSans,
  monaSansMono,
  instrumentSans,
  sourceSans,
} from "./typefaces";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://distranet-platform.vercel.app"),
  title: "Distranet — Independent Strength. Connected.",
  description: "The member-owned operating network connecting independent fluid power distributors through collective scale, digital commerce, and shared intelligence.",
  applicationName: "Distranet",
  openGraph: {
    type: "website",
    siteName: "Distranet",
    title: "Distranet — Independent Strength. Connected.",
    description: "The member-owned operating network for independent fluid power distributors.",
  },
  twitter: {
    card: "summary",
    title: "Distranet — Independent Strength. Connected.",
    description: "The member-owned operating network for independent fluid power distributors.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth" className={`${monaSans.variable} ${hubotSans.variable} ${monaSansMono.variable} ${funnelSans.variable} ${funnelDisplay.variable} ${instrumentSans.variable} ${sourceSans.variable}`} suppressHydrationWarning><head><meta name="color-scheme" content="only light" /></head><body><a className="skip-link" href="#main-content">Skip to content</a><CinematicRuntime /><SiteChrome />{children}</body></html>;
}

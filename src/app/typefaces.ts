import localFont from "next/font/local";

export const instrumentSans = localFont({
  src: "./fonts/InstrumentSans-variable.ttf",
  variable: "--font-instrument-sans",
  weight: "400 700",
  display: "swap",
  adjustFontFallback: "Arial",
});

export const sourceSans = localFont({
  src: "./fonts/SourceSans3-variable.ttf",
  variable: "--font-source-sans",
  weight: "200 900",
  display: "swap",
  adjustFontFallback: "Arial",
});

export const funnelDisplay = localFont({
  src: "./fonts/FunnelDisplayVF-wght.woff2",
  variable: "--font-funnel-display",
  weight: "300 800",
  style: "normal",
  display: "swap",
  adjustFontFallback: "Arial",
});

export const funnelSans = localFont({
  src: [
    {
      path: "./fonts/FunnelSansVF-wght.woff2",
      weight: "300 800",
      style: "normal",
    },
    {
      path: "./fonts/FunnelSansVF-italic-wght.woff2",
      weight: "300 800",
      style: "italic",
    },
  ],
  variable: "--font-funnel-sans",
  display: "swap",
  adjustFontFallback: "Arial",
});

export const monaSans = localFont({
  src: "./fonts/MonaSansVF[opsz,wght].woff2",
  variable: "--font-mona-sans",
  weight: "200 900",
  style: "normal",
  display: "swap",
  adjustFontFallback: "Arial",
});

export const hubotSans = localFont({
  src: "./fonts/HubotSans-ExtraBold.woff2",
  variable: "--font-hubot-sans",
  weight: "800",
  style: "normal",
  display: "swap",
  adjustFontFallback: "Arial",
});

export const monaSansMono = localFont({
  src: "./fonts/MonaSansMonoVF[wght].woff2",
  variable: "--font-mona-sans-mono",
  weight: "200 900",
  style: "normal",
  display: "swap",
  preload: false,
});

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Distranet Advantage — Scale Without Surrender",
  description: "See how collective purchasing, inventory liquidity, digital commerce, and governed network intelligence amplify independent fluid power distributors.",
};

export default function AdvantageLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}

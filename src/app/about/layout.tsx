import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Distranet — Independent Strength, Connected",
  description: "Learn how Distranet's member-owned fluid power network is evolving from collective purchasing into connected commerce, inventory, and governed intelligence.",
};

export default function AboutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}

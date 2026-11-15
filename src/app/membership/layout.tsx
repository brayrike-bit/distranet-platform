import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Membership — Join the Distranet Network",
  description: "Explore the proposed fit, value systems, activation path, and member-governed operating principles behind Distranet membership.",
};

export default function MembershipLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}

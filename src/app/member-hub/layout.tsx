import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Distranet Member OS Prototype",
  description: "A publicly reachable, tenant-branded presentation prototype with illustrative aggregate data and no live authentication.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function MemberHubLayout({ children }: { children: ReactNode }) {
  return children;
}

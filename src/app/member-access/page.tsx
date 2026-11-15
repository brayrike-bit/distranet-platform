import type { Metadata } from "next";
import { MemberAccessExperience } from "./MemberAccessExperience";

export const metadata: Metadata = {
  title: "Member Login — Distranet",
  description: "Preview the Distranet member-login experience. No live authentication, tenant isolation, or production member data is connected.",
};

export default function MemberAccessPage() {
  return <MemberAccessExperience />;
}

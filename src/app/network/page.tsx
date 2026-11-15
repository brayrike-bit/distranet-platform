import type { Metadata } from "next";
import { networkPublicV3Chapters } from "./NetworkPublicV3";
import { PublicExperience } from "@/features/public-editorial/PublicExperience";

export const metadata: Metadata = {
  title: "The Member Network — Distranet",
  description: "Explore Distranet's leadership-confirmed network of 21 current fluid power companies and its working member roster.",
};

export default function NetworkPage() {
  return <PublicExperience route="network" chapters={networkPublicV3Chapters} />;
}

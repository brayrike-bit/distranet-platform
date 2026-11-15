import type { Metadata } from "next";
import { partsGopherPublicV3Chapters } from "./PartsGopherPublicV3";
import { PublicExperience } from "@/features/public-editorial/PublicExperience";

export const metadata: Metadata = {
  title: "Parts Gopher — Parker Demand, Routed Intelligently | Distranet",
  description:
    "See how the Parker-only Parts Gopher storefront turns digital demand into routed orders, member fulfillment, and measurable value across the Distranet network.",
};

export default function PartsGopherPage() {
  return <PublicExperience route="parts-gopher" chapters={partsGopherPublicV3Chapters} />;
}

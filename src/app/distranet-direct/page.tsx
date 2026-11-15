import type { Metadata } from "next";
import { distranetDirectPublicV3Chapters } from "./DistranetDirectPublicV3";
import { PublicExperience } from "@/features/public-editorial/PublicExperience";

export const metadata: Metadata = {
  title: "Distranet Direct — Multi-Brand Industrial Sourcing",
  description:
    "Explore Distranet Direct, the multi-brand sourcing storefront owned and operated by Distranet for products available through its supplier and network relationships.",
};

export default function DistranetDirectPage() {
  return <PublicExperience route="distranet-direct" chapters={distranetDirectPublicV3Chapters} />;
}

import { advantagePublicV3Chapters } from "./AdvantagePublicV3";
import { PublicExperience } from "@/features/public-editorial/PublicExperience";

export default function AdvantagePage() {
  return <PublicExperience route="advantage" chapters={advantagePublicV3Chapters} />;
}

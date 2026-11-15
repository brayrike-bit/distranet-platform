import { aboutPublicV3Chapters } from "./AboutPublicV3";
import { PublicExperience } from "@/features/public-editorial/PublicExperience";

export default function AboutPage() {
  return <PublicExperience route="about" chapters={aboutPublicV3Chapters} />;
}

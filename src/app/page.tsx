import { PublicExperience } from "@/features/public-editorial/PublicExperience";
import { homePublicV3Chapters } from "./home-v3";

export default function Home() {
  return <PublicExperience route="home" chapters={homePublicV3Chapters} />;
}

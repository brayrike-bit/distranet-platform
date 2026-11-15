import { membershipPublicV3Chapters } from "./MembershipPublicV3";
import { PublicExperience } from "@/features/public-editorial/PublicExperience";

export default function MembershipPage() {
  return <PublicExperience route="membership" chapters={membershipPublicV3Chapters} />;
}

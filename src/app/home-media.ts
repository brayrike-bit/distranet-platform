import type { DistranetCinematicMediaKey } from "@/components/cinematic/mediaManifest";

export type HomeChapterId =
  | "ignition"
  | "leverage"
  | "network"
  | "commerce"
  | "intelligence";

export type HomeChapter = {
  id: HomeChapterId;
  index: string;
  label: string;
  eyebrow: string;
  title: string;
  accent: string;
  summary: string;
  href: string;
  action: string;
  proof: readonly [string, string];
  media: {
    /** Typed cinematic asset contract; delivery status controls runtime mounting. */
    asset: DistranetCinematicMediaKey;
    slot: string;
    bakedCopy: string;
    focalPoint: string;
  };
};

/**
 * Public-home media contract. Every chapter owns a different physical world and
 * a different final master; none of these delivery paths may point to the same
 * file. Exact wordmarks and `bakedCopy` are composited into the approved master,
 * while the page repeats the language semantically for assistive technology.
 */
export const homeChapters: readonly HomeChapter[] = [
  {
    id: "ignition",
    index: "01 / 05",
    label: "Network ignition",
    eyebrow: "A member-owned fluid power network",
    title: "Independent strength.",
    accent: "Connected.",
    summary:
      "Distranet connects independent fluid power companies without erasing what makes each one valuable: local ownership, local expertise, and local relationships.",
    href: "/about",
    action: "Meet Distranet",
    proof: ["21 current member companies", "One connected operating network"],
    media: {
      asset: "homeNetworkIgnition",
      slot: "HOME_NETWORK_IGNITION",
      bakedCopy: "INDEPENDENT STRENGTH. CONNECTED.",
      focalPoint: "62% 50%",
    },
  },
  {
    id: "leverage",
    index: "02 / 05",
    label: "Collective advantage",
    eyebrow: "Combined demand / independent ownership",
    title: "Twenty-one members.",
    accent: "One buying position.",
    summary:
      "Member demand converges into stronger supplier relationships, coordinated programs, and value that returns to the companies that created it.",
    href: "/advantage",
    action: "See the collective advantage",
    proof: ["Shared purchasing leverage", "Value returned to members"],
    media: {
      asset: "advantageCollectiveLeverage",
      slot: "HOME_TWENTY_ONE_INTO_ONE",
      bakedCopy: "COLLECTIVE BUYING POWER. INDEPENDENT CONTROL.",
      focalPoint: "45% 52%",
    },
  },
  {
    id: "network",
    index: "03 / 05",
    label: "Distributed inventory",
    eyebrow: "Local stock / network-scale response",
    title: "Inventory stays distributed.",
    accent: "Response becomes connected.",
    summary:
      "Shared inventory visibility helps the network identify the closest in-stock member and coordinate split fulfillment when one order spans multiple companies.",
    href: "/network",
    action: "Explore the member network",
    proof: ["Closest in-stock matching", "Split fulfillment supported"],
    media: {
      asset: "networkDistributedInventory",
      slot: "HOME_DISTRIBUTED_INVENTORY",
      bakedCopy: "CLOSEST IN-STOCK MATCH. SPLIT FULFILLMENT.",
      focalPoint: "50% 52%",
    },
  },
  {
    id: "commerce",
    index: "04 / 05",
    label: "Parts Gopher commerce",
    eyebrow: "Parker demand / match / route / fulfill / measure",
    title: "An order becomes",
    accent: "member opportunity.",
    summary:
      "Parts Gopher turns Parker-only online demand into member fulfillment. Each participating member remains the seller and receives its part value plus its share of gross margin.",
    href: "/parts-gopher",
    action: "Enter the commerce engine",
    proof: ["Multi-member orders supported", "50 / 50 gross-margin split"],
    media: {
      asset: "partsGopherOrderOpportunity",
      slot: "HOME_ORDER_OPPORTUNITY",
      bakedCopy: "DEMAND ROUTED. MEMBER FULFILLED.",
      focalPoint: "50% 54%",
    },
  },
  {
    id: "intelligence",
    index: "05 / 05",
    label: "Member intelligence",
    eyebrow: "Private / attributed / governed",
    title: "Every dollar explained.",
    accent: "Every signal governed.",
    summary:
      "A private, member-branded operating view will connect aggregate demand, fulfillment, proceeds, benchmarks, and opportunity—without exposing customer identities.",
    href: "/member-access",
    action: "Preview member access",
    proof: ["Aggregate insight only", "Definitions governed by leadership"],
    media: {
      asset: "membershipIdentityMultiplied",
      slot: "HOME_MEMBER_OPERATING_SYSTEM",
      bakedCopy: "MEMBER OWNED. CAPABILITY MULTIPLIED.",
      focalPoint: "50% 45%",
    },
  },
] as const;

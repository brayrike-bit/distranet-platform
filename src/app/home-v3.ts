import type {
  PublicCinemaChapter,
  PublicCinemaVariant,
} from "@/features/public-cinema";

function homeFilm(
  id: string,
  portrait: boolean,
  focalPoint: string,
  portraitDelivery = false,
): PublicCinemaVariant {
  const aspect = portrait ? "9x16" : "16x9";
  const root = `/media/cinematic/public-v3/home/${id}${portrait && portraitDelivery ? "/portrait-v1" : ""}`;
  const sources = id === "h01-network-awakening"
    ? [{ src: `${root}/master-${aspect}-v1.mp4`, type: "video/mp4" as const }]
    : [
        { src: `${root}/master-${aspect}-v1.webm`, type: "video/webm" as const },
        { src: `${root}/master-${aspect}-v1.mp4`, type: "video/mp4" as const },
      ];
  return {
    poster: {
      src: `${root}/poster-resolve-${aspect}-v1.webp`,
      width: portrait ? 1080 : 1920,
      height: portrait ? 1920 : 1080,
      focalPoint,
    },
    sources,
  };
}

/**
 * Public-home film contract. Every chapter owns a distinct physical world and
 * a native desktop/portrait master. Paths stay fail-closed while delivery is
 * `planned`; the runtime will not request or expose absent media.
 */
export const homePublicV3Chapters: readonly PublicCinemaChapter[] = [
  {
    id: "home-network-awakening",
    index: "01 / 02",
    label: "Network awakening",
    eyebrow: "A member-owned fluid power network",
    title: "Independent strength.",
    accent: "Connected.",
    summary:
      "Distranet connects independent fluid power companies without erasing what makes each one valuable: local ownership, local expertise, and local relationships.",
    href: "/about",
    action: "Meet Distranet",
    facts: ["21 current member companies", "One member-owned operating network"],
    durationSeconds: 31.791667,
    fps: 24,
    runwayVh: 430,
    desktop: homeFilm("h01-network-awakening", false, "65% 50%"),
    mobile: homeFilm("h01-network-awakening", true, "50% 34%"),
    beats: [
      {
        id: "precision-core",
        label: "Precision core",
        progress: 0,
        description: "A machined hydraulic service aperture enters the frame.",
      },
      {
        id: "independent-inputs",
        label: "Independent inputs",
        progress: 0.3,
        description: "Independent fittings engage one stable distribution manifold.",
      },
      {
        id: "connected-pressure",
        label: "Connected pressure",
        progress: 0.66,
        description: "A contained red pressure signal travels through separate zones.",
      },
      {
        id: "network-resolve",
        label: "Member-owned network",
        progress: 1,
        description: "The operating network resolves on an exact Distranet identity plaque.",
      },
    ],
    delivery: "ready",
  },
  {
    id: "home-collective-position",
    index: "02 / 02",
    label: "Collective advantage",
    eyebrow: "Combined demand / independent control",
    title: "Twenty-one companies.",
    accent: "One buying position.",
    summary:
      "Member demand can form a stronger coordinated purchasing position while ownership, customer relationships, and operating judgment stay local.",
    href: "/advantage",
    action: "See the collective advantage",
    facts: ["Shared purchasing leverage", "Independent operations remain local"],
    durationSeconds: 10.041667,
    fps: 24,
    runwayVh: 410,
    desktop: homeFilm("h02-collective-position", false, "56% 50%"),
    mobile: homeFilm("h02-collective-position", true, "50% 40%", true),
    beats: [
      {
        id: "separate-demand",
        label: "Separate demand",
        progress: 0,
        description: "Independent demand inputs enter a disciplined industrial field.",
      },
      {
        id: "aggregate",
        label: "Aggregate",
        progress: 0.34,
        description: "The inputs engage one shared purchasing mechanism.",
      },
      {
        id: "compress",
        label: "Combined position",
        progress: 0.7,
        description: "Purchasing force is concentrated without merging company identities.",
      },
      {
        id: "return",
        label: "Return value",
        progress: 1,
        description: "Distinct return paths remain visible for independent members.",
      },
    ],
    delivery: "ready",
  },
  {
    id: "home-distributed-response",
    index: "03 / 05",
    label: "Distributed inventory",
    eyebrow: "Local stock / network-scale response",
    title: "Inventory stays distributed.",
    accent: "Response becomes connected.",
    summary:
      "Shared visibility supports closest in-stock matching and coordinated split fulfillment when one customer order spans more than one member.",
    href: "/network",
    action: "Explore the network",
    facts: ["Closest in-stock matching", "Split fulfillment supported"],
    durationSeconds: 30,
    fps: 24,
    runwayVh: 420,
    desktop: homeFilm("h03-distributed-response", false, "62% 50%"),
    mobile: homeFilm("h03-distributed-response", true, "50% 38%"),
    beats: [
      {
        id: "demand",
        label: "Demand detected",
        progress: 0,
        description: "One demand signal enters the shared operating field.",
      },
      {
        id: "availability",
        label: "Availability found",
        progress: 0.32,
        description: "Distributed stock signals identify eligible in-stock members.",
      },
      {
        id: "route",
        label: "Closest match",
        progress: 0.68,
        description: "The order routes toward the closest eligible availability.",
      },
      {
        id: "split",
        label: "Coordinated fulfillment",
        progress: 1,
        description: "Multiple member paths can resolve one split order.",
      },
    ],
    delivery: "planned",
  },
  {
    id: "home-member-opportunity",
    index: "04 / 05",
    label: "Parts Gopher commerce",
    eyebrow: "Parker demand / match / route / fulfill / measure",
    title: "An online order becomes",
    accent: "member opportunity.",
    summary:
      "Parts Gopher converts Parker-only digital demand into attributable fulfillment. Each participating member remains the seller for the part it fulfills.",
    href: "/parts-gopher",
    action: "Enter Parts Gopher",
    facts: ["Member is seller", "Multi-member orders supported"],
    durationSeconds: 30,
    fps: 24,
    runwayVh: 420,
    desktop: homeFilm("h04-member-opportunity", false, "61% 52%"),
    mobile: homeFilm("h04-member-opportunity", true, "50% 39%"),
    beats: [
      {
        id: "order",
        label: "Online demand",
        progress: 0,
        description: "A Parts Gopher order signal enters the routing mechanism.",
      },
      {
        id: "match",
        label: "Inventory match",
        progress: 0.3,
        description: "The request is matched against shared member availability.",
      },
      {
        id: "fulfill",
        label: "Member fulfillment",
        progress: 0.69,
        description: "Eligible member sellers receive distinct fulfillment paths.",
      },
      {
        id: "measure",
        label: "Attributed value",
        progress: 1,
        description: "The operating outcome resolves into governed member attribution.",
      },
    ],
    delivery: "planned",
  },
  {
    id: "home-governed-intelligence",
    index: "05 / 05",
    label: "Member intelligence",
    eyebrow: "Private / attributed / governed",
    title: "Every outcome explained.",
    accent: "Every signal governed.",
    summary:
      "The member portal is designed to connect aggregate demand, fulfillment, proceeds, benchmarks, and opportunity without exposing customer identities.",
    href: "/member-access",
    action: "Preview member access",
    facts: ["Aggregate customer insight only", "Member-branded private views"],
    durationSeconds: 30,
    fps: 24,
    runwayVh: 400,
    desktop: homeFilm("h05-governed-intelligence", false, "58% 48%"),
    mobile: homeFilm("h05-governed-intelligence", true, "50% 36%"),
    beats: [
      {
        id: "attribution",
        label: "Attribution",
        progress: 0,
        description: "Fulfillment signals enter a private member operating view.",
      },
      {
        id: "proceeds",
        label: "Proceeds",
        progress: 0.34,
        description: "Financial outcomes resolve into governed definitions.",
      },
      {
        id: "benchmarks",
        label: "Benchmarks",
        progress: 0.7,
        description: "Permitted network benchmarks reveal comparative context.",
      },
      {
        id: "decision",
        label: "Decision support",
        progress: 1,
        description: "The sequence resolves into a restrained member decision surface.",
      },
    ],
    delivery: "planned",
  },
] as const;

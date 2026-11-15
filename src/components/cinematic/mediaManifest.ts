export type CinematicVideoMimeType = "video/mp4" | "video/webm";

export type CinematicVideoSource = Readonly<{
  src: string;
  type: CinematicVideoMimeType;
}>;

export type CinematicPoster = Readonly<{
  src: string;
  width: number;
  height: number;
  /** CSS object-position value used when this poster is rendered as a cover image. */
  focalPoint?: string;
}>;

export type CinematicFilmVariant = Readonly<{
  id: string;
  poster: CinematicPoster;
  sources: readonly CinematicVideoSource[];
}>;

export type CinematicTimelineBeat = Readonly<{
  id: string;
  /** Normalized position in the authored film, from 0 through 1. */
  progress: number;
  label: string;
  /** Plain-language meaning of the frame for non-visual users. */
  description: string;
}>;

export type CinematicFilmAsset = Readonly<{
  id: string;
  title: string;
  description: string;
  durationSeconds: number;
  desktop: CinematicFilmVariant;
  mobile?: CinematicFilmVariant;
  timeline?: Readonly<{
    startSeconds?: number;
    endSeconds?: number;
  }>;
  beats: readonly CinematicTimelineBeat[];
  delivery: Readonly<{
    status: "planned" | "poster-ready" | "plate-ready" | "ready";
    visualSource:
      | "google-flow-veo-3.1"
      | "houdini"
      | "blender"
      | "live-webgl"
      | "hybrid";
    /** Exact marks/copy must be composited into pixels outside the generative model. */
    branding: "pending-composite" | "baked" | "none";
  }>;
}>;

export type CinematicMediaManifest = Readonly<
  Record<string, CinematicFilmAsset>
>;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function assertFilmAsset(asset: CinematicFilmAsset) {
  if (!asset.id.trim()) throw new Error("Cinematic film ids cannot be empty.");
  if (!Number.isFinite(asset.durationSeconds) || asset.durationSeconds <= 0) {
    throw new Error(`${asset.id}: durationSeconds must be greater than zero.`);
  }

  const start = asset.timeline?.startSeconds ?? 0;
  const end = asset.timeline?.endSeconds ?? asset.durationSeconds;
  if (start < 0 || end <= start || end > asset.durationSeconds) {
    throw new Error(
      `${asset.id}: timeline must fit inside the authored film duration.`,
    );
  }

  let previousProgress = -1;
  const beatIds = new Set<string>();
  asset.beats.forEach((beat) => {
    const progress = clamp(beat.progress, 0, 1);
    if (progress !== beat.progress || progress < previousProgress) {
      throw new Error(
        `${asset.id}: timeline beats must be ordered between 0 and 1.`,
      );
    }
    if (beatIds.has(beat.id)) {
      throw new Error(`${asset.id}: duplicate beat id ${beat.id}.`);
    }
    beatIds.add(beat.id);
    previousProgress = progress;
  });
}

/**
 * Preserves literal manifest keys while validating timeline invariants once at
 * module load. The manifest is intentionally a contract for the final masters:
 * planned paths do not imply that an asset has already passed visual review.
 */
export function defineCinematicMediaManifest<
  const T extends CinematicMediaManifest,
>(manifest: T): T {
  Object.values(manifest).forEach(assertFilmAsset);
  return manifest;
}

const film = (
  id: string,
  title: string,
  description: string,
  visualSource: CinematicFilmAsset["delivery"]["visualSource"],
  beats: CinematicFilmAsset["beats"],
): CinematicFilmAsset => {
  const root = `/media/cinematic/${id}`;
  return {
    id,
    title,
    description,
    durationSeconds: 8,
    timeline: { startSeconds: 0, endSeconds: 8 },
    desktop: {
      id: `${id}-16x9`,
      poster: {
        src: `${root}/poster-16x9.webp`,
        width: 1920,
        height: 1080,
        focalPoint: "50% 50%",
      },
      sources: [
        { src: `${root}/film-16x9.webm`, type: "video/webm" },
        { src: `${root}/film-16x9.mp4`, type: "video/mp4" },
      ],
    },
    mobile: {
      id: `${id}-9x16`,
      poster: {
        src: `${root}/poster-9x16.webp`,
        width: 1080,
        height: 1920,
        focalPoint: "50% 50%",
      },
      sources: [
        { src: `${root}/film-9x16.webm`, type: "video/webm" },
        { src: `${root}/film-9x16.mp4`, type: "video/mp4" },
      ],
    },
    beats,
    delivery: {
      status: "planned",
      visualSource,
      branding: "pending-composite",
    },
  };
};

/**
 * Route-film contract. Each entry owns a distinct physical visual world and
 * distinct accessible narration; none of these planned paths should be marked
 * ready until its final branded master and poster actually exist.
 */
export const distranetCinematicMedia = defineCinematicMediaManifest({
  networkMemberOwnership: {
    id: "home/manifold-network-flow-v1",
    title: "Member-owned network manifold",
    description:
      "A synthetic precision manifold assembles into a connected operating field while an exact Distranet lockup remains physically registered to its central plaque.",
    durationSeconds: 8,
    timeline: { startSeconds: 0, endSeconds: 8 },
    desktop: {
      id: "manifold-network-flow-16x9-v1",
      poster: {
        src: "/media/cinematic/home/manifold-network-flow-v1/poster-16x9-v1.webp",
        width: 1280,
        height: 720,
        focalPoint: "52% 52%",
      },
      sources: [{
        src: "/media/cinematic/home/manifold-network-flow-v1/master-16x9-v1.mp4",
        type: "video/mp4",
      }],
    },
    mobile: {
      id: "manifold-network-flow-9x16-v2",
      poster: {
        src: "/media/cinematic/home/manifold-network-flow-v1/poster-9x16-v2.webp",
        width: 720,
        height: 1280,
        focalPoint: "50% 50%",
      },
      sources: [{
        src: "/media/cinematic/home/manifold-network-flow-v1/master-9x16-v2.mp4",
        type: "video/mp4",
      }],
    },
    beats: [
      {
        id: "core",
        progress: 0,
        label: "Independent core",
        description: "A machined distribution core enters a true-black studio frame.",
      },
      {
        id: "assembly",
        progress: 0.32,
        label: "Member assembly",
        description: "Independent fittings and lines assemble around the stable center.",
      },
      {
        id: "pressure",
        progress: 0.64,
        label: "Connected pressure",
        description: "Restrained red pressure light moves through the connected manifold.",
      },
      {
        id: "resolve",
        progress: 1,
        label: "Member-owned network",
        description: "The branded manifold resolves into one stable connected system.",
      },
    ],
    delivery: {
      status: "plate-ready",
      visualSource: "hybrid",
      branding: "baked",
    },
  },
  homeNetworkIgnition: {
    ...film(
      "home-network-ignition",
      "Network ignition",
      "A precision hydraulic manifold wakes as twenty-one independent member signals converge, route, and leave stronger together.",
      "hybrid",
      [
        {
          id: "macro",
          progress: 0,
          label: "Precision",
          description:
            "An extreme macro view reveals a single machined hydraulic port.",
        },
        {
          id: "members",
          progress: 0.25,
          label: "Independent inputs",
          description:
            "Independent red pressure lines connect to a stable central manifold.",
        },
        {
          id: "convergence",
          progress: 0.5,
          label: "Connected strength",
          description:
            "The member signals converge through the shared network core.",
        },
        {
          id: "routing",
          progress: 0.75,
          label: "Responsive routing",
          description:
            "One demand signal divides into several real fulfillment paths.",
        },
        {
          id: "resolve",
          progress: 1,
          label: "Distranet",
          description:
            "The physical network holds in a finished, stable hero frame.",
        },
      ],
    ),
    desktop: {
      id: "home-network-ignition-16x9-v1",
      poster: {
        src:
          "/media/cinematic/home/network-ignition/network-ignition-keyframe-v1.jpeg",
        width: 1280,
        height: 720,
        focalPoint: "60% 50%",
      },
      sources: [
        {
          src: "/media/cinematic/home/network-ignition/master-16x9-v1.mp4",
          type: "video/mp4",
        },
      ],
    },
    mobile: undefined,
    delivery: {
      status: "plate-ready",
      visualSource: "hybrid",
      branding: "baked",
    },
  },
  advantageCollectiveLeverage: {
    ...film(
      "advantage-collective-leverage",
      "Twenty-one into one",
      "Twenty-one member inputs compress into one disciplined buying position, then return measurable value to the network.",
      "hybrid",
      [
        {
          id: "independent",
          progress: 0,
          label: "Independent",
          description:
            "Separate member inputs stand intact around a precision accumulator.",
        },
        {
          id: "combined",
          progress: 0.36,
          label: "Combined",
          description: "The inputs lock into one shared buying mechanism.",
        },
        {
          id: "leverage",
          progress: 0.7,
          label: "Leverage",
          description:
            "The mechanism compresses purchasing force into one concentrated signal.",
        },
        {
          id: "returned",
          progress: 1,
          label: "Value returned",
          description:
            "Value flows back to the independent members that own the network.",
        },
      ],
    ),
    desktop: {
      id: "advantage-buying-power-16x9-v1",
      poster: {
        src: "/media/cinematic/advantage/buying-power/poster-16x9-v1.jpeg",
        width: 1280,
        height: 720,
        focalPoint: "50% 50%",
      },
      sources: [{
        src: "/media/cinematic/advantage/buying-power/master-16x9-v1.mp4",
        type: "video/mp4",
      }],
    },
    mobile: undefined,
    delivery: {
      status: "plate-ready",
      visualSource: "hybrid",
      branding: "baked",
    },
  },
  networkDistributedInventory: {
    ...film(
      "network-distributed-inventory",
      "Distributed inventory",
      "A live-action fluid-power distribution center reveals how the closest stocked member and split fulfillment routes converge into one coordinated response.",
      "hybrid",
      [
        {
          id: "demand",
          progress: 0,
          label: "Demand",
          description:
            "An aggregate demand pulse enters the network without exposing customer identity.",
        },
        {
          id: "search",
          progress: 0.28,
          label: "Inventory search",
          description:
            "Available inventory illuminates across member locations.",
        },
        {
          id: "route",
          progress: 0.55,
          label: "Closest in stock",
          description:
            "The system chooses the nearest member location with stock.",
        },
        {
          id: "split",
          progress: 0.74,
          label: "Split fulfillment",
          description:
            "The route divides across multiple members when one location cannot fulfill the order.",
        },
      ],
    ),
    desktop: {
      id: "network-distributed-inventory-16x9-v2",
      poster: {
        src: "/media/cinematic/network/distributed-inventory-v2/poster-16x9-v2.jpg",
        width: 1280,
        height: 720,
        focalPoint: "50% 52%",
      },
      sources: [{
        src: "/media/cinematic/network/distributed-inventory-v2/master-16x9-v2.mp4",
        type: "video/mp4",
      }],
    },
    mobile: {
      id: "network-distributed-inventory-9x16-v2",
      poster: {
        src: "/media/cinematic/network/distributed-inventory-v2/poster-9x16-v2.jpg",
        width: 720,
        height: 1280,
        focalPoint: "50% 50%",
      },
      sources: [{
        src: "/media/cinematic/network/distributed-inventory-v2/master-9x16-v2.mp4",
        type: "video/mp4",
      }],
    },
    delivery: {
      status: "ready",
      visualSource: "hybrid",
      branding: "baked",
    },
  },
  partsGopherOrderOpportunity: {
    ...film(
      "parts-gopher-order-opportunity",
      "Order becomes opportunity",
      "A Parts Gopher order is matched against shared inventory, routed to member sellers, fulfilled, and measured.",
      "hybrid",
      [
        {
          id: "demand",
          progress: 0,
          label: "Demand",
          description:
            "A new aggregate order signal enters the storefront system.",
        },
        {
          id: "matched",
          progress: 0.25,
          label: "Matched",
          description: "Order lines match available shared inventory.",
        },
        {
          id: "routed",
          progress: 0.5,
          label: "Routed",
          description:
            "Each line routes to the closest qualified in-stock member.",
        },
        {
          id: "fulfilled",
          progress: 0.75,
          label: "Fulfilled",
          description: "One or more member sellers fulfill the order.",
        },
        {
          id: "measured",
          progress: 1,
          label: "Measured",
          description:
            "The resulting sales, margin, and fulfillment performance return to the member hub.",
        },
      ],
    ),
    desktop: {
      id: "parts-gopher-split-fulfillment-16x9-v1",
      poster: {
        src:
          "/media/cinematic/parts-gopher/split-fulfillment/poster-16x9-v1.jpeg",
        width: 1280,
        height: 720,
        focalPoint: "50% 50%",
      },
      sources: [
        {
          src:
            "/media/cinematic/parts-gopher/split-fulfillment/master-16x9-v1.mp4",
          type: "video/mp4",
        },
      ],
    },
    mobile: undefined,
    delivery: {
      status: "plate-ready",
      visualSource: "blender",
      branding: "baked",
    },
  },
  aboutMemberOwned: {
    ...film(
      "about-member-owned",
      "Member owned",
      "Twenty-one independent member identities assemble around a shared ownership seal without losing their individual character.",
      "hybrid",
      [
        {
          id: "members",
          progress: 0,
          label: "The members",
          description: "Individual member identity plates enter the scene.",
        },
        {
          id: "ownership",
          progress: 0.52,
          label: "Shared ownership",
          description: "The identities assemble into a member-owned network.",
        },
        {
          id: "independence",
          progress: 1,
          label: "Independent strength",
          description:
            "Each member remains visible within the completed Distranet system.",
        },
      ],
    ),
    desktop: {
      id: "about-member-heritage-16x9-v1",
      poster: {
        src: "/media/cinematic/about/member-heritage/poster-16x9-v1.jpeg",
        width: 1280,
        height: 720,
        focalPoint: "50% 50%",
      },
      sources: [{
        src: "/media/cinematic/about/member-heritage/master-16x9-v1.mp4",
        type: "video/mp4",
      }],
    },
    mobile: undefined,
    delivery: {
      status: "plate-ready",
      visualSource: "blender",
      branding: "baked",
    },
  },
  membershipIdentityMultiplied: {
    ...film(
      "membership-identity-multiplied",
      "Identity multiplied",
      "A member facility remains visually intact while purchasing, inventory, intelligence, and ecommerce capabilities dock around it.",
      "hybrid",
      [
        {
          id: "identity",
          progress: 0,
          label: "Your identity",
          description: "One independent member facility stands on its own.",
        },
        {
          id: "capabilities",
          progress: 0.5,
          label: "Network capabilities",
          description:
            "Shared network systems connect around the member without covering its identity.",
        },
        {
          id: "multiplied",
          progress: 1,
          label: "Multiplied",
          description:
            "The member operates with a larger connected capability field.",
        },
      ],
    ),
    desktop: {
      id: "membership-member-docking-16x9-v1",
      poster: {
        src: "/media/cinematic/membership/member-docking/poster-16x9-v1.jpeg",
        width: 1280,
        height: 720,
        focalPoint: "50% 50%",
      },
      sources: [
        {
          src: "/media/cinematic/membership/member-docking/master-16x9-v1.mp4",
          type: "video/mp4",
        },
      ],
    },
    mobile: undefined,
    delivery: {
      status: "plate-ready",
      visualSource: "hybrid",
      branding: "baked",
    },
  },
  memberAccessSecureEntry: {
    ...film(
      "member-access-secure-entry",
      "Member access concept",
      "A modeled credential passes through a tenant-specific access concept.",
      "hybrid",
      [
        {
          id: "credential",
          progress: 0,
          label: "Prototype credential",
          description:
            "A prototype member credential approaches the modeled gateway.",
        },
        {
          id: "modeled",
          progress: 0.56,
          label: "Modeled",
          description: "The access concept models a tenant and permitted role check.",
        },
        {
          id: "entry",
          progress: 1,
          label: "Tenant model",
          description:
            "The tenant-scoped prototype opens with aggregate-only illustrative data.",
        },
      ],
    ),
    desktop: {
      id: "member-access-secure-entry-16x9-v1",
      poster: {
        src:
          "/media/cinematic/member-access/secure-entry/poster-16x9-v1.jpeg",
        width: 1280,
        height: 720,
        focalPoint: "50% 50%",
      },
      sources: [{
        src: "/media/cinematic/member-access/secure-entry/master-16x9-v1.mp4",
        type: "video/mp4",
      }],
    },
    mobile: undefined,
    delivery: {
      status: "plate-ready",
      visualSource: "hybrid",
      branding: "baked",
    },
  },
  memberHubTenantArrivalAirHydroPower: {
    ...film(
      "member-hub-tenant-arrival",
      "Air Hydro Power tenant arrival",
      "Air Hydro Power identity resolves inside a physical fluid-power instrument while Distranet certifies the private member operating environment.",
      "blender",
      [
        {
          id: "member",
          progress: 0,
          label: "AHP identity",
          description:
            "The exact Air Hydro Power mark enters on a machined ceramic faceplate.",
        },
        {
          id: "network",
          progress: 0.48,
          label: "Network assembly",
          description:
            "Hydraulic, pneumatic, automation, and connector instruments assemble around the member identity.",
        },
        {
          id: "operating-view",
          progress: 1,
          label: "Distranet certified",
          description:
            "The completed instrument holds with the exact AHP and Distranet marks visible in the rendered pixels.",
        },
      ],
    ),
    desktop: {
      id: "member-hub-ahp-tenant-arrival-16x9-v1",
      poster: {
        src: "/media/cinematic/member-hub/ahp-tenant-arrival/poster-16x9-v1.jpeg",
        width: 1280,
        height: 720,
        focalPoint: "50% 50%",
      },
      sources: [{
        src: "/media/cinematic/member-hub/ahp-tenant-arrival/master-16x9-v1.mp4",
        type: "video/mp4",
      }],
    },
    mobile: {
      id: "member-hub-ahp-tenant-arrival-9x16-v1",
      poster: {
        src: "/media/cinematic/member-hub/ahp-tenant-arrival/poster-9x16-v1.jpeg",
        width: 720,
        height: 1280,
        focalPoint: "50% 50%",
      },
      sources: [{
        src: "/media/cinematic/member-hub/ahp-tenant-arrival/master-9x16-v1.mp4",
        type: "video/mp4",
      }],
    },
    delivery: {
      status: "plate-ready",
      visualSource: "blender",
      branding: "baked",
    },
  },
});

export type DistranetCinematicMediaKey = keyof typeof distranetCinematicMedia;

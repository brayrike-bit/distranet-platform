import type { MemberSlug, MemberTenantBrand } from "@/domain/member-hub/types";
import { distranetCinematicMedia } from "@/components/cinematic/mediaManifest";
import { AIR_HYDRO_POWER_MEMBER_DATA } from "@/features/member-hub/member-overview-data";
import { createMemberDemoData } from "@/features/member-hub/member-demo-data";
import { MEMBER_DIRECTORY, type MemberIdentity } from "./member-directory";
import { memberTint, readableBrandColor } from "./member-theme";

const REFERENCE_TENANTS = {
  "air-hydro-power": {
    id: "member-air-hydro-power",
    slug: "air-hydro-power",
    legalName: "Air Hydro Power, LLC",
    displayName: "Air Hydro Power",
    shortName: "AHP",
    workspaceLabel: "Executive operating view",
    logo: {
      src: "/brands/air-hydro-power/air-hydro-power.png",
      alt: "Air Hydro Power — Your Partner for Trusted Solutions",
      width: 540,
      height: 139,
    },
    operatingContext: {
      territory: {
        label: "Fulfillment territory",
        value: "Louisville · Lexington · Bowling Green",
        detail:
          "Other served territory is retained as a privacy-safe aggregate rollup.",
      },
      network: {
        label: "Network position",
        value: "Independent member seller",
        detail:
          "Primary allocation with privacy-safe network-assisted completion.",
      },
    },
    arrival: {
      film: "memberHubTenantArrivalAirHydroPower",
      motion: {
        scrollSpanVh: 285,
        pointerDepth: {
          perspective: 1550,
          travelX: 96,
          travelY: 62,
          travelZ: 150,
          rotation: 7.2,
          response: 0.14,
        },
      },
      eyebrow: "Air Hydro Power / public prototype",
      headlineLead: "AHP command.",
      headlineSignal: "Network amplified.",
      description:
        "Air Hydro Power stays visibly in command while Parts Gopher commerce, inventory intelligence, proceeds, and network benchmarks assemble around its operating footprint.",
      operatingLanes: ["Fluid power", "Automation", "Hose + connectors"],
      signals: [
        {
          label: "Parts Gopher economics",
          value: "50%",
          detail: "member share of gross margin",
        },
        {
          label: "Customer privacy",
          value: "0",
          detail: "customer identities exposed",
        },
        {
          label: "AHP solution lanes",
          value: "3",
          detail: "featured in this branded prototype",
        },
      ],
    },
    palette: {
      tenantPrimary: "#0068ad",
      tenantSecondary: "#ffb94d",
      tenantInk: "#071b2b",
      tenantTint: "#edf7ff",
      networkSignal: "#ed1c24",
      positive: "#08775a",
      caution: "#a86200",
    },
    demoViewer: {
      name: "Brayden Rike",
      initials: "BR",
      roleLabel: "Executive prototype",
    },
    data: AIR_HYDRO_POWER_MEMBER_DATA,
  },
} as const satisfies Partial<Record<MemberSlug, MemberTenantBrand>>;

function createTenant(identity: MemberIdentity): MemberTenantBrand {
  return {
    id: `member-${identity.slug}`,
    slug: identity.slug as MemberSlug,
    legalName: identity.name,
    displayName: identity.name,
    shortName: identity.shortName,
    workspaceLabel: "Member operating view",
    website: identity.website,
    brandReviewedAt: "2026-11-03",
    logo: { src: identity.logo, alt: identity.name, width: 500, height: 150, background: identity.logoBackground },
    operatingContext: {
      territory: { label: "Company base", value: identity.headquarters, detail: "Public company location. Reporting areas are illustrative aggregates." },
      network: { label: "Member network", value: "Distranet member", detail: "Listed in the official Distranet member directory." },
    },
    arrival: {
      film: null,
      motion: { scrollSpanVh: 180, pointerDepth: { perspective: 1550, travelX: 0, travelY: 0, travelZ: 0, rotation: 0, response: 0.14 } },
      eyebrow: `${identity.name} / member workspace`,
      headlineLead: "Your business.", headlineSignal: "Connected.",
      description: `A clear view of ${identity.name}'s Parts Gopher contribution, shared availability, and member economics.`,
      operatingLanes: identity.capabilities,
      signals: [],
    },
    palette: {
      tenantBrand: identity.primary,
      tenantPrimary: readableBrandColor(identity.primary),
      tenantSecondary: identity.secondary.toUpperCase() === "#FFFFFF" ? "#617889" : identity.secondary,
      tenantInk: "#14232B", tenantTint: memberTint(identity.primary), networkSignal: "#ED1C24", positive: "#08775A", caution: "#995B00",
    },
    demoViewer: { name: "Member preview", initials: identity.shortName.slice(0, 2).toUpperCase(), roleLabel: "Illustrative workspace" },
    data: createMemberDemoData(identity),
  };
}

export const MEMBER_TENANTS = Object.fromEntries(MEMBER_DIRECTORY.map((identity) => {
  const tenant = identity.slug === "air-hydro-power"
    ? { ...REFERENCE_TENANTS["air-hydro-power"], website: identity.website, brandReviewedAt: "2026-11-03", logo: { ...REFERENCE_TENANTS["air-hydro-power"].logo, background: identity.logoBackground } }
    : createTenant(identity);
  return [identity.slug, tenant];
})) as Record<MemberSlug, MemberTenantBrand>;

const tenantArrivalFilms = Object.values(MEMBER_TENANTS).map(
  (tenant) => tenant.arrival.film,
).filter((film) => film !== null);
if (new Set(tenantArrivalFilms).size !== tenantArrivalFilms.length) {
  throw new Error(
    "Every member tenant must own a unique pixel-branded arrival film.",
  );
}

Object.values(MEMBER_TENANTS).forEach((tenant) => {
  const arrivalFilm = tenant.arrival.film ? distranetCinematicMedia[tenant.arrival.film] : undefined;
  const contextFields = [
    tenant.operatingContext.territory.label,
    tenant.operatingContext.territory.value,
    tenant.operatingContext.territory.detail,
    tenant.operatingContext.network.label,
    tenant.operatingContext.network.value,
    tenant.operatingContext.network.detail,
  ];
  if (contextFields.some((field) => field.trim().length === 0)) {
    throw new Error(`${tenant.slug}: tenant operating context cannot be empty.`);
  }
  if (
    arrivalFilm && (arrivalFilm.delivery.branding !== "baked" ||
    !["plate-ready", "ready"].includes(arrivalFilm.delivery.status))
  ) {
    throw new Error(
      `${tenant.slug}: tenant arrival must use an approved pixel-branded film.`,
    );
  }
  if (arrivalFilm && !arrivalFilm.mobile) {
    throw new Error(`${tenant.slug}: tenant arrival requires a mobile film composition.`);
  }
  const { motion } = tenant.arrival;
  if (
    motion.scrollSpanVh < 180 || motion.scrollSpanVh > 420 ||
    motion.pointerDepth.perspective < 400 ||
    motion.pointerDepth.response <= 0 || motion.pointerDepth.response > 0.5
  ) {
    throw new Error(`${tenant.slug}: tenant arrival motion is outside the approved range.`);
  }
  const dataCollections = [
    tenant.data.demandSignals,
    tenant.data.acquisitionChannels,
    tenant.data.benchmarks,
    tenant.data.productPerformance,
    tenant.data.territoryPerformance,
    tenant.data.inventoryPerformance,
    tenant.data.fulfillmentPerformance,
    tenant.data.actionItems,
    tenant.data.services,
  ];
  if (dataCollections.some((collection) => collection.length === 0)) {
    throw new Error(`${tenant.slug}: tenant-scoped member data cannot be empty.`);
  }
});

export function getMemberTenant(slug: MemberSlug): MemberTenantBrand {
  return MEMBER_TENANTS[slug];
}

export function resolveMemberTenant(slug: string): MemberTenantBrand | undefined {
  if (!Object.prototype.hasOwnProperty.call(MEMBER_TENANTS, slug)) return undefined;
  return MEMBER_TENANTS[slug as MemberSlug];
}

export function listMemberTenantSlugs(): MemberSlug[] {
  return Object.keys(MEMBER_TENANTS) as MemberSlug[];
}

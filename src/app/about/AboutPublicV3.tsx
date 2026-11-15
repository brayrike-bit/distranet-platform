import Link from "next/link";
import { PublicFooter } from "@/components/PublicFooter";
import {
  PublicContinuum,
  PublicFilmSequence,
  type PublicCinemaChapter,
} from "@/features/public-cinema";
import styles from "./about-public-v3.module.css";

const aboutMedia = (film: string, portrait = false) => {
  const aspect = portrait ? "9x16" : "16x9";
  const root = `/media/cinematic/about/v3/${film}${portrait ? "/portrait-v1" : ""}`;
  return {
    poster: {
      src: `${root}/poster-resolve-${aspect}-v1.webp`,
      width: portrait ? 1080 : 1920,
      height: portrait ? 1920 : 1080,
      focalPoint: portrait ? "50% 66%" : "67% 52%",
    },
    sources: [
      {
        src: `${root}/master-${aspect}-v1.webm`,
        type: "video/webm" as const,
      },
      {
        src: `${root}/master-${aspect}-v1.mp4`,
        type: "video/mp4" as const,
      },
    ],
  } as const;
};

export const aboutPublicV3Chapters: readonly PublicCinemaChapter[] = [
  {
    id: "about-operating-evolution",
    index: "01 / 01",
    label: "Operating evolution",
    eyebrow: "Purchasing / inventory / commerce / intelligence",
    title: "Built to combine leverage.",
    accent: "Evolving to connect operations.",
    summary:
      "Member owners created a group purchasing organization to combine buying power while remaining independently operated. Shared inventory, Parts Gopher, and governed member visibility extend that original operating idea.",
    href: "#about-evolution",
    action: "Follow the operating evolution",
    facts: ["Member-owned origin confirmed", "No unsupported founding date or legal history"],
    durationSeconds: 6.041667,
    fps: 24,
    runwayVh: 300,
    desktop: aboutMedia("01-operating-evolution"),
    mobile: aboutMedia("01-operating-evolution"),
    beats: [
      {
        id: "purchasing",
        label: "Shared purchasing",
        progress: 0,
        description: "Independent machined blocks engage one shared purchasing fixture.",
      },
      {
        id: "inventory",
        label: "Connected inventory",
        progress: 0.34,
        description: "The same fixture expands into distinct connected inventory cells.",
      },
      {
        id: "commerce",
        label: "Routed demand",
        progress: 0.68,
        description: "The physical spine routes neutral demand carriers without customer or order data.",
      },
      {
        id: "governance",
        label: "Governed visibility",
        progress: 1,
        description: "The system resolves into a calm governance instrument with no invented analytics.",
      },
    ],
    delivery: "planned",
  },
  {
    id: "about-member-owned-future",
    index: "01 / 01",
    label: "Member-owned future",
    eyebrow: "Independent first / built forward",
    title: "Member owned.",
    accent: "Built forward.",
    summary:
      "Modernization is a leadership mandate and a build in progress: strengthen purchasing, improve connected operations, and make Parts Gopher contribution more visible under governed definitions.",
    href: "/network",
    action: "Explore the member network",
    facts: ["Modernization is in progress", "Member reporting is not represented as live"],
    durationSeconds: 10.041667,
    fps: 24,
    runwayVh: 240,
    desktop: aboutMedia("02-member-owned-future"),
    mobile: aboutMedia("02-member-owned-future", true),
    beats: [
      {
        id: "complete-spine",
        label: "Operating now",
        progress: 0,
        description: "The complete member-owned spine holds as a functioning current system.",
      },
      {
        id: "ownership",
        label: "Independent modules",
        progress: 0.36,
        description: "Distinct member modules remain visible around a stable shared center.",
      },
      {
        id: "forward-channel",
        label: "Forward channel",
        progress: 0.72,
        description: "One open service channel represents intentional modernization without claiming completion.",
      },
      {
        id: "resolve",
        label: "Built forward",
        progress: 1,
        description: "The exact member-owned identity plaque resolves at the shared route-transition frame.",
      },
    ],
    delivery: "ready",
  },
] as const;

const evolution = [
  ["Purchasing", "Member owners combine demand to strengthen a shared buying position."],
  ["Shared operations", "Inventory and operating information extend how independent companies respond together."],
  ["Digital demand", "Parts Gopher adds a Parker-only customer-facing commerce engine and attributable fulfillment."],
  ["Governed evidence", "Private member visibility is being built under board-approved definitions."],
] as const;

const principles = [
  ["Independent first", "Shared systems exist to strengthen local companies, not replace them."],
  ["Mutual support", "The network creates value when members participate with operating discipline."],
  ["Visible value", "Claims and member reporting need definitions, sources, dates, and accountable owners."],
  ["Build forward", "Modernization is intentional, staged, and never described as complete before it is verified."],
] as const;

export function AboutPublicV3() {
  return (
    <main id="main-content" className={styles.page} tabIndex={-1}>
      <PublicFilmSequence
        routeLabel="Distranet / About"
        chapters={aboutPublicV3Chapters.filter((chapter) => chapter.delivery === "ready")}
      />

      <PublicContinuum tone="governance" label="Member-owned / board governed / built forward">

      <section className={styles.origin} aria-labelledby="about-v3-origin">
        <p>WHY DISTRANET EXISTS</p>
        <h2 id="about-v3-origin">
          Independent companies wanted stronger buying power.
          <em>They built an organization they would own together.</em>
        </h2>
        <div>
          <p>
            Distranet began as a member-owned group purchasing organization.
            That origin remains the governing idea as the network adds shared
            inventory, digital commerce, and clearer private evidence.
          </p>
          <small>
            Founding year, exact legal entity name, headquarters, board roster,
            and corporate contact details remain unknown and are intentionally omitted.
          </small>
        </div>
      </section>

      <section
        id="about-evolution"
        className={styles.evolution}
        aria-labelledby="about-v3-evolution"
      >
        <header>
          <p>AN OPERATING EVOLUTION / NOT AN INVENTED TIMELINE</p>
          <h2 id="about-v3-evolution">The same member-owned idea, extended through new systems.</h2>
        </header>
        <ol>
          {evolution.map(([title, copy], index) => (
            <li key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.principles} aria-labelledby="about-v3-principles">
        <header>
          <p>OPERATING PRINCIPLES</p>
          <h2 id="about-v3-principles">A network earns trust through consequence and restraint.</h2>
        </header>
        <div>
          {principles.map(([title, copy], index) => (
            <article key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.governance} aria-labelledby="about-v3-governance">
        <div aria-hidden="true"><i /><i /><span /></div>
        <article>
          <p>OWNERSHIP / GOVERNANCE / LEADERSHIP</p>
          <h2 id="about-v3-governance">Definitions are governed—not improvised in a dashboard.</h2>
          <p>
            Member companies own Distranet. President Dave Rike and the board are
            the confirmed owners of metric definitions and reporting-dispute resolution.
          </p>
          <p>
            The current leadership mandate is to strengthen purchasing, modernize
            technology, improve member visibility, and make Parts Gopher
            contribution easier to understand.
          </p>
          <small>
            Working leadership copy · Dave's public biography, headshot, quote,
            appointment chronology, and final mandate wording require approval before launch.
          </small>
        </article>
      </section>

      <section className={styles.next} aria-labelledby="about-v3-next">
        <p>NEXT CHAPTER</p>
        <h2 id="about-v3-next">See the operating network—or consider adding your independent strength.</h2>
        <div>
          <Link href="/network">Explore the member network <span aria-hidden="true">↗</span></Link>
          <Link href="/membership">Consider membership <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
      </PublicContinuum>

      <PublicFooter />
    </main>
  );
}

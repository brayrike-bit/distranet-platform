import Link from "next/link";
import { PublicFooter } from "@/components/PublicFooter";
import {
  PublicContinuum,
  PublicFilmSequence,
  type PublicCinemaChapter,
} from "@/features/public-cinema";
import styles from "./advantage-public-v3.module.css";

const advantageMedia = (film: string, portrait = false) => {
  const aspect = portrait ? "9x16" : "16x9";
  const root = `/media/cinematic/advantage/v3/${film}${portrait ? "/portrait-v1" : ""}`;
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

export const advantagePublicV3Chapters: readonly PublicCinemaChapter[] = [
  {
    id: "advantage-collective-compression",
    index: "01 / 02",
    label: "Collective compression",
    eyebrow: "The Distranet Advantage",
    title: "Independence is not the constraint.",
    accent: "Isolation is.",
    summary:
      "Independent member demand can form a stronger coordinated purchasing position without turning local companies into branches of a corporate chain.",
    href: "#advantage-value-loop",
    action: "Follow the value loop",
    facts: ["Qualitative leverage claim", "Independent control remains local"],
    durationSeconds: 10.041667,
    fps: 24,
    runwayVh: 300,
    desktop: advantageMedia("01-collective-compression-photoreal"),
    mobile: advantageMedia("01-collective-compression-photoreal", true),
    beats: [
      {
        id: "independent-inputs",
        label: "Independent inputs",
        progress: 0,
        description: "Separate manufactured inputs enter one disciplined operating field.",
      },
      {
        id: "aggregate",
        label: "Aggregate",
        progress: 0.32,
        description: "The inputs engage one physically credible accumulator without losing their identity.",
      },
      {
        id: "shared-pressure",
        label: "Shared pressure",
        progress: 0.68,
        description: "A measured shared pressure state becomes visible without invented gauge values.",
      },
      {
        id: "resolve",
        label: "Collective position",
        progress: 1,
        description: "The system resolves into a stable collective position and an exact physical brand plaque.",
      },
    ],
    delivery: "ready",
  },
  {
    id: "advantage-value-return",
    index: "02 / 02",
    label: "Value return",
    eyebrow: "Collective power / local control",
    title: "Shared leverage.",
    accent: "Independent outcomes.",
    summary:
      "The operating idea is not centralization for its own sake. Coordinated strength should return through distinct member channels while ownership and local judgment remain intact.",
    href: "/network",
    action: "See the network in motion",
    facts: ["No savings rate implied", "No equal-return claim"],
    durationSeconds: 10.041667,
    fps: 24,
    runwayVh: 340,
    desktop: advantageMedia("02-value-return"),
    mobile: advantageMedia("02-value-return", true),
    beats: [
      {
        id: "charged-core",
        label: "Charged core",
        progress: 0,
        description: "The approved shared accumulator holds a contained operating state.",
      },
      {
        id: "regulators",
        label: "Independent regulators",
        progress: 0.34,
        description: "Separate output regulators open in a disciplined sequence.",
      },
      {
        id: "return-paths",
        label: "Return paths",
        progress: 0.7,
        description: "Controlled pressure returns through distinct manufactured channels.",
      },
      {
        id: "local-control",
        label: "Local control",
        progress: 1,
        description: "Each output remains intact as the shared signal reaches the transition aperture.",
      },
    ],
    delivery: "ready",
  },
] as const;

const valueLoop = [
  {
    index: "01",
    title: "Aggregate",
    copy: "Member demand forms a coordinated position while each company remains independently operated.",
  },
  {
    index: "02",
    title: "Negotiate",
    copy: "The network can pursue supplier programs from a stronger qualitative buying position.",
  },
  {
    index: "03",
    title: "Return value",
    copy: "Program outcomes return to participating members under the applicable governed terms.",
  },
] as const;

const operatingSignals = [
  ["Purchasing", "Combined demand supports coordinated supplier conversations."],
  ["Inventory", "Shared availability can extend how the network responds to demand."],
  ["Commerce", "Parts Gopher converts Parker-only digital demand into attributable fulfillment opportunity."],
  ["Intelligence", "Private aggregate evidence is planned to make member value easier to understand."],
] as const;

export function AdvantagePublicV3() {
  return (
    <main id="main-content" className={styles.page} tabIndex={-1}>
      <PublicFilmSequence
        routeLabel="Distranet / The Advantage"
        chapters={advantagePublicV3Chapters.filter((chapter) => chapter.delivery === "ready").slice(0, 1)}
      />

      <PublicContinuum tone="advantage" label="Collective pressure / independent return">
      <section className={styles.thesis} aria-labelledby="advantage-v3-thesis">
        <p>THE OPERATING THESIS</p>
        <h2 id="advantage-v3-thesis">
          Scale should strengthen an independent company.
          <em>It should not erase what made that company valuable.</em>
        </h2>
        <div>
          <p>
            Distranet connects the areas where coordination matters—purchasing,
            inventory, commerce, and governed intelligence—while member
            ownership, customer relationships, and operating judgment stay local.
          </p>
          <small>
            No numerical savings, supplier outcome, or purchasing-volume claim
            is presented here without an approved definition and current source.
          </small>
        </div>
      </section>

      <section
        id="advantage-value-loop"
        className={styles.valueLoop}
        aria-labelledby="advantage-v3-value-loop"
      >
        <header>
          <p>AGGREGATE → NEGOTIATE → RETURN VALUE</p>
          <h2 id="advantage-v3-value-loop">A stronger position is only useful when it returns to the member.</h2>
        </header>
        <ol>
          {valueLoop.map((step) => (
            <li key={step.index}>
              <span>{step.index}</span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.signals} aria-labelledby="advantage-v3-signals">
        <header>
          <p>FOUR DIFFERENT OPERATING SIGNALS</p>
          <h2 id="advantage-v3-signals">Connection creates more than one kind of advantage.</h2>
        </header>
        <div className={styles.signalGrid}>
          {operatingSignals.map(([title, copy], index) => (
            <article key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
        <div className={styles.relationshipMath}>
          <p>ILLUSTRATIVE RELATIONSHIP MATH / NOT PERFORMANCE</p>
          <strong>
            <span>n</span> independent nodes
            <i aria-hidden="true">→</i>
            <span>n(n−1) / 2</span> possible pairwise connections
          </strong>
          <p>
            This equation describes mathematical connection possibility only. It
            does not predict participation, savings, revenue, or network performance.
          </p>
        </div>
        <p className={styles.possibilityNote}>
          Ecommerce attribution remains unverified until the GA4 and
          order-reconciliation audit is complete.
        </p>
      </section>

      <section className={styles.next} aria-labelledby="advantage-v3-next">
        <p>NEXT CHAPTER</p>
        <h2 id="advantage-v3-next">See what actually moves through the member-owned network.</h2>
        <div>
          <Link href="/network">Explore the network <span aria-hidden="true">↗</span></Link>
          <Link href="/membership">Explore membership <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
      </PublicContinuum>

      <PublicFooter />
    </main>
  );
}

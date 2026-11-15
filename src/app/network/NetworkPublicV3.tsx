import Link from "next/link";
import { PublicFooter } from "@/components/PublicFooter";
import {
  PublicContinuum,
  PublicFilmSequence,
  type PublicCinemaChapter,
} from "@/features/public-cinema";
import styles from "./network-public-v3.module.css";

const networkMedia = (film: string, portrait = false) => {
  const aspect = portrait ? "9x16" : "16x9";
  const root = `/media/cinematic/network/v3/${film}${portrait ? "/portrait-v1" : ""}`;
  return {
    poster: {
      src: `${root}/poster-resolve-${aspect}-v1.webp`,
      width: portrait ? 1080 : 1920,
      height: portrait ? 1920 : 1080,
      focalPoint: portrait ? "50% 68%" : "68% 52%",
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

export const networkPublicV3Chapters: readonly PublicCinemaChapter[] = [
  {
    id: "network-inventory-field",
    index: "01 / 02",
    label: "Inventory field",
    eyebrow: "Distributed local capability",
    title: "Inventory stays distributed.",
    accent: "Response becomes connected.",
    summary:
      "Shared availability can help the network identify the closest member with stock while inventory, execution, and customer relationships remain local.",
    href: "#network-operating-layers",
    action: "See the operating layers",
    facts: ["Shared-inventory principle confirmed", "Member roster still under reconciliation"],
    durationSeconds: 6.041667,
    fps: 24,
    runwayVh: 300,
    desktop: networkMedia("01-inventory-field"),
    mobile: networkMedia("01-inventory-field"),
    beats: [
      {
        id: "distributed",
        label: "Distributed",
        progress: 0,
        description: "Independent unbranded inventory cells remain physically separate.",
      },
      {
        id: "visible",
        label: "Visible",
        progress: 0.34,
        description: "A restrained inspection signal evaluates aggregate availability.",
      },
      {
        id: "closest-available",
        label: "Closest available",
        progress: 0.7,
        description: "One nearest available cell opens without implying a real facility or map location.",
      },
      {
        id: "prepared",
        label: "Prepared",
        progress: 1,
        description: "A neutral tray resolves for the next routing action.",
      },
    ],
    delivery: "ready",
  },
  {
    id: "network-split-routing",
    index: "02 / 02",
    label: "Split routing",
    eyebrow: "Closest in stock / multi-member response",
    title: "One demand signal.",
    accent: "Multiple accountable paths.",
    summary:
      "A checkout can involve more than one member when availability requires it. Each allocation stays distinct instead of collapsing ownership into one anonymous fulfillment path.",
    href: "/parts-gopher",
    action: "See Parts Gopher route demand",
    facts: ["Multi-member fulfillment confirmed", "No customer identity shown"],
    durationSeconds: 10.041667,
    fps: 24,
    runwayVh: 360,
    desktop: networkMedia("02-split-routing"),
    mobile: networkMedia("02-split-routing", true),
    beats: [
      {
        id: "demand",
        label: "Demand enters",
        progress: 0,
        description: "One neutral demand carrier enters the routing fixture.",
      },
      {
        id: "evaluate",
        label: "Availability evaluated",
        progress: 0.33,
        description: "Physically separated inventory lanes are evaluated without invented data readouts.",
      },
      {
        id: "split",
        label: "Paths split",
        progress: 0.68,
        description: "Two available lanes receive distinct attributable portions of the demand.",
      },
      {
        id: "dispatch",
        label: "Response prepared",
        progress: 1,
        description: "Separate trays resolve together at one neutral dispatch frame.",
      },
    ],
    delivery: "ready",
  },
] as const;

const operatingLayers = [
  ["Purchasing", "Member demand can form a coordinated buying position."],
  ["Shared inventory", "Availability and geography support closest-in-stock matching."],
  ["Parts Gopher", "Parker-only digital demand becomes attributable member fulfillment."],
  ["Member intelligence", "Private aggregate reporting is planned under governed definitions."],
] as const;

const inventoryFlow = [
  ["Locate", "Receive demand without exposing a customer identity to the public experience."],
  ["Match", "Use the confirmed availability-and-geography principle."],
  ["Verify", "Keep each allocation and participating member distinct."],
  ["Fulfill", "Route the allocated portion to the participating seller of record."],
] as const;

export function NetworkPublicV3() {
  return (
    <main id="main-content" className={styles.page} tabIndex={-1}>
      <PublicFilmSequence
        routeLabel="Distranet / The Network"
        chapters={networkPublicV3Chapters.filter((chapter) => chapter.delivery === "ready").slice(0, 1)}
      />

      <PublicContinuum tone="network" label="Distributed capability / connected response">
      <section className={styles.ownership} aria-labelledby="network-v3-ownership">
        <p>MEMBER OWNED / LOCALLY OPERATED</p>
        <h2 id="network-v3-ownership">
          The network is not a directory above its members.
          <em>It is an operating system they own together.</em>
        </h2>
        <div>
          <p>
            Member companies own Distranet. Shared definitions are governed by
            leadership and the board, while local companies retain their identity,
            expertise, relationships, and operating control.
          </p>
          <small>
            The current company count must be revalidated at launch. Company
            names, headquarters, websites, and parent relationships remain under
            line-by-line reconciliation and are not presented here as a finished roster.
          </small>
        </div>
      </section>

      <section
        id="network-operating-layers"
        className={styles.layers}
        aria-labelledby="network-v3-layers"
      >
        <header>
          <p>FOUR OPERATING LAYERS</p>
          <h2 id="network-v3-layers">Different systems. One member-owned response.</h2>
        </header>
        <div>
          {operatingLayers.map(([title, copy], index) => (
            <article key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.flow} aria-labelledby="network-v3-flow">
        <header>
          <p>INVENTORY FLOW</p>
          <h2 id="network-v3-flow">Locate. Match. Verify. Fulfill.</h2>
        </header>
        <ol>
          {inventoryFlow.map(([title, copy], index) => (
            <li key={title}>
              <span>0{index + 1}</span>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.rosterGate} aria-labelledby="network-v3-roster">
        <div aria-hidden="true"><i /><i /><i /><i /><span /></div>
        <article>
          <p>ROSTER / WORKING UNTIL RECONCILED</p>
          <h2 id="network-v3-roster">Proof needs verified identities—not decorative map points.</h2>
          <p>
            The production atlas will pair a searchable text directory with the
            visual network only after leadership approves each company name,
            headquarters, official website, entity relationship, and geographic scope.
          </p>
          <small>
            Territory-protection language and United States, Canada, continental,
            or North American reach remain under review and are intentionally omitted.
          </small>
        </article>
      </section>

      <section className={styles.next} aria-labelledby="network-v3-next">
        <p>NEXT CHAPTER</p>
        <h2 id="network-v3-next">Watch the network turn Parker demand into member fulfillment.</h2>
        <div>
          <Link href="/parts-gopher">See Parts Gopher <span aria-hidden="true">↗</span></Link>
          <Link href="/membership">Explore membership <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
      </PublicContinuum>

      <PublicFooter />
    </main>
  );
}

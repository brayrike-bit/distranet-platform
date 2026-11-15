import Link from "next/link";
import { PublicFooter } from "@/components/PublicFooter";
import {
  PublicContinuum,
  PublicFilmSequence,
  type PublicCinemaChapter,
} from "@/features/public-cinema";
import styles from "./distranet-direct-public-v3.module.css";

const directMedia = (portrait = false) => {
  const aspect = portrait ? "9x16" : "16x9";
  const root = `/media/cinematic/distranet-direct/v3/01-intelligent-fulfillment${portrait ? "/portrait-v1" : ""}`;

  return {
    poster: {
      src: `${root}/poster-resolve-${aspect}-v1.webp`,
      width: portrait ? 1080 : 1920,
      height: portrait ? 1920 : 1080,
      focalPoint: portrait ? "50% 52%" : "56% 54%",
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

export const distranetDirectPublicV3Chapters: readonly PublicCinemaChapter[] = [
  {
    id: "distranet-direct-intelligent-fulfillment",
    index: "01 / 01",
    label: "Multi-brand sourcing",
    eyebrow: "Available brands / connected sourcing",
    title: "Find the right industrial product.",
    accent: "Source it through network access.",
    summary:
      "Distranet Direct is the multi-brand sourcing storefront owned and operated by Distranet. It connects customers to products across the brands Distranet can access through its supplier and network relationships.",
    href: "#direct-model",
    action: "Follow the fulfillment path",
    facts: ["Owned and operated by Distranet", "Multi-brand sourcing access"],
    durationSeconds: 10.041667,
    fps: 24,
    runwayVh: 380,
    desktop: directMedia(),
    mobile: directMedia(true),
    beats: [
      {
        id: "find",
        label: "Find",
        progress: 0,
        description: "A product need enters a focused industrial search surface.",
      },
      {
        id: "cross-reference",
        label: "Cross-reference",
        progress: 0.32,
        description: "Cross-reference support helps resolve the appropriate brand and product match.",
      },
      {
        id: "source",
        label: "Source",
        progress: 0.67,
        description: "Supplier and network access identify an available sourcing path.",
      },
      {
        id: "fulfill",
        label: "Fulfill",
        progress: 1,
        description: "The physical route resolves into a protected fulfillment channel.",
      },
    ],
    delivery: "ready",
  },
] as const;

const fulfillmentPath = [
  ["Find", "Search across the brands and products available through Distranet Direct."],
  ["Cross-reference", "Resolve equivalent products and brand options when the known part is not the final match."],
  ["Source", "Identify an available path through Distranet's supplier and network relationships."],
  ["Fulfill", "Move the order through the sourcing and fulfillment path positioned to complete it."],
] as const;

const relationship = [
  {
    index: "01",
    name: "Parts Gopher",
    role: "Parker-only digital commerce",
    copy:
      "The Parker-only customer-facing commerce engine routes online demand across shared member inventory and preserves member attribution.",
    href: "/parts-gopher",
    action: "See the Parts Gopher model",
  },
  {
    index: "02",
    name: "Distranet Direct",
    role: "Multi-brand sourcing access",
    copy:
      "The Distranet-owned storefront opens the buying journey to the brands and products Distranet can source through its available relationships.",
    href: "https://distranetdirect.com",
    action: "Open the official storefront",
  },
] as const;

export function DistranetDirectPublicV3() {
  return (
    <main id="main-content" className={styles.page} tabIndex={-1}>
      <PublicFilmSequence
        routeLabel="Distranet / Distranet Direct"
        chapters={distranetDirectPublicV3Chapters}
      />

      <PublicContinuum tone="commerce" label="Find / match / source / fulfill">
        <section className={styles.identity} aria-labelledby="direct-identity-title">
          <p>DISTRANET DIRECT / THE OFFICIAL RELATIONSHIP</p>
          <h2 id="direct-identity-title">
            One multi-brand storefront.
            <em>A connected sourcing path.</em>
          </h2>
          <div className={styles.identityCopy}>
            <p>
              Distranet Direct is owned and operated by Distranet LTD. It gives
              customers a direct path to products across the brands Distranet
              can access, with network and supplier relationships supporting
              sourcing and fulfillment.
            </p>
            <small>
              Product availability, pricing, shipping, returns, and transaction
              terms remain authoritative on the live storefront.
            </small>
          </div>
          <div className={styles.identityProof} aria-label="Distranet Direct ownership statement">
            <span>Official storefront relationship</span>
            <strong>Distranet Direct</strong>
            <p>Owned and operated by Distranet LTD</p>
          </div>
        </section>

        <section className={styles.relationship} aria-labelledby="direct-relationship-title">
          <header>
            <p>TWO DIGITAL PATHS / ONE MEMBER-OWNED NETWORK</p>
            <h2 id="direct-relationship-title">
              Different customer journeys.
              <em>One connected operating story.</em>
            </h2>
          </header>
          <div className={styles.relationshipLedger}>
            {relationship.map((path) => {
              const external = path.href.startsWith("http");
              const content = (
                <>
                  <span>{path.index}</span>
                  <div>
                    <small>{path.role}</small>
                    <h3>{path.name}</h3>
                  </div>
                  <p>{path.copy}</p>
                  <b aria-hidden="true">↗</b>
                </>
              );

              return external ? (
                <a key={path.name} href={path.href} target="_blank" rel="noreferrer" aria-label={`${path.action} in a new tab`}>
                  {content}
                </a>
              ) : (
                <Link key={path.name} href={path.href} aria-label={path.action}>
                  {content}
                </Link>
              );
            })}
          </div>
        </section>

        <section id="direct-model" className={styles.fulfillment} aria-labelledby="direct-model-title">
          <header>
            <p>THE FULFILLMENT SIGNAL</p>
            <h2 id="direct-model-title">A product need becomes a sourcing route.</h2>
          </header>
          <ol>
            {fulfillmentPath.map(([title, copy], index) => (
              <li key={title}>
                <span>0{index + 1}</span>
                <div aria-hidden="true"><i /></div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.interface} aria-labelledby="direct-interface-title">
          <div className={styles.interfaceCopy}>
            <p>THE SEARCH SURFACE</p>
            <h2 id="direct-interface-title">
              Start with the part.
              <em>Let the network resolve the path.</em>
            </h2>
            <p>
              The marketing site explains the operating relationship. The live
              storefront remains the authoritative place to search the catalog,
              confirm current availability, and transact.
            </p>
          </div>
          <div className={styles.queryInstrument} aria-hidden="true">
            <span>PRODUCT SEARCH / INTERCHANGE</span>
            <strong>Brand, part number, description, or cross-reference</strong>
            <i>→</i>
          </div>
          <div className={styles.routeSignal} aria-label="Storefront route sequence">
            <span>MULTI-BRAND NEED</span><i aria-hidden="true" />
            <span>PRODUCT MATCH</span><i aria-hidden="true" />
            <span>AVAILABLE SOURCE</span><i aria-hidden="true" />
            <strong>FULFILL</strong>
          </div>
        </section>

        <section className={styles.boundary} aria-labelledby="direct-boundary-title">
          <div>
            <p>PUBLIC EXPLANATION / LIVE COMMERCE</p>
            <h2 id="direct-boundary-title">Every surface has a clear job.</h2>
          </div>
          <div className={styles.boundaryCopy}>
            <p>
              Distranet.com tells the network story. Distranet Direct owns the
              multi-brand sourcing journey. Parts Gopher is the Parker-only
              commerce channel and explains its demand-routing role on its own
              Distranet chapter.
            </p>
            <p>
              Keeping those responsibilities distinct makes the system easier
              to understand without duplicating a live catalog or presenting
              unverified inventory totals as public facts.
            </p>
          </div>
        </section>

        <section className={styles.next} aria-labelledby="direct-next-title">
          <p>CHOOSE THE NEXT PATH</p>
          <h2 id="direct-next-title">Source across available brands—or follow the Parker commerce story.</h2>
          <div>
            <a href="https://distranetdirect.com" target="_blank" rel="noreferrer">
              Open Distranet Direct <span aria-hidden="true">↗</span>
            </a>
            <Link href="/parts-gopher">
              Explore Parts Gopher <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>
      </PublicContinuum>

      <PublicFooter />
    </main>
  );
}

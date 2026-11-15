import Link from "next/link";
import { PublicFooter } from "@/components/PublicFooter";
import {
  PublicContinuum,
  PublicFilmSequence,
  type PublicCinemaChapter,
} from "@/features/public-cinema";
import styles from "./parts-gopher-public-v3.module.css";

const partsGopherMedia = (film: string, portrait = false) => {
  const aspect = portrait ? "9x16" : "16x9";
  const root = `/media/cinematic/parts-gopher/v3/${film}${portrait ? "/portrait-v1" : ""}`;
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

export const partsGopherPublicV3Chapters: readonly PublicCinemaChapter[] = [
  {
    id: "parts-gopher-demand-match",
    index: "01 / 02",
    label: "Demand match",
    eyebrow: "Parker demand / network opportunity",
    title: "Parker demand enters once.",
    accent: "Opportunity finds stock.",
    summary:
      "Parts Gopher is Distranet's Parker-only customer-facing storefront and commerce engine. The network resolves inventory, fulfillment, and member attribution behind each Parker transaction.",
    href: "#parts-gopher-journey",
    action: "Follow the order journey",
    facts: ["Parker-only storefront", "Canonical external URL still requires approval"],
    durationSeconds: 6.041667,
    fps: 24,
    runwayVh: 300,
    desktop: partsGopherMedia("01-demand-match"),
    mobile: partsGopherMedia("01-demand-match"),
    beats: [
      {
        id: "demand-enters",
        label: "Demand enters",
        progress: 0,
        description: "One neutral demand carrier enters an unbranded inspection gate.",
      },
      {
        id: "availability",
        label: "Availability evaluated",
        progress: 0.34,
        description: "The system evaluates generic physical product cues without customer or SKU data.",
      },
      {
        id: "match",
        label: "Match resolved",
        progress: 0.7,
        description: "One plausible unbranded component moves into a protected tray.",
      },
      {
        id: "opportunity",
        label: "Member opportunity",
        progress: 1,
        description: "The protected tray resolves for attributable member routing.",
      },
    ],
    delivery: "ready",
  },
  {
    id: "parts-gopher-split-fulfillment",
    index: "02 / 02",
    label: "Split fulfillment",
    eyebrow: "One checkout / distinct allocations",
    title: "One customer experience.",
    accent: "Multiple accountable paths.",
    summary:
      "A checkout may split across members when stock availability requires it. Each participating member remains seller of record for its allocated portion.",
    href: "#parts-gopher-model",
    action: "Inspect the operating model",
    facts: ["Multi-member orders are common", "Seller of record applies per allocated portion"],
    durationSeconds: 10.041667,
    fps: 24,
    runwayVh: 380,
    desktop: partsGopherMedia("02-split-fulfillment"),
    mobile: partsGopherMedia("02-split-fulfillment", true),
    beats: [
      {
        id: "carrier-opens",
        label: "Carrier opens",
        progress: 0,
        description: "One neutral carrier reveals two generic component needs.",
      },
      {
        id: "paths-separate",
        label: "Paths separate",
        progress: 0.33,
        description: "Each need moves through a distinct physically credible member-owned lane.",
      },
      {
        id: "fulfillment",
        label: "Members fulfill",
        progress: 0.68,
        description: "Each lane receives a different component and closes its own neutral dispatch tray.",
      },
      {
        id: "attribution",
        label: "Attribution preserved",
        progress: 1,
        description: "The trays resolve together without merging ownership or inventing shipping labels.",
      },
    ],
    delivery: "ready",
  },
  {
    id: "parts-gopher-explainable-value",
    index: "03 / 03",
    label: "Explainable value",
    eyebrow: "Aggregate evidence / governed definitions",
    title: "Value returns with context.",
    accent: "Never customer identity.",
    summary:
      "Private member reporting is intended to connect attributed sales, products, coarse geography, allocations, proceeds, and exceptions without exposing customer identities.",
    href: "/member-access",
    action: "Preview Member Hub",
    facts: ["Aggregate insight only", "Reporting remains a labeled prototype"],
    durationSeconds: 5,
    fps: 24,
    runwayVh: 240,
    desktop: partsGopherMedia("03-explainable-value"),
    mobile: partsGopherMedia("03-explainable-value", true),
    beats: [
      {
        id: "trays-enter",
        label: "Allocations enter",
        progress: 0,
        description: "Two separately maintained fulfillment paths enter a settlement fixture.",
      },
      {
        id: "reconcile",
        label: "Paths reconcile",
        progress: 0.38,
        description: "Mechanical windows preserve distinct value paths and one reconciliation channel.",
      },
      {
        id: "aggregate",
        label: "Evidence aggregates",
        progress: 0.74,
        description: "The fixture resolves without currency, percentages, charts, or customer identity.",
      },
      {
        id: "ledger",
        label: "Governed ledger",
        progress: 1,
        description: "A calm physical ledger plate holds for the same-site member-access bridge.",
      },
    ],
    delivery: "planned",
  },
] as const;

const orderJourney = [
  ["Intent", "A shopper searches the Parker catalog by part number, attribute, or application."],
  ["Order", "Product, availability, price, and delivery expectations form one checkout."],
  ["Route", "Customer geography and shared inventory support closest-stocked allocation."],
  ["Fulfill", "One or more members fulfill their separately attributable portions."],
  ["Explain", "Aggregate member evidence is planned under board-governed definitions."],
] as const;

const operatingRules = [
  {
    status: "CONFIRMED",
    title: "Closest available stock",
    copy: "Customer geography and the shared-inventory database inform the closest-stocked-member principle.",
  },
  {
    status: "CONFIRMED",
    title: "Allocation-level seller",
    copy: "Each participating member is seller of record for its allocated portion of the order.",
  },
  {
    status: "CONFIRMED PRINCIPLE",
    title: "50 / 50 gross-margin share",
    copy: "The current high-level principle is product reimbursement plus a 50% member gross-margin share; final payable treatment still depends on governed adjustments.",
  },
  {
    status: "PLANNED",
    title: "Private member evidence",
    copy: "Aggregate reporting is being built; traffic, funnel, conversion, and attribution remain uncertified pending the GA4 and order-join audit.",
  },
] as const;

export function PartsGopherPublicV3() {
  return (
    <main id="main-content" className={styles.page} tabIndex={-1}>
      <PublicFilmSequence
        routeLabel="Distranet / Parts Gopher"
        chapters={partsGopherPublicV3Chapters.filter((chapter) => chapter.delivery === "ready").slice(0, 1)}
      />

      <PublicContinuum tone="commerce" label="Demand / allocation / accountable return">
      <section className={styles.relationship} aria-labelledby="parts-gopher-v3-relationship">
        <p>THE CANONICAL RELATIONSHIP</p>
        <h2 id="parts-gopher-v3-relationship">
          The Parker storefront captures demand.
          <em>The member-owned network creates the response.</em>
        </h2>
        <div>
          <p>
            Parts Gopher is the Parker-only customer-facing commerce engine
            inside the Distranet story. This page explains the operating
            relationship; it is not a replacement storefront, product catalog,
            or public member dashboard.
          </p>
          <small>
            Legal-entity wording and the canonical customer storefront URL must
            be validated before a public external-store action is enabled.
          </small>
        </div>
      </section>

      <section
        id="parts-gopher-journey"
        className={styles.journey}
        aria-labelledby="parts-gopher-v3-journey"
      >
        <header>
          <p>ONE CHECKOUT / A GOVERNED OPERATING JOURNEY</p>
          <h2 id="parts-gopher-v3-journey">Demand moves. Attribution stays intact.</h2>
        </header>
        <ol>
          {orderJourney.map(([title, copy], index) => (
            <li key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        id="parts-gopher-model"
        className={styles.model}
        aria-labelledby="parts-gopher-v3-model"
      >
        <header>
          <p>OPERATING MODEL / STATUS INCLUDED</p>
          <h2 id="parts-gopher-v3-model">Every public statement carries its boundary.</h2>
        </header>
        <div>
          {operatingRules.map((rule, index) => (
            <article key={rule.title}>
              <span>0{index + 1} / {rule.status}</span>
              <h3>{rule.title}</h3>
              <p>{rule.copy}</p>
            </article>
          ))}
        </div>
        <aside>
          Fees, discounts, returns, shipping, tax, chargebacks, and reconciliation
          adjustments are not presented as settled public policy. Customer
          identities never appear in member reporting.
        </aside>
      </section>

      <section className={styles.next} aria-labelledby="parts-gopher-v3-next">
        <p>CHOOSE THE NEXT PATH</p>
        <h2 id="parts-gopher-v3-next">Follow the multi-brand sourcing storefront—or enter the private member workspace.</h2>
        <div>
          <Link href="/distranet-direct">Explore Distranet Direct <span aria-hidden="true">↗</span></Link>
          <Link href="/member-access">Preview Member Hub <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
      </PublicContinuum>

      <PublicFooter />
    </main>
  );
}

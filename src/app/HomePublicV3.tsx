import Link from "next/link";
import { PublicFooter } from "@/components/PublicFooter";
import { PublicContinuum, PublicFilmSequence } from "@/features/public-cinema";
import { homePublicV3Chapters } from "./home-v3";
import styles from "./home-public-v3.module.css";

const operatingSpine = [
  {
    index: "01",
    title: "Combine purchasing position",
    copy:
      "Coordinate member demand into a stronger supplier conversation while ownership and operating decisions remain independent.",
    signal: "DEMAND → POSITION",
    href: "/advantage",
  },
  {
    index: "02",
    title: "Connect inventory response",
    copy:
      "Use shared availability to identify eligible in-stock members and coordinate fulfillment across the network.",
    signal: "AVAILABILITY → RESPONSE",
    href: "/network",
  },
  {
    index: "03",
    title: "Route Parker digital opportunity",
    copy:
      "Turn Parts Gopher's Parker-only demand into member fulfillment without separating the sale from the company supplying the part.",
    signal: "ORDER → MEMBER",
    href: "/parts-gopher",
  },
  {
    index: "04",
    title: "Extend multi-brand sourcing",
    copy:
      "Connect customers to the brands and products Distranet Direct can access through supplier and network relationships.",
    signal: "SOURCE → FULFILLMENT",
    href: "/distranet-direct",
  },
  {
    index: "05",
    title: "Make value legible",
    copy:
      "Give each member a private, branded view of aggregate demand, fulfillment, proceeds, and governed network context.",
    signal: "OUTCOME → DECISION",
    href: "/member-access",
  },
] as const;

const verifiedModel = [
  ["21", "Current member companies", "Count confirmed August 7, 2026"],
  ["LOCAL", "Ownership and judgment", "Remain with each member company"],
  ["SHARED", "Inventory visibility", "Supports closest in-stock matching"],
  ["PRIVATE", "Customer intelligence", "Presented in aggregate, not by identity"],
] as const;

const routeIndex = [
  ["01", "Collective advantage", "How independent demand forms a stronger buying position.", "/advantage"],
  ["02", "The network", "How inventory and fulfillment signals move across members.", "/network"],
  ["03", "Parts Gopher", "How Parker-only online demand becomes attributable member opportunity.", "/parts-gopher"],
  ["04", "Distranet Direct", "How multi-brand product sourcing connects to network fulfillment.", "/distranet-direct"],
  ["05", "Membership", "How an independent operator enters a governed, member-owned system.", "/membership"],
  ["06", "About Distranet", "Why the network exists, who owns it, and how it is moving forward.", "/about"],
  ["07", "Member login", "Open the same-site gateway to the private, company-branded member workspace.", "/member-access"],
] as const;

export function HomePublicV3() {
  return (
    <main id="main-content" className={styles.page} tabIndex={-1}>
      <PublicFilmSequence
        routeLabel="Distranet / Connected industrial intelligence"
        chapters={homePublicV3Chapters.filter((chapter) => chapter.delivery === "ready").slice(0, 1)}
      />

      <PublicContinuum tone="home" label="The member-owned operating system">

      <section className={styles.thesis} aria-labelledby="home-v3-thesis">
        <p>THE OPERATING THESIS</p>
        <h2 id="home-v3-thesis">
          Scale without surrender.
          <em>Connection without consolidation.</em>
        </h2>
        <div className={styles.thesisCopy}>
          <p>
            Distranet was built by independent fluid power companies to create
            shared strength where coordination matters—and preserve local
            identity where it matters most.
          </p>
          <blockquote>
            The network is not the owner of the members. The members own the
            network.
          </blockquote>
        </div>
      </section>

      <section className={styles.operating} aria-labelledby="home-v3-operating">
        <header>
          <p>ONE CONNECTED OPERATING SPINE</p>
          <h2 id="home-v3-operating">
            Five forms of coordination.<br />One member-owned system.
          </h2>
        </header>

        <ol className={styles.spine}>
          {operatingSpine.map((step) => (
            <li key={step.index}>
              <span>{step.index}</span>
              <div>
                <small>{step.signal}</small>
                <h3>{step.title}</h3>
              </div>
              <p>{step.copy}</p>
              <Link href={step.href} aria-label={`Explore ${step.title}`}>
                <span aria-hidden="true">↗</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.ownership} aria-labelledby="home-v3-ownership">
        <div className={styles.ownershipStatement}>
          <p>MEMBER OWNED / MEMBER DIRECTED</p>
          <h2 id="home-v3-ownership">
            The center exists to make every edge stronger.
          </h2>
        </div>
        <div className={styles.ownershipModel} aria-label="Distranet ownership model">
          <span>21 independent companies</span>
          <i aria-hidden="true">→</i>
          <strong>Own</strong>
          <i aria-hidden="true">→</i>
          <span>One connected network</span>
        </div>
        <p className={styles.ownershipCopy}>
          Members contribute the scale. Distranet coordinates the collective
          position. Value, opportunity, and governed intelligence return to the
          independent companies that created the network.
        </p>
      </section>

      <section className={styles.evidence} aria-labelledby="home-v3-evidence">
        <header>
          <p>THE MODEL / STATED PLAINLY</p>
          <h2 id="home-v3-evidence">No vague network claims. Every statement should resolve to a definition.</h2>
        </header>
        <dl>
          {verifiedModel.map(([value, label, note]) => (
            <div key={label}>
              <dt>{value}</dt>
              <dd>
                <strong>{label}</strong>
                <span>{note}</span>
              </dd>
            </div>
          ))}
        </dl>
        <p className={styles.evidenceNote}>
          A verified current purchasing-volume figure will be published only
          after leadership and the board approve its source, period, and metric
          definition. No placeholder volume is presented as fact.
        </p>
      </section>

      <section className={styles.routeIndex} aria-labelledby="home-v3-route-index">
        <header>
          <p>CONTINUE THROUGH THE SYSTEM</p>
          <h2 id="home-v3-route-index">Choose the operating signal you want to follow.</h2>
        </header>
        <nav aria-label="Explore Distranet">
          {routeIndex.map(([index, title, copy, href]) => (
            <Link href={href} key={href}>
              <span>{index}</span>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
              <b aria-hidden="true">↗</b>
            </Link>
          ))}
        </nav>
      </section>
      </PublicContinuum>

      <PublicFooter />
    </main>
  );
}

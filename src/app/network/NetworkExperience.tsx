"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { ViewportFilm } from "@/components/ViewportFilm";
import { distranetCinematicMedia, RouteFilmHero } from "@/components/cinematic";
import { Mark } from "@/components/Brand";
import { PublicFooter } from "@/components/PublicFooter";
import { InventoryFlow } from "./InventoryFlow";
import { MemberAtlas } from "./MemberAtlas";
import styles from "./network.module.css";

const layers = [
  {
    number: "01",
    name: "Collective purchasing",
    title:
      "Twenty-one streams of purchasing demand become one negotiating position.",
    body:
      "Aggregate qualified demand without dissolving the independence that makes every member valuable in its local market.",
    signal: "VOLUME / TERMS / PROGRAMS",
  },
  {
    number: "02",
    name: "Shared inventory",
    title: "Distributed stock behaves like one responsive field.",
    body:
      "A member can look beyond the local shelf, find product across the network, and work through shared inventory, pricing, location, and shipping information.",
    signal: "SEARCH / SOURCE / SHIP",
  },
  {
    number: "03",
    name: "Digital commerce",
    title: "Parts Gopher turns market demand into member opportunity.",
    body:
      "The storefront captures intent, routes orders into the network, and creates a measurable digital channel for participating companies.",
    signal: "DISCOVER / ORDER / ATTRIBUTE",
  },
  {
    number: "04",
    name: "Network intelligence",
    title: "The signal returns as evidence, not anecdotes.",
    body:
      "Private company-level reporting will make attributed sales, product demand, geography, proceeds, and opportunity visible between conferences.",
    signal: "MEASURE / LEARN / ACT",
  },
] as const;

const ownershipFilm = distranetCinematicMedia.networkMemberOwnership;

function moveLayerTab(
  event: ReactKeyboardEvent<HTMLButtonElement>,
  index: number,
  onSelect: (nextIndex: number) => void,
) {
  let nextIndex: number | null = null;

  if (event.key === "ArrowDown" || event.key === "ArrowRight") {
    nextIndex = (index + 1) % layers.length;
  }
  if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
    nextIndex = (index - 1 + layers.length) % layers.length;
  }
  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = layers.length - 1;
  if (nextIndex === null) return;

  event.preventDefault();
  onSelect(nextIndex);
  event.currentTarget
    .closest<HTMLElement>("[role='tablist']")
    ?.querySelectorAll<HTMLButtonElement>("[role='tab']")[nextIndex]
    ?.focus();
}

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg className={styles.icon} viewBox="0 0 20 20" aria-hidden="true">
      <path d={diagonal ? "M5 15 15 5M7 5h8v8" : "M3 10h14M12 5l5 5-5 5"} />
    </svg>
  );
}

function Wordmark({ compact = false }: { compact?: boolean }) {
  return <Mark compact={compact} />;
}

function NetworkLayers() {
  const [activeLayer, setActiveLayer] = useState(1);
  const layer = layers[activeLayer];
  return (
    <div className={styles.layersExperience} data-layer={activeLayer}>
      <div className={styles.layerVisual} aria-hidden="true">
        <ViewportFilm
          src="/media/cinematic/network/distributed-inventory-v2/master-16x9-v2.mp4"
          mobileSrc="/media/cinematic/network/distributed-inventory-v2/master-9x16-v2.mp4"
          className={styles.layerReality}
          poster="/media/cinematic/network/distributed-inventory-v2/poster-16x9-v2.jpg"
          mobilePoster="/media/cinematic/network/distributed-inventory-v2/poster-9x16-v2.jpg"
          focalPoint="50% 52%"
          mobileFocalPoint="50% 50%"
          scrubRange={[0, 0.52]}
        />
        <div className={`${styles.orbit} ${styles.orbitOne}`}>
          <i />
          <i />
          <i />
        </div>
        <div className={`${styles.orbit} ${styles.orbitTwo}`}>
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className={`${styles.orbit} ${styles.orbitThree}`}>
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className={`${styles.orbit} ${styles.orbitFour}`}>
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className={styles.layerCore}>
          <Wordmark compact />
          <span>
            OPERATING<br />FIELD
          </span>
        </div>
        <div className={styles.layerAxisX} />
        <div className={styles.layerAxisY} />
        <span className={styles.layerCoordinateA}>CUSTOMER GEO / PRIVATE</span>
        <span className={styles.layerCoordinateB}>MEMBER VIEW / AGGREGATE</span>
      </div>

      <div className={styles.layerContent}>
        <p className={styles.microLabel}>
          Four connected systems / one advantage
        </p>
        <div
          className={styles.layerTabs}
          role="tablist"
          aria-label="Network operating layers"
          aria-orientation="vertical"
        >
          {layers.map((item, index) => (
            <button
              type="button"
              role="tab"
              id={`network-layer-tab-${index}`}
              aria-selected={activeLayer === index}
              aria-controls="network-layer-panel"
              tabIndex={activeLayer === index ? 0 : -1}
              key={item.name}
              className={activeLayer === index
                ? styles.layerTabActive
                : undefined}
              onClick={() => setActiveLayer(index)}
              onKeyDown={(event) => moveLayerTab(event, index, setActiveLayer)}
            >
              <span>{item.number}</span>
              <strong>{item.name}</strong>
              <i />
            </button>
          ))}
        </div>
        <div
          className={styles.layerDetail}
          id="network-layer-panel"
          role="tabpanel"
          aria-labelledby={`network-layer-tab-${activeLayer}`}
          aria-live="polite"
          tabIndex={0}
        >
          <p>{layer.signal}</p>
          <h3>{layer.title}</h3>
          <span>{layer.body}</span>
        </div>
      </div>
    </div>
  );
}

function TerritoryField() {
  return (
    <svg
      className={styles.territoryField}
      viewBox="0 0 1400 800"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="territory-line" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".1" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".58" />
          <stop offset="1" stopColor="#fff" stopOpacity=".1" />
        </linearGradient>
        <radialGradient id="territory-glow">
          <stop offset="0" stopColor="#fff" stopOpacity=".65" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className={styles.territoryCells}>
        <path d="M0 0h270l84 161-91 160L0 278Z" />
        <path d="m270 0 294 0 52 169-150 124-112-132Z" />
        <path d="m564 0 278 0 99 152-110 139-215-122Z" />
        <path d="m842 0 277 0 83 174-133 134-128-156Z" />
        <path d="m1119 0 281 0v278l-198-104Z" />
        <path d="M0 278 263 321l113 168-130 152L0 600Z" />
        <path d="m263 321 203-28 146 148-69 194-167-146Z" />
        <path d="m466 293 365-2 55 174-139 155-135-179Z" />
        <path d="m831 291 238 17 83 171-127 143-139-157Z" />
        <path d="m1069 308 133-134 198 104v324l-248-123Z" />
        <path d="M0 600 246 641l142 159H0Z" />
        <path d="m246 641 130-152 167 146 84 165H388Z" />
        <path d="m543 635 204-15 151 180H627Z" />
        <path d="m747 620 278 2 125 178H898Z" />
        <path d="m1025 622 127-143 248 123v198h-250Z" />
      </g>
      <path
        className={styles.territoryRoute}
        d="M91 212C359 56 454 544 703 400S1045 188 1324 541"
      />
      {[91, 263, 466, 616, 831, 1069, 1202, 1324].map((x, index) => (
        <g
          key={x}
          transform={`translate(${x} ${
            [212, 321, 293, 169, 291, 308, 174, 541][index]
          })`}
        >
          <circle className={styles.territoryHalo} r="48" />
          <circle className={styles.territoryNode} r="5" />
        </g>
      ))}
    </svg>
  );
}

export function NetworkExperience() {
  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-network-reveal]"),
    );
    const reduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      nodes.forEach((node) => node.setAttribute("data-visible", "true"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).setAttribute("data-visible", "true");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -12%", threshold: 0.08 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.route}>
      <main id="main-content" className={styles.main} tabIndex={-1}>
        <RouteFilmHero
          route="network"
          asset={distranetCinematicMedia.networkDistributedInventory}
          titleId="network-title"
          eyebrow="The member network / 21 current companies / leadership confirmed Aug. 7, 2026"
          title={
            <>
              A continent<br />{" "}of capability.<br />{" "}
              <em>Moving as one.</em>
            </>
          }
          description="Distranet connects local fluid power leaders into a responsive operating field—shared scale without surrendered independence."
          facts={[
            "Closest in-stock routing",
            "Split fulfillment supported",
            "Aggregate customer privacy",
          ]}
          actions={
            <>
              <a href="#atlas">
                Explore the atlas <Arrow />
              </a>
              <a href="#inventory">
                See inventory move <Arrow />
              </a>
            </>
          }
        />

        <section id="thesis" className={styles.thesis}>
          <div className={styles.thesisIndex} data-network-reveal>
            <span>21</span>
            <i />
            <strong>01</strong>
          </div>
          <div className={styles.thesisCopy} data-network-reveal>
            <p className={styles.sectionLabel}>01 / The cooperative system</p>
            <h2>
              Every warehouse becomes a doorway into{" "}
              <em>every other warehouse.</em>
            </h2>
            <p>
              Independence remains local. Capability becomes collective.
              Distranet gives member-owned distributors a way to cooperate where
              scale matters and compete where relationships matter.
            </p>
          </div>
          <div className={styles.thesisRail} data-network-reveal>
            {[
              "Member-owned",
              "Territory policy under review",
              "Shared inventory",
              "Continental reach",
            ].map((item, index) => (
              <span key={item}>
                <b>{String(index + 1).padStart(2, "0")}</b>
                {item}
              </span>
            ))}
          </div>
        </section>

        <section
          id="ownership"
          className={styles.ownershipSection}
          aria-labelledby="ownership-title"
        >
          <figure className={styles.ownershipVisual} data-network-reveal>
            <ViewportFilm
              src={ownershipFilm.desktop.sources[0]?.src}
              poster={ownershipFilm.desktop.poster.src}
              mobileSrc={ownershipFilm.mobile?.sources[0]?.src}
              mobilePoster={ownershipFilm.mobile?.poster.src}
              className={styles.ownershipFilm}
              focalPoint={ownershipFilm.desktop.poster.focalPoint}
              mobileFocalPoint={ownershipFilm.mobile?.poster.focalPoint}
              scrubRange={[0.06, 0.96]}
            />
            <div className={styles.ownershipReadout} aria-hidden="true">
              <span>21 MEMBER POSITIONS</span>
              <i />
              <span>COUNT CONFIRMED AUG 7 2026</span>
            </div>
            <figcaption>
              A branded manifold film visualizes independent member signals
              converging through one collectively owned organization.
            </figcaption>
          </figure>

          <div className={styles.ownershipCopy} data-network-reveal>
            <p className={styles.sectionLabel}>02 / Ownership</p>
            <span className={styles.sectionCode}>
              MEMBER OWNED / MEMBER GOVERNED
            </span>
            <h2 id="ownership-title">
              The network belongs to the companies <em>inside it.</em>
            </h2>
            <p>
              Distranet is collectively owned by its member companies. The
              organization exists to strengthen those businesses while each
              one preserves its own leadership, identity, customer
              relationships, and local judgment.
            </p>
            <dl className={styles.ownershipLedger}>
              <div>
                <dt>21</dt>
                <dd>Current company count confirmed by leadership on Aug. 7, 2026.</dd>
              </div>
              <div>
                <dt>LOCAL</dt>
                <dd>Company identity and operating authority remain independent.</dd>
              </div>
              <div>
                <dt>BOARD</dt>
                <dd>
                  The president and board approve metric definitions and resolve
                  reporting disputes.
                </dd>
              </div>
            </dl>
            <Link href="/about" className={styles.ownershipLink}>
              See how Distranet evolved <Arrow />
            </Link>
          </div>
        </section>

        <section className={styles.operatingLayers}>
          <div className={styles.sectionIntro} data-network-reveal>
            <div>
              <p className={styles.sectionLabel}>03 / The operating layers</p>
              <span className={styles.sectionCode}>
                SYSTEM ARCHITECTURE / MEMBER VALUE
              </span>
            </div>
            <h2>
              Connection is not the product.<br />{" "}
              <em>What moves through it is.</em>
            </h2>
          </div>
          <NetworkLayers />
        </section>

        <section
          id="inventory"
          className={styles.inventorySection}
        >
          <div className={styles.sectionIntro} data-network-reveal>
            <div>
              <p className={styles.sectionLabel}>04 / Inventory liquidity</p>
              <span className={styles.sectionCode}>
                INTERACTIVE ROUTING MODEL / SELECT A STAGE
              </span>
            </div>
            <h2>
              One search.<br />{" "}
              <em>Twenty-one positions.</em>
            </h2>
            <p className={styles.sectionLede}>
              The moment a local shelf comes up short, the network should become
              visible—not as a directory, but as an operating system.
            </p>
          </div>
          <div
            className={styles.inventoryPhysical}
            data-network-reveal
          >
            <ViewportFilm
              src="/media/cinematic/network/distributed-inventory-v2/master-16x9-v2.mp4"
              mobileSrc="/media/cinematic/network/distributed-inventory-v2/master-9x16-v2.mp4"
              className={styles.inventoryPhysicalWorld}
              poster="/media/cinematic/network/distributed-inventory-v2/poster-16x9-v2.jpg"
              mobilePoster="/media/cinematic/network/distributed-inventory-v2/poster-9x16-v2.jpg"
              mobileFocalPoint="50% 50%"
              scrubRange={[0.42, 1]}
            />
            <div className={styles.inventoryPhysicalHud}>
              <span>SHARED INVENTORY / MEMBER LOCATIONS</span>
              <span>
                <i /> ROUTING MODEL
              </span>
            </div>
            <div
              className={styles.inventoryPhysicalCopy}
              data-cine-depth
              style={{ "--cine-depth": "-22px" } as React.CSSProperties}
            >
              <small>STOCK → SIGNAL → LIQUIDITY</small>
              <h3>Inventory stops sitting still.</h3>
              <p>
                An industrial view of the shared-inventory principle: member
                locations expose availability, customer geography resolves the
                closest in-stock source, and a qualified allocation moves toward
                fulfillment.
              </p>
              <div>
                <span>01 LOCATE</span>
                <span>02 MATCH</span>
                <span>03 VERIFY</span>
                <span>04 FULFILL</span>
              </div>
            </div>
          </div>
          <div data-network-reveal>
            <InventoryFlow />
          </div>
        </section>

        <section id="atlas" className={styles.atlasSection}>
          <div className={styles.sectionIntro} data-network-reveal>
            <div>
              <p className={styles.sectionLabel}>05 / The member atlas</p>
              <span className={styles.sectionCode}>
                COUNT CONFIRMED AUG 7 2026 / WORKING ROSTER BELOW
              </span>
            </div>
            <h2>
              Local expertise.<br />{" "}
              <em>Continental consequence.</em>
            </h2>
            <p className={styles.sectionLede}>
              Twenty-one companies carry distinct histories, teams, inventory,
              and customer trust. Distranet makes that distributed strength
              legible. Leadership confirmed the current count; the company and
              headquarters references below remain pending roster reconciliation.
            </p>
          </div>
          <div data-network-reveal>
            <MemberAtlas />
          </div>
        </section>

        <section className={styles.territorySection}>
          <TerritoryField />
          <div className={styles.territoryOverlay} aria-hidden="true" />
          <div className={styles.territoryCopy} data-network-reveal>
            <p className={styles.sectionLabel}>06 / Cooperation by design</p>
            <h2>
              Territory trust.<br />{" "}
              <em>Expanded possibility.</em>
            </h2>
            <p>
              Distranet’s current public materials describe non-overlapping
              member territories alongside shared inventory access. Future
              policy and commercial boundaries require leadership confirmation;
              the operating principle is to protect local trust while expanding
              collective capability.
            </p>
            <div className={styles.territoryLogic}>
              <span>
                <b>01</b>Local relationship
              </span>
              <i />
              <span>
                <b>02</b>Network source
              </span>
              <i />
              <span>
                <b>03</b>Coordinated fulfillment
              </span>
            </div>
          </div>
          <div className={styles.territoryFoot}>
            <span>Concept field / not commercial boundaries</span>
            <span>Cooperation protocol / member governed</span>
          </div>
        </section>

        <section className={styles.closingSection}>
          <div className={styles.closingSignal} aria-hidden="true">
            <i />
            <i />
            <i />
            <span>
              <Wordmark compact />
            </span>
          </div>
          <div className={styles.closingCopy} data-network-reveal>
            <p className={styles.sectionLabel}>The network is only beginning</p>
            <h2>
              Independent strength.<br />{" "}
              <em>Made visible.</em>
            </h2>
            <p>
              The next Distranet will let prospective members understand the
              advantage—and let current members see the value moving through it.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryButton} href="/membership">
                Explore membership <Arrow />
              </Link>
              <Link className={styles.secondaryButton} href="/member-access">
                Preview hub prototype
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

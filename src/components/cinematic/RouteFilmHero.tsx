"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import type { CinematicFilmAsset, CinematicTimelineBeat } from "./mediaManifest";
import { PointerDepthLayer, PointerDepthStage } from "./PointerDepthStage";
import { ScrollScrubFilm } from "./ScrollScrubFilm";
import styles from "./routeFilmHero.module.css";

export type RouteFilmKind =
  | "about"
  | "advantage"
  | "network"
  | "membership"
  | "parts-gopher"
  | "member-access";

export type RouteFilmHeroProps = Readonly<{
  route: RouteFilmKind;
  asset: CinematicFilmAsset;
  titleId: string;
  eyebrow: string;
  title: ReactNode;
  description: string;
  facts: readonly [string, string, string?];
  actions?: ReactNode;
  className?: string;
  scrollSpanVh?: number;
  priority?: boolean;
}>;

const memberAccessCamera = {
  perspective: 820,
  travelX: 58,
  travelY: 58,
  travelZ: 330,
  rotation: 15.5,
  response: 0.14,
  atmosphereDepth: -0.48,
  copyDepth: 0.12,
  instrumentDepth: 0.98,
  instrumentScale: 1.12,
  opticsDepth: 1,
  opticsScale: 1.18,
} as const;

function AboutInstrument({ beat }: { beat: CinematicTimelineBeat }) {
  return (
    <div className={styles.aboutInstrument} role="img" aria-label={`Member ownership assembly: ${beat.description}`}>
      <div className={styles.orbitAxis} aria-hidden="true"><i /><i /><i /></div>
      <div className={styles.identityRing} aria-hidden="true">
        {Array.from({ length: 21 }, (_, index) => <i key={index} />)}
      </div>
      <div className={styles.ownershipSeal} aria-hidden="true"><b>21</b><span>MEMBER<br />OWNERS</span></div>
      <small aria-hidden="true">INDEPENDENCE REMAINS VISIBLE</small>
    </div>
  );
}

function AdvantageInstrument({ beat }: { beat: CinematicTimelineBeat }) {
  return (
    <div className={styles.advantageInstrument} role="img" aria-label={`Collective buying position: ${beat.description}`}>
      <div className={styles.buyingInputs} aria-hidden="true">
        {Array.from({ length: 21 }, (_, index) => <i key={index} />)}
      </div>
      <svg viewBox="0 0 660 360" preserveAspectRatio="none" aria-hidden="true">
        {Array.from({ length: 7 }, (_, index) => (
          <path key={index} pathLength="1" d={`M0 ${30 + index * 50}C220 ${30 + index * 50} 330 180 620 180`} />
        ))}
      </svg>
      <div className={styles.compressionRail} aria-hidden="true"><i /><span>COLLECTIVE INPUT</span><b>CONCENTRATED</b></div>
      <div className={styles.buyingPosition} aria-hidden="true"><span>21</span><i>→</i><b>1</b><small>BUYING POSITION</small></div>
    </div>
  );
}

function NetworkInstrument({ beat }: { beat: CinematicTimelineBeat }) {
  const points = [[134, 264], [210, 126], [292, 348], [408, 218], [506, 116], [602, 294], [726, 174], [780, 340]];
  return (
    <div className={styles.networkInstrument} role="img" aria-label={`Distributed inventory route: ${beat.description}`}>
      <svg viewBox="0 0 900 480" aria-hidden="true">
        <path className={styles.territory} d="M63 97 186 49l101 34 93-32 112 40 85 50 94 3 45 66-50 43-42 92-99 14-79 66-101-17-58-53-111-25-35-69-84-59 42-53Z" />
        <path className={styles.inventoryRoute} pathLength="1" d="M134 264C242 142 327 283 408 218s169-98 318-44" />
        <path className={styles.inventoryRoute} pathLength="1" d="M210 126c117 47 109 209 196 222s128-95 196-54 95 53 178 46" />
        {points.map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="7" />)}
      </svg>
      <div className={styles.geoBearing} aria-hidden="true"><i /><span>N / 041°</span></div>
      <div className={styles.routeReadout} aria-hidden="true"><span>DEMAND</span><i /><span>IN STOCK</span><i /><b>ROUTED</b></div>
    </div>
  );
}

function MembershipInstrument({ beat }: { beat: CinematicTimelineBeat }) {
  const capabilities = ["PURCHASING", "INVENTORY", "COMMERCE", "INTELLIGENCE"];
  return (
    <div className={styles.membershipInstrument} role="img" aria-label={`Member capability docking: ${beat.description}`}>
      <div className={styles.memberIdentity} aria-hidden="true"><b>YOUR</b><span>IDENTITY</span></div>
      <div className={styles.dockingOrbit} aria-hidden="true"><i /><i /><i /></div>
      <div className={styles.dockingCrosshair} aria-hidden="true"><i /><i /></div>
      <div className={styles.capabilities} aria-hidden="true">
        {capabilities.map((capability) => <span key={capability}>{capability}</span>)}
      </div>
      <small aria-hidden="true">IDENTITY PRESERVED / CAPABILITY MULTIPLIED</small>
    </div>
  );
}

function CommerceInstrument({ beat }: { beat: CinematicTimelineBeat }) {
  return (
    <div className={styles.commerceInstrument} role="img" aria-label={`Parts Gopher order route: ${beat.description}`}>
      <div className={styles.orderSignal} aria-hidden="true"><b>PG</b><span>ORDER</span></div>
      <svg viewBox="0 0 760 360" preserveAspectRatio="none" aria-hidden="true">
        <path pathLength="1" d="M82 180C250 180 292 68 500 68H742" />
        <path pathLength="1" d="M82 180H742" />
        <path pathLength="1" d="M82 180c168 0 210 112 418 112h242" />
      </svg>
      <div className={styles.memberOutputs} aria-hidden="true"><span>MEMBER A</span><span>MEMBER B</span><span>MEMBER C</span></div>
      <div className={styles.branchPulse} aria-hidden="true"><i /><i /><i /></div>
      <div className={styles.orderStages} aria-hidden="true"><span>DEMAND</span><span>MATCHED</span><span>ROUTED</span><span>FULFILLED</span><span>MEASURED</span></div>
    </div>
  );
}

function AccessInstrument({ beat }: { beat: CinematicTimelineBeat }) {
  return (
    <div className={styles.accessInstrument} role="img" aria-label={`Member access concept: ${beat.description}`}>
      <div className={styles.credential} aria-hidden="true"><i /><span>MEMBER<br />CREDENTIAL</span><b>03 / 21</b></div>
      <div className={styles.gateway} aria-hidden="true">
        <div className={styles.irisBlades}>{Array.from({ length: 8 }, (_, index) => <i key={index} />)}</div>
        <b className={styles.irisCore} />
        <span>PROTOTYPE</span>
      </div>
      <div className={styles.privateField} aria-hidden="true"><b>PRIVATE</b><span>TENANT MODEL</span></div>
      <small aria-hidden="true">ROLE · TENANT · SESSION · AUDIT</small>
    </div>
  );
}

function RouteInstrument({ route, beat }: { route: RouteFilmKind; beat: CinematicTimelineBeat }) {
  if (route === "about") return <AboutInstrument beat={beat} />;
  if (route === "advantage") return <AdvantageInstrument beat={beat} />;
  if (route === "network") return <NetworkInstrument beat={beat} />;
  if (route === "membership") return <MembershipInstrument beat={beat} />;
  if (route === "parts-gopher") return <CommerceInstrument beat={beat} />;
  return <AccessInstrument beat={beat} />;
}

export function RouteFilmHero({
  route,
  asset,
  titleId,
  eyebrow,
  title,
  description,
  facts,
  actions,
  className = "",
  scrollSpanVh = 320,
  priority = true,
}: RouteFilmHeroProps) {
  const [activeBeat, setActiveBeat] = useState(asset.beats[0]);
  const atmosphere = (
    <>
      <div className={styles.coordinateField} aria-hidden="true" />
    </>
  );
  const copy = (
    <>
      <div className={styles.routeMeta} aria-hidden="true"><span>{asset.title}</span><i /><b>{activeBeat.label}</b></div>
      <div className={styles.copy}>
        <p className={styles.eyebrow}><i aria-hidden="true" />{eyebrow}</p>
        <h1 id={titleId}>{title}</h1>
        <p className={styles.description}>{description}</p>
        <div className={styles.facts}>
          {facts.filter(Boolean).map((fact, index) => <span key={fact}><b>0{index + 1}</b>{fact}</span>)}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      <div className={styles.beatRail} aria-hidden="true">
        {asset.beats.map((beat) => <span key={beat.id} data-active={beat.id === activeBeat.id}><i />{beat.label}</span>)}
      </div>
    </>
  );
  const instrument = <RouteInstrument route={route} beat={activeBeat} />;
  const optics = (
    <div className={styles.foregroundOptic} data-route-optic={route} aria-hidden="true"><i /><i /><span /><b /></div>
  );

  const scene = route === "member-access" ? (
    <PointerDepthStage
      className={styles.depthStage}
      perspective={memberAccessCamera.perspective}
      travelX={memberAccessCamera.travelX}
      travelY={memberAccessCamera.travelY}
      travelZ={memberAccessCamera.travelZ}
      rotation={memberAccessCamera.rotation}
      response={memberAccessCamera.response}
      data-route-grammar={route}
    >
      <PointerDepthLayer className={styles.atmosphereLayer} depth={memberAccessCamera.atmosphereDepth} scale={1.08}>
        {atmosphere}
        <div className={styles.pointerLight} aria-hidden="true" />
      </PointerDepthLayer>
      <PointerDepthLayer className={styles.copyLayer} depth={memberAccessCamera.copyDepth}>
        {copy}
      </PointerDepthLayer>
      <PointerDepthLayer className={styles.instrumentLayer} depth={memberAccessCamera.instrumentDepth} scale={memberAccessCamera.instrumentScale}>
        {instrument}
      </PointerDepthLayer>
      <PointerDepthLayer className={styles.opticsLayer} depth={memberAccessCamera.opticsDepth} scale={memberAccessCamera.opticsScale}>
        {optics}
      </PointerDepthLayer>
    </PointerDepthStage>
  ) : (
    <div className={styles.scrollStage} data-route-grammar={route}>
      <div className={styles.atmosphereLayer}>{atmosphere}</div>
      <div className={styles.copyLayer}>{copy}</div>
      <div className={styles.instrumentLayer}>{instrument}</div>
      <div className={styles.opticsLayer}>{optics}</div>
    </div>
  );

  return (
    <ScrollScrubFilm
      asset={asset}
      ariaLabelledBy={titleId}
      className={`${styles.hero} ${styles[route]} ${className}`.trim()}
      mediaClassName={styles.filmMedia}
      scrollSpanVh={scrollSpanVh}
      priority={priority}
      decorative={false}
      onBeatChange={setActiveBeat}
    >
      {scene}
    </ScrollScrubFilm>
  );
}

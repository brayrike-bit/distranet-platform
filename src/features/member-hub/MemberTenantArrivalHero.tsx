"use client";

import Image from "next/image";
import type { MemberTenantBrand } from "@/domain/member-hub/types";
import {
  PointerDepthLayer,
  PointerDepthStage,
} from "@/components/cinematic/PointerDepthStage";
import { ScrollScrubFilm } from "@/components/cinematic/ScrollScrubFilm";
import { distranetCinematicMedia } from "@/components/cinematic/mediaManifest";
import styles from "./MemberTenantArrivalHero.module.css";
import { MemberBrandWelcome } from "./MemberBrandWelcome";
import { MemberFinishedFilmWelcome } from "./MemberFinishedFilmWelcome";
import { MEMBER_FINISHED_FILMS } from "./member-finished-films";

export function MemberTenantArrivalHero({
  tenant,
}: {
  tenant: MemberTenantBrand;
}) {
  const arrival = tenant.arrival;
  const finishedFilm = MEMBER_FINISHED_FILMS[tenant.slug];
  if (finishedFilm) return <MemberFinishedFilmWelcome tenant={tenant} asset={finishedFilm} />;
  if (!arrival.film) return <MemberBrandWelcome tenant={tenant} />;
  const arrivalFilm = distranetCinematicMedia[arrival.film];
  const { pointerDepth } = arrival.motion;
  const titleId = `tenant-arrival-${tenant.slug}-title`;
  const enterWorkspace = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("member-summary")?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <ScrollScrubFilm
      asset={arrivalFilm}
      className={styles.hero}
      frameClassName={styles.frame}
      mediaClassName={styles.media}
      scrollSpanVh={Math.max(420, arrival.motion.scrollSpanVh)}
      stickyTop="var(--member-hero-sticky-top, 16px)"
      priority
      decorative
    >
      <PointerDepthStage
        className={styles.depthStage}
        perspective={pointerDepth.perspective}
        travelX={0}
        travelY={0}
        travelZ={0}
        rotation={0}
        response={pointerDepth.response}
        role="region"
        aria-labelledby={titleId}
        data-tenant-arrival={tenant.slug}
        data-arrival-interaction="scroll-only-film"
      >
        <PointerDepthLayer className={styles.copyLayer} depth={0.12}>
          <div className={styles.tenantChip}>
            <div>
              <Image
                unoptimized
                src={tenant.logo.src}
                alt={tenant.logo.alt}
                width={tenant.logo.width}
                height={tenant.logo.height}
                priority
                sizes="172px"
              />
            </div>
            <span>Publicly reachable prototype</span>
          </div>
          <p>{arrival.eyebrow}</p>
          <h1 id={titleId}>
            {arrival.headlineLead}
            <span>{arrival.headlineSignal}</span>
          </h1>
          <p className={styles.lede}>
            {arrival.description}
          </p>
          <button type="button" onClick={enterWorkspace}>
            Enter the operating canvas <span aria-hidden="true">↘</span>
          </button>
        </PointerDepthLayer>

        <PointerDepthLayer className={styles.dataLayer} depth={0.32}>
          <div className={styles.contextRail}>
            <div className={styles.liveBadge}><i />Public prototype · no live auth</div>
            <dl aria-label={`${tenant.displayName} operating context`}>
              <div>
                <dt>{tenant.operatingContext.territory.label}</dt>
                <dd>
                  <strong>{tenant.operatingContext.territory.value}</strong>
                  <small>{tenant.operatingContext.territory.detail}</small>
                </dd>
              </div>
              <div>
                <dt>{tenant.operatingContext.network.label}</dt>
                <dd>
                  <strong>{tenant.operatingContext.network.value}</strong>
                  <small>{tenant.operatingContext.network.detail}</small>
                </dd>
              </div>
            </dl>
          </div>
        </PointerDepthLayer>
      </PointerDepthStage>
    </ScrollScrubFilm>
  );
}

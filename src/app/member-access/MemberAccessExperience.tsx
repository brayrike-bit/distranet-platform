import Link from "next/link";
import { Mark } from "@/components/Brand";
import { distranetCinematicMedia, type CinematicFilmAsset } from "@/components/cinematic/mediaManifest";
import { PublicFilmSequence, type PublicCinemaChapter } from "@/features/public-cinema";
import styles from "./member-gateway.module.css";

const film: CinematicFilmAsset = distranetCinematicMedia.memberAccessSecureEntry;
const chapters: readonly PublicCinemaChapter[] = [{
  id:"member-access-clean-entry", index:"01 / 01", label:"Your member workspace", eyebrow:"One network. Your company view.",
  title:"Welcome back.", accent:"Make the connection.",
  summary:"Open your company's branded workspace for commerce, orders, inventory, and member economics. This design preview uses demonstration data while authenticated reporting is prepared.",
  href:"/member-hub", action:"Choose your company", facts:["21 member workspaces", "Demonstration data"],
  durationSeconds:film.durationSeconds, fps:24, runwayVh:480,
  desktop:{poster:film.desktop.poster,sources:film.desktop.sources},
  mobile:film.mobile ? {poster:film.mobile.poster,sources:film.mobile.sources} : undefined,
  beats:film.beats, delivery:"ready",
}];

export function MemberAccessExperience() {
  return <div className={styles.page}>
    <header className={styles.header}><Link href="/" aria-label="Back to Distranet"><Mark tone="light" /></Link><span>Member workspace</span><Link href="/">Back to Distranet ↗</Link></header>
    <main id="main-content" tabIndex={-1}><PublicFilmSequence routeLabel="Distranet / Member access" chapters={chapters} />
      <section id="public-story" className={styles.gateway} aria-labelledby="member-gateway-title"><div><span className={styles.eyebrow}>Your identity. Your operating view.</span><h2 id="member-gateway-title">The network,<br /><em>through your lens.</em></h2><p>A familiar workspace, tailored to each member. Explore attributed commerce, fulfillment, financials, inventory, and aggregate network context.</p><div className={styles.examples}><img src="/brands/air-hydro-power/air-hydro-power.png" alt="Air Hydro Power" width="170" height="55" /><img src="/brands/afp-industries/logo.png" alt="AFP Industries" width="120" height="65" /><div><img src="/brands/connector-specialists/logo.png" alt="Connector Specialists" width="170" height="55" /></div></div></div><aside><span className={styles.preview}>Design preview</span><h3>Your company.<br />Your workspace.</h3><p>Choose from all 21 members to review company-specific branding and illustrative reporting.</p><Link className={styles.enter} href="/member-hub">Choose your company <span aria-hidden="true">↗</span></Link><Link className={styles.ahp} href="/member-hub/air-hydro-power">Open Air Hydro Power ↗</Link><small>This is not a password login. Production authentication, tenant isolation, and live data are not connected. No passwords or customer identities are collected here.</small></aside></section>
    </main><footer className={styles.footer}><span>© 2026 Distranet</span><Link href="/">Return to the public site ↗</Link><span>Aggregate-only demonstration data</span></footer>
  </div>;
}

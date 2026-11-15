import Link from "next/link";
import { Mark } from "./Brand";
import styles from "./PublicFooter.module.css";

const routes = [["Collective advantage", "/advantage"], ["The member network", "/network"], ["Parts Gopher", "/parts-gopher"], ["Distranet Direct", "/distranet-direct"], ["Membership", "/membership"], ["About Distranet", "/about"]] as const;

export function PublicFooter() {
  return <footer className={styles.editorialFooter}>
    <div className={styles.editorialDirectory}><Link href="/" className={styles.editorialBrand} aria-label="Distranet home"><Mark tone="light" /><p>The member-owned network for independent fluid power companies.</p></Link><nav aria-label="Explore Distranet">{routes.map(([label, href]) => <Link href={href} key={href}>{label}<span aria-hidden="true">↗</span></Link>)}</nav><div className={styles.memberEntry}><span>Already connected?</span><Link href="/member-access">Member workspace <b aria-hidden="true">↗</b></Link><p>Your company. Your operating view.</p></div></div>
    <div className={styles.editorialBottom}><span>© 2026 Distranet</span><span>Independent strength. Connected.</span><span>Member reporting preview uses illustrative data.</span></div>
  </footer>;
}

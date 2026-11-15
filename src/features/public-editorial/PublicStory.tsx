"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MEMBER_DIRECTORY } from "@/brands/member-directory";
import { PUBLIC_STORIES, type PublicRoute } from "./public-content";
import styles from "./public-editorial.module.css";
import { PublicBrandFilm } from "./PublicBrandFilm";

const CAPABILITY_FILTERS = ["All expertise", "Hydraulics", "Pneumatics", "Automation", "Hose", "Repair"] as const;

function NetworkGraphic({ active }: { active: number }) {
  return <div className={styles.networkDrawing} data-act={active}>
    <svg viewBox="0 0 720 560" fill="none" aria-hidden="true">
      <circle cx="360" cy="280" r="205" className={styles.guide} />
      <circle cx="360" cy="280" r="135" className={styles.guide} />
      {MEMBER_DIRECTORY.map((member, i) => {
        const angle = i / 21 * Math.PI * 2 - Math.PI / 2;
        const x = 360 + Math.cos(angle) * 205, y = 280 + Math.sin(angle) * 205;
        return <g key={member.slug}><path className={styles.drawLine} pathLength="1" d={`M360 280Q${(360 + x) / 2} ${280 + (y - 280) * .15} ${x} ${y}`} /><circle cx={x} cy={y} r={i % 3 === 0 ? 9 : 5} fill={i % 3 === active ? "#c82432" : "#d6b7b4"} /></g>;
      })}
      <circle cx="360" cy="280" r="87" fill="#fff" stroke="#e4c6c3" />
      <text x="360" y="283" textAnchor="middle" className={styles.coreText}>DISTRA<tspan fill="#c82432">NET</tspan></text>
      <text x="360" y="308" textAnchor="middle" className={styles.svgSmall}>MEMBER OWNED</text>
    </svg>
    <div className={styles.graphicCaption}><strong>21</strong><span>Independent companies.<br />One shared organization.</span></div>
  </div>;
}

function LeverageGraphic({ active }: { active: number }) {
  return <div className={styles.leverageDrawing} data-act={active}>
    <div className={styles.memberInputs}>{[MEMBER_DIRECTORY[1], MEMBER_DIRECTORY[2], MEMBER_DIRECTORY[3]].map(member => <div key={member.slug} style={{ background: member.logoBackground }}><img src={member.logo} alt={member.name} width="230" height="70" /></div>)}</div>
    <svg viewBox="0 0 720 540" fill="none" aria-hidden="true"><path className={styles.drawLine} pathLength="1" d="M130 110C360 110 240 270 470 270M130 270H470M130 430C360 430 240 270 470 270M470 270H640" /><circle cx="475" cy="270" r="10" fill="#c82432" /></svg>
    <div className={styles.collectivePlate}><span>Collective position</span><strong>Stronger<br />together.</strong><i /><small>Independent control remains local.</small></div>
    <div className={styles.diagramIndex}>21 → 1 → YOU</div>
  </div>;
}

function CommerceGraphic({ route, active }: { route: PublicRoute; active: number }) {
  const direct = route === "distranet-direct";
  return <div className={styles.commerceDrawing} data-act={active}>
    <header><span>{direct ? "DISTRANET DIRECT" : "PARTS GOPHER"}</span><b>{direct ? "Multi-brand sourcing" : "Parker products only"}</b></header>
    <div className={styles.searchIllustration}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6" /><path d="m15 15 5 5" /></svg><span>{["A product requirement", direct ? "Available brands + supply paths" : "Inventory + customer geography", direct ? "A sourcing response" : "Member fulfillment"][active]}</span></div>
    <svg className={styles.commercePaths} viewBox="0 0 640 200" fill="none" aria-hidden="true"><path className={styles.drawLine} pathLength="1" d="M320 0V70Q320 95 295 95H120Q95 95 95 120V190M320 70V190M320 70Q320 95 345 95H520Q545 95 545 120V190" /></svg>
    <div className={styles.outputTiles}>{(direct ? ["Product match", "Supplier access", "Network source"] : ["Member A", "Member B", "Member C"]).map((name, i) => <div key={name} data-selected={i === active}><span>0{i + 1}</span><strong>{name}</strong><small>{direct ? "Available sourcing path" : "Allocated seller lines"}</small></div>)}</div>
    <p>Conceptual process · no live order data</p>
  </div>;
}

function MembershipGraphic({ active }: { active: number }) {
  return <div className={styles.membershipDrawing} data-act={active}>
    <div className={styles.identityPlaque}><small>THE NEXT CONNECTION</small><strong>Your<br /><span>company.</span></strong><p>Keep your identity.<br />Build on your capabilities.</p></div>
    <svg viewBox="0 0 640 500" fill="none" aria-hidden="true"><circle className={styles.drawLine} pathLength="1" cx="320" cy="250" r="210" /><circle className={styles.guide} cx="320" cy="250" r="175" /></svg>
    <span className={styles.memberPill}>Member owned</span><span className={styles.memberPill}>Locally operated</span>
  </div>;
}

export function PublicStory({ route }: { route: PublicRoute }) {
  const content = PUBLIC_STORIES[route];
  const diagramRef = useRef<HTMLElement>(null);
  const manualScrollY = useRef<number | null>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [query, setQuery] = useState("");
  const [capability, setCapability] = useState<string>(CAPABILITY_FILTERS[0]);
  const fullRoster = route === "network";
  const showRoster = fullRoster || route === "home";
  const showStorefronts = route === "home" || route === "parts-gopher" || route === "distranet-direct";
  const filtered = MEMBER_DIRECTORY.filter(member => {
    const matchesQuery = [member.name, member.headquarters, ...member.capabilities].join(" ").toLowerCase().includes(query.trim().toLowerCase());
    const capabilityQuery = capability === "Hydraulics" ? "hydraulic" : capability === "Pneumatics" ? "pneumatic" : capability.toLowerCase();
    const matchesCapability = capability === CAPABILITY_FILTERS[0] || member.capabilities.some(value => value.toLowerCase().includes(capabilityQuery));
    return matchesQuery && matchesCapability;
  });
  const roster = fullRoster ? filtered : MEMBER_DIRECTORY.slice(0, 6);
  const chapters = [
    { href: "#operating-model", title: content.chapterLabels[0], note: "The operating model" },
    fullRoster ? { href: "#member-companies", title: "Find your connection", note: "The member directory" }
      : showStorefronts ? { href: "#public-storefronts", title: "Choose the right storefront", note: "Parker only / multi-brand" }
        : { href: "#member-principle", title: "Independent, by design", note: "The member-first principle" },
    { href: "#public-details", title: content.chapterLabels[1], note: "The details that matter" },
  ];

  useEffect(() => {
    const root = diagramRef.current;
    if (!root) return;
    manualScrollY.current = null;
    const articles = Array.from(root.querySelectorAll<HTMLElement>("[data-story-step]"));
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (innerHeight * .7 - rect.top) / Math.max(1, rect.height - innerHeight * .25)));
      root.style.setProperty("--story-progress", motion.matches ? "1" : progress.toFixed(4));
      if (manualScrollY.current !== null && Math.abs(scrollY - manualScrollY.current) > 48) manualScrollY.current = null;
      if (manualScrollY.current === null) {
        const readingLine = innerHeight * .5;
        const centers = articles.map(article => {
          const bounds = article.getBoundingClientRect();
          return bounds.top + bounds.height / 2;
        });
        const next = centers.reduce((nearest, center, i) => Math.abs(center - readingLine) < Math.abs(centers[nearest] - readingLine) ? i : nearest, 0);
        if (next !== activeRef.current) { activeRef.current = next; setActive(next); }
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    motion.addEventListener("change", schedule);
    return () => { cancelAnimationFrame(frame); removeEventListener("scroll", schedule); removeEventListener("resize", schedule); motion.removeEventListener("change", schedule); };
  }, [route]);

  const graphic = route === "home" || route === "network" ? <NetworkGraphic active={active} /> : route === "advantage" || route === "about" ? <LeverageGraphic active={active} /> : route === "membership" ? <MembershipGraphic active={active} /> : <CommerceGraphic route={route} active={active} />;

  return <div className={styles.story} data-story-route={route}>
    <section id="public-story" className={styles.intro} aria-labelledby="public-story-title">
      <div className={styles.introMeta}><span>{content.eyebrow}</span><span>Distranet / {route === "home" ? "Member-owned network" : content.label}</span></div>
      <h2 id="public-story-title">{content.title}<br /><em>{content.accent}</em></h2>
      <div className={styles.introBottom}><p>{content.intro}</p><a href="#operating-model">Explore the idea <span aria-hidden="true">↓</span></a></div>
    </section>

    <nav className={styles.storyIndex} aria-label={`In this story: ${content.label}`}>
      <span>In this story</span>
      <ol>{chapters.map((chapter, i) => <li key={chapter.href}><a href={chapter.href}><b>0{i + 1}</b><span><small>{chapter.note}</small>{chapter.title}</span><span aria-hidden="true">↓</span></a></li>)}</ol>
    </nav>

    {route === "home" && <PublicBrandFilm />}

    <section ref={diagramRef} id="operating-model" className={styles.model} aria-labelledby="operating-model-title">
      <div className={styles.modelVisual}><div className={styles.visualHeading}><span>The operating model</span><b>0{active + 1} / 03</b></div>{graphic}<p className={styles.visualNote}>{content.diagramNote}</p><div className={styles.modelControls} role="group" aria-label="Choose a step to explore">{content.steps.map((step, i) => <button key={step.title} type="button" aria-pressed={active === i} aria-controls={`story-step-${i + 1}`} onClick={() => { manualScrollY.current = scrollY; activeRef.current = i; setActive(i); }}><span>0{i + 1}</span>{step.signal}</button>)}</div><div className={styles.modelOutcome}><span>What this means</span><p key={active}>{content.steps[active].outcome}</p></div></div>
      <div className={styles.modelCopy}><span className={styles.eyebrow}>Connection, explained.</span><h2 id="operating-model-title">{content.diagramTitle}</h2>{content.steps.map((step, i) => <article key={step.title} id={`story-step-${i + 1}`} data-story-step={i} data-active={active === i}><span>0{i + 1}</span><div><h3>{step.title}</h3><p>{step.copy}</p></div></article>)}</div>
    </section>

    <section id="member-principle" className={styles.statement} aria-label="The member-first principle"><span>Independent strength. Connected.</span><h2>{content.statement}</h2><p>{content.statementDetail}</p><div aria-hidden="true" className={styles.statementMark}>↗</div></section>

    {showRoster && <section id="member-companies" className={styles.roster} aria-labelledby="public-members-title">
      <header><div><span className={styles.eyebrow}>The people behind the network</span><h2 id="public-members-title">Independent names.<br /><em>Collective strength.</em></h2></div>{fullRoster ? <label>Find a member<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Name, location, or capability" aria-controls="member-results" /></label> : <Link href="/network">Meet all 21 members <span aria-hidden="true">↗</span></Link>}</header>
      {fullRoster && <div className={styles.rosterTools}><div className={styles.capabilityFilters} role="group" aria-label="Filter members by listed expertise">{CAPABILITY_FILTERS.map(value => <button type="button" key={value} aria-pressed={capability === value} aria-controls="member-results" onClick={() => setCapability(value)}>{value}</button>)}</div><p className={styles.resultCount} role="status">{roster.length} of {MEMBER_DIRECTORY.length} member companies{capability !== CAPABILITY_FILTERS[0] ? ` · ${capability}` : ""}</p></div>}
      <div id="member-results" className={styles.memberGrid}>{roster.map(member => <a href={member.website} key={member.slug} target="_blank" rel="noreferrer" className={styles.memberLink}><div className={styles.logoPlate} style={{ background: member.logoBackground }}><img src={member.logo} alt={`${member.name} logo`} width="260" height="88" loading="lazy" /></div><div><h3>{member.name}</h3><span>{member.headquarters}</span><p className={styles.memberCapabilities}>{member.capabilities.join(" · ")}</p></div><b aria-hidden="true">↗</b></a>)}</div>
      {!roster.length && <div className={styles.emptyMembers}><p>No member matches those filters. Try another name, location, or expertise.</p><button type="button" onClick={() => { setQuery(""); setCapability(CAPABILITY_FILTERS[0]); }}>Reset member search <span aria-hidden="true">↗</span></button></div>}
      <p className={styles.rosterNote}>Member identities, listed capabilities, and public company locations are based on the official Distranet directory and member websites. Filters match the expertise listed here; they are not an exhaustive qualification or a service-territory map. Member links open the company website in a new tab.</p>
    </section>}

    {showStorefronts && <section id="public-storefronts" className={styles.storefronts} aria-labelledby="storefronts-title"><header><span className={styles.eyebrow}>Distinct storefronts. Shared ownership.</span><h2 id="storefronts-title">Two routes to<br /><em>industrial opportunity.</em></h2></header><div className={styles.storefrontPair}><Link href="/parts-gopher" className={styles.gopherCard}><small>01 / PARKER ONLY</small><h3>Parts<br /><span>Gopher.</span></h3><p>Parker product demand, connected to member inventory and fulfillment.</p><span className={styles.cardAction}>Explore Parts Gopher ↗</span></Link><Link href="/distranet-direct" className={styles.directCard}><small>02 / MULTI-BRAND SOURCING</small><h3>Distranet<br /><span>Direct.</span></h3><p>The brands and products we can source through supplier and network access.</p><span className={styles.cardAction}>Explore Distranet Direct ↗</span></Link></div></section>}

    <section id="public-details" className={styles.details} aria-labelledby="public-details-title"><div><span className={styles.eyebrow}>The details matter.</span><h2 id="public-details-title">Clear by design.</h2><p>Useful context. Straight answers.<br />No inflated promises.</p></div><div>{content.details.map((item, i) => <details key={item.title} open={i === 0}><summary>{item.title}<span aria-hidden="true">+</span></summary><p>{item.copy}</p></details>)}</div></section>

    <section className={styles.next}><div><span className={styles.eyebrow}>Your next connection</span><h2>{content.nextTitle}</h2><p>{content.nextCopy}</p></div><div className={styles.nextActions}><Link href={content.nextHref} className={styles.primaryLink}>{content.nextAction}<span aria-hidden="true">↗</span></Link><Link href="/member-access">Already a member? Open your workspace <span aria-hidden="true">↗</span></Link></div></section>
  </div>;
}

"use client";

import { useMemo, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { networkMembers } from "./network-data";
import styles from "./network.module.css";

function ArrowUpRight() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 15 15 5M7 5h8v8" /></svg>;
}

function moveMapNode(
  event: ReactKeyboardEvent<SVGGElement>,
  index: number,
  onSelect: (memberId: number) => void,
) {
  let nextIndex: number | null = null;

  if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % networkMembers.length;
  if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + networkMembers.length) % networkMembers.length;
  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = networkMembers.length - 1;
  if (nextIndex === null) return;

  event.preventDefault();
  const nextMember = networkMembers[nextIndex];
  onSelect(nextMember.id);
  (document.getElementById(`atlas-member-node-${nextMember.id}`) as HTMLElement | null)?.focus();
}

export function MemberAtlas() {
  const [activeId, setActiveId] = useState(3);
  const [query, setQuery] = useState("");
  const activeMember = networkMembers.find((member) => member.id === activeId) ?? networkMembers[0];
  const filteredMembers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return networkMembers;
    return networkMembers.filter((member) => `${member.name} ${member.city} ${member.region}`.toLowerCase().includes(normalized));
  }, [query]);

  return <div className={styles.atlasExperience}>
    <div className={styles.atlasMapPanel}>
      <div className={styles.atlasTopline}>
        <span>CURRENT COUNT / 21 COMPANIES</span>
        <span>LEADERSHIP CONFIRMED AUG 7 2026</span>
      </div>
      <svg className={styles.atlasMap} viewBox="0 0 1000 560" role="group" aria-labelledby="atlas-map-title atlas-map-description">
        <title id="atlas-map-title">Working Distranet member headquarters map</title>
        <desc id="atlas-map-description">An illustrative map plotting a working roster of twenty-one company and headquarters references across the United States and Canada. The count is leadership confirmed; the identities and locations remain pending roster reconciliation.</desc>
        <defs>
          <pattern id="atlas-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0H0V28" fill="none" stroke="#ffffff" strokeOpacity=".055" strokeWidth="1" />
          </pattern>
          <radialGradient id="atlas-pulse">
            <stop offset="0" stopColor="#ed1c24" stopOpacity=".5" />
            <stop offset="1" stopColor="#ed1c24" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1000" height="560" fill="url(#atlas-grid)" />
        <path className={styles.landMass} d="M95 153 127 119l76-9 35 20 58-18 45 25 66-8 59 19 63-15 55 21 68-25 66 30 68-13 76 36-26 30-48 8-28 31-59 14-27 47-55 19-30 51-61 26-32 58-72 6-49-19-60 26-74-7-42-50-49-14-44-44-27-50 13-34-30-40 5-57-44-37 30-33-11-34Z" />
        <path className={styles.landMassSecondary} d="m173 111 17-54 58-20 91 12 71-24 76 30 83-19 97 28 73-12 92 43 66 42-86 14-51-10-54 16-66-24-57 18-57-22-72 13-65-20-50 16-66-27Z" />
        <path className={styles.regionLine} d="M239 137 252 411M340 138l4 318M452 144l-8 319M555 146l-5 266M660 148l-27 234M752 166l-43 171" />
        <path className={styles.regionLine} d="M126 213c211 22 404 11 695-8M145 287c213 21 391 18 628-4M183 357c160 17 348 19 498 1" />

        {networkMembers.map((member) => activeMember.id === member.id ? null : <path
          key={`route-${member.id}`}
          className={styles.atlasConnection}
          d={`M${activeMember.mapX} ${activeMember.mapY} Q${(activeMember.mapX + member.mapX) / 2} ${(activeMember.mapY + member.mapY) / 2 - 24} ${member.mapX} ${member.mapY}`}
        />)}

        {networkMembers.map((member, index) => {
          const active = member.id === activeMember.id;
          return <g
            key={member.id}
            id={`atlas-member-node-${member.id}`}
            className={active ? styles.mapNodeActive : styles.mapNode}
            role="button"
            tabIndex={active ? 0 : -1}
            aria-label={`${member.name}, ${member.city}, ${member.region}`}
            aria-pressed={active}
            aria-controls="atlas-member-readout"
            onClick={() => setActiveId(member.id)}
            onPointerEnter={() => setActiveId(member.id)}
            onFocus={() => setActiveId(member.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setActiveId(member.id);
                return;
              }
              moveMapNode(event, index, setActiveId);
            }}
          >
            <circle className={styles.mapNodeHit} cx={member.mapX} cy={member.mapY} r="1" />
            <circle className={styles.mapNodePulse} cx={member.mapX} cy={member.mapY} r={active ? 32 : 18} />
            <circle className={styles.mapNodeRing} cx={member.mapX} cy={member.mapY} r={active ? 10 : 6} />
            <circle className={styles.mapNodeCore} cx={member.mapX} cy={member.mapY} r={active ? 4 : 2.5} />
            {active && <g className={styles.mapNodeLabel}>
              <rect x={member.mapX + 13} y={member.mapY - 39} width="154" height="47" rx="2" />
              <text x={member.mapX + 25} y={member.mapY - 19}>{member.shortName.toUpperCase()}</text>
              <text x={member.mapX + 25} y={member.mapY - 4}>{member.city.toUpperCase()} / {member.region.toUpperCase()}</text>
            </g>}
          </g>;
        })}
        <g className={styles.atlasCompass} transform="translate(909 438)">
          <circle r="36" />
          <path d="M0-26V26M-26 0h52" />
          <path d="m0-18 5 11-5-3-5 3Z" />
          <text x="0" y="-43" textAnchor="middle">N</text>
        </g>
      </svg>

      <div className={styles.atlasReadout} id="atlas-member-readout" aria-live="polite">
        <span>{String(activeMember.id).padStart(2, "0")} / 21</span>
        <div>
          <p>SELECTED MEMBER</p>
          <strong>{activeMember.name}</strong>
          <small>{activeMember.city}, {activeMember.region}</small>
        </div>
        <a href={activeMember.website} target="_blank" rel="noreferrer">Visit company <ArrowUpRight /></a>
      </div>
    </div>

    <div className={styles.directoryPanel}>
      <div className={styles.directoryHeader}>
        <div>
          <p className={styles.microLabel}>Working member roster</p>
          <h3>Independent operators.<br />{" "}Connected reach.</h3>
        </div>
        <label className={styles.directorySearch}>
          <span className={styles.visuallyHidden}>Search member companies or locations</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 5 5"/></svg>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search company or location" />
        </label>
      </div>

      <div className={styles.directoryList} aria-live="polite">
        {filteredMembers.length ? filteredMembers.map((member) => <button
          type="button"
          key={member.id}
          className={member.id === activeId ? styles.directoryItemActive : styles.directoryItem}
          onClick={() => setActiveId(member.id)}
          onPointerEnter={() => setActiveId(member.id)}
          aria-pressed={member.id === activeId}
        >
          <span>{String(member.id).padStart(2, "0")}</span>
          <strong>{member.name}</strong>
          <small>{member.city}, {member.region}</small>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5" /></svg>
        </button>) : <p className={styles.noResults}>No member matches “{query}”. Try a company, city, or region.</p>}
      </div>
      <p className={styles.atlasDisclaimer}>Leadership confirmed 21 current companies on Aug. 7, 2026. The member identities and headquarters shown here are working references pending roster reconciliation after consolidation. Positions and territory fields are illustrative; service reach and commercial boundaries may differ.</p>
    </div>
  </div>;
}

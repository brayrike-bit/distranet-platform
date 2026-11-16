"use client";

import { useState } from "react";
import type { MemberSlug } from "@/domain/member-hub/types";
import { DataTable, Metrics, Section, styles, WorkspaceIntro } from "./ParityUI";
import { downloadPreview, previewCsv } from "./parity-data";
import { EDI_STATUSES, ediFixture, ediOutstanding, filterEdiPeers, summarizeEdi, type EdiDirection, type EdiStatus } from "./edi-preview-data";

const sections = [["edi-outstanding", "Outstanding connections"], ["edi-peer-matrix", "Peer matrix"]] satisfies [string, string][];
const directionLabel = { buying: "Buying from peer", selling: "Selling to peer" } as const;

function Status({ status }: { status: EdiStatus }) {
  return <span className={styles.badge}>{status}</span>;
}

export function MemberEdiCompliance({ member }: { member: MemberSlug }) {
  const [peer, setPeer] = useState("all");
  const [direction, setDirection] = useState<EdiDirection | "all">("all");
  const [status, setStatus] = useState<EdiStatus | "all">("all");
  const peers = ediFixture(member);
  const summary = summarizeEdi(peers);
  const matching = filterEdiPeers(peers, { peer, direction, status });
  const outstanding = ediOutstanding(matching, direction, status);

  function exportMatrix() {
    downloadPreview(member + "-edi-matrix-illustrative.csv", previewCsv([
      ["Illustrative EDI compliance matrix — no live ERP or member connection data"],
      ["Sample trading partner", "Buying from peer", "Selling to peer"],
      ...peers.map(row => [row.label, row.buying, row.selling]),
    ]));
  }

  return <div className={styles.workspace} data-member-module="edi-compliance">
    <WorkspaceIntro icon="operations" title="EDI Compliance" description="Review illustrative buying and selling connections across 20 fictional trading partners. This preview does not test ERP connectivity or use live member data." sections={sections} />
    <Section id="edi-overview" title="EDI readiness" description="Readiness is live directions divided by applicable directions. Testing and open connections count as outstanding; not-applicable directions do not count."
      action={<button className={styles.button} data-action="primary" type="button" onClick={exportMatrix}>Export full matrix CSV</button>}>
      <Metrics items={[
        ["EDI live completion", summary.completion === null ? "Not available" : summary.completion.toFixed(1) + "%", summary.live + " of " + summary.total + " applicable directions"],
        ["Live directions", summary.live, "Illustrative active connections"],
        ["Testing", summary.testing, "Not counted as live"],
        ["Open", summary.open, "Connection setup needed in the example"],
      ]} />
      <div className={styles.toolbar}>
        <label className={styles.field}>Trading partner<select value={peer} onChange={event => setPeer(event.target.value)}>
          <option value="all">All demo partners</option>{peers.map(row => <option key={row.id} value={row.id}>{row.label}</option>)}
        </select></label>
        <label className={styles.field}>Direction<select value={direction} onChange={event => setDirection(event.target.value as EdiDirection | "all")}>
          <option value="all">Both directions</option><option value="buying">Buying from peer</option><option value="selling">Selling to peer</option>
        </select></label>
        <label className={styles.field}>Connection status<select value={status} onChange={event => setStatus(event.target.value as EdiStatus | "all")}>
          <option value="all">All statuses</option>{EDI_STATUSES.map(value => <option key={value}>{value}</option>)}
        </select></label>
        {(peer !== "all" || direction !== "all" || status !== "all") && <button className={styles.button} type="button" onClick={() => {
          setPeer("all"); setDirection("all"); setStatus("all");
        }}>Clear filters</button>}
      </div>
      <p className={styles.muted} role="status">{matching.length} matching {matching.length === 1 ? "partner" : "partners"} · {outstanding.length} outstanding {outstanding.length === 1 ? "direction" : "directions"}. Readiness totals and the export always cover the full sample.</p>
    </Section>
    <Section id="edi-outstanding" title="Outstanding connections" description="The sample follow-up queue covers open and testing directions. Open items are listed first.">
      {outstanding.length
        ? <DataTable caption="Illustrative EDI directions requiring follow-up" heads={["Sample trading partner", "Direction", "Status", "Example next action"]}
          rows={outstanding.map(item => [item.peer.label, directionLabel[item.direction], <Status status={item.status} />, item.action])} />
        : <p className={styles.note}>No outstanding directions match these filters.</p>}
    </Section>
    <Section id="edi-peer-matrix" title="Peer connection matrix" description="Both directions are shown for each matching partner, even if only one direction matched the filter.">
      <DataTable caption="Illustrative paired EDI connection matrix" heads={["Sample trading partner", "Buying from peer", "Selling to peer"]}
        rows={matching.map(row => [row.label, <Status status={row.buying} />, <Status status={row.selling} />])} />
    </Section>
  </div>;
}

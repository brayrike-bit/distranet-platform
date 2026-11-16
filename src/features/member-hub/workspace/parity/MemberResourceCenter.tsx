"use client";

import Link from "next/link";
import { useState } from "react";
import type { MemberSlug } from "@/domain/member-hub/types";
import { MemberIcon } from "../../components/MemberIcon";
import { useMemberReportingPeriod } from "../MemberWorkspaceShell";
import { memberWorkspacePeriodHref } from "../member-workspace-navigation";
import type { MemberModuleRoute } from "../member-workspace-routes";
import { DataTable, ModuleWorkspace, Section, styles, usePreviewState, WorkspaceIntro } from "./ParityUI";
import { demandFixture, downloadPreview, previewCsv, summarizeDemand } from "./parity-data";
import { ediFixture } from "./edi-preview-data";
import { makeSampleStock, transferBalance } from "./sample-stock-model";

const feeds = [
  { group: "Inventory", files: ["dsinv.dca", "dsinv.dfi", "master_inv3.csv"] },
  { group: "Locations", files: ["location.csv", "location.txt"] },
  { group: "Members", files: ["members.csv", "members.txt"] },
  { group: "Manufacturers", files: ["manufacturer.csv", "manufacturer.txt", "mfgcode.csv", "mfgcode.txt", "mfgdiv.csv", "mfgdiv.txt"] },
];
const resources = [
  ["Distranet GPO network overview", "Program directory"], ["UniShippers", "Express and freight"],
  ["Organizational Results / ResultsAI", "Fluid-power program"], ["Care Connect", "Supplemental health"],
  ["Vestis", "Uniforms and workplace"], ["Engine", "Travel"],
  ["Revalgo", "Program one-pager"], ["Veritiv", "Packaging"], ["Aithentic", "IT asset management"],
];
const sampleTemplates: Record<string, string[][]> = {
  "dsinv.dca": [["DEMO-CPL-12", "DEMO-01", "3", "CHANGE"]],
  "dsinv.dfi": [["DEMO-CPL-12", "DEMO-01", "12"], ["DEMO-VLV-38", "DEMO-01", "8"]],
  "master_inv3.csv": [["member", "branch", "part", "quantity"], ["Demo member", "DEMO-01", "DEMO-CPL-12", "12"]],
  "location.csv": [["code", "name", "region"], ["DEMO-01", "Demo central branch", "Central"]],
  "members.csv": [["code", "name", "status"], ["DEMO-MEMBER", "Fictional member", "Active"]],
  "manufacturer.csv": [["code", "name"], ["DEMO-MFG", "Demo Hydraulics"]],
  "mfgcode.csv": [["manufacturer_code", "marketing_code"], ["DEMO-MFG", "DEMO-01"]],
  "mfgdiv.csv": [["manufacturer_code", "division_code"], ["DEMO-MFG", "DEMO-CPL"]],
};
function sampleFor(slot: string) {
  const rows = [["ILLUSTRATIVE ONLY - NOT AN INTEGRATION SCHEMA"], ...(sampleTemplates[slot.replace(/\.txt$/, ".csv")] ?? [])];
  return slot.endsWith(".csv") ? previewCsv(rows) : rows.map(row => row.join("\t")).join("\n") + "\n";
}
const topics = ["Inventory refresh reminder", "GPO program briefing", "Weekly trade opportunity digest", "Report availability notice"];
const audiences = ["Member operations team", "Member leadership", "Member purchasing team"];
type Draft = { topic: string; audience: string; attachSample: boolean };
type AttachmentReceipt = { slot: string; bytes: number; hash: string; matchesBuiltInSample: boolean };

export function MemberResourceCenter({ member, name, selected }: { member: MemberSlug; name: string; selected?: MemberModuleRoute }) {
  const { period } = useMemberReportingPeriod();
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [slot, setSlot] = useState("location.csv");
  const [receipt, setReceipt] = useState<AttachmentReceipt>();
  const [attachedSlots, setAttachedSlots] = usePreviewState<string[]>(member + ":sample-file-attachments", []);
  const [fileStatus, setFileStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [drafts, setDrafts] = usePreviewState<Draft[]>(member + ":communication-drafts", []);
  const [draftStatus, setDraftStatus] = useState("");
  const [topic, setTopic] = useState(topics[0]);
  const [audience, setAudience] = useState(audiences[0]);
  const [attachSample, setAttachSample] = useState(false);
  const files = feeds.flatMap(group => group.files.map(filename => ({ filename, group: group.group })));
  const visibleFiles = files.filter(file => (category === "all" || file.group === category)
    && (file.filename + " " + file.group).toLowerCase().includes(query.trim().toLowerCase()));
  function downloadReport(report: "shared-inventory" | "edi-matrix" | "buy-sell" | "dead-excess" | "demand-signal") {
    const stock = makeSampleStock(member, name);
    let rows: Parameters<typeof previewCsv>[0];
    switch (report) {
      case "shared-inventory":
        rows = [["Transfer", "Month", "Direction", "Gross USD", "Exemption USD", "Adjusted USD", "Sample fee USD"], ...stock.transfers.map(item => {
          const result = transferBalance(item);
          return [item.id, item.month, item.flow, item.grossCents / 100, item.exemptionCents / 100, result.adjusted / 100, result.fee / 100];
        })];
        break;
      case "edi-matrix":
        rows = [["Sample partner", "Buying from peer", "Selling to peer"], ...ediFixture(member).map(peer => [peer.label, peer.buying, peer.selling])];
        break;
      case "buy-sell":
        rows = [["Opportunity", "Side", "Part", "Description", "Quantity", "Illustrative value USD"], ...stock.matches.map(match => [match.id, match.side, match.sku, match.description, match.units, match.valueCents / 100])];
        break;
      case "dead-excess":
        rows = [["Part", "Class", "Branch", "Confirmed units", "Flagged units", "Replacement unit cost USD"], ...stock.lots.filter(lot => lot.owner === name && lot.kind !== "Standard").map(lot => [
          lot.sku, lot.kind, lot.location ?? "Unconfirmed", lot.location ? lot.quantity : 0, lot.location ? 0 : lot.quantity, lot.replacementCents / 100,
        ])];
        break;
      case "demand-signal": {
        const demand = demandFixture(member);
        rows = [["Month", "Searches", "Impressions", "Top impression rate %", "Lost impression share %"], ...[...new Set(demand.map(row => row.month))].map(month => {
          const result = summarizeDemand(demand.filter(row => row.month === month));
          return [month, result.searches, result.impressions, result.top?.toFixed(1) ?? null, result.lost?.toFixed(1) ?? null];
        })];
        break;
      }
    }
    downloadPreview(member + "-" + report + "-illustrative.csv", previewCsv([["Illustrative baseline snapshot, excluding changes made in this browser tab"], ...rows]));
  }

  async function validateFile(file?: File) {
    setReceipt(undefined); setFileStatus("");
    if (!file) return;
    if (file.name !== slot) { setFileStatus("Choose a file named " + slot + " for this slot."); return; }
    if (file.size === 0 || file.size > 5_000_000) { setFileStatus("Choose a non-empty demonstration file, no larger than 5 MB."); return; }
    if (!globalThis.crypto?.subtle) { setFileStatus("Local file verification needs a secure browser context."); return; }
    setBusy(true);
    try {
      const bytes = await file.arrayBuffer();
      const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
      const sampleDigest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(sampleFor(slot)));
      setReceipt({ slot, bytes: file.size, hash: Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join(""),
        matchesBuiltInSample: new Uint8Array(digest).every((byte, index) => byte === new Uint8Array(sampleDigest)[index]) });
      setFileStatus("Name, file size and SHA-256 checked locally. Contents were not validated against a production schema. Nothing was uploaded.");
    } catch {
      setFileStatus("Could not read the sample file. Choose it again to retry.");
    } finally {
      setBusy(false);
    }
  }

  return <ModuleWorkspace selected={selected} related={selected?.section === "downloads" ? ["import-check"] : []}
    intro={<WorkspaceIntro icon="download" title="Resource center" description="Find the files, program materials, reporting exports and team updates your workspace depends on." sections={[["communications", "Communications"], ["downloads", "Downloads"], ["import-check", "Sample import check"]]} />}>
    <Section id="communications" title="Communications" description="Read illustrative network messages and practice drafting a notice for your team. Nothing is sent.">
      <div className={styles.cards}>
        <article className={styles.card}><span className={styles.badge}>Network notice</span><h3>Inventory file readiness</h3><p>Check branch codes before submitting a refresh. Use the sample import check to verify the expected filename.</p><Link href={memberWorkspacePeriodHref(member, "downloads", period) + "#import-check"}>Open import check</Link></article>
        <article className={styles.card}><span className={styles.badge}>Purchasing bulletin</span><h3>GPO program review</h3><p>Review your enrollment and retained-savings examples before the next purchasing discussion.</p><Link href={memberWorkspacePeriodHref(member, "gpo-dashboard", period)}>Review programs</Link></article>
      </div>
      <details><summary>Compose a sample notice</summary>
        <form className={styles.form} onSubmit={event => {
          event.preventDefault();
          setDrafts([{ topic, audience, attachSample }, ...drafts].slice(0, 20));
          setDraftStatus("Saved an illustrative draft in this tab. No message was sent.");
        }}>
          <label className={styles.field}>Topic<select value={topic} onChange={e => setTopic(e.target.value)}>{topics.map(value => <option key={value}>{value}</option>)}</select></label>
          <label className={styles.field}>Audience<select value={audience} onChange={e => setAudience(e.target.value)}>{audiences.map(value => <option key={value}>{value}</option>)}</select></label>
          <label className={styles.check}><input type="checkbox" checked={attachSample} onChange={e => setAttachSample(e.target.checked)} /> Include an illustrative attachment</label>
          <div className={styles.note}><strong>Preview: {topic}</strong><br />To: {audience}{attachSample && <> · <button className={styles.button} type="button" onClick={() => downloadPreview("location-illustrative.csv", sampleFor("location.csv"))}>Download sample attachment</button></>}</div>
          <button className={styles.button} data-action="primary">Save sample draft</button>
          <p className={draftStatus ? styles.note : styles.srOnly} role="status">{draftStatus}</p>
        </form>
      </details>
      <details><summary>Notification outbox ({drafts.length})</summary><DataTable caption="Sample notices saved in this browser tab; not sent" heads={["Topic", "Audience", "Attachment", "Delivery"]} rows={drafts.map(draft => [draft.topic, draft.audience, draft.attachSample ? "Illustrative template" : "None", "Not sent"])} /></details>
    </Section>
    <Section id="downloads" title="Downloads and file catalog" description="Download clearly marked samples and see which production resources require an authorized source. No partner PDFs or member data were imported.">
      <h3>Downloadable sample reports</h3>
      <p className={styles.muted}>These are baseline exports for this workspace. Open a tool to export its current filters or browser-tab changes.</p>
      <div className={styles.toolbar}>
        {([["shared-inventory", "Shared Inventory"], ["edi-matrix", "EDI matrix"], ["buy-sell", "Buy/Sell"], ["dead-excess", "Dead & Excess Stock"], ["demand-signal", "DemandSignal"]] as const).map(([report, label]) => (
          <button className={styles.button} key={report} onClick={() => downloadReport(report)}><MemberIcon name="download" />{label} CSV</button>
        ))}
        <Link className={styles.button} href={memberWorkspacePeriodHref(member, "impact", period)}>Open impact exports</Link>
        <Link className={styles.button} href={memberWorkspacePeriodHref(member, "gpo-dashboard", period)}>Open GPO exports</Link>
        <Link className={styles.button} href={memberWorkspacePeriodHref(member, "reports", period)}><MemberIcon name="reports" /> More report exports</Link>
      </div>
      <h3>Data-file slots</h3>
      <div className={styles.toolbar}>
        <label className={styles.field}>Category<select value={category} onChange={event => setCategory(event.target.value)}><option value="all">All files</option>{feeds.map(group => <option key={group.group}>{group.group}</option>)}</select></label>
        <label className={styles.field}>Find a file<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="e.g. location.csv" /></label>
      </div>
      <DataTable caption="Expected named file slots and downloadable examples" heads={["Expected filename", "Category", "Production file", "Illustrative example"]} rows={visibleFiles.map(file => [file.filename, file.group, "Not connected", <button className={styles.button} onClick={() => downloadPreview(file.filename, sampleFor(file.filename), file.filename.endsWith(".csv") ? "text/csv" : "text/plain")} aria-label={"Download sample " + file.filename}>Download sample</button>])} />
      <div id="gpo-documents"><details><summary>GPO document catalog ({resources.length})</summary><DataTable caption="GPO document references; original PDFs not attached" heads={["Resource", "Topic", "Status"]} rows={resources.map(row => [row[0], row[1], "Original PDF not connected"])} /></details></div>
      <details><summary>Shared document library ({attachedSlots.length} samples)</summary>
        {attachedSlots.length
          ? <DataTable caption="Recognized sample files attached to this browser tab" heads={["Sample file", "Status", "Manage"]} rows={attachedSlots.map(filename => [filename, "Sample attached to this tab only", <button className={styles.button} onClick={() => setAttachedSlots(attachedSlots.filter(value => value !== filename))} aria-label={"Remove sample attachment " + filename}>Remove sample</button>])} />
          : <p className={styles.note}>No sample documents attached. Validate one of the built-in sample files below to try the attachment workflow. Nothing is shared across users.</p>}
      </details>
    </Section>
    <Section id="import-check" title="Sample file import check" description="Download one of the examples above and use it here to test the handoff. Do not select a real member or vendor file. File bytes stay in this browser.">
      <div className={styles.toolbar}>
        <label className={styles.field}>Expected slot<select value={slot} disabled={busy} onChange={event => { setSlot(event.target.value); setReceipt(undefined); setFileStatus(""); }}>{files.map(file => <option key={file.filename}>{file.filename}</option>)}</select></label>
        <label className={styles.field}>Sample file<input key={slot} type="file" disabled={busy} onChange={event => void validateFile(event.target.files?.[0])} /></label>
      </div>
      <p role="status" className={fileStatus || busy ? styles.note : styles.srOnly}>{busy ? "Checking the sample file…" : fileStatus}</p>
      {receipt && <div className={styles.toolbar}>
        <button className={styles.button} onClick={() => downloadPreview(member + "-sample-import-receipt.json", JSON.stringify({ scope: "illustrative browser-only check", uploaded: false, ...receipt }, null, 2), "application/json")}>Download validation receipt</button>
        {receipt.matchesBuiltInSample
          ? <button className={styles.button} data-action="primary" disabled={attachedSlots.includes(receipt.slot)} onClick={() => {
            setAttachedSlots([...attachedSlots, receipt.slot]);
            setFileStatus("Added a reference to the built-in sample to your preview library. No file bytes were saved or uploaded.");
          }}>{attachedSlots.includes(receipt.slot) ? "Sample already attached" : "Attach built-in sample"}</button>
          : <small className={styles.muted}>Only an exact built-in sample can be attached to the preview library.</small>}
      </div>}
      <details><summary>How live imports and exports should work</summary><ol className={styles.muted}>
        <li>Authorize the user, tenant and document slot on the server before accepting bytes or issuing any download.</li>
        <li>Upload directly to private storage in resumable chunks. Validate the full checksum, file type, size, schema and malware status before publishing a version.</li>
        <li>Queue expensive parsing and exports, validate the preview before committing imports, and keep an audit trail. Use short-lived, tenant-authorized export links.</li>
      </ol></details>
    </Section>
  </ModuleWorkspace>;
}

"use client";

import { useState } from "react";
import { DataTable, Section, styles } from "./ParityUI";
import { transferBalance, sampleMonths, type Transfer } from "./sample-stock-model";
import { downloadPreview, previewCsv } from "./parity-data";

const kinds = ["Prior-agreement exemption", "Inventory-related lost sale"] as const;
type Kind = typeof kinds[number];
export type InventoryReviewRecord = {
  id: string; kind: Kind; transfer: string; month: string; cents: number; reason: string; reversal?: string;
};
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function InventoryReview({ transfers, journal, setJournal, member }: {
  transfers: Transfer[]; journal: InventoryReviewRecord[]; setJournal: (entries: InventoryReviewRecord[]) => void; member: string;
}) {
  const [kind, setKind] = useState<Kind>(kinds[0]);
  const [transfer, setTransfer] = useState(transfers[0]?.id ?? "");
  const [notice, setNotice] = useState("");
  const [isError, setIsError] = useState(false);
  const chosen = transfers.find(item => item.id === transfer);
  const cap = kind === kinds[0] && chosen ? transferBalance(chosen).adjusted : 1_000_000;
  return <div className={styles.workspace}>
    <Section id="inventory-review" title="Shared Inventory review journal" description="Practice prior-agreement exemptions and recording an inventory-related lost sale. Journal records are illustrative, stay in this tab, and can be reversed without deleting history."
      action={<button className={styles.button} disabled={!journal.length} onClick={() => downloadPreview(member + "-inventory-review-illustrative.csv", previewCsv([["Illustrative review journal; not accounting records"], ["Reference", "Kind", "Sample month", "Transfer", "Amount USD", "Reason", "Reversal reason"], ...journal.map(row => [row.id, row.kind, row.month, row.transfer, row.cents / 100, row.reason, row.reversal ?? ""])]))}>Export review journal</button>}>
      <details><summary>Add a sample adjustment or loss</summary>
        <form className={styles.toolbar} onSubmit={event => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const cents = Math.round(Number(form.get("amount")) * 100);
          if (!Number.isSafeInteger(cents) || cents <= 0 || cents > cap || (kind === kinds[0] && !chosen)) {
            setIsError(true); setNotice("Enter a positive amount within the remaining sample balance."); return;
          }
          const id = "DEMO-REVIEW-" + String(journal.length + 1).padStart(2, "0");
          setJournal([...journal, { id, kind, cents, transfer: kind === kinds[0] ? transfer : "—", month: kind === kinds[0] ? chosen!.month : String(form.get("month")), reason: String(form.get("reason")) }]);
          setIsError(false); setNotice(id + " recorded in this browser tab.");
          (event.currentTarget.elements.namedItem("amount") as HTMLInputElement).value = "";
        }}>
          <label className={styles.field}>Entry type<select value={kind} onChange={e => setKind(e.target.value as Kind)}>{kinds.map(value => <option key={value}>{value}</option>)}</select></label>
          {kind === kinds[0]
            ? <label className={styles.field}>Sample transfer<select value={transfer} onChange={event => setTransfer(event.target.value)}>{transfers.map(item => <option value={item.id} key={item.id}>{item.id} · {item.month} · {item.flow}</option>)}</select></label>
            : <label className={styles.field}>Sample month<select name="month">{sampleMonths.map(month => <option key={month}>{month}</option>)}</select></label>}
          <label className={styles.field}>Sample amount (USD)<input name="amount" type="number" required min="0.01" max={cap / 100} step="0.01" /></label>
          <label className={styles.field}>Illustrative reason<select name="reason" key={kind}>{(kind === kinds[0] ? ["Sample agreement exemption", "Sample branch correction"] : ["Sample inaccurate quantity", "Sample unavailable stock"]).map(reason => <option key={reason}>{reason}</option>)}</select></label>
          <button className={styles.button} data-action="primary" disabled={cap <= 0}>Record sample</button>
        </form>
        <p className={styles.muted}>{kind === kinds[0] ? "Remaining adjustable sample balance: " + currency.format(cap / 100) : "Lost sales stay out of adjusted transactions and fees."}</p>
      </details>
      <DataTable caption="Sample adjustment and loss journal" heads={["Reference", "Entry type", "Month", "Amount", "Reason", "Status"]} rows={journal.map(row => [
        row.id, row.kind, row.month, currency.format(row.cents / 100), row.reason, row.reversal
          ? <span className={styles.badge}>Reversed · {row.reversal}</span>
          : <button className={styles.button} aria-label={"Reverse " + row.id} onClick={() => {
            setJournal(journal.map(item => item.id === row.id ? { ...item, reversal: "Sample reversal requested" } : item));
            setIsError(false); setNotice(row.id + " reversed; original entry preserved.");
          }}>Reverse</button>,
      ])} />
      <p role={isError ? "alert" : "status"} className={notice ? styles.note : styles.srOnly}>{notice}</p>
    </Section>
  </div>;
}

"use client";

import { useState } from "react";
import type { MemberModuleRoute } from "../member-workspace-routes";
import { DataTable, ModuleWorkspace, Section, styles, usePreviewState, WorkspaceIntro } from "./ParityUI";
import { downloadPreview, previewCsv } from "./parity-data";
import { MEMBER_TOOL_GROUPS } from "./member-tool-directory";

const locationExamples = [
  { code: "DEMO-01", name: "Demo central branch", region: "Central", shipping: "Parcel and freight", enabled: true },
  { code: "DEMO-02", name: "Demo regional branch", region: "East", shipping: "Parcel only", enabled: false },
  { code: "DEMO-03", name: "Demo distribution center", region: "Central", shipping: "Freight only", enabled: true },
];
const people = ["Sample Purchasing Desk", "Sample Customer Service Desk", "Sample Leadership Desk", "Sample Stock Desk"];
const sections = MEMBER_TOOL_GROUPS.filter(group => group.title !== "Network Administration")
  .flatMap(group => group.tools.filter(tool => tool.route !== "manage-users").map(tool => tool.label));
const schedules = ["Buy alerts", "Sell alerts", "Weekly digest"] as const;
const collections = ["Members", "Manufacturers", "Manufacturer divisions"] as const;
type Recipient = { name: string; buy: boolean; sell: boolean; weekly: boolean };
type Account = { name: string; role: "Member contributor" | "Member administrator"; access: string[]; state: "Enabled" | "Suspended" | "First-sign-in review" };
type RegistryEntry = { name: string; collection: typeof collections[number]; status: "Active" | "Inactive" };
type Branch = typeof locationExamples[number];
const initialEntries: RegistryEntry[] = [
  { name: "Illustrative distribution company", collection: "Members", status: "Active" },
  { name: "Demo Hydraulics", collection: "Manufacturers", status: "Active" },
  { name: "Demo Hydraulics · valves", collection: "Manufacturer divisions", status: "Active" },
];

export function MemberAdminDesk({ member, name, selected: module }: { member: string; name: string; selected?: MemberModuleRoute }) {
  const [branches, setBranches] = usePreviewState<Branch[]>(member + ":admin-branches", locationExamples.slice(0, 2));
  const [recipients, setRecipients] = usePreviewState<Recipient[]>(member + ":admin-recipients", [{ name: people[0], buy: true, sell: true, weekly: false }]);
  const [scheduleOn, setScheduleOn] = usePreviewState(member + ":admin-digest", false);
  const [accounts, setAccounts] = usePreviewState<Account[]>(member + ":admin-users", [{ name: people[0], role: "Member contributor", access: ["Overview", "Parts Search", "Shared Inventory"], state: "Enabled" }]);
  const [entries, setEntries] = usePreviewState<RegistryEntry[]>(member + ":admin-registry", initialEntries);
  const [selected, setSelected] = useState(people[0]);
  const [collection, setCollection] = useState<typeof collections[number]>("Members");
  const [notice, setNotice] = useState("");
  const active = accounts.find(account => account.name === selected);
  const unusedPeople = people.filter(person => !recipients.some(recipient => recipient.name === person));
  const nextBranch = locationExamples.find(branch => !branches.some(row => row.code === branch.code));
  const patchAccount = (change: Partial<Account>) => {
    if (!active) return;
    setAccounts(accounts.map(account => account.name === active.name ? { ...account, ...change } : account));
  };

  return <ModuleWorkspace selected={module} intro={<WorkspaceIntro icon="governance" title="Workspace administration" description={"Review how " + name + " could manage its branch records, notifications and people without affecting live access."} sections={[["locations", "Locations"], ["recipients", "Email recipients"], ["users", "Manage users"], ["network-admin", "Network administration"]]} />}>
    <Section id="locations" title="Member locations" description="Branch and shipping records are sample entries. Status changes here affect this browser tab only."
      action={<button className={styles.button} onClick={() => downloadPreview(member + "-locations-illustrative.csv", previewCsv([["Illustrative branch scheduling and shipping data"], ["Code", "Branch", "Region", "Shipping", "Status"], ...branches.map(branch => [branch.code, branch.name, branch.region, branch.shipping, branch.enabled ? "Active" : "Inactive"])]))}>Export sample locations</button>}>
      <DataTable caption="Illustrative locations and shipping roles" heads={["Branch", "Location code", "Region", "Shipping", "Status"]} rows={branches.map(row => [row.name, row.code, row.region, row.shipping,
        <select className={styles.button} aria-label={"Status for " + row.name} value={row.enabled ? "Active" : "Inactive"} onChange={event => setBranches(branches.map(branch => branch.code === row.code ? { ...branch, enabled: event.target.value === "Active" } : branch))}><option>Active</option><option>Inactive</option></select>])} />
      <details><summary>Edit branch shipping or add a demo branch</summary><div className={styles.form}>{branches.map(row => <label key={row.code} className={styles.field}>{row.name} shipping
        <select value={row.shipping} onChange={event => setBranches(branches.map(branch => branch.code === row.code ? { ...branch, shipping: event.target.value } : branch))}><option>Parcel and freight</option><option>Parcel only</option><option>Freight only</option></select></label>)}
        <button className={styles.button} disabled={!nextBranch} onClick={() => { if (nextBranch) setBranches([...branches, nextBranch]); }}>{nextBranch ? "Add next demo branch" : "All demo branches added"}</button>
      </div></details>
    </Section>
    <Section id="recipients" title="Buy/sell email recipients" description="Try buy, sell and weekly digest preferences. All recipients are fixed sample roles, and no email is scheduled or delivered.">
      <DataTable caption="Illustrative email recipient preferences" heads={["Recipient", ...schedules, "Manage"]} rows={recipients.map(row => [
        row.name, ...(["buy", "sell", "weekly"] as const).map((field, i) =>
          <label className={styles.check}><input type="checkbox" checked={row[field]} aria-label={row.name + ": " + schedules[i]} onChange={event => setRecipients(recipients.map(recipient => recipient.name === row.name ? { ...recipient, [field]: event.target.checked } : recipient))} />{row[field] ? "On" : "Off"}</label>),
        <button className={styles.button} onClick={() => setRecipients(recipients.filter(recipient => recipient.name !== row.name))} aria-label={"Remove " + row.name}>Remove</button>])} />
      <div className={styles.toolbar}>
        <button className={styles.button} disabled={!unusedPeople.length} onClick={() => setRecipients([...recipients, { name: unusedPeople[0], buy: true, sell: false, weekly: false }])}>{unusedPeople.length ? "Add next demo recipient" : "All demo roles added"}</button>
        <label className={styles.check}><input type="checkbox" checked={scheduleOn} onChange={event => setScheduleOn(event.target.checked)} /> Preview weekly schedule</label>
      </div>
      <details><summary>Preview the weekly opportunity digest</summary><div className={styles.note}>
        <strong>Subject: Weekly buy/sell opportunities · example</strong><br />
        To: {recipients.filter(row => row.weekly && (row.buy || row.sell)).map(row => row.name).join(", ") || "No demo recipients selected"}<br />
        Schedule: {scheduleOn ? "Monday, 8 a.m. Eastern (preview)" : "Off"}. Review the Trade Desk for sample matches. No email will be sent.
      </div></details>
    </Section>
    <Section id="users" title="Manage users" description="Preview company-scoped user roles, section access and account lifecycle. This publicly reachable demo never creates credentials or enforces access.">
      <div className={styles.toolbar}><label className={styles.field}>Sample account<select value={selected} onChange={e => { setSelected(e.target.value); setNotice(""); }}>{people.map(person => <option key={person}>{person}</option>)}</select></label>
        {!active && <button className={styles.button} data-action="primary" onClick={() => {
          setAccounts([...accounts, { name: selected, role: "Member contributor", access: [], state: "First-sign-in review" }]);
          setNotice("Sample account added. No invite or password was created.");
        }}>Add sample account</button>}
      </div>
      {active && <>
        <div className={styles.toolbar}><span className={styles.badge}>{active.state}</span><label className={styles.field}>Preview role<select value={active.role} onChange={e => patchAccount({ role: e.target.value as Account["role"] })}><option>Member contributor</option><option>Member administrator</option></select></label></div>
        <details><summary>Edit illustrative section access ({active.access.filter(section => sections.includes(section)).length} selected)</summary><div className={styles.cards}>
          {sections.map(section => <label key={section} className={styles.check}><input type="checkbox" checked={active.access.includes(section)} onChange={e => patchAccount({ access: e.target.checked ? [...active.access, section] : active.access.filter(item => item !== section) })} />{section}</label>)}
        </div></details>
        <div className={styles.toolbar}>
          <button className={styles.button} onClick={() => { patchAccount({ state: active.state === "Suspended" ? "Enabled" : "Suspended" }); setNotice(active.state === "Suspended" ? "Sample account re-enabled." : "Sample account suspended."); }}>{active.state === "Suspended" ? "Re-enable sample" : "Suspend sample"}</button>
          <button className={styles.button} onClick={() => { patchAccount({ state: "First-sign-in review" }); setNotice("Sample first-sign-in review requested. No password or reset link was generated."); }}>Preview password reset</button>
        </div>
      </>}
      <p role="status" className={notice ? styles.note : styles.srOnly}>{notice}</p>
    </Section>
    <Section id="network-admin" title="Network administration" description="This separate network-admin example shows how members, manufacturers and divisions could be managed. It does not grant an administrator role.">
      <label className={styles.field} style={{ width: "max-content" }}>Registry<select value={collection} onChange={e => setCollection(e.target.value as typeof collection)}>{collections.map(item => <option key={item}>{item}</option>)}</select></label>
      <DataTable caption="Illustrative registry records" heads={["Record", "Registry", "Status"]} rows={entries.filter(row => row.collection === collection).map(row => [row.name, row.collection,
        <select className={styles.button} value={row.status} aria-label={"Registry status for " + row.name} onChange={event => setEntries(entries.map(item => item.name === row.name ? { ...item, status: event.target.value as RegistryEntry["status"] } : item))}><option>Active</option><option>Inactive</option></select>])} />
      <button className={styles.button} disabled={entries.filter(row => row.collection === collection).length >= 4} onClick={() => setEntries([...entries, { name: "Demo " + collection.toLowerCase() + " record " + (entries.filter(row => row.collection === collection).length + 1), collection, status: "Active" }])}>Add illustrative registry record</button>
    </Section>
  </ModuleWorkspace>;
}

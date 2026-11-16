import { useEffect, useState, type ReactNode } from "react";
import { MemberIcon, type MemberIconName } from "../../components/MemberIcon";
import styles from "./ParityUI.module.css";

export { styles };

export function WorkspaceIntro({ icon, title, description, sections }: {
  icon: MemberIconName; title: string; description: string; sections?: readonly [string, string][];
}) {
  return <header className={styles.intro}>
    <div className={styles.eyebrow}><MemberIcon name={icon} /> Member operations</div>
    <h1>{title}</h1><p>{description}</p>
    {sections && <nav className={styles.index} aria-label={"On this page: " + title}>
      {sections.map(([id, label]) => <a key={id} href={"#" + id}>{label}<span aria-hidden="true">↓</span></a>)}
    </nav>}
  </header>;
}

export function Section({ id, title, description, action, children }: {
  id: string; title: string; description?: string; action?: ReactNode; children: ReactNode;
}) {
  return <section id={id} className={styles.panel} aria-labelledby={id + "-heading"}>
    <header className={styles.panelHeader}>
      <div><h2 id={id + "-heading"}>{title}</h2>{description && <p>{description}</p>}</div>{action}
    </header>
    {children}
  </section>;
}

export function Metrics({ items }: { items: readonly (readonly [string, ReactNode, string])[] }) {
  return <dl className={styles.metrics}>{items.map(([label, value, note]) =>
    <div className={styles.metric} key={label}><dt>{label}</dt><dd>{value}</dd><small>{note}</small></div>)}</dl>;
}

export function DataTable({ caption, heads, rows }: { caption: string; heads: string[]; rows: ReactNode[][] }) {
  if (!rows.length) return <p className={styles.note} role="status">No matching records. Try a different filter.</p>;
  return <div className={styles.tableWrap} role="region" aria-label={caption} tabIndex={0}>
    <table className={styles.table}><caption className={styles.srOnly}>{caption}</caption>
      <thead><tr>{heads.map(head => <th scope="col" key={head}>{head}</th>)}</tr></thead>
      <tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => j === 0
        ? <th key={j} scope="row">{cell}</th> : <td key={j}>{cell}</td>)}</tr>)}</tbody>
    </table>
  </div>;
}

export function usePreviewState<T>(scope: string, initial: T): [T, (value: T) => void] {
  const key = "distranet-illustrative-v1:" + scope;
  const [saved, setSaved] = useState<{ key: string; value: T }>();
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(key);
      if (raw) setSaved({ key, value: JSON.parse(raw) as T });
    } catch { /* Illustrative state remains usable with storage disabled. */ }
  }, [key]);
  return [saved?.key === key ? saved.value : initial, value => {
    setSaved({ key, value });
    try { window.sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* same-session memory only */ }
  }];
}

export const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
export const number = new Intl.NumberFormat("en-US");

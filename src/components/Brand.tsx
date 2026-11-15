import styles from "./Brand.module.css";

type MarkProps = {
  compact?: boolean;
  tone?: "dark" | "light";
};

/**
 * The approved Distranet Convergence Star identity.
 * `tone="dark"` is the white-wordmark lockup for dark surfaces; `tone="light"`
 * is the ink-wordmark lockup for white surfaces.
 */
export function Mark({ compact = false, tone = "dark" }: MarkProps) {
  const src = compact
    ? "/brands/distranet/convergence-glyph.svg"
    : `/brands/distranet/convergence-lockup-${tone}.svg`;

  return (
    <span
      className={`brand${compact ? " compact" : ""} ${styles.mark}`}
      role="img"
      aria-label="Distranet — Authorized Parker Distributor Network"
    >
      <img
        className={compact ? styles.glyph : styles.lockup}
        src={src}
        alt=""
        aria-hidden="true"
        width={compact ? 120 : 560}
        height={compact ? 120 : 130}
        decoding="async"
      />
    </span>
  );
}

export function Arrow(){ return <svg className="icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11m-4-4 4 4-4 4"/></svg> }

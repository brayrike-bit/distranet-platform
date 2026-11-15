"use client";

import Link from "next/link";
import { useState } from "react";

export function MemberStream({ members }: { members: readonly string[] }) {
  const [paused, setPaused] = useState(false);

  return <div className="member-stream-shell">
    <button
      className="member-stream-control"
      type="button"
      aria-controls="member-stream-track"
      aria-pressed={paused}
      onClick={() => setPaused((value) => !value)}
    >
      <i aria-hidden="true">{paused ? <span /> : <><span /><span /></>}</i>
      {paused ? "Resume member movement" : "Pause member movement"}
    </button>
    <div id="member-stream-track" className={`member-stream${paused ? " is-paused" : ""}`}>
      {members.concat(members).map((member, index) => <Link
        href="/network"
        key={`${member}-${index}`}
        aria-hidden={index >= members.length ? true : undefined}
        tabIndex={index >= members.length ? -1 : undefined}
      >
        <small>{String(index % members.length + 1).padStart(2, "0")}</small>
        <span>{member}</span>
        <i aria-hidden="true">↗</i>
      </Link>)}
    </div>
  </div>;
}

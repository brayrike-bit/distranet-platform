import type { ReactNode } from "react";

export type MemberIconName =
  | "portrait"
  | "commerce"
  | "operations"
  | "finance"
  | "opportunity"
  | "reports"
  | "settings"
  | "inventory"
  | "pricing"
  | "locations"
  | "shipping"
  | "returns"
  | "statements"
  | "governance"
  | "lock"
  | "arrow"
  | "pulse"
  | "split"
  | "download"
  | "spark";

const paths: Record<MemberIconName, ReactNode> = {
  portrait: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </>
  ),
  commerce: (
    <>
      <path d="M3.5 6.5h2l1.7 9.2h10.7l2.1-6.5H7" />
      <circle cx="9" cy="19" r="1.2" />
      <circle cx="17" cy="19" r="1.2" />
    </>
  ),
  operations: (
    <>
      <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" />
      <path d="m4 7.5 8 4.3 8-4.3M12 11.8V21" />
    </>
  ),
  finance: (
    <>
      <path d="M4 19.5h16M6 16V9m4 7V5m4 11v-4m4 4V7" />
      <path d="m5 7 5-4 4 4 5-3" />
    </>
  ),
  opportunity: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5M10.5 7v7M7 10.5h7" />
    </>
  ),
  reports: (
    <>
      <path d="M6 3h8l4 4v14H6V3Z" />
      <path d="M14 3v5h4M9 12h6M9 16h6" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="m18.6 14.8 1.6 1.2-2.2 3.8-1.9-.8a8 8 0 0 1-2.1 1.2L13.8 22H10l-.3-1.9a8 8 0 0 1-2.1-1.2l-1.8.8L3.6 16l1.6-1.2a8 8 0 0 1 0-2.5L3.6 11l2.2-3.8 1.8.8a8 8 0 0 1 2.1-1.2L10 5h3.8l.3 1.9A8 8 0 0 1 16.2 8l1.8-.8 2.2 3.8-1.6 1.2a8 8 0 0 1 0 2.6Z" />
    </>
  ),
  inventory: (
    <>
      <path d="m4 7 8-4 8 4v10l-8 4-8-4V7Z" />
      <path d="m4 7 8 4 8-4M8 5l8 4M12 11v10" />
    </>
  ),
  pricing: (
    <>
      <path d="M4 5.5h9l7 7-7.5 7.5-7-7V5.5Z" />
      <circle cx="9" cy="9.5" r="1.2" />
    </>
  ),
  locations: (
    <>
      <path d="M20 10c0 5.5-8 11-8 11S4 15.5 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  shipping: (
    <>
      <path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </>
  ),
  returns: (
    <>
      <path d="M8 7H4v-4" />
      <path d="M4.5 7A8 8 0 1 1 4 15" />
      <path d="m10 10-3 3 3 3M7 13h9" />
    </>
  ),
  statements: (
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </>
  ),
  governance: (
    <>
      <path d="M12 2.5 19 6v5.5c0 4.5-2.8 8-7 10-4.2-2-7-5.5-7-10V6l7-3.5Z" />
      <path d="m8.5 12 2.2 2.2 4.8-5" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10" width="15" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
    </>
  ),
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  pulse: <path d="M3 12h4l2.2-6 4.2 12 2.1-6H21" />,
  split: (
    <>
      <path d="M5 4v5a3 3 0 0 0 3 3h8a3 3 0 0 1 3 3v5" />
      <path d="M5 20v-5a3 3 0 0 1 3-3M16 5l3-3 3 3M16 19l3 3 3-3" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
      <path d="M4 20h16" />
    </>
  ),
  spark: (
    <>
      <path d="m12 2 1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2Z" />
      <path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" />
    </>
  ),
};

export function MemberIcon({
  name,
  className,
}: {
  name: MemberIconName;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

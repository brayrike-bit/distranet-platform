import { memberSeed } from "./parity-data";

export const EDI_STATUSES = ["Live", "Testing", "Open", "Not applicable"] as const;
export type EdiStatus = typeof EDI_STATUSES[number];
export type EdiDirection = "buying" | "selling";
export type EdiPeer = { id: string; label: string; buying: EdiStatus; selling: EdiStatus };

export const EDI_DIRECTIONS: readonly EdiDirection[] = ["buying", "selling"];

export function ediFixture(member: string): EdiPeer[] {
  const seed = memberSeed(member);
  const statusAt = (index: number, offset: number): EdiStatus => {
    const position = (seed * 13 + index * 7 + offset * 19) % 41;
    return position < 24 ? "Live" : position < 33 ? "Testing" : position < 39 ? "Open" : "Not applicable";
  };
  return Array.from({ length: 20 }, (_, index) => {
    const suffix = String(index + 1).padStart(2, "0");
    return { id: "demo-" + suffix, label: "Demo Member " + suffix, buying: statusAt(index, 0), selling: statusAt(index, 1) };
  });
}

export function summarizeEdi(peers: readonly EdiPeer[]) {
  const counts = { live: 0, testing: 0, open: 0, notApplicable: 0 };
  for (const peer of peers) {
    for (const direction of EDI_DIRECTIONS) {
      switch (peer[direction]) {
        case "Live": counts.live++; break;
        case "Testing": counts.testing++; break;
        case "Open": counts.open++; break;
        case "Not applicable": counts.notApplicable++; break;
      }
    }
  }
  const total = counts.live + counts.testing + counts.open;
  return { ...counts, total, completion: total ? counts.live * 100 / total : null };
}

export function filterEdiPeers(
  peers: readonly EdiPeer[],
  { peer, direction, status }: { peer: string; direction: EdiDirection | "all"; status: EdiStatus | "all" },
) {
  const directions = direction === "all" ? EDI_DIRECTIONS : [direction];
  return peers.filter(row => (peer === "all" || row.id === peer) && directions.some(key => status === "all" || row[key] === status));
}

export function ediOutstanding(
  peers: readonly EdiPeer[],
  direction: EdiDirection | "all",
  status: EdiStatus | "all",
) {
  const directions = direction === "all" ? EDI_DIRECTIONS : [direction];
  return peers.flatMap(peer => directions.flatMap(key => {
    const state = peer[key];
    if ((state !== "Open" && state !== "Testing") || (status !== "all" && state !== status)) return [];
    return [{ peer, direction: key, status: state,
      action: state === "Testing" ? "Finish transaction testing and confirm go-live." : "Coordinate connection setup with the sample counterpart." }];
  })).sort((a, b) => Number(a.status !== "Open") - Number(b.status !== "Open"));
}

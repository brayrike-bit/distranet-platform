export const stockKinds = ["Standard", "Excess", "Dead"] as const;
export type StockKind = typeof stockKinds[number];

export type StockLot = {
  id: string;
  sku: string;
  description: string;
  maker: string;
  owner: string;
  location: string | null;
  uom: "EA" | "KIT";
  quantity: number;
  kind: StockKind;
  standardCents: number;
  replacementCents: number;
};

export type StockGroup = Pick<StockLot, "sku" | "description" | "maker" | "owner" | "location" | "uom"> & {
  id: string;
  lots: StockLot[];
};

export type Transfer = {
  id: string;
  month: string;
  flow: "Sold" | "Purchased";
  partner: string;
  units: number;
  grossCents: number;
  exemptionCents: number;
};

export type Match = {
  id: string;
  side: "Buy" | "Sell";
  sku: string;
  description: string;
  partner: string;
  units: number;
  valueCents: number;
  due: string;
};

export const sampleMonths = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"] as const;
export const matchStatuses = ["New", "Reviewing", "Dismissed"] as const;
export type MatchStatus = (typeof matchStatuses)[number];
export const recoveryStatuses = ["Unassigned", "Listed", "Under review", "Recovered"] as const;
export type RecoveryStatus = (typeof recoveryStatuses)[number];
export const demoInventoryFeeBasisPoints = { Sold: 70, Purchased: 130 } as const;
const parts = [
  ["DEMO-HC-204", "Flat-face hydraulic coupling", "Northline Fluid Components", "EA", 14380],
  ["DEMO-SK-118", "Cylinder seal service kit", "Pioneer Motion Supply", "KIT", 7610],
  ["DEMO-CV-406", "Inline check valve", "Northline Fluid Components", "EA", 9614],
  ["DEMO-HF-232", "High-pressure hose fitting", "Cedar Components", "EA", 3575],
  ["DEMO-PF-012", "Hydraulic filter element", "Pioneer Motion Supply", "EA", 4590],
] as const;

function memberSeed(member: string) {
  return Array.from(member).reduce((hash, letter) => (hash * 33 + letter.charCodeAt(0)) % 104729, 5381);
}

export function makeSampleStock(member: string, memberName: string) {
  const seed = memberSeed(member);
  const partners = ["Demo stocking member A", "Demo stocking member B"] as const;
  const units = (n: number) => 9 + ((seed + n * 17) % 74);
  const lots = parts.flatMap(([sku, description, maker, uom, replacementCents], index): StockLot[] => {
    const owner = memberName;
    const location = index % 2 === 0 ? "Demo branch 01" : "Demo branch 02";
    const base = { sku, description, maker, uom, owner, location, replacementCents, standardCents: Math.round(replacementCents * 1.16) };
    const standard = { ...base, id: `${sku}:01`, kind: "Standard" as const, quantity: units(index + 1) };
    const flagged = { ...base, id: `${sku}:02`, kind: (index % 2 ? "Dead" : "Excess") as "Dead" | "Excess", quantity: units(index + 4) % 13 + 3, location: index === 3 ? null : location };
    const partner = { ...base, id: `${sku}:03`, owner: partners[index % 2], location: "Demo distribution center", kind: "Standard" as const, quantity: units(index + 7), standardCents: Math.round(replacementCents * 1.21) };
    return index === 0
      ? [standard, flagged, { ...base, id: `${sku}:04`, kind: "Dead", quantity: 4 }, partner]
      : [standard, flagged, partner];
  });
  const transfers = sampleMonths.flatMap((month, index): Transfer[] => (["Sold", "Purchased"] as const).map((flow, i) => {
    const count = units(index * 7 + i);
    const grossCents = count * (13000 + ((seed + index * 1797 + i * 3451) % 12000));
    return { id: `DEMO-SI-${241 + index * 2 + i}`, month, flow, partner: partners[(index + i) % 2], units: count, grossCents, exemptionCents: (index + i) % 3 === 0 ? Math.round(grossCents * 0.1) : 0 };
  }));
  const matches = parts.map(([sku, description, , , cents], index): Match => {
    const quantity = units(index * 5 + 3) % 18 + 5;
    return { id: `DEMO-MATCH-${index + 1}`, side: index % 2 ? "Buy" : "Sell", sku, description, partner: partners[index % 2], units: quantity, valueCents: Math.round(cents * quantity * (index % 2 ? 1 : 0.85)), due: `Sample week ${index + 1}` };
  });
  return { lots, transfers, matches };
}

export function lotPrice(lot: StockLot) {
  if (lot.kind === "Standard") return lot.standardCents;
  return lot.kind === "Dead" ? Math.round(lot.replacementCents * 0.7) : lot.replacementCents;
}

export function findStock(lots: StockLot[], query: string, owner: string, kind: "All" | StockKind, availableOnly: boolean) {
  const terms = query.trim().toLocaleLowerCase("en-US").split(/\s+/).filter(Boolean);
  const groups = new Map<string, StockGroup>();
  for (const lot of lots) {
    if ((owner && lot.owner !== owner) || (kind !== "All" && lot.kind !== kind) || (availableOnly && !lot.location)) continue;
    const searchable = [lot.sku, lot.description, lot.maker, lot.owner, lot.location].join(" ").toLocaleLowerCase("en-US");
    if (!terms.every((term) => searchable.includes(term))) continue;
    const key = JSON.stringify([lot.sku, lot.owner, lot.location, lot.uom]);
    const previous = groups.get(key);
    if (previous) previous.lots.push(lot);
    else groups.set(key, { id: key, sku: lot.sku, description: lot.description, maker: lot.maker, owner: lot.owner, location: lot.location, uom: lot.uom, lots: [lot] });
  }
  return [...groups.values()];
}

export function stockQuantity(group: StockGroup, kind: StockKind) {
  return group.lots.reduce((units, lot) => units + (lot.kind === kind && lot.location ? lot.quantity : 0), 0);
}

export function transferBalance(transfer: Transfer) {
  const adjusted = transfer.grossCents - transfer.exemptionCents;
  return { adjusted, fee: Math.round(adjusted * demoInventoryFeeBasisPoints[transfer.flow] / 10000) };
}

export function stockCsv(headers: readonly string[], rows: ReadonlyArray<ReadonlyArray<string | number>>) {
  const cell = (entry: string | number) => {
    const text = String(entry);
    const escaped = typeof entry === "string" && /^[\s\u0000-\u001f]*[=+@-]/.test(text) ? `'${text}` : text;
    return `"${escaped.replaceAll('"', '""')}"`;
  };
  return [headers, ...rows].map((row) => row.map(cell).join(",")).join("\r\n") + "\r\n";
}

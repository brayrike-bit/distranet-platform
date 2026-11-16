export function memberSeed(slug: string) {
  return [...slug].reduce((sum, character) => (Math.imul(sum, 31) + character.charCodeAt(0)) >>> 0, 17) % 67;
}

export type DemandRow = { month: string; part: string; searches: number; impressions: number; top: number; lost: number };

export function demandFixture(slug: string): DemandRow[] {
  const seed = memberSeed(slug);
  return ["Apr", "May", "Jun", "Jul", "Aug", "Sep"].flatMap((month, i) =>
    ["DEMO-VLV-38", "DEMO-CPL-12", "DEMO-FLT-72"].map((part, j) => ({
      month, part, searches: 45 + seed + i * 12 + j * 23,
      impressions: 220 + seed * (j + 1) + i * 33 + j * 27,
      top: 31 + (seed + i * 6 + j * 7) % 40,
      lost: 13 + (seed + i * 5 + j * 9) % 28,
    })));
}

export function summarizeDemand(rows: DemandRow[]) {
  const totals = rows.reduce((result, row) => ({
    searches: result.searches + row.searches,
    impressions: result.impressions + row.impressions,
    top: result.top + row.top * row.impressions,
    lost: result.lost + row.lost * row.impressions,
  }), { searches: 0, impressions: 0, top: 0, lost: 0 });
  return { ...totals, top: totals.impressions ? totals.top / totals.impressions : null,
    lost: totals.impressions ? totals.lost / totals.impressions : null };
}

export function evidenceScore(evidence: readonly { value: number | null; weight: number }[]) {
  const available = evidence.filter((entry): entry is { value: number; weight: number } => entry.value !== null);
  const weight = available.reduce((sum, entry) => sum + entry.weight, 0);
  return { weight, score: weight ? available.reduce((sum, entry) => sum + entry.value * entry.weight, 0) / weight : null };
}

export function previewCsv(rows: readonly (readonly (string | number | null)[])[]) {
  return rows.map(row => row.map(cell => {
    let value = String(cell ?? "");
    if (typeof cell === "string" && /^(?:[\t\r\n]|\s*[=+\-@])/u.test(value)) value = "'" + value;
    return '"' + value.replaceAll('"', '""') + '"';
  }).join(",")).join("\r\n") + "\r\n";
}

export function downloadPreview(filename: string, contents: string, mime = "text/csv") {
  const url = URL.createObjectURL(new Blob([contents], { type: mime + ";charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

function loadFixture(name) {
  const mod = { exports: {} };
  const { outputText } = ts.transpileModule(readFileSync(new URL(name + ".ts", import.meta.url), "utf8"),
    { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } });
  new Function("module", "exports", outputText)(mod, mod.exports);
  return mod.exports;
}

const { demandFixture, evidenceScore, previewCsv, summarizeDemand } = loadFixture("parity-data");
const { findStock, lotPrice, makeSampleStock, sampleMonths, stockQuantity, transferBalance } = loadFixture("sample-stock-model");
const makeRow = (impressions, top) => ({ month: "Feb", part: "SAMPLE", searches: 1, impressions, top, lost: 0 });
assert.deepEqual(summarizeDemand([makeRow(100, 90), makeRow(300, 30)]), { searches: 2, impressions: 400, top: 45, lost: 0 });
assert.equal(summarizeDemand([]).top, null);
assert.deepEqual(evidenceScore([{ value: null, weight: 40 }, { value: 50, weight: 30 }, { value: 100, weight: 30 }]), { weight: 60, score: 75 });
assert.deepEqual(evidenceScore([{ value: null, weight: 100 }]), { weight: 0, score: null });
assert.equal(evidenceScore([{ value: 0, weight: 100 }]).score, 0);
assert.equal(previewCsv([["=42", "  @example", "a,\"b\"", -1, "\ttext"]]), "\"'=42\",\"'  @example\",\"a,\"\"b\"\"\",\"-1\",\"'\ttext\"\r\n");
assert.equal(demandFixture("air-hydro-power").length, 18);
assert.notDeepEqual(demandFixture("air-hydro-power"), demandFixture("connector-specialists"));
const { lots, transfers } = makeSampleStock("air-hydro-power", "Air Hydro Power");
assert.equal(transfers.length, sampleMonths.length * 2);
assert.ok(lots.some(lot => lot.location === null));
assert.ok(findStock(lots, "", "", "All", true).every(group => group.location !== null));
assert.ok(findStock(lots, "absent unknown text", "", "All", false).length === 0);
assert.equal(findStock(lots, "DEMO-HC-204", "Air Hydro Power", "All", true).length, 1);
const [group] = findStock(lots, "DEMO-HC-204", "Air Hydro Power", "All", true);
assert.ok(stockQuantity(group, "Standard") > stockQuantity(group, "Dead"));
assert.ok(lotPrice(group.lots.find(lot => lot.kind === "Standard")) > lotPrice(group.lots.find(lot => lot.kind === "Dead")));
assert.deepEqual(transferBalance({ ...transfers[0], flow: "Sold", grossCents: 100000, exemptionCents: 10000 }), { adjusted: 90000, fee: 630 });
assert.deepEqual(transferBalance({ ...transfers[0], flow: "Purchased", grossCents: 100000, exemptionCents: 10000 }), { adjusted: 90000, fee: 1170 });
console.log(JSON.stringify({ status: "PASS", verified: ["demand weighted rates", "evidence weights", "CSV escaping", "sample member separation", "stock grouping and flags", "directional fee math"] }));

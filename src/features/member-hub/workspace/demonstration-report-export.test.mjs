import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";

const filename = new URL("./demonstration-report-export.ts", import.meta.url);
const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
const mod = { exports: {} };
new Function("module", "exports", source)(mod, mod.exports);
const { createDemonstrationReport, demonstrationCsvCell, parseDemonstrationPeriod, withDemonstrationPeriod } = mod.exports;
const generatedAt = "2026-11-11T15:00:00.000Z";
const snapshot = {
  period: "MTD", periodLabel: "Month to date · example", effectiveDate: "Sample data", confidence: "illustrative",
  attributedSales: 1000, recognizedOrders: 10, splitOrders: 2, splitRate: 20, productReimbursement: 700,
  memberMarginShare: 150, partsGopherMarginShare: 150, adjustments: -5, opportunityValue: 50, matchRate: 88,
};

let checks = 0;
for (const period of ["MTD", "QTD", "YTD", "12M"]) {
  assert.equal(parseDemonstrationPeriod(period), period);
  for (const slug of ["air-hydro-power", "connector-specialists"]) {
    const result = createDemonstrationReport({ company: { slug, name: slug }, snapshot: { ...snapshot, period }, generatedAt });
    assert.equal(result.payload.company.slug, slug);
    assert.equal(result.payload.period.code, period);
    assert.equal(result.payload.generatedAt, generatedAt);
    assert.equal(result.payload.prototype, true);
    assert.equal(result.payload.aggregateOnly, true);
    assert.equal(result.payload.metrics.length, 10);
    assert.ok(result.fileBase.includes(`${slug}-${period.toLowerCase()}-demonstration`));
    assert.ok(result.csv.includes('"source_notice"'));
    assert.ok(result.csv.includes('"draft-awaiting-dave-and-board-approval"'));
    assert.deepEqual(JSON.parse(result.json), result.payload);
    checks++;
  }
}
for (const invalid of [null, "", "mtd", "ALL", "__proto__"]) assert.equal(parseDemonstrationPeriod(invalid), "YTD");
for (const text of ["=HYPERLINK(\"bad\")", "+1", "-cmd", "@SUM(A1)", "  =1+1", "\u200b=1+1", "\ttext", "\n=1+1"]) {
  assert.ok(demonstrationCsvCell(text).startsWith('"\''), `Formula prefix not neutralized: ${JSON.stringify(text)}`);
}
assert.equal(demonstrationCsvCell(-5), '"-5"', "Legitimate negative numeric adjustments remain numeric");
assert.equal(demonstrationCsvCell('Company, "quoted"'), '"Company, ""quoted"""');
assert.equal(demonstrationCsvCell("Two\nlines"), '"Two\nlines"');
const maliciousName = createDemonstrationReport({ company: { slug: "demo", name: "=1+1" }, snapshot, generatedAt });
assert.ok(maliciousName.csv.includes('"\'=1+1"'));
assert.equal(maliciousName.payload.company.name, "=1+1", "JSON preserves text without spreadsheet escaping");
const extra = createDemonstrationReport({ company: { slug: "demo", name: "Demo" }, snapshot: { ...snapshot, customerEmail: "must-not-export@example.invalid" }, generatedAt });
assert.ok(!extra.json.includes("customerEmail") && !extra.csv.includes("must-not-export"), "Only whitelisted aggregate fields leave the serializer");
for (const changes of [{ confidence: "certified" }, { period: "ALL" }, { attributedSales: NaN }, { matchRate: Infinity }]) {
  assert.throws(() => createDemonstrationReport({ company: { slug: "demo", name: "Demo" }, snapshot: { ...snapshot, ...changes }, generatedAt }));
}
assert.throws(() => createDemonstrationReport({ company: { slug: "../demo", name: "Demo" }, snapshot, generatedAt }));
assert.throws(() => createDemonstrationReport({ company: { slug: "demo", name: "Demo" }, snapshot, generatedAt: "invalid" }));
assert.equal(withDemonstrationPeriod("/member-hub/demo/orders?view=aggregate#table", "QTD"), "/member-hub/demo/orders?view=aggregate&period=QTD#table");
assert.equal(withDemonstrationPeriod("/member-hub/demo/orders?period=YTD", "MTD"), "/member-hub/demo/orders?period=MTD");
assert.throws(() => withDemonstrationPeriod("https://example.invalid", "MTD"));
assert.throws(() => withDemonstrationPeriod("//example.invalid/member-hub/demo", "MTD"));
assert.throws(() => withDemonstrationPeriod("/member-hub/../other-page", "MTD"));
console.log(JSON.stringify({ status: "PASS", companyPeriodCases: checks, safeCsvFormulaPrefixes: 8, aggregateWhitelist: true, invalidDataRejected: true, queryAndHashPreserved: true, productionAccess: false }));

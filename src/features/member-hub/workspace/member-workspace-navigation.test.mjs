import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";

// Compile only the small, pure local modules in memory. No build, server,
// browser, fixture mutation, provider connection, or generated file is needed.
const modules = new Map();
function loadTypeScript(url) {
  if (modules.has(url.href)) return modules.get(url.href).exports;
  const mod = { exports: {} };
  modules.set(url.href, mod);
  const compiled = ts.transpileModule(fs.readFileSync(url, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const localRequire = (specifier) => {
    assert.ok(specifier.startsWith("."), `Unexpected runtime dependency: ${specifier}`);
    return loadTypeScript(new URL(`${specifier}.ts`, url));
  };
  new Function("module", "exports", "require", compiled)(mod, mod.exports, localRequire);
  return mod.exports;
}

const base = new URL("./", import.meta.url);
const { memberWorkspacePeriodHref, memberDirectoryPeriodHref } = loadTypeScript(new URL("member-workspace-navigation.ts", base));
const { MEMBER_WORKSPACE_ROUTES, resolveMemberWorkspace } = loadTypeScript(new URL("member-workspace-routes.ts", base));
const { REPORT_PERIODS, parseDemonstrationPeriod, withDemonstrationPeriod } = loadTypeScript(new URL("demonstration-report-export.ts", base));
const { MEMBER_DIRECTORY } = loadTypeScript(new URL("../../../brands/member-directory.ts", base));

assert.equal(MEMBER_DIRECTORY.length, 21);
assert.equal(MEMBER_WORKSPACE_ROUTES.length, 9);
assert.deepEqual(REPORT_PERIODS, ["MTD", "QTD", "YTD", "12M"]);

let companyWorkspacePeriodCases = 0;
for (const member of MEMBER_DIRECTORY) {
  for (const route of MEMBER_WORKSPACE_ROUTES) {
    for (const period of REPORT_PERIODS) {
      const href = memberWorkspacePeriodHref(member.slug, route.id, period);
      const url = new URL(href, "https://distranet.invalid");
      assert.equal(url.pathname, `/member-hub/${member.slug}${route.segment ? `/${route.segment}` : ""}`);
      assert.equal(url.search, `?period=${period}`);
      assert.equal(url.hash, "");
      assert.equal(parseDemonstrationPeriod(url.searchParams.get("period")), period);
      // Re-reading the destination URL models reload/history restoration, with
      // no component-local or cross-company storage needed to recover period.
      assert.equal(memberWorkspacePeriodHref(member.slug, route.id, parseDemonstrationPeriod(url.searchParams.get("period"))), href);
      companyWorkspacePeriodCases++;
    }
    for (const alias of route.legacySegments) {
      assert.equal(resolveMemberWorkspace(alias)?.id, route.id);
    }
  }
}

let cleanCompanySwitchCases = 0;
for (const period of REPORT_PERIODS) {
  const source = new URL(`/member-hub/air-hydro-power/orders?period=${period}&company=air-hydro-power&orderId=private-example&customerId=example&filter=returns&auth=claimed#record`, "https://distranet.invalid");
  for (const member of MEMBER_DIRECTORY) {
    for (const route of MEMBER_WORKSPACE_ROUTES) {
      const destination = new URL(memberWorkspacePeriodHref(member.slug, route.id, parseDemonstrationPeriod(source.searchParams.get("period"))), source);
      assert.deepEqual([...destination.searchParams], [["period", period]]);
      assert.equal(destination.hash, "");
      assert.ok(!destination.href.includes("private-example"));
      cleanCompanySwitchCases++;
    }
  }
}

for (const invalid of [null, "", "mtd", "ALL", "__proto__", "MTD,12M", "YTD&auth=true"]) {
  const period = parseDemonstrationPeriod(invalid);
  assert.equal(period, "YTD");
  assert.equal(memberWorkspacePeriodHref("air-hydro-power", "overview", period), "/member-hub/air-hydro-power?period=YTD");
}
assert.throws(() => memberWorkspacePeriodHref("air-hydro-power", "orders", "ALL"));
for (const period of REPORT_PERIODS) assert.equal(memberDirectoryPeriodHref(period), `/member-hub?period=${period}`);
assert.throws(() => memberDirectoryPeriodHref("ALL"));

// Period-only changes stay on the same page, retaining that page's local hash
// and filters. Page/company navigation above deliberately starts clean.
assert.equal(withDemonstrationPeriod("/member-hub/air-hydro-power?period=MTD#portrait", "QTD"), "/member-hub/air-hydro-power?period=QTD#portrait");
assert.equal(withDemonstrationPeriod("/member-hub/air-hydro-power/orders?filter=returns&period=MTD#table", "12M"), "/member-hub/air-hydro-power/orders?filter=returns&period=12M#table");
assert.equal(withDemonstrationPeriod("/member-hub/air-hydro-power/orders?period=MTD&period=QTD", "YTD"), "/member-hub/air-hydro-power/orders?period=YTD");

console.log(JSON.stringify({ status: "PASS", companies: MEMBER_DIRECTORY.length, workspaces: MEMBER_WORKSPACE_ROUTES.length, reportingPeriods: REPORT_PERIODS.length, companyWorkspacePeriodCases, cleanCompanySwitchCases, samePageQueryAndHashPreserved: true, invalidPeriodDefaultsToYtd: true, productionAccess: false }));

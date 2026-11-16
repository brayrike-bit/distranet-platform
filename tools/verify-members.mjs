import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cache = new Map();
// Compile only this repository's pure fixture/configuration modules for testing.
function load(relative) {
  const filename = path.resolve(root, relative);
  if (cache.has(filename)) return cache.get(filename).exports;
  const mod = { exports: {} };
  cache.set(filename, mod);
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const scopedRequire = (name) => {
    const target = name.startsWith('@/') ? path.join(root, 'src', name.slice(2)) : path.resolve(path.dirname(filename), name);
    assert.ok(target.startsWith(path.join(root, 'src') + path.sep), 'Fixtures must stay within src');
    return load(path.relative(root, target.endsWith('.ts') ? target : `${target}.ts`));
  };
  new Function('require', 'module', 'exports', source)(scopedRequire, mod, mod.exports);
  return mod.exports;
}

const { MEMBER_DIRECTORY } = load('src/brands/member-directory.ts');
const { MEMBER_TENANTS, resolveMemberTenant } = load('src/brands/member-tenants.ts');
const { memberDataForPeriod } = load('src/features/member-hub/member-demo-data.ts');
const { contrastRatio, memberBrandVariables } = load('src/brands/member-theme.ts');
const { MEMBER_WORKSPACE_ROUTES, memberWorkspaceHref } = load('src/features/member-hub/workspace/member-workspace-routes.ts');
const close = (a, b) => assert.ok(Math.abs(a - b) < 0.01, `${a} != ${b}`);
const sum = (rows, key) => rows.reduce((n, row) => n + row[key], 0);

assert.equal(MEMBER_DIRECTORY.length, 21);
assert.equal(new Set(MEMBER_DIRECTORY.map(member => member.slug)).size, 21);
assert.equal(Object.keys(MEMBER_TENANTS).length, 21);
assert.equal(MEMBER_WORKSPACE_ROUTES.length, 14);
assert.equal(resolveMemberTenant('__proto__'), undefined);
assert.equal(resolveMemberTenant('not-a-member'), undefined);

const ids = new Set();
let periodChecks = 0;
for (const identity of MEMBER_DIRECTORY) {
  const tenant = MEMBER_TENANTS[identity.slug];
  assert.equal(tenant.displayName, identity.name);
  assert.equal(tenant.logo.src, identity.logo);
  assert.ok(fs.statSync(path.join(root, 'public', tenant.logo.src)).size > 100);
  const variables = memberBrandVariables(tenant);
  assert.ok(contrastRatio(variables['--tenant-primary'], '#ffffff') >= 4.5, `${identity.slug}: light contrast`);
  assert.ok(contrastRatio(variables['--tenant-on-dark'], '#14232b') >= 4.5, `${identity.slug}: dark contrast`);
  assert.ok(contrastRatio(variables['--tenant-on-dark-secondary'], '#14232b') >= 4.5, `${identity.slug}: secondary dark contrast`);
  for (const route of MEMBER_WORKSPACE_ROUTES) {
    assert.ok(memberWorkspaceHref(identity.slug, route.id).startsWith(`/member-hub/${identity.slug}`));
  }
  if (identity.slug === 'air-hydro-power') {
    assert.equal(tenant.arrival.film, 'memberHubTenantArrivalAirHydroPower');
    continue;
  }
  assert.equal(tenant.arrival.film, null, 'Never borrow another company\'s film');
  assert.ok(!JSON.stringify(tenant).includes('Air Hydro Power'));
  assert.ok(!JSON.stringify(tenant).includes('Brayden Rike'));
  for (const collection of Object.values(tenant.data).filter(Array.isArray)) {
    for (const row of collection) {
      if (!row.id) continue;
      assert.ok(row.id.startsWith(`${identity.slug}-sample-`));
      assert.ok(!ids.has(row.id), `Duplicate ID ${row.id}`);
      ids.add(row.id);
    }
  }
  assert.equal(tenant.data.acquisitionChannels.filter(row => row.id.endsWith('-unknown')).length, 1);
  assert.equal(tenant.data.acquisitionChannels.find(row => row.id.endsWith('-unknown')).label, 'Unattributed');
  for (const period of ['MTD', 'QTD', 'YTD', '12M']) {
    const data = memberDataForPeriod(tenant, period);
    const snapshot = data.snapshots[period];
    close(snapshot.productReimbursement + snapshot.memberMarginShare + snapshot.partsGopherMarginShare + snapshot.adjustments, snapshot.attributedSales);
    for (const rows of [data.acquisitionChannels, data.productPerformance, data.territoryPerformance]) close(sum(rows, 'attributedSales'), snapshot.attributedSales);
    close(sum(data.acquisitionChannels, 'orders'), snapshot.recognizedOrders);
    for (const rows of [data.productPerformance, data.territoryPerformance, data.fulfillmentPerformance]) close(sum(rows, 'recognizedOrders'), snapshot.recognizedOrders);
    close(sum(data.productPerformance, 'memberMarginShare'), snapshot.memberMarginShare);
    close(sum(data.demandSignals, 'opportunityValue'), snapshot.opportunityValue);
    close(data.actionItems.find(row => row.id.endsWith('action-review')).value, data.demandSignals[0].opportunityValue);
    assert.ok(data.productPerformance.every(row => row.brand === 'Parker'));
    periodChecks++;
  }
}
console.log(JSON.stringify({ status: 'PASS', members: 21, canonicalPagesPerMember: MEMBER_WORKSPACE_ROUTES.length, brandedDestinations: MEMBER_DIRECTORY.length * MEMBER_WORKSPACE_ROUTES.length, scopedFixtureIds: ids.size, memberPeriodChecks: periodChecks, ahpFilmPreserved: true, logosPresent: 21, brandContrastAA: true, productionDataOrAuthentication: false }, null, 2));

if (process.argv[2]) {
  const base = new URL(process.argv[2]);
  let routes = 0;
  for (const member of MEMBER_DIRECTORY) {
    for (const route of MEMBER_WORKSPACE_ROUTES) {
      const response = await fetch(new URL(memberWorkspaceHref(member.slug, route.id), base));
      assert.equal(response.status, 200, `${member.slug}/${route.id}`);
      const html = await response.text();
      assert.ok(html.includes(`data-member-workspace="${member.slug}"`), 'Correct tenant shell');
      assert.ok(html.includes('Demonstration data'), 'Demo disclosure');
      assert.ok(html.includes(member.logo), 'Correct logo');
      routes++;
    }
  }
  assert.equal((await fetch(new URL('/member-hub/not-a-member', base))).status, 404);
  console.log(JSON.stringify({ status: 'PASS', base: base.origin, verifiedMemberRoutes: routes, unknownMemberReturns404: true }));
}

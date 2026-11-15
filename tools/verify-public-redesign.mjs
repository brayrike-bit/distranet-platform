import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function pureModule(relative) {
  const source = ts.transpileModule(fs.readFileSync(path.join(root, relative), 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  const mod = { exports: {} };
  new Function('module', 'exports', source)(mod, mod.exports);
  return mod.exports;
}
const { PUBLIC_STORIES } = pureModule('src/features/public-editorial/public-content.ts');
const { MEMBER_FINISHED_FILMS } = pureModule('src/features/member-hub/member-finished-films.ts');
const routes = ['home', 'advantage', 'network', 'parts-gopher', 'distranet-direct', 'membership', 'about'];
assert.deepEqual(Object.keys(PUBLIC_STORIES), routes);
assert.equal(new Set(Object.values(PUBLIC_STORIES).map(x => x.title)).size, 7);
assert.equal(new Set(Object.values(PUBLIC_STORIES).map(x => x.intro)).size, 7);
for (const route of routes) {
  const content = PUBLIC_STORIES[route];
  assert.equal(content.steps.length, 3);
  assert.equal(content.details.length, 3);
  assert.ok(content.nextHref.startsWith('/'));
  const file = route === 'home' ? 'src/app/page.tsx' : `src/app/${route}/page.tsx`;
  assert.match(fs.readFileSync(path.join(root, file), 'utf8'), /<PublicExperience/);
}
assert.match(JSON.stringify(PUBLIC_STORIES['parts-gopher']), /Parker/);
assert.match(JSON.stringify(PUBLIC_STORIES['distranet-direct']), /multi-brand/i);
assert.doesNotMatch(JSON.stringify(PUBLIC_STORIES), /not subsidiaries of a parent distributor|\$\d+\s*million/i);
const film = MEMBER_FINISHED_FILMS['connector-specialists'];
assert.equal(film.delivery.branding, 'baked');
assert.equal(film.delivery.status, 'ready');
assert.equal(film.durationSeconds, 241 / 24);
assert.equal(film.desktop.poster.width / film.desktop.poster.height, 16 / 9);
assert.equal(film.mobile.poster.width / film.mobile.poster.height, 8 / 9);
for (const variant of [film.desktop, film.mobile]) for (const asset of [variant.poster.src, ...variant.sources.map(x => x.src)]) assert.ok(fs.statSync(path.join(root, 'public', asset)).size > 1000);
for (const [prefix, folder, frames] of [['csi','member-csi-seedance25-finished',265],['distranet','distranet-seedance25-brand-finished',169],['csi-photo-d','member-csi-seedance25-photo-2026-11-11',241]]) {
  const receipt = JSON.parse(fs.readFileSync(path.join(root, `docs/creative/${prefix}-seedance25-finished-tracking.json`), 'utf8'));
  const bytes = fs.readFileSync(path.join(root, `public/media/cinematic/${folder}/desktop.mp4`));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), receipt.outputSha256);
  assert.equal(receipt.outputFrames, frames);
  assert.equal(receipt.width,1920); assert.equal(receipt.height,1080); assert.equal(receipt.gop,6);
  assert.ok(receipt.planes.every(p=>p.exportedUntrackedEdgeFrames===0 && p.exportedInterpolatedFrames===0));
}
const footer = fs.readFileSync(path.join(root, 'src/components/PublicFooter.tsx'), 'utf8');
assert.doesNotMatch(footer, /Keep your identity|Multiply your strength|<video|<Image/);
const hero = fs.readFileSync(path.join(root, 'src/features/public-cinema/PublicFilmSequence.tsx'), 'utf8');
assert.match(hero, /motionMode === "scrub" && <div className=\{styles.paceControls\}/);
assert.match(hero, /behavior: "instant", block: "start"/);
assert.match(hero, /history\.pushState\(history\.state/);
assert.match(hero, /function fragmentId/);
const browserRoutes = routes.map(x => x === 'home' ? '/' : `/${x}`);
if (process.argv[2]) {
  const base = new URL(process.argv[2]);
  for (const route of [...browserRoutes, '/member-access']) {
    const response = await fetch(new URL(route, base));
    assert.equal(response.status, 200, route);
    const html = await response.text();
    if (route !== '/member-access') {
      assert.match(html, /data-public-redesign="editorial-2026-11"/);
      assert.match(html, /id="public-story"/);
      assert.match(html, /id="operating-model"/);
      assert.match(html, /href="\/member-access"/);
    } else {
      assert.match(html, /Choose your company/);
      assert.doesNotMatch(html, /route-optics|data-pointer/);
    }
  }
  const response = await fetch(new URL('/member-hub/connector-specialists', base));
  assert.equal(response.status, 200);
  assert.match(await response.text(), /scroll-only-finished-film/);
}
console.log(JSON.stringify({ status: 'PASS', scope:'Public redesign and 2026-11-11 CSI replacement; old export preserved for rollback', distinctPublicRoutes: 7, sourceContentChecks: true, currentNewFilms: 2, currentRegisteredMemberFilms: Object.keys(MEMBER_FINISHED_FILMS).length, verifiedFilmHashes: 3, note: 'Registry count is not acceptance of the requested new art direction for every company.', httpChecked: Boolean(process.argv[2]), productionDeployment: false }, null, 2));

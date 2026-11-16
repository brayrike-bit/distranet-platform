# Distranet Platform

This is the reviewed, transferable preview: the seven public pages, member-access gateway, and all 21 company workspaces. Member data is illustrative only. The preview has no live sign-in, production data connection, or private document uploads.

## Run on another computer

Install Git and Node.js 22 (which includes npm), then run:

```sh
git clone https://github.com/brayrike-bit/distranet-platform.git
cd distranet-platform
npm ci
npm run build
npm run start
```

Open [the homepage](http://localhost:3000/) or [the member directory](http://localhost:3000/member-hub). No environment file, provider credentials, or JARVIS drive is needed.

The current films and posters travel with the site, including the original Air Hydro Power entrance. Six other company hubs have their current films; the remaining hubs use branded welcome graphics. This snapshot preserves the reviewed designs. New cinematic work is deferred.

## Member workflow coverage

Membership, statistics, locations, files and access examples are illustrative. The five workflow pages in each branded workspace were mapped from [Dave’s public member-hub source](https://github.com/daverike-dot/distranet-member-hub/tree/8d359b14802266ffcac862ccf8834ec7b463a147) and implemented in the existing Next.js workspace.

| Workspace | Workflows |
| --- | --- |
| Trade Desk | Parts Search, branch-level stock and price classes, Buy/Sell Opportunities, Dead & Excess Stock, Shared Inventory reconciliation, sample adjustments and loss journal |
| Network Programs | Distranet Impact, GPO purchasing and savings, National Accounts assignments |
| Performance | DemandSignal, EDI buying/selling matrix, evidence-weighted scorecard, exception triage, Industry Data Pool coverage |
| Resources | Announcements and sample communication drafts, data and GPO document catalogs, CSV/report exports, local import and checksum receipts |
| Administration | Locations and shipping settings, sample recipient preferences and digest preview, account and module-access controls, sample network registries |

Browser-tab examples do not grant access or create accounts, passwords, messages, real inventory transactions, or shared documents. The import check reads a user-selected sample in memory, verifies its name and size and calculates SHA-256. The library can attach only references to exact built-in samples; no selected file bytes are saved or sent. Catalog references to original PDFs are intentionally unavailable. CSVs and receipts are generated in the browser.

To connect production: implement server-side identity and tenant/role checks; replace fixtures with approved inventory, EDI, commerce and catalog datasets; issue scoped private upload/download URLs; verify checksums, file types, schemas and malware scan before committing an import; record actor, tenant, version and approval in an audit log; then add queued reports and communications with delivery controls. No live source, notification provider or authentication from the reference repo is connected.

## Verify locally

With the site running:

```sh
node tools/verify-members.mjs http://127.0.0.1:3000
node tools/verify-public-redesign.mjs http://127.0.0.1:3000
node src/features/member-hub/workspace/member-workspace-navigation.test.mjs
node src/features/member-hub/workspace/demonstration-report-export.test.mjs
node src/features/member-hub/workspace/parity/parity-data.test.mjs
```

This repository contains application source and static website assets. Raw film masters, provider job records, dependency caches, and local build output are not needed to run it. Do not use real company or customer data in the unauthenticated preview.

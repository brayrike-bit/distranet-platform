# Distranet Platform

This is the reviewed, transferable preview: the seven public pages, member-access gateway, and all 21 company workspaces. Member data is illustrative only. The preview has no live sign-in, production data connection, or private document uploads.

## Run on another computer

Install Git and Node.js 22 (which includes npm). Sign in to GitHub as an account with access to this private repository, then run:

```sh
git clone https://github.com/brayrike-bit/distranet-platform.git
cd distranet-platform
npm ci
npm run build
npm run start
```

Open [the homepage](http://localhost:3000/) or [the member directory](http://localhost:3000/member-hub). No environment file, provider credentials, or JARVIS drive is needed.

The current films and posters travel with the site, including the original Air Hydro Power entrance. Six other company hubs have their current films; the remaining hubs use branded welcome graphics. This snapshot preserves the reviewed designs. New cinematic work is deferred.

## Verify locally

With the site running:

```sh
node tools/verify-members.mjs http://127.0.0.1:3000
node tools/verify-public-redesign.mjs http://127.0.0.1:3000
node src/features/member-hub/workspace/member-workspace-navigation.test.mjs
node src/features/member-hub/workspace/demonstration-report-export.test.mjs
```

This repository contains application source and static website assets. Raw film masters, provider job records, dependency caches, and local build output are not needed to run it. Do not use real company or customer data in the unauthenticated preview.

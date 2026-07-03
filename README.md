# CSULB Biotech Club — Alumni Hub v2

A single-file web app: open **`AlumniHub.html`** in any browser. No install, no server.

## How the data works now

The data lives in a Google Sheet: **"CSULB Alumni Hub — Data"** (in the owner's Google Drive).
Every time someone opens the app, it fetches the latest sheet contents. **Edit the sheet → refresh the app → done.** No coding, no rebuild.

If the sheet can't be reached (offline, sheet deleted, sharing turned off), the app silently falls back to a copy embedded in the HTML file. The sidebar footer shows which one you're seeing: "● Live from Google Sheet" or "○ Offline copy".

### One-time setup (required once)

Open the sheet → **Share** → change "Restricted" to **"Anyone with the link" → Viewer**. Until then the app can only use its offline copy. The sheet contains only public info (company names and public LinkedIn URLs).

### Editing the sheet

One row per company site. Columns:

| Column | Notes |
|---|---|
| id | Ignored by the app — just for your own ordering |
| company | Required |
| city, region | Required. Region must match an existing region name for clean grouping |
| description, website | Optional |
| industry | Must be one of: Biopharma, Diagnostics, Med Devices, Research Tools, CRO / CMO, Digital Health, Agri / Env, Staffing, Cell & Gene Therapy |
| lat, lng | Optional if the city already appears elsewhere in the data (coords are borrowed). For a brand-new city, look up coordinates once (e.g. Google Maps right-click) |
| alums | `Name \| LinkedIn-URL`, multiple people separated by ` ; ` — e.g. `Jane Doe \| https://linkedin.com/in/janedoe ; John Smith \| https://linkedin.com/in/jsmith` . Name is optional (`https://...` alone works; the app then guesses from the URL) |

Alumni counts are computed automatically from the alums column — there's no count field to keep in sync.

### Keeping entries consistent (one-time, strongly recommended)

Add dropdowns so editors pick categories instead of typing them:

1. Open the sheet and select all of column **G (industry)** from row 2 down.
2. Menu: **Data → Data validation → Add rule**. Criteria: **Dropdown**. Add these exact options: Biopharma, Diagnostics, Med Devices, Research Tools, CRO / CMO, Digital Health, Agri / Env, Staffing, Cell & Gene Therapy. Under Advanced, set **Reject the input**. Done.
3. Repeat for column **D (region)** with: Orange County, San Diego, LA - East / SGV, LA - South Bay / LBC, LA - West / Valley, Ventura / SB, Central CA, Other SoCal.
4. Optional: **View → Freeze → 1 row**, and right-click row 1 → Protect the range, so the header can't be edited or reordered. (The app finds columns by header name, so renaming headers is the one edit that would break it.)

As a safety net, the app also auto-corrects common variants ("biopharma", "CRO/CMO", "med device", "South Bay"…) to the canonical names, and logs a browser-console warning for anything it can't recognize — unknown categories display in gray instead of breaking the app.

### Refreshing the offline fallback (occasionally)

The copy inside AlumniHub.html is a snapshot. A couple of times a semester, run:

```
node scripts/sync.mjs
```

This pulls the sheet, rewrites `data/companies.json`, and rebuilds `AlumniHub.html`. Requires Node.js and `npm install` (first time only).

## Project layout

```
AlumniHub.html        ← the app (generated — don't edit by hand)
data/config.json      ← Google Sheet ID
data/companies.json   ← offline fallback snapshot (refreshed by sync.mjs)
assets/logo.png       ← club logo, inlined at build time
src/                  ← app source, one file per page
scripts/build.mjs     ← assembles AlumniHub.html from src/ + data/
scripts/sync.mjs      ← sheet → companies.json → rebuild
scripts/smoke-test.mjs / smoke-test-live.mjs ← automated checks (need: npm install jsdom)
```

## Handing off to future officers

Give them: (1) edit access to the Google Sheet — that's all most officers ever need; (2) this folder, for whoever maintains the app itself. If the sheet is ever replaced, put the new sheet's ID in `data/config.json` and rebuild.

## Publishing on GitHub (one-time, ~5 minutes)

This folder is already a git repository with everything committed. To put it online:

1. **GitHub Desktop** → File → **Add local repository** → choose this folder.
2. Click **Publish repository**. Name it `csulb-alumni-hub`, uncheck "Keep this code private" (Pages is free only for public repos), publish.
3. On github.com, open the repo → **Settings → Pages** → under "Build and deployment", Source: **Deploy from a branch**, Branch: **main** / **(root)** → Save.
4. Wait ~2 minutes. The site is live at `https://YOUR-USERNAME.github.io/csulb-alumni-hub/`. Paste that URL into `HANDOFF.md` and commit.

From then on, the included GitHub Action (`.github/workflows/sync-and-build.yml`) runs every Monday and on every push: it pulls the sheet, rebuilds, runs all tests, and commits — so the offline fallback stays fresh and Pages redeploys automatically. **No one ever needs Node installed again**; edits happen in the sheet, and code changes just need a commit.

## Sharing the app

Share the GitHub Pages link. `AlumniHub.html` also works standalone — email it or drop it in a shared drive. Either way, data loads live from the sheet, so old copies still show current data.

## Data provenance

Source list: BiopharmGuy SoCal export (May 2025), manually consolidated and matched to CSULB alumni on LinkedIn. Names are parsed from LinkedIn URLs unless corrected in the sheet — verify a profile before reaching out on the club's behalf. Blank names in the sheet (hard-to-parse URLs) are good candidates to fill in by hand.

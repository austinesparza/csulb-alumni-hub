# Alumni Hub — Officer Handoff

The one page you need for yearly carryover. Fill in the two blanks after first publish.

## The three pieces

| Piece | Where | Who needs it |
|---|---|---|
| **Google Sheet** (the data) | [CSULB Alumni Hub — Data](https://docs.google.com/spreadsheets/d/1aMtYOWrWT1W86YYEwT8xyGl-Pv0cYlQty40877TiEAo/edit) | Anyone who updates companies/alumni |
| **GitHub repo** (the app) | `https://github.com/________/csulb-alumni-hub` | One "maintainer" officer per year |
| **Live site** | `https://________.github.io/csulb-alumni-hub/` | Everyone — share this link with members |

## Yearly carryover checklist (10 minutes)

1. **Sheet:** Share → add the new officer as **Editor**. (Optionally File → "Make a copy" as a backup first.)
2. **Repo:** GitHub → repo Settings → Collaborators → add the new maintainer's GitHub account.
3. Send them this file. Done.

If the outgoing owner is graduating, transfer ownership instead: Sheet → Share → gear → transfer owner; Repo → Settings → Danger Zone → Transfer ownership (or move it to a club GitHub organization — best long-term).

## How updates work (nobody needs to code)

- **Edit the sheet** → the live site shows changes on next page load. That's it.
- Every Monday, a robot (GitHub Action) also snapshots the sheet into the repo as an offline backup and re-runs all tests. You can watch it under the repo's **Actions** tab; a red X means something's wrong with recent sheet edits (usually a renamed header row).
- Category dropdowns in the sheet keep entries consistent; the app also auto-corrects common typos and gives brand-new categories a color automatically.

## Rules that keep it working

- Don't rename the **header row** in the sheet (the app finds columns by name).
- Industry/region: pick from the dropdowns. New categories are allowed — they just appear.
- New company in a new city: fill in lat/lng once (right-click the spot in Google Maps → copy coordinates). Existing cities don't need coordinates.
- Alumni format: `Name | linkedin-url`, people separated by ` ; `.

## If something breaks

- Site shows "○ Offline copy" for everyone → sheet sharing got turned off, or the sheet was deleted. Re-share as "Anyone with link → Viewer", or restore it from Drive trash / version history.
- Bad edit wrecked the data → Sheet: File → Version history → restore. The app heals on next load.
- App itself broken → GitHub: revert the last commit (repo → Commits → revert). Or grab any old `AlumniHub.html` from history — every version ever published is in there.
- Sheet replaced with a new one → put the new sheet's ID in `data/config.json` (the long string in its URL) and commit.

## Full technical docs

See `README.md` in the repo.

# Route to Debt-Free

Ace's personal monthly budget tracker. Live at https://route-to-debt-free.vercel.app and used on an iPhone (Home Screen icon) and a Mac laptop.

## How the project is built
- The whole app is one file: `index.html` (HTML, CSS and JavaScript inline). No build step, no packages, no framework.
- Other files: `manifest.json`, `icon.png` (512px, also the browser tab icon and the sidebar badge) and `apple-touch-icon.png` (180px, the iPhone Home Screen icon). Keep the icon artwork inside the middle safe area, because iOS rounds the corners and clipped it once. When the icon changes, bump the `?v=` number on every icon link so phones fetch the new one.
- Fields (`.inp`, `.sel`) must be 16px on iPhone and iPad, otherwise Safari zooms in when one is tapped and stays zoomed. See the rules at the end of the CSS.
- Search `index.html` for these landmarks: `const SUPA` (sync service), `DEFAULT_GROUPS`, `calc(` (all the maths), `viewOverview`, `viewBudget`, `viewDebt`, `viewSettings`, `handle(` (all button actions), `xlsxBlob` (Excel export).

## Data model
- A month: `{id:'YYYY-MM', payday, note, hidden, income:[{id,label,amount,received}], lines:[{id,category,remarks,amount,actual,paid,group,termCurrent,termTotal}]}`
- Settings: `{name, currency, groups:[{name,hex,locked}]}`. Savings and Other are locked groups. Savings is kept out of the expenses total on purpose.
- A line with `termTotal` above 0 is an instalment. "New month" copies the plan, adds 1 to `termCurrent` and drops lines that have finished.
- `hidden: true` keeps a month out of the month dropdown (toggled with Hide/Show in Settings). The data stays and syncs. At least one month must stay visible.
- The Excel export is a hand written .xlsx writer with no libraries. Do not add one.

## Storage and sync
- Each device saves to localStorage: `routeToDebtFree.v1` (months, settings, stamp), `rtdf.theme`, `rtdf.sync` (the private sync code), `rtdf.syncOk` and `rtdf.syncFail` (when sync last worked and when it started failing, for the "Sync is paused" banner).
- Sync uses Supabase (free plan, project id `bxxnsfvkkijoexxzttfs`). The app only calls two database functions, `budget_vault_get(p_code)` and `budget_vault_put(p_code, p_payload)`, on table `public.budget_vaults`. Row level security is on and the public role has no direct table access.
- The sync code is a 24 character secret. It is the only key to a person's data. Never write one into this repo or into chat logs.
- Changes push about 1.2 seconds after an edit. The app pulls every 20 seconds while open. The newest `stamp` wins for the whole payload.
- The table `public.budget_data` belongs to an older project. Leave it alone.
- The Supabase free plan pauses after about a week without use. Sync then shows Offline and devices keep saving locally. That is a pause, not data loss. To prevent it, a Vercel cron in `vercel.json` calls `api/keepalive.js` every Monday and Thursday at 03:00 UTC; it asks for a code that does not exist, so it never touches real data. Once a week is not enough, it can miss the 7 day limit.
- The free Supabase plan allows only 2 active projects. If this one is paused, another project has to be paused before it can be restored.
- If sync fails for over a minute (or the last good sync is over an hour old) a "Sync is paused" banner shows above the page (`paintSyncBanner`). A short blip only changes the chip.
- On iPhone the Home Screen icon and Safari keep separate localStorage.

## Deploying
- Push to `main` on GitHub (`Aceleonard/route-to-debt-free`). The Vercel project `route-to-debt-free` (team slug `mecsr`) deploys production automatically in about a minute.
- Deployment Protection is switched off on purpose so the app opens without a Vercel login.
- Never add `vercel.json` rewrites, proxies or redirects that point at a specific deployment URL. Vercel deletes old deployments, and that is what caused a 410 outage. `vercel.json` should hold only the keep-alive cron.
- A separate copy lives at https://claude.ai/artifact/HeWzmMpmubnw7qs1K3RAGr with a different storage backend. It is not the production site.

## Rules for changes
- Never commit real budget figures. `const SEED = null;` must stay null in this repo.
- Before committing, copy the last `<script>` block out and run `node --check` on it. A syntax error blanks the whole app. Ace's Mac has no Node: use `/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc -e "new Function(readFile('app.js'))"` instead.
- The Overview "Month by month" chart (`trendCard`) shows paid (ticked) spending and savings for the last 6 visible months. `liveRefresh` swaps just that card when a bill is ticked.
- Ticking a bill must stay instant: it updates in place through `paintTick` and `liveRefresh` and the `data-live` attributes. Do not make it rebuild the whole screen.
- Test on iPhone Safari as well as desktop. Date inputs have a Safari specific style fix near the end of the CSS.

## Working with Ace
- Explain steps plainly and one at a time. Say what to click and what he should see.
- Do not use em dashes in anything written for him.

# Route to Debt-Free

Ace's personal monthly budget tracker. Live at https://route-to-debt-free.vercel.app and used on an iPhone (Home Screen icon) and a Mac laptop.

## How the project is built
- The whole app is one file: `index.html` (HTML, CSS and JavaScript inline). No build step, no packages, no framework.
- Other files: `manifest.json` and `icon.png` (256px home screen icon). Keep the icon artwork inside the middle safe area, because iOS rounds the corners and clipped it once.
- Search `index.html` for these landmarks: `const SUPA` (sync service), `DEFAULT_GROUPS`, `calc(` (all the maths), `viewOverview`, `viewBudget`, `viewDebt`, `viewSettings`, `handle(` (all button actions), `xlsxBlob` (Excel export).

## Data model
- A month: `{id:'YYYY-MM', payday, note, income:[{id,label,amount,received}], lines:[{id,category,remarks,amount,actual,paid,group,termCurrent,termTotal}]}`
- Settings: `{name, currency, groups:[{name,hex,locked}]}`. Savings and Other are locked groups. Savings is kept out of the expenses total on purpose.
- A line with `termTotal` above 0 is an instalment. "New month" copies the plan, adds 1 to `termCurrent` and drops lines that have finished.
- The Excel export is a hand written .xlsx writer with no libraries. Do not add one.

## Storage and sync
- Each device saves to localStorage: `routeToDebtFree.v1` (months, settings, stamp), `rtdf.theme`, `rtdf.sync` (the private sync code).
- Sync uses Supabase (free plan, project id `bxxnsfvkkijoexxzttfs`). The app only calls two database functions, `budget_vault_get(p_code)` and `budget_vault_put(p_code, p_payload)`, on table `public.budget_vaults`. Row level security is on and the public role has no direct table access.
- The sync code is a 24 character secret. It is the only key to a person's data. Never write one into this repo or into chat logs.
- Changes push about 1.2 seconds after an edit. The app pulls every 20 seconds while open. The newest `stamp` wins for the whole payload.
- The table `public.budget_data` belongs to an older project. Leave it alone.
- The Supabase free plan pauses after about a week without use. Sync then shows Offline and devices keep saving locally. That is a pause, not data loss.
- On iPhone the Home Screen icon and Safari keep separate localStorage.

## Deploying
- Push to `main` on GitHub (`Aceleonard/route-to-debt-free`). The Vercel project `route-to-debt-free` (team slug `mecsr`) deploys production automatically in about a minute.
- Deployment Protection is switched off on purpose so the app opens without a Vercel login.
- Never add `vercel.json` rewrites, proxies or redirects that point at a specific deployment URL. Vercel deletes old deployments, and that is what caused a 410 outage.
- A separate copy lives at https://claude.ai/artifact/HeWzmMpmubnw7qs1K3RAGr with a different storage backend. It is not the production site.

## Rules for changes
- Never commit real budget figures. `const SEED = null;` must stay null in this repo.
- Before committing, copy the last `<script>` block out and run `node --check` on it. A syntax error blanks the whole app.
- Ticking a bill must stay instant: it updates in place through `paintTick` and `liveRefresh` and the `data-live` attributes. Do not make it rebuild the whole screen.
- Test on iPhone Safari as well as desktop. Date inputs have a Safari specific style fix near the end of the CSS.

## Working with Ace
- Explain steps plainly and one at a time. Say what to click and what he should see.
- Do not use em dashes in anything written for him.

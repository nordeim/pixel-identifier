# Pixelco Clone — Round 4 Dashboard Parity & Production Readiness Plan

> **For Claude:** REQUIRED SUB-SKILL: Use the `tdd` skill (red → green) to
> implement this plan task-by-task. Every behavioral change starts with a
> failing test at a pre-agreed seam (pure data module, analytics query, or
> route handler). Presentational-only changes (className swaps, icon swaps)
> are gated by lint + typecheck + build + fresh browser screenshots instead —
> say so explicitly in each commit. Commit after each green task.
> (`verification-and-review-protocol`: no completion claim without fresh
> command output read by you.)

**Goal:** Close the dashboard visual/functional parity gaps against the live
`app.pixelco.io` (logged-in surfaces), fix a discovered standalone-deployment
defect (static assets never copied/served), and add the production-readiness
artefacts (Dockerfile, CI workflow, SQL aggregation) the PAD tracks as open.

**Architecture:** Next.js 16 App Router. All changes are inside the existing
dashboard chrome (`sidebar-nav.tsx`, `topbar.tsx`, `dashboard/layout.tsx`) and
the seven dashboard pages/components. One new analytics query signature
(`getTopPages` → SQL groupBy), one new npm script (`build:standalone`), two new
infra files (`Dockerfile`, `.github/workflows/ci.yml`). No route additions, no
schema changes, no dependency changes.

**Tech Stack:** unchanged (Next 16, React 19, TS strict, Tailwind 4,
shadcn/ui, Prisma/SQLite, NextAuth v4, Vitest).

**Audit source:** Round-4 audit (2026-09-15) of HEAD `3fc49ac`. Live evidence:
logged into `app.pixelco.io` with the supplied account, captured all 7
dashboard surfaces at 1440×900 (archived in sandbox
`research/round4-audit/live/`), extracted DOM ground truth (nav icon names via
lucide classes, topbar classes `h-14 … bg-card px-6`, h1
`font-display text-sm font-semibold leading-none`, bell dot
`bg-hot-pink` = `rgb(236,70,153)`, per-page title/subtitle strings, sidebar
collapse-to-rail behavior, main `flex-1 p-6`, body bg `#F6F7F9`). Local
counterparts captured from a standalone build (`research/round4-audit/local/`)
and compared pairwise via VLM. Findings cross-checked against source before
listing.

**Severity scale** (code-review-and-audit skill): Critical → fix first;
High → same release; Medium → this release; Low → opportunistically.

---

## Findings (validated against the codebase)

| ID | Sev | Finding | Evidence (verbatim) |
|----|-----|---------|---------------------|
| P-01 | High | Standalone deployment is broken as documented: `next build` never copies `.next/static` (or `public/`) into `.next/standalone`, so `node server.js` serves a page whose JS/CSS 404 — React never hydrates and forms native-GET-submit (password ends up in the URL). Round-2/3 smoke tests only checked page status codes, so this was never caught. | `ls .next/standalone/.next/` → no `static`; browser: `GET /_next/static/chunks/2tzlvp2q7dk6t.js 404`; login click → `/login?email=…&password=…` |
| P-02 | High | Sidebar nav icons don't match the original: Overview `LayoutDashboard` vs live `lucide-chart-column`, Install `Code2` vs live `lucide-code-xml`, Domains `Globe` vs live `lucide-users` | live DOM: `chart-column`, `eye`, `activity`, `code-xml`, `users`, `credit-card`, `settings`; clone `sidebar-nav.tsx:5-13` |
| P-03 | High | Sidebar section headers styled wrong: clone is `text-[10px] font-bold uppercase tracking-widest`; live is Title Case, regular weight, ~13-14px gray (`Analytics`, `Setup`, `Account`) | `sidebar-nav.tsx:79`; live zoom: "Title Case, Regular weight, 13-14px, medium-dark gray" |
| P-04 | Medium | Sidebar active item too saturated: clone `bg-primary/15 text-amber-700` + amber icon; live is a very pale yellow/cream pill with dark text | `sidebar-nav.tsx:93-97`; VLM: "subtle gray/beige vs pastel yellow", "bold yellow highlight vs subtle tint" |
| P-05 | Medium | Logo mark doesn't match: clone renders five rounded squares; live asset is a 4-lobed rounded blob with a yellow→orange gradient | `pixelco-logo.tsx:15-19`; live `assets/logo-*.png` 550×550 analysis |
| P-06 | High | Topbar structure/copy drift: clone `h-16 … bg-app/95 backdrop-blur`, title `text-base font-bold` **with a page icon**; live `h-14 … bg-card` solid, `px-6`, left `gap-4`, h1 `font-display text-sm font-semibold leading-none`, **no icon**, subtitle `text-xs` | `topbar.tsx:50,65-69`; live DOM `header.h-14.flex.items-center.justify-between.border-b.border-border.bg-card.px-6` |
| P-07 | Medium | Notification bell: clone renders no unread indicator by design ("none yet"); live shows a hot-pink dot (`bg-hot-pink`) when there is unread activity | live DOM: `absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-hot-pink` (#EC4699); `topbar.tsx:73-82` |
| P-08 | Medium | No desktop sidebar collapse: live "Toggle Sidebar" button collapses to a ~64px icon rail and is visible at all widths; clone only has a mobile Sheet | live click test → icon rail with icons only; `topbar.tsx:53-63` (`lg:hidden`), `layout.tsx:31-35` |
| P-09 | Medium | Dashboard canvas color + padding: clone `bg-app` #F9FAFB and `main` `px-4 py-6 sm:px-6 lg:px-8`; live body `#F6F7F9`, `main` `flex-1 p-6` | `globals.css:129`, `layout.tsx:39`; live computed styles |
| P-10 | High | Overview trend chart: clone plots pageviews amber + identified teal with fills under both + a Legend + a "Last 14 days" subtitle; live has **no subtitle, no legend**, pageviews **purple**, identified teal, light fill under the teal line only, dashed gridlines horizontal **and** vertical | `trend-chart.tsx:23-83`, `page.tsx:94`; live chart zoom |
| P-11 | Medium | Overview "Top Pages": clone wraps rank in `h-7 w-7` circles + mono path + "N views" inline; live shows plain rank number, mono path, right-aligned bold count with "views" label beneath | `page.tsx:112-127`; live zoom |
| P-12 | Medium | Overview "Recent Identifications": clone has subtitle "Latest emails resolved" and a prominent amber `View all` + `ArrowRight`; live has no subtitle, small golden `View all` + `ArrowUpRight` (h-3 w-3) at header right; confidence % is black bold on live, teal on clone; avatar initials white on live, near-black on clone | `page.tsx:137-148,186-188,172`; live zoom |
| P-13 | High | Visitors page: counts subtitle sits in main content; live puts "N individuals · M companies identified" in the **topbar subtitle** and the only in-page action is `Export All` (topbar right, next to bell) | `visitors-table.tsx:167-188`; live DOM subtitle `"2 individuals · 0 companies identified"` + zoom |
| P-14 | High | Visitors tabs: clone = bordered pill group with icons on all three tabs sharing a row with search; live = plain-text tabs (active bold+dark, inactive gray), icons **only** on Individuals/Companies, on their own row above the search row | `visitors-table.tsx:191-217`; live zoom |
| P-15 | Medium | Visitors confidence bars: clone renders default primary (yellow) Progress; live is teal/cyan | `visitors-table.tsx` confidence cell uses bare `<Progress>`; live zoom: "Teal/Cyan" |
| P-16 | Medium | Activity page header: clone adds a `Radio` icon + a "Live/Paused" toggle badge; live shows plain "Live Feed" + subtitle "All events across your domains" and no toggle | `activity-feed.tsx:95-110`; live zoom |
| P-17 | Medium | Activity event badges/icons: live Identified badge = yellow bg (#FCD34D) + black text, Pageview = white/gray bg + dark text; icon circles: identified = yellow bg + white envelope, pageview = light-gray bg + dark eye | `activity-feed.tsx` badge classes; live zoom |
| P-18 | High | Install snippet block: clone renders `bg-stone-900` dark code block with dark Copy button; live is a **light gray/off-white** block with ghost-bordered Copy button | `install/page.tsx:113` (`bg-stone-900`), CopyButton className; live zoom |
| P-19 | Medium | Domains page: clone adds a Free-plan domain banner, `</>` install-link button per row, and moves the visitor count into the date line; live has none of that — rows show globe icon + bold domain + badge (Verified = yellow pill **with checkmark**, Pending = gray pill **with clock**) + "Added <date>" beneath, and a **large visitor count** on the right, plus trash | `domains-panel.tsx:78,156-179`; live zoom |
| P-20 | High | Pricing cards: clone highlights the **current** plan with a yellow border + floating "Popular" tab above the border, uses a button-group billing toggle, solid teal checkmarks, `ArrowRight` in CTAs, and `/mo` on the Free price; live = "Monthly [switch] Annual" toggle, yellow border + "POPULAR" on the **Growth** card (current plan gets only a disabled button), faint gold checks, no CTA arrow, no `/mo` on $0, and the feature checklist sits **below** the CTA with a bold quota summary line up top | `plan-panel.tsx:69-95,106-151,161-172`; live zoom |
| P-21 | Medium | Settings: clone has a "Display Name" field the live app doesn't offer, email helper text, a warning-triangle Danger Zone with tinted container and CSV note; live shows Company / Website / Email(disabled) only and a plain red "Danger Zone" + Delete | `settings-panel.tsx:64-105,~170-190`; live DOM snapshot (3 fields + Danger Zone/ Delete) |
| P-22 | Medium | Settings topbar subtitle lacks the trailing period: live "Manage your account and pixel configuration." vs clone without | live DOM extraction; `topbar.tsx:38` |
| P-23 | Medium | `getTopPages` aggregates lifetime pageviews in JS (PAD §11 MEDIUM) — replace with SQL `groupBy` while keeping the same return shape | `analytics.ts` getTopPages; PAD v1.2 §11 |
| P-24 | Low | No Dockerfile / CI workflow (PAD §11 LOW) — add multi-stage Dockerfile (with the static/public copy P-01 demands) and a GitHub Actions lint+typecheck+test+build workflow | PAD v1.2 §11 |

**Clean bill (verified this round, no action):** quota.ts invariants, ingest
route (hostname gate + rate limit), activity cursor pagination, visitors
URL-driven filters + keyboard tabs, export CSV, install per-domain switcher,
auth flows, 125/125 tests green at `3fc49ac`, marketing surface byte-identical
to round 3.

---

## Workstream S — Chrome parity (P-02 … P-09)

### Task S1: nav metadata as a testable seam
- **RED** `tests/dashboard-chrome.test.ts` for a new pure module
  `src/lib/dashboard-nav.ts` exporting `NAV_SECTIONS`,
  `PAGE_META` (title + subtitle per route) and `NOTIFICATION_DOT` color:
  - every route in `NAV_SECTIONS` appears in `PAGE_META` and vice versa;
  - icons referenced by **name** (`chart-column`, `eye`, `activity`,
    `code-xml`, `users`, `credit-card`, `settings`) match the live lucide set
    exactly (assert the array, ordered by section);
  - subtitles match the live strings verbatim, including the Visitors counts
    template `"{individuals} individuals · {companies} companies identified"`
    and the Settings trailing period;
  - section titles are Title Case (`Analytics`, `Setup`, `Account`).
- **GREEN**: create the module; `sidebar-nav.tsx` and `topbar.tsx` consume it.
- **commit** (`refactor(dashboard): nav + page-meta data seam matching the live app`).

### Task S2: sidebar visual alignment (presentational)
- Icons swap (`ChartColumn`, `CodeXml`, `Users`), section headers to
  `text-sm font-medium text-muted-foreground` (Title Case), active item to a
  pale cream pill (`bg-primary/10 text-foreground` with icon
  `text-amber-700`), hover unchanged. Gated by lint/typecheck/build +
  screenshot diff vs `round4-audit/live/01-overview.png`.
- **commit** (`fix(dashboard): sidebar icons, headers and active state match live`).

### Task S3: logo mark (presentational)
- Replace the five-square mark in `pixelco-logo.tsx` with a four-lobed rounded
  blob (two crossing rounded strokes) filled with a yellow→orange linear
  gradient, keeping the `PixelcoWordmark` API. Marketing pages reuse the same
  component, so verify landing header/footer still render correctly.
- **commit** (`fix(brand): logo mark matches the 4-lobe gradient original`).

### Task S4: topbar structure (presentational + P-06/P-22)
- Header: `sticky top-0 z-30 h-14 border-b bg-card px-6`, left
  `flex items-center gap-4`; remove the per-page icon; title
  `text-sm font-semibold leading-none`, subtitle `text-xs mt-0.5` (always
  visible, not `md:block`). Keep the mobile Sheet trigger. Subtitles come
  from the S1 seam; Visitors subtitle becomes a template filled with real
  counts (passed from the page via a context-free prop on Topbar — see S6).
- **commit** (`fix(dashboard): topbar matches live h-14 card chrome`).

### Task S5: honest bell dot (P-07)
- **RED** extend `tests/dashboard-chrome.test.ts`:
  - `hasUnreadActivity(events)` (pure helper in `dashboard-nav.ts` or
    `lib/analytics.ts`): true iff any event of type `identification` is newer
    than 7 days.
- **GREEN**: topbar renders the hot-pink dot
  (`bg-[#EC4699]` / `hot-pink` token) iff the flag is true; aria-label
  "New identifications" vs "No new notifications". Layout computes the flag
  with one cheap Prisma count and passes it down.
- **commit** (`feat(dashboard): real unread dot on the bell`).

### Task S6: Visitors topbar counts + Export All placement (P-13)
- **RED** `tests/visitors-query.test.ts` already proves counts; add a small
  render-contract test on the new pure helper
  `visitorsSubtitle(counts)` → `"2 individuals · 0 companies identified"`.
- **GREEN**: `visitors/page.tsx` passes counts up via the layout→topbar prop
  plumb (layout accepts optional `pageContext` from a route-group server
  component boundary — simplest: `Topbar` reads counts from a
  `VisitorsTopbarContext` provider rendered by the visitors page); move
  `Export All` into the topbar right cluster (before the bell) on
  `/dashboard/visitors`; `Export Selected` appears next to it when rows are
  selected. Remove the in-page counts row.
- **commit** (`feat(visitors): counts in topbar subtitle, Export All in topbar`).

### Task S7: desktop sidebar collapse-to-rail (P-08)
- **RED** `tests/dashboard-chrome.test.ts`: pure reducer
  `nextSidebarState(state, action)` for `expanded | rail` + localStorage key
  name constant; assert toggle idempotence and persistence key.
- **GREEN**: `layout.tsx` + a new client `SidebarShell` that renders
  `w-64` ↔ `w-16` (icons only, `title` tooltips, plan card hidden, sign-out
  icon-only) with the state persisted; topbar's mobile Sheet becomes a
  `lg:hidden` ghost button and a new always-visible "Toggle Sidebar" ghost
  button for ≥lg.
- **commit** (`feat(dashboard): collapsible desktop sidebar (icon rail)`).

### Task S8: canvas + main padding (P-09)
- `bg-app` → `#F6F7F9`; `main` → `flex-1 p-6`. Gated by build + screenshots.
- **commit** (`fix(dashboard): app canvas #F6F7F9 and p-6 main`).

---

## Workstream O — Overview (P-10, P-11, P-12)

### Task O1: trend chart restyle (presentational)
- Colors: pageviews `#9333EA` (purple) line, **no fill**; identified
  `#2DD4BF` (teal) line with a 12% gradient fill; remove `Legend`; remove the
  "Last 14 days" card subtitle; `CartesianGrid` gains `vertical` dashed
  lines; tooltip rows keep series colors. Keep the aria-label.
- **commit** (`fix(overview): trend chart palette/legend matches live`).

### Task O2: top pages + recent identifications rows (presentational)
- Top Pages: plain `text-xs font-semibold` rank (no circle), mono path, count
  right-aligned bold with "views" caption below. Remove "By pageviews"
  subtitle.
- Recent Identifications: drop the subtitle; `View all` becomes
  `text-xs font-semibold text-amber-600` + `ArrowUpRight h-3 w-3` in the
  header right; confidence % `font-semibold text-foreground` (black), teal
  bar kept; avatar chips switch to white initials (`text-white`).
- **commit** (`fix(overview): top-pages and recent-identification rows match live`).

---

## Workstream V — Visitors (P-14, P-15)

### Task V1: tab + filter layout (presentational)
- Tabs: plain-text row (active `font-bold text-foreground`, inactive
  `text-muted-foreground`), icons only on Individuals/Companies, counts
  `font-semibold`; own row above the search row (keep the WAI-ARIA arrow-key
  roving tabindex). Search + the two Selects on one row, search
  `sm:max-w-sm`.
- **commit** (`fix(visitors): plain-text tabs on their own row`).

### Task V2: confidence bars teal (presentational)
- Confidence cell Progress gets an explicit teal indicator class
  (`[&>div]:bg-teal-500`), % label `text-foreground` bold — matching live.
- **commit** (`fix(visitors): teal confidence bars`).

---

## Workstream A — Activity (P-16, P-17)

### Task A1: feed header + event styling (presentational)
- Header: "Live Feed" (no Radio icon) + subtitle "All events across your
  domains"; remove the Live/Paused toggle chip (polling stays always-on and
  visibility-aware). Badges: Identified → `bg-amber-300 text-amber-950`
  (#FCD34D family), Pageview → `bg-muted text-foreground`; icon circles:
  identified `bg-primary` with white Mail, pageview `bg-muted` with dark Eye.
  Card drops its border for `shadow-sm` + `rounded-xl`.
- **commit** (`fix(activity): feed chrome and event badges match live`).

---

## Workstream I — Install (P-18)

### Task I1: light snippet block (presentational)
- `pre` → `rounded-lg border border-border bg-[#F8F9FA] p-4 text-xs
  leading-relaxed text-foreground font-mono`; CopyButton → ghost/outline
  variant. Verify the copy-to-clipboard interaction still passes manually.
- **commit** (`fix(install): light-gray snippet block like the original`).

---

## Workstream D — Domains (P-19)

### Task D1: domain row layout (presentational)
- Remove the Free-plan banner and the `</>` per-row button; rows: `Globe`
  icon (amber), bold domain + status badge (Verified: `bg-primary/20
  text-amber-900` **with Check icon**; Pending: `bg-muted text-muted-foreground`
  **with Clock icon**), "Added <date>" beneath the name; right side: large
  `text-2xl font-bold` visitor count with "N visitors" caption, then the
  delete button. "Your Domains" header loses its right-side icon buttons.
- **commit** (`fix(domains): row layout with prominent visitor counts`).

---

## Workstream G — Pricing (P-20)

### Task G1: plan-card data seam
- **RED** `tests/plan-cards.test.ts` against `src/lib/plans.ts` +
  `plan-panel.tsx` helpers: quota summary line text
  (`100 lifetime identifications`, `2,500 identifications / mo`) and the
  feature lists per plan (Free has **no** "Real-time dashboard"/"CSV export"
  rows — parity with live card contents).
- **GREEN**: adjust `plans.ts` feature arrays to the live catalogue.
- **commit** (`fix(pricing): plan feature catalogue matches live cards`).

### Task G2: card + toggle restyle (presentational)
- Toggle becomes `Monthly` text + shadcn `Switch` + `Annual` text (aria
  `Switch to annual billing`); Growth keeps the yellow border + POPULAR badge
  **inside** the card header row; current plan gets a plain border and only
  the disabled "Current Plan" button; checks become `text-amber-500`
  (faint gold); CTA drops the `ArrowRight`; `$0` shows no `/mo`; feature
  checklist moves **below** the CTA with the bold quota summary line above
  the description.
- **commit** (`fix(pricing): billing switch, card emphasis and checklist order`).

---

## Workstream X — Settings (P-21, P-22)

### Task X1: settings form parity (presentational + seam)
- **RED** extend `tests/settings-action.test.ts` (exists as
  `tests/settings.test.ts` if named differently): profile update action must
  accept only `company` + `website` (name field removed from the schema
  input — model column stays, just not editable here).
- **GREEN**: remove the Display Name field + email helper text; Danger Zone
  simplified to a red heading + Delete button + one-line confirmation
  dialog (keep the typed-email confirm — safety regression is not acceptable
  for parity); drop the tinted container and CSV note from the card chrome.
- **commit** (`fix(settings): live-matching profile form and danger zone`).

---

## Workstream R — Production readiness (P-01, P-23, P-24)

### Task R1: standalone build script + smoke (P-01)
- **RED** `tests/standalone-smoke.test.ts` (shell-driven, skipped unless
  `PIXELCO_STANDALONE_SMOKE=1`): after `npm run build:standalone`, the
  standalone dir must contain `.next/static` and at least one chunk file, and
  `GET /_next/static/<chunk>` must answer 200 from a booted `server.js`.
- **GREEN**: `package.json` gains
  `build:standalone = next build && cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public 2>/dev/null || true`
  (ported to a small `scripts/build-standalone.mjs` for Windows-friendliness);
  README deployment section rewritten around it.
- **commit** (`fix(deploy): standalone builds ship their static assets`).

### Task R2: Dockerfile + .dockerignore (P-24)
- Multi-stage: `node:22-alpine` deps → build (`prisma generate`, `next
  build` via the R1 script) → runner copying `standalone`, `static`,
  `public`, `prisma/` schema for `prisma db push` on boot entrypoint;
  non-root `nextjs` user, `HEALTHCHECK` hitting `/api/health`, `ENV
  NODE_ENV=production`. Document build/run in README (SQLite volume mount,
  `NEXTAUTH_SECRET`/`NEXTAUTH_URL`).
- **commit** (`feat(deploy): production Dockerfile`).

### Task R3: GitHub Actions CI (P-24)
- `.github/workflows/ci.yml` on push/PR to main: matrix node 22, `npm ci`,
  `prisma generate`, lint, typecheck, `vitest run` (env `TZ=UTC`), `next
  build`. Upload nothing; fail fast. Verified locally by running the exact
  command list.
- **commit** (`ci: lint, typecheck, test, build on every push`).

### Task R4: getTopPages → SQL groupBy (P-23)
- **RED** extend `tests/visitors-query.test.ts` (or new
  `tests/top-pages.test.ts`) with the existing expectations re-run against a
  seeded SQLite DB: same ordering (views desc, path asc), same top-5 cut,
  same `{path, views}` shape, deterministic tie handling.
- **GREEN**: `analytics.ts` `getTopPages` uses
  `db.event.groupBy({ by: ['path'], _count: … })` scoped to the user's
  sites, ordering in SQL, slicing to 5 in JS. Keep function signature.
- **commit** (`perf(analytics): top pages aggregated in SQL`).

---

## Documentation realignment (Task DOC)

- README: new "Deploy" section (standalone script, Docker, env vars) +
  dashboard feature notes; CLAUDE.md: command table gains
  `build:standalone`, test seam list gains `dashboard-nav.ts`; PAD v1.2 →
  v1.3: revision block, ADR-010 (chrome/nav as data seam + collapsible
  rail), §11 rows closed (Dockerfile/CI, top-pages JS aggregation,
  standalone static assets), §12 line counts refreshed; AGENTS.md touched
  only if commands change.
- **commit** (`docs: realign with round-4 dashboard parity + deploy tooling`).

---

## Verification gate (per verification-and-review-protocol)

1. `npm run verify` (lint + typecheck + all tests + build) — green.
2. `npm run build:standalone` + standalone boot on a fresh SQLite file:
   `/api/health` ok, **a `_next/static` chunk answers 200**, login form
   submits via fetch (no credentials in URL), dashboard renders hydrated.
3. Browser E2E (agent-browser): login → each dashboard page → screenshot;
   VLM pairwise diff vs `round4-audit/live/*` — verdicts must improve to
   "close match" on chrome-level items; zero console/page errors; mobile
   390px pass on Overview + Visitors.
4. `docker build` (if sandbox daemon available — otherwise document as
   verified-by-construction with the exact local command list run).
5. Secret scan before commit (no key material, no `.env`).

## Execution order

S1 → S2 → S3 → S4 → S5 → S6 → S7 → S8 → O1 → O2 → V1 → V2 → A1 → I1 →
D1 → G1 → G2 → X1 → R4 → R1 → R2 → R3 → DOC → final gate → push.

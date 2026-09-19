# Round-16 Remediation Plan — App content-layer realignment

**Date:** 2026-09-18 · **Repo state at plan time:** main @ e948a61 (PAD v1.14,
432 tests / 50 files) · **Audit evidence:** `research/round16-audit/`

## Context

Round-16 re-audited every surface for live drift. The marketing bundle is
**stable** (landing sections [762,403,174,526,708,610,650,814,756,500],
H2 count 7, banner scoping, all sub-pages, blog slugs, robots.txt format,
favicon bytes, og-image bytes — all equal; the live only moved its og URLs
to gpt-engineer/R2 storage again, content md5s match the self-hosted
copies). The auth surfaces and the R15 shell are **stable** (login card,
h3, OAuth/submit buttons byte-identical; sidebar primitive variant remains
dominant — verified stable across repeated loads).

**The live shipped a new build of the dashboard CONTENT components.** Every
page below the shell drifted: the KPI cards, trend chart, activity rows,
domains rows, visitors tabs/table/badges, pricing switch/FAQ, settings
forms, install code blocks. The changes follow one consistent pattern —
the live's current generation renders text in `<span>`/`<div>` (not `<p>`),
drops `text-foreground` from every label/value, ships geometry-first class
orders, uses `div` rows (not `ul`/`li`), uses `div` icon chips (not `span`
+ `aria-hidden`), and ships the LEGACY Badge generation on content badges
(base `border` + secondary `text-secondary-foreground`) while keeping the
new-gen Badge in the sidebar.

**Audit method:** base64-encoded `outerHTML`/`innerHTML` DOM probes from
both sides on the same pages (avoids terminal escape-eating), structural
diffs with tag-sequence alignment (`scripts/r16-diff-all.py` methodology),
component-level full-string captures, stability verification across
repeated loads.

## Findings (all DOM-verified, evidence in round16-audit/)

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| R16-F1 | High | **Tabs primitive + consumers.** Live TabsList = `inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground` (clone base matches) but the visitors consumer still passes legacy leftovers `h-10 justify-start rounded-md p-1` (twMerge displaces the base order) — live visitors list has NO consumer classes. Trigger base order changed: `data-[state=active]:…` before `focus-visible:…` (clone ships focus-visible first). Tabs ROOT wrapper: live has NO class (clone: `flex flex-col gap-2`); install root passes `w-full`. Install TabsList consumer = `w-full justify-start mb-4` (clone: `mb-4 h-10 w-full justify-start bg-muted p-1`). | live/main-dashboard_visitors.html, install-tabs.json |
| R16-F2 | High | **Overview KPI cards.** Grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4` (clone: `grid gap-4 sm:grid-cols-2 xl:grid-cols-4` — missing grid-cols-1, xl→lg = 4 cards at 1024–1279px). Kicker: `<span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">` (clone: `<p>` + order + text-foreground). Icon chip: `<div class="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">` (clone: `<span>` + aria-hidden + order). Value: `<div class="text-3xl font-display font-bold tracking-tight">` (clone: `<p>` + text-foreground). Header row `flex items-center justify-between mb-3`, sub row `flex items-center gap-2 mt-1` (order). | live/kpi-cards.json |
| R16-F3 | High | **Trend chart height.** Live `h-[280px]` (280px); clone `h-72 w-full` (288px) — 8px visible delta. | live/main-dashboard.html |
| R16-F4 | High | **Activity rows.** Live: `div.divide-y` + `div` rows `flex items-start gap-4 px-5 py-4 hover:bg-muted/20 transition-colors` (clone: `ul`/`li` + order + `data-tick` attr). Icon chip: `<div class="h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-muted">` (clone: `<span>` + aria-hidden + order). Content `flex-1 min-w-0` (order). Head line: `div.flex items-center gap-2 mb-0.5` (clone: `p` + flex-wrap); name `span.text-sm font-medium truncate` (clone: + text-foreground); badge tail order `text-foreground text-[10px] px-1.5 py-0`. Meta line `div.flex items-center gap-3 text-xs text-muted-foreground` (clone: `p`); meta spans `flex items-center gap-1` (clone: + min-w-0); domain/path are RAW TEXT children (clone wraps in `span.truncate`). | live/activity-rows.json |
| R16-F5 | High | **Domains rows.** Live: `div.divide-y` + `div` rows `flex items-center justify-between px-5 py-4 hover:bg-muted/20 transition-colors` (clone: `ul`/`li` + order). Left group `flex items-center gap-4` (clone: + min-w-0). Icon chip `<div class="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">` (clone: span + aria-hidden + shrink-0). Name line `div.flex items-center gap-2` + `span.text-sm font-semibold` (clone: `p` + flex-wrap + truncate + text-foreground). Date `text-xs text-muted-foreground mt-0.5` (order). Right group `flex items-center gap-6` (clone: + shrink-0). Stats: `div.text-sm font-semibold` / `div.text-[10px] text-muted-foreground` (clone: `p` + text-foreground). **Mixed generations (verified): the Verified badge is the NEW-gen string — byte-identical to the clone's current pin (261 chars, gradient-primary + border-0 tail + circle-check-big); only the PENDING badge is legacy-gen** (248 chars: base `border` + `border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 text-[10px] px-1.5 py-0` + circle-alert `h-2.5 w-2.5 mr-0.5`). | live/domains-badges-full.json |
| R16-F6 | High | **Visitors page.** (a) Tab count badges: LEGACY-gen div `inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 text-[10px] px-1.5 py-0 ml-0.5` (clone: hand-rolled `<span ml-0.5 …>`). (b) Tab icons `h-3.5 w-3.5` (clone: h-4 w-4) and `lucide-building2` single-name (clone: `lucide-building2 lucide-building-2`). (c) Table checkbox: `rounded-sm border border-primary` in base order (clone: tail `rounded-sm border-primary` + aria-label). (d) B2B avatar: icon chip `<div class="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">` + building2 icon (clone: gradient initials circle for all rows); B2C avatar: `<div class="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0">MA</div>` (clone: span + order). (e) Name cell `div.flex items-center gap-3` (clone: span); email `span.text-sm font-medium truncate` (clone: + text-foreground). (f) Search wrapper `relative flex-1 max-w-sm` + icon `-translate-y-1/2 h-4 w-4 text-muted-foreground` + input `flex h-10 w-full …` (order). | live/visitors-table.json, visitors-avatars.json |
| R16-F7 | Med | **Pricing page.** Billing toggle is a Radix Switch: `peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:… ring-offset-background disabled:…` + thumb `span[data-state]` `pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0` + `value="on"` (clone: hand-rolled button + focus-brand + bg-card thumb). FAQ: `<h4 class="text-sm font-semibold mb-1">` + `<p class="text-xs text-muted-foreground leading-relaxed">` (clone: `<p>` + text-foreground + different classes). circle-help icon (clone: circle-question-mark). Usage bar `h-1.5 w-32 rounded-full bg-muted overflow-hidden` (order). Current-plan card `shadow-sm` last (order). | live/pricing-switch.json, pricing-probe.json |
| R16-F8 | Med | **Settings page.** Inputs render WITH `bg-background` — the clone's consumers pass `className="bg-[#F6F7F9]"` which twMerge-displaces the base token (drop the consumer class; the live computes the same #F6F7F9 visually). Save button = variant-free + `h-9 rounded-md px-3` tail: `…whitespace-nowrap text-sm ring-offset-background … gradient-primary text-primary-foreground shadow-lg glow-primary hover:opacity-90 transition-all duration-300 font-semibold h-9 rounded-md px-3` (clone: default variant `bg-primary hover:bg-primary/90 h-10 px-4 py-2` + different order). Danger card body `p-6 pt-0 space-y-4` (clone: `p-6 pt-0`); danger row `flex items-center justify-between` (clone: + flex-wrap + gap-3); destructive card `shadow-sm` last (order). | live/settings-buttons.json, settings-inputs.json |
| R16-F9 | Med | **Install page.** Domain select button `flex h-10 items-center justify-between …` (clone: missing h-10). Copy button = outline + sm + `absolute top-3 right-3` with rounded-md displaced to tail (clone: rounded-md in base). Code chip: `text-xs bg-muted px-1.5 py-0.5 rounded font-mono` (clone: `rounded bg-muted px-1 py-0.5 font-mono text-xs` — px-1.5 vs px-1!). Pre: `bg-foreground/5 border border-border rounded-lg p-4 text-sm font-mono overflow-x-auto leading-relaxed` (clone: different order + extra text-foreground). Platform icon chips = `<div class="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">` (clone: `<span>` + order). Notice box `bg-neon-green/5 border-neon-green/20` (clone: `/10 /30`). Install page heading `<div><h1 class="font-display text-2xl font-bold">` + subtitle `text-muted-foreground text-sm mt-1` (order). | live/main-dashboard_install.html |
| R16-F10 | Low | **Misc universal.** (a) `focus-brand` on sign-out button + View-all link — clone-authored, live has none. (b) lucide name drift: `lucide-circle-help` (clone: circle-question-mark), `lucide-circle-alert`, `lucide-building2`/`lucide-trash2` single vs double names. (c) Mail/users icons: live ships older lucide path precision (2-decimal, e.g. `m22 7-8.97 5.7a1.94 1.94…`; clone 0.525 ships 3-decimal). (d) The live's sidebar group-label ships a BROKEN class `transition-[margin,opa]` (verified at hex level); the clone ships the correct `transition-[margin,opacity]`. | shell-sidebar.html both sides; login-buttons.json (mail path) |

Non-findings (verified, no action): marketing landing/sub-pages/blog/legal,
robots.txt/sitemap.xml documents, favicon bytes, og image bytes, auth cards
(login/signup buttons byte-identical), shell (sidebar/topbar/provider),
Install/Settings page H1 pattern (h1-in-main, matches), plan-card roots
(R15 strings hold), activity CardTitle (R15 h3 holds), all 7 page H1 texts
+ KPI counts + card counts.

## Parity rulings (documented, following repo precedents)

- **D1 — the PENDING/content badges render the live's legacy generation
  verbatim.** The live ships MIXED generations: new-gen in the sidebar AND
  the domains Verified badge (byte-identical to the clone's current pin,
  261 chars); legacy-gen for Pending + visitors tab counts (base `border`,
  secondary WITH `text-secondary-foreground`). The Badge primitive (R15,
  new-gen) stays; the legacy consumers render the exact legacy string via a
  shared helper — same tag-rename precedent as R15's Badge div root.
- **D2 — the broken group-label class is replicated.** The live ships
  `transition-[margin,opa]` (a broken utility that matches nothing, so the
  label fade snaps). The clone replicates the string verbatim per the
  DOM-parity precedent (R15's `data-active="false"` quirk); the class is
  inert on both sides.
- **D3 — B2B visitors get the icon-chip avatar.** The live renders company
  visitors with a `bg-primary/10` rounded-lg chip + building2 icon;
  individuals keep the gradient initials circle. Functional parity of the
  visual identity split, div-rooted like the live.
- **D4 — lucide icon-class names follow the live's single-name form** where
  the version differs (`lucide-circle-help`, `lucide-building2`): the clone
  overrides the `className` on the lucide import (the SVG internals keep
  lucide 0.525's path precision — the D11 micro-divergence category, now
  covering the mail/users path deltas; internal SVG path bytes stay a
  documented divergence).
- **D5 — the settings/install buttons keep the Button primitive.** The
  live's odd strings are cva+twMerge mechanics (size `sm` displaces
  `rounded-md` to the tail; `font-semibold` displaces `font-medium`;
  `transition-all` displaces `transition-colors`) — one primitive, no
  regeneration. Consumers switch to `variant={null} size={null}` /
  `size="sm"` as the live does.
- **D6 — the billing switch becomes the Radix-style Switch primitive**
  rebuilt to the live's exact strings (root + thumb + data-state + value).
  The marketing pricing switch (R10 iOS-style, `w-14 h-7`) is a separate
  component and is NOT touched.
- **D7 — `focus-brand` is dropped from the app-bundle consumers** the live
  doesn't carry it on (sign-out button, View-all link). The utility itself
  stays for marketing consumers where the clone's a11y floor pins it.
- **D8 — raw-text meta in activity rows.** The live renders domain/path as
  bare text children of the flex spans (no truncate wrapper); the clone
  follows (the rows are single-line, `truncate` was defensive only).

## Workstreams

### A — Tabs (F1)
- **A1 (RED→GREEN):** `ui/tabs.tsx`: root drops `flex flex-col gap-2`
  (className pass-through only); trigger base re-ordered to the live's
  token order (data-[state=active] before focus-visible). TabsList base
  already matches.
- **A2 (RED→GREEN):** `visitors-table.tsx`: TabsList consumer → no classes;
  trigger consumer → `gap-1.5` only; tab icons → `h-3.5 w-3.5` with the
  live's single-name class strings.
- **A3 (RED→GREEN):** `platform-instructions.tsx`: root `w-full`; TabsList
  consumer → `w-full justify-start mb-4`; trigger consumer → `gap-1.5`.

### B — Overview (F2/F3)
- **B1 (RED→GREEN):** `dashboard/page.tsx` KPI grid → `grid grid-cols-1
  sm:grid-cols-2 lg:grid-cols-4 gap-4`; kicker → span + live order; icon
  chip → div + live order; value → div (no text-foreground); header/sub
  row orders.
- **B2 (RED→GREEN):** `trend-chart.tsx` container → `h-[280px]` (drop
  `w-full`).
- **B3 (RED→GREEN):** Top-pages rows: rank span + path span live orders
  (`text-sm font-medium truncate`), right block divs (no text-foreground),
  `text-right shrink-0 ml-3` order.
- **B4 (RED→GREEN):** Recent-ids: View-all link classes → live order (no
  focus-brand); table `w-full` (no text-sm); th → live order + no
  scope attrs; row internals per capture.

### C — Activity feed (F4)
- **C1 (RED→GREEN):** rows → div-based (`div.divide-y` > `div` rows, drop
  `data-tick`); icon chip → div + live order; content/head/meta lines →
  divs with live classes; name span `text-sm font-medium truncate`; badge
  tail order; meta spans lose min-w-0/truncate wrappers (raw text
  children).

### D — Domains (F5)
- **D1 (RED→GREEN):** rows → div-based; left/right groups; icon chip → div
  h-9; name line div + span `text-sm font-semibold`; date/stats → live
  classes (div, no text-foreground); badges → legacy-gen strings
  (Pending/Verified) + `lucide-circle-alert`/`circle-check-big` classes
  with icon `h-2.5 w-2.5 mr-0.5`.
- **D2:** delete-button + form chrome class orders per capture.

### E — Visitors (F6)
- **E1 (RED→GREEN):** tab counts → legacy-gen div badges
  (`contentBadgeClasses`); table checkbox base order; B2B avatar → icon
  chip; B2C avatar → div + live order; name cell → div + email span live
  classes; search wrapper/icon/input orders.

### F — Pricing (F7)
- **F1 (RED→GREEN):** `ui/switch.tsx` rebuilt to the live's Radix switch
  strings (role=switch, data-state, value=on, thumb translate variants);
  plan-panel consumer drops focus-brand path.
- **F2 (RED→GREEN):** FAQ → h4 + p live classes; circle-help icon rename;
  usage-bar/card orders.

### G — Settings (F8)
- **G1 (RED→GREEN):** Save button → variant-free + `h-9 rounded-md px-3`
  tail; inputs keep `bg-background` (drop the `bg-[#F6F7F9]` displacement
  where the live shows the base); danger card `space-y-4` + row classes +
  shadow order.

### H — Install (F9)
- **H1 (RED→GREEN):** domain-switcher button h-10; copy-button →
  outline+sm+absolute; code chip `text-xs bg-muted px-1.5 py-0.5 rounded
  font-mono`; pre live order (no text-foreground); platform chips → divs;
  notice `bg-neon-green/5 border-neon-green/20`.

### I — Universal sweeps (F10)
- **I1:** sign-out button drops `focus-brand`; lucide class-name fixes;
  group-label → `transition-[margin,opa]` (D2).
- **I2:** full-suite regression sweep + per-page browser diff vs the
  round16 captures.

### J — Verification
- `npm run verify` green; standalone rebuild + fresh server; browser pass:
  per-page DOM byte-diff against `research/round16-audit/live/` captures;
  E2E flow (login → all 7 pages → visitors table interactions → export);
  marketing spot-checks (landing sections, H2=7).

### K — Docs & ship
- PAD v1.15, README, AGENTS.md, CLAUDE.md, plan execution log, worklog,
  evidence README; atomic commits on main; wrapper push.

## Risks & notes

- **Volume risk:** the class-order and tag changes touch every dashboard
  component; the pins must be rewritten RED first (the old pins are the
  contract until replaced). The r16 evidence files are the source of truth
  for every string.
- The KPI grid xl→lg changes layout at 1024–1279px (4 columns at lg now —
  live-faithful).
- The chart 288→280px changes the recharts ResponsiveContainer height.
- The activity-row div-ification touches the polling/list semantics — the
  behavior contract (5s poll, pause-when-hidden, cursor paging) is pinned
  by existing tests that must stay green.
- The lucide single-name classes (`lucide-building2`) are just className
  strings — the icon still renders building2's paths (lucide 0.525
  exports both names; the live's older version used the single name).
- The B2B avatar change affects row rendering logic (needs the visitor's
  company/segment flag) — data already available on the row.

## Execution Log (completed 2026-09-18)

- **TDD** — `tests/content-parity.test.tsx` written RED first (42 failing /
  1 green — the domains Verified badge was already byte-identical). GREEN
  brought 44/44; the superseded R11 pins in `badge-consumers.test.tsx`
  (4) and `visitors-selection.test.tsx` (1) were updated to the live's
  current strings. Suite 432/50 → **476/51** (+44).
- **A (Tabs)** — `ui/tabs.tsx`: Root renders a bare div (no base class);
  the trigger base re-ordered to the live's token order
  (data-[state=active] before focus-visible). Consumers:
  visitors TabsList → no consumer classes (the primitive base IS the live
  string); install TabsList → `w-full justify-start mb-4` (twMerge
  displaces justify-center); triggers pass `gap-1.5` only; the Tabs root
  on install carries `w-full`.
- **B (Overview)** — KPI grid `grid grid-cols-1 sm:grid-cols-2
  lg:grid-cols-4 gap-4` (xl→lg = 4 cards at 1024–1279px); kicker → span +
  live order; icon chip → div + live order; value → div (no
  text-foreground); header/sub rows re-ordered; chart `h-[280px]` (was
  h-72 = 288px, 8px drift); legend wrapper order; top-pages rows live
  orders (no text-foreground); recent-ids: View-all link live order (no
  focus-brand), body `p-0`, table `w-full` (no text-sm), th live order
  (no scope), rows div-rooted.
- **C (Activity)** — rows rebuilt to the live's div generation
  (`div.divide-y` + div rows, no data-tick); icon chips div-rooted with
  the live class order; head/meta lines divs; name span `text-sm
  font-medium truncate`; Pageview badge → LegacyBadge (the live's
  current-build Pageview badge carries the legacy base `border` +
  text-foreground tail); meta spans lose min-w-0/truncate wrappers (raw
  text children per D8); timestamp span with the live order. The 15 s
  relative-time tick stays as a re-render trigger (no DOM marker).
- **D (Domains)** — rows div-based; the `<section aria-labelledby>`
  wrapper removed (the live ships bare cards); icon chip div h-9; name
  line div + span `text-sm font-semibold`; date/stats → live classes
  (divs, no text-foreground); **Pending → LegacyBadge (248-char legacy
  string + circle-alert); Verified stays the new-gen 261-char string
  (already byte-identical)**; Trash2Icon for the single-name lucide
  class; Plus icon class order.
- **E (Visitors)** — tab counts → LegacyBadge (158-char legacy string +
  ml-0.5); tab icons `h-3.5 w-3.5` with Building2Icon for the
  single-name class; the table wrapped in Card + CardContent `p-0` +
  overflow-x-auto (was a hand-rolled overflow-hidden div); table `w-full`
  (no text-sm); th cells live order (no scope); tr without clone-authored
  role/aria-label/tabIndex/focus classes; checkbox consumers drop the
  `rounded-sm border-primary` + aria-label (the primitive base renders
  the live string); B2B avatar → the live's icon-chip div; B2C avatar →
  div + live order; identity cell divs; type/source/status badges →
  LegacyBadge with the amber/neon/secondary tails; confidence bar
  div-rooted (no progressbar role); search wrapper/icon/input live
  orders (input consumer `pl-9` only — the base carries h-10); Select
  consumers `w-44`/`w-40` (no h-10 duplicate).
- **F (Pricing)** — `ui/switch.tsx` rebuilt to the live's Radix-style
  switch (role=switch + data-state + value=on + the peer class string +
  thumb translate variants; no focus-brand, no aria-label — the Monthly/
  Annual spans carry the context); both toggle labels always carry
  font-medium; FAQ → h4 + `text-xs` answer + CircleHelpIcon; usage bar
  (no progressbar role, live order) + percent span (no
  text-muted-foreground); card/grid orders.
- **G (Settings)** — inputs drop the `bg-[#F6F7F9]` consumer
  (bg-background survives — the live computes the same color); Save
  button variant-free + `h-9 rounded-md px-3` tail (twMerge: font-semibold
  displaces font-medium, transition-all displaces transition-colors);
  Profile body `p-6 pt-0 space-y-4` (the form itself is classless — it
  stays for the server action per D2); danger card body `p-6 pt-0` + row
  `flex items-center justify-between` + shadow order; container order.
- **H (Install)** — container `space-y-6 max-w-4xl`; heading subtitle +
  code chip (px-1.5) live orders; Quick Start chip div + live classes;
  Quick Start code px-1; pre live order (no text-foreground); CopyButton
  outline+sm+`absolute top-3 right-3`; domain switcher `w-[200px]` (base
  h-10); platform icon chips div-rooted; steps/features titles +
  subtitles live orders; features grid + cards; Site Key body `pt-6`,
  code live order; copy icon orders.
- **I (Sweeps)** — `focus-brand` dropped from the sign-out button and
  the View-all link (the live ships neither); the sidebar group-label
  ships the live's broken `transition-[margin,opa]` class verbatim (D2);
  `live-icons.tsx` (Building2Icon / Trash2Icon / CircleHelpIcon) renders
  the live's single-name lucide classes (R12 CompanyBuildingIcon
  precedent); `content-badges.tsx` (LegacyBadge + fragments) reproduces
  the legacy Badge generation.
- **G (gate + verification)** — `npm run verify` GREEN: lint, typecheck,
  **476 tests / 51 files** (+44), build 36 routes. Fresh-standalone
  browser pass: per-page structural diff against the round16 captures —
  visitors/domains/pricing at **zero order + zero token drift**;
  overview/activity/install/settings residuals are data-only (row
  counts, recharts internals, banner state) or the server-action form
  machinery (D2, functional). E2E green: login → 7 pages → visitors
  selection → Export (1) → CSV 200 → pricing switch toggles ($65
  annual) → install snippet + copy → settings form. Screenshot
  pixel-diff: the sidebar chrome region is **pixel-identical (0.00%)**;
  landing sections [762,403,174,526,708,610,650,814,756,500] + H2=7
  hold. Zero console errors.
- **Known micro-divergences (documented rulings)** — D4: lucide 0.525's
  internal SVG path precision (2- vs 3-decimal) + lucide's default
  `aria-hidden="true"` (the live's older lucide predates it); D2: the
  clone's server-action forms ship hidden `$ACTION_*` inputs + form
  elements the live's CSR doesn't need; the clone keeps functional
  aria-labels on the search input/selects (invisible in rendering, the
  live has none).

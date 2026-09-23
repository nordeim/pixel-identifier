# Round 28 — Trend Chart Axis-Geometry Parity

**Date:** 2026-09-23 · **Session:** `docs/session_30.md` (R28 log) · **Verdict: ONE drift family found (R28-F1) — the live's trend chart renders axis TICK LINES, a gray-500 AXIS LINE on both axes, and the recharts default margin; the clone ships an R8-era chart config that suppresses all of it and hacks the margin, shifting the plot 23 px and changing which date labels recharts thins**

## Scope

The R27 next-notes defined the R28 watch targets: (a) bundle hashes again — a
change triggers the full token-diff sweep; (b) the toast system in the standing
regression loop (r27 e2e); (c) the NTW no-badge branch if the live's data
changed; (d) e2e coverage candidates (the domains delete-confirm flow). Plus
the standing user emphasis: the mobile navigation menu (both surfaces), the
Tailwind CSS v4 bug watch, the DB seam (`.env` `DATABASE_URL="file:../db/custom.db"`
→ repo `db/`), the vitest + Playwright suites, and the repo-round discipline
(gates, screenshots, docs, push to main).

## Probe protocol (13th probe generation — live verified 2026-09-23)

Probe account `sepnetflix2023@outlook.com`; agent-browser (dual sessions —
live + clone); 1280×900 desktop + 375×812 mobile viewports; settled-DOM
captures; SVG-local getBBox measurements (viewport-coordinate artifacts
eliminated). NEW probe surface this round: **the trend chart's SVG internals**
(axis/tick/grid chrome, plot geometry, label thinning, tooltip chrome) — a
runtime-only surface no prior round diffed (the R16 pin covered only the
wrapper's `h-[280px]`; the R18/R19 geometry probes measured DOM/CSS boxes,
never the chart's internal SVG).

### 1. Bundle hashes — NO REDEPLOY

| Bundle | R27 baseline | R28 live | Verdict |
|---|---|---|---|
| Marketing JS | `assets/index-C3AAh5Je.js` | `index-C3AAh5Je.js` | unchanged |
| Marketing CSS | `assets/index-bLMWzsGr.css` | `index-bLMWzsGr.css` | unchanged |
| App JS | `assets/index-nhmKaUsm.js` | `index-nhmKaUsm.js` | unchanged |

### 2. Standing targets re-verified (all CLEAN)

- **Mobile navigation (standing user emphasis), both surfaces, both sites:**
  - Marketing dropdown @375 px: toggle `md:hidden text-foreground` +
    `lucide-menu w-6 h-6`; container `md:hidden bg-background border-b
    border-border px-6 py-4 flex flex-col gap-4`; 4 plain links + the
    full-width Start Identifying CTA; close-on-link-click (menu unmounts,
    icon resets, page scrolls — live 7424 px / clone 7404 px, the
    documented 20 px D5 delta). Parity on both sites.
  - Dashboard mobile Sheet @375 px: `--sidebar-width: 18rem` inline, 7 nav
    links, closes on cross-page nav on BOTH sides (live → /dashboard/visitors,
    clone → /dashboard/activity; dialog unmounts). Parity.
- **Toast system (standing loop since r27):** the live fires `Settings saved`
  on settings save (bottom/right/light, the full `<li data-sonner-toast>`
  class family + Heroicons check-circle path byte-identical to the R27
  capture); the clone's toast DOM diffed against the live capture —
  **byte-identical** (class family, data attrs, style vars, icon path).
- **Pricing POPULAR badge (standing loop since r26):** re-captured on the
  live — byte-identical to the clone's R26 fix.
- **NTW badge:** live data still `0 this week / 2 last week` → the negative
  branch (`-100.0%`) continues to render; the clone's seeded state exercises
  the positive branch — both branches remain runtime-verified.
- **Topbar/visitors:** `2 individuals · 1 companies identified` + 3 rows on
  BOTH sides (the clone's demo data re-seeded — the R27 screenshot cycle had
  cascade-wiped the visitors via the domain delete/re-add; seed is idempotent).
- **Install copy button:** swaps to plain `Copied!`, NO toast (R22 pin holds).
- **TW4 watch:** no bare-var brackets; the 681-green arrival run re-proves
  the R18 space-y seams; e2e exercises the `md:hidden` emission.
- **Console sweep:** 20 clone routes (marketing, sub-pages, auth, 404,
  7 dashboard pages) — ZERO console / page errors.
- **Plan-change flow (NEW mutation surface):** the live's Get Started opens a
  **Stripe embedded-checkout modal** (real billing — `cs_live_…` checkout
  session, 299.00 SEK, Stripe live keys; modal dismissed, account left
  clean, no plan change). The clone's simulated instant plan-switch
  (`changePlanAction`) stays the documented D-class divergence (PAD §11 —
  billing is simulated; replicating a payment UI without a processor would
  fake production capability). No toast on either side's plan flow.

### 3. The finding — R28-F1: the trend chart's axis chrome + geometry

Driving the NEW probe surface (SVG internals) found a real drift family the
DOM-string pins cannot see (recharts renders at runtime, inside the
`h-[280px]` wrapper). Live-verified at 1280×900 (SVG 595×280):

| Element | Live (captured) | Clone (pre-fix) | Drift |
|---|---|---|---|
| X tick lines | 12 × `<line class="recharts-cartesian-axis-tick-line" y1=251 y2=245>` (6 px below the axis), stroke `hsl(220, 9%, 46%)` | none (`tickLine={false}`) | **missing** |
| Y tick lines | 5 × `<line x1=59 x2=65>` (6 px left of the axis), stroke `hsl(220, 9%, 46%)` | none (`tickLine={false}`) | **missing** |
| X axis line | `<line x1=65 y1=245 x2=590 y2=245>` stroke `hsl(220, 9%, 46%)` | stroke `#E5E7EB` | **wrong color** |
| Y axis line | `<line x1=65 y1=5 x2=65 y2=245>` stroke `hsl(220, 9%, 46%)` | not rendered (`axisLine={false}`) | **missing** |
| Chart margin | recharts-style `{top:5, right:5, bottom:5, left:5}` — plot x 65→590, y 5→245 | R8-era hack `{top:8, right:8, left:-18, bottom:0}` — plot x 42→587, y 5→250 | **23 px origin shift** |
| X label thinning | 12 of 14 date labels (hides Sep 20 + Sep 22; last label clamped to x=576.59) | 13 of 14 (hides only Sep 22) | **follows from the margin** |
| Tick text fill | `hsl(220, 9%, 46%)` (inherits the axis `stroke` — no tick fill set) | `#6B7280` (explicit `tick.fill`) | **attr bytes differ** (same color) |
| Area curve + gradient colors | comma-form HSL: `hsl(262, 83%, 58%)` / `hsl(172, 66%, 50%)` | space-form: `hsl(262 83% 58%)` | **attr bytes differ** |
| Grid stroke | `hsl(220, 13%, 91%)` literal | `#E5E7EB` (same color, different bytes) | **attr bytes differ** |
| Tooltip chrome | `border-radius: 8px`, NO box-shadow, border `#E5E7EB`, font-size 12 px, padding 10 px, white bg | `border-radius: 0.75rem` (12 px) + `box-shadow: 0 8px 24px rgba(0,0,0,0.08)` | **radius + phantom shadow** |

Color math: `hsl(220, 9%, 46%)` = `#6B7280` (gray-500 — the live's
Tailwind v3 HSL literal); `hsl(220, 13%, 91%)` = `#E5E7EB` (the R11 cool
border — the clone's grid COLOR was already right, only the attr bytes
differed). The live's recharts default margin is NOT recharts' built-in
default (`{0,0,0,0}` in 2.x) — the live passes the explicit
`{top:5,right:5,bottom:5,left:5}` (plot geometry measured: gutter 5 px on
every side + default YAxis width 60 → plot origin x=65).

### 4. Non-findings / documented evidence

- The grid's `strokeDasharray="3 3"` + `vertical` + horizontal lines: parity.
- The area fill gradients (`fillVisitors` 0.15→0, `fillIdentified` 0.2→0),
  `strokeWidth=2`, `dot={false}`, `activeDot r=4`: structurally at parity
  (only the HSL string form differs).
- The legend below the chart (R8-F2 pins): untouched.
- The chart's `h-[280px]` wrapper + `role="img"` + aria-label (R16/D3
  rulings): untouched.
- The empty tooltip label on hover: parity on both sides (data/probe
  artifact; the entries formatter stays R8-pinned).

## The fix (TDD)

**RED first** — `tests/chart-r28-parity.test.tsx` (source pins): the
explicit `{ top: 5, right: 5, bottom: 5, left: 5 }` margin, NO
`tickLine={false}`, NO `axisLine={false}`, NO `axisLine={{ stroke: '#E5E7EB' }}`,
the axis-level `stroke="hsl(220, 9%, 46%)"` on BOTH axes, the tick prop
WITHOUT a fill (`tick={{ fontSize: 11 }}`), the grid literal
`stroke="hsl(220, 13%, 91%)"`, the comma-form HSL in the gradients + area
strokes, the tooltip `borderRadius: '8px'` + NO boxShadow. Plus the NEW
`e2e/chart.spec.ts` (runtime pins): tick lines rendered on both axes with
the live's stroke, the Y-axis axis-line present, the plot origin ≈ 65 px,
the tick-text fill attr, the tooltip's 8 px radius + absent shadow, and the
grid stroke attr.

**GREEN** — `src/components/dashboard/trend-chart.tsx`: swap the margin to
the live's explicit 5/5/5/5, drop `tickLine={false}` from both axes, drop
the XAxis `axisLine={{…}}` and the YAxis `axisLine={false}` in favor of the
axis-level `stroke="hsl(220, 9%, 46%)"`, drop the tick fill (inherit like
the live), switch the grid stroke to the live's literal HSL, switch the
gradient/area colors to comma-form HSL, fix the tooltip to 8 px + no
shadow. The wrapper (`h-[280px]`, role/aria), the legend, the gradients'
geometry, and the formatter stay untouched.

**Runtime byte-verify** — the dev server's chart diffed against the live
capture: tick-line count/stroke/geometry, axis-line attrs, plot origin,
label count + positions, tick-text fill, tooltip computed style.

## Execution log

- [x] Probe phase complete (see above) — 13th generation
- [x] RED: `tests/chart-r28-parity.test.tsx` — 11 source pins, all failing
- [x] RED: `e2e/chart.spec.ts` — 3 runtime specs, failing pre-fix
- [x] GREEN: trend-chart.tsx rewritten to the live's config (see fix)
- [x] Runtime byte-verify: tick lines 12/5 rendered at the captured
      geometry (6 px, stroke `hsl(220, 9%, 46%)`); axis lines both present;
      plot origin x=65; **12 of 14 date labels — Sep 20 hidden, Sep 22
      hidden, last label clamped to x=576.59 — byte-identical to the live**;
      tick-text fill attr `hsl(220, 9%, 46%)`; tooltip 8 px + no shadow;
      grid stroke attr `hsl(220, 13%, 91%)`
- [x] Full vitest: **693 passed | 2 skipped (69 files)** — +12 pins
- [x] Full e2e: **21/21 chromium** — +3 specs (chart.spec.ts)
- [x] Gates: lint 0 · typecheck 0 · build ✓ standalone ✓
- [x] Screenshots: `docs/screenshots/r28-*` (4 VLM-verified)
- [x] Docs: README R28 bullet, AGENTS R28 fact, CLAUDE 11–28 mirror,
      PAD v1.27, SKILL.md R28 rows, session_30.md, worklog, this log
- [x] `.env.example` re-verified: 3 keys, consistent (no env surface added)

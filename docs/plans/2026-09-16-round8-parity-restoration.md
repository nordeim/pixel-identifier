# Round 8 — Parity Restoration & Alignment Remediation Plan

**Date:** 2026-09-16
**Scope:** Fresh live audit (app.pixelco.io logged in + logged-out auth pages +
pixelco.io marketing) and a full docs-vs-codebase alignment validation of the
Round-7 state. The repository's git history was re-created via GitHub web
uploads ("Add files via upload"), and **part of the Round-7 work did not
survive that re-creation**: some claimed commits (`4fcf954`, `7df4d10`, the
traced-logo commit) have code that is absent from the current tree, and the
binary assets under `public/` are gone entirely.
**Baseline:** `npm run verify` green at `8317cb2` (lint, typecheck, 187 tests
/ 25 files, build 35 routes) — matches PAD v1.6's claimed numbers.
**Evidence:** `research/round8-audit/` (live logo PNG 550×550, live DOM
extracts, gradient pixel analysis).

## Method

1. Read AGENTS.md / CLAUDE.md / README.md / PAD v1.6, session_4, session_5,
   worklog and the Round-7 plan in full; reviewed the scandihaven reference
   repo's engineering protocols (6-phase workflow, Iron-Law verification,
   TDD-at-seams) and skills catalogs.
2. Validated every Round-7 claim in the PAD/plan against the actual codebase
   (grep + file reads). Result: 17 claims aligned, 9 misalignments found
   (below) — all reproducible at file level.
3. Fresh live audit of the drift areas with a logged-in session
   (sepnetflix2023@outlook.com): trend-chart legend DOM, SVG gradient stop
   opacities, auth-page input metrics (getBoundingClientRect), auth form
   field-group spacing, logo PNG fetch + pixel-level gradient analysis.
4. Every finding below is **Verified** (executed against the live site or
   read directly from the current tree) unless labelled otherwise.

## Findings (severity-ordered)

| ID | Severity | Finding | Evidence |
|----|----------|---------|----------|
| R8-F1 | Medium | **Round-7 logo trace never landed.** `pixelco-logo.tsx` still renders the bar+circles construction (bridge `<line>` + 4 `<circle>`s) with a **vertical** gradient — exactly what PAD v1.6 / round-7 R7-V16 claim was replaced by the traced organic 54-anchor Catmull-Rom path with a 135° gradient. Live logo re-captured this round: 550×550 PNG, content bbox 496×360 (wide 4-lobe molecule); pixel analysis: **bottom-left #FFD119 → top-right #FFB800** (135°), confirming the round-7 gradient spec | `src/components/pixelco-logo.tsx:18–37`; `research/round8-audit/live-logo.png`; `scripts/analyze_logo.py` output (bottom-left rgb(255,209,25), top-right rgb(255,184,0)) |
| R8-F2 | Medium | **Trend-chart legend missing (R7-V1 lost).** Live renders a hand-built centered legend inside the chart card's `p-6 pt-0` content: `<div class="flex items-center gap-6 mt-2 justify-center">` with two items `flex items-center gap-1.5 text-xs text-muted-foreground` — `h-2 w-2 rounded-full bg-primary` + "Pageviews" and `bg-neon-green` + "Identified". The clone's `trend-chart.tsx` docstring still says "no legend" and renders none | live DOM extraction (this session, exact classes captured); `src/components/dashboard/trend-chart.tsx` |
| R8-F3 | Medium | **Pageviews area fill missing (R7-V2 lost).** Live: pageviews area filled with `url(#fillVisitors)` — hsl(262, 83%, 58%) stops **0.15→0**; identified `url(#fillIdentified)` — hsl(172, 66%, 50%) stops **0.2→0**. Clone: pageviews `fill="none"`; identified fill opacity 0.12 | live SVG defs extraction (stop opacities read from the rendered DOM); `trend-chart.tsx:26,61` |
| R8-F4 | Medium | **`public/` directory absent — hero avatars and benefits screenshot 404.** `hero.tsx:68` references `/assets/avatars/avatar-{1..5}.jpg` (R7-V5 trust row) and `features.tsx:90` references `/assets/dashboard-visitors.png` (R7-V10 benefits preview). Both load 404 in production; the trust row shows 5 broken-image icons and the benefits preview is an empty frame | repo tree (`git ls-files public/` empty); `src/components/marketing/hero.tsx:68`, `features.tsx:90` |
| R8-F5 | Medium | **Input primitive still h-9 — the claimed "live input heights" fix never landed.** Live inputs measure **40px** (`flex h-10 w-full … px-3 py-2`) on login, signup; the clone's `Input` primitive ships `h-9` (36px), so every form input (auth, domains, settings) renders 36px | live `getBoundingClientRect()` (this session: h=40 ×3 inputs on signup, ×2 on login); `src/components/ui/input.tsx:11` |
| R8-F6 | Low | **Auth field groups space-y-1.5 vs live space-y-2.** Live login/signup field groups use `space-y-2` (extracted from `form > div` classes); clone uses `space-y-1.5` (login-form.tsx:60,74; signup-form.tsx field groups) | live DOM (this session); clone form files |
| R8-F7 | Low | **"Forgot password?" link weight.** Live: `text-xs text-primary hover:underline` (no `font-medium`); clone adds `font-medium` | live DOM; `login-form.tsx:81` |
| R8-F8 | Low | **Round-7 evidence directory missing.** PAD v1.6 and the round-7 plan cite `research/round7-audit/`; only round5/round6 exist. The history re-creation dropped the binary/JSON evidence. (Round 8 re-establishes evidence discipline: `research/round8-audit/` created this round with the live logo PNG + audit extracts.) | repo tree; PAD v1.6 revision block |
| R8-F9 | Low | **worklog.md has no Round-7 execution record** — it stops at Task 2 (plan written). Session_5 log shows execution reached "final gate + secret scan" but the repo re-creation landed only partially. Worklog will be extended this round | `docs/worklog.md` |

**Verified as matching this round (no action):** R7-F1 activity semantics
(code + test), R7-V3 `--primary` #FFC105/#FFBF00 split, R7-V4 Dancing Script
wordmark subtext, R7-V6 trust pills, R7-V7 testimonials, R7-V8 process steps,
R7-V9 six-item benefits, R7-V11 "Real-Time", R7-V12 pricing CTA variants,
R7-V13 marketing enterprise banner absent, R7-V14 FAQ cards, R7-V15 bottom
CTA card, R7-V17 checkbox border-primary, R7-P1 HSTS, OAuth #F6F7F9 tint,
my-6 divider, glow-primary, gradient-text H2 highlights, hero trust-row
order, audience icons, 10-name logo marquee, footer socials; signup labels
(Work Email / Password / Confirm Password); login footer link structure
(`mt-4 text-center`, `text-primary font-medium hover:underline` — matches
live); skills/ excluded from lint/tests/typecheck.

**Honest divergences kept (documented, not gaps):** OAuth buttons disabled,
`/forgot-password` honest reset page (live 404s), pricing FAQ accuracy
answer, visitor detail sheet (value-add), self-hosted snippet URL/keys.

## Remediation ToDo (TDD where a seam exists)

- [x] **A1 (R8-F2) Trend-chart legend** — hand-built flex legend below the
  chart, live classes verbatim (`gap-6 mt-2 justify-center`; `h-2 w-2
  rounded-full bg-primary` / `bg-neon-green`; `text-xs text-muted-foreground`).
- [x] **A2 (R8-F3) Area fills** — pageviews: `hsl(262 83% 58%)` gradient
  0.15→0 (new `#fillVisitors`); identified: 0.2→0 (was 0.12). Update the
  stale "no legend / no fill" docstring.
- [x] **B1 (R8-F1) Logo trace** — contour-trace
  `research/round8-audit/live-logo.png` (pure-Python marching squares →
  RDP simplification → Catmull-Rom smoothing, matching the round-7
  OpenCV-derived method) → replace the bar+circles SVG in
  `pixelco-logo.tsx` with a single path; gradient x1/y1 → x2/y2 at 135°
  (#FFD119 bottom-left → #FFB800 top-right). Renders everywhere the mark
  is used (sidebar, topbar?, auth h-16, marketing header/footer).
- [x] **C1 (R8-F4) RED test first** — `tests/marketing-assets.test.ts`:
  every `src="/assets/…"` / `src={`/assets/…`}` reference in
  `src/components/**` must resolve to an existing non-empty file under
  `public/` (guards exactly the failure mode that happened: assets lost →
  production 404). Expect RED (public/ missing).
- [x] **C2 (R8-F4) GREEN — avatars** — 5 original 96×96 JPEG photo avatars
  generated for `public/assets/avatars/avatar-{1..5}.jpg` (the clone must
  not hot-link or copy the live product's photos).
- [x] **C3 (R8-F4) GREEN — benefits screenshot** — boot the app, log in as
  the seeded demo user, capture the clone's own visitors page (the live
  ships its dashboard screenshot from its own product) to
  `public/assets/dashboard-visitors.png`.
- [x] **D1 (R8-F5) Input primitive h-9 → h-10** at the source
  (`input.tsx`), matching the live's 40px; re-check explicit heights in
  forms for conflicts (domains-panel already h-10).
- [x] **D2 (R8-F6) Auth field groups space-y-1.5 → space-y-2** in
  login-form / signup-form (live-verified metric).
- [x] **D3 (R8-F7) Forgot-password link** — drop `font-medium` to match the
  live's `text-xs text-primary hover:underline`.
- [x] **E1 Workstream V — verification** — `npm run verify` (lint →
  typecheck → test → build); browser pass on /, /login, /signup,
  /dashboard (legend dots + fills, logo silhouette, avatar row, input
  heights 40px); asset 200-check via curl on `/assets/avatars/avatar-1.jpg`
  and `/assets/dashboard-visitors.png`; update C1's test to assert the
  referenced files exist (GREEN).
- [x] **E2 Documentation** — worklog Round-8 entry; PAD v1.7 revision block
  (restoration pass: what was lost, what was restored, live re-measurements);
  round-8 plan execution log below; README test-count delta if the suite
  grows.
- [x] **E3 Ship** — Conventional Commits per task, main only, push via
  `docs/ssh_git_wrapper_v3.py` (paramiko `ssh` shim for this sandbox — no
  ssh-keygen/ssh binaries; same approach as sessions 2/4/5), key shredded
  after push.

## Execution order

C1 (RED) → A1/A2 → B1 → C2/C3 (GREEN) → D1–D3 → E1 (gate + browser) → E2
(docs) → E3 (push). A-workstream commits land after the C1 RED test proves
the asset gap; assets land with their guard test green.

## Execution log (2026-09-16)

All workstreams landed as individual Conventional Commits on `main`:

| Task | Commit | Subject |
|------|--------|---------|
| A1+A2 | `cea4027` | fix(dashboard): restore live trend legend and both area gradient fills (R8-F2, R8-F3) |
| B1 | `e1f3a97` | feat(brand): trace the live's organic four-lobe logo mark (R8-F1) |
| C1–C3 | `6b36ec1` | test(assets): guard /assets references; restore avatar photos + visitors screenshot (R8-F4) |
| D1–D3 | `d9d7cbe` | fix(auth,ui): live input heights, auth field-group spacing and forgot-link weight (R8-F5/F6/F7) |
| E2 | (docs) | docs: PAD v1.7 restoration block, README test-count, round-8 plan + worklog records |

Verification evidence:
- `npm run verify` GREEN: lint clean, typecheck clean, **190 tests across
  26 files** (26 passed / 1 skipped file; 190 passed / 2 skipped tests —
  +1 file and +3 tests from the new asset guard), build green (35 routes).
- Browser pass on /, /login, /signup, /dashboard with zero console errors:
  legend dots measured at rgb(255,193,5) / rgb(43,212,189); both gradient
  fills carry the live stop opacities (0.15→0 purple, 0.2→0 teal); inputs
  measure 40px; auth field groups `space-y-2`; forgot link without
  `font-medium`; 5 avatars at naturalWidth 96; benefits screenshot at
  1322×867; the traced four-lobe mark renders in the marketing header,
  dashboard sidebar and auth cards.
- Asset URLs curl-verified 200: `/assets/avatars/avatar-1.jpg`,
  `/assets/dashboard-visitors.png`.
- Logo trace: marching-squares contour of the live PNG → RDP (59 anchors)
  → Catmull-Rom; VLM pixel-compare vs the live mark: MATCH at display
  size; gradient re-measured #FFD119 (bottom-left) → #FFB800 (top-right).

E3 push: `docs/ssh_git_wrapper_v3.py` (paramiko `ssh` shim — the sandbox
ships no ssh-keygen/ssh binaries; same mechanics as sessions 2/4/5), all
commits on `main`, key shredded after push.

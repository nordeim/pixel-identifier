# Round 36 — 21st-Generation Drift Watch + Export-Download/Pricing-Table/Spinner-Pin E2E Coverage

**Date:** 2026-09-27 · **Session:** `docs/session_45.md` (R36 log) · **Status: see Execution log.**

## Context

R35 shipped clean (`47c36c8`, session log `44f5a6e`): the 20th-generation
drift watch, 5 new e2e pins (tooltip contract, AlertDialog delete flow +
free-plan cap, search debounce, activity pagination), and the pipeline
beacon-visitor cleanup flake fix (44/44 e2e × 3 consecutive runs). The R35
watch list queued in `docs/session_43.md`:

1. bundle hashes (a change triggers the full token-diff sweep),
2. the five new pins + the R35 surfaces join the standing regression loop,
3. remaining candidate surfaces — the export CSV download at runtime from
   the topbar (the R21 byte format e2e-pinned only via the button's
   presence — a download-content spec could pin the bytes), the domains
   page's verified-untoggle flow (if any), the pricing toggle's
   annual/monthly runtime states on the dashboard (partially covered by
   the R26 spec), and the activity footer's mid-swap spinner state (a
   sub-second window).

## Verified arrival state (this session, evidence-based)

`git pull` → `44f5a6e` (main, clean, synced with origin — the only delta
was this round's `docs/session_44.md`). Environment per the documented
contract: `.env` with `DATABASE_URL="file:../db/custom.db"` (NEXTAUTH_SECRET
intact), `db/` pushed + seeded at the repo root (custom.db + e2e.db + the
vitest test.db trio), node_modules installed. The stale-shell
`DATABASE_URL` quirk re-confirmed (the session shell exports an absolute
parent-dir URL — per-command `env -u DATABASE_URL` overrides applied
throughout, incl. `build:standalone`). **Arrival gates all green:** lint 0 ·
tsc 0 · vitest **742 passed | 2 skipped (75 files, 744 total)** ·
`build:standalone` green (static-asset copy verified) · **e2e 44/44
(run 1 at arrival; run 2 executed during the probe phase — both the R35
ship state, confirmed twice).**

## 21st probe generation (dual live+clone sessions)

**No redeploy — all three tracked bundle hashes unchanged (11th consecutive
stable generation):** marketing `index-C3AAh5Je.js` + `bLMWzsGr.css`, app
`index-nhmKaUsm.js`. Logged into the live app with the operator-supplied
credentials (dashboard renders "Overview" — KPIs 4 visitors / 3 identified /
0 this week / 2 domains — matching the R35 capture and the reference image).

**Mobile navs (the standing user emphasis): FULL PARITY both surfaces, both
sites, both breakpoints (375 + 768) — zero Tailwind v4 anomalies.** Marketing
dropdown @375: toggle `md:hidden text-foreground` + `lucide-menu w-6 h-6`,
container `md:hidden bg-background border-b border-border px-6 py-4 flex
flex-col gap-4`, 4 plain links + ONE full-width gradient CTA (button class
byte-identical both sides), NO Log In; close-on-VISIBLE-link click + icon
reset (live scroll 5307 / clone 5287 — the documented 20 px D5 delta). The
clone's inner `<nav class="flex flex-col gap-4" aria-label="Mobile
navigation">` wrapper re-checked — the ruled R21-F7 D5 a11y chrome (the
live puts the anchors directly in the container div; not re-flagged).
Dashboard Sheet @375: inline `--sidebar-width: 18rem; pointer-events:
auto;` → 288 px + 7 links, closes on cross-page nav — both sides (probe
note: the clone keeps its desktop rail CSS-hidden in the DOM below md while
the live's CSR unmounts it — the documented R15 approach, visually
identical; the Sheet's own portal sidebar is the visible probe target). At
768 px both surfaces transition byte-identically both sites (rail
`display: flex`, marketing toggle hidden, desktop links visible in the
byte-identical `hidden md:flex items-center gap-7` container — the live's
is a DIV inside its `<nav>`-root header, the clone's a `<nav>` inside
`<header>`, the ruled R21 D5 swap).

**Standing surfaces — ALL CLEAN:** the R30 wrapper (byte-identical class +
inline vars on both dashboards), chart r28 chrome (18 tick lines + 18 tick
texts + 2 axis lines in `hsl(220, 9%, 46%)` both sites), the r26 POPULAR
badge (byte-identical tail both sites), the r30 settings inputs (bare both
sites), the r27 sonner toast (`Settings saved` driven on BOTH sites this
round), and the console sweep (19 clone routes HTTP 200/307/404 as
designed + browser console clean on landing + dashboard).

## R35-queued candidates — all closed (zero code drift)

1. **Export CSV download at runtime — LIVE BYTE CAPTURE (first ever) +
   full clone parity.** A `URL.createObjectURL` override on the live's
   visitors page captured the actual download payload: 384 bytes, NO BOM,
   LF-only, NO trailing newline, header
   `Type,Name,Detail,Confidence,Source,Location,First Seen,Last
   Seen,Status`, company rows `Alibaba (US) Technology Co., Ltd.,,—,IP
   Lookup,Hong Kong, Hong Kong, HK,Sep 15, 2026,11d ago,inactive`
   (unquoted commas everywhere — the R21 no-quoting pin), individuals
   `marcus.smith@acmecorp.com,clone-research-test.com,85%,direct,—,…`
   (row order follows each site's own table order — page-scoped both
   sides). The clone's `/api/export` fetch (authenticated) produced the
   same byte family on its seeded data. Every R21 pin is now
   RUNTIME-verified on the live itself. **The gap: NO e2e spec clicks the
   button and asserts the download** (unit tests cover `/api/export`
   directly; the topbar `window.location.assign` flow + the
   `Export (N)` ids-scoped state are browser-only) — the G1 gap below.
2. **Domains verified-untoggle — NON-FINDING (no such flow exists).** The
   live's Verified badge is a static `<div>` (the R16 new-gen string,
   `lucide-circle-check-big h-2.5 w-2.5 mr-0.5`) — not clickable, no
   handler, no dialog; byte-identical on both sides. Documented so future
   rounds don't re-investigate.
3. **Pricing toggle runtime states — FULL PARITY (both states, all four
   cards).** Live monthly (unchecked): Free $0 / Starter $79 / Growth
   $249 / Scale $799; annual (checked): $0 / $65 / $199 / $639; the
   toggle's track/thumb classes and the price block
   (`flex items-baseline gap-1 mt-2` + `font-display text-3xl xl:text-4xl
   font-bold` + `/mo`) are byte-identical both sites. The dashboard cards
   carry NO "billed monthly/annually" sub-line (that is the marketing
   pricing's R20 feature — quota text instead). The R26 spec pins only
   the badge + the Growth $249→$199 swap — the full four-card table in
   both states is unpinned (the G2 gap below).
4. **Activity mid-swap spinner — RUNTIME-VERIFIED on the clone (latent on
   the live, 6 events).** With the R35 60-event fixture re-inserted, a
   requestAnimationFrame sampler caught the window: 2 of 120 frames
   (~33 ms) render the `py-24` spinner + `Loader2 h-5 w-5 animate-spin`
   while the page-2 fetch is in flight — the R22 bundle reading
   confirmed at runtime. **The gap: the spinner markup is pinned NOWHERE**
   (the R22 test's docstring mentions it; no assertion covers
   `py-24`/`Loader2`/`animate-spin`) — the G3 gap below.

## Remediation plan (TDD)

The 21st generation found ZERO code drift — the round's deliverable is
COVERAGE (the R26/R31/R32/R34/R35 lesson: never-diffed ≠ absent). Three
pin specs close the gaps the round's candidates exposed. Each pin asserts
the live-verified behavior (or the clone's documented D-class flow) — a
behavioral regression turns the suite RED.

| # | Change | Files | Gate |
|---|---|---|---|
| G1 | **PIN the runtime export download**: click `Export All` on `/dashboard/visitors` → capture the Playwright download event → assert the suggested filename (`pixelco-visitors-YYYY-MM-DD.csv`), the 9-column header, LF-only, no BOM, no trailing newline, and the seeded row shape (jane.doe 90% direct, Acme Corp company row); then select a row checkbox → the button flips to `Export (1)` → the download carries ONLY that visitor's row (the ids-scoped state) | `e2e/export-download.spec.ts` (new, 1 spec) | e2e green |
| G2 | **PIN the full four-card price table in both toggle states**: monthly $0/$79/$249/$799 → click the switch → annual $0/$65/$199/$639 (per `plans.ts`), plus the `data-state` unchecked→checked flip — extending the existing badge/pair spec | `e2e/pricing.spec.ts` (+1 spec) | e2e green |
| G3 | **PIN the mid-swap spinner source**: `activity-feed.tsx` renders, while `isLoading`, the `flex items-center justify-center py-24` container with `Loader2` at `h-5 w-5 animate-spin text-muted-foreground` REPLACING the list — 3 source pins closing the docstring-only gap (the 33 ms window is too flaky to e2e-pin; the source pin + the R35 runtime capture are the contract) | `tests/activity-r22-parity.test.tsx` (+3 assertions) | vitest green |
| F4 | Full gates: lint 0 · tsc 0 · vitest 745+ (742 + 3 new) · `env -u DATABASE_URL npm run build:standalone` green · **e2e 46/46 chromium, run TWICE consecutively** (44 + 2 new) | — | verify + e2e |
| F5 | 5 captures `docs/screenshots/r36-*` off the dev server (the export button + the downloaded CSV content rendered, the pricing monthly + annual states, the activity spinner mid-swap via the fixture, one standing surface) | `docs/screenshots/` | verified |
| F6 | `.env.example` re-verified against `.env` + `db-path.ts` + `with-db-url.mjs` (3 keys) | `.env.example` | verified |
| F7 | Docs sync: README (R36 bullet + e2e totals 46), AGENTS (R36 facts: the live runtime CSV capture, the verified-untoggle non-finding, the spinner pin), CLAUDE (rounds mirror R36), PAD (revision block v1.34 + §8.1), SKILL.md (counts + Appendix rows), the plan's execution log, `docs/session_45.md`, `docs/worklog.md` + the root `worklog.md` mirror | see Files | docs sync |

## Non-findings (documented so future rounds don't re-investigate)

- **The domains Verified badge** — static, non-interactive on both sides
  (byte-identical classes); there is NO verified-untoggle flow to mirror.
- **The dashboard pricing cards' sub-lines** — they ship quota text, NOT
  the marketing bundle's "billed monthly/annually" sub-line (the R20 pin is
  marketing-scoped only; re-confirmed on the live this round).
- **The CSV row ORDER** — follows each site's own visitors-table display
  order (page-scoped); the live and the clone order differently only
  because their data differs. No order pin beyond the page-scoping one.
- **The export's `Export (N)` label logic** — already unit-pinned
  (`tests/visitors-selection.test.tsx`, `tests/dashboard-r24-parity.test.tsx`);
  the e2e gap was the DOWNLOAD, closed by G1.
- **The `<nav>`-root live header / inner-nav-wrapper dropdown chrome** —
  the ruled R21 D5 a11y swap (not re-flagged).
- **The live's 6 px h-overflow at 375** — unchanged from the R34 ruling (a
  live quirk, not replicated).

## Execution log

**Phase A — detection (21st generation, dual live+clone).**
- Arrival gates green (742 vitest | 2 skipped, lint 0, tsc 0,
  build:standalone green, e2e 44/44 — twice); no redeploy (11th
  consecutive stable); mobile navs FULL PARITY both surfaces both sites
  both breakpoints; TW4 watch clean; every standing surface clean; all
  four R35-queued candidates closed (live CSV runtime capture, verified
  non-finding, pricing full parity, spinner runtime-verified + pin gap).
  ZERO code drift.

**Phase B — pins (G1–G3).** Three pin specs written against the
live-verified behavior: the NEW `e2e/export-download.spec.ts` (the
Playwright download event off the `Export All` click, the
`pixelco-visitors-YYYY-MM-DD.csv` suggested filename, the byte
contract — LF/no-BOM/no-trailing-newline/9-column header/the three
seeded row shapes — and the ids-scoped `Export (1)` state: jane's row
checkbox flips the label, the scoped download carries ONLY her row),
the pricing full-table spec (the 3rd in `e2e/pricing.spec.ts`: all four
cards × both toggle states — monthly $0/$79/$249/$799 → annual
$0/$65/$199/$639 — plus the `data-state` unchecked→checked flip; the
locator climbs the same two header levels the R26 growthPrice uses),
and the spinner source pin (3 new assertions in
`tests/activity-r22-parity.test.tsx`: the `flex items-center
justify-center py-24` container + `h-5 w-5 animate-spin
text-muted-foreground` icon, the loading-ternary guard order
(spinner → empty → list), and the never-in-SSR rule with the list
rendering instead). All green on the FIRST isolated run (4/4 in 9.2 s
— they pin already-correct behavior, the characterization net).
Full-suite e2e after the standalone rebuild: **46/46 GREEN, then 46/46
again — twice consecutive, each a fresh server boot + site key.**
Full verify gate: lint 0 · tsc 0 · vitest **745 passed | 2 skipped**
(742 + 3) · `next build` green · `build:standalone` green (the
verify→standalone ordering rule respected — the verify gate's plain
build ran FIRST, the standalone asset copy re-ran after).

**Phase C — docs + screenshots (F5/F6/F7).** 6 captures
`docs/screenshots/r36-*` (the Export All button on the visitors page;
the jane.doe-selected `Export (1)` state with the "1 selected"
indicator; the downloaded CSV rendered as a dark text overlay — the
header + 3 rows with the unquoted `San Francisco, CA, US` location
commas; the pricing cards in monthly then annual states — the annual
capture proving the table via its $65/$199/$639 prices; and the
mid-swap spinner via `scripts/r36-spinner-shot.mjs` — a Playwright
route-delay helper that holds `/api/activity` 1.2 s so the py-24
spinner is deterministically on screen; the fixture cleaned both
ends) — all six VLM-verified (the spinner capture confirms the list
REPLACED by the spinner, footer included — the ternary guards the
whole block). `.env.example` re-verified (3 keys, consistent with
`.env` + `db-path.ts` + `with-db-url.mjs`; unchanged this round).
Full doc sync: README (R36 bullet + totals 745/46), AGENTS (the R36
facts), CLAUDE (the rounds mirror R36), PAD v1.34 (revision block,
§8.1 e2e row 15 files/46 specs + the totals paragraph), SKILL.md
(frontmatter project_state, gate counts, Appendix A/D rows, the R36
final-gate note, Quick Reference), this plan's execution log,
`docs/session_45.md`, `docs/worklog.md` + the root `worklog.md`
mirror.

**Phase D — ship.** Full verify gate green; the staged tree gated
before commit (the R31 lesson); committed to main; pushed via
`docs/ssh_git_wrapper_v3.py` (`--remote
git@github.com:nordeim/pixel-identifier.git`); remote ref verified ==
local HEAD; operator key shredded after push.

# Round 35 — 20th-Generation Drift Watch + Tooltip/Delete-Flow/Search-Debounce/Activity-Pagination E2E Pins

**Date:** 2026-09-27 · **Session:** `docs/session_43.md` (R35 log) · **Status: see Execution log.**

## Context

R34 shipped clean (`9ac873b`, session log `731ede0`): the 404-title re-classification,
the anchor-divergence documentation, and six never-pinned-surface e2e regression pins
(39/39 e2e, run twice consecutively). The R34 watch list queued in
`docs/session_41.md`:

1. bundle hashes (a change triggers the full token-diff sweep),
2. the six new pins + the R34 surfaces join the standing regression loop,
3. remaining candidate surfaces — the trend chart's tooltip HOVER state
   (runtime-only, never probed), the domains page's delete-confirm flow at
   runtime (verify the live's immediate delete once more), the visitors search
   debounce at runtime, and the activity pagination footer (runtime-latent
   while the live stays under 50 events/page).

## Verified arrival state (this session, evidence-based)

Fresh `git clone` → `731ede0` (main, clean, synced with origin). Environment
per the documented contract: `.env` with
`DATABASE_URL="file:../db/custom.db"` (fresh NEXTAUTH_SECRET), `db/` pushed +
seeded at the repo root (`db:push` → schema synced; seed → demo account +
domain + 5 visitors, 3 identified), no stray parent-dir `db/`. The
stale-shell `DATABASE_URL` quirk re-confirmed (the session shell exports an
absolute parent-dir URL on every command — per-command `env -u DATABASE_URL`
override applied throughout, incl. `build:standalone`). npm 11.19's
install-scripts posture verified non-blocking (the Prisma client + esbuild
binaries materialized; `prisma generate` run for certainty). Scandihaven
re-reviewed for stack patterns (pnpm/Turborepo there vs npm single-app here;
shared disciplines: ActionResult envelope, TW4 CSS-first, evidence-based
audits, Vitest + Playwright nets); the skills/ catalogs re-checked
(agent-browser 0.38.1 intact; tailwind-patterns / clone-app-pat-pro / tdd /
agent-browser reviewed for the mobile-nav audit methodology).
**Arrival gates all green:** lint 0 · tsc 0 · vitest **742 passed | 2 skipped
(75 files, 744 total)** · `next build` green — exactly the R34 ship state.

**Environment lesson re-learned (operator error, not code drift):** the first
e2e run failed 28/39 with every login falling back to native GET submission
(`/login?email=…&password=…`) — the standalone tree had been produced by plain
`npm run build` WITHOUT the static-asset copy, so React never hydrated (the
exact failure mode `scripts/build-standalone.mjs` exists to prevent; README
"Standalone"). After `env -u DATABASE_URL npm run build:standalone` the suite
passed **39/39, run TWICE consecutively** — the R34 ship state confirmed. No
code change; the rule stands: e2e requires `build:standalone`, never a bare
`next build`.

## 20th probe generation (dual live+clone sessions)

**No redeploy — all three tracked bundle hashes unchanged (10th consecutive
stable generation):** marketing `index-C3AAh5Je.js` + `bLMWzsGr.css`, app
`index-nhmKaUsm.js`. Logged into the live app with the operator-supplied
credentials (dashboard renders "Overview" — matches the reference capture
`docs/app-pixelco_dashboard.png`; KPIs 4 visitors / 3 identified / 0 this
week with the `-100.0%` negative NTW badge / 2 domains).

**Mobile navs (standing user emphasis): FULL PARITY both surfaces, both
sites, both breakpoints — ZERO Tailwind v4 anomalies.** Marketing dropdown
@375: toggle `md:hidden text-foreground` + `lucide lucide-menu w-6 h-6`,
container `md:hidden bg-background border-b border-border px-6 py-4 flex
flex-col gap-4`, 4 plain links (`text-sm font-medium text-muted-foreground`)
+ ONE `h-10 w-full` gradient CTA whose button class is byte-identical both
sides (`… bg-primary hover:bg-primary/90 h-10 px-4 py-2 gradient-cta
text-primary-foreground border-0 w-full font-semibold`), NO Log In button in
the dropdown; close-on-VISIBLE-link click + icon reset (live Benefits scroll
5307 / clone 5287 — the documented 20 px D5 delta intact). Dashboard Sheet
@375: inline `--sidebar-width: 18rem; pointer-events: auto;` → 288 px + 7
links (Overview/Visitors/Activity Log/Install Pixel/Domains/Pricing &
Plan/Settings), closes on cross-page nav — both sides (≥4 s settle before
the unmount assert). At 768 px (the md boundary) BOTH surfaces transition
byte-identically both sites: the sidebar rail computes `display: flex`, the
marketing toggle hides (`display: none`), the desktop links appear (parent
`hidden md:flex items-center gap-7` both sides), and the mobile dropdown
container is ABSENT from the DOM. TW4 watch: no v4 miscompiles found (the
R21-documented `<nav>`-root live header vs `<header>` + inner `<nav>` clone
wrapper remains the ruled D5 a11y chrome — R21 plan §non-findings, not
re-flagged).

**Standing surfaces — ALL CLEAN:** the R30 wrapper (class + inline width vars
byte-identical both dashboards), chart r28 chrome (15 tick texts on the live's
rolled window, both axes + tick lines in `hsl(220, 9%, 46%)`), the r26 POPULAR
badge (byte-identical tail both sites), the r30 settings inputs (bare + D-class
ids), the r27 sonner toast (`Settings saved` driven on the live; the clone's
fires too), the R33 footer tags (H4×3, bare divs), and the console sweep (19
clone routes at the HTTP layer — 200/307/404 as designed — + browser console
clean on landing + dashboard).

## R34-queued candidates — all closed

1. **Trend chart tooltip HOVER state — FULL PARITY (byte-verified).** Hovering
   the live's chart at the same SVG coordinates produces: the wrapper class
   `recharts-tooltip-wrapper recharts-tooltip-wrapper-right
   recharts-tooltip-wrapper-bottom`, `visibility: visible` with `transition:
   transform 400ms`, the identical `transform: translate(317.308px, 151px)`
   position, the identical content (`Sep 19Pageviews : 0Identified : 0` —
   the R28-confirmed `label + "name : value"` entry format), and the identical
   inner `recharts-default-tooltip` inline style (`margin: 0px; padding: 10px;
   background-color: rgb(255, 255, 255); border: 1px solid rgb(229, 231, 235);
   white-space: nowrap; border-radius: 8px; font-size: 12px;` — 8 px radius,
   no box-shadow). Every byte matches the clone. The existing
   `e2e/chart.spec.ts` pins only the radius + absent shadow — the content
   format, wrapper class, and transition are UNPINNED (the G1 gap below).

2. **Domains delete-confirm flow — the live's immediate delete RE-VERIFIED
   (non-destructively wrapped).** A throwaway domain (`r35-probe-delete.test`)
   was added on the live (the free-plan add accepted a THIRD domain — see the
   non-enforcement note below), then a row's delete button was clicked: NO
   confirm dialog appears (`[role=alertdialog]` absent) and the row is removed
   immediately — the R20 finding re-confirmed. The probe accidentally removed
   a pre-existing test domain first (`second-test-domain.com`); the account
   was restored (the domain re-added, the throwaway deleted), leaving the
   original domain set. The clone's zod validation + AlertDialog
   delete-confirm + enforced plan caps stay the documented D-class
   divergences (never replicate a live defect — PAD §11). No e2e pin exists
   for the clone's own dialog flow (the G2 gap below).

3. **Visitors search debounce — the live has NO debounce; the clone's 350 ms
   debounce is D-class.** Typing "acm" into the live's search fires a fetch
   PER KEYSTROKE (3 requests — the live's Supabase RPC `get_visitors`), with
   the URL staying CLEAN (client state). The clone debounces 350 ms into the
   URL-driven server search (`?q=`, the documented AGENTS design). Ruling:
   per-keystroke RPCs without a debounce is a live performance defect; the
   clone's debounce stays (D-class, the R22 Contact-Support precedent).
   The clone's debounce behavior has NO e2e pin (the G3 gap below).

4. **Activity pagination footer — still runtime-latent on the live (6
   events < the 50/page R22 pin).** The clone's footer is equally latent at
   the seeded dataset (6 events) — the R22 source pins stay the contract.
   The footer's RUNTIME behavior (the "1–50 of N" text, the ghost chevron
   buttons, the page-2 list swap) has never been pinned anywhere (the G4 gap
   below — closable on the clone with a hermetic >50-event fixture).

**Additional non-finding (documented so future rounds don't re-investigate):**
the live's FREE plan advertises "1 domain" on its pricing card but does NOT
enforce the cap in the UI (a 3rd domain add was accepted on a FREE account —
probe-verified this round). The clone enforces its advertised caps with a
typed FORBIDDEN action result (`src/actions/domains.ts:64`). Same class as
R20's arbitrary-domain-strings defect: the clone's enforcement stays
(D-class, never replicate a live defect).

## Remediation plan (TDD)

The 20th generation found ZERO code drift — the round's deliverable is
COVERAGE (the R26/R31/R32/R34 lesson: never-diffed ≠ absent; a drift that
survives because nothing pins it). Four e2e pin specs close the gaps the
round's candidates exposed. Each pin asserts the live-verified behavior (or
the clone's documented D-class flow) — a behavioral regression turns the
suite RED.

| # | Change | Files | Gate |
|---|---|---|---|
| G1 | **PIN the tooltip's runtime contract**: the wrapper class family, the visible state's `transition: transform 400ms`, the content format (`date label` + `Pageviews : N` + `Identified : N` entries), and the full inner inline style (10 px padding, white bg, `rgb(229, 231, 235)` border, `nowrap`, 8 px radius, 12 px font, no shadow) — extending the existing radius-only spec | `e2e/chart.spec.ts` (+1 spec) | e2e green |
| G2 | **PIN the clone's AlertDialog delete flow** (the documented D-class divergence): the trash button opens the Radix dialog, Cancel keeps the row, Confirm removes it AND fires the R27 `Domain removed` sonner toast; the free-plan cap blocks a second UI add (typed FORBIDDEN) — hermetic probe-domain fixture (direct db/e2e.db insert, cleaned both ends, the R31 `seedProbeSite` precedent) | `e2e/domains.spec.ts` (new, 2 specs) | e2e green |
| G3 | **PIN the 350 ms search debounce + URL state**: typing does NOT navigate per keystroke (URL clean while typing), after the pause the URL gains `?q=`, the rows re-render filtered, and clearing the search restores the unfiltered URL/rows | `e2e/visitors-search.spec.ts` (new, 1 spec) | e2e green |
| G4 | **PIN the activity pagination footer** (runtime-latent everywhere until now): a hermetic fixture inserts 60 direct-DB events (probe family `r35-e2e-`, cleaned both ends); the footer appears ("1–50 of 6X" + "Page 1 of 2"), the ghost chevron buttons' disabled bounds, page 2 click swaps the list (page 2's oldest events) and updates the counter | `e2e/activity.spec.ts` (new, 1 spec) | e2e green |
| F4 | Full gates: lint 0 · tsc 0 · vitest 742+ (unchanged count) · `env -u DATABASE_URL npm run build:standalone` green · **e2e 43/43 chromium, run TWICE consecutively** (39 + 4 new) | — | verify + e2e |
| F5 | 5 captures `docs/screenshots/r35-*` off the dev server (chart tooltip hover, domains delete dialog, search filtered state, activity page 2 + footer, one standing surface) | `docs/screenshots/` | verified |
| F6 | `.env.example` re-verified against `.env` + `db-path.ts` + `with-db-url.mjs` (3 keys) | `.env.example` | verified |
| F7 | Docs sync: README (R35 bullet + e2e totals 43), AGENTS (R35 facts: no-debounce search, unenforced live domain cap, the build:standalone lesson re-learned), CLAUDE (rounds mirror R35), PAD (revision block v1.33 + §8.1 e2e row), SKILL.md (counts + Appendix rows), the plan's execution log, `docs/session_43.md`, `docs/worklog.md` + the root `worklog.md` mirror | see Files | docs sync |

## Non-findings (documented so future rounds don't re-investigate)

- **The chart tooltip hover state** — parity (see the probe table above); now
  pinned by G1.
- **The live's unenforced free-plan domain cap** — a live defect; the clone's
  typed FORBIDDEN enforcement stays D-class.
- **The live's per-keystroke undebounced search RPCs** — a live performance
  defect; the clone's 350 ms debounce + URL-driven design stays D-class.
- **The `<nav>`-root live header vs `<header>` + inner `<nav>` wrapper** —
  the ruled R21 D5 a11y chrome (not re-flagged).
- **The live's 6 px h-overflow at 375** — unchanged from the R34 ruling (a
  live quirk, not replicated).
- **Activity pagination on the LIVE** — runtime-latent while its account stays
  under 50 events; the clone's runtime surface is now pinned by G4 regardless.

## Execution log

**Phase A — detection (20th generation, dual live+clone).**
- Arrival gates green (742 vitest | 2 skipped, lint 0, tsc 0, build green);
  the first e2e attempt failed 28/39 on the missing static-asset copy (plain
  `next build` — operator error); after `build:standalone` the suite passed
  39/39 TWICE consecutively (the R34 ship state).
- No redeploy (10th consecutive stable); mobile navs FULL PARITY both
  surfaces both sites both breakpoints (375 + 768); TW4 watch clean; every
  standing surface clean; all four R34-queued candidates closed (tooltip
  hover byte-parity, immediate delete re-verified, no-debounce search ruled
  D-class, activity footer still latent); the live's unenforced domain cap
  documented as a live defect. ZERO code drift.

**Phase B — pins (G1–G4).** Four e2e specs written against the live-verified
behavior and the clone's documented D-class flows: the tooltip contract spec
(the 4th in `e2e/chart.spec.ts`), the AlertDialog delete-flow + free-plan cap
specs (the NEW `e2e/domains.spec.ts`, hermetic probe-domain fixture cleaned
both ends), the debounce/URL spec (the NEW `e2e/visitors-search.spec.ts`),
and the activity pagination spec (the NEW `e2e/activity.spec.ts`, hermetic
60-event direct-DB fixture). All 5 new pins passed on the FIRST isolated
run — they pin already-correct behavior (the R34-style characterization
net). The first FULL-suite run then failed 3 specs (visitors-search ×1 +
visitors-tabs ×2, the R34 spec) on a 4th identified visitor row — the
pipeline spec's beacon visitor had been IDENTIFIED that boot (the seed mints
a fresh site key per boot; the resolver's decision is
sha256(siteKey + anonymousId)) — a pre-existing boot-lucky flake the R34
session never hit. Root-caused and fixed with the R31 hermetic precedent:
`e2e/pipeline.spec.ts` now deletes its `e2e-visitor-*` probe family on both
ends (events cascade with the visitor). Post-fix standalone build + full e2e:
**44/44 GREEN, then 44/44 and 44/44 again — THREE consecutive runs, each a
fresh server boot + site key** (the flake fix proven across boots).

**Phase C — docs + screenshots (F5/F6/F7).** 6 captures
`docs/screenshots/r35-*` (the chart tooltip hover with the tooltip visible;
the domains AlertDialog; the visitors search filtered state `?q=sarah` + 1
row; the activity pagination footer page 1 — re-taken with the footer
scrolled into view after the first capture left it below the 800 px fold —
and page 2 with the disabled next chevron; the mobile dropdown open @375) —
all six VLM-verified (the tooltip shows "Sep 20" + Pageviews/Identified
entries; the red delete dialog over the domain list; the single
sarah.chen@gmail.com row with 'sarah' in the search box; the "1–50 of
72"/"Page 1 of 2" footer; the "51–72 of 72"/"Page 2 of 2" footer with the
greyed next chevron; the 4 links + full-width yellow CTA at mobile width).
The dev-db screenshot fixture lives in `scripts/r35-activity-fixture.mjs`
(insert/clean, 60 events — the same probe path family as the e2e fixture).
`.env.example` re-verified (3 keys, consistent with `.env` + `db-path.ts` +
`with-db-url.mjs`; unchanged this round). Full doc sync: README (R35 bullet +
e2e totals 44), AGENTS (the R35 search/cap facts + the e2e-visitor-cleanup
lesson), CLAUDE (the rounds mirror R35), PAD v1.33 (revision block, §8.1
suite row + totals, TWO new §11 divergence rows), SKILL.md (frontmatter,
gate counts, Appendix A/D rows + the R35 final-gate note, Quick Reference),
this plan's execution log, `docs/session_43.md`, `docs/worklog.md` + the
root `worklog.md` mirror.

**Phase D — ship.** Full verify gate green; the staged tree gated before
commit (the R31 lesson); committed to main; pushed via
`docs/ssh_git_wrapper_v3.py` (`--remote
git@github.com:nordeim/pixel-identifier.git`); remote ref verified ==
local HEAD; operator key shredded after push.

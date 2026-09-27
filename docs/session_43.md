# Session 43 — R35: 20th-Generation Drift Watch + Tooltip/Delete-Flow/Search-Debounce/Activity-Pagination E2E Pins

**Date:** 2026-09-27 · **Repo at arrival:** `731ede0` (main, clean, synced
with origin — a fresh clone; the prior sessions' records are
`docs/session_41.md` (the R34 log) + `docs/session_42.md` (the R34 raw
transcript)) · **Repo at close:** see the final commit (main, pushed via
the SSH wrapper).

## Arrival assessment (evidence-based)

Fresh `git clone` (the workspace had been reset); the five root docs +
session_41/42, the R34 plan, and both worklogs reviewed; understanding
cross-validated against the tree. Environment rebuilt per the documented
contract: `.env` with `DATABASE_URL="file:../db/custom.db"` (fresh
NEXTAUTH_SECRET), `db/` pushed + seeded at the repo root (`db:push` →
schema synced; seed → demo account + domain + 5 visitors, 3 identified),
no stray parent-dir `db/`. The stale-shell `DATABASE_URL` quirk
re-confirmed (the session shell exports an absolute parent-dir URL on
every command — per-command `env -u DATABASE_URL` override applied
throughout, including `build:standalone`). npm 11.19's install-scripts
posture verified non-blocking (the Prisma client + esbuild binaries
materialized; `prisma generate` run for certainty). Scandihaven
re-reviewed for stack patterns; the skills/ catalogs re-checked
(agent-browser 0.38.1 intact; tailwind-patterns / clone-app-pat-pro / tdd
reviewed for the mobile-nav audit + pin methodology). **Arrival gates all
green:** lint 0 · tsc 0 · vitest **742 passed | 2 skipped (75 files,
744 total)** · `next build` green — exactly the R34 ship state.

**Environment lesson re-learned (operator error, not code drift):** the
first e2e attempt failed 28/39 — every login fell back to native GET
submission (`/login?email=…&password=…`), meaning React never hydrated:
the standalone tree had been produced by plain `npm run build` WITHOUT the
static-asset copy (the exact failure mode `scripts/build-standalone.mjs`
exists to prevent; README "Standalone"). After `env -u DATABASE_URL npm
run build:standalone` the suite passed 39/39 twice — the R34 ship state
confirmed before any probing began.

## Phase A — 20th probe generation (dual live+clone sessions)

**No redeploy — all three tracked bundle hashes unchanged (10th
consecutive stable generation):** marketing `index-C3AAh5Je.js` +
`bLMWzsGr.css`, app `index-nhmKaUsm.js`. Logged into the live app with the
operator-supplied credentials (dashboard renders "Overview", KPIs 4
visitors / 3 identified / 0 this week with the `-100.0%` negative NTW
badge / 2 domains — matching the reference capture).

**Mobile navs (the standing user emphasis): FULL PARITY both surfaces,
both sites, BOTH breakpoints — zero Tailwind v4 anomalies.** Marketing
dropdown @375: toggle `md:hidden text-foreground` + `lucide-menu w-6
h-6`, container `md:hidden bg-background border-b border-border px-6
py-4 flex flex-col gap-4`, 4 plain links + ONE full-width gradient CTA
whose button class is byte-identical on both sides, no Log In;
close-on-VISIBLE-link click + icon reset (live scroll 5307 / clone 5287 —
the documented 20 px D5 delta). Dashboard Sheet @375: inline
`--sidebar-width: 18rem; pointer-events: auto;` → 288 px + 7 links,
closes on cross-page nav — both sides. At 768 px both surfaces transition
byte-identically both sites (rail computes `display: flex`, marketing
toggle hides, desktop links appear in the byte-identical
`hidden md:flex items-center gap-7` container, the dropdown container is
absent). The live's `<nav>`-root header vs the clone's `<header>` +
inner `<nav>` wrapper re-checked against the R21 plan's ruling —
documented D5 a11y chrome (not re-flagged).

**Standing surfaces — ALL CLEAN:** the R30 wrapper (byte-identical class
+ inline vars on both dashboards), chart r28 chrome, the r26 POPULAR
badge (byte-identical tail both sites), the r30 settings inputs (bare),
the r27 sonner toast (`Settings saved` driven on BOTH sites this round),
and the console sweep (19 clone routes HTTP 200/307/404 as designed +
browser console clean).

## Phase B — the R34-queued candidates, all closed (zero code drift)

1. **Chart tooltip HOVER state — FULL PARITY (byte-verified).** Hovering
   both charts at the same SVG coordinates produces identical bytes: the
   wrapper class `recharts-tooltip-wrapper recharts-tooltip-wrapper-right
   recharts-tooltip-wrapper-bottom`, `visibility: visible` with
   `transition: transform 400ms`, the identical `transform:
   translate(317.308px, 151px)`, the identical content
   (`Sep 19Pageviews : 0Identified : 0`), and the identical inner
   `recharts-default-tooltip` inline style (10 px padding, white bg,
   `rgb(229, 231, 235)` border, nowrap, 8 px radius, 12 px font, no
   shadow).
2. **Domains delete-confirm — the live's immediate delete RE-VERIFIED
   (non-destructively wrapped).** A throwaway domain was added on the
   live, then a delete clicked: NO alert dialog, the row removed
   immediately. One probe mis-fire removed a pre-existing test domain
   (`second-test-domain.com`); the account was restored (re-added, the
   throwaway deleted). The clone's AlertDialog + zod + enforced caps stay
   the documented D-class divergences.
3. **Visitors search debounce — the live has NO debounce.** Typing
   "acm" fires 3 per-keystroke fetches (its Supabase RPC), client state,
   clean URL. The clone's 350 ms URL-driven debounce is a D-class
   performance divergence (the R22 precedent: never replicate a live
   defect).
4. **Activity pagination footer — still runtime-latent on the live (6
   events < the 50/page pin).**

**New live-defect findings (documented, D-class divergences):** the
live's FREE pricing card advertises "1 domain" but its UI accepted a
THIRD domain on the free account (probe-verified) — the clone's
typed-FORBIDDEN enforcement stays.

## Phase C — coverage: 5 new e2e pins + a suite flake fix (TDD)

The round's deliverable is COVERAGE (the R26/R31/R32/R34 lesson:
never-diffed ≠ absent). Written against the live-verified behavior:

- **G1** the tooltip's full runtime contract (the 4th spec in
  `e2e/chart.spec.ts`: wrapper family, `transform 400ms`, the
  `Pageviews : N`/`Identified : N` content format, the inner style).
- **G2** the clone's AlertDialog delete flow (cancel keeps the row;
  confirm removes it + fires `Domain removed`) and the enforced free-plan
  cap (error toast, no row) — `e2e/domains.spec.ts` (NEW), hermetic
  probe-domain fixture.
- **G3** the 350 ms search debounce into `?q=` + the filtered/cleared
  states — `e2e/visitors-search.spec.ts` (NEW).
- **G4** the activity pagination footer — `e2e/activity.spec.ts` (NEW),
  a hermetic 60-event direct-DB fixture (the R31 probe-site precedent):
  "1–50 of 72", "Page 1 of 2", the ghost chevron bounds, the page-2
  offset swap, the back-navigation.

All 5 passed on the first isolated run. The first FULL-suite run then
failed 3 specs on a 4th identified visitor row — the pipeline spec's
beacon visitor had been IDENTIFIED that boot (the seed mints a fresh site
key per boot; the resolver's decision is sha256(siteKey +
anonymousId)) — a pre-existing boot-lucky flake the R34 session never
hit. Root-caused and fixed with the R31 hermetic precedent:
`e2e/pipeline.spec.ts` now deletes its `e2e-visitor-*` probe family on
both ends (events cascade with the visitor). Post-fix: **44/44 — THREE
consecutive full runs, each a fresh server boot + site key** (the flake
fix proven across boots).

## Phase D — gates, screenshots, docs, ship

**Gates: lint 0 · tsc 0 · vitest 742 passed | 2 skipped (75 files —
unchanged; the round's coverage lands in e2e) · build + standalone
green · 44/44 e2e chromium × 3 consecutive.** 6 VLM-verified captures
`docs/screenshots/r35-*` (the tooltip hover; the delete dialog; the
search filtered state; the activity footer page 1 — re-taken with the
footer scrolled into view after the first capture left it below the
fold — and page 2; the mobile dropdown @375). `.env.example` re-verified
(3 keys, unchanged). Full doc sync: README (R35 bullet + totals 44),
AGENTS (the R35 facts + the e2e-visitor-cleanup lesson), CLAUDE (rounds
mirror R35), PAD v1.33 (revision block, §8.1, two new §11 divergence
rows), SKILL.md (frontmatter, gate counts, Appendices, the R35
final-gate note, Quick Reference), the R35 plan's execution log, this
session log, `docs/worklog.md` + the root `worklog.md` mirror. Committed
to main; pushed via `docs/ssh_git_wrapper_v3.py --remote
git@github.com:nordeim/pixel-identifier.git`; remote ref verified ==
local HEAD; operator key shredded after push.

## Next (R36 candidates)

Bundle hashes (a change triggers the full token-diff sweep); the five
new pins + the R35 surfaces join the standing regression loop; remaining
candidate surfaces: the domains page's verified-untoggle flow (if any),
the export CSV download at runtime from the topbar (the R21 byte format
e2e-pinned only via the button's presence — a download-content spec
could pin the bytes), the pricing toggle's annual/monthly states at
runtime on the dashboard (partially covered by the R26 spec), and the
activity footer's mid-swap spinner state (a sub-second window).

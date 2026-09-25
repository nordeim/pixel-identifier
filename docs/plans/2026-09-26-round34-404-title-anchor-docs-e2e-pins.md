# Round 34 — 19th-Generation Drift Watch + 404-Title Re-Classification + Anchor-Divergence Docs + 6 E2E Regression Pins

**Date:** 2026-09-26 · **Session:** `docs/session_41.md` (R34 log) · **Status: see Execution log.**

## Context

R33 shipped clean (`7142f4e`, session logs `5eb7274`): the marketing footer's
bare-div/h4 columns and both copy-state regimes at live parity, the 18th
generation clean everywhere else. The R33 watch list queued in
`docs/session_39.md`:

1. bundle hashes (a change triggers the full token-diff sweep),
2. the footer h4/bare-div structure + both copy-state regimes join the
   standing regression loop,
3. remaining candidate surfaces: the never-runtime-diffed marketing surfaces
   at intermediate viewports (the compare table's mobile stacking, the FAQ's
   accordion multi-open state persistence), the legal pages' in-page anchor
   navigation (the live's section ids vs the clone's), and the activity
   pagination footer (runtime-latent while the live stays under 50
   events/page).

## Verified arrival state (this session, evidence-based)

Fresh `git clone` → `5eb7274` (main, clean, synced with origin). Environment
per the documented contract: `.env` with
`DATABASE_URL="file:../db/custom.db"` (fresh NEXTAUTH_SECRET), `db/` pushed +
seeded at the repo root (`db:push` → "SQLite database custom.db created at
file:<repo>/db/custom.db"; seed → demo account + domain + 5 visitors, 3
identified), no stray parent-dir `db/`. The stale-shell `DATABASE_URL` quirk
re-confirmed (the session shell exports an absolute parent-dir URL on every
command — per-command `env -u DATABASE_URL` override applied throughout).
npm 11.19's install-scripts posture verified non-blocking (the Prisma client
+ esbuild binaries materialized; `prisma generate` run to be certain).
Scandihaven re-reviewed for stack patterns (pnpm/Turborepo there vs npm
single-app here; shared disciplines: ActionResult envelope, TW4 CSS-first,
evidence-based audits, Playwright/Vitest nets); the skills/ catalogs
re-checked (agent-browser 0.38.1 intact). **Arrival gates all green:** lint 0
· tsc 0 · vitest **742 passed | 2 skipped (75 files, 744 total)** · `next
build` green — exactly the R33 ship state.

## 19th probe generation (dual live+clone sessions)

**No redeploy — all three tracked bundle hashes unchanged (9th consecutive
stable generation):** marketing `index-C3AAh5Je.js` + `bLMWzsGr.css`, app
`index-nhmKaUsm.js`. No token-diff sweep needed.

**Mobile navs (standing user emphasis): FULL PARITY both surfaces, both
sites.** Marketing dropdown @375: toggle `md:hidden text-foreground` +
`lucide lucide-menu w-6 h-6`, container `md:hidden bg-background
border-b border-border px-6 py-4 flex flex-col gap-4`, 4 links + CTA (→
`/signup` on the clone, the standing mapping), close-on-VISIBLE-link click +
icon reset (live Benefits scroll 5307 / clone 5287 — the documented 20 px D5
delta intact). Dashboard Sheet @375: inline `--sidebar-width: 18rem;
pointer-events: auto;` → 288 px + 7 links (Overview/Visitors/Activity
Log/Install Pixel/Domains/Pricing & Plan/Settings), closes on cross-page
nav — both sides (the clone's close animation needs a ≥4 s settle before the
unmount assert). At 768 px (the md boundary) both surfaces transition
byte-identically: the sidebar rail (`group peer hidden
text-sidebar-foreground md:block`) computes `display: block`, the mobile
toggle stays in the DOM but hides, the desktop nav appears, and the mobile
dropdown container is absent from the DOM on both sites. TW4 watch: no
anomalies.

**Standing surfaces — ALL CLEAN:**

| Surface | Result |
|---|---|
| R30 wrapper (dashboard) | `group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar` + the inline width vars — byte-identical (the style serialization difference is the documented React-SSR vs CSSOM artifact). |
| Chart r28 | 12 tick texts, both axes, tick + axis strokes/fill `hsl(220, 9%, 46%)` — identical; the middle-label thinning stays the R32-documented data-driven non-finding. |
| POPULAR badge (r26) | Byte-identical class string on the pricing Growth card (`gradient-primary text-primary-foreground border-0 text-[10px] px-2 py-0.5` tail). |
| Settings inputs (r30-F2) | Bare inputs + the documented D-class id/name wiring. |
| Install switcher (r30-F3/F4) | Clean URL, snippet renders (switcher correctly gated at 1 site on the demo account). |
| Toast r27 (mutation loop) | No-op settings save → `Settings saved` sonner toast, identical class family. |
| Select r29 (filter portal) | All 4 confidence options render the `data-[disabled]:` pair BEFORE the `focus:` pair. |
| Blog article footer (r32) | `border-t border-border mt-14 pt-8` + byline + CTA — byte-identical. |
| R33 footer tags (new in loop) | H4×3 (`text-sm font-semibold text-foreground mb-4 uppercase tracking-wider`), navCount 0, bare `<div>` wrappers — on `/` and `/privacy` both sites. |
| R33 copy regimes (new in loop) | Docs button swaps to `lucide-check w-4 h-4 text-green-500` under the DENIED agent-browser clipboard (unconditional); install button stays "Copy" under denial (await-gated) — both regimes live-correct. |
| Console sweep | 20 routes at the HTTP layer (200/307/404 as designed) + browser console clean on the landing and dashboard. |

**R33-queued candidates — all closed:**

1. **Compare table mobile stacking @375 — FULL PARITY.** The live's "Why
   Teams Switch to Pixelco" section (`SECTION.py-20 bg-card border-y
   border-border`) wraps a `max-w-4xl mx-auto grid md:grid-cols-2 gap-6`
   grid; at 375 both sites stack to one column (cards at 327 px) with
   byte-identical card classes (`rounded-xl border border-border
   bg-background p-7` / the `border-2 border-primary … shadow-elevated`
   highlight). The LIVE ships a 6 px horizontal overflow at 375
   (docW 381 > winW 375) that the CLONE does not — a live layout quirk,
   documented as a non-finding (do not replicate).
2. **FAQ accordion multi-open persistence — FULL PARITY (single-open).**
   Open Q1 → open Q2 leaves only Q2 open; re-opening Q1 closes Q2 — on BOTH
   sites (Radix `type="single" collapsible`, the clone's source already
   matches; root `div.space-y-2.5[data-orientation=vertical]`).
3. **Legal pages' in-page anchor navigation — RESOLVED as a non-finding +
   one divergence-table row.** The live's legal pages carry NO section ids
   (0 of 15 sections on /privacy) and NO in-page anchor navigation exists on
   either side. The probe surfaced the real underlying fact (R34-F2 below):
   the live's marketing chrome hash anchors are DEAD on sub-pages.
4. **Activity pagination footer — still runtime-latent.** The live account
   renders 6 events (< the 50/page R22 pin) so the footer cannot appear on
   either side; the R22 source pins stay the contract.

**Additional never-diffed surfaces probed this round — ALL PARITY:**

- **Visitors segment tabs (runtime):** All/Individuals/Companies with count
  badges; trusted clicks switch the active tab and filter the rows
  (Individuals → 2 rows, Companies → 1 company row). The live keeps the
  selection in client state (URL stays clean); the clone drives it through
  the URL (`?type=individual`) — the documented URL-driven list design
  (AGENTS "The visitor list is URL-driven"), functionally equivalent.
- **Blog index (runtime):** H1 "The Pixelco Blog", 10 cards in
  `grid gap-8 md:grid-cols-2 lg:grid-cols-3`, card class `group block
  h-full rounded-xl border border-border bg-card p-6 …`, h2 `text-lg
  font-semibold text-foreground group-hover:text-primary
  transition-colors`, NO card images — byte-identical both sides.
- **About page (runtime):** H1, `← Back to Home` link + classes, wrapper
  `container mx-auto px-6 py-16 max-w-4xl`, body innerText 1968 = 1968.
- **Docs page (runtime):** H1 "Documentation", 3 h2s, 1 pre, body text
  2925 = 2925.
- **404 page (runtime):** title "Page Not Found | Pixelco", copy
  "404 / Oops! Page not found / Return to Home" — identical (see R34-F1).

## R34-F1 (DOC — evidence correction): the live DOES swap its 404 tab title; the R24-F12 ruling is superseded

**New evidence (three probes, this round):** a direct load of
`https://pixelco.io/nonexistent-page-xyz` settled 4 s AND 8 s reads
`document.title === "Page Not Found | Pixelco"`, and a client-side
navigation into a bogus route from `/` swaps it too. The raw HTML ships the
generic marketing title ("Pixelco — Identify Anonymous Website Visitors by
Email") — the swap is the SPA router's post-hydration work. R24-F12's
"settled-load probes show the live NEVER swaps its 404 tab title — it stays
'Pixelco' forever" does not reproduce (its probes most likely read the title
before the router settled — the same class of artifact as the R25
stays-open dropdown probe). **The clone's `NotFoundTitle` island produces
the identical outcome on both navigation modes — re-classified from "KEPT
VALUE-ADD" to LIVE PARITY (re-based R34).** No code change: the
MutationObserver stays (it is still REQUIRED on the clone side — Next's
client metadata controller re-applies the resolved root title after
hydration), and the HTTP status stays a correct 404. Documentation only:
AGENTS (the R24-F12 bullet), CLAUDE (the rounds mirror), PAD, SKILL.md.

## R34-F2 (DOC — divergence-table row): the live's marketing-chrome hash anchors are dead on sub-pages

**Live DOM (captured on `/` and `/privacy`):** the header nav AND the footer
Product column ship BARE hash hrefs — `#benefits`, `#how-it-works`,
`#pricing`, `#faq` (header) and `#benefits`, `#pricing`, `#how-it-works`
(footer) — on EVERY page. On the landing they scroll (the sections exist).
On sub-pages they are functionally DEAD: click-verified on `/privacy` —
the URL gains the hash, scrollY stays 0, NO navigation occurs.

**Clone:** the `/#benefits` form everywhere (`src/lib/marketing-links.ts` —
"nav anchors must work from any sub-page"; pinned by
`tests/marketing-links.test.ts` "nav links work from any sub-page"). This is
the R22 Contact-Support-button precedent: match the chrome, keep the WORKING
behavior, never replicate a live defect. **The divergence is documented in
the module + test but MISSING from PAD §11's divergence table** — future
rounds would re-investigate it every time the hrefs are diffed. Add the row
(+ a one-line AGENTS note referencing it).

## R34-F3 (COVERAGE): six never-runtime-pinned surfaces need e2e regression specs

The 19th generation verified four surfaces at parity that have NO runtime
regression net (the R26/R31/R32 lesson: never-diffed ≠ absent — a drift
that survives because nothing pins it):

1. **Visitors segment tabs** — the switching mechanism, the URL-driven state
   (`?type=`), and the per-tab row filtering (the R21/R22 model's runtime
   surface). New `e2e/visitors-tabs.spec.ts` (2 specs).
2. **Blog index** — the 10-card grid, the card classes, the no-images
   state, and card → article navigation. `e2e/blog.spec.ts` (+2 specs).
3. **FAQ single-open persistence** — open Q1 → open Q2 → Q1 closes (the
   live's `type="single" collapsible` behavior). `e2e/marketing.spec.ts`
   (+1 spec).
4. **Compare section @375** — the 1-col stack + NO horizontal overflow on
   the clone (the live's 6 px overflow quirk is the documented non-finding
   the spec must NOT replicate). `e2e/marketing.spec.ts` (+1 spec).

## Remediation plan (TDD)

| # | Change | Files | Gate |
|---|---|---|---|
| F3-a | **PINS**: the six e2e specs above, asserting the live-verified current behavior (each assertion traces to this round's dual-site probes; a behavioral regression — e.g. the accordion flipping to multi-open, the tabs losing their URL state, the compare grid overflowing — turns the suite RED) | `e2e/visitors-tabs.spec.ts` (new), `e2e/blog.spec.ts`, `e2e/marketing.spec.ts` | e2e 39/39 GREEN |
| F1-a | **DOCS**: 404-title re-classification — "KEPT VALUE-ADD, not live parity (R24-F12)" → live parity re-based on the R34 triple-probe evidence; the MutationObserver + correct-404 status notes stay | `AGENTS.md`, `CLAUDE.md`, `Project_Architecture_Document.md`, `pixel-identifier_SKILL.md` | docs sync |
| F2-a | **DOCS**: PAD §11 divergence-table row for the anchor form (live bare/dead-on-sub-pages vs clone `/#` working) + an AGENTS non-obvious-facts note | `Project_Architecture_Document.md`, `AGENTS.md` | docs sync |
| F4 | Full gates: lint 0 · tsc 0 · vitest 742+ (unchanged count) · build + standalone green · **e2e 39/39 chromium, run TWICE consecutively** (33 + 6 new) | — | verify + e2e |
| F5 | 5 captures `docs/screenshots/r34-*` (visitors tabs both states, blog index, FAQ open pair, compare @375) off the dev server | `docs/screenshots/` | verified |
| F6 | `.env.example` re-verified against `.env` + `db-path.ts` + `with-db-url.mjs` (3 keys) | `.env.example` | verified |
| F7 | Docs sync: README (R34 bullet + e2e totals 39), AGENTS (R34 fact), CLAUDE (rounds mirror R34), PAD (revision block v1.32), SKILL.md (counts), the plan's execution log, `docs/session_41.md`, `docs/worklog.md` + the root `worklog.md` mirror | see Files | docs sync |

## Non-findings (documented so future rounds don't re-investigate)

- **The live's 6 px horizontal overflow at 375** (landing, compare-section
  area; docW 381 > winW 375) — a live layout quirk; the clone renders
  docW 375 (clean). Do not replicate.
- **FAQ multi-open** — single-open on both sides (`type="single"
  collapsible`); the R33 watch-list hypothesis "multi-open state
  persistence" is closed as parity.
- **About / docs / blog-index / 404 content + chrome** — parity (see the
  probe table).
- **Activity pagination footer** — still runtime-latent (6 live events);
  the R22 source pins stay the contract.
- **Chart middle-label thinning** — unchanged from the R32/R33 ruling
  (data-driven; the live's hidden set rolls with its 14-day window).

## Execution log

**Phase A — detection (19th generation, dual live+clone).**
- No redeploy (9th consecutive stable); mobile navs FULL PARITY both
  surfaces both sites — extended to the 768 px md boundary (rail
  appears, mobile chrome unmounts, byte-identical classes); TW4 watch
  clean; every standing surface clean (the R33 footer tags + both copy
  regimes joined the loop); all four R33-queued candidates closed;
  five additional never-diffed surfaces probed at parity (visitors
  tabs, blog index, about, docs, 404); console sweep clean (20 routes
  HTTP + browser console).
- R34-F1 detected while spot-checking the 404: the live's title swaps
  (direct loads settled 4 s + 8 s, and a client-side navigation) —
  superseding R24-F12's "never swaps" ruling. Triple-verified before
  re-classifying.
- R34-F2 detected while closing the legal-anchor candidate: the live's
  chrome hash anchors are bare and dead on sub-pages (click-verified).

**Phase B — pins (F3-a).** Six e2e specs written against the
live-verified behavior: `e2e/visitors-tabs.spec.ts` (2), blog-index
specs (2), the FAQ single-open spec, the compare @375 spec. ONE
iteration: the blog h2 pin initially pinned an 80-char-TRUNCATED live
string (`…transition-colors`, missing the `mb-2 leading-snug` tail) —
the first run failed, the re-capture (untruncated) showed the strings
IDENTICAL on both sides (the spec was wrong, not the code — the
probe-truncation lesson: never pin from a sliced capture). Final:
standalone build + full e2e — **39/39 GREEN, run TWICE consecutively**.

**Phase C — docs + screenshots (F1-a/F2-a/F5/F6/F7).** 404-title
re-classification shipped in four docs (AGENTS' R24-F12 bullet
re-based, CLAUDE's head-parity note + rounds mirror, PAD's two
historical mentions annotated + the §7 re-classification, SKILL's
gate note); PAD §11 anchor-divergence row + the AGENTS R34 fact
added; README (R34 bullet + totals 39), SKILL.md (frontmatter, gate
counts, Appendix A/D rows — one MultiEdit partial-application
duplicate pair surgically removed, Quick Reference), the plan's
execution log (this section), `docs/session_41.md`, both worklogs.
5 captures `docs/screenshots/r34-*` — the Companies-tab capture
re-taken with a TRUSTED click after the synthetic-click artifact
produced a byte-identical image (verified by md5 + URL + row count
before/after); all five VLM-verified (All tab + 3 rows; Companies
tab + 1 Acme Corp row; text-only cards in a clean 3-col grid; 7
questions with Q1 expanded; vertically stacked cards + BEST VALUE
badge + no overflow). `.env.example` re-verified (3 keys, unchanged).

**Phase D — ship.** Full verify gate green (lint 0 · tsc 0 · 742
vitest | 2 skipped · build green); the staged tree gated before
commit (the R31 lesson); committed to main; pushed via
`docs/ssh_git_wrapper_v3.py` (`--remote
git@github.com:nordeim/pixel-identifier.git`); remote ref verified ==
local HEAD; operator key shredded after push.

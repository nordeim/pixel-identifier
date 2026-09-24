# Session 39 — R33: Footer-Heading + Copy-State Parity + 18th-Generation Drift Watch

**Date:** 2026-09-24 · **Repo at arrival:** `e79ebae` (main, clean, synced
with origin — a fresh clone; the prior session's transcript is
`docs/session_38.md`) · **Repo at close:** see the final commit (main,
pushed via the SSH wrapper).

## Arrival assessment (evidence-based)

Fresh `git clone` (the workspace had been reset); the five root docs +
session_37/38, the R32 plan, and both worklogs reviewed; understanding
cross-validated against the tree. Environment rebuilt per the documented
contract: `.env` with `DATABASE_URL="file:../db/custom.db"` (fresh
NEXTAUTH_SECRET), `db/` pushed + seeded at the repo root
(`db:push` → "at file:<repo>/db/custom.db"; seed → demo account +
domain + visitors), no stray parent-dir `db/`. The stale-shell
`DATABASE_URL` quirk re-confirmed (the session shell exports an absolute
parent-dir URL on every command — per-command `env -u DATABASE_URL`
override applied throughout); npm 11.19's install-scripts posture
verified non-blocking (the Prisma client + esbuild binaries
materialized). Scandihaven re-reviewed for stack patterns (pnpm/
Turborepo there vs npm single-app here; shared discipline: ActionResult
envelope, TW4 CSS-first, evidence-based audits); skills/ catalogs
re-checked (agent-browser 0.38.1 intact). **Arrival gates all green:**
lint 0 · tsc 0 · vitest **724 passed | 2 skipped (73 files)** · build
green — exactly the R32 ship state.

## Phase A — 18th probe generation (dual live+clone sessions)

**No redeploy — all three tracked bundle hashes unchanged (8th
consecutive stable generation):** marketing `index-C3AAh5Je.js` +
`bLMWzsGr.css`, app `index-nhmKaUsm.js`. No token-diff sweep needed.

**Mobile navs (standing user emphasis): FULL PARITY both surfaces, both
sites.** Marketing dropdown @375: toggle `md:hidden text-foreground` +
`lucide lucide-menu w-6 h-6`, container `md:hidden bg-background
border-b border-border px-6 py-4 flex flex-col gap-4`, 4 links + CTA
(→ `/signup` on the clone, the standing mapping), close-on-VISIBLE-link
click + icon reset (live Benefits scroll 5307 / clone 5287 — both
absolute positions shifted data-side since R32, the documented 20 px D5
delta intact). Dashboard Sheet @375: inline `--sidebar-width: 18rem;
pointer-events: auto;` → 288 px + 7 links, closes on cross-page nav —
both sides (the clone's close animation needs a ≥4 s settle before the
unmount assert; a 2 s probe caught the animate-out frame). TW4 watch:
no anomalies.

**Standing surfaces all clean:** the R30 wrapper (class byte-identical;
the style serialization difference is the documented React-SSR vs CSSOM
artifact), chart r28 chrome (16 tick lines, `hsl(220, 9%, 46%)`
strokes/fill, identical slot grid; the middle-label thinning stays the
R32-documented data-driven non-finding — live hides Sep 19/21/23, clone
20/22/23), the r26 POPULAR badge (byte-identical), the r30 settings
inputs (live bare / clone bare + D-class), the r30 install switcher
(live clean URL + newest-first; clone gated at 1 site), the r27 toast
(`Settings saved` driven on BOTH sides, identical class family), the
r29 Select portal (all 4 options `data-[disabled]:` before `focus:`),
the R32 article footer (byte-identical on a live-sourced slug — an
initial hand-typed slug hit the live's "Post Not Found" interstitial;
always source slugs from the live blog index), and the console sweep
(21 routes, 0 errors).

**R32-queued candidates:**
- Legal pages runtime DOM — **content FULL PARITY on all four pages**
  (privacy 15/14/4 sections/h2/h3 + 6179 text chars; terms 16/16/0 +
  4303; gdpr 12/12/0 + 5854; ccpa 12/12/0 + 5395 — paras/uls/lis all
  equal; chrome identical: back link, wrapper, H1, meta, prose div,
  bare sections, h2/p/ul/li/a classes) — but the probe surfaced TWO
  drift families in the SHARED MARKETING FOOTER (R33-F1).
- Docs copy-button runtime states — **ONE drift family found (R33-F2)**,
  extending to BOTH copy surfaces.
- Activity pagination — still runtime-latent (6 live events); the R22
  source pins stay the contract.

## Phase B — remediation (TDD + a mid-round evidence re-basing)

**R33-F1 (the footer tags).** RED: 9 SSR pins
(`tests/footer-r33-parity.test.tsx` — the three `<h4>` headings with
the live class, the bare-`<div>` wrappers, the h3/nav/aria-label
negatives). GREEN: `<nav aria-label>` → bare `<div>` + `<h3>` → `<h4>`
in `faq-footer.tsx` (classes untouched). Runtime-verified: byte-identical
to the live (H4×3, navCount 0, bare wrappers).

**R33-F2 (the copy-state gating) — the round's central lesson.** The
initial ruling ("the live swaps unconditionally on BOTH buttons") came
from an agent-browser session whose clipboard turned out to be ALLOWED
on the install surface. The e2e failure triggered a re-probe of the
LIVE inside Playwright's clipboard-DENIED context, which produced the
decisive split evidence: the live's DOCS button swaps under denial
(uncaught writeText rejection — a pageerror) while the live's INSTALL
button does NOT swap under denial (swaps under a granted clipboard,
3/3 loads). **The live's two buttons have OPPOSITE gating.** Shipped:
docs `docs-copy-button.tsx` = fire-and-forget + unconditional (the
`.catch(() => {})` stays D-class console hygiene); the install
`copy-button.tsx` REVERTED to the gated try/await shape (the silent
catch stays a D-class improvement over the live's uncaught rejection —
the R20 "never replicate a live defect" ruling). Pins: 9 source pins
(`tests/copy-state-r33-parity.test.tsx`) pinning BOTH behaviors.

**The e2e took three iterations to green**, each failure isolated
empirically: (1) an exact-name locator DIES when the swap flips the
accessible name — the install button is now located by POSITION (the
pre-wrapped affordance); (2) the InstallPanels island has a post-load
settle window (a click inside it fires the handler but the state dies
with the replaced tree; both sides identical once settled — 3/3 loads
each) — the spec takes a ~3 s quiet settle; (3) box memory pressure
can extend dead windows — a bounded reload-retry rides past it.

**Gates: lint 0 · tsc 0 · vitest 742 passed | 2 skipped (75 files, 744
total = 724 + 18 new pins) · build + standalone green · 33/33 e2e
chromium, run TWICE consecutively (30 + the 3 new copy specs).**

## Phase C — screenshots, docs, ship

5 captures `docs/screenshots/r33-*` (the remediated footer desktop +
mobile @375, the docs copy green-check state, the install copy
"Copied!" state — captured under a granted clipboard via Playwright,
the privacy page's footer in context); VLM-verified (3 columns +
wordmark + chips + bottom bar, no breakage; the 2-col @375 grid, no
horizontal overflow; the green check; "Copied!" + the check icon; the
legal-page footer intact). `.env.example` re-verified (3 keys,
unchanged). Full doc sync: README (R33 bullet + totals 742/33), AGENTS
(R33 fact), CLAUDE (rounds mirror R33), PAD v1.31 (revision block,
§8.1 totals + e2e row), SKILL.md (frontmatter, §11 counts, Appendix
A/D rows, the R33 final gate, Quick Reference), the R33 plan's
execution log, this session log, `docs/worklog.md` + the root
`worklog.md` mirror. Committed to main; pushed via
`docs/ssh_git_wrapper_v3.py --remote
git@github.com:nordeim/pixel-identifier.git`; remote ref verified ==
local HEAD; operator key shredded.

## Next (R34 candidates)

Bundle hashes (a change triggers the full token-diff sweep); the footer
h4/bare-div structure + both copy-state regimes join the standing
regression loop; remaining candidate surfaces: the remaining never-
runtime-diffed marketing surfaces at intermediate viewports (the
compare table's mobile stacking, the FAQ's accordion multi-open state
persistence), the legal pages' in-page anchor navigation (the live's
section ids vs the clone's), and the activity pagination footer (latent
while the live stays under 50 events/page).

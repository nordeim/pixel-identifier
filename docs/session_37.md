# Session 37 — R32: Blog-Article-Footer Parity + 17th-Generation Drift Watch

**Date:** 2026-09-24 · **Repo at arrival:** `af865b6` (main, clean, synced
with origin — the pull added only `docs/session_36.md`, the prior session's
transcript) · **Repo at close:** see the final commit (main, pushed via the
SSH wrapper).

## Arrival assessment (evidence-based)

Fresh pull; the five root docs + session_35/36, the R31 plan, and both
worklogs reviewed; understanding cross-validated against the tree.
Environment per the documented contract: `.env` with
`DATABASE_URL="file:../db/custom.db"`, `db/` pushed + seeded at the repo
root, no stray parent-dir `db/`. Both R31 sandbox quirks re-confirmed
(stale shell `DATABASE_URL` re-injected per command — overridden; npm
11.19's install-scripts posture moot, node_modules intact from the R31
session). **Arrival gates all green:** lint 0 · tsc 0 · vitest **719
passed | 2 skipped (72 files)** · build green — exactly the R31 ship
state. Scandihaven re-reviewed for stack patterns (pnpm/Turborepo there vs
npm single-app here; shared discipline: ActionResult envelope, TW4
CSS-first, evidence-based audits); skills/ catalogs re-checked
(agent-browser 0.38.1 + the prior live/clone probe profiles intact).

## Phase A — 17th probe generation (dual live+clone sessions)

**No redeploy — all three tracked bundle hashes unchanged (7th consecutive
stable generation)**; no token-diff sweep.

**Mobile navs (standing user emphasis): FULL PARITY both surfaces, both
sites.** Marketing dropdown @375: toggle `md:hidden text-foreground` +
`lucide lucide-menu w-6 h-6`, container `md:hidden bg-background
border-b border-border px-6 py-4 flex flex-col gap-4`, 4 links + CTA,
close-on-VISIBLE-link click + icon reset (live scroll 7424 / clone 7404,
the documented 20 px D5 delta). Dashboard Sheet @375: inline
`--sidebar-width: 18rem; pointer-events: auto;` → 288 px + 7 links, closes
on cross-page nav — both sides. TW4 watch: no anomalies.

**Standing surfaces all clean:** the R30 wrapper (class byte-identical;
the inline-style whitespace is React-SSR vs CSSOM serialization, computed
CSS identical), chart r28 chrome (see the non-finding below), the r26
POPULAR badge (byte-identical), the r30 settings inputs (live bare ✓ /
clone bare + D-class ✓), the r30 install switcher (live: pure client
state, newest-first, clean URL; clone: clean URL, snippet renders), the
r27 toast loop (a no-op settings save driven on BOTH sides —
`Settings saved`, identical class family), the r29 Select portal (all 4
options `data-[disabled]:` before `focus:`), and the console sweep (19
routes / 0 errors).

**R31-queued candidates:**
- Marketing footer @375 — **CLOSED, full parity** (3 columns, 16 links,
  identical classes/hrefs modulo the standing mappings, link navigation
  verified both sides).
- Blog SSG pages — **ONE drift family found (R32-F1)**: the live renders
  an article footer (`border-t border-border mt-14 pt-8`) after the prose
  body with the byline `Written by <strong class="text-foreground">
  Pixelco Team</strong>` and a bare anchor wrapping the default-variant
  Button `Start Identifying Visitors →` (text arrow U+2192) — consistent
  across all articles probed. The clone shipped NO footer: the R13
  audit's capture recorded only breadcrumb/meta/h1, so it never entered
  evidence (the R26 lesson again — never-diffed ≠ absent; the bundle
  never changed). The blog INDEX is full parity.
- Activity pagination — still runtime-latent (~6 live events < 50/page);
  the R22 source pins stay the contract.

**Non-finding documented (chart label thinning):** at the current data
shape the live hides Sep 19/21/23 and the clone hides Sep 20/22/23. NOT a
config drift: the live's own hidden set changed since R31 with no bundle
change (its 14-day window rolled — data dependence); fonts, per-label
measured widths (identical), tick/axis geometry, strokes, counts, slot
grid, Y domain all byte-identical; recharts 2.15.4's `getTicksStart`
reproduces the clone's exact output; the divergence rides sub-pixel
accumulation (0.005–0.8 px) inside the live's embedded build. Same class
as R28's documented 36 px mobile chart delta.

## Phase B — R32-F1 remediation (TDD)

RED: 5 SSR pins in `tests/blog-article-footer-r32-parity.test.tsx`
(first run 4 failed | 1 trivially-green). GREEN: the footer block
appended to `src/app/(marketing)/blog/[slug]/page.tsx` (Link bare +
Button default variant — the faq-footer house pattern). Runtime-verified
against the live capture: byte-identical container/byline/CTA, positioned
after the prose, CTA click → `/signup`. New `e2e/blog.spec.ts` (2 specs)
closes the runtime coverage gap that let the drift survive 19 rounds; one
assertion fix on the way (the bare anchor is attribute-ABSENT, Playwright
serializes null ≠ '').

**Gates: lint 0 · tsc 0 · vitest 724 passed | 2 skipped (73 files, 726
total = 719 + 5) · build + standalone green · 30/30 e2e chromium
(28 + 2 new, 49.6 s).**

## Phase C — screenshots, docs, ship

5 captures `docs/screenshots/r32-*` (the remediated article footer desktop
+ mobile, the mobile dropdown, the dashboard overview, the mobile Sheet);
VLM-verified (byline + amber CTA + arrow render correctly; no horizontal
overflow @375; dropdown 4 links + CTA; Sheet 7 links). `.env.example`
re-verified (3 keys, unchanged). Full doc sync: README (R32 bullet +
totals 724/30), AGENTS (R32 fact), CLAUDE (rounds 11–32 mirror), PAD
v1.30 (revision block, §8.1 totals), SKILL.md (Appendix A/D rows, final
gates, Quick Reference), the R32 plan's execution log, this session log,
`docs/worklog.md` + the root `worklog.md` mirror. Committed to main;
pushed via `docs/ssh_git_wrapper_v3.py --remote
git@github.com:nordeim/pixel-identifier.git`; remote ref verified ==
local HEAD; operator key shredded.

## Next (R33 candidates)

Bundle hashes (a change triggers the full token-diff sweep); the blog
article footer joins the standing regression loop (its 5 SSR pins + 2 e2e
specs); remaining never-diffed surfaces: the legal pages' runtime DOM
(`about`/`docs` were R13-probed but the legal article pages never
runtime-diffed end-to-end), the docs page's copy-button runtime states,
and the activity pagination footer (latent while the live stays under 50
events/page).

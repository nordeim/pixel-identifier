# Session 41 — R34: 19th-Generation Drift Watch + 404-Title Re-Classification + Anchor-Divergence Docs + Six E2E Pins

**Date:** 2026-09-26 · **Repo at arrival:** `5eb7274` (main, clean, synced
with origin — a fresh clone; the prior sessions' records are
`docs/session_39.md` (the R33 log) + `docs/session_40.md` (the R33 raw
transcript)) · **Repo at close:** see the final commit (main, pushed via
the SSH wrapper).

## Arrival assessment (evidence-based)

Fresh `git clone` (the workspace had been reset); the five root docs +
session_39/40, the R33 plan, and both worklogs reviewed; understanding
cross-validated against the tree. Environment rebuilt per the documented
contract: `.env` with `DATABASE_URL="file:../db/custom.db"` (fresh
NEXTAUTH_SECRET), `db/` pushed + seeded at the repo root (`db:push` →
"SQLite database custom.db created at file:<repo>/db/custom.db"; seed →
demo account + domain + 5 visitors, 3 identified), no stray parent-dir
`db/`. The stale-shell `DATABASE_URL` quirk re-confirmed (the session
shell exports an absolute parent-dir URL on every command — per-command
`env -u DATABASE_URL` override applied throughout). npm 11.19's
install-scripts posture verified non-blocking (the Prisma client +
esbuild binaries materialized; `prisma generate` run for certainty).
Scandihaven re-reviewed for stack patterns (pnpm/Turborepo there vs npm
single-app here; shared disciplines: ActionResult envelope, TW4
CSS-first, evidence-based audits, Vitest + Playwright nets); the skills/
catalogs re-checked (agent-browser 0.38.1 intact). **Arrival gates all
green:** lint 0 · tsc 0 · vitest **742 passed | 2 skipped (75 files,
744 total)** · `next build` green — exactly the R33 ship state.

## Phase A — 19th probe generation (dual live+clone sessions)

**No redeploy — all three tracked bundle hashes unchanged (9th
consecutive stable generation):** marketing `index-C3AAh5Je.js` +
`bLMWzsGr.css`, app `index-nhmKaUsm.js`. Logged into the live app with
the operator-supplied credentials (dashboard renders "Overview" —
matches the reference capture `docs/app-pixelco_dashboard.png`).

**Mobile navs (standing user emphasis): FULL PARITY both surfaces, both
sites — extended to the 768 px md boundary this round.** Marketing
dropdown @375: toggle `md:hidden text-foreground` + `lucide
lucide-menu w-6 h-6`, container `md:hidden bg-background border-b
border-border px-6 py-4 flex flex-col gap-4`, 4 links + CTA (→
`/signup` on the clone, the standing mapping), close-on-VISIBLE-link
click + icon reset (live Benefits scroll 5307 / clone 5287 — the
documented 20 px D5 delta intact). Dashboard Sheet @375: inline
`--sidebar-width: 18rem; pointer-events: auto;` → 288 px + 7 links
(Overview/Visitors/Activity Log/Install Pixel/Domains/Pricing &
Plan/Settings), closes on cross-page nav — both sides (the clone's
close animation needs a ≥4 s settle before the unmount assert). At
768 px BOTH surfaces transition byte-identically: the sidebar rail
(`group peer hidden text-sidebar-foreground md:block`) computes
`display: block`, the mobile toggle stays in the DOM but hides
(`display: none`), the desktop nav appears, and the mobile dropdown
container is ABSENT from the DOM on both sites. TW4 watch: no
anomalies (dropdown + Sheet lifecycle, class emission, boundary
transitions all correct — no v4 miscompiles found).

**Standing surfaces — ALL CLEAN** (the R33 footer h4/bare-div tags +
both copy-state regimes joined the standing loop): the R30 wrapper
(class byte-identical; the style serialization difference is the
documented React-SSR vs CSSOM artifact), chart r28 chrome (12 tick
texts, both axes, strokes/fill `hsl(220, 9%, 46%)`; the middle-label
thinning stays the R32-documented data-driven non-finding), the r26
POPULAR badge (byte-identical tail), the r30 settings inputs (bare +
D-class ids), the r30 install switcher (clean URL, snippet renders,
switcher gated at 1 site), the r27 toast (`Settings saved` driven),
the r29 Select portal (all 4 options `data-[disabled]:` before
`focus:`), the R32 blog article footer (byte-identical), the R33
footer tags (H4×3, navCount 0, bare divs — verified on `/` and
`/privacy` both sites), both R33 copy regimes (docs swaps to the green
check under the DENIED agent-browser clipboard; install stays "Copy"
under denial), and the console sweep (20 routes at the HTTP layer —
200/307/404 as designed — + browser console clean).

**R33-queued candidates — all closed:**
- **Compare table mobile stacking @375 — FULL PARITY** (grid `max-w-4xl
  mx-auto grid md:grid-cols-2 gap-6`, byte-identical card classes,
  both stack at 327 px). The LIVE ships a 6 px horizontal overflow at
  375 (docW 381 > winW 375) that the CLONE does not — a live quirk,
  documented as a non-finding.
- **FAQ multi-open persistence — FULL PARITY (single-open):** open Q1
  → open Q2 leaves only Q2 open; re-opening Q1 closes Q2 — on BOTH
  sites (Radix `type="single" collapsible`).
- **Legal pages' in-page anchor navigation — RESOLVED:** the live's
  legal pages carry NO section ids (0 of 15 on /privacy) and no
  in-page nav exists on either side; the probe surfaced the real fact
  (R34-F2 below).
- **Activity pagination footer — still runtime-latent** (6 live
  events < the 50/page R22 pin).

**Additional never-diffed surfaces probed this round — ALL PARITY:**
visitors segment tabs (trusted clicks switch + filter; the live keeps
client state, the clone drives the URL — the documented design), blog
index (H1, 10 cards, grid + card classes byte-identical, no images),
about (body text 1968 = 1968), docs (2925 = 2925), 404 (title + copy).

## Phase B — the round's findings (documentation + coverage, zero code drift)

**R34-F1 (evidence correction):** the live DOES swap its 404 tab title.
Three probes — a direct load of `/nonexistent-page-xyz` settled 4 s,
again at 8 s, and a client-side navigation into a bogus route — all
read `document.title === "Page Not Found | Pixelco"` (the raw HTML
ships the generic marketing title; the SPA router swaps
post-hydration). This supersedes the R24-F12 ruling ("the live never
swaps — it stays 'Pixelco' forever"), which does not reproduce (a
pre-settle probe artifact — the R25 dropdown lesson again). The
clone's `NotFoundTitle` island produces the identical outcome on both
navigation modes → re-classified from "KEPT VALUE-ADD" to LIVE
PARITY. Docs only — the MutationObserver stays (still required
against Next's metadata controller) and the HTTP status stays a
correct 404.

**R34-F2 (divergence-table row):** the live's marketing-chrome hash
anchors are BARE (`#benefits`, `#pricing`, `#how-it-works` — header
nav + footer Product column, every page) and DEAD on sub-pages
(click-verified on `/privacy`: the URL gains the hash, scrollY stays
0, no navigation). The clone's `/#anchor` form (documented +
test-pinned since the early rounds) is the working behavior — the R22
Contact-Support precedent. Recorded in PAD §11 + AGENTS so future
rounds don't re-investigate.

**R34-F3 (coverage):** six new e2e regression pins for the
never-runtime-pinned surfaces — `e2e/visitors-tabs.spec.ts` (2 specs:
the URL-driven switching + active pill; the per-segment row filtering
+ reload persistence), 2 blog-index specs (the 10-card grid with the
full card/h2 class strings — including the `mb-2 leading-snug` tail
an earlier 80-char-truncated probe had hidden — and card → article
navigation), the FAQ single-open persistence spec, and the compare
@375 stacking + no-overflow spec (guarding the live's 6 px overflow
quirk OUT). One spec iteration: the blog h2 pin initially pinned the
truncated live string — re-captured untruncated, identical on both
sides (no drift; the spec was wrong, not the code).

## Phase C — gates, screenshots, docs, ship

**Gates: lint 0 · tsc 0 · vitest 742 passed | 2 skipped (75 files —
unchanged; the round's coverage lands in e2e) · build + standalone
green · 39/39 e2e chromium, run TWICE consecutively (33 + the 6 new
pins).** 5 captures `docs/screenshots/r34-*` (visitors tabs All +
Companies — the Companies capture re-taken with a TRUSTED click after
the synthetic-click artifact produced an identical image, verified by
hash + URL + row count; blog index; FAQ single-open; compare @375);
VLM-verified (All tab active + 3 rows + no breakage; Companies tab
active + 1 Acme Corp row + no breakage; text-only cards in a clean
grid; 7 questions with Q1 expanded + no breakage; vertically stacked
cards + BEST VALUE badge + no overflow). `.env.example` re-verified
(3 keys, consistent with `.env` + `db-path.ts` + `with-db-url.mjs`;
unchanged this round). Full doc sync: README (R34 bullet + totals
39), AGENTS (the R24-F12 bullet re-based + the R34 anchor fact),
CLAUDE (the 404 note + rounds mirror R34), PAD v1.32 (revision block,
the §11 anchor-divergence row, the 404 re-classification in both
historical mentions, §8.1 e2e row 11 files / 39 specs), SKILL.md
(frontmatter, gate counts, Appendix A/D rows, Quick Reference), the
R34 plan's execution log, this session log, `docs/worklog.md` + the
root `worklog.md` mirror. Committed to main; pushed via
`docs/ssh_git_wrapper_v3.py --remote
git@github.com:nordeim/pixel-identifier.git`; remote ref verified ==
local HEAD; operator key shredded after push.

## Next (R35 candidates)

Bundle hashes (a change triggers the full token-diff sweep); the six
new pins + the R34 surfaces join the standing regression loop;
remaining candidate surfaces: the trend chart's tooltip HOVER state
(runtime-only, never probed), the domains page's delete-confirm flow
at runtime (the clone's AlertDialog divergence — verify the live's
immediate delete once more), the visitors search debounce at runtime,
and the activity pagination footer (latent while the live stays under
50 events/page).

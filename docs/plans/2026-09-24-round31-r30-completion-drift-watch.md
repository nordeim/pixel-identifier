# Round 31 — R30 Completion (Install-Island Repair) + 16th-Generation Drift Watch

**Date:** 2026-09-24 · **Session:** `docs/session_35.md` (R31 log) · **Status: see Execution log.**

## Context — what happened to R30

R30's probe + plan + TDD fixes ran in the prior session (session_34.md, interrupted).
The remediation commit `40a7fa8` ("remediation round 30") shipped the four fixes'
*edits to existing files* but **missed the new files and the follow-up test
repointing** — the session died between "GREEN locally" and "stage everything":

1. **`src/components/dashboard/install-panels.tsx` was never committed.** The
   slimmed-down `install/page.tsx` (committed) imports it — so `main` at
   `0448ae2` fails `tsc` (TS2307), fails vitest, and cannot build.
2. **6 old install-page pins were never repointed.** The interrupted session
   repointed badge-consumers' 2 banner pins (committed) but the content-parity
   (5) + dashboard-empty-r22 (1) repoints never landed.
3. **`src/lib/sites.ts` + `tests/sites.test.ts` were never deleted** — the
   R30-F3 retirement of `pickSelectedSite` (the `?site=` helper).
4. **The 3 new `e2e/install.spec.ts` specs were RED when the session died** —
   each adds a second domain through the real UI, but the e2e demo account is
   FREE (1-domain cap, already used by the seed) so the add is rejected and the
   `Domain added successfully` toast never fires (session_34.md's last words).
5. R30's ship checklist never ran: no `r30-*` screenshots, no doc sync
   (README/AGENTS/CLAUDE/PAD/SKILL still at the R29 state), the R30 plan's
   execution log still a placeholder, root `worklog.md` mirror still R29.

**Verified arrival state (this session, evidence-based):**
`npm install` clean · `db:push` + `db:seed` green on the repo DB
(`<repo>/db/custom.db`, shell `DATABASE_URL` re-unified per the R29 quirk
procedure — symlinks are blocked in this sandbox, so the fix is a per-command
`DATABASE_URL="file:../db/custom.db"` override) · lint 0 · **tsc 1 error
(TS2307 install-panels)** · **vitest 706 passed | 10 failed | 2 skipped (718
counted — badge-consumers' 7 tests don't run: its describe reads the missing
island file)**. Failures: install-r30 ×4 (ENOENT island),
content-parity ×5 + dashboard-empty-r22 ×1 (pins on `page.tsx` for strings
that now live in the island), badge-consumers file-level (same ENOENT).

## The math (reconciles the interrupted session's claim)

R29 baseline 700 passed + 2 skipped (70 files) → R30 = −4 retired
(`tests/sites.test.ts` deleted with `src/lib/sites.ts`) + 23 new
(install-r30 9 · settings-r30 7 · sidebar-wrapper-r30 7) = **719 passed |
2 skipped (721 total, 73 files)** — exactly session_34's number.

## Remediation plan (TDD — the committed RED pins ARE the failing tests)

### Phase A — repair main (R30 completion)

| # | Change | Files | Turns |
|---|---|---|---|
| A1 | Reconstruct the `InstallPanels` client island: `'use client'`, `useState(sites[0].siteKey)` selection (newest-first default — the page query is `desc`), controlled `DomainSwitcher`, Quick Start card (snippet via client-side `buildSnippet` + CopyButton + verified/waiting banners), `PlatformInstructions`, How It Works, Site Key — a verbatim port of the pre-R30 page JSX (git `40a7fa8~1`), no `?site=`, no router | `src/components/dashboard/install-panels.tsx` (new) | install-r30 ×4 + badge-consumers file GREEN |
| A2 | Repoint the 6 pins whose target moved (strings unchanged, verbatim — the interrupted session's own approach) | `tests/content-parity.test.tsx` (5), `tests/dashboard-empty-r22-parity.test.tsx` (1) | 6 collateral GREEN |
| A3 | Retire the `?site=` helper with its param | delete `src/lib/sites.ts`, `tests/sites.test.ts` | −4 tests, pin "pickSelectedSite retires" GREEN |
| A4 | Gates: lint 0 · tsc 0 · vitest 719/2 skipped · `npm run build` green | — | arrival-parity restored |

### Phase B — the e2e install spec (R30's unfinished gate)

The committed spec's `addDomain` UI flow cannot cross the free 1-domain cap.
Fix per the interrupted session's own direction (insert the second site
directly) + the toasts.spec precedent (each spec owns its fixture state):

| # | Change | Files |
|---|---|---|
| B1 | Replace `addDomain` with a deterministic e2e-DB probe-site helper: `deleteMany({ domain: { startsWith: 'r30-e2e-' } })` then insert ONE probe site (unique `px_` + 16-hex key, `lastEventAt: null`, `createdAt: now` → newest-first default) for the demo user via `@prisma/client` against `<repo>/db/e2e.db` (the e2e-server's own DB, re-seeded every boot). Assertions stay as committed. | `e2e/install.spec.ts` |
| B2 | Gates: `npm run build:standalone` + `npm run test:e2e` → **28/28 chromium** (25 + the 3 install specs). | — |

### Phase C — 16th probe generation (live drift watch)

Standing protocol, unchanged: bundle hashes first (a change triggers the full
token-diff sweep) → **mobile navigation, both surfaces, both sites** (the
standing user emphasis — marketing dropdown @375px + dashboard Sheet, plus the
Tailwind v4 bug watch) → standing surfaces (chart r28, toast r27, POPULAR r26,
NTW, install copy swap + **the new R30 wrapper + switcher + clean-URL swap**,
topbar/visitors, Select r29 loop) → route console sweep. New findings get
R31-Fn IDs and TDD remediation.

### Phase D — verify, document, ship

- Screenshots `r31-*` under `docs/screenshots/` (dev server; desktop + mobile
  nav + the repaired install page), VLM-verified per convention.
- `.env.example` re-verified against the codebase (3 keys).
- Docs sync for BOTH rounds: README R30+R31 bullets + totals, AGENTS facts,
  CLAUDE mirror, PAD v1.29, SKILL.md rows/counts, R30 plan execution log
  (completion note), this plan's execution log, `docs/session_35.md`,
  `docs/worklog.md` + root `worklog.md` mirror.
- Conventional Commit(s) to main only; push via `docs/ssh_git_wrapper_v3.py`
  with `--remote git@github.com:nordeim/pixel-identifier.git` (the wrapper's
  DEFAULT_REMOTE is a different repo); verify remote ref == HEAD; shred the
  operator key.

## Execution log

**Phase A — main repaired (all RED pins → GREEN).**
- A1: reconstructed `src/components/dashboard/install-panels.tsx` from
  the committed evidence set: the R30 pins (`'use client'`, `useState`,
  `buildSnippet`, `PlatformInstructions`, `sites.length > 1`), the
  badge-consumers banner strings, the repointed content-parity strings,
  the page's prop shape, and the pre-R30 page JSX (git `40a7fa8~1`,
  verbatim — header+switcher, Quick Start, platform tabs, How It Works,
  Site Key) with `useState(sites[0].siteKey)` (newest-first default)
  and the find-fallback defense.
- A2: repointed the 6 pins (content-parity ×5, dashboard-empty-r22 ×1)
  — strings unchanged, verbatim.
- A3: `git rm src/lib/sites.ts tests/sites.test.ts`.
- A4 gates: lint 0 · tsc 0 · **vitest 719 passed | 2 skipped (72
  files, 721 total)** — exactly the interrupted session's number (−4
  retired + 23 new from the R29 baseline of 700) · `next build` green.

**Phase B — the install e2e gate.**
- B1: replaced the UI `addDomain` (blocked by the free 1-domain cap)
  with `seedProbeSite` — a direct `@prisma/client` insert into the
  e2e-server's own `db/e2e.db` (valid `px_`+16-hex key, `lastEventAt:
  null`, `createdAt: now` → newest). One real defect found in the first
  design: probe sites LEAKING past the spec broke later specs +
  reused servers (pipeline reads the Install snippet's key and
  host-matches its beacon against demo-store; dashboard asserts the
  seeded domain visible; with a probe newest-selected, demo-store is
  invisible and the beacon key mismatches) → made the fixture
  HERMETIC: `cleanProbeSites` in BOTH `beforeAll`/`afterAll` +
  per-test family clean in `seedProbeSite`.
- B2 gates: `build:standalone` ✓ · **28/28 e2e chromium** — verified
  across two consecutive runs (the second reusing the first's server:
  the reuse-hygiene case that originally failed 26/28 now passes
  clean).

**Phase C — 16th probe generation (live, 2026-09-24).**
- Bundle hashes: all three tracked hashes unchanged (6th consecutive
  stable generation) → no token-diff sweep.
- Mobile navs (standing emphasis): marketing dropdown @375 — toggle
  `md:hidden text-foreground` + `lucide-menu w-6 h-6`, container
  `md:hidden bg-background border-b border-border px-6 py-4 flex
  flex-col gap-4` byte-identical, 4 links + CTA, close-on-VISIBLE-link
  click (the R25 lesson re-applied after one hidden-anchor false
  alarm) + icon reset; live scroll 7424 / clone 7404 (the documented
  20 px D5 delta). Dashboard Sheet @375 — inline
  `--sidebar-width: 18rem; pointer-events: auto;` + 288 px + 7 links
  BOTH sides; closes on cross-page nav BOTH sides. TW4 watch: no
  anomalies.
- R30 fixes runtime-verified vs fresh live captures: wrapper class +
  inline vars byte-identical (live vs clone at 1280×900); the live's
  settings inputs confirmed BARE (no type/name/id/ac/maxLength — the
  clone matches modulo the D-class); the live's install switcher
  confirmed pure client state (URL stays `/dashboard/install` through a
  swap) with newest-first default (its 2 options, newest selected).
- Chart r28 loop: 17 ticks + identical label set (Sep 20 + 22 hidden)
  + Y-domain 0–4 both sides — byte-identical.
- Console sweep: 19 routes, 0 errors.
- **No new drift.**

**Phase D — verify/docs/ship.**
- 6 screenshots `docs/screenshots/r31-*` (install switcher + open
  state, dashboard overview, marketing hero, mobile dropdown, mobile
  Sheet); VLM-verified (renders correct; 7 links; 2 newest-first
  options); the throwaway probe site cleaned from the dev DB after
  capture.
- `.env.example` re-verified (3 keys, consistent with `.env` +
  `db-path.ts` + `with-db-url.mjs`).
- Docs synced: README (R30+R31 bullets, header totals 719/28), AGENTS
  (R30+R31 facts), CLAUDE (rounds 11–31 mirror), PAD v1.29 (revision
  block, §8.1 totals, e2e row), SKILL.md (frontmatter, Appendix A/D
  rows, final gates, Quick Reference), R30 plan execution log
  (completion note), this log, `docs/session_35.md`, `docs/worklog.md`
  + root `worklog.md` mirror.
- Shipped as a Conventional Commit on main via
  `docs/ssh_git_wrapper_v3.py` (`--remote
  git@github.com:nordeim/pixel-identifier.git`); remote ref verified ==
  local HEAD; operator key shredded after push.

# Update docs to align with current codebase

## Goal
Ensure `README.md`, `AGENTS.md`, `CLAUDE.md`, and `Project_Architecture_Document.md` accurately describe the current codebase after fixes (`PixelcoMarketingWordmark`, vitest `testTimeout: 30000` + WAL `busy_timeout`, working `.env`, `187 tests` / `28 route entries` build). No `docs/session_*.md`/`docs/worklog.md` edits (record files).

## Tasks
- [ ] **T1: Audit README vs codebase** — check `README.md:15` Tests badge, `Verification` build route count (`34 routes`), `Testing` suite description, `Quick Start` env steps. Compare against `npm run verify` output (25 active +1 skipped =26 files, 187 passed, 28 route entries, `db/test.db` WAL) and current `.env` existence.
  → Verify: `rg -n "187|34 routes|test\.db" README.md` + `npm run build | rg "Route "` + `ls tests/*.test.ts | wc -l`.

- [ ] **T2: Audit AGENTS.md vs codebase** — check `Commands`, `Non-obvious facts` (Tailwind, Typography, `/pixel.js`, NextAuth, Quota, Activity, Visitors subtitle, Annual prices, `db/test.db` + `TZ=UTC`, `any` ban). New code adds `PixelcoMarketingWordmark` (`src/components/pixelco-logo.tsx:62`) and test infra `testTimeout:30000` + `PRAGMA busy_timeout/WAL` (`tests/setup.ts`). Note if AGENTS needs a line about the 30s timeout / WAL (single-writer note already says `fileParallelism off`).
  → Verify: `rg -n "testTimeout|busy_timeout|PixelcoMarketingWordmark" AGENTS.md` (expect 0 — decide if addition needed).

- [ ] **T3: Audit CLAUDE.md vs codebase** — check `Core Identity`, `Project-Specific Principles` (activity v1.6, quota, annual prices, visitors subtitle), `Testing Strategy` (Vitest node env, `fileParallelism false`, `TZ=UTC`, `node:vm` collector), `Environment Variables` table. Same new infra as T2.
  → Verify: `rg -n "187|testTimeout|PixelcoMarketingWordmark" CLAUDE.md`.

- [ ] **T4: Audit PAD v1.6 vs codebase** — check header `v1.6`, revision block `[SR] 187 tests across 25 files, build 35 routes`, §8 `Test Distribution` (25 files, 35 routes, `fileParallelism false`), §5.2 color tokens (`--primary #FFC105`), §12 `Key Files Reference` line counts (`pixelco-logo.tsx`, `vitest.config.mts`). Current `vitest.config.mts` has `testTimeout 30000` not in PAD, `tests/setup.ts` WAL pragma not in PAD, actual build shows `28 route entries` (10 SSG blog slugs counted as 1 entry) vs `35 routes`.
  → Verify: `rg -n "187|35 routes|fileParallelism" Project_Architecture_Document.md` + `wc -l src/components/pixelco-logo.tsx`.

- [ ] **T5: Decide doc delta (minimal surgical edits only)** — produce a delta table: per doc, `no change` or `1-line fix`. Expected deltas (to confirm in audit):
  - README: likely `no change` (187 correct; keep `34 routes` as approx. or update to `28 entries + 10 SSG slugs` if strictly accurate).
  - AGENTS/CLAUDE: add one bullet under `Tests run against db/test.db` noting `testTimeout 30s + WAL/busy_timeout for quota Prove-It (110 concurrent)` only if deemed non-obvious.
  - PAD: update §8 `testTimeout` line and §8/§12 route count footnote only if out-of-date; otherwise `no change`.
  → Verify: delta table has 4 rows, each justified with file:line.

- [ ] **T6: Apply approved edits** — edit only the docs flagged in T5, one atomic commit `docs: align README/AGENTS/CLAUDE/PAD with current test infra and build output`. No session/worklog touches. Keep Conventional Commit style.
  → Verify: `git diff --stat` shows only `README.md`/`AGENTS.md`/`CLAUDE.md`/`Project_Architecture_Document.md` (max 4 files), `npm run verify` still green after edits (docs don't affect build, but gate proves no accidental code change).

## Done When
- [ ] All 4 docs audited with `rg` evidence, delta table filled
- [ ] Only docs with actual misalignment are edited, surgically (≤2 lines per doc)
- [ ] `npm run verify` still green; `.env` still valid; `git status` shows no code changes
- [ ] If no misalignment, report `no change needed` with evidence and skip T6

## Notes
- Prefer `no change` if doc is already accurate within tolerance (e.g., `35 routes` vs `28 entries` is counting SSG slugs differently — not a misalignment).
- Do not edit `docs/session_*.md`, `docs/worklog.md`, `docs/plans/*` (record/plan files).
- Keep `any` ban, `no console.log`, Tailwind CSS-first, `ActionResult` envelope — already aligned.

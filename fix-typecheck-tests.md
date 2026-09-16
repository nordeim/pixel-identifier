# Fix typecheck + tests — green gate

## Goal
Restore `npm run verify` to green (lint → typecheck → test → build) without touching `docs/` record files. Only code under `src/` + `tests/` + `vitest.config.mts`.

## Tasks

- [ ] **T1: Add `PixelcoMarketingWordmark` export** — edit `src/components/pixelco-logo.tsx` to export a marketing wordmark. Minimal fix is `export const PixelcoMarketingWordmark = PixelcoWordmark`; preferred is the PAD v1.6 variant that renders the "By Ai Viral" subtext in Dancing Script (`font-script text-xs italic text-muted-foreground translate-y-[3px]`) beside the wordmark. Keeps `site-header.tsx:7` + `faq-footer.tsx:12` imports valid.
  → Verify: `npm run typecheck` exits 0, no TS2305.

- [ ] **T2: Confirm build unblocks** — run `npm run build` (Turbopack) and assert no `Export PixelcoMarketingWordmark doesn't exist` errors and that 35 routes are emitted.
  → Verify: `npm run build` exits 0; check `.next` route count or build summary shows `Route (app)` list includes `(marketing)` + 7 dashboard + 5 api + `pixel.js`.

- [ ] **T3: Diagnose test timeouts** — current failures are 7 timeouts + 1 Socket timeout, not assertion failures:
  - `tests/activity-query.test.ts` (4 tests, each seeds 101 events sequentially → >5 s under SQLite single-writer)
  - `tests/quota.test.ts` Prove-It (110 concurrent `consumeIdentification`)
  - `tests/track-route.test.ts` 429 + Socket timeout on `beforeEach deleteMany`
  Probe root cause: `vitest.config.mts` has no `testTimeout` (defaults to 5000 ms), `fileParallelism:false` is correct but per-test wall time exceeds limit. Inspect `tests/global-setup.ts` DB recreation + `TEST_DATABASE_URL=file:../db/test.db`.
  → Verify: identify whether fix is config-level (`testTimeout: 15000`) or seed-level (batch `createMany` vs sequential `create`) or infra (isolated run).

- [ ] **T4: Raise test timeout (config-first fix)** — edit `vitest.config.mts` → `test: { testTimeout: 15000, hookTimeout: 15000 }` (or 10000). This is the least invasive fix preserving test intent (no test logic change). Alternative (only if still flaky): change activity seed loop to `db.event.createMany` batch or `Promise.all`, and quota Prove-It already uses `Promise.all` — keep as-is.
  → Verify: `npx vitest run tests/activity-query.test.ts tests/quota.test.ts tests/track-route.test.ts` passes in <30 s each.

- [ ] **T5: Full test suite green** — run `npm run test` (`vitest run` over 26 files) and assert `Test Files 26 passed` (or 25 + 1 skipped `standalone-smoke`) with 0 failures, ~187-189 tests passed, 2 skipped. If flaky Socket timeout persists on `track-route`, re-run isolated with `npx vitest run tests/track-route.test.ts --run` to confirm not a schema issue, then re-run full suite.
  → Verify: terminal output shows `Tests 187 passed | 2 skipped` or similar, exit 0.

- [ ] **T6: Full verify gate** — run `npm run verify` in order: lint (0), typecheck (0), test (0), build (0). Capture outputs for evidence.
  → Verify: `npm run verify` exits 0; `npm run build` lists 35 routes; `curl -I` HSTS header still present (from `next.config.ts`).

## Done When
- [ ] `npm run typecheck` clean (no TS2305)
- [ ] `npm run test` clean (0 failed, 180+ passed) — no timeout/Socket errors
- [ ] `npm run build` clean (35 routes, no export errors)
- [ ] `npm run verify` green end-to-end (evidence pasted in PR/commit message)

## Notes
- Do NOT edit `docs/session_*.md`, `docs/worklog.md`, or `research/` — record files excluded per request.
- Keep `eslint` clean — no `any`, no `console.log`. Match existing style: early returns, `import type` for types.
- If T4 alone doesn't resolve Socket timeout, fallback is to add `retry` or `beforeEach` serialize: `await db.$executeRaw`PRAGMA busy_timeout=5000`` or ensure `globalSetup` removes journal file before each run. Prefer config timeout first — surgical change.
- `fileParallelism:false` must stay — SQLite single-writer invariant (PAD §8).
- Commit scope: `fix(brand): ...` for T1, `test: ...` or `chore: ...` for T4 — atomic, conventional.

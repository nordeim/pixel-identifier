# Validation Alignment Plan — Deep Doc vs Codebase Check

**Date:** 2026-09-16
**Goal:** Verify that AGENTS.md / CLAUDE.md / README.md / PAD v1.6 / session_5.md / worklog.md / round7 plan describe the *actual* codebase, and confirm true project status before any further change.
**Baseline assumed by docs:** PAD v1.6 = 187 tests / 25 files / 35 routes / `npm run verify` green at alleged round-7-complete. Must prove or refute by direct codebase inspection.

## Phase 1 — Documentation cross-consistency (no code yet)

- [ ] **T1: Reconcile doc family** — diff claims across AGENTS.md, CLAUDE.md, README.md, PAD §1/§10/§11, docs/worklog.md, docs/session_5.md, docs/plans/2026-09-16-round7-parity-refinement.md for contradictions (stack versions, test counts, route counts, quota semantics, activity semantics, pricing tables, typography tokens).
  → Verify: table of contradictions (or "none") with line refs `DOC:line`.

- [ ] **T2: Session_5 & worklog integrity** — check `docs/session_5.md` (currently 113 lines of LLM prompt echo, not a session narrative — `git show HEAD:docs/session_5.md` vs working tree) and `docs/worklog.md` (39 lines, only Task 1-2) against round7 plan's Execution Log (commits 2999176, 4fcf954 etc.) and `git log --oneline` (only "Add files via upload" — no conventional commits).
  → Verify: flag corruption/truncation + decide whether to restore from git history or rewrite.

- [ ] **T3: Git & research evidence audit** — `git status` currently shows massive unstaged deletions (`D skills/...`, `D docs/skills-inventory.md`); `research/` has `round5-audit`/`round6-audit` but no `round7-audit` despite plan citing `research/round7-audit/`.
  → Verify: list missing/staged artifacts; confirm whether repo is in a squashed-upload state vs PAD's incremental commit history.

## Phase 2 — Codebase invariant validation (the "easy to get wrong" list)

Each AGENTS.md non-obvious fact becomes one probe:

- [ ] **T4: Tailwind 4 CSS-first** — assert no `tailwind.config.js`, and `src/app/globals.css` contains `@theme inline` with literal hexes `--primary: #FFC105` (+ marketing re-scope `#FFBF00`), plus brand utilities `.gradient-primary`, `.glow-primary`, `.text-gradient-primary`, `.text-gradient-hero`, `neon-green`. `rg "var\(--"` inside `@theme` should be empty.
  → Verify: `fd tailwind.config.js` → 0 hits; `rg "@theme inline" src/app/globals.css`.

- [ ] **T5: Typography live-parity** — `globals.css` exposes `font-display` (Space Grotesk) for card titles/H1s/KPIs/prices/sidebar wordmark, body Inter, marketing DM Sans. No component hand-rolls amber/teal approximations.
  → Verify: `rg "font-display" src/app/globals.css` + spot-check 3 components still use semantic tokens.

- [ ] **T6: /pixel.js is a route** — `src/app/pixel.js/route.ts` exists and serves collector; `public/pixel.js` must not exist.
  → Verify: `fd pixel.js` + `ls public/`.

- [ ] **T7: NextAuth v4 boundaries** — `getServerSession` from `next-auth`, `signIn`/`signOut` only from `next-auth/react`, `src/types/next-auth.d.ts` augments `session.user.id`, `src/app/dashboard/layout.tsx` is UX-only guard.
  → Verify: `rg "from 'next-auth'"` vs `rg "from 'next-auth/react'"`.

- [ ] **T8: Quota single-owner** — only `src/lib/quota.ts` writes `identificationsUsed`; `rg "identificationsUsed"` shows single writer. Confirm conditional UPDATE (free hard-stop, paid overage unconditional) + 30-day persisted reset guarded on stale anchor.
  → Verify: `rg "identificationsUsed"` + read `quota.ts` (81 lines per PAD).

- [ ] **T9: Activity row identity semantics (v1.6)** — `listActivity` in `src/lib/analytics.ts` keys `email` off `event.name === 'identification'`; pageview rows return `anonymousId.slice(0,12)+'...'` (truncated, never email). Check `tests/activity-query.test.ts` pins this.
  → Verify: `rg "listActivity" src/lib/analytics.ts -n` + run that single test file.

- [ ] **T10: Visitors subtitle is server-rendered (v1.5)** — `src/app/dashboard/layout.tsx` fetches `getVisitorSegmentCounts` and passes to Topbar; `PAGE_META` subtitles contain no `{` braces. Format never singularizes ("1 companies").
  → Verify: `rg "getVisitorSegmentCounts" src/app/dashboard/layout.tsx` + `rg "\{individuals"`.

- [ ] **T11: Annual price tables (v1.5)** — `src/lib/plans.ts` carries both `annualMonthlyPrice` (dashboard $65/$199/$639) and `marketingAnnualMonthlyCents` (marketing floored $63/$199/$639); no component computes annual inline.
  → Verify: `rg "annualMonthlyPrice|marketingAnnualMonthlyCents" src/lib/plans.ts` + `rg "annual.*0\.8|*12.*0\.8" src/components`.

- [ ] **T12: Money/quotas are integers, Zod envelope, fixed routes, etc.** — `ActionResult<T>` envelope in `src/lib/validation.ts`, whitelist of route handlers, ingest minimal keys `k,u,p,r,v`, hostname gate before write, `listVisitors` identified-only scope + `isVisitorActive` 30-min window (not `visitors.status`).
  → Verify: `rg "ActionResult" src/lib/validation.ts` + `fd src/app/api` + schema check.

## Phase 3 — Structural & schema validation

- [ ] **T13: File hierarchy vs PAD §12** — compare PAD's Key Files Reference (line counts + purposes) against actual `wc -l` and `fd` results: `prisma/schema.prisma` (~95 lines, 4 models + uniques/indexes), `src/lib/plans.ts` (~132), `src/lib/identification.ts` (~136), marketing route group, dashboard 7 pages, etc.
  → Verify: generate `fd` tree + `wc -l` table; flag drift.

- [ ] **T14: DB & env** — `DATABASE_URL` relative-path semantics (resolves against `prisma/`), `output: "standalone"` requires absolute path, `NEXTAUTH_SECRET` required, no `.env` committed, `.gitignore` rejects `*.key`.
  → Verify: `cat .env.example`, `cat prisma/schema.prisma | rg provider`, `cat next.config.ts | rg output`, `git ls-files | rg "\.env|\.key"`.

## Phase 4 — Verification gate (the Iron Law)

- [ ] **T15: Full gate fresh** — run `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` **in order** (or `npm run verify`), capture outputs. PAD claims lint clean, typecheck clean, **187 tests across 25 files**, build 35 routes. Current `tests/` has 26 files — explain delta (opt-in smoke?).
  → Verify: terminal logs show 0 lint errors, 0 type errors, `Test Files 25 passed` (or current), `Routes: 35`. No weakening of gates to pass.

- [ ] **T16: Targeted behavioural proofs** — run the VM-executed collector + snippet tests (`tests/collector-script.test.ts`, `tests/snippet.test.ts`) and the quota Prove-It (`tests/quota.test.ts` 110 concurrent) to confirm "generated JS is executed, never string-pinned".
  → Verify: `vitest run tests/collector-script.test.ts tests/snippet.test.ts tests/quota.test.ts` green.

- [ ] **T17: Build-standalone smoke (opt-in)** — `PIXELCO_STANDALONE_SMOKE=1 npx vitest run tests/standalone-smoke.test.ts` boots `server.js` and asserts `_next/static` chunk 200 (guards the #1 production footgun from PAD §9.1).
  → Verify: chunk URL returns 200.

## Phase 5 — Content & SEO data seams

- [ ] **T18: Marketing link map & blog catalogue** — `src/lib/marketing-links.ts` (every link targets real route; Careers flagged `dead: true`) + `src/data/blog-posts.ts` (10 posts, unique slug, date order) + `src/app/robots.ts`/`sitemap.ts` (16 URLs, `/api/` disallowed, absolute URLs). Re-run their unit tests.
  → Verify: `vitest run tests/marketing-links.test.ts tests/blog-posts.test.ts tests/seo-routes.test.ts`.

- [ ] **T19: Design system & dashboard chrome** — `src/lib/dashboard-nav.ts` (NAV_SECTIONS, PAGE_META, visitorsSubtitle, hasUnreadActivity 7-day rule, nextSidebarState reducer) — 16 tests.
  → Verify: `vitest run tests/dashboard-chrome.test.ts` green + spot-check brand tokens in `globals.css`.

## Phase 6 — Project status confirmation

- [ ] **T20: Status matrix vs README & PAD §11** — build a verified status table: Marketing ✅, Content ✅, Tracking ✅, Identity ✅, Dashboard ✅, Billing 🟡 simulated, Tests ✅/explain, plus open items (CSP MEDIUM, per-instance rate limiting MEDIUM, Playwright E2E LOW, email transport deliberate divergence, NextAuth v4 maintenance-mode).
  → Verify: each row cites a code seam or gate output, not doc assertion alone.

- [ ] **T21: Honest divergences vs gaps** — re-confirm documented divergences (pricing FAQ ~20% vs Fingerprint Pro, dead Careers link parity, OAuth disabled, snippet self-hosted URL) are intentional and labelled; everything else is a gap requiring a plan.
  → Verify: list with "keep" vs "fix" disposition.

## Done When
- [ ] Every AGENTS.md non-obvious fact has a file/line or test citation (Phases 2-3).
- [ ] Fresh `npm run verify` output is in hand and matches (or explicitly corrects) PAD v1.6's numbers.
- [ ] Doc-family contradictions, session_5 corruption, worklog truncation, and git-history squashing are explicitly dispositioned.
- [ ] A single "Alignment Report" is written (`docs/plans/2026-09-16-validation-alignment-report.md`) with pass/fail per check, evidence paths, and a corrected project status — no claim without log output.

## Notes
- Do not weaken a failing gate; fix the code.
- `TZ=UTC`, SQLite single writer (`fileParallelism: false`) — re-read `tests/global-setup.ts` / `tests/setup.ts` before touching tests.
- `research/round7-audit/` absence and `skills/` deletions are themselves findings — do not `git add` blindly; verify intent first.
- This plan is read-only until user approves; the next step is execution via the same checklist, with one commit per phase and a browser pass on affected flows.

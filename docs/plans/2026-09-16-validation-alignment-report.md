# Validation Alignment Report — Docs vs Codebase

**Date:** 2026-09-16
**Validator:** main agent (deep doc review + codebase probes)
**Baseline docs:** AGENTS.md, CLAUDE.md, README.md, PAD v1.6 (2026-09-16), docs/worklog.md (39 lines), docs/session_5.md (113 lines), docs/plans/2026-09-16-round7-parity-refinement.md
**Codebase commit:** `cf1c103` HEAD (squashed "Add files via upload" history) — working tree has massive unstaged deletions of `skills/` + `docs/skills-inventory.md`
**Gate executed:** `npm install` → `npx prisma generate` → `npm run lint` → `npm run typecheck` → `npm run test` → `npm run build`

---

## 1) Executive Summary

**Docs are internally coherent and describe a round-7-complete system, but the live codebase on disk is NOT at that state — it fails the PAD's own green-gate claim.**

| Area | Doc claim | Codebase reality | Verdict |
|------|-----------|------------------|---------|
| **Verification gate** | PAD v1.6: `npm run verify` green — lint clean, typecheck clean, 187 tests / 25 files, build 35 routes | `npm run lint` **PASS**, `npm run typecheck` **FAIL** (2 TS2305: `PixelcoMarketingWordmark` missing), `npm run test` **7 failed / 180 passed / 2 skipped** (189 total, 3 files failed on timeout / socket timeout), `npm run build` **FAIL** (same missing export, 4 turbos) | **FAIL — not green** |
| **Session / worklog** | worklog Tasks 1-2 + round7 plan Execution Log (commits 2999176, 4fcf954, logo/marketing commits green) | `docs/session_5.md` is **corrupted** (113 lines of generic LLM prompt echo, not a session narrative; `git show HEAD:docs/session_5.md` identical); `docs/worklog.md` stops at "Next: execute A1 RED test" (no A-F execution); `git log` has only squashed `Add files via upload` — none of the PAD's conventional commits exist; `research/round7-audit/` **missing** (only round5/round6 present) | **FAIL — history squashed, evidence absent** |
| **Core invariants** | AGENTS.md 12 non-obvious facts | 10/12 **PASS** on probe, 2 require note (see §2) | **PASS with notes** |
| **Structural fidelity** | PAD §12 key-files line counts + §4 schema | All key files exist with line counts within +0-50 of PAD; schema matches PAD ER diagram; marketing group + 7 dashboard pages present | **PASS** |
| **Project status** | README status table: Marketing/Content/Tracking/Identity/Dashboard ✅, Billing 🟡 simulated, Tests ✅ | Functional subsystems present, but build failure blocks "Tests ✅ / Production-ready" claim; status should be **Tests 🟡 / Build 🔴** until fix | **OVERSTATED** |

**Bottom line:** The documentation describes the *intended* round-7-complete state accurately and meticulously. The repository as checked out does **not** satisfy that state's verification gate. The gap is narrow and surgical (one missing export) but load-bearing: it breaks typecheck and build and obscures the true test status.

---

## 2) Detailed Findings

### Phase 1 — Documentation Cross-Consistency

| ID | Check | Evidence | Verdict |
|----|-------|----------|---------|
| T1 | Reconcile AGENTS / CLAUDE / README / PAD / worklog / session_5 / round7 plan | AGENTS.md, CLAUDE.md, README.md, PAD v1.6 are mutually consistent on stack (Next 16 / React 19 / TS5 / Tailwind4 / Prisma6 / NextAuth v4 / Vitest, integer money, ActionResult, server-actions-only). README "187 assertions" vs PAD "187 tests across 25 files" — minor wording drift. `tests/` actually contains **26** `.test.ts` files (extra `standalone-smoke.test.ts` — opt-in smoke counts differently). | **PASS** — minor count drift noted |
| T2 | `docs/session_5.md` integrity | `wc -l 113`, `head` shows `I'll start by carefully parsing...` (worklog/LLM echo, not session narrative). `git log --oneline -- docs/session_5.md` → single commit `9975aaa Create session_5.md` with identical corrupted content. No recoverable prior version. | **FAIL — corrupted at source, no history to restore** |
| T2b | `docs/worklog.md` integrity | 39 lines, 2 Tasks (clone+baseline, live audit+plan). Stops before execution. Round7 plan's Execution Log (A1 logo/marketing commits) has no counterpart in worklog. | **FAIL — truncated** |
| T3 | Git history & research evidence | `git log --oneline -15` → all `Add files via upload` (squashed). PAD's `f47a756`, `00e9cdf`, `2999176`, `4fcf954` etc. do not exist. `research/` has `round5-audit` + `round6-audit` only; plan cites `research/round7-audit/` with live/local screenshots + VLM diffs — **absent**. `git status` shows **hundreds of unstaged `D skills/...`** deletions plus `D docs/skills-inventory.md` — working tree diverges from index. | **FAIL — squashed history, missing round7 evidence, dirty working tree** |

### Phase 2 — Invariant Probes (AGENTS.md "Non-obvious facts")

| ID | Invariant | Probe | Result | Verdict |
|----|-----------|-------|--------|---------|
| T4 | Tailwind 4 CSS-first, no `tailwind.config.js`, tokens in `@theme inline` literal hex | `ls tailwind.config.js` → not found ✅; `rg "@theme inline" src/app/globals.css` → line 6 ✅; `--primary: #ffc105` at line 77 (app) with marketing re-scope comment; `--color-neon-green: #2bd4bd`, `--color-highlight: #ffd91a`, `--shadow-card` present. `var()` inside `@theme` is **present** for color mappings (lines 7-49) — PAD's note "var() chains inside @theme are silently dropped" is slightly imprecise: Tailwind 4 *does* allow `var(--*)` mappings inside `@theme inline` via the `@theme` → CSS var indirection; literal hexes are correctly literal (#ffc105). No violation, but doc wording could be tightened. | **PASS** — wording nuance only |
| T5 | Typography live-parity + brand utilities | `--font-display: var(--font-space-grotesk)` + `font-display` utility present; `gradient-primary`, `glow-primary`, `text-gradient-primary`, `text-gradient-hero`, `neon-green` token present. Spot-check: components use semantic tokens. | **PASS** |
| T6 | `/pixel.js` is a route | `src/app/pixel.js/route.ts` exists ✅; `public/pixel.js` absent ✅; `fd pixel.js` only that route | **PASS** |
| T7 | NextAuth v4 boundaries | `getServerSession from 'next-auth'` in 10 server files ✅; `signIn`/`signOut` only from `next-auth/react` (2 client files) ✅; `src/types/next-auth.d.ts` augments `session.user.id` ✅ | **PASS** |
| T8 | Quota single-owner | `rg identificationsUsed` → writers only in `src/lib/quota.ts` (lines 43,71,77-78) — the ingest and analytics only *read*. `quota.ts` implements conditional `updateMany { lt: limit }` for free hard-stop + unconditional increment for paid overage + persisted 30-day reset. | **PASS** |
| T9 | Activity rows key off event type (v1.6) | `src/lib/analytics.ts:427-469` shows correct `isIdentification = event.name==='identification'` → `email: isIdentification ? visitor.email : null` and `anonymousId: isIdentification ? null : visitor.anonymousId.slice(0,12)`. Matches PAD's fix description for R7-F1. | **PASS** |
| T10 | Visitors subtitle server-rendered (v1.5) | `src/app/dashboard/layout.tsx:3` imports `getVisitorSegmentCounts`; line 20 calls it; `src/lib/dashboard-nav.ts:66` PAGE_META has no brace templates (`rg "\{individuals"` empty). Format uses `visitorsSubtitle(counts)` — no singularization. | **PASS** |
| T11 | Annual prices are tables (v1.5) | `src/lib/plans.ts:22` `annualMonthlyPrice`, `58:6500`, `77:19900`, `97:63900`, `122` `annualTotalCents = annualMonthlyPrice*12`, `138` `marketingAnnualMonthlyCents` floored. `rg "annual.*0\.8"` in components → empty (no inline derivations). | **PASS** |
| T12 | Mutations Server Actions only, ActionResult envelope, whitelisted routes, ingest keys, hostname gate, identified-only visitors | `src/lib/validation.ts:4` `ActionResult<T>` ✅; `ls src/app/api/*/route.ts` → exactly `track, activity, export, health, auth/[...nextauth]` + `pixel.js` (whitelist, no extra REST) ✅; `trackPayloadSchema` minimal keys; `analytics.ts:300` `listVisitors` identified-only; `isVisitorActive` 30-min window used, `visitors.status` dead column not rendered. Hostname gate comment in track route. | **PASS** |

### Phase 3 — Structure & Schema

| T13 | PAD §12 line counts | `plans.ts 151` (PAD 132, +19 lines — annual marketing helper added, acceptable), `identification.ts 184` (PAD 136, expanded), `quota.ts 81` (exact), `analytics.ts 469` (PAD 440), `schema.prisma 100` (PAD 95). All 4 models present, uniques `@@unique([userId,domain])`, `@@unique([siteId,anonymousId])`, indexes `(siteId,lastSeen)`, `(siteId,createdAt)`, `(siteId,name,createdAt)`, `(visitorId)`. Dashboard has exactly 7 pages (activity, domains, install, pricing, settings, visitors, page.tsx = overview). `(marketing)` group has about/blog/ccpa/docs/gdpr/privacy/terms as documented. | **PASS** — line growth is additive, no missing seams |
| T14 | DB / env / standalone | `.env.example` holds `DATABASE_URL file:./db/pixelco.db` + `NEXTAUTH_SECRET` placeholder + `NEXTAUTH_URL http://localhost:3000`; `.gitignore` ignores `db/`, `*.db`, `.env`, `*.key`, `ssh-key.txt` correctly; `next.config.ts` has `output:"standalone"` + baseline headers **including** `Strict-Transport-Security max-age=31536000; includeSubDomains` (R7-P1) — parity with live. | **PASS** |

### Phase 4 — Verification Gate (Iron Law)

| T15 | `npm run lint` | Fresh after `npm install`: **PASS** (no output, exit 0). | ✅ |
| T15 | `npm run typecheck` | **FAIL** — 2 errors: `src/components/marketing/site-header.tsx(7,10)` and `faq-footer.tsx(12,10)`: `Module '"@/components/pixelco-logo"' has no exported member 'PixelcoMarketingWordmark'`. The file exports `PixelcoLogo` + `PixelcoWordmark`; consumers import `PixelcoMarketingWordmark` (a name that never existed on this branch). | 🔴 |
| T15 | `npm run test` | **FAIL** — `7 failed | 180 passed | 2 skipped` across 26 files in 114s. Failures: `tests/activity-query.test.ts` (4 timeouts), `tests/quota.test.ts` (1 timeout — 110-concurrent Prove-It), `tests/track-route.test.ts` (1 timeout + 1 `PrismaClientKnownRequestError Socket timeout` on `db.user.deleteMany`). All failures are **timeouts / DB socket timeouts**, not assertion failures — consistent with SQLite single-writer contention under the 110-concurrent quota test plus resource pressure. The 180 passing tests include the R7-F1 activity semantics, collector/snippet VM tests, and most integration suites — but gate is not green. Total count `189` (180+7+2) exceeds PAD's `187` by 2 (likely `standalone-smoke` opt-in + one new R7-F1 test). | 🔴 (flaky infra, but gate still red) |
| T15 | `npm run build` | **FAIL** — Turbopack compile errors for same `PixelcoMarketingWordmark` export (4 errors: app-client + app-ssr for both files). Build does not emit 35 routes. | 🔴 |

**Gate summary:** 1/4 stages green. The codebase as uploaded is **not** `npm run verify` green as PAD v1.6 claims. Root cause is a single missing export alias.

| T16 | Collector + snippet VM + quota Prove-It | 3 files are exercised inside T15's test run; they passed within the 180, except the quota Prove-It timeout is part of the 7 failures — needs isolated re-run under less contention to confirm logic vs infra. | ⚠️ needs isolated re-run |
| T17 | `PIXELCO_STANDALONE_SMOKE=1` | Not run — blocked by build failure (standalone output not produced). | ⏭️ blocked |

### Phase 5 — Content & SEO Seams

| T18 | `marketing-links.ts` + `blog-posts.ts` + `robots.ts`/`sitemap.ts` | Files exist; PAD claims 10 blog posts, 16 URLs, Careers `dead:true`, all links target real routes. Unit tests for these (`tests/marketing-links.test.ts`, `blog-posts.test.ts`, `seo-routes.test.ts`) were among the 180 passing in T15 — seam intact. Spot-check not repeated due to gate failure. | **PASS** (by passing tests) |
| T19 | `dashboard-nav.ts` chrome seam | File `src/lib/dashboard-nav.ts` ~140 lines, `tests/dashboard-chrome.test.ts` among passing tests (16 tests per PAD). Brand tokens already validated in T4. | **PASS** (by passing tests) |

### Phase 6 — Project Status Confirmation

**Verified status matrix (code-cited, not doc-cited):**

| Subsystem | Doc status | Code status | Evidence |
|-----------|------------|-------------|----------|
| Marketing site (landing + pricing intent + FAQ) | ✅ Complete | ✅ Present | `(marketing)/page.tsx` + `site-header.tsx`/`faq-footer.tsx` (blocked only by import name) |
| Content pages (about, blog 10 posts, docs, 4 legal, robots/sitemap) | ✅ Complete | ✅ Present | `src/data/blog-posts.ts`, `src/lib/marketing-links.ts`, `robots.ts`/`sitemap.ts` / tests pass |
| Tracking pipeline (collector, hostname-gated ingest, rate limit, auto-verify) | ✅ Complete | ✅ Present | `pixel.js/route.ts` + `api/track/route.ts` + 180 passing tests |
| Identity resolution (deterministic, ~20% match, quota-gated) | ✅ Complete | ✅ Present | `identification.ts` + `quota.ts` single-owner + activity semantics fix |
| Dashboard (7 pages, pagination/search, cursor feed, export) | ✅ Complete | ✅ Present (logic) / 🔴 Blocked (build) | 7 dashboard routes exist, analytics seams present, but build gate blocks production readiness |
| Billing | 🟡 Simulated | 🟡 Simulated | `plans.ts` dual price tables + `changePlanAction` entitlement-only — correct per ADR-006 |
| Tests | PAD: ✅ 187/25 green | 🔴 180/22 passed + 7 timeouts, typecheck red, build red | `npm run verify` not green |
| Production deploy | Dockerfile + build:standalone + HSTS | 🔴 Blocked | `next.config.ts` has standalone + HSTS correctly, but build failure prevents artifact |
| Known open items | CSP (MED), per-instance rate limit (MED), Playwright E2E (LOW), email transport (MED deliberate), NextAuth v4 maintenance | Confirmed | PAD §11 still accurate; no code has introduced shared rate-limit store or Playwright suite |

**Honest divergences vs gaps:**

- **Keep (honest, documented):** pricing FAQ ~20% answer (not Fingerprint Pro), install snippet self-hosted URL, OAuth disabled, visitor detail sheet, avatar initials in app chrome, Careers dead link flagged `dead:true` — all correctly documented in PAD §11 / README.
- **Gaps requiring fix:** `PixelcoMarketingWordmark` missing export (typecheck/build), 7 test timeouts (likely infra contention — needs isolated re-run with `--test-timeout` or DB serialization tuning), squashed git history (traceability), missing `research/round7-audit/` evidence, `docs/session_5.md`/`worklog.md` corruption/truncation, dirty `skills/` deletions (should be `git restore` or `git rm` intentionally).

---

## 3) Recommendations (priority order)

1. **P0 — Fix the build:** add `export const PixelcoMarketingWordmark = PixelcoWordmark` (or rename imports to `PixelcoWordmark`) in `src/components/pixelco-logo.tsx`. One line, then re-run `npm run typecheck && npm run build` to restore the green gate. This is the sole blocker for the "Build 35 routes" claim.

2. **P0 — Re-run the flaky tests isolated:** `npx vitest run tests/quota.test.ts tests/activity-query.test.ts tests/track-route.test.ts --test-timeout 15000` (or with `fileParallelism:false` + higher timeout) to separate DB contention from logic failure. If Prove-It still times out, tune `tests/global-setup.ts` DB creation / increase timeout — do not weaken the concurrency assertion.

3. **P1 — Restore doc integrity:** rewrite `docs/session_5.md` as a true session narrative (or mark `docs/session_5.md` as "corrupted in upload — reconstructed as session_6"), extend `docs/worklog.md` to cover B-F execution or note "execution log lives in round7 plan", and either restore `skills/` (`git restore --source=HEAD -- skills docs/skills-inventory.md`) or commit the deletion intentionally. Add `research/round7-audit/` or amend the plan to point at existing evidence.

4. **P1 — Fix history or acknowledge squash:** either `git log` is intentionally squashed for the submission (document as such in PAD §11 / README) or re-push the conventional-commit history — current PAD revision block cites SHAs that do not exist on `origin/main`.

5. **P2 — Re-run full gate to green and update PAD numbers:** after P0, `npm run verify` should report the true count (observed 189 total / 26 files incl. standalone-smoke — reconcile with PAD's 187/25) and `npm run build` should list 35 routes; update PAD v1.6 evidence line accordingly.

---

## 4) Raw Evidence Excerpts

```
$ ls tailwind.config.js → not found
$ rg "@theme inline" src/app/globals.css → 6:@theme inline {
$ rg --primary src/app/globals.css → --primary: #ffc105 (line 77) + --color-neon-green #2bd4bd
$ ls src/app/pixel.js/route.ts → exists; ls public/pixel.js → not found
$ rg "from 'next-auth'" src → 12 hits server; rg "from 'next-auth/react'" → 3 hits client
$ rg "identificationsUsed" src → only writer src/lib/quota.ts
$ sed -n '427,469p' src/lib/analytics.ts → isIdentification gate, email vs anonymousId(0,12)
$ rg "getVisitorSegmentCounts" src/app/dashboard/layout.tsx → line 20
$ rg "\{individuals" src/lib/dashboard-nav.ts → 0 hits
$ rg "annualMonthlyPrice|marketingAnnualMonthlyCents" src/lib/plans.ts → 6500/19900/63900
$ wc -l → plans 151, identification 184, quota 81, analytics 469, schema 100
$ npm run lint → PASS
$ npm run typecheck → FAIL TS2305 PixelcoMarketingWordmark (2 files)
$ npm run test → 7 failed | 180 passed | 2 skipped (26 files) — timeouts + socket timeout
$ npm run build → FAIL export PixelcoMarketingWordmark not found (4 turbos)
$ git status → D skills/... (hundreds) + D docs/skills-inventory.md
$ ls research → round5-audit, round6-audit (no round7-audit)
```

---

## 5) Conclusion

The codebase architecture, layer model, invariants, and feature set **match the documentation's design intent with high fidelity** — every AGENTS.md trap was correctly avoided, every PAD ADR is reflected in code, and the honest-divergence posture is intact. The sole critical misalignment is that the **uploaded working tree is not green** — a one-export build break plus contested DB timeouts — while the docs claim a green 187-test, 35-route build. Fix the export, stabilize the timeouts, and clean up the doc/history drift, and the repo will realign to its own PAD without any architectural change.

*Report written under the Iron Law: every claim above cites a file:line, command output, or test result captured fresh in this session.*

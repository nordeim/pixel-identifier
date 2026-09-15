# Pixelco Clone — Parity & Remediation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use the `tdd` skill (red → green → refactor) to implement this plan task-by-task. Every behavioral change starts with a failing test that reproduces the bug or specifies the new behavior. Commit after each green task.

**Goal:** Fix all audited defects (1×P0, 5×P1, ~20×P2/P3), close the functional-parity gaps with pixelco.io, and install a Vitest test suite — TDD throughout — then realign the four root documents.

**Architecture:** Next.js 16 App Router (RSC + server actions), Prisma/SQLite, NextAuth v4 JWT sessions. Mutations return `ActionResult<T>`. New quota logic is centralized in `src/lib/quota.ts` (atomic conditional writes) and reused by ingest, dashboard reads and plan switching. New test seams: pure lib functions (unit), `listVisitors`/`listActivity` query helpers (integration), route handlers invoked directly with `Request` objects (integration).

**Tech Stack:** Vitest (node env, `file`-based SQLite test DB via `DATABASE_URL` env override, TZ pinned to UTC), Prisma `db push` for test-schema sync, `node:vm` for collector-script behavioral tests.

**Audit source:** Full-codebase audit (2026-09-15) of HEAD `78f8342`; every P0/P1 finding re-validated verbatim against source before this plan was written.

**Severity scale** (code-review-and-audit skill): P0 Critical → fix first; P1 High → same release; P2 Medium → this release; P3 Low → opportunistically.

---

## Workstream 0 — Test infrastructure (TDD foundation)

### Task 0.1: Install Vitest + config + scripts
- `bun add -d vitest`
- Create `vitest.config.ts`: node environment, `resolve.alias: { '@': ./src' }`, `test.env: { DATABASE_URL: 'file:<repo>/db/test.db', TZ: 'UTC' }`, `test.fileParallelism: false` (SQLite single-writer), `globalSetup: tests/global-setup.ts`, `setupFiles: tests/setup.ts`, include `src/**/*.test.ts` + `tests/**/*.test.ts`.
- `tests/global-setup.ts`: delete stale `db/test.db`, run `prisma db push --skip-generate` with the test `DATABASE_URL`.
- `tests/setup.ts`: `vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))`, `vi.mock('next/navigation', () => ({ redirect: vi.fn((url: string) => { throw new Error('REDIRECT:' + url) }) }))`, `vi.mock('next/headers', () => ({ headers: vi.fn(async () => new Headers()) }))`.
- package.json scripts: `"test": "vitest run"`, `"test:watch": "vitest"`, extend `"verify": "npm run lint && npm run typecheck && npm run test && npm run build"`.
- Add `db/test.db` to `.gitignore`.
- Smoke test `tests/smoke.test.ts` asserting `@/lib/plans` imports and `PLANS.free.identificationLimit === 100`. Run — green — **commit** (`test: wire up vitest harness`).

## Workstream 1 — P0/P1 correctness & quota integrity

### Task 1.1 (P0, F-01): collector `replaceState` infinite recursion
- **RED** `tests/collector-script.test.ts`: import the collector script string; run it in `node:vm` with mocked `document` (currentScript with src/data-site), `history` (pushState/replaceState spies), `location`, `localStorage`, `navigator`, `window`, `fetch`. Assert: original `replaceState` is invoked exactly once per wrapped call (recursion today → stack overflow → test fails), and a route change fires a beacon.
- **GREEN** `src/app/pixel.js/route.ts`: hoist `var replace = history.replaceState;` next to `push` **before** assigning the wrapper; call `replace.apply(...)`.
- Run suite — **commit** (`fix(collector): capture replaceState before monkey-patching`).

### Task 1.2 (P1, F-02 + F-03): centralized, atomic quota consumption
- Create `src/lib/quota.ts` (server-only):
  - `resetMonthlyWindowIfNeeded(user: {id, plan, identificationsUsed, usagePeriodStart}): Promise<{ used: number; periodStart: Date }>` — persists the 30-day reset (updateMany guarded on stale `usagePeriodStart`), returns effective values.
  - `consumeIdentification(userId, plan: Plan, used: number): Promise<boolean>` — **free/lifetime**: atomic conditional increment `updateMany({ where: { id, identificationsUsed: { lt: limit } }, data: { identificationsUsed: { increment: 1 } } })` → `count === 1`; **paid/monthly**: unconditional increment (overage is counted, see Task 1.4).
- **RED** `tests/quota.test.ts`: (a) free user at `used === limit` → `false`, DB counter unchanged; (b) free user below limit → `true`, counter +1; (c) fire `limit + 10` **concurrent** consumptions → exactly `limit` succeed (Prove-It for the race); (d) monthly user with `usagePeriodStart` 31 days old → reset persists (`identificationsUsed === 0`, anchor ≈ now).
- **GREEN**: wire `/api/track` + `getUsage` to the new lib (getUsage now persists the reset — fixes display/DB divergence).
- **commit** (`fix(quota): atomic conditional increment + unified monthly reset`).

### Task 1.3 (P1, F-17): plan switch must not reset the counter
- **RED** `tests/plan-switch.test.ts` (mock session): user on free with `identificationsUsed = 40` → `changePlanAction` to growth → counter stays 40, `usagePeriodStart` advances, plan/billingCycle updated; downgrade to a plan whose `domainLimit` < current site count → `VALIDATION` failure.
- **GREEN** `src/actions/settings.ts`: drop `identificationsUsed: 0` branch; add domain-count guard (fetch `db.site.count`).
- **commit** (`fix(plan): carry usage across plan switches; block impossible downgrades`).

### Task 1.4 (P1, F-22): implement paid-plan overage (counting + display)
- **RED** extend `tests/quota.test.ts` + a track-route integration test: paid user already at limit → beacon still identifies the visitor; `used` grows past `limit`; free user at limit → no identification. `getUsage` returns `overage = max(0, used - limit)` and `overageCostCents = overage * plan.overagePrice`.
- **GREEN**: track route uses `consumeIdentification` (paid → always true); `UsageInfo` gains `overage`, `overageCostCents`; sidebar usage card + plan panel render "N extra identifications this period (≈ $X)" when `overage > 0`; monthly reset clears it naturally.
- **commit** (`feat(quota): paid overage accounting — identification continues past the limit`).

### Task 1.5 (P1, F-23): install page serves every domain
- **RED** `tests/install-page.test.ts`: pure helper `pickSelectedSite(sites, siteKeyParam | null)` → returns matching site, else first by createdAt.
- **GREEN** `src/app/dashboard/install/page.tsx`: `findMany` (orderBy createdAt asc); `searchParams.site` selects; domain switcher (Select → `?site=` links) above the snippet; "Add a domain first" empty state preserved; per-domain snippet + status.
- Also: Domains page row action "Install pixel →" linking `/dashboard/install?site=<key>`.
- **commit** (`feat(install): per-domain snippet with site switcher`).

## Workstream 2 — Security hardening

### Task 2.1 (P2, F-13): gate ingestion on hostname match
- **RED** `tests/track-route.test.ts` (integration; POST via `new Request`): beacon with `u` hostname ≠ registered domain → 204, **no visitor/event rows**; matching hostname (incl. `www.` and subdomain) → visitor + event created; unknown site key → 204 without rows.
- **GREEN** `/api/track`: after site lookup, `if (!pageHostname || !matchesDomain(pageHostname, site.domain))` → 204 (before any write). Auto-verify logic unchanged.
- **commit** (`fix(track): reject beacons from unregistered hostnames`).

### Task 2.2 (P2, F-15): sanitize forwarded host / harden snippet
- **RED** `tests/snippet.test.ts`: `collectorUrlFromHeaders("evil.com/';alert(1);//")` → falls back to a safe host; valid hosts pass through; `buildSnippet` with a hostile URL cannot break out of the `'…'` JS string (assert escaped or rejected).
- **GREEN** `src/lib/snippet.ts`: host regex `^[A-Za-z0-9.\-]+(:\d{1,5})?$` (else `localhost:3000`); escape `'` and `\` in interpolated values; validate `siteKey` against `^px_[0-9a-f]{16}$`.
- **commit** (`fix(snippet): validate forwarded host, escape interpolations`).

### Task 2.3 (P2, F-05 + F-14 + F-06 + F-28): signup robustness + plan intent
- **RED** `tests/signup.test.ts`: (a) duplicate email → `CONFLICT` ActionResult (not a thrown P2002); (b) 6th signup from one IP within the window → `RATE_LIMITED`; (c) signup with `plan=growth&cycle=annual` → user created on that plan.
- **GREEN** `src/actions/auth.ts`: catch `PrismaClientKnownRequestError.code === 'P2002'` → `fail('CONFLICT', …)`; per-IP fixed-window limiter (5 / 10 min, via `headers()`); optional validated `plan`/`cycle` form fields applied at create.
- `src/components/auth/signup-form.tsx`: reset `pending` on every terminal path; pass plan/cycle hidden fields when present in the URL. `src/app/login/page.tsx`: read `?registered=1` → "Account created — sign in" notice.
- **commit** (`fix(auth): P2002 conflict handling, per-IP signup throttle, plan intent`).

### Task 2.4 (P2, F-12): account deletion ends the session
- **RED** `tests/delete-account.test.ts`: action (mocked session) deletes user + cascades and returns `ok` (no redirect); email mismatch → `VALIDATION` error result.
- **GREEN** `src/actions/settings.ts`: `deleteAccountAction` → `ActionResult<{ deleted: true }>` (no redirect). `settings-panel.tsx` danger zone → `useActionState`; on `ok` → `await signOut({ callbackUrl: '/?deleted=1' })`. Landing page reads `?deleted=1` → confirmation banner (RSC `searchParams`).
- **commit** (`fix(auth): revoke session on account deletion + deleted banner`).

## Workstream 3 — Functional parity with pixelco.io

### Task 3.1 (P2, F-24): visitors — server-side search/filter/pagination + accurate counts
- **RED** `tests/visitors-query.test.ts`: new `listVisitors(userId, { q, type, minConfidence, source, page, pageSize })` in `src/lib/analytics.ts` — seed 60 visitors (mixed identified/anonymous/companies) → page 1 = 25 rows + `total` 60; `q` matches email substring case-insensitively; `type=company` filters; counts (`all/individual/company`) come from `count()` queries, not loaded rows.
- **GREEN** `src/app/dashboard/visitors/page.tsx`: read `searchParams` (`q`, `type`, `page`); counts + rows from `listVisitors`; pagination footer (prev/next, "Page N of M"); search input + tabs become URL-driven (client component pushes params). Table keeps detail sheet.
- **commit** (`feat(visitors): server-side search, filters, pagination, true counts`).

### Task 3.2 (P2, F-31b): visitor selection → "Export Selected"
- Selection state in `visitors-table.tsx` (rows + select-all); "Export Selected (N)" button → `/api/export?ids=<comma>`; `src/app/api/export/route.ts` accepts `ids` (validated, ownership-scoped, cap 500). Remove decorative-only semantics.
- **RED** `tests/export-route.test.ts`: `ids` limited to the session user's visitors; BOM present; formula-injection guard prefixes `'` on cells starting `=+-@` (extend `csvCell` — unit test in `tests/format.test.ts` first).
- **commit** (`feat(visitors): real selection + scoped CSV export of selected`).

### Task 3.3 (P2, F-25): activity — shared query + "Load more"
- **RED** `tests/activity-query.test.ts`: `listActivity(userId, { take, cursor })` returns rows + `nextCursor`; 100 seeded events → 60 then 40.
- **GREEN**: `src/lib/analytics.ts` gains `listActivity`; `/api/activity` route and activity page both use it; feed gains "Load more" (cursor append). Polling pauses on `document.hidden` (F-32).
- **commit** (`feat(activity): cursor pagination + shared query + visibility-aware polling`).

### Task 3.4 (P2, F-26 + F-27): destructive-action confirm + route boundaries
- `domains-panel.tsx`: delete wrapped in `AlertDialog` (danger styling, domain name echoed); action converted to `ActionResult` + `useActionState`.
- Add `src/app/dashboard/loading.tsx` (skeleton grid), `src/app/dashboard/error.tsx` ('use client', reset button), `src/app/not-found.tsx`.
- Browser-verified; **commit** (`feat(dashboard): delete confirmations and loading/error boundaries`).

### Task 3.5 (P2, F-29 + F-10 + F-11/F-21): misc parity & honesty
- Install page copy: "This status will update automatically" → "refresh this page to see the latest status".
- `activeDomains` KPI: count `status === 'verified'` (subtitle keeps "N verified"; pending shown as "N pending" when > 0) — matched against the reference dashboard screenshots.
- `/api/track` 429 `Retry-After: 60` (F-10).
- Data minimization: drop `t`/`w`/`h` from `trackPayloadSchema` and stop sending them in the collector (Zod strips them from older pixels).
- **RED first** where behavioral: schema still parses legacy payloads (unknown keys stripped); KPI via `getOverviewStats` integration test with one pending + one verified site.
- **commit** (`fix(parity): honest KPI counts, retry-after, payload minimization`).

## Workstream 4 — Data layer & performance

### Task 4.1 (P2, F-18 + F-19 + F-36b): indexes and `_count`
- `prisma/schema.prisma`: `Event @@index([visitorId])`; `bun run db:push` (additive).
- `listDomainsAction` uses `_count: { select: { visitors: true } }`; `domains/page.tsx` consumes the action instead of its own query (dedupe); row shows "N visitors".
- **RED** `tests/domains.test.ts`: action returns `visitorCount` from `_count` (seed 3 visitors → 3) and never selects visitor rows.
- **commit** (`perf(db): events.visitorId index + _count domain stats`).

### Task 4.2 (P2, F-08): ingest error containment
- `/api/track`: wrap the DB section in try/catch → `console.error` + 204 (beacon contract: never surface errors to the customer page).
- **RED**: integration test asserting the 204 contract when a write throws (mock `db.visitor.upsert` rejection via `vi.spyOn`), not 500.
- **commit** (`fix(track): never 500 on beacon ingest`).

### Task 4.3 (P3, F-09 + F-20): query hygiene + seed idempotency
- `getRecentIdentifications`: filter `visitor: { email: { not: null } }` in the `where`, `take` last.
- `prisma/seed.ts`: site-graph block becomes resumable (missing-site → create full graph; present → skip); local-DB guard prefers `startsWith('file:')`.
- **commit** (`fix(seed): resumable idempotency; recent-ids query filter`).

## Workstream 5 — UI/UX & accessibility polish

### Task 5.1 (P2, F-07 + P3 F-31a/F-33/F-34)
- `domains-panel.tsx`: toasts fire from `useEffect` keyed on action state change (not `onSubmit`).
- `topbar.tsx`: remove the fake red notification dot (bell stays, honest empty state).
- `topbar.tsx` / `login` / `signup`: raw `<a>` → `next/link`.
- `use-toast.ts`: `TOAST_REMOVE_DELAY = 5_000`.
- **commit** (`polish(ui): toast timing, honest bell, Link consistency`).

### Task 5.2 (P3, F-32): tabs keyboard pattern
- `visitors-table.tsx` tab strip: roving `tabIndex` + ArrowLeft/ArrowRight selection (WAI-ARIA tabs pattern).
- **commit** (`polish(a11y): keyboard-navigable visitor tabs`).

## Workstream 6 — Code quality

### Task 6.1 (P2, F-35 + F-36): dead code & duplication
- `requireUser` becomes the real guard: redirect-to-login semantics; all 7 dashboard pages + layout use it (removes boilerplate); `DashUser` stays.
- Remove dead `fieldErrors` state in `login-form.tsx` (domains dedupe already done in 4.1).
- **commit** (`refactor: single session guard, remove dead state`).

### Task 6.2 (P3, F-37): money math & Zod modernization
- **RED** `tests/plans.test.ts`: new `annualTotalCents(plan)` (rounded); `formatPrice` float-cent robustness; `effectiveMonthlyPrice` rounding.
- **GREEN** `src/lib/plans.ts` gains `annualTotalCents`; `pricing-section.tsx` + `plan-panel.tsx` use it; "Save 20%" labels derive from `annualDiscount`.
- `validation.ts`: `z.string().email()` → `z.email()`; `error.flatten().fieldErrors` → `z.flattenError(...)` with honest types (drop `as` casts).
- **commit** (`refactor(money): rounded annual totals, data-driven badges, zod4 APIs`).

## Workstream 7 — Documentation realignment

### Task 7.1: update the four root documents + README
- **README.md**: Testing section (`npm test`), updated scripts table + status (tests 🟢), overage behavior, multi-domain install, visitors pagination + export-selected, signup plan intent, `/api/export?ids`, ingest hostname gating.
- **AGENTS.md**: commands gain `test`/`test:watch`; conventions gain `src/lib/quota.ts` as the only place quota is mutated.
- **CLAUDE.md**: testing strategy is now real (seams: pure libs, quota lib, route handlers, query helpers; TZ pinned; SQLite `contains` is ASCII-case-insensitive gotcha).
- **PAD.md**: §4.3 quota atomicity (now true — conditional `updateMany`), §4.3/§8 overage accounting, §11 known issues refresh (NextAuth v4×Next16 risk stays, overshoot fixed, hostname gating added, in-memory limiters), §6.1/§6.4 corrections, ER diagram (`Event.visitorId` index), version table softened to ranges, ADR-008 (quota & overage design).
- **commit** (`docs: realign README/AGENTS/CLAUDE/PAD with remediated codebase`).

## Final gate (before push)

1. `bun run lint && bun run typecheck && bun run test && bun run build` — all green.
2. Fresh-clone simulation: `db:push` + `db:seed` on a clean DB; `next start` smoke (routes 200, beacon ingest 204, quota/overage live-check).
3. Browser E2E on the repo dev server: signup → add 2 domains → install snippets (switcher) → beacon burst (matching hostnames) → visitors pagination/search/export-selected → activity load-more → plan switch (counter preserved) → overage on paid plan → delete account (signed out + banner) → zero console errors.
4. Secret scan (`rg` for keys/tokens) → stage → commit → push via SSH wrapper with `--remote git@github.com:nordeim/pixel-identifier.git`.

## Validation record (plan ↔ codebase)

| Finding | Validated at | Verdict |
|---|---|---|
| F-01 replaceState recursion | `pixel.js/route.ts:83-94` read verbatim | Confirmed — `replace` resolved inside wrapper |
| F-02 quota race | `track/route.ts:95/172/195` read verbatim | Confirmed — no transaction/conditional write |
| F-03 display-only reset | `analytics.ts:36-41` read verbatim | Confirmed |
| F-04 TZ bucket mismatch | `analytics.ts:91-112` read verbatim | Confirmed (fix folded into analytics tests) |
| F-09 take-before-filter | `analytics.ts:162-166` read verbatim | Confirmed |
| F-12 delete leaves JWT | `settings.ts:102-121` read verbatim | Confirmed |
| F-13 ungated ingest | `track/route.ts:104-122` read verbatim | Confirmed |
| F-15 host interpolation | `snippet.ts:11-17`, `install/page.tsx:31-34` | Confirmed |
| F-17 plan-switch reset | `settings.ts:87-95` read verbatim | Confirmed |
| F-22 overage promised | `plans.ts:20-21` + audit quote of `plan-panel.tsx:32` | Confirmed |
| F-23 first-domain-only | `install/page.tsx:25-29` read verbatim | Confirmed |
| Test infra absent | `package.json` read verbatim — no test script/deps | Confirmed |

**F-04 timezone note:** trend bucketing will be covered by a pinned-TZ regression test (`TZ=UTC` default; one test sets `TZ=Asia/Singapore` and asserts bucket keys stay UTC-aligned). Implementation: compute the window start from UTC midnight and bucket by UTC date keys — deterministic in every deployment timezone.

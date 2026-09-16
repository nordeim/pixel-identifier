---
IMPORTANT: File is read fresh for every conversation. Be brief and practical.
---

# Pixelco

## Core Identity & Purpose

Pixelco is a self-hostable, cookieless **visitor email identification SaaS**:
one script snippet on a customer site feeds a tracking pipeline that resolves
anonymous visitors to real email addresses (B2C individuals and B2B contacts)
and surfaces them in a real-time dashboard. The repo contains the marketing
site, auth, dashboard, tracking pipeline, identity-resolution engine, and a
simulated billing layer. Maintained by the repository owner; architecture
reference: `Project_Architecture_Document.md` (PAD).

Key decisions that shape all work here: Next.js 16 App Router with
RSC-by-default, Server-Actions-only mutations behind an `ActionResult`
envelope, Prisma + SQLite, NextAuth v4 credentials with JWT sessions, and a
deterministic (simulated) identity resolver that must stay quota-accounted
and stable per visitor.

## Foundational Principles

### Meticulous Approach (Six-Phase Workflow)

1. **ANALYZE** — Read the affected files fully before changing them. Identify
   explicit requirements, implicit needs, and ambiguities. For this codebase:
   check whether a change touches the ingest path, quota accounting, or the
   resolver — those have invariants (see Project-Specific Standards).
2. **PLAN** — Sequence the work: schema → libs → actions → routes → UI.
   Present the plan when the change spans more than one layer.
3. **VALIDATE** — Confirm scope before implementing anything data-affecting
   (schema changes, resolver changes, plan/limit changes).
4. **IMPLEMENT** — Small, testable units; one responsibility per file;
   server components for data, client islands for interactivity.
5. **VERIFY** — `npm run verify` (lint → typecheck → test → build) plus a
   browser pass on the affected flow. Evidence or it didn't happen.
6. **DELIVER** — Conventional Commit, updated docs when behavior or setup
   changes, honest notes on what was and wasn't verified.

### Project-Specific Principles

- **Ingest is sacred:** `/api/track` must stay fast, permissively-CORS'd
  (beacons are cross-origin), Zod-validated, and rate-limited.
- **Activity rows key identity off the event type (v1.6):** `listActivity`
  returns the email only for identification events — pageview rows always
  carry the truncated anonymous id, so identification never rewrites
  pageview history.
- **Determinism of identity:** resolution decisions derive from
  `sha256(siteKey + anonymousId)` — changing resolver constants is a
  data-affecting migration, not a refactor.
- **Honesty over simulation:** billing and identity resolution are
  simulations and are labelled as such in docs and UI copy. Never present
  simulated behavior as production capability.
- **Quotas are integer accounting:** `src/lib/quota.ts` is the only module
  that writes `identificationsUsed` — a single conditional UPDATE (free
  plans hard-stop at the limit; paid monthly plans increment unconditionally
  and count overage). The 30-day reset persists and is guarded on the stale
  anchor. Plan semantics live in `src/lib/plans.ts`.
- **Annual prices are per-surface tables, not derivations (v1.5):** the live
  dashboard hardcodes $65/$199/$639 annual monthly prices while the live
  marketing floors the 20%-off display ($63/$199/$639). `plans.ts` owns
  both (`annualMonthlyPrice`, `marketingAnnualMonthlyCents`); components
  never compute prices inline. **The marketing pricing section defaults
  to annual** behind an iOS-style switch (v1.9) — the floored table
  renders first, and the Free card's $0 carries no "/mo" suffix.
- **The visitors topbar subtitle is server-rendered (v1.5):** the layout
  fetches `getVisitorSegmentCounts` into the Topbar. `PAGE_META` subtitles
  must never be brace templates (pinned by a chrome test), and the count
  line never singularizes — the live renders "1 companies".

## Implementation Standards

### General Coding Practices

- Early returns; no deep nesting.
- Composition over inheritance; small pure functions.
- Self-documenting names; comments explain *why*, never *what*.
- No dead code, no placeholder values, no speculative abstractions.

### Language & Framework Guidelines

**TypeScript (strict)** — `any` is an ESLint error; use `unknown` and narrow.
`import type` for type-only imports. Interfaces for object shapes; types for
unions.

**Next.js 16 App Router** — React Server Components by default; add
`'use client'` only for interactive leaves. `async` `params`/`searchParams`/
`cookies()`/`headers()` must be awaited. Dashboard pages export
`const dynamic = 'force-dynamic'` (session-scoped data). Metadata via
`export const metadata`.

**Tailwind CSS 4 (CSS-first)** — no `tailwind.config.js`. Tokens are literal
hex in `@theme inline` (`src/app/globals.css`); `var()` chains inside
`@theme` are dropped by the build. The live ships TWO palettes (v1.9): the
app bundle renders the global `:root` tokens; the marketing tree renders
the `.marketing-scope` class applied on the `(marketing)` layout wrapper
(white canvas, warm-white cards, cool borders, yellow `#FFBF00` accent,
10px radius base). Use semantic tokens (`bg-card`,
`text-muted-foreground`, `bg-secondary`, `bg-accent`), not raw hexes in
components — both palettes resolve through the same utilities.

**Typography (v1.4, live-parity):** the app body is **Inter**; **Space
Grotesk** is the display face — apply the `font-display` utility to card
titles, page H1s, KPI values, prices and the sidebar wordmark; the
marketing tree renders **DM Sans**; `font-mono` stays a mono stack for
code/paths. Brand utilities live in `globals.css`, not per-component
approximations: `.gradient-primary` (135deg #FFC105→#FFB200), `.glow-primary`,
`.text-gradient-primary`, `.text-gradient-hero` and the `neon-green` color
token (`bg-neon-green/10`-style utilities) — use them instead of hand-rolled
amber/teal approximations.

**Server Actions** — every mutation returns `ActionResult<T>`
(`{ ok: true, data } | { ok: false, error: { code, message, fieldErrors? } }`).
Validate with Zod at the boundary; catch once; never throw across the action
boundary. Revalidate the narrowest path after writes.

**Prisma** — one client via `src/lib/db.ts`. Schema edits → `npm run db:push`.
Snake_case tables via `@@map`, camelCase TS fields. No list-typed primitives.

## Development Workflow

### Environment Setup

```bash
npm install
cp .env.example .env   # set NEXTAUTH_SECRET: openssl rand -base64 32
npm run db:push        # create SQLite schema + generate client
npm run db:seed        # optional: demo@pixelco.local / Demo123456!
npm run dev
```

### Build Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server (port 3000) |
| `npm run build` | Production build (standalone output) |
| `npm run build:standalone` | Build + copy `.next/static` (+ `public/`) into `.next/standalone` — **always** use this for standalone deploys; raw `next build` omits static assets |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint 9 flat config |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest suite (watch: `npm run test:watch`); opt-in standalone smoke: `PIXELCO_STANDALONE_SMOKE=1` |
| `npm run verify` | lint → typecheck → test → build (pre-push gate) |
| `npm run db:push` | Sync Prisma schema to the database |
| `npm run db:seed` | Idempotent demo seed |

## Testing Strategy

### Test Pyramid

Vitest (node env) against a throwaway SQLite DB (`db/test.db`, recreated by
`tests/global-setup.ts` via `prisma db push` on every run; `fileParallelism`
is off — SQLite is a single writer; `testTimeout`/`hookTimeout` is 30 s and
`tests/setup.ts` raises `PRAGMA busy_timeout=10000` + `WAL` for the quota
Prove-It). `TZ` is pinned to UTC.

- **Unit (pure libs):** plan/money math (`plans.ts`), domain normalisation,
  snippet hardening, CSV escaping + formula-injection guard, relative time,
  and the dashboard chrome seam (`src/lib/dashboard-nav.ts` — sidebar
  sections/icons, per-page subtitles, visitors subtitle formatting, the
  7-day unread rule behind the bell dot, sidebar-rail state reducer).
- **Behavioural:** the collector script **and the emitted install snippet**
  are executed in `node:vm` with mocked browser globals — SPA route-change
  beacons, `pushState`/`replaceState` wiring, the monkey-patch recursion
  regression, and the snippet's must-not-throw + script-element contract
  (right `src`, right `data-site`). Rule: never pin a snippet/collector
  serialization in a string assertion when it has a behavioral contract —
  execute it. (The string-pinning style once hid a snippet that threw on
  every real customer page.)
- **Integration (DB-backed):** `src/lib/quota.ts` (atomic consumption under
  110 concurrent calls, persisted monthly reset, overage); query seams
  `listVisitors` / `listActivity` / `getTopPages` (SQL groupBy with
  deterministic tie-breaks) / `hasRecentIdentifications` in `analytics.ts`
  (search/filter/pagination/counts, cursor paging); server actions with
  mocked session/headers (plan switch, sign-up, domains, account deletion,
  profile update — the stored name is never clobbered).
- **Integration (route handlers):** `/api/track` and `/api/export` invoked
  directly with `Request` objects — hostname gating, anti-enumeration, 429
  timing, write-failure containment, scoped export.
- **Content & SEO data modules:** the marketing link map
  (`src/lib/marketing-links.ts` — every link targets a real route; Careers
  is dead on the original too and is flagged `dead: true`), the blog
  catalogue (`src/data/blog-posts.ts` — unique URL-safe slugs, date
  ordering, required fields), and `robots.ts`/`sitemap.ts` (16-URL set,
  `/api/` disallowed, app routes excluded).
- **E2E:** manual browser flows (sign-up → domain → beacon → dashboard →
  export). No Playwright suite yet.

### Test Commands

```bash
npm run test         # Vitest run (also inside npm run verify)
npm run test:watch   # watch mode
```

New behavior is test-first: reproduce the bug or specify the behavior in a
failing test, then make it green. Mock seams live in `tests/setup.ts`
(`next/cache`, `next/navigation`, `next/headers`).

### Gotchas

- SQLite `contains` is ASCII-case-insensitive — don't hand-roll lower()
  comparisons for search.
- Integration tests share one DB file per run; clean up rows you create or
  assert relatively, not absolutely, when tests might interact.

## Code Quality Standards

### Linting & Formatting

```bash
npm run lint
```

ESLint enforces: `no-explicit-any` (error), unused vars (error, `_`-prefixed
exceptions), `no-console` (warn; `warn`/`error`/`info` allowed). React
Compiler rules are active — no `setState` directly inside effects; derive
state from props or handle it in event handlers.

## Git & Version Control

### Branching Strategy

- `main` only — trunk-based, short-lived `feat/…`/`fix/…` branches via PR if
  collaboration requires them.
- Pushes to the SSH remote go through `docs/ssh_git_wrapper_v3.py` with an
  externally-supplied deploy key (runbook:
  `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`). Never commit keys.

### Commit Standards

- Conventional Commits, atomic scope: `feat(visitors): add source filter`.
- Commit messages explain *why* for non-obvious changes.

## Error Handling & Debugging

- Actions: Zod `safeParse` → typed failure with field errors; one `catch`
  per boundary; user-safe messages only (operator detail in server logs).
- Ingest (`/api/track`): malformed payloads → silent 204 (beacons must never
  break the customer's page); unknown site keys → 204 (no enumeration);
  rate-limit breach → 429 + `Retry-After`.
- Debugging the pipeline: `curl` a beacon (see README "Testing the tracking
  pipeline"), then query the DB: `sites` (status/lastEventAt), `visitors`,
  `events`. Prisma logs queries in dev.
- Dev server log: read the tail after any change; hydration/runtime errors
  surface there first.

## Communication & Documentation

- Docs live at the repo root: README (users), AGENTS.md (agent quick-start),
  this file (working agreements), PAD (architecture, ADRs).
- Update the PAD when architecture changes; update `.env.example` and README
  when setup changes. Keep simulated capabilities (billing, identity
  resolution) labelled as simulated.

## Project-Specific Standards

### Architecture

Four layers, strictly top-down:

1. **RSC pages** (`src/app/**`) — fetch via `src/lib/analytics.ts`, no
   direct fetching in client components beyond the activity poll.
2. **Server Actions** (`src/actions/*`) — the only write path.
3. **Domain libs** (`src/lib/*`) — pure where possible
   (`identification.ts`, `plans.ts`, `validation.ts`), server-only for data
   (`analytics.ts`).
4. **Route handlers** — fixed whitelist: `api/track`, `api/activity`,
   `api/export`, `api/health`, `api/auth/[...nextauth]`, `pixel.js`.

### API Design

- Ingest payload contract (camel-truncated keys): `{k, u, p, r, v}` — Zod
  schema in `validation.ts` is the single source of truth (legacy `t/w/h`
  keys are stripped). Beacons whose page hostname does not match the
  registered domain are dropped before any write.
- Public ingest responses are 204/429 only (429 carries `Retry-After: 60`).
  Authed APIs return JSON.
- The collector script (`src/app/pixel.js/route.ts`) sends beacons as
  `text/plain` JSON specifically to avoid a CORS preflight — don't switch to
  `application/json` beacons.

### Database / Data Layer

- Tables: `users`, `sites`, `visitors`, `events` (append-only ledger).
  Visitor uniqueness: `@@unique([siteId, anonymousId])`.
- Domain verification: the ingest compares the beacon's page hostname
  against the registered domain (www-insensitive, subdomain-tolerant).
- Identification quota: `users.identificationsUsed` with
  `usagePeriodStart` anchoring the 30-day monthly window (paid plans);
  lifetime for Free.

### Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | SQLite path or Postgres URL | `file:./db/pixelco.db` |
| `NEXTAUTH_SECRET` | Session signing secret (≥32 chars) | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Canonical origin (prod) | `https://pixelco.example.com` |

## Anti-Patterns to Avoid

- Adding a `tailwind.config.js` (Tailwind 4 is CSS-first here).
- Importing `signIn`/`signOut` from `'next-auth'` in server code (v4:
  client-only via `next-auth/react`).
- REST endpoints for UI mutations, or client-side global data fetching.
- Floats for money or quotas; string statuses without a shared constant.
- Incrementing `identificationsUsed` anywhere outside `src/lib/quota.ts`.
- Editing the resolver's name lists or PRNG casually — it re-shapes
  historical identification decisions.
- Weakening lint/type rules to pass the gate.
- Trusting `visitors.status` — it's a dead schema default; display state
  derives from `lastSeen` via `isVisitorActive` (30-minute window).
- Brace-template subtitles in `PAGE_META` — the visitors count line is
  server-rendered from `getVisitorSegmentCounts` (v1.5), never a template.
- Computing annual prices inline — the live's dashboard and marketing
  surfaces use different annual tables; `plans.ts` owns both (v1.5).
- String-pinning generated JS in tests (see Behavioural above) — execute it
  in `node:vm` instead.

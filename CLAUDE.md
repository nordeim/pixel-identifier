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
5. **VERIFY** — `npm run verify` (lint → typecheck → build) plus a browser
   pass on the affected flow. Evidence or it didn't happen.
6. **DELIVER** — Conventional Commit, updated docs when behavior or setup
   changes, honest notes on what was and wasn't verified.

### Project-Specific Principles

- **Ingest is sacred:** `/api/track` must stay fast, permissively-CORS'd
  (beacons are cross-origin), Zod-validated, and rate-limited.
- **Determinism of identity:** resolution decisions derive from
  `sha256(siteKey + anonymousId)` — changing resolver constants is a
  data-affecting migration, not a refactor.
- **Honesty over simulation:** billing and identity resolution are
  simulations and are labelled as such in docs and UI copy. Never present
  simulated behavior as production capability.
- **Quotas are integer accounting:** identification allowances decrement
  atomically (`increment`), lifetime vs monthly semantics live in
  `src/lib/plans.ts` and `src/lib/analytics.ts` (`getUsage`).

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
`@theme` are dropped by the build. Use semantic tokens (`bg-card`,
`text-muted-foreground`), not raw hexes in components.

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
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint 9 flat config |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run verify` | lint → typecheck → build (pre-push gate) |
| `npm run db:push` | Sync Prisma schema to the database |
| `npm run db:seed` | Idempotent demo seed |

## Testing Strategy

### Test Pyramid

- **Unit:** none yet (no test framework installed). Pure logic most worth
  testing first: `resolveIdentity` distribution, `sourceFromReferrer`,
  `normalizeDomain`, `csvCell`, plan math in `plans.ts`.
- **Integration:** ingest pipeline (`POST /api/track` → visitor/event/quota
  assertions) is the highest-value target.
- **E2E:** manual browser flows today (sign-up → domain → beacon → dashboard
  shows data). No Playwright suite yet.

### Test Commands

```bash
npm run verify   # the only automated gate: lint + typecheck + build
```

When adding tests, wire the framework (Vitest is the intended choice) into
`npm run verify` so the gate stays single-command.

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

- Ingest payload contract (camel-truncated keys): `{k, u, p, r, t, v, w, h}`
  — Zod schema in `validation.ts` is the single source of truth.
- Public ingest responses are 204/429 only. Authed APIs return JSON.
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
- Editing the resolver's name lists or PRNG casually — it re-shapes
  historical identification decisions.
- Weakening lint/type rules to pass the gate.

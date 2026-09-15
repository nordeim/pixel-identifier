# AGENTS.md

Compact operating instructions for AI coding agents working in this repo.
Everything here is easy to get wrong without reading it first.

## Commands

| Task | Command |
|------|---------|
| Install | `npm install` (or `bun install`) |
| Dev server | `npm run dev` → http://localhost:3000 |
| Lint | `npm run lint` |
| Typecheck | `npm run typecheck` |
| Tests | `npm run test` (Vitest; watch mode: `npm run test:watch`) |
| Production build | `npm run build` |
| Full gate (run before pushing) | `npm run verify` = lint → typecheck → test → build |
| Create/refresh DB | `npm run db:push` |
| Seed demo data | `npm run db:seed` (idempotent; refuses non-local DBs) |

**Order matters:** lint → typecheck → test → build. Never weaken a failing gate to
make it pass — fix the code.

**Env first:** copy `.env.example` to `.env` and set `NEXTAUTH_SECRET`
(`openssl rand -base64 32`) before `npm run dev`; auth routes fail without it.

## Non-obvious facts

- **Tailwind 4 is CSS-first.** There is no `tailwind.config.js` and there must
  never be one — tokens live in the `@theme inline` block in
  `src/app/globals.css`. Brand values are literal hex (e.g. `--primary:
  #FACC15`); `var()` chains inside `@theme` are silently dropped by the build.
- **Typography is live-parity (v1.4).** App body = **Inter**; **Space
  Grotesk** is the `font-display` utility (card titles, page H1s, KPI values,
  prices, sidebar wordmark); marketing = **DM Sans**; mono stays mono. Brand
  utilities (`.gradient-primary`, `.glow-primary`, `.text-gradient-primary`,
  `.text-gradient-hero`, `neon-green` token) live in `globals.css` — never
  hand-roll amber/teal approximations in components.
- **`/pixel.js` is a route, not a file.** The collector script is served by
  `src/app/pixel.js/route.ts` (folder named `pixel.js`). Don't add a
  `public/pixel.js`.
- **NextAuth v4, not v5.** `getServerSession` is imported from `'next-auth'`;
  `signIn`/`signOut` exist **only** in `next-auth/react` (client). Server
  actions must not import them. Session shape is augmented in
  `src/types/next-auth.d.ts` (`session.user.id` is the DB key).
- **Mutations are Server Actions only** (`src/actions/*`), each returning the
  `ActionResult<T>` envelope from `src/lib/validation.ts`. Route handlers are
  a fixed whitelist: `api/track`, `api/activity`, `api/export`, `api/health`,
  `api/auth/[...nextauth]`, `pixel.js`. Don't add REST endpoints for UI
  mutations.
- **Quota has one mutation path.** `src/lib/quota.ts` is the only module that
  writes `identificationsUsed` — consumption is a single conditional UPDATE
  (free plans hard-stop; paid monthly plans increment unconditionally and
  count overage). The 30-day reset persists and is guarded on the stale
  anchor. Never increment the counter anywhere else.
- **Tests run against `db/test.db`.** `tests/global-setup.ts` recreates it via
  `prisma db push` on every run; `TZ` is pinned to UTC. Integration tests
  invoke route handlers/actions directly with mocked `next/headers` /
  `next-auth` (see `tests/setup.ts`). Keep new behavior test-first.
- **Generated JS is executed in tests, never string-pinned.** The install
  snippet and the collector both run under `node:vm` with mocked globals; a
  serialization assertion once hid a snippet that threw on every real
  customer page. If it has a behavioral contract, execute it.
- **Auth gate is UX only.** `src/app/dashboard/layout.tsx` redirects
  unauthenticated users, but every action/route re-checks the session itself.
  Keep it that way.
- **Prisma + SQLite.** Schema in `prisma/schema.prisma`; after editing run
  `npm run db:push` (there is no migrations folder — this project uses
  push-based schema sync). `DATABASE_URL` relative paths resolve against
  `prisma/`, not the repo root. In `output: "standalone"` runtime, use
  absolute SQLite paths.
- **No `console.log`.** ESLint allows only `warn`/`error`/`info`.
- **`any` is an ESLint error.** Use `unknown` and narrow.

## Conventions

- **Marketing pages live in the `(marketing)` route group**
  (`src/app/(marketing)/…`) and inherit the shared chrome (announcement
  bar, header, footer) from its layout. Nav/footer links come only from
  `src/lib/marketing-links.ts`; blog posts only from
  `src/data/blog-posts.ts` (append a post there — index, article pages and
  sitemap pick it up automatically). Both modules are unit-tested for
  integrity; don't hand-write hrefs in components.
- Server components fetch data via `src/lib/analytics.ts` (marked
  `server-only`); `requireUser(await getServerSession(authOptions))` is the
  single session guard for dashboard pages. Interactive leaves are
  `'use client'` components under `src/components/{marketing,dashboard,auth}`.
- Money and quotas are integers (cents / counts) — never floats. Plan
  definitions and all money math (`annualTotalCents`, `formatPrice`, …) live
  only in `src/lib/plans.ts`.
- Ingest accepts only the minimal payload (`k,u,p,r,v`); beacons whose page
  hostname does not match the registered domain are dropped before any write.
- The visitor list is URL-driven: `listVisitors` in `src/lib/analytics.ts` is
  the single query seam (search/filters/pagination/counts). It lists
  **identified visitors only** (email non-null), matching the live product;
  the active/inactive badge derives from `lastSeen` via `isVisitorActive`
  (30-minute window) — `visitors.status` is a dead column, never render it.
- The identity-resolution engine (`src/lib/identification.ts`) is
  deterministic: decisions derive from `sha256(siteKey + anonymousId)`. If you
  change name lists or the PRNG, historical decisions change — treat that as
  a data-affecting migration.
- Commit style: Conventional Commits, atomic scope (`feat(visitors): …`).
  Main branch only; no feature branches in this repo.

## Git push (SSH deploy key)

Pushes use `docs/ssh_git_wrapper_v3.py` with an externally-supplied deploy key
(see `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`):

```bash
cat /secure/key | python3 docs/ssh_git_wrapper_v3.py --key-stdin \
  --remote git@github.com:nordeim/pixel-identifier.git
```

Never commit keys; `.gitignore` rejects `*.key` and `ssh-key.txt`. Run the
verification gate before pushing.

## Known quirks

- OAuth buttons (Google/Apple) on the auth pages are intentionally disabled
  placeholders — no OAuth providers are configured.
- Billing is simulated: `changePlanAction` updates entitlements directly, no
  payment processor. Switching plans never resets the used counter; paid
  plans keep identifying past the limit and report overage.
- The Activity Log polls `/api/activity` every 5 s (client polling, no
  websockets); polling pauses while the tab is hidden.
- NextAuth v4 on Next 16 is a maintenance-mode pairing — works today, but
  budget an Auth.js v5 / Better-Auth migration before the next Next major
  (see PAD §11).

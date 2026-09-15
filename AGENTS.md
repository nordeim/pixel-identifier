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
| Production build | `npm run build` |
| Full gate (run before pushing) | `npm run verify` = lint → typecheck → build |
| Create/refresh DB | `npm run db:push` |
| Seed demo data | `npm run db:seed` (idempotent; refuses non-local DBs) |

**Order matters:** lint → typecheck → build. Never weaken a failing gate to
make it pass — fix the code.

**Env first:** copy `.env.example` to `.env` and set `NEXTAUTH_SECRET`
(`openssl rand -base64 32`) before `npm run dev`; auth routes fail without it.

## Non-obvious facts

- **Tailwind 4 is CSS-first.** There is no `tailwind.config.js` and there must
  never be one — tokens live in the `@theme inline` block in
  `src/app/globals.css`. Brand values are literal hex (e.g. `--primary:
  #FACC15`); `var()` chains inside `@theme` are silently dropped by the build.
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

- Server components fetch data via `src/lib/analytics.ts` (marked
  `server-only`); interactive leaves are `'use client'` components under
  `src/components/{marketing,dashboard,auth}`.
- Money and quotas are integers (cents / counts) — never floats. Plan
  definitions live only in `src/lib/plans.ts`.
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
  payment processor.
- The Activity Log polls `/api/activity` every 5 s (client polling, no
  websockets).

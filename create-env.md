# Create working .env — matching .env.example

## Goal
Create a working `.env` that matches `.env.example` (DATABASE_URL + NEXTAUTH_SECRET + NEXTAUTH_URL) so `npm run dev` + auth + Prisma work on first boot. No doc edits, no code changes beyond the file itself.

## Tasks
- [ ] **T1: Inspect current env state** — run `ls -la .env*`, `cat .env.example`, `cat .gitignore | rg .env`, and `rg "DATABASE_URL|NEXTAUTH_" src/ prisma/schema.prisma` to confirm required vars and that `.env` is gitignored. Record baseline: no `.env` exists today.
  → Verify: terminal output shows only `.env.example` present; `.env` absent; `.gitignore` has `.env` + `.env.*` + `!.env.example`.

- [ ] **T2: Generate `NEXTAUTH_SECRET`** — run `openssl rand -base64 32` (fallback `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` if openssl missing). Require ≥32 chars (AGENTS.md: `openssl rand -base64 32`); JWT sessions fail without it (CLAUDE.md: auth routes fail).
  → Verify: secret string length ≥32, base64 charset, no newlines.

- [ ] **T3: Write `.env`** — create `/.env` (repo root) with exactly the three vars from `.env.example`, in same order, with real secret:
  ```
  DATABASE_URL="file:./db/pixelco.db"
  NEXTAUTH_SECRET="<generated>"
  NEXTAUTH_URL="http://localhost:3000"
  ```
  Use `file:./db/pixelco.db` (relative resolves against `prisma/` per AGENTS.md; `db/pixelco.db` is the dev default). Keep quotes as in example. Do not add extra vars, do not commit. Set file mode 600.
  → Verify: `cat .env` matches template plus real secret; `ls -l .env` shows 600; `git status` shows `.env` untracked but ignored (`git check-ignore .env`).

- [ ] **T4: Sync DB and generate client** — run `npm run db:push` (Prisma `db push` + generate) against `DATABASE_URL` from new `.env`. This is the AGENTS.md "Env first → db:push → db:seed → dev" order. Captures that `DATABASE_URL` is valid and SQLite file is created at `prisma/db/pixelco.db` (relative) / `db/pixelco.db`.
  → Verify: command exits 0; `ls db/pixelco.db` exists; `npx prisma generate` already satisfied.

- [ ] **T5: Optional seed + health probe** — run `npm run db:seed` (idempotent; refuses non-local DBs) to create `demo@pixelco.local / Demo123456!`, then boot `npm run dev` and `curl http://localhost:3000/api/health` expecting `{"status":"ok","db":"up"}`. Do not leave dev server running.
  → Verify: `curl /api/health` → `db: up`; `curl -I /pixel.js` → 200; `/dashboard` → 307 to `/login` when signed out (AGENTS.md verify checklist).

## Done When
- [ ] `.env` exists at repo root with 3 vars, real `NEXTAUTH_SECRET` (≥32 chars), `DATABASE_URL` pointing to `file:./db/pixelco.db`, `NEXTAUTH_URL=http://localhost:3000`
- [ ] `.env` is gitignored and not staged
- [ ] `npm run db:push` succeeds against new `DATABASE_URL`
- [ ] `/api/health` reports `db: up` with new env loaded

## Notes
- Keep `.env.example` unchanged — it is the source of truth for required vars (PAD §9.2). Do not add `DATABASE_URL` absolute path for standalone; dev uses relative per AGENTS.md.
- If a `.env` already exists, back it up to `.env.bak.<ts>` before overwriting.
- No `console.log` in code; `NEXTAUTH_SECRET` must never be logged or committed (AGENTS.md SSH key rules apply to secrets).

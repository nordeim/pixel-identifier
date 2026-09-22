# Deployment Guide

How to run Pixelco outside `npm run dev`. For local setup see the README
Quick Start; this document covers the production paths.

**Contents**

1. [Build outputs](#1-build-outputs)
2. [Environment variables](#2-environment-variables)
3. [The SQLite path contract](#3-the-sqlite-path-contract)
4. [Production: use absolute SQLite paths](#4-production-use-absolute-sqlite-paths)
5. [Standalone (self-hosting)](#5-standalone-self-hosting)
6. [Docker](#6-docker)
7. [Postgres](#7-postgres)

---

## 1. Build outputs

| Command | Output | Notes |
|---|---|---|
| `npm run build` | `.next/` (`output: "standalone"` traced) | plus `.next/standalone/` |
| `npm run build:standalone` | `.next/standalone/` **deployable as a unit** | also copies `.next/static` + `public/` in (the copy the Next docs require) |

`next start` is not the supported production path for this repo — the
standalone `server.js` is (see §5).

## 2. Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | SQLite `file:` URL or a Postgres connection string |
| `NEXTAUTH_SECRET` | yes | ≥32-char secret (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | yes in prod | Canonical origin, e.g. `https://pixelco.example.com` |

A real shell-exported `DATABASE_URL` overrides `.env` (standard dotenv
precedence — the Prisma CLI and the app both honor it).

## 3. The SQLite path contract

In development (`.env`), a RELATIVE `file:` URL is resolved against
`prisma/schema.prisma` — exactly like the Prisma CLI resolves a
schema-hardcoded URL — so the default:

```
DATABASE_URL="file:../db/custom.db"
```

points at `<repo>/db/custom.db` (the git-ignored `db/` folder at the repo
root) for `npm run db:push`, `npm run db:seed`, `next build`, and the
running dev server alike, regardless of the process working directory.

Two modules implement and pin this contract:

- `src/lib/db-path.ts` — `resolveDatabaseUrl()` normalizes relative `file:`
  URLs to absolute (schema-dir anchored) and hands them to PrismaClient via
  `datasourceUrl`, which bypasses the divergent env-URL anchoring of
  `@prisma/client`'s server-runtime env loading (SQLite error 14 — see the
  module doc comment for the empirically isolated behavior).
- `scripts/with-db-url.mjs` — the CLI mirror: `npm run db:push` / `db:seed`
  re-exec their command with the absolute `DATABASE_URL` so the Prisma CLI
  (whose env-indirected relative anchoring differs) writes the same file.

The contract is pinned by `tests/db-path.test.ts`, and the e2e suite boots
the standalone server against a dedicated `db/e2e.db` the same way.

## 4. Production: use absolute SQLite paths

In a deployed tree there is no repo, no `prisma/schema.prisma` to anchor
against, and no `db/` folder — so ship an ABSOLUTE path and a real volume:

```bash
DATABASE_URL="file:/app/data/pixelco.db" \
NEXTAUTH_SECRET="…" NEXTAUTH_URL="https://your-host" \
PORT=3000 HOSTNAME=0.0.0.0 node server.js
```

`resolveDatabaseUrl` passes absolute `file:` URLs through untouched, so the
production value is used verbatim. If no `prisma/schema.prisma` is reachable
from the server process, a relative URL also passes through as-is — which
the standalone runtime would anchor unpredictably. Rule: **relative SQLite
URLs are a development convenience; production pins an absolute path on a
persistent volume.** The Docker image (§6) follows this rule.

## 5. Standalone (self-hosting)

```bash
npm run build:standalone   # next build + cp .next/static (+ public/) into .next/standalone
cd .next/standalone
DATABASE_URL="file:/absolute/path/pixelco.db" \
NEXTAUTH_SECRET="..." NEXTAUTH_URL="https://your-host" \
PORT=3000 HOSTNAME=0.0.0.0 node server.js
```

`npm run build:standalone` exists because `next build` with
`output: "standalone"` does NOT copy the static assets: serving
`.next/standalone` as built by `next build` alone ships a page whose JS/CSS
404 (React never hydrates; forms fall back to native GET submission).

Regression guard: `PIXELCO_STANDALONE_SMOKE=1 npx vitest run
tests/standalone-smoke.test.ts` boots `server.js` and asserts a
`_next/static` chunk answers 200. The e2e suite (`npm run test:e2e`) runs
against the same artifact.

## 6. Docker

```bash
docker build -t pixelco .
docker run -p 3000:3000 \
  -e NEXTAUTH_SECRET="$(openssl rand -base64 32)" \
  -e NEXTAUTH_URL="https://your-host" \
  -v pixelco-data:/app/data \
  pixelco
```

The image is a multi-stage `node:22-alpine` build: standalone output +
static assets, non-root user, `/app/data` volume for the SQLite file
(absolute `DATABASE_URL=file:/app/data/pixelco.db` set by the entrypoint),
a `/api/health` HEALTHCHECK, and an entrypoint that runs `prisma db push`
on boot (set `RUN_DB_PUSH=false` when the schema is managed externally).

## 7. Postgres

Swap `DATABASE_URL` for a connection string and the provider in
`prisma/schema.prisma` (`provider = "postgresql"`); the schema uses
portable types throughout. `resolveDatabaseUrl` and the CLI wrapper pass
non-`file:` URLs through untouched — no other change is needed.

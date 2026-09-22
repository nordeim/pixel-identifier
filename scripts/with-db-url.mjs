#!/usr/bin/env node
/**
 * Run a command with DATABASE_URL normalized to an ABSOLUTE SQLite path
 * (R23-F1). Mirrors the resolution rule in src/lib/db-path.ts.
 *
 * Why: the Prisma CLI anchors an env-INDIRECTED relative `file:` URL at the
 * `.env` / project root instead of the schema dir — `DATABASE_URL=
 * "file:../db/custom.db"` made `prisma db push` create the schema at
 * <repo-parent>/db/custom.db, outside the repo, while the running server
 * (via db-path.ts) used <repo>/db/custom.db. Routing `db:push` / `db:seed`
 * through this wrapper makes the CLI and the server agree on the same file:
 *
 *   file:../db/custom.db  →  <repo>/db/custom.db
 *
 * An already-absolute DATABASE_URL (shell env or .env) passes through
 * unchanged, as do non-SQLite URLs.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** Minimal .env reader: KEY=VALUE lines, optional quotes, # comments. */
export function readEnvFile(file) {
  const vars = {}
  if (!fs.existsSync(file)) return vars
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    vars[key] = value
  }
  return vars
}

/** Walk up from `start` looking for prisma/schema.prisma (repo marker). */
export function findPrismaDir(start) {
  let dir = path.resolve(start)
  for (;;) {
    if (fs.existsSync(path.join(dir, 'prisma', 'schema.prisma'))) {
      return path.join(dir, 'prisma')
    }
    const parent = path.dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}

/** Same rule as src/lib/db-path.ts: relative `file:` → schema-dir anchored. */
export function resolveDatabaseUrl(raw) {
  if (raw === undefined) return undefined
  const match = /^file:(.*)$/s.exec(raw)
  if (!match) return raw
  const filePath = match[1]
  if (filePath.startsWith('//') || path.isAbsolute(filePath)) return raw
  const prismaDir = findPrismaDir(repoRoot)
  if (!prismaDir) return raw
  return `file:${path.resolve(prismaDir, filePath)}`
}

const isMain =
  process.argv[1] &&
  import.meta.url === new URL(`file://${path.resolve(process.argv[1])}`).href

if (isMain) {
  const command = process.argv[2]
  const args = process.argv.slice(3)
  if (!command) {
    console.error('usage: node scripts/with-db-url.mjs <command> [args…]')
    process.exit(2)
  }

  const fileEnv = readEnvFile(path.join(repoRoot, '.env'))
  const rawUrl = process.env.DATABASE_URL ?? fileEnv.DATABASE_URL
  const resolved = resolveDatabaseUrl(rawUrl)
  if (process.env.DEBUG_DBURL) {
    console.error('[with-db-url] repoRoot=%s rawUrl=%s resolved=%s', repoRoot, rawUrl, resolved)
  }

  const child = spawnSync(command, args, {
    stdio: 'inherit',
    cwd: repoRoot,
    env: resolved
      ? { ...process.env, DATABASE_URL: resolved }
      : { ...process.env },
  })

  if (child.error) {
    console.error(`[with-db-url] failed to start ${command}: ${child.error.message}`)
    process.exit(1)
  }
  process.exit(child.status ?? 1)
}

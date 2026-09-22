#!/usr/bin/env node
/**
 * E2E server bootstrap (R23-F8) — Playwright's webServer command.
 *
 * Boots the app against a DEDICATED throwaway SQLite database
 * (`<repo>/db/e2e.db` — git-ignored like every db/ file) so e2e runs never
 * touch the dev database, then serves the STANDALONE production build
 * (`.next/standalone/server.js`) — the artifact that actually ships
 * (scandihaven E2E-1 lesson: production-only failure modes are invisible
 * to the dev server).
 *
 * Requires a prior `npm run build:standalone` (build + static-asset copy).
 * Idempotent: re-pushes the schema and re-seeds (the seed is idempotent)
 * on every boot, so each run starts from the known demo dataset.
 */
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readEnvFile } from './with-db-url.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PORT = Number(process.env.E2E_PORT ?? 3100)
const HOSTNAME = process.env.E2E_HOSTNAME ?? '127.0.0.1'
const baseURL = `http://${HOSTNAME}:${PORT}`

const standaloneServer = path.join(repoRoot, '.next', 'standalone', 'server.js')
if (!fs.existsSync(standaloneServer)) {
  console.error(
    '[e2e-server] .next/standalone/server.js not found — run `npm run build:standalone` first',
  )
  process.exit(1)
}

// A dedicated e2e database (absolute — the standalone runtime rule).
const e2eDatabaseUrl = `file:${path.join(repoRoot, 'db', 'e2e.db')}`

function run(label, command, args, extraEnv = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    cwd: repoRoot,
    env: { ...process.env, ...extraEnv },
  })
  if (result.error || result.status !== 0) {
    console.error(`[e2e-server] ${label} failed`)
    process.exit(1)
  }
}

// 1. Schema + demo seed on the e2e database (both idempotent).
run(
  'prisma db push',
  path.join(repoRoot, 'node_modules', '.bin', 'prisma'),
  ['db', 'push', '--skip-generate'],
  { DATABASE_URL: e2eDatabaseUrl },
)
run(
  'seed',
  path.join(repoRoot, 'node_modules', '.bin', 'tsx'),
  [path.join('prisma', 'seed.ts')],
  { DATABASE_URL: e2eDatabaseUrl },
)

// 2. Serve the standalone build (auth needs a stable secret + matching URL;
//    .env's values are reused when present so sessions survive re-runs).
const fileEnv = readEnvFile(path.join(repoRoot, '.env'))
const childEnv = {
  ...process.env,
  PORT: String(PORT),
  HOSTNAME,
  DATABASE_URL: e2eDatabaseUrl,
  NEXTAUTH_SECRET:
    process.env.NEXTAUTH_SECRET ?? fileEnv.NEXTAUTH_SECRET ?? 'e2e-local-secret-not-for-production',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? baseURL,
  NODE_ENV: 'production',
}

console.info(`[e2e-server] booting standalone server on ${baseURL} (db: ${e2eDatabaseUrl})`)
const server = spawn(process.execPath, [standaloneServer], {
  stdio: 'inherit',
  env: childEnv,
})

// Stay alive with the server; forward shutdown signals (Playwright kills
// the webServer process group when the run ends).
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.kill(signal)
  })
}
server.on('exit', (code) => {
  process.exit(code ?? 0)
})

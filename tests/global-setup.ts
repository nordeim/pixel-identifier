import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { TEST_DATABASE_URL } from './test-db'

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

/**
 * Global setup: recreate the test database from the Prisma schema before the
 * suite runs. `db push` (rather than migrations) keeps the test schema in
 * lockstep with the source of truth without maintaining migration files.
 */
export default function globalSetup(): void {
  const dbFile = TEST_DATABASE_URL.replace(/^file:/, '')
  fs.rmSync(dbFile, { force: true })
  fs.rmSync(`${dbFile}-journal`, { force: true })

  const prismaBin = path.join(repoRoot, 'node_modules', '.bin', 'prisma')
  execFileSync(prismaBin, ['db', 'push', '--skip-generate'], {
    cwd: repoRoot,
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: 'pipe',
  })
}

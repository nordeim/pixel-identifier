import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * The DATABASE_URL seam (R23-F2) — the contract documented in `.env.example`:
 *
 *   A RELATIVE `file:` URL is resolved against `prisma/schema.prisma` —
 *   exactly like the Prisma CLI — so `file:../db/custom.db` points at
 *   `<repo>/db/custom.db` for the CLI, `next build`, and the running server
 *   alike, regardless of the process working directory.
 *
 * Why this module exists (empirically isolated in the R23 audit):
 * - The Prisma CLI anchors an env-INDIRECTED relative `file:` URL at the
 *   `.env` / project root, not the schema dir (`file:../db/custom.db`
 *   resolved to `<repo-parent>/db/custom.db`).
 * - In the Next.js server runtime, `@prisma/client`'s env loading REWRITES
 *   the URL (relativize against the generate-time schema dir, re-anchor at
 *   the `.env`/cwd base) — even absolute URLs came out one directory too
 *   high, and the server failed with SQLite error 14 ("Unable to open the
 *   database file").
 * - A `datasourceUrl` handed to the PrismaClient constructor bypasses that
 *   rewriting entirely (probe-verified in the dev-server runtime), so
 *   `src/lib/db.ts` passes `resolveDatabaseUrl()` there.
 *
 * Absolute `file:` paths and non-SQLite URLs (PostgreSQL) pass through
 * unchanged — production deployments keep the documented absolute-path rule
 * (docs/DEPLOYMENT.md §4). When no `prisma/schema.prisma` can be found from
 * either anchor (a deployed standalone tree), the URL is returned untouched
 * rather than invented.
 */

/** Walk up from `start` looking for a `prisma/schema.prisma` directory. */
function findPrismaDir(start: string): string | null {
  let dir = path.resolve(start)
  for (;;) {
    if (fs.existsSync(path.join(dir, 'prisma', 'schema.prisma'))) {
      return path.join(dir, 'prisma')
    }
    const parent = path.dirname(dir)
    if (parent === dir) return null // reached the filesystem root
    dir = parent
  }
}

/**
 * Resolve a `file:`-relative SQLite URL against the repo's `prisma/`
 * directory (schema-relative, like a schema-hardcoded Prisma URL) and return
 * an absolute `file:` URL. Everything else passes through untouched.
 */
export function resolveDatabaseUrl(
  raw: string | undefined = process.env.DATABASE_URL,
): string | undefined {
  if (raw === undefined) return undefined

  // ES2017-safe `[\s\S]` instead of the /s flag (tsconfig targets ES2017).
  const match = /^file:([\s\S]*)$/.exec(raw)
  if (!match) return raw // PostgreSQL / MySQL / … — not our concern
  const filePath = match[1]
  // Protocol-relative (`file://…`) and absolute paths are used as-is.
  if (filePath.startsWith('//') || path.isAbsolute(filePath)) return raw

  // Anchor candidates: this module's own location first (works when bundled
  // next to the source tree), then the process working directory (covers
  // `next dev` / `next start` / one-off scripts run from the repo root).
  const anchors: string[] = []
  try {
    anchors.push(path.dirname(fileURLToPath(import.meta.url)))
  } catch {
    // import.meta.url unavailable (exotic bundler context) — cwd still works.
  }
  anchors.push(process.cwd())

  for (const anchor of anchors) {
    const prismaDir = findPrismaDir(anchor)
    if (prismaDir) return `file:${path.resolve(prismaDir, filePath)}`
  }

  // No repo tree reachable (deployed standalone without prisma/): keep the
  // caller's URL — the deployment docs require absolute paths there anyway.
  return raw
}

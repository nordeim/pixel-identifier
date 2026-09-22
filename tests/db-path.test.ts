import { describe, expect, it } from 'vitest'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { resolveDatabaseUrl } from '@/lib/db-path'

/**
 * R23-F2: the DATABASE_URL seam contract documented in .env.example —
 * "A RELATIVE `file:` URL is resolved against prisma/schema.prisma — exactly
 * like the Prisma CLI — so `file:../db/custom.db` points at <repo>/db/custom.db
 * for the CLI (migrate/seed), `next build`, and the running server alike,
 * regardless of the process working directory."
 *
 * The Prisma CLI's env indirection and @prisma/client's server-runtime env
 * loading both anchor relative `file:` URLs at the WRONG base (the .env /
 * process root — empirically verified: `file:../db/custom.db` resolved to
 * <repo-parent>/db/custom.db, and even absolute URLs were re-anchored one
 * directory too high in the Next dev server, error 14). db-path normalizes
 * every context onto the schema-dir-relative anchor and hands PrismaClient
 * an absolute URL via `datasourceUrl`, which bypasses the rewriting.
 */
const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

describe('resolveDatabaseUrl — the .env.example contract', () => {
  it('resolves file:../db/custom.db to the repo-root db/ folder', () => {
    expect(resolveDatabaseUrl('file:../db/custom.db')).toBe(
      `file:${path.join(repoRoot, 'db', 'custom.db')}`,
    )
  })

  it('resolves file:./dev.db against the prisma/ directory (schema-relative)', () => {
    expect(resolveDatabaseUrl('file:./dev.db')).toBe(
      `file:${path.join(repoRoot, 'prisma', 'dev.db')}`,
    )
  })

  it('resolves file:./db/pixelco.db (the historic .env default) schema-relative', () => {
    expect(resolveDatabaseUrl('file:./db/pixelco.db')).toBe(
      `file:${path.join(repoRoot, 'prisma', 'db', 'pixelco.db')}`,
    )
  })

  it('passes absolute file: URLs through untouched', () => {
    const absolute = `file:${path.join(repoRoot, 'db', 'test.db')}`
    expect(resolveDatabaseUrl(absolute)).toBe(absolute)
  })

  it('passes non-SQLite URLs through untouched', () => {
    const postgres =
      'postgresql://user:password@localhost:5432/pixel_identifier?schema=public'
    expect(resolveDatabaseUrl(postgres)).toBe(postgres)
  })

  it('returns undefined when DATABASE_URL is not set', () => {
    const previous = process.env.DATABASE_URL
    delete process.env.DATABASE_URL
    try {
      expect(resolveDatabaseUrl()).toBeUndefined()
    } finally {
      if (previous !== undefined) process.env.DATABASE_URL = previous
    }
  })

  it('reads process.env.DATABASE_URL when no argument is given', () => {
    const previous = process.env.DATABASE_URL
    process.env.DATABASE_URL = 'file:../db/custom.db'
    try {
      expect(resolveDatabaseUrl()).toBe(
        `file:${path.join(repoRoot, 'db', 'custom.db')}`,
      )
    } finally {
      if (previous === undefined) delete process.env.DATABASE_URL
      else process.env.DATABASE_URL = previous
    }
  })

  it('normalizes ./ and ../ segments (no double slashes, resolved lexically)', () => {
    const resolved = resolveDatabaseUrl('file:./sub/../db/custom.db') ?? ''
    expect(resolved).not.toContain('/./')
    expect(resolved).not.toContain('/../')
    expect(resolved).toBe(`file:${path.join(repoRoot, 'prisma', 'db', 'custom.db')}`)
  })
})

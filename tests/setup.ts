import { beforeAll, vi } from 'vitest'
import { db } from '@/lib/db'

beforeAll(async () => {
  // SQLite single-writer: raise busy timeout so the 110-concurrent quota
  // Prove-It can serialize without Prisma socket timeouts (ADR-008).
  await db.$queryRawUnsafe('PRAGMA busy_timeout = 10000')
  await db.$queryRawUnsafe('PRAGMA journal_mode = WAL')
})

/**
 * Shared mocks for Next.js server-context APIs that only exist inside a
 * request scope. Individual tests can retarget these via
 * `vi.mocked(headers).mockResolvedValue(...)`.
 */

// 'server-only' is a build-time guard supplied by Next.js; stub it for the
// node test environment.
vi.mock('server-only', () => ({}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    // RSC redirect() works by throwing; mirror that so code paths under test
    // behave the same way they do in production.
    throw new Error(`REDIRECT:${url}`)
  }),
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => new Headers()),
}))

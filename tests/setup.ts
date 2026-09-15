import { vi } from 'vitest'

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

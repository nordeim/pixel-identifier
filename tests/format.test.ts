import { describe, expect, it } from 'vitest'
import { formatDate, initialsForEmail, relativeTime } from '@/lib/format'

const MIN = 60_000
const HOUR = 3_600_000
const DAY = 86_400_000

/* csvCell was RETIRED in R21-F1 — the export replicates the live's raw
   byte format (pinned in tests/export-r21-parity.test.ts). */

describe('relativeTime', () => {
  it('returns "Just now" for fresh and future timestamps', () => {
    expect(relativeTime(new Date())).toBe('Just now')
    expect(relativeTime(new Date(Date.now() + 5 * MIN))).toBe('Just now')
  })

  it('covers the live boundaries (R21-F9: the live\'s Ry formatter)', () => {
    expect(relativeTime(new Date(Date.now() - 59_000))).toBe('Just now')
    expect(relativeTime(new Date(Date.now() - 60_000))).toBe('1 min ago')
    expect(relativeTime(new Date(Date.now() - 5 * MIN))).toBe('5 min ago')
    expect(relativeTime(new Date(Date.now() - 3 * HOUR))).toBe('3 hr ago')
    // The live's compact day form — no space, no weeks branch, no date
    // fallback: everything beyond 24h stays "Nd ago".
    expect(relativeTime(new Date(Date.now() - 3 * DAY))).toBe('3d ago')
    expect(relativeTime(new Date(Date.now() - 21 * DAY))).toBe('21d ago')
    expect(relativeTime(new Date(Date.now() - 200 * DAY))).toBe('200d ago')
  })

  it('accepts ISO strings', () => {
    expect(relativeTime(new Date(Date.now() - 2 * MIN).toISOString())).toBe('2 min ago')
  })
})

describe('initialsForEmail', () => {
  it('takes the first letters of the first two parts', () => {
    expect(initialsForEmail('marcus.smith@acmecorp.com')).toBe('MS')
    expect(initialsForEmail('jane-doe@example.com')).toBe('JD')
    expect(initialsForEmail('ada_lovelace@example.com')).toBe('AL')
  })

  it('falls back to the first two characters of a single-part local', () => {
    expect(initialsForEmail('zoe@example.com')).toBe('ZO')
  })
})

describe('formatDate', () => {
  it('formats as "Mon D, YYYY"', () => {
    expect(formatDate(new Date('2026-09-15T12:00:00Z'))).toMatch(/Sep 15, 2026/)
  })
})

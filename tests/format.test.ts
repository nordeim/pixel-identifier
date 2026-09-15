import { describe, expect, it } from 'vitest'
import { csvCell, formatDate, initialsForEmail, relativeTime } from '@/lib/format'

const MIN = 60_000
const HOUR = 3_600_000
const DAY = 86_400_000

describe('csvCell (RFC 4180 + formula-injection guard)', () => {
  it('passes through plain values', () => {
    expect(csvCell('hello')).toBe('hello')
    expect(csvCell(42)).toBe('42')
  })

  it('renders null and undefined as empty', () => {
    expect(csvCell(null)).toBe('')
    expect(csvCell(undefined)).toBe('')
  })

  it('quotes and escapes separators, quotes and newlines', () => {
    expect(csvCell('a,b')).toBe('"a,b"')
    expect(csvCell('say "hi"')).toBe('"say ""hi"""')
    expect(csvCell('line1\nline2')).toBe('"line1\nline2"')
    expect(csvCell('line1\r\nline2')).toBe('"line1\r\nline2"')
  })

  it('neutralises CSV formula injection (cells starting with = + - @)', () => {
    expect(csvCell('=SUM(A1:A9)')).toBe('\'=SUM(A1:A9)')
    expect(csvCell('+cmd|/C calc')).toBe("'+cmd|/C calc")
    expect(csvCell('-2+1')).toBe('\'-2+1')
    expect(csvCell('@import url(x)')).toBe("'@import url(x)")
    // Tab-prefixed payloads are guarded too.
    expect(csvCell('\t=1+1')).toBe("'\t=1+1")
  })

  it('does not add a guard to ordinary leading symbols', () => {
    expect(csvCell('regular text')).toBe('regular text')
    expect(csvCell('#hashtag')).toBe('#hashtag')
  })
})

describe('relativeTime', () => {
  it('returns "Just now" for fresh and future timestamps', () => {
    expect(relativeTime(new Date())).toBe('Just now')
    expect(relativeTime(new Date(Date.now() + 5 * MIN))).toBe('Just now')
  })

  it('covers the documented boundaries', () => {
    expect(relativeTime(new Date(Date.now() - 46_000))).toBe('1 min ago')
    expect(relativeTime(new Date(Date.now() - 5 * MIN))).toBe('5 min ago')
    expect(relativeTime(new Date(Date.now() - 3 * HOUR))).toBe('3h ago')
    expect(relativeTime(new Date(Date.now() - 3 * DAY))).toBe('3d ago')
    expect(relativeTime(new Date(Date.now() - 21 * DAY))).toBe('3w ago')
    expect(relativeTime(new Date(Date.now() - 200 * DAY))).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/)
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

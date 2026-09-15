import { describe, expect, it } from 'vitest'
import { pickSelectedSite } from '@/lib/sites'

const SITES = [
  { id: 'a', siteKey: 'px_aaaa', domain: 'first.example', createdAt: new Date('2026-01-01') },
  { id: 'b', siteKey: 'px_bbbb', domain: 'second.example', createdAt: new Date('2026-02-01') },
  { id: 'c', siteKey: 'px_cccc', domain: 'third.example', createdAt: new Date('2026-03-01') },
]

describe('pickSelectedSite (F-23: install page must serve every domain)', () => {
  it('returns the site matching the ?site= key', () => {
    expect(pickSelectedSite(SITES, 'px_bbbb')?.domain).toBe('second.example')
  })

  it('falls back to the first site when the key is unknown', () => {
    expect(pickSelectedSite(SITES, 'px_nope')?.domain).toBe('first.example')
  })

  it('falls back to the first site when no key is given', () => {
    expect(pickSelectedSite(SITES, null)?.domain).toBe('first.example')
  })

  it('returns null for an empty site list', () => {
    expect(pickSelectedSite([], 'px_aaaa')).toBeNull()
    expect(pickSelectedSite([], null)).toBeNull()
  })
})

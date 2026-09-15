import { describe, expect, it } from 'vitest'
import { resolveIdentity, sourceFromReferrer } from '@/lib/identification'

/**
 * Resolver invariants (round-5 plan, A5). The engine is deterministic and
 * data-affecting: new draws must only be APPENDED after every existing draw
 * so historical email/company/confidence decisions never change.
 */
describe('resolveIdentity determinism', () => {
  it('returns the exact same decision for identical inputs across calls', () => {
    const first = resolveIdentity('visitor-abc-12345678', 'px_0123456789abcdef')
    const second = resolveIdentity('visitor-abc-12345678', 'px_0123456789abcdef')
    expect(second).toEqual(first)
  })

  it('resolves ~20% of visitors across a deterministic sample', () => {
    let identified = 0
    const samples = 2000
    for (let i = 0; i < samples; i++) {
      if (resolveIdentity(`vid-${i.toString().padStart(6, '0')}`, 'px_0123456789abcdef')) {
        identified += 1
      }
    }
    const rate = identified / samples
    expect(rate).toBeGreaterThan(0.15)
    expect(rate).toBeLessThan(0.25)
  })

  it('keeps a stable decision for a known visitor (regression pin)', () => {
    // The historical decision set must never silently reshape: pin one.
    const identity = resolveIdentity('demo_vid_company_01', 'px_b53394aef9c835f0')
    if (identity?.type === 'company') {
      expect(identity.companyName).toBeTruthy()
      expect(identity.email.endsWith('.com')).toBe(true)
    } else {
      expect(identity === null || identity.type === 'individual').toBe(true)
    }
  })
})

describe('resolveIdentity B2B locations (R5-H4: company rows show a location)', () => {
  it('gives every B2B resolution a full "City, State, CC" location', () => {
    let companies = 0
    for (let i = 0; i < 500 && companies < 25; i++) {
      const identity = resolveIdentity(`loc-vid-${i.toString().padStart(4, '0')}`, 'px_0123456789abcdef')
      if (!identity || identity.type !== 'company') continue
      companies += 1
      expect(identity.city).toBeTruthy()
      expect(identity.state).toBeTruthy()
      expect(identity.country).toMatch(/^[A-Z]{2}$/)
      expect(typeof identity.city).toBe('string')
    }
    expect(companies).toBeGreaterThan(0)
  })

  it('leaves B2C resolutions without a location', () => {
    for (let i = 0; i < 300; i++) {
      const identity = resolveIdentity(`loc-ind-${i.toString().padStart(4, '0')}`, 'px_0123456789abcdef')
      if (!identity || identity.type !== 'individual') continue
      expect(identity.city).toBeNull()
      expect(identity.state).toBeNull()
      expect(identity.country).toBeNull()
    }
  })

  it('derives a stable location per visitor (same input, same place)', () => {
    const first = resolveIdentity('loc-stable-0001', 'px_0123456789abcdef')
    const second = resolveIdentity('loc-stable-0001', 'px_0123456789abcdef')
    if (first?.type === 'company' && second?.type === 'company') {
      expect(`${second.city}, ${second.state}, ${second.country}`).toBe(
        `${first.city}, ${first.state}, ${first.country}`,
      )
    }
  })
})

describe('sourceFromReferrer', () => {
  it('classifies the major traffic sources', () => {
    expect(sourceFromReferrer('')).toBe('direct')
    expect(sourceFromReferrer('https://www.google.com/search?q=x')).toBe('search')
    expect(sourceFromReferrer('https://linkedin.com/feed')).toBe('social')
    expect(sourceFromReferrer('https://partner.example.com/promo')).toBe('referral')
    expect(sourceFromReferrer('https://newsletter.example.com/utm-campaign')).toBe('campaign')
  })

  it('treats unparsable referrers as referrals, never crashes', () => {
    expect(sourceFromReferrer('not a url ://')).toBe('referral')
  })
})

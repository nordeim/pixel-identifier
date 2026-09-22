import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Audience, HowItWorks } from '@/components/marketing/how-it-works'

/**
 * R24 F1 — marketing text parity. The live has said "company (if B2B)"
 * since at least R18; the clone shipped "company (if B2C)" from the
 * initial commit — a REAL visible text bug (the sentence describes B2B
 * contact resolution). The live's kickers read "Perfect Fit" / "Our
 * Process" (capitalized) — invisible through the `uppercase` utility, but
 * source-level divergences worth retiring. Evidence: live landing
 * (pixelco.io) DOM, R24 9th probe generation.
 */

describe('R24 F1 — how-it-works copy', () => {
  const audience = renderToStaticMarkup(<Audience />)
  const process = renderToStaticMarkup(<HowItWorks />)

  it('renders the live B2B sentence (not B2C)', () => {
    expect(process).toContain('company (if B2B)')
    expect(process).not.toContain('if B2C')
  })

  it('renders the capitalized kicker "Perfect Fit"', () => {
    expect(audience).toContain('>Perfect Fit</span>')
    expect(audience).not.toContain('>Perfect fit<')
  })

  it('renders the capitalized kicker "Our Process"', () => {
    expect(process).toContain('>Our Process</span>')
    expect(process).not.toContain('>Our process<')
  })
})

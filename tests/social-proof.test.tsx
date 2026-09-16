import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { SocialProof, StatsBar } from '@/components/marketing/social-proof'

/**
 * R9-F1/F2/F5 regression tests: the live landing couples an animated logo
 * marquee (2 copies of the 10-name set, `animate-scroll-left`) with the
 * testimonial cards in ONE bordered section (`max-w-4xl` grid, `shadow-card`
 * cards, `text-sm` quotes), and the stats strip is an untinted
 * `py-14 border-y border-border` band. These render the pure components
 * server-side and pin the live-exact structure.
 */

const marquee = renderToStaticMarkup(<SocialProof />)
const stats = renderToStaticMarkup(<StatsBar />)

const countOccurrences = (haystack: string, needle: string) =>
  haystack.split(needle).length - 1

describe('SocialProof (R9-F1 marquee + R9-F2 testimonials)', () => {
  it('renders the animated marquee track with two copies of the 10-name set', () => {
    expect(marquee).toContain('animate-scroll-left')
    // Every name renders twice (seamless -50% loop).
    for (const name of [
      'TechCorp',
      'GrowthLabs',
      'ScaleUp',
      'DataFlow',
      'LeadGen Pro',
      'CloudBase',
      'SalesForge',
      'Amplify',
      'NexGen',
      'RevBoost',
    ]) {
      expect(countOccurrences(marquee, `>${name}<`)).toBe(2)
    }
  })

  it('uses the live marquee name treatment (text-lg, muted/40, not uppercase small caps)', () => {
    expect(marquee).toContain('text-lg font-bold text-muted-foreground/40')
    expect(marquee).not.toContain('tracking-widest')
  })

  it('hosts the testimonials in the same section with the live geometry', () => {
    expect(marquee).toContain('max-w-4xl mx-auto')
    expect(marquee).toContain('shadow-card')
    // Live quote size is text-sm; the clone drifted to text-[15px].
    expect(marquee).toContain('text-sm text-foreground leading-relaxed')
    expect(marquee).not.toContain('text-[15px]')
  })

  it('keeps the section chrome the live ships (border-b, no card tint)', () => {
    expect(marquee).toContain('py-16 border-b border-border')
  })
})

describe('StatsBar (R9-F5 chrome)', () => {
  it('matches the live untinted py-14 band', () => {
    expect(stats).toContain('py-14 border-y border-border')
    expect(stats).not.toContain('bg-card')
  })

  it('keeps the four live stats with gradient values', () => {
    expect(stats).toContain('20%')
    expect(stats).toContain('30s')
    expect(stats).toContain('B2B+B2C')
    expect(stats).toContain('Real-Time')
    expect(stats).toContain('text-gradient-hero')
  })
})

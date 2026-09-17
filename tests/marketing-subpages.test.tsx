import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import AboutPage from '@/app/(marketing)/about/page'
import DocsPage from '@/app/(marketing)/docs/page'

/**
 * R13-F4/F5: the about and docs pages were early-round approximations —
 * the round-13 audit diffed them against the live for the first time.
 * These pins encode the live DOM (research/round13-audit/content/
 * page-{about,docs}.json): the shared sub-page chrome (container
 * max-w-4xl, `← Back to Home` primary link), the live section rhythm
 * (mb-16), value/step cards (`border border-border rounded-xl p-6
 * bg-card shadow-card`), the stats band, the sample-snippet warning box,
 * and the exact copy.
 */
const about = renderToStaticMarkup(<AboutPage />)
const docs = renderToStaticMarkup(<DocsPage />)

describe('R13-F4: about page matches the live structure and copy', () => {
  it('renders the live sub-page chrome: container + ← Back to Home link', () => {
    expect(about).toContain('class="container mx-auto px-6 py-16 max-w-4xl"')
    expect(about).toMatch(
      /<a[^>]*class="text-sm text-primary hover:underline mb-6 inline-block"[^>]*href="\/"[^>]*>← Back to Home<\/a>/,
    )
  })

  it('renders the live H1 with the text-gradient-hero span', () => {
    expect(about).toContain('class="text-4xl sm:text-5xl font-bold text-foreground mb-4"')
    expect(about).toContain('<span class="text-gradient-hero">visitor intelligence.</span>')
    expect(about).toContain(
      'We&#x27;re building the future of',
    )
    expect(about).not.toContain('bg-primary px-2')
  })

  it('renders the live intro paragraph', () => {
    expect(about).toContain('class="text-lg text-muted-foreground max-w-2xl leading-relaxed"')
    expect(about).toContain(
      'Pixelco is the first and only platform that lets websites identify anonymous visitors by their email address',
    )
  })

  it('renders the mission section with the live rhythm', () => {
    expect(about).toContain('class="text-2xl font-bold text-foreground mb-3"')
    expect(about).toContain('97% of website visitors leave without ever filling out a form.')
  })

  it('renders the four value cards on the live card style', () => {
    expect(about).toContain('class="grid sm:grid-cols-2 gap-5"')
    const cards = about.match(/border border-border rounded-xl p-6 bg-card shadow-card/g) ?? []
    // 4 value cards + the stats band uses the same recipe
    expect(cards.length).toBeGreaterThanOrEqual(4)
    for (const title of ['Innovation First', 'Privacy by Design', 'Global Scale', 'Results-Driven']) {
      expect(about).toContain(title)
    }
    expect(about).toContain('lucide-lightbulb')
    expect(about).toContain('lucide-shield')
    expect(about).toContain('lucide-globe')
    expect(about).toContain('lucide-target')
  })

  it('renders the stats band with the live values', () => {
    expect(about).toContain('class="grid grid-cols-3 gap-6 text-center py-10 border border-border rounded-xl bg-card shadow-card"')
    for (const [stat, label] of [
      ['50+', 'Countries Served'],
      ['10M+', 'Visitors Identified'],
      ['2,000+', 'Businesses Trust Us'],
    ]) {
      expect(about).toContain(`class="text-3xl font-extrabold text-gradient-hero">${stat}</p>`)
      expect(about).toContain(label)
    }
  })

  it('renders the team section with the hiring note', () => {
    expect(about).toContain('Our Team')
    expect(about).toContain('lucide-users')
    expect(about).toContain('We&#x27;re hiring!')
    expect(about).toContain('href="mailto:support@pixelco.io"')
  })

  it('renders the CTA with the gradient button', () => {
    expect(about).toContain('Ready to see who&#x27;s visiting your site?')
    expect(about).toContain('gradient-cta')
    expect(about).toContain('Get Started Free')
  })
})

describe('R13-F5: docs page matches the live structure and copy', () => {
  it('renders the live chrome, H1 and subtitle', () => {
    expect(docs).toContain('class="container mx-auto px-6 py-16 max-w-4xl"')
    expect(docs).toMatch(
      /<a[^>]*class="text-sm text-primary hover:underline mb-6 inline-block"[^>]*href="\/"[^>]*>← Back to Home<\/a>/,
    )
    expect(docs).toContain('class="text-4xl font-bold text-foreground mb-3"')
    expect(docs).toContain('Get started with Pixelco in under 5 minutes.')
    expect(docs).toContain('class="text-muted-foreground mb-12 text-lg"')
  })

  it('renders the four numbered step cards with the live icons', () => {
    expect(docs).toContain('class="grid sm:grid-cols-2 gap-5 mb-14"')
    for (const step of [
      '1. Create Your Account',
      '2. Install the Pixel',
      '3. Verify Installation',
      '4. Start Identifying',
    ]) {
      expect(docs).toContain(`<h3 class="text-lg font-semibold text-foreground mb-2">${step}</h3>`)
    }
    for (const icon of ['lucide-settings', 'lucide-code', 'lucide-zap', 'lucide-chart-column']) {
      expect(docs).toContain(icon)
    }
  })

  it('renders the sample-snippet warning box (live classes)', () => {
    expect(docs).toContain(
      'class="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4 flex items-start gap-3"',
    )
    expect(docs).toContain('This is a sample snippet for illustration only.')
    expect(docs).toContain('class="text-sm text-yellow-300 leading-relaxed"')
    expect(docs).toContain('class="text-yellow-400"')
  })

  it('renders the SAMPLE badge + code block + copy button', () => {
    expect(docs).toContain('class="absolute top-3 left-3 bg-yellow-500/20 text-yellow-400 text-xs font-semibold px-2 py-0.5 rounded"')
    expect(docs).toContain('SAMPLE')
    expect(docs).toContain(
      'class="bg-card border border-yellow-500/20 rounded-xl p-5 pt-10 overflow-x-auto text-sm font-mono text-muted-foreground leading-relaxed opacity-80"',
    )
    expect(docs).toContain('cdn.pixelco.com/pixel.js')
    expect(docs).toContain('YOUR_SITE_ID')
    expect(docs).toContain('lucide-copy')
  })

  it('renders the six platform cards with the live copy', () => {
    expect(docs).toContain('class="space-y-4 mb-14"')
    for (const platform of ['WordPress', 'Shopify', 'Webflow', 'Wix', 'Next.js / React', 'Custom HTML']) {
      expect(docs).toContain(`<h3 class="text-base font-semibold text-foreground mb-1">${platform}</h3>`)
    }
    expect(docs).toContain('Go to Appearance → Theme Editor → header.php.')
  })

  it('renders the three common questions + contact CTA', () => {
    expect(docs).toContain('Does the pixel slow down my website?')
    expect(docs).toContain('Is the pixel GDPR compliant?')
    expect(docs).toContain('How quickly will I see results?')
    expect(docs).toContain('Need help? Reach out to our team.')
    expect(docs).toContain('>Contact Support<')
  })
})

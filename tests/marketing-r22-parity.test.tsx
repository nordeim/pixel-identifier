import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { DocsCopyButton } from '@/components/marketing/docs-copy-button'
import { ContactSupportButton } from '@/components/marketing/contact-support-button'

/**
 * R22 sub-page interaction parity pins (plan:
 * docs/plans/2026-09-19-round22-firstrun-activity-parity.md).
 *
 * Evidence base: runtime probes on the live docs page —
 *   - the copy button matches byte-for-byte (R13/R14 work) EXCEPT the
 *     copy-success check glyph carries text-green-500 on the live
 *   - "Contact Support" is a real <button> on the live (default variant +
 *     gradient tail, NO href — a dead button, live defect); the clone
 *     keeps the working mailto via onClick (the R17 contact-sales
 *     pattern: tag parity + functional divergence documented)
 */

const copyButton = readFileSync('src/components/marketing/docs-copy-button.tsx', 'utf-8')
const docsPage = readFileSync('src/app/(marketing)/docs/page.tsx', 'utf-8')
const contactSupport = readFileSync(
  'src/components/marketing/contact-support-button.tsx',
  'utf-8',
)

describe('R22 F8 — docs copy-success check glyph', () => {
  it('renders the Check with the live text-green-500', () => {
    const html = renderToStaticMarkup(<DocsCopyButton />)
    expect(html).not.toContain('text-green-500') // default state: Copy icon
    expect(copyButton).toContain('text-green-500')
  })
})

describe('R22 F9 — docs Contact Support (real button + onClick mailto)', () => {
  it('is a real button element (not an asChild anchor)', () => {
    const html = renderToStaticMarkup(<ContactSupportButton />)
    expect(html).toContain('>Contact Support</button>')
    expect(html).not.toContain('<a ')
    // the docs page mounts the button component (no asChild link remains)
    expect(docsPage).not.toContain('asChild')
    expect(docsPage).toContain('<ContactSupportButton />')
  })

  it('keeps the live merged class tail (variant-free consumer string)', () => {
    expect(contactSupport).toContain(
      'bg-primary hover:bg-primary/90 h-10 px-4 py-2 gradient-cta text-primary-foreground border-0 hover:opacity-90 font-semibold',
    )
  })

  it('navigates via onClick (no mailto href in the markup)', () => {
    expect(contactSupport).toContain('onClick')
    expect(contactSupport).toContain('mailto:support@pixelco.io')
    expect(contactSupport).not.toContain('href="mailto:')
  })
})

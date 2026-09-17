import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Faq, FAQS } from '@/components/marketing/faq-footer'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

/**
 * R13-F1/F2: the live ships the LEGACY shadcn accordion generation with the
 * exact class strings extracted from pixelco.io (research/round13-audit).
 * The item keeps ALL borders (no last:border-b-0 — that utility is the 1px
 * FAQ-section delta: last item 53px vs the live's 54px), the trigger is
 * items-center with no focus-ring suite, the chevron is the legacy
 * h-4 w-4 string, and the wrapper div is classless (reveal attrs only).
 *
 * Radix does not SSR closed accordion content (the outer div renders empty
 * + hidden), so the answer copy is asserted against the exported FAQS and
 * the inner content div against an OPEN item's static markup.
 */
const html = renderToStaticMarkup(<Faq />)

describe('R13-F1: FAQ accordion renders the live legacy class strings', () => {
  it('the list wrapper is classless (reveal attributes only)', () => {
    expect(html).toContain('data-reveal="16" data-reveal-delay="100">')
    expect(html).not.toContain('mt-10 space-y-2.5')
  })

  it('the accordion root carries the consumer space-y-2.5 and no data-slot', () => {
    expect(html).toMatch(/<div[^>]*class="space-y-2\.5"[^>]*data-orientation="vertical"/)
    expect(html).not.toContain('data-slot')
  })

  it('items render the live string — all borders kept, no last:border-b-0', () => {
    expect(html).toContain(
      'class="bg-background border border-border rounded-lg px-5 data-[state=open]:shadow-card"',
    )
    expect(html).not.toContain('last:border-b-0')
    // the item base `border-b` must merge away against the consumer `border`
    expect(html).not.toMatch(/class="[^"]*\bborder-b\b(?!order)/)
  })

  it('triggers render the live merged string (items-center, no ring suite)', () => {
    expect(html).toContain(
      'class="flex flex-1 items-center justify-between transition-all [&amp;[data-state=open]&gt;svg]:rotate-180 text-left font-semibold text-sm text-foreground hover:no-underline py-4"',
    )
    expect(html).not.toContain('focus-visible:ring')
    expect(html).not.toContain('items-start')
    expect(html).not.toContain('gap-4')
    expect(html).not.toContain('rounded-md')
  })

  it('chevrons are the legacy lucide string with h-4 w-4, not size-4', () => {
    expect(html).toContain(
      'class="lucide lucide-chevron-down h-4 w-4 shrink-0 transition-transform duration-200"',
    )
    expect(html).not.toContain('size-4 shrink-0')
    expect(html).not.toContain('translate-y-0.5')
  })

  it('the closed content outer div carries transition-all (new-gen dropped it)', () => {
    expect(html).toContain(
      'class="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"',
    )
  })

  it('an OPEN item renders the live inner content string (pt-0 base + consumer)', () => {
    const open = renderToStaticMarkup(
      <Accordion type="single" defaultValue="item-0">
        <AccordionItem value="item-0" className="bg-background border border-border rounded-lg px-5 data-[state=open]:shadow-card">
          <AccordionTrigger className="text-left font-semibold text-sm text-foreground hover:no-underline py-4">
            Question
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
            Answer body
          </AccordionContent>
        </AccordionItem>
      </Accordion>,
    )
    expect(open).toContain('class="pt-0 text-sm text-muted-foreground pb-4 leading-relaxed"')
    expect(open).toContain('Answer body')
    expect(open).toContain('data-state="open"')
  })
})

describe('R13-F2: the seven Q&A pairs are the live copy verbatim', () => {
  it('has exactly the seven live questions in order', () => {
    expect(FAQS.map((f) => f.q)).toEqual([
      'How does Pixelco identify visitors by email?',
      'Does it really work for B2C (individual) visitors?',
      'How do I install the pixel?',
      'Is this legal and privacy-compliant?',
      "What's the typical match rate?",
      'Can I export leads or integrate with my CRM?',
      "What happens if I exceed my plan's identification limit?",
    ])
  })

  it.each([
    [0, 'Pixelco uses a proprietary matching engine that cross-references anonymized visitor signals against our global identity graph. We match visitors to their real email address — no forms, no popups, no cookies required.'],
    [1, 'Yes! Unlike every other tool that only identifies companies via IP lookup, Pixelco is the first platform globally to identify individual consumers by personal email address — both B2B and B2C.'],
    [2, "Just paste one line of JavaScript into your website's <head> tag. It works on any platform — HTML, WordPress, Shopify, React, Webflow, and more. Setup takes under 30 seconds."],
    [3, 'Pixelco only identifies publicly matchable data and is built with GDPR and CCPA awareness. We do not sell or share your data. All matched emails are first-party data for your use only.'],
    [4, 'Most customers see a 15-25% match rate, meaning we can identify the email of roughly 1 in 4-7 anonymous visitors. Match rates vary by traffic source and geography.'],
    [5, 'Absolutely. Pixelco integrates with HubSpot, Salesforce, popular email platforms, Zapier, and webhooks. You can also export CSV files directly from the dashboard.'],
    [6, "You'll be charged per extra identification at your plan's overage rate ($0.20, $0.15, or $0.10 depending on your tier). We'll notify you when you're approaching your limit so you can upgrade if needed."],
  ])('answer %i is the live copy', (index, liveAnswer) => {
    expect(FAQS[index].a).toBe(liveAnswer)
  })

  it('answer 5 uses ASCII hyphens (the live), not en-dashes', () => {
    expect(FAQS[4].a).toContain('15-25% match rate')
    expect(FAQS[4].a).toContain('1 in 4-7 anonymous visitors')
    expect(FAQS[4].a).not.toContain('–')
  })
})

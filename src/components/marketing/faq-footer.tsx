'use client'

import Link from 'next/link'
import { ArrowRight, CircleCheckBig, ExternalLink, Globe, Mail } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { PixelcoMarketingWordmark } from '@/components/pixelco-logo'
import { FOOTER_COLUMNS } from '@/lib/marketing-links'

const FAQS = [
  {
    q: 'How does Pixelco identify visitors by email?',
    a: 'When someone visits your site, our pixel collects encrypted, privacy-safe signals (no cookies, no forms). Our identity graph cross-references those signals against deterministic first-party data partners to resolve the visitor to a real, verified email address — in real time, on average within seconds of the pageview.',
  },
  {
    q: 'Does it really work for B2C (individual) visitors?',
    a: 'Yes. Traditional visitor-identification tools only resolve the company behind an IP address. Pixelco is the first platform built for individual-level identification: we resolve the actual person — their personal Gmail, Outlook, or iCloud address — not just where they work.',
  },
  {
    q: 'How do I install the pixel?',
    a: 'Paste one line of JavaScript into the <head> section of your site. It works on hand-coded HTML, WordPress, Shopify, Webflow, React, and virtually any platform that lets you add a script tag. Setup takes about 30 seconds and requires no developer skills.',
  },
  {
    q: 'Is this legal and privacy-compliant?',
    a: 'Pixelco is fully cookieless — we never set tracking cookies or collect form data. Our identification is built on deterministic, consented first-party data from our partner network, and we operate in compliance with GDPR and CCPA. We publish a DPA, honor opt-out requests within 24 hours, and never resell your data.',
  },
  {
    q: "What's the typical match rate?",
    a: 'Most customers see a 15–25% match rate, meaning we can identify the email of roughly 1 in 4–7 anonymous visitors. Match rates vary by traffic source and geography.',
  },
  {
    q: 'Can I export leads or integrate with my CRM?',
    a: 'Yes. Every identified visitor can be exported as CSV with one click, or streamed into your CRM, email sequencer, or webhook endpoint. Push leads to HubSpot, Salesforce, or Zapier and trigger outreach automatically.',
  },
  {
    q: "What happens if I exceed my plan's identification limit?",
    a: 'On paid plans you never stop collecting data: once your monthly allowance is used up, additional identifications are billed at a low per-identification rate ($0.10–$0.20 depending on plan). On the Free plan, tracking continues but identification pauses until you upgrade.',
  },
]

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="py-20 bg-card border-y border-border">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">FAQ</span>
          <h2 id="faq-heading" className="text-3xl sm:text-4xl font-bold mt-2 text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground mt-3">Have questions? We&apos;ve got answers.</p>
        </div>

        {/* R7-V14: the live's FAQ items are cards (bg-background, border,
            rounded-lg, px-5) that gain a shadow when open — not the default
            border-b divider rhythm. */}
        <div className="mt-10 space-y-2.5">
          <Accordion type="single" collapsible className="space-y-2.5">
            {FAQS.map((faq, index) => (
              <AccordionItem
                key={faq.q}
                value={`item-${index}`}
                className="rounded-lg border border-border bg-background px-5 data-[state=open]:shadow-card"
              >
                <AccordionTrigger className="py-4 text-left text-sm font-semibold text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}

export function BottomCta() {
  return (
    <section aria-labelledby="cta-heading" className="py-20">
      <div className="container mx-auto px-6">
        {/* R7-V15/R10-F8: the live's CTA is a centered max-w-4xl card on the
            yellow marketing gradient with WHITE display text, a radial sheen
            overlay, and a check-icon trust row in white/70 text-xs. */}
        <div className="relative max-w-4xl mx-auto rounded-2xl gradient-hero-light p-6 sm:p-10 md:p-14 text-center overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_60%)]"
          />
          <div className="relative z-10">
            <h2 id="cta-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
              Stop Losing Anonymous Visitors.
            </h2>
            <p className="text-white/80 text-base sm:text-lg max-w-xl mx-auto mb-8">
              Join 1,200+ businesses already turning invisible website traffic into
              real, actionable leads with Pixelco.
            </p>
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto border-0 bg-background px-8 text-base font-semibold text-foreground hover:bg-background/90 h-12"
            >
              <Link href="/signup">
                Start Identifying Visitors — Free
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mt-6 text-white/70 text-xs">
              {['No credit card required', '100 free identifications', 'GDPR compliant'].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CircleCheckBig className="h-3.5 w-3.5" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function SiteFooter() {
  return (
    // R10-F11: the live footer — a plain mt-20 wrapper, a full-bleed
    // bg-background band for the columns (container py-14, 5-column
    // responsive grid with col-span utilities), and a separate tinted
    // bg-card/50 band for the bottom bar.
    <footer className="mt-20">
      <div className="border-t border-border bg-background">
        <div className="container mx-auto px-6 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
            <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
              {/* R11: the live wraps the wordmark in a home link (gap-2 mb-4). */}
              <Link href="/" className="flex items-center gap-2 mb-4 focus-brand rounded-lg" aria-label="Pixelco home">
                <PixelcoMarketingWordmark />
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-5">
                The world&apos;s first B2C email identification platform. Know
                who&apos;s visiting your site — by their real email.
              </p>
              <div className="flex items-center gap-3">
                {[
                  // R7: the live's footer social icons (globe, external-link,
                  // mail); the first two are '#' placeholders on the live too.
                  { icon: Globe, label: 'Pixelco website', href: '#' },
                  { icon: ExternalLink, label: 'Pixelco external links', href: '#' },
                  { icon: Mail, label: 'Email Pixelco', href: 'mailto:support@pixelco.io' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-8 h-8 rounded-md bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors focus-brand"
                  >
                    <social.icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>

            {FOOTER_COLUMNS.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
                  {column.title}
                </h3>
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith('mailto:') ? (
                        <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-brand">
                          {link.label}
                        </a>
                      ) : link.href === '#' ? (
                        // Careers: dead on the original pixelco.io footer too —
                        // but it still renders a real anchor there (parity).
                        <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-brand">
                          {link.label}
                        </a>
                      ) : (
                        <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-brand">
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-card/50">
        <div className="container mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Pixelco. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">Made with precision for marketers who want results.</p>
        </div>
      </div>
    </footer>
  )
}

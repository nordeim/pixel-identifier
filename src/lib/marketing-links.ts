/**
 * Single source of truth for marketing-surface navigation and footer links.
 *
 * Why a data module: the footer must route to the real page set the
 * original pixelco.io serves (about, blog, docs, privacy, terms, gdpr,
 * ccpa — verified against its live sitemap.xml), and nav anchors must work
 * from any sub-page. Centralising the map keeps the header, footer and the
 * link-integrity test in sync.
 */

export interface MarketingLink {
  label: string
  href: string
  /**
   * True for links that intentionally go nowhere. Careers is dead on the
   * original pixelco.io footer too (a `#` href in its bundle) — parity,
   * not an oversight. Do not "fix" without checking the original.
   */
  dead?: true
}

/** Top navigation — `/#anchor` form so the links work from sub-pages. */
export const NAV_LINKS: MarketingLink[] = [
  { label: 'Benefits', href: '/#benefits' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'FAQ', href: '/#faq' },
]

export interface FooterColumn {
  title: string
  links: MarketingLink[]
}

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/#benefits' },
      { label: 'Pricing', href: '/#pricing' },
      { label: 'How It Works', href: '/#how-it-works' },
      { label: 'Documentation', href: '/docs' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      // The original footer links Contact as a mailto, not a page.
      { label: 'Contact', href: 'mailto:support@pixelco.io' },
      // Dead on the original as well — kept for parity (see MarketingLink.dead).
      { label: 'Careers', href: '#', dead: true },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'GDPR', href: '/gdpr' },
      { label: 'CCPA', href: '/ccpa' },
    ],
  },
]

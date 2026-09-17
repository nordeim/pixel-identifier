import type { Metadata } from 'next'
import { LegalPage } from '@/components/marketing/legal-page'
import { marketingMetadata } from '@/lib/marketing-seo'

// R14-F2/F3: title + description are the live copy verbatim.
export const metadata: Metadata = marketingMetadata({
  title: 'Terms of Service | Pixelco',
  description:
    "Read Pixelco's Terms of Service. Understand your rights, obligations, acceptable use, billing, and liability when using our visitor identification platform.",
  path: '/terms',
})

export default function TermsPage() {
  return <LegalPage slug="terms" />
}

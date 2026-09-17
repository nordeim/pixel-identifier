import type { Metadata } from 'next'
import { LegalPage } from '@/components/marketing/legal-page'
import { marketingMetadata } from '@/lib/marketing-seo'

// R14-F2/F3: title + description are the live copy verbatim.
export const metadata: Metadata = marketingMetadata({
  title: 'CCPA / CPRA Compliance | Pixelco',
  description:
    "Pixelco's CCPA/CPRA compliance page. Learn about your California privacy rights, data categories collected, opt-out options, and how to submit requests.",
  path: '/ccpa',
})

export default function CcpaPage() {
  return <LegalPage slug="ccpa" />
}

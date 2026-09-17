import type { Metadata } from 'next'
import { LegalPage } from '@/components/marketing/legal-page'
import { marketingMetadata } from '@/lib/marketing-seo'

// R14-F2/F3: title + description are the live copy verbatim.
export const metadata: Metadata = marketingMetadata({
  title: 'GDPR Compliance | Pixelco',
  description:
    'Learn how Pixelco complies with GDPR. Understand data subject rights, lawful basis for processing, DPAs, international transfers, and breach notification procedures.',
  path: '/gdpr',
})

export default function GdprPage() {
  return <LegalPage slug="gdpr" />
}

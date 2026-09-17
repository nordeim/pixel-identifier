import type { Metadata } from 'next'
import { LegalPage } from '@/components/marketing/legal-page'
import { marketingMetadata } from '@/lib/marketing-seo'

// R14-F2/F3: title + description are the live copy verbatim.
export const metadata: Metadata = marketingMetadata({
  title: 'Privacy Policy | Pixelco',
  description:
    "Pixelco's Privacy Policy explains how we collect, use, and protect your data. Learn about our visitor identification practices, data retention, and your rights.",
  path: '/privacy',
})

export default function PrivacyPage() {
  return <LegalPage slug="privacy" />
}

import type { Metadata } from 'next'
import { LegalPage } from '@/components/marketing/legal-page'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Pixelco collects, uses, shares, and protects information — including visitor data collected via the pixel and identity-resolution data.',
}

export default function PrivacyPage() {
  return <LegalPage slug="privacy" />
}

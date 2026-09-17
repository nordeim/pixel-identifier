import type { Metadata } from 'next'
import { LegalPage } from '@/components/marketing/legal-page'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms governing your use of the Pixelco visitor identification platform.',
}

export default function TermsPage() {
  return <LegalPage slug="terms" />
}

import type { Metadata } from 'next'
import { LegalPage } from '@/components/marketing/legal-page'

export const metadata: Metadata = {
  title: 'CCPA / CPRA Compliance',
  description: 'Pixelco’s compliance with the California Consumer Privacy Act and California Privacy Rights Act: categories, purposes, rights, and opt-out.',
}

export default function CcpaPage() {
  return <LegalPage slug="ccpa" />
}

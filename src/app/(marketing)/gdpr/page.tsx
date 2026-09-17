import type { Metadata } from 'next'
import { LegalPage } from '@/components/marketing/legal-page'

export const metadata: Metadata = {
  title: 'GDPR Compliance',
  description: 'Pixelco’s GDPR posture: roles, lawful bases, data subject rights, DPA, international transfers, and breach notification.',
}

export default function GdprPage() {
  return <LegalPage slug="gdpr" />
}

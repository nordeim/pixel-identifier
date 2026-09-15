import type { Metadata } from 'next'
import {
  LegalList,
  LegalPage,
  LegalSection,
  LegalSub,
  SUPPORT_EMAIL,
} from '@/components/marketing/legal-page'

export const metadata: Metadata = {
  title: 'CCPA / CPRA Compliance',
  description:
    'Pixelco\u2019s compliance with the California Consumer Privacy Act and California Privacy Rights Act: categories, purposes, rights, and opt-out.',
}

const CATEGORIES: { category: string; examples: string; collected: string }[] = [
  {
    category: 'Identifiers',
    examples: 'Name, email, IP address, account ID',
    collected: 'Yes',
  },
  {
    category: 'Commercial Information',
    examples: 'Subscription plans, billing history, usage records',
    collected: 'Yes',
  },
  {
    category: 'Internet/Network Activity',
    examples: 'Browsing history, pages visited, referral sources, click data',
    collected: 'Yes',
  },
  {
    category: 'Geolocation Data',
    examples: 'Approximate location derived from IP address',
    collected: 'Yes',
  },
  {
    category: 'Professional/Employment Info',
    examples: 'Company name, job title (from identity resolution)',
    collected: 'Yes',
  },
  {
    category: 'Inferences',
    examples: 'Visitor intent, interest profiles, lead scoring',
    collected: 'Yes',
  },
]

export default function CcpaPage() {
  return (
    <LegalPage title="CCPA / CPRA Compliance" lastUpdated="April 14, 2026">
      <LegalSection id="overview" heading="1. Overview">
        <p>
          The California Consumer Privacy Act (CCPA), as amended by the
          California Privacy Rights Act (CPRA), gives California residents
          rights over the Personal Information that businesses collect about
          them. This page explains how those rights apply to Pixelco. It
          complements — and is governed by — our{' '}
          <a
            href="/privacy"
            className="font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-800 focus-brand"
          >
            Privacy Policy
          </a>
          , which remains the authoritative description of our practices.
        </p>
        <p>
          Nothing in this page limits rights you have under other laws.
          Where another framework (such as the GDPR) grants you stronger
          rights, we honor the stronger protection.
        </p>
      </LegalSection>

      <LegalSection id="categories" heading="2. Categories of Personal Information Collected">
        <p>
          In the preceding 12 months, we have collected the following
          categories of Personal Information:
        </p>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                <th scope="col" className="px-4 py-2.5 font-semibold text-foreground">Category</th>
                <th scope="col" className="px-4 py-2.5 font-semibold text-foreground">Examples</th>
                <th scope="col" className="px-4 py-2.5 font-semibold text-foreground">Collected</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((row) => (
                <tr key={row.category} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-2.5 font-medium text-foreground">{row.category}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{row.examples}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{row.collected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          We do not collect or process sensitive Personal Information (as
          defined by CPRA) such as social security numbers, health data, or
          precise geolocation, and we do not use Personal Information to
          train third-party generative AI models.
        </p>
      </LegalSection>

      <LegalSection id="sources" heading="3. Sources of Personal Information">
        <LegalSub heading="Directly from you">
          Account registration details, billing information, and support
          communications.
        </LegalSub>
        <LegalSub heading="Automatically">
          Visit signals collected via the pixel installed on Customer
          websites, and log data from our own site and services.
        </LegalSub>
        <LegalSub heading="Third-party sources">
          Deterministic, consented first-party data partners used for
          identity resolution.
        </LegalSub>
      </LegalSection>

      <LegalSection id="purposes" heading="4. Business Purposes for Collection">
        <LegalList
          items={[
            'Providing, operating, and improving our identity resolution services',
            'Processing transactions and managing Customer accounts',
            'Matching anonymous visitors to known identity records for our Customers',
            'Detecting and preventing fraud and security incidents',
            'Debugging and repairing errors in our technology',
            'Complying with legal obligations and enforcing our terms',
          ]}
        />
      </LegalSection>

      <LegalSection id="sharing" heading="5. Sharing & Disclosure">
        <p>
          We disclose Personal Information only to: Customers (identity
          results from their own traffic), service providers bound by
          contractual privacy obligations (hosting, payments, email), and
          recipients required by legal process. We do not sell or share
          Personal Information for cross-context behavioral advertising, as
          those terms are defined by the CCPA/CPRA.
        </p>
      </LegalSection>

      <LegalSection id="retention" heading="6. Retention">
        <p>
          Personal Information is retained for the period necessary to
          fulfill the purposes described in this page: account data for the
          life of the account (plus 30 days), identity-resolution data for
          up to 12 months, and billing records as required by tax law.
        </p>
      </LegalSection>

      <LegalSection id="rights" heading="7. Your Rights Under CCPA/CPRA">
        <p>California residents have the right to:</p>
        <LegalList
          items={[
            <>
              <strong className="text-foreground">Know</strong> — request disclosure of the
              categories and specific pieces of Personal Information we have
              collected about you.
            </>,
            <>
              <strong className="text-foreground">Delete</strong> — request deletion of your
              Personal Information, subject to legal retention obligations.
            </>,
            <>
              <strong className="text-foreground">Correct</strong> — request correction of
              inaccurate Personal Information (CPRA).
            </>,
            <>
              <strong className="text-foreground">Opt out</strong> — because we do not sell or
              share Personal Information for cross-context behavioral
              advertising, no opt-out is required; our identification is
              disclosed in Customer privacy policies and can be disabled via
              opt-out requests.
            </>,
            <>
              <strong className="text-foreground">Non-discrimination</strong> — exercising any
              of these rights will never result in discriminatory treatment.
            </>,
            <>
              <strong className="text-foreground">Limit use of sensitive data</strong> — not
              applicable; we do not collect sensitive Personal Information.
            </>,
          ]}
        />
        <p>
          To exercise any right, email{' '}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-800 focus-brand"
          >
            {SUPPORT_EMAIL}
          </a>{' '}
          with &quot;California Privacy Request&quot; in the subject line. We will
          verify your request as required by law and respond within 45 days.
        </p>
      </LegalSection>

      <LegalSection id="contact" heading="8. Contact">
        <p>
          Questions about this page or our California privacy practices:{' '}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-800 focus-brand"
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  )
}

import type { Metadata } from 'next'
import {
  LegalList,
  LegalPage,
  LegalSection,
  LegalSub,
  SUPPORT_EMAIL,
} from '@/components/marketing/legal-page'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Pixelco collects, uses, shares, and protects information — including visitor data collected via the pixel and identity-resolution data.',
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="April 14, 2026">
      <LegalSection id="introduction" heading="1. Introduction">
        <p>
          Pixelco (&quot;Pixelco&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;) provides a
          visitor identification platform that helps websites understand who
          is browsing their site. This Privacy Policy explains what
          information we collect, how we use it, and the choices available
          to you. It applies to the Pixelco website, dashboard, and pixel
          technology.
        </p>
        <p>
          By using Pixelco, you agree to the practices described in this
          policy. If you are a Customer deploying our pixel on your website,
          you also accept the responsibilities described in Section 3 and our
          Terms of Service.
        </p>
      </LegalSection>

      <LegalSection id="definitions" heading="2. Definitions">
        <LegalList
          items={[
            <>
              <strong className="text-foreground">Customer</strong> — a business or individual
              with a Pixelco account that deploys the pixel on a website they
              own or control.
            </>,
            <>
              <strong className="text-foreground">Visitor</strong> — a person who browses a
              Customer&apos;s website where the pixel is installed.
            </>,
            <>
              <strong className="text-foreground">Personal Data</strong> — any information
              relating to an identifiable person, as defined by the GDPR and
              similar laws.
            </>,
            <>
              <strong className="text-foreground">Identity Resolution</strong> — the process of
              matching privacy-safe visit signals against deterministic,
              consented first-party data sources to resolve a visitor&apos;s
              email address.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection id="information-we-collect" heading="3. Information We Collect">
        <LegalSub heading="3.1 Customer Information">
          <p>When you register for a Pixelco account, we collect:</p>
          <LegalList
            items={[
              'Full name and email address',
              'Company name, website URL, and industry',
              'Account credentials and preferences',
              'Communication records with our support team',
            ]}
          />
        </LegalSub>

        <LegalSub heading="3.2 Visitor Data (Collected via Pixel)">
          <p>
            Our pixel technology collects the following from website
            visitors:
          </p>
          <LegalList
            items={[
              'IP address (used for geolocation, then hashed or anonymized)',
              'Browser type, version, and language settings',
              'Device type, operating system, and screen resolution',
              'Pages visited, time on page, scroll depth, and click events',
              'Referral source and UTM parameters',
              'Cookies and similar tracking identifiers',
            ]}
          />
        </LegalSub>

        <LegalSub heading="3.3 Identity Resolution Data">
          <p>
            For Visitors who are successfully matched, we resolve: the
            visitor&apos;s email address, visitor type (individual consumer or
            business contact), company name and firmographic data for
            business visitors, and a confidence score for the match. This
            resolution relies on deterministic, consented first-party data
            sources.
          </p>
        </LegalSub>

        <LegalSub heading="3.4 Automatically Collected Information">
          <p>
            Like most online services, we automatically collect log data
            (IP address, browser type, access times) and usage analytics to
            maintain security and improve the service.
          </p>
        </LegalSub>
      </LegalSection>

      <LegalSection id="how-we-use" heading="4. How We Use Information">
        <p>We use the information we collect to:</p>
        <LegalList
          items={[
            'To provide, operate, and maintain our visitor identification services',
            'To deliver analytics, insights, and reporting to Customers',
            'To process payments and manage subscriptions',
            'To send transactional emails, service updates, and product announcements',
            'To improve, personalize, and optimize our technology, algorithms, and services',
            'To detect, prevent, and address fraud, abuse, and security issues',
            'To comply with legal obligations and enforce our terms',
            'To respond to Customer support requests',
          ]}
        />
      </LegalSection>

      <LegalSection id="legal-basis" heading="5. Legal Basis for Processing (EEA/UK)">
        <p>Under the GDPR, we process Personal Data based on:</p>
        <LegalSub heading="Contractual necessity">
          Processing Customer account data to deliver the service you signed
          up for.
        </LegalSub>
        <LegalSub heading="Legitimate interests">
          Operating and securing our platform, improving our services, and
          enabling Customers to conduct legitimate B2B outreach based on
          their website traffic, balanced against the rights of data
          subjects.
        </LegalSub>
        <LegalSub heading="Consent">
          Where required by law or where a Visitor or Customer has provided
          explicit consent, we process data on that consent, which can be
          withdrawn at any time.
        </LegalSub>
        <LegalSub heading="Legal obligation">
          Retaining records and disclosing data where required by law.
        </LegalSub>
      </LegalSection>

      <LegalSection id="data-sharing" heading="6. Data Sharing & Third Parties">
        <p>We share data only in these limited circumstances:</p>
        <LegalSub heading="With Customers">
          Identity-resolution results about Visitors on the Customer&apos;s own
          website are disclosed to that Customer. We never sell or share
          one Customer&apos;s data with another.
        </LegalSub>
        <LegalSub heading="Service Providers">
          Vendors who host our infrastructure, process payments, or deliver
          email — bound by data processing agreements and limited to what
          the task requires.
        </LegalSub>
        <LegalSub heading="Legal Requirements">
          Disclosure in response to valid legal process, or to protect our
          rights, property, or the safety of others.
        </LegalSub>
        <LegalSub heading="Business Transfers">
          Data may be transferred as part of a merger or acquisition, with
          notice where appropriate.
        </LegalSub>
        <LegalSub heading="With Your Consent">
          Any other sharing we undertake with your explicit permission.
        </LegalSub>
      </LegalSection>

      <LegalSection id="cookies" heading="7. Cookies & Tracking Technologies">
        <p>
          Our core identification technology is cookieless: the pixel does
          not place tracking cookies on Visitors&apos; devices. We use a small
          number of strictly necessary cookies for the authenticated
          dashboard (session integrity) and privacy-respecting analytics for
          our own marketing site. You can control cookies through your
          browser settings; disabling them does not affect pixel operation.
        </p>
      </LegalSection>

      <LegalSection id="retention" heading="8. Data Retention">
        <LegalSub heading="Customer Data">
          Retained for the life of the account and deleted within 30 days of
          account closure.
        </LegalSub>
        <LegalSub heading="Visitor Identification Data">
          Retained for 12 months from the identification event, or sooner if
          the originating Customer deletes the record or closes their
          account.
        </LegalSub>
        <LegalSub heading="Behavioral/Analytics Data">
          Aggregated and anonymized after 90 days.
        </LegalSub>
        <LegalSub heading="Billing Records">
          Retained for 7 years as required by tax and accounting law.
        </LegalSub>
      </LegalSection>

      <LegalSection id="security" heading="9. Data Security">
        <p>We protect data with industry-standard measures, including:</p>
        <LegalList
          items={[
            'Encryption in transit (TLS 1.2+) and at rest (AES-256)',
            'Role-based access controls and least-privilege principles',
            'Regular penetration testing and security audits',
            'SOC 2 Type II compliant infrastructure',
            'Automated threat detection and incident response procedures',
          ]}
        />
      </LegalSection>

      <LegalSection id="your-rights" heading="10. Your Rights">
        <p>
          Depending on your jurisdiction, you may have the following rights:
        </p>
        <LegalList
          items={[
            <>
              <strong className="text-foreground">Access</strong> — request a copy of the
              Personal Data we hold about you.
            </>,
            <>
              <strong className="text-foreground">Rectification</strong> — correct inaccurate
              or incomplete data.
            </>,
            <>
              <strong className="text-foreground">Erasure</strong> — request deletion of your
              Personal Data.
            </>,
            <>
              <strong className="text-foreground">Restriction</strong> — ask us to pause
              processing in certain circumstances.
            </>,
            <>
              <strong className="text-foreground">Portability</strong> — receive your data in
              a machine-readable format.
            </>,
            <>
              <strong className="text-foreground">Objection</strong> — object to processing
              based on legitimate interests.
            </>,
            <>
              <strong className="text-foreground">Withdraw Consent</strong> — where processing
              is based on consent.
            </>,
            <>
              <strong className="text-foreground">Non-Discrimination</strong> — exercising
              these rights never degrades your access to the service.
            </>,
          ]}
        />
        <p>
          To exercise any right, email us at{' '}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-800 focus-brand"
          >
            {SUPPORT_EMAIL}
          </a>
          . See our GDPR and CCPA pages for jurisdiction-specific details.
        </p>
      </LegalSection>

      <LegalSection id="international-transfers" heading="11. International Data Transfers">
        <p>
          We operate globally, and data may be processed in countries other
          than your own. Where Personal Data of EEA/UK residents is
          transferred outside those regions, we rely on adequacy decisions,
          Standard Contractual Clauses, or supplementary technical and
          organizational measures.
        </p>
      </LegalSection>

      <LegalSection id="children" heading="12. Children's Privacy">
        <p>
          Pixelco is not directed at children under 16, and Customers may
          not deploy the pixel on websites directed at children. We do not
          knowingly collect data from children. If you believe a child has
          provided Personal Data through a pixel-equipped site, contact us
          and we will delete it.
        </p>
      </LegalSection>

      <LegalSection id="changes" heading="13. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. Material
          changes will be announced on this page (see the &quot;Last
          updated&quot; date above) and, for significant changes to how we
          process Customer data, by email to account holders.
        </p>
      </LegalSection>

      <LegalSection id="contact" heading="14. Contact Us">
        <p>If you have questions about this Privacy Policy, contact us:</p>
        <LegalList
          items={[
            <>
              Email:{' '}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-800 focus-brand"
              >
                {SUPPORT_EMAIL}
              </a>
            </>,
            <>
              GDPR-specific requests: see our{' '}
              <a href="/gdpr" className="font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-800 focus-brand">
                GDPR Compliance
              </a>{' '}
              page
            </>,
            <>
              California residents: see our{' '}
              <a href="/ccpa" className="font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-800 focus-brand">
                CCPA / CPRA
              </a>{' '}
              page
            </>,
          ]}
        />
      </LegalSection>
    </LegalPage>
  )
}

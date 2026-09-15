import type { Metadata } from 'next'
import {
  LegalList,
  LegalPage,
  LegalSection,
  LegalSub,
  SUPPORT_EMAIL,
} from '@/components/marketing/legal-page'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The terms governing your use of the Pixelco visitor identification platform.',
}

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="April 14, 2026">
      <LegalSection id="acceptance" heading="1. Acceptance of Terms">
        <p>
          By accessing or using Pixelco (&quot;the Services&quot;), you agree to be
          bound by these Terms of Service (&quot;Terms&quot;) and our Privacy
          Policy. If you do not agree, do not use the Services. If you use
          the Services on behalf of a company, you represent that you have
          authority to bind that company to these Terms.
        </p>
      </LegalSection>

      <LegalSection id="description" heading="2. Description of Service">
        <p>
          Pixelco provides a website visitor identification platform.
          Customers install a pixel script on websites they own or control;
          the Services collect visit signals, resolve visitor identities
          (including email addresses and company information) from
          deterministic data sources, and present the results in a
          dashboard with analytics and export capabilities.
        </p>
        <p>
          Identification capabilities depend on the traffic profile of each
          website; match rates vary and are not guaranteed for any
          individual visitor.
        </p>
      </LegalSection>

      <LegalSection id="eligibility" heading="3. Eligibility">
        <p>
          You must be at least 18 years old and able to form a binding
          contract to use the Services. Accounts registered by persons under
          16 are prohibited, and the pixel may not be deployed on websites
          directed at children.
        </p>
      </LegalSection>

      <LegalSection id="account" heading="4. Account Registration & Security">
        <LegalList
          items={[
            'You must provide accurate, complete, and current registration information.',
            'You are responsible for all activities that occur under your account.',
            'You are responsible for maintaining the confidentiality of your credentials and for notifying us immediately of any unauthorized use.',
            'One person or legal entity may not maintain multiple accounts to circumvent plan limits or free-tier allowances.',
          ]}
        />
      </LegalSection>

      <LegalSection id="acceptable-use" heading="5. Acceptable Use Policy">
        <p>You agree to use Pixelco only for lawful purposes. You shall NOT:</p>
        <LegalList
          items={[
            'Use identified data for harassment, stalking, or discrimination.',
            'Send spam in violation of CAN-SPAM, CASL, or equivalent laws.',
            'Use the Services on websites you don\u2019t own or have authorization to instrument.',
            'Reverse-engineer our proprietary algorithms or database.',
            'Resell or redistribute identified visitor data without written consent.',
            'Violate applicable data protection laws (GDPR, CCPA, PIPEDA, etc.).',
            'Deploy the pixel on websites directed at children under 16.',
          ]}
        />
      </LegalSection>

      <LegalSection id="customer-compliance" heading="6. Customer Compliance Obligations">
        <p>As a Customer, you are responsible for:</p>
        <LegalList
          items={[
            <>
              Including clear disclosure of Pixelco and its purposes in your{' '}
              <a
                href="/privacy"
                className="font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-800 focus-brand"
              >
                privacy policy
              </a>
              .
            </>,
            'Obtaining required consents from visitors as mandated by applicable laws.',
            'Honoring opt-out, deletion, and access requests from identified individuals.',
            'Ensuring your outreach to identified visitors complies with applicable marketing and anti-spam laws.',
          ]}
        />
      </LegalSection>

      <LegalSection id="ip-ownership" heading="7. Intellectual Property & Data Ownership">
        <LegalSub heading="Your Data">
          You retain all rights to the content on your website and your
          account information. You may export or delete your data at any
          time.
        </LegalSub>
        <LegalSub heading="Our Technology">
          The Pixelco platform, including the pixel, algorithms, identity
          resolution engine, and dashboard, is our intellectual property.
          These Terms grant you a limited, revocable, non-exclusive license
          to use the Services.
        </LegalSub>
        <LegalSub heading="Identified Data">
          Identity-resolution results generated from your website traffic
          are licensed to you for your business use during the subscription
          term; they may not be resold or redistributed without written
          consent.
        </LegalSub>
        <LegalSub heading="Aggregated Data">
          We may use de-identified, aggregated statistics (never tied to an
          identifiable individual or a specific Customer) to improve the
          Services.
        </LegalSub>
      </LegalSection>

      <LegalSection id="payment" heading="8. Payment, Billing & Refunds">
        <LegalList
          items={[
            'Paid plans are billed monthly or annually as selected.',
            'All fees are in USD and exclusive of applicable taxes.',
            'All fees are non-refundable except as required by law.',
            'Pricing changes require at least 30 days\u2019 notice.',
            'Failure to pay may result in account suspension after a 7-day grace period.',
          ]}
        />
        <p>
          Overage: on paid plans, identifications beyond the monthly
          allowance continue to be delivered and are metered at the
          per-identification rate published on the pricing page.
        </p>
      </LegalSection>

      <LegalSection id="sla" heading="9. Service Level & Availability">
        <p>
          We target high availability but do not guarantee uninterrupted
          service. We may modify or discontinue any part of the Services
          with reasonable notice. Maintenance windows are announced in the
          dashboard where practicable.
        </p>
      </LegalSection>

      <LegalSection id="data-processing" heading="10. Data Processing & Privacy">
        <p>
          Our collection and handling of data is described in the Privacy
          Policy, which is incorporated into these Terms. Customers
          operating in the EEA/UK may request execution of our Data
          Processing Agreement.
        </p>
      </LegalSection>

      <LegalSection id="disclaimers" heading="11. Disclaimers & Limitation of Liability">
        <p>
          THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT
          WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
          NON-INFRINGEMENT. WE DO NOT WARRANT THAT IDENTIFICATION RESULTS
          ARE ERROR-FREE OR THAT THE SERVICES WILL BE UNINTERRUPTED.
        </p>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR AGGREGATE LIABILITY
          ARISING OUT OF OR RELATING TO THE SERVICES SHALL NOT EXCEED THE
          AMOUNTS PAID OR PAYABLE BY YOU TO US IN THE TWELVE (12) MONTHS
          PRECEDING THE EVENT GIVING RISE TO THE CLAIM. WE ARE NOT LIABLE
          FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
          DAMAGES, OR FOR LOST PROFITS OR DATA.
        </p>
      </LegalSection>

      <LegalSection id="indemnification" heading="12. Indemnification">
        <p>
          You agree to indemnify and hold harmless Pixelco and its
          affiliates from any claims, damages, and expenses (including
          reasonable legal fees) arising from your use of the Services, your
          breach of these Terms, or your violation of applicable law,
          including data protection obligations owed to visitors identified
          through your website.
        </p>
      </LegalSection>

      <LegalSection id="termination" heading="13. Termination">
        <LegalList
          items={[
            'You may cancel your account at any time.',
            'We may suspend or terminate for violation of these Terms or non-payment.',
            'Data is retained for 30 days post-termination for export, then deleted.',
            'Sections 7, 11, 12, 14, and 15 survive termination.',
          ]}
        />
      </LegalSection>

      <LegalSection id="governing-law" heading="14. Governing Law">
        <p>
          These Terms are governed by the laws of the State of Delaware,
          USA, without regard to conflict-of-law principles. You agree to
          personal jurisdiction in the courts located there, except where
          mandatory consumer-protection law of your residence provides
          otherwise.
        </p>
      </LegalSection>

      <LegalSection id="disputes" heading="15. Dispute Resolution">
        <p>
          The parties will first attempt to resolve any dispute informally
          for at least 30 days. Unresolved disputes will be resolved by
          binding arbitration rather than in court, except that either
          party may bring a claim in small-claims court or seek injunctive
          relief for intellectual property infringement.
        </p>
      </LegalSection>

      <LegalSection id="contact" heading="16. Contact">
        <p>
          Questions about these Terms? Email{' '}
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

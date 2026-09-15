import type { Metadata } from 'next'
import {
  LegalList,
  LegalPage,
  LegalSection,
  LegalSub,
  SUPPORT_EMAIL,
} from '@/components/marketing/legal-page'

export const metadata: Metadata = {
  title: 'GDPR Compliance',
  description:
    'Pixelco\u2019s GDPR posture: roles, lawful bases, data subject rights, DPA, international transfers, and breach notification.',
}

export default function GdprPage() {
  return (
    <LegalPage title="GDPR Compliance" lastUpdated="April 14, 2026">
      <LegalSection id="commitment" heading="1. Our Commitment to GDPR">
        <p>
          The General Data Protection Regulation (GDPR) sets the world&apos;s
          highest bar for personal-data protection, and we built Pixelco to
          clear it. This page explains how the regulation maps onto visitor
          identification: who plays which role, on what legal basis we
          process data, and how data subject rights are honored. It
          complements — and is governed by — our Privacy Policy.
        </p>
      </LegalSection>

      <LegalSection id="roles" heading="2. Roles & Responsibilities">
        <p>
          GDPR assigns responsibilities based on who determines the purpose
          and means of processing. With Pixelco the split is as follows:
        </p>
        <LegalSub heading="Pixelco as Data Controller">
          For our own marketing site, account registrations, billing, and
          platform operations, Pixelco determines the purposes and is the
          controller for that data.
        </LegalSub>
        <LegalSub heading="Pixelco as Data Processor">
          For visit signals collected from a Customer&apos;s website and the
          resulting identity resolutions, the Customer determines the
          purpose; Pixelco processes on their behalf under a Data Processing
          Agreement.
        </LegalSub>
        <LegalSub heading="Joint Controller Scenarios">
          Because the identity-resolution match decision is made by
          Pixelco&apos;s engine at the Customer&apos;s direction, limited joint
          controller arrangements may apply; our DPA addresses this and can
          be supplemented with a joint-controller agreement where required.
        </LegalSub>
      </LegalSection>

      <LegalSection id="lawful-basis" heading="3. Lawful Basis for Processing">
        <p>We process Personal Data under one or more of the following legal bases:</p>
        <LegalSub heading="Consent (Art. 6(1)(a))">
          Where a Visitor or Customer has given explicit consent, and where
          member-state law or ePrivacy rules require consent for the
          collection or outreach step in question.
        </LegalSub>
        <LegalSub heading="Contractual Performance (Art. 6(1)(b))">
          Processing Customer account data and delivering the Services the
          Customer subscribed to.
        </LegalSub>
        <LegalSub heading="Legitimate Interest (Art. 6(1)(f))">
          Enabling Customers to conduct relevant, proportionate B2B outreach
          based on visits to their own website, after a documented balancing
          test that weighs the visitor&apos;s reasonable expectations.
        </LegalSub>
        <LegalSub heading="Legal Obligation (Art. 6(1)(c))">
          Retaining records and responding to lawful requests where required
          by law.
        </LegalSub>
      </LegalSection>

      <LegalSection id="rights" heading="4. Data Subject Rights">
        <p>
          Every right the GDPR grants is exercisable against us. Requests go
          to{' '}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-800 focus-brand"
          >
            {SUPPORT_EMAIL}
          </a>{' '}
          and are handled within one month.
        </p>
        <LegalList
          items={[
            <>
              <strong className="text-foreground">Right of Access (Art. 15)</strong> — receive
              confirmation of processing and a copy of your Personal Data.
            </>,
            <>
              <strong className="text-foreground">Right to Rectification (Art. 16)</strong> —
              correct inaccurate or incomplete data.
            </>,
            <>
              <strong className="text-foreground">Right to Erasure (Art. 17)</strong> — deletion
              of your Personal Data where no overriding ground applies.
            </>,
            <>
              <strong className="text-foreground">Right to Restriction (Art. 18)</strong> —
              freeze processing while a dispute is resolved.
            </>,
            <>
              <strong className="text-foreground">Right to Data Portability (Art. 20)</strong> —
              receive your data in a structured, machine-readable format.
            </>,
            <>
              <strong className="text-foreground">Right to Object (Art. 21)</strong> — object to
              processing based on legitimate interests, including
              identification-based outreach.
            </>,
            <>
              <strong className="text-foreground">Rights Related to Automated Decision-Making
              (Art. 22)</strong> — identification is not automated decision-making with legal
              effect; no solely automated decisions are made.
            </>,
            <>
              <strong className="text-foreground">Right to Withdraw Consent (Art. 7(3))</strong>{' '}
              — withdraw consent at any time; processing based on it stops
              from that point.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection id="dpa" heading="5. Data Processing Agreement (DPA)">
        <p>
          We offer a GDPR-compliant Data Processing Agreement to all
          Customers. The DPA covers:
        </p>
        <LegalList
          items={[
            'Nature and purpose of processing',
            'Types of Personal Data and categories of data subjects',
            'Obligations and rights of the controller and processor',
            'Sub-processor management and notification',
            'Data breach notification procedures',
            'Data deletion and return upon termination',
            'Audit and inspection rights',
          ]}
        />
        <p>
          Request your DPA by emailing{' '}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-800 focus-brand"
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="transfers" heading="6. International Data Transfers">
        <p>
          Where Personal Data leaves the EEA/UK, transfers rely on:
        </p>
        <LegalList
          items={[
            'Adequacy decisions where applicable',
            'Standard Contractual Clauses adopted by the European Commission',
            'Supplementary technical and organizational measures as recommended by the EDPB',
            'Transfer Impact Assessments (TIAs) for each transfer destination',
          ]}
        />
      </LegalSection>

      <LegalSection id="dpia" heading="7. Data Protection Impact Assessments (DPIA)">
        <p>
          Where our processing is likely to result in high risk to data
          subjects, we conduct — and assist Customers in conducting — DPIAs
          covering the nature, scope, context, and purposes of processing,
          together with risk-mitigation measures. Our identification
          pipeline documentation is structured to slot directly into a
          Customer&apos;s DPIA template.
        </p>
      </LegalSection>

      <LegalSection id="subprocessors" heading="8. Sub-Processors">
        <p>
          Pixelco engages a limited set of sub-processors (cloud hosting,
          payment processing, email delivery). Each is bound by GDPR Article
          28 terms, is limited to the data the function requires, and is
          assessed before onboarding. The current list is available on
          request; Customers are notified in advance of material changes.
        </p>
      </LegalSection>

      <LegalSection id="breach" heading="9. Data Breach Notification">
        <p>In the event of a Personal Data breach, we will:</p>
        <LegalList
          items={[
            'Notify affected Customers without undue delay, and within 72 hours where we act as processor and the breach affects their data',
            'Document all breaches in our internal breach register',
            'Provide the information Article 33 requires: nature of the breach, categories and approximate numbers affected, likely consequences, and mitigation',
            'Communicate to supervisory authorities and, where required, to affected individuals',
          ]}
        />
      </LegalSection>

      <LegalSection id="dpo" heading="10. Data Protection Officer">
        <p>
          We have appointed a Data Protection Officer (DPO) who can be
          contacted at:
        </p>
        <p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-800 focus-brand"
          >
            {SUPPORT_EMAIL}
          </a>{' '}
          (marked for the attention of the DPO)
        </p>
      </LegalSection>

      <LegalSection id="supervisory-authority" heading="11. Supervisory Authority">
        <p>
          You have the right to lodge a complaint with your local supervisory
          authority. The list of authorities is published on the{' '}
          <a
            href="https://edpb.europa.eu/about-edpb/about-edpb/members_en"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-800 focus-brand"
          >
            European Data Protection Board website
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="customer-responsibilities" heading="12. Customer Responsibilities Under GDPR">
        <p>
          If you are a Customer using Pixelco on a website that receives
          EEA/UK visitors, you must:
        </p>
        <LegalList
          items={[
            'Include clear disclosure of Pixelco and its purposes in your privacy policy.',
            'Maintain records of processing activities as required under Art. 30.',
            'Ensure you have a lawful basis for any outreach to identified visitors.',
            'Honor data subject requests forwarded by us or received directly.',
          ]}
        />
      </LegalSection>
    </LegalPage>
  )
}

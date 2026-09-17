/**
 * Legal page content — the four policy pages pixelco.io publishes.
 *
 * R13-E2: titles, "Last updated" lines and the full policy text are
 * the LIVE copy, extracted in the round-13 audit (research/
 * round13-audit/content/page-*.json) and converted by scripts/
 * r13-convert-legal.py into the same block format the blog uses
 * (## sections, ### subsections, lists, [text](url) links). The
 * live's copy names the operator Aiviral — kept verbatim.
 */

export interface LegalPage {
  slug: string
  title: string
  /** Display form, e.g. "April 14, 2026". */
  lastUpdated: string
  content: string
}

export const LEGAL_PAGES: LegalPage[] = [
  {
    slug: 'privacy',
    title: "Privacy Policy",
    lastUpdated: "April 14, 2026",
    content: `## 1. Introduction

Pixelco, operated by Aiviral ("we," "our," or "us"), is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard information when you visit our website, use our services, or when our technology is deployed on third-party websites. By using our services, you consent to the practices described in this policy.

## 2. Definitions

- **"Customer"** refers to website owners or businesses who install the Pixelco pixel on their websites.
- **"End User" / "Visitor"** refers to individuals who browse websites that have the Pixelco pixel installed.
- **"Pixel"** refers to our JavaScript tracking code installed on Customer websites.
- **"Personal Data"** means any information relating to an identified or identifiable natural person.
- **"Processing"** means any operation performed on Personal Data.

## 3. Information We Collect

### 3.1 Customer Information

When you register for a Pixelco account, we collect:

- Full name and email address
- Company name, website URL, and industry
- Billing and payment information (processed securely via third-party payment processors)
- Account credentials and preferences
- Communication records with our support team

### 3.2 Visitor Data (Collected via Pixel)

Our pixel technology collects the following from website visitors:

- IP address (used for geolocation, then hashed or anonymized)
- Browser type, version, and language settings
- Device type, operating system, and screen resolution
- Pages visited, time on page, scroll depth, and click events
- Referral source and UTM parameters
- Cookies and similar tracking identifiers

### 3.3 Identity Resolution Data

We match anonymized visitor data against our proprietary database to identify visitors. Resolved data may include email addresses, name, company affiliation, job title, and social media profiles. This data is sourced from publicly available information, data partnerships, and opt-in consumer databases.

### 3.4 Automatically Collected Information

When you visit pixelco.io, we automatically collect standard web analytics data including IP address, browser type, referring URLs, and pages viewed, using cookies and similar technologies.

## 4. How We Use Information

- To provide, operate, and maintain our visitor identification services
- To match anonymous website traffic to known contact records and deliver identity-resolved data to Customers
- To deliver analytics, insights, and reporting to Customers
- To process payments and manage subscriptions
- To send transactional emails, service updates, and product announcements
- To improve, personalize, and optimize our technology, algorithms, and services
- To detect, prevent, and address fraud, abuse, and security issues
- To comply with legal obligations and enforce our terms
- To respond to Customer support requests

## 5. Legal Basis for Processing (EEA/UK)

Under the GDPR, we process Personal Data based on:

- **Contractual necessity:** To perform our obligations under our service agreements with Customers.
- **Legitimate interests:** To provide identity resolution services, improve our products, and ensure security.
- **Consent:** Where required by applicable law, including for certain cookie-based tracking activities.
- **Legal obligation:** To comply with applicable laws and regulations.

## 6. Data Sharing & Third Parties

We do not sell Personal Data to third parties. We share data only in the following circumstances:

- **With Customers:** We share identified visitor data only with the website owner who installed our pixel.
- **Service Providers:** Trusted third-party processors for hosting, payment processing, email delivery, and analytics.
- **Legal Requirements:** If required by law, subpoena, court order, or governmental request.
- **Business Transfers:** In connection with a merger, acquisition, or sale of assets.
- **With Your Consent:** When you provide explicit consent.

## 7. Cookies & Tracking Technologies

We use cookies, web beacons, and similar technologies to collect data and improve our services. Our pixel deploys first-party cookies on Customer websites to identify returning visitors. You can manage cookie preferences through your browser settings.

## 8. Data Retention

- **Customer Data:** Retained for the duration of the business relationship and up to 3 years thereafter.
- **Visitor Identification Data:** Retained for up to 12 months from collection.
- **Behavioral/Analytics Data:** Retained in aggregated, anonymized form indefinitely.
- **Billing Records:** Up to 7 years as required by tax regulations.

## 9. Data Security

We implement industry-standard technical and organizational security measures, including:

- Encryption in transit (TLS 1.2+) and at rest (AES-256)
- Role-based access controls and least-privilege principles
- Regular penetration testing and security audits
- SOC 2 Type II compliant infrastructure
- Automated threat detection and incident response procedures

## 10. Your Rights

Depending on your jurisdiction, you may have the following rights:

- **Access:** Request a copy of the Personal Data we hold about you.
- **Rectification:** Request correction of inaccurate or incomplete data.
- **Erasure:** Request deletion of your Personal Data.
- **Restriction:** Request limitation of processing.
- **Portability:** Request your data in a machine-readable format.
- **Objection:** Object to processing based on legitimate interests.
- **Withdraw Consent:** Withdraw consent at any time.
- **Non-Discrimination:** Exercise rights without discriminatory treatment.

To exercise these rights, contact [support@pixelco.io](mailto:support@pixelco.io). For jurisdiction-specific rights, see our [GDPR](/gdpr) and [CCPA](/ccpa) pages.

## 11. International Data Transfers

Your data may be transferred to and processed in countries other than your country of residence. We rely on Standard Contractual Clauses (SCCs) or other lawful transfer mechanisms to ensure adequate protection.

## 12. Children's Privacy

Our services are not directed at individuals under 16. We do not knowingly collect Personal Data from children.

## 13. Changes to This Policy

We may update this Privacy Policy from time to time. We will notify Customers of material changes via email at least 30 days before changes take effect.

## 14. Contact Us

If you have questions about this Privacy Policy, contact us:

- Email: [support@pixelco.io](mailto:support@pixelco.io)
- Data Protection Officer: [support@pixelco.io](mailto:support@pixelco.io)

If unsatisfied with our response, you have the right to lodge a complaint with your local data protection authority.`,
  },
  {
    slug: 'terms',
    title: "Terms of Service",
    lastUpdated: "April 14, 2026",
    content: `## 1. Acceptance of Terms

By accessing or using Pixelco's website, platform, or services (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). If you are using the Services on behalf of an organization, you represent that you have authority to bind that organization.

## 2. Description of Service

Pixelco provides a JavaScript-based tracking pixel that website owners ("Customers") install on their websites to identify anonymous visitors. Our service matches visitor behavioral data against our proprietary identity resolution database to provide contact information to Customers via our dashboard and integrations.

## 3. Eligibility

You must be at least 18 years old and have the legal capacity to enter into a binding agreement. The Services are intended for business use.

## 4. Account Registration & Security

- You must provide accurate, complete, and current registration information.
- You are solely responsible for maintaining the confidentiality of your account credentials.
- You must notify us immediately at [support@pixelco.io](mailto:support@pixelco.io) of any unauthorized use.
- You are responsible for all activities that occur under your account.

## 5. Acceptable Use Policy

You agree to use Pixelco only for lawful purposes. You shall NOT:

- Use identified data for harassment, stalking, or discrimination.
- Send spam in violation of CAN-SPAM, CASL, or equivalent laws.
- Use the Services on websites you don't own or have authorization to instrument.
- Reverse-engineer our proprietary algorithms or database.
- Resell or redistribute identified visitor data without written consent.
- Violate applicable data protection laws (GDPR, CCPA, PIPEDA, etc.).
- Deploy the pixel on websites directed at children under 16.

## 6. Customer Compliance Obligations

As a Customer, you are responsible for:

- Maintaining a legally compliant [privacy policy](/privacy) disclosing use of third-party tracking.
- Obtaining required consents from visitors as mandated by applicable laws.
- Ensuring your use of data complies with all applicable anti-spam and data protection laws.
- Honoring opt-out, deletion, and access requests from identified individuals.

## 7. Intellectual Property & Data Ownership

- **Your Data:** You retain ownership of all data you provide to us.
- **Our Technology:** We retain all rights in our proprietary database, algorithms, and intellectual property.
- **Identified Data:** Licensed to you for internal, legitimate business use only.
- **Aggregated Data:** We may use anonymized, aggregated data for product improvement.

## 8. Payment, Billing & Refunds

- Paid plans are billed monthly or annually as selected.
- All fees are in USD and exclusive of applicable taxes.
- All fees are non-refundable except as required by law.
- Pricing changes require at least 30 days' notice.
- Failure to pay may result in account suspension after a 7-day grace period.

## 9. Service Level & Availability

We strive for 99.9% uptime but do not guarantee uninterrupted service. We are not liable for downtime caused by factors outside our reasonable control.

## 10. Data Processing & Privacy

Our data practices are governed by our [Privacy Policy](/privacy). For [GDPR](/gdpr) and [CCPA](/ccpa) specific rights, see the respective pages.

## 11. Disclaimers & Limitation of Liability

THE SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE THE ACCURACY OF IDENTIFIED VISITOR DATA. OUR TOTAL LIABILITY SHALL NOT EXCEED AMOUNTS PAID IN THE 12 MONTHS PRECEDING THE CLAIM. WE SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.

## 12. Indemnification

You agree to indemnify and hold harmless Pixelco from claims arising from your use of the Services, violation of these Terms, or violation of any applicable law.

## 13. Termination

- You may cancel your account at any time.
- We may suspend or terminate for violation of these Terms or non-payment.
- Data is retained for 30 days post-termination for export, then deleted.
- Sections 7, 11, 12, 14, and 15 survive termination.

## 14. Governing Law

These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law provisions.

## 15. Dispute Resolution

Disputes shall first be resolved through good-faith negotiation. If unresolved within 30 days, disputes shall be submitted to binding arbitration under AAA rules in Wilmington, Delaware. You waive any right to class action.

## 16. Contact

Questions? Contact [support@pixelco.io](mailto:support@pixelco.io).`,
  },
  {
    slug: 'gdpr',
    title: "GDPR Compliance",
    lastUpdated: "April 14, 2026",
    content: `## 1. Our Commitment to GDPR

Pixelco, operated by Aiviral, is committed to complying with the General Data Protection Regulation (EU) 2016/679 ("GDPR") and the UK GDPR. We respect the privacy rights of individuals in the European Economic Area (EEA), United Kingdom, and Switzerland, and have implemented comprehensive measures to ensure lawful, fair, and transparent data processing.

## 2. Roles & Responsibilities

- **Pixelco as Data Controller:** When we collect data from our own website visitors and from Customers (account holders), we act as the data controller.
- **Pixelco as Data Processor:** When we process visitor data on behalf of Customers through the installed pixel, we act as a data processor. Our Customers are the data controllers for that data.
- **Joint Controller Scenarios:** In some cases where we combine Customer pixel data with our proprietary identity database, we may act as a joint controller. We will clearly define responsibilities in our Data Processing Agreement.

## 3. Lawful Basis for Processing

We process Personal Data under one or more of the following legal bases:

- **Consent (Art. 6(1)(a)):** Where Customers configure consent-based pixel deployment, data is only collected after the visitor provides affirmative consent via a cookie banner or similar mechanism.
- **Contractual Performance (Art. 6(1)(b)):** To deliver the identity resolution services that Customers have contracted us to provide.
- **Legitimate Interest (Art. 6(1)(f)):** For fraud prevention, service security, product improvement, and analytics. We conduct and document Legitimate Interest Assessments (LIAs) to balance our interests against data subjects' rights.
- **Legal Obligation (Art. 6(1)(c)):** To comply with tax, accounting, and regulatory requirements.

## 4. Data Subject Rights

Under the GDPR, data subjects have the following rights, which we honor within 30 days of a verified request:

- **Right of Access (Art. 15):** Request confirmation of whether we process your data and obtain a copy.
- **Right to Rectification (Art. 16):** Request correction of inaccurate Personal Data.
- **Right to Erasure (Art. 17):** Request deletion of your Personal Data ("right to be forgotten") where grounds apply.
- **Right to Restriction (Art. 18):** Request we limit processing of your data in certain circumstances.
- **Right to Data Portability (Art. 20):** Receive your Personal Data in a structured, commonly used, machine-readable format.
- **Right to Object (Art. 21):** Object to processing based on legitimate interests, including profiling.
- **Rights Related to Automated Decision-Making (Art. 22):** Right not to be subject to decisions based solely on automated processing that produce legal or similarly significant effects.
- **Right to Withdraw Consent (Art. 7(3)):** Withdraw consent at any time without affecting the lawfulness of prior processing.

To exercise any of these rights, contact our Data Protection Officer at [support@pixelco.io](mailto:support@pixelco.io). We may need to verify your identity before processing your request.

## 5. Data Processing Agreement (DPA)

We offer a GDPR-compliant Data Processing Agreement to all Customers. The DPA covers:

- Nature and purpose of processing
- Types of Personal Data and categories of data subjects
- Obligations and rights of the controller and processor
- Sub-processor management and notification
- Data breach notification procedures
- Data deletion and return upon termination
- Audit and inspection rights

To request a DPA, contact [support@pixelco.io](mailto:support@pixelco.io).

## 6. International Data Transfers

When Personal Data is transferred outside the EEA/UK, we ensure adequate protection through:

- Standard Contractual Clauses (SCCs) as approved by the European Commission (June 2021 version)
- Supplementary technical and organizational measures as recommended by the EDPB
- Transfer Impact Assessments (TIAs) for each transfer destination
- Adequacy decisions where applicable

## 7. Data Protection Impact Assessments (DPIA)

We conduct Data Protection Impact Assessments for processing activities that are likely to result in high risk to data subjects, including our identity resolution matching processes. DPIAs are reviewed annually or when significant changes to processing occur.

## 8. Sub-Processors

We maintain a list of approved sub-processors. We will notify Customers at least 30 days before engaging a new sub-processor, providing Customers the opportunity to object. All sub-processors are bound by contractual data protection obligations equivalent to those in our DPA.

## 9. Data Breach Notification

In the event of a Personal Data breach, we will:

- Notify affected Customers without undue delay, and no later than 72 hours after becoming aware of the breach
- Provide details of the nature of the breach, categories and approximate number of data subjects affected, likely consequences, and measures taken or proposed
- Assist Customers in fulfilling their own breach notification obligations to supervisory authorities and data subjects
- Document all breaches in our internal breach register

## 10. Data Protection Officer

We have appointed a Data Protection Officer (DPO) who can be contacted at:

- Email: [support@pixelco.io](mailto:support@pixelco.io)

## 11. Supervisory Authority

If you believe your data protection rights have been violated, you have the right to lodge a complaint with your local supervisory authority. A list of EEA data protection authorities can be found on the [European Data Protection Board website](https://edpb.europa.eu/about-edpb/about-edpb/members_en).

## 12. Customer Responsibilities Under GDPR

If you are a Customer using Pixelco on a website that receives EEA/UK visitors, you must:

- Implement a GDPR-compliant cookie consent banner that obtains valid consent before the Pixelco pixel fires (where consent is the applicable lawful basis).
- Include clear disclosure of Pixelco and its purposes in your privacy policy.
- Maintain records of processing activities as required under Art. 30.
- Promptly forward any data subject requests to us that relate to data processed through our pixel.
- Ensure you have a lawful basis for any outreach to identified visitors.`,
  },
  {
    slug: 'ccpa',
    title: "CCPA / CPRA Compliance",
    lastUpdated: "April 14, 2026",
    content: `## 1. Overview

This page supplements our [Privacy Policy](/privacy) and provides additional disclosures required under the California Consumer Privacy Act of 2018, as amended by the California Privacy Rights Act of 2020 (collectively, "CCPA/CPRA"). It applies to California residents ("consumers") whose Personal Information we collect or process.

## 2. Categories of Personal Information Collected

In the preceding 12 months, we have collected the following categories of Personal Information:

| Category | Examples | Collected |
| Identifiers | Name, email, IP address, account ID | Yes |
| Commercial Information | Subscription plans, billing history, usage records | Yes |
| Internet/Network Activity | Browsing history, pages visited, referral sources, click data | Yes |
| Geolocation Data | Approximate location derived from IP address | Yes |
| Professional/Employment Info | Company name, job title (from identity resolution) | Yes |
| Inferences | Visitor intent, interest profiles, lead scoring | Yes |

## 3. Sources of Personal Information

- **Directly from you:** When you create an account, contact us, or use our Services.
- **Automatically:** Through cookies, pixels, and similar tracking technologies on Customer websites and our own site.
- **Third-party sources:** Publicly available data, data partnerships, social media platforms, and opt-in consumer data providers used for identity resolution.

## 4. Business Purposes for Collection

- Providing, operating, and improving our identity resolution services
- Processing transactions and managing Customer accounts
- Matching anonymous visitors to known identity records for our Customers
- Detecting and preventing fraud and security incidents
- Debugging and repairing errors in our technology
- Short-term transient use (e.g., contextualizing a current interaction)
- Conducting internal research for product development
- Verifying and maintaining quality of service

## 5. Sale & Sharing of Personal Information

**We do not "sell" Personal Information** as traditionally understood. However, under the CCPA/CPRA's broad definition, our sharing of identified visitor data with Customers may constitute a "sale" or "sharing" of Personal Information. Specifically:

- We share identified visitor information (email, name, company) with the Customer who owns the website the visitor browsed.
- We do not share Personal Information with third parties for their own marketing purposes.
- We do not share Personal Information of consumers under 16 years of age.

## 6. Your California Privacy Rights

As a California resident, you have the following rights:

- **Right to Know (Access):** You can request disclosure of the categories and specific pieces of Personal Information we have collected about you, the sources, purposes, and third parties with whom we share it.
- **Right to Delete:** You can request we delete Personal Information we collected from you, subject to certain exceptions (e.g., completing a transaction, legal compliance, security).
- **Right to Correct:** You can request we correct inaccurate Personal Information.
- **Right to Opt-Out of Sale/Sharing:** You can direct us to stop selling or sharing your Personal Information.
- **Right to Limit Use of Sensitive PI:** If we collect sensitive Personal Information, you can limit its use to what is necessary for performing our Services.
- **Right to Non-Discrimination:** We will not discriminate against you for exercising any of your CCPA/CPRA rights. You will not receive different pricing, quality, or service levels.

## 7. How to Exercise Your Rights

You can submit a verifiable consumer request by:

- Emailing [support@pixelco.io](mailto:support@pixelco.io) with the subject line "CCPA Request"
- Using the "Do Not Sell or Share My Personal Information" link in our website footer

**Verification:** We will verify your identity by matching information you provide against data we already have. For deletion requests, we may require a two-step verification. You may also authorize an agent to submit a request on your behalf with valid written authorization.

**Response Timeline:** We will acknowledge your request within 10 business days and provide a substantive response within 45 calendar days. If additional time is needed, we will notify you of the extension (up to an additional 45 days).

## 8. Retention

We retain each category of Personal Information only as long as reasonably necessary for the purposes disclosed in this notice. Retention periods are detailed in our [Privacy Policy](/privacy).

## 9. Financial Incentives

We do not currently offer any financial incentive programs that require disclosure under the CCPA/CPRA. If we do in the future, we will update this section with details and obtain your opt-in consent where required.

## 10. Metrics (Annual Disclosure)

As required by the CCPA/CPRA, we will publish annual metrics on consumer requests received, including the number of requests to know, delete, and opt-out, along with median response times. These will be published by July 1 of each year for the preceding calendar year.

## 11. Customer Responsibilities Under CCPA

If you are a Customer using Pixelco and your website receives California visitors, you must:

- Include a "Do Not Sell or Share My Personal Information" link on your website if applicable.
- Disclose your use of Pixelco and the categories of Personal Information collected/shared in your privacy policy.
- Honor consumer opt-out requests and communicate them to us promptly.
- Ensure any use of identified visitor data complies with the CCPA/CPRA, including purpose limitations.

## 12. Contact

For CCPA/CPRA-related questions or requests, contact us at [support@pixelco.io](mailto:support@pixelco.io).`,
  },
]

export function getLegalPage(slug: string): LegalPage | undefined {
  return LEGAL_PAGES.find((page) => page.slug === slug)
}


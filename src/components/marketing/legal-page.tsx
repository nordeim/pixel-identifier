import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

/**
 * Shared frame for the four legal pages (/privacy, /terms, /gdpr, /ccpa):
 * back link, H1, last-updated line, and a prose column. Section content is
 * composed by each page with the LegalSection / LegalList helpers so the
 * typography stays uniform.
 */
export function LegalPage({
  title,
  lastUpdated,
  children,
}: {
  title: string
  lastUpdated: string
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:py-20">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 transition-colors hover:text-amber-700 focus-brand"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Home
      </Link>
      <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
      <div className="mt-10 space-y-10">{children}</div>
    </div>
  )
}

export function LegalSection({
  id,
  heading,
  children,
}: {
  id?: string
  heading: string
  children: React.ReactNode
}) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-heading` : undefined}>
      <h2
        id={id ? `${id}-heading` : undefined}
        className="text-lg font-bold text-foreground"
      >
        {heading}
      </h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  )
}

export function LegalSub({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mt-2 text-[15px] font-semibold text-foreground">{heading}</h3>
      <div className="mt-1.5 space-y-2 text-[15px] leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  )
}

export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="ml-5 list-disc space-y-1.5">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  )
}

export function LegalOrderedList({ items }: { items: React.ReactNode[] }) {
  return (
    <ol className="ml-5 list-decimal space-y-1.5">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ol>
  )
}

export const SUPPORT_EMAIL = 'support@pixelco.io'

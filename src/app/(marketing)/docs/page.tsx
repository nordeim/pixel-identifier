import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowLeft,
  BarChart3,
  Code2,
  Settings,
  Zap,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'Get started with Pixelco in under 5 minutes.',
}

const STEPS = [
  {
    icon: Settings,
    step: '1',
    title: 'Create Your Account',
    body: 'Sign up for a free Pixelco account and add your website domain in the dashboard.',
  },
  {
    icon: Code2,
    step: '2',
    title: 'Install the Pixel',
    body: 'Copy the pixel code snippet and paste it into the <head> section of your website, just before the closing </head> tag.',
  },
  {
    icon: Zap,
    step: '3',
    title: 'Verify Installation',
    body: "Visit your website and check the Pixelco dashboard — you should see a green 'Active' status within a few minutes.",
  },
  {
    icon: BarChart3,
    step: '4',
    title: 'Start Identifying',
    body: "That's it! Pixelco will begin identifying anonymous visitors and populating your dashboard with contact data in real time.",
  },
]

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:py-20">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 transition-colors hover:text-amber-700 focus-brand"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Home
      </Link>

      <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
        Documentation
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Get started with Pixelco in under 5 minutes.
      </p>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {STEPS.map((step) => (
          <div
            key={step.step}
            className="rounded-xl border border-amber-200/70 bg-amber-50/50 p-7"
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15"
                aria-hidden="true"
              >
                <step.icon className="h-5 w-5 text-amber-600" />
              </span>
              <h2 className="text-base font-bold text-foreground">
                <span className="text-amber-700">{step.step}.</span> {step.title}
              </h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </div>
        ))}
      </div>

      <section aria-labelledby="example-heading" className="mt-14">
        <h2 id="example-heading" className="text-2xl font-extrabold tracking-tight text-foreground">
          Example Pixel Code
        </h2>
        <div className="mt-5 rounded-lg border border-border bg-stone-950">
          <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-stone-200">
            <code>{`<script
  src="https://your-pixelco-domain.com/pixel.js"
  data-site="px_0000000000000000"
  defer
></script>`}</code>
          </pre>
        </div>
        <p className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3.5 text-sm leading-relaxed text-amber-900">
          <span aria-hidden="true" className="text-base leading-none">⚠️</span>
          <span>
            <strong className="font-semibold">
              This is a sample snippet for illustration only.
            </strong>{' '}
            Your real, unique pixel code will be generated automatically when
            you complete onboarding in your{' '}
            <Link
              href="/dashboard/install"
              className="font-semibold underline underline-offset-2 hover:text-amber-800 focus-brand"
            >
              Pixelco dashboard
            </Link>
            .
          </span>
        </p>
      </section>
    </div>
  )
}

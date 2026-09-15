'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Dashboard segment error boundary (F-27): a failed query renders an
 * actionable recovery state instead of Next's default error page.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surface the failure in server/browser logs for diagnosis.
    console.error('[dashboard] render failed', error)
  }, [error])

  return (
    <div
      role="alert"
      className="mx-auto flex max-w-lg flex-col items-center rounded-xl border border-border bg-card p-10 text-center shadow-sm"
    >
      <span
        className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50"
        aria-hidden="true"
      >
        <AlertTriangle className="h-6 w-6 text-red-600" />
      </span>
      <h2 className="mt-4 text-lg font-bold text-foreground">Something went wrong</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        We couldn&apos;t load this page. This is usually temporary — try again,
        and if it persists, check the server logs.
        {error.digest && (
          <span className="mt-2 block font-mono text-xs text-muted-foreground/70">
            ref: {error.digest}
          </span>
        )}
      </p>
      <Button onClick={reset} className="mt-6 font-semibold">
        <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
        Try again
      </Button>
    </div>
  )
}

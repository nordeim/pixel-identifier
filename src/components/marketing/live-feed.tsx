'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Eye, Loader2, Mail } from 'lucide-react'

interface FeedEntry {
  email: string | null
  status: 'identified' | 'resolving'
  page: string
  confidence: number | null
}

const DEMO_ENTRIES: FeedEntry[] = [
  { email: 'alex.thompson@gmail.com', status: 'identified', page: '/pricing', confidence: 91 },
  { email: null, status: 'resolving', page: '/blog/scaling-outbound', confidence: null },
  { email: 'maria.garcia@outlook.com', status: 'identified', page: '/', confidence: 84 },
  { email: 'd.chen@brightpathlabs.com', status: 'identified', page: '/features', confidence: 96 },
  { email: null, status: 'resolving', page: '/docs/install', confidence: null },
  { email: 'sofia.larsen@yahoo.com', status: 'identified', page: '/pricing', confidence: 78 },
  { email: 'james.wilson@icloud.com', status: 'identified', page: '/', confidence: 88 },
]

const VISIBLE_ROWS = 5

/**
 * "Live Visitor Feed" dashboard mockup for the hero. Rows animate in on a
 * cycle so the product story (pageview → resolving → identified) reads at a
 * glance. Purely decorative; reduced-motion users see a static list.
 */
export function LiveFeedMockup() {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setOffset((v) => v + 1), 2600)
    return () => clearInterval(timer)
  }, [])

  const rows = Array.from({ length: VISIBLE_ROWS }, (_, i) => {
    const entry = DEMO_ENTRIES[(offset + i) % DEMO_ENTRIES.length]
    return { ...entry, key: offset + i }
  })

  return (
    <div className="rounded-xl border border-border bg-card shadow-xl shadow-black/5">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
          </span>
          <span className="text-sm font-semibold text-foreground">Live Visitor Feed</span>
        </div>
        <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-foreground">
          847 visitors today
        </span>
      </div>

      <div className="space-y-2 p-3 sm:p-4" aria-label="Sample of identified visitors">
        {rows.map((row) => (
          <div
            key={row.key}
            className="feed-row flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background px-3 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className={
                  row.status === 'identified'
                    ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20'
                    : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted'
                }
                aria-hidden="true"
              >
                {row.status === 'identified' ? (
                  <Mail className="h-4 w-4 text-amber-600" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </span>
              <div className="min-w-0">
                {row.email ? (
                  <p className="truncate text-sm font-medium text-foreground">{row.email}</p>
                ) : (
                  <p className="truncate text-sm font-medium text-muted-foreground">
                    Unknown visitor
                  </p>
                )}
                <p className="truncate text-xs text-muted-foreground">{row.page}</p>
              </div>
            </div>
            {row.status === 'identified' ? (
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Identified
              </span>
            ) : (
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                Resolving…
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
        <span>169 emails found today</span>
        <span className="font-medium text-teal-600">20% match rate</span>
      </div>
    </div>
  )
}

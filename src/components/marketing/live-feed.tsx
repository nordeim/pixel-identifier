'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Globe, Mail, User, Zap } from 'lucide-react'

interface FeedEntry {
  email: string | null
  /** Identified rows carry a ✓ label; anonymous rows show "browsing". */
  status: 'identified' | 'anonymous'
}

const DEMO_ENTRIES: FeedEntry[] = [
  { email: 'maria.garcia@gmail.com', status: 'identified' },
  { email: null, status: 'anonymous' },
  { email: 'alex.thompson@gmail.com', status: 'identified' },
  { email: null, status: 'anonymous' },
  { email: 'james.miller92@gmail.com', status: 'identified' },
  { email: 'sofia.larsen@yahoo.com', status: 'identified' },
  { email: null, status: 'anonymous' },
  { email: 'd.chen@brightpathlabs.com', status: 'identified' },
]

const VISIBLE_ROWS = 4
const ROW_HEIGHT_PX = 56 // px-3 py-2 container + row height (240px / ~4.3)

/**
 * "Live Visitor Feed" hero mockup (R6-H5): the live's stat strip
 * (847 Visitors Today → Pixelco → 169 Emails Found) over a fixed-height
 * rotating row list, closed by a Match Rate progress footer. Purely
 * decorative; reduced-motion users see the same static rows.
 */
export function LiveFeedMockup() {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setOffset((v) => v + 1), 2600)
    return () => clearInterval(timer)
  }, [])

  const rows = Array.from({ length: VISIBLE_ROWS + 1 }, (_, i) => {
    const entry = DEMO_ENTRIES[(offset + i) % DEMO_ENTRIES.length]
    return { ...entry, key: offset + i, slot: i }
  })

  return (
    <div
      className="shadow-elevated relative overflow-hidden rounded-xl border border-border bg-card"
      aria-label="Sample of identified visitors"
    >
      {/* Header — globe icon + pulsing "Real-time" badge like the live. */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" aria-hidden="true" />
          <span className="text-sm font-semibold text-foreground">Live Visitor Feed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" aria-hidden="true" />
          <span className="text-xs text-muted-foreground">Real-time</span>
        </div>
      </div>

      {/* Stat strip — visitors → Pixelco → emails, arrow-separated. */}
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center justify-between text-center">
          <div className="flex-1">
            <p className="text-2xl font-bold text-foreground">847</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Visitors Today</p>
          </div>
          <ArrowRight
            className="h-4 w-4 shrink-0 text-muted-foreground/40"
            aria-hidden="true"
          />
          <div className="flex-1">
            <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="h-4 w-4 text-amber-500" aria-hidden="true" />
            </div>
            <p className="text-xs text-muted-foreground">Pixelco</p>
          </div>
          <ArrowRight
            className="h-4 w-4 shrink-0 text-muted-foreground/40"
            aria-hidden="true"
          />
          <div className="flex-1">
            <p className="text-2xl font-bold text-primary">169</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Emails Found</p>
          </div>
        </div>
      </div>

      {/* Rotating rows — fixed 240px window like the live. */}
      <div className="relative px-3 py-2" style={{ height: 240 }}>
        {rows.map((row) => (
          <div
            key={row.key}
            className="feed-row flex items-center gap-3 rounded-lg border border-border bg-card/80 px-4 py-3 backdrop-blur-sm"
            style={{ position: 'absolute', top: 8 + row.slot * ROW_HEIGHT_PX, left: 0, right: 0 }}
          >
            {row.status === 'identified' ? (
              <span
                className="gradient-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                aria-hidden="true"
              >
                <Mail className="h-4 w-4 text-primary-foreground" />
              </span>
            ) : (
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted"
                aria-hidden="true"
              >
                <User className="h-4 w-4 text-muted-foreground" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              {row.status === 'identified' ? (
                <>
                  <p className="truncate text-sm font-semibold text-foreground">{row.email}</p>
                  <p className="text-xs text-primary">✓ Identified</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-muted-foreground">Unknown User</p>
                  <p className="text-xs text-muted-foreground/60">Browsing your site…</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Match-rate footer with a thin amber progress bar. */}
      <div className="border-t border-border bg-card/50 px-4 py-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Match Rate</span>
          <span className="text-xs font-semibold text-primary">20%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-[20%] rounded-full bg-primary" />
        </div>
      </div>
    </div>
  )
}

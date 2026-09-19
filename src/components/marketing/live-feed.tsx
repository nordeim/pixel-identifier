'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Globe, Mail, User } from 'lucide-react'

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
      className="relative rounded-xl border border-border bg-card overflow-hidden shadow-elevated"
      aria-label="Sample of identified visitors"
    >
      {/* Header — globe icon + pulsing "Real-time" badge like the live.
          R18: the live's emission orders. */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-card">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" aria-hidden="true" />
          <span className="text-sm font-semibold text-foreground">Live Visitor Feed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" aria-hidden="true" />
          <span className="text-xs text-muted-foreground">Real-time</span>
        </div>
      </div>

      {/* Stat strip — visitors → Pixelco → emails, arrow-separated. */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center justify-between text-center">
          <div className="flex-1">
            <p className="text-2xl font-bold text-foreground">847</p>
            <p className="text-xs text-muted-foreground mt-0.5">Visitors Today</p>
          </div>
          <ArrowRight
            className="w-4 h-4 text-muted-foreground/40 shrink-0"
            aria-hidden="true"
          />
          <div className="flex-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-1">
              {/* R18: the live's stat glyph is an inline data-URI img
                  (amber #eab308 zap), not a lucide icon — replicated
                  verbatim. */}
              {/* eslint-disable-next-line @next/next/no-img-element -- inline data URI, byte-parity with the live */}
              <img
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23eab308' stroke-width='2'%3E%3Cpath d='M13 2L3 14h9l-1 8 10-12h-9l1-8z'/%3E%3C/svg%3E"
                alt=""
                className="w-4 h-4"
              />
            </div>
            <p className="text-xs text-muted-foreground">Pixelco</p>
          </div>
          <ArrowRight
            className="w-4 h-4 text-muted-foreground/40 shrink-0"
            aria-hidden="true"
          />
          <div className="flex-1">
            <p className="text-2xl font-bold text-primary">169</p>
            <p className="text-xs text-muted-foreground mt-0.5">Emails Found</p>
          </div>
        </div>
      </div>

      {/* Rotating rows — fixed 240px window like the live. */}
      <div className="relative px-3 py-2" style={{ height: 240 }}>
        {rows.map((row) => (
          <div
            key={row.key}
            className="feed-row flex items-center gap-3 px-4 py-3 rounded-lg bg-card/80 border border-border backdrop-blur-sm"
            style={{ position: 'absolute', top: 8 + row.slot * ROW_HEIGHT_PX, left: 0, right: 0 }}
          >
            {row.status === 'identified' ? (
              /* R18-B5: the live's avatars are divs with INLINE background
                  colors (the live's hsl(var(--primary)) presupposes the v3
                  HSL-triplet convention — the clone's tokens are hex, so
                  the inline style references var() directly; the solid
                  swatch renders identically). */
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                <Mail className="w-4 h-4 text-primary-foreground" />
              </div>
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--muted)' }}
              >
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {row.status === 'identified' ? (
                <>
                  <p className="text-sm font-semibold text-foreground">{row.email}</p>
                  <p className="text-xs text-primary font-medium">✓ Identified</p>
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
      <div className="px-4 py-3 border-t border-border bg-card/50">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted-foreground">Match Rate</span>
          <span className="text-xs font-semibold text-primary">20%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary" style={{ width: '20%' }} />
        </div>
      </div>
    </div>
  )
}

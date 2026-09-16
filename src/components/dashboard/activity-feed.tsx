'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowUpRight, ChevronDown, Eye, Globe, Loader2, Mail } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { relativeTime } from '@/lib/format'

export interface ActivityEvent {
  id: string
  name: string
  domain: string
  path: string
  email: string | null
  anonymousId: string | null
  createdAt: string
}

const POLL_INTERVAL_MS = 5000

interface ActivityFeedProps {
  initialEvents: ActivityEvent[]
  /** Cursor to the next (older) page; null when history is exhausted. */
  initialCursor: string | null
}

export function ActivityFeed({ initialEvents, initialCursor }: ActivityFeedProps) {
  const [events, setEvents] = useState<ActivityEvent[]>(initialEvents)
  const [cursor, setCursor] = useState<string | null>(initialCursor)
  const [loadingMore, setLoadingMore] = useState(false)
  const [tick, setTick] = useState(0)

  // Re-render every 15 s so relative timestamps stay honest between polls.
  useEffect(() => {
    const timer = setInterval(() => setTick((v) => v + 1), 15_000)
    return () => clearInterval(timer)
  }, [])

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/activity', { cache: 'no-store' })
      if (!response.ok) return
      const data: { events?: ActivityEvent[] } = await response.json()
      if (!Array.isArray(data.events)) return
      const incoming = data.events
      // Merge, never replace: pages loaded via "Load more" must survive a
      // poll; genuinely new events land on top in arrival order.
      setEvents((current) => {
        const seen = new Set(current.map((event) => event.id))
        const fresh = incoming.filter((event) => !seen.has(event.id))
        return fresh.length > 0 ? [...fresh, ...current] : current
      })
    } catch {
      // Network hiccup: keep showing the last snapshot.
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      // Background tabs do not need to poll (F-32).
      if (typeof document === 'undefined' || document.hidden) return
      void refresh()
    }, POLL_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [refresh])

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMore) return
    setLoadingMore(true)
    try {
      const response = await fetch(`/api/activity?cursor=${encodeURIComponent(cursor)}`, {
        cache: 'no-store',
      })
      if (!response.ok) return
      const data: { events?: ActivityEvent[]; nextCursor?: string | null } = await response.json()
      const older = Array.isArray(data.events) ? data.events : []
      const seen = new Set(events.map((event) => event.id))
      const fresh = older.filter((event) => !seen.has(event.id))
      setEvents((current) => [...current, ...fresh])
      setCursor(data.nextCursor ?? null)
    } catch {
      // Keep the current list; the button stays available to retry.
    } finally {
      setLoadingMore(false)
    }
  }, [cursor, events, loadingMore])

  return (
    <div className="max-w-3xl space-y-4">
      {/* R6-M2: one card like the live — header + p-0 divide list. */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <p className="font-display text-base font-semibold tracking-tight text-foreground">Live Feed</p>
          <p className="text-sm text-muted-foreground">All events across your domains</p>
        </CardHeader>
        <CardContent className="p-0">
        {events.length === 0 ? (
          <p className="px-4 py-16 text-center text-sm text-muted-foreground" data-tick={tick}>
            No events yet. Install your pixel and visit your site — events will
            appear here in real time.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/20"
                data-tick={tick}
              >
                <span
                  className={
                    event.name === 'identification'
                      ? 'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-primary'
                      : 'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted'
                  }
                  aria-hidden="true"
                >
                  {event.name === 'identification' ? (
                    <Mail className="h-3.5 w-3.5 text-primary-foreground" />
                  ) : (
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {/* R7-F1: pageview rows show the truncated anonymous id
                          ("first 12 chars + ...") like the live; only
                          identification rows show the email. */}
                      {event.email ?? `${event.anonymousId}...`}
                    </span>
                    {event.name === 'identification' ? (
                      <Badge variant="secondary" className="gradient-primary border-0 px-1.5 py-0 text-[10px] text-primary-foreground hover:opacity-90">
                        Identified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="px-1.5 py-0 text-[10px] text-foreground">
                        Pageview
                      </Badge>
                    )}
                  </p>
                  {/* R6-M2: two meta groups with gap-3 — globe+domain and
                      arrow+path — like the live row footer. */}
                  <p className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex min-w-0 items-center gap-1">
                      <Globe className="h-3 w-3 shrink-0" aria-hidden="true" />
                      <span className="truncate">{event.domain}</span>
                    </span>
                    <span className="flex min-w-0 items-center gap-1">
                      <ArrowUpRight className="h-3 w-3 shrink-0" aria-hidden="true" />
                      <span className="truncate">{event.path}</span>
                    </span>
                  </p>
                </div>

                <time className="mt-1 shrink-0 text-xs text-muted-foreground" dateTime={event.createdAt}>
                  {relativeTime(event.createdAt)}
                </time>
              </li>
            ))}
          </ul>
        )}

        {cursor && (
          <div className="border-t border-border p-3">
            <Button
              variant="ghost"
              className="w-full text-xs font-semibold text-muted-foreground hover:text-foreground"
              onClick={loadMore}
              disabled={loadingMore}
              aria-label="Load older events"
            >
              {loadingMore ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <>
                  <ChevronDown className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  Load older events
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
      </Card>

    </div>
  )
}

'use client'

import { useCallback, useEffect, useState } from 'react'
import { Eye, Loader2, Mail, Radio } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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

export function ActivityFeed({ initialEvents }: { initialEvents: ActivityEvent[] }) {
  const [events, setEvents] = useState<ActivityEvent[]>(initialEvents)
  const [live, setLive] = useState(true)
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
      if (Array.isArray(data.events)) setEvents(data.events)
    } catch {
      // Network hiccup: keep showing the last snapshot.
    }
  }, [])

  useEffect(() => {
    if (!live) return
    const timer = setInterval(refresh, POLL_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [live, refresh])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Radio className={`h-4 w-4 ${live ? 'text-teal-500' : 'text-muted-foreground'}`} aria-hidden="true" />
            Live Feed
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">All events across your domains</p>
        </div>
        <button
          type="button"
          onClick={() => setLive((v) => !v)}
          aria-pressed={live}
          className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus-brand"
        >
          <span
            className={`h-2 w-2 rounded-full ${live ? 'animate-pulse bg-teal-500' : 'bg-muted-foreground/40'}`}
            aria-hidden="true"
          />
          {live ? 'Live' : 'Paused'}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {events.length === 0 ? (
          <p className="px-4 py-16 text-center text-sm text-muted-foreground" data-tick={tick}>
            No events yet. Install your pixel and visit your site — events will
            appear here in real time.
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/30"
                data-tick={tick}
              >
                <span
                  className={
                    event.name === 'identification'
                      ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20'
                      : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted'
                  }
                  aria-hidden="true"
                >
                  {event.name === 'identification' ? (
                    <Mail className="h-4 w-4 text-amber-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {event.email ?? `${event.anonymousId}…`}
                    </span>
                    {event.name === 'identification' ? (
                      <Badge variant="secondary" className="bg-primary/20 text-amber-800 hover:bg-primary/20">
                        identified
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted">
                        pageview
                      </Badge>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    @ {event.domain} → <span className="font-mono">{event.path}</span>
                  </p>
                </div>

                <time className="shrink-0 text-xs text-muted-foreground" dateTime={event.createdAt}>
                  {relativeTime(event.createdAt)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>

      {live && (
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground" aria-hidden="true">
          <Loader2 className="h-3 w-3 animate-spin" />
          Auto-refreshing every 5 seconds
        </p>
      )}
    </div>
  )
}

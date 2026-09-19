'use client'

import { useCallback, useState } from 'react'
import { ArrowUpRight, ChevronLeft, ChevronRight, Eye, Globe, Loader2, Mail } from 'lucide-react'
import { LegacyBadge } from '@/components/dashboard/content-badges'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

/**
 * R22-F6: the live's page size (Jc=50 in its app bundle, component hxe) —
 * 50 events per offset page, count-exact, footer only when pages > 1.
 */
const PAGE_SIZE = 50

interface ActivityFeedProps {
  initialEvents: ActivityEvent[]
  /** Total events across the user's sites (server-counted page 0). */
  totalCount: number
}

export function ActivityFeed({ initialEvents, totalCount }: ActivityFeedProps) {
  const [events, setEvents] = useState<ActivityEvent[]>(initialEvents)
  const [page, setPage] = useState(0)
  const [count, setCount] = useState(totalCount)
  const [loading, setLoading] = useState(false)

  const pageCount = Math.ceil(count / PAGE_SIZE)

  /**
   * R22-F6: the live's page navigation — a fresh react-query page fetch
   * REPLACES the list (its isLoading shows the py-24 spinner mid-swap).
   * The page index never touches the URL; there is no polling and no
   * keyset walking on the live.
   */
  const goTo = useCallback(
    async (next: number) => {
      if (loading) return
      if (next < 0 || (pageCount > 0 && next >= pageCount)) return
      setLoading(true)
      try {
        const response = await fetch(`/api/activity?page=${next}`, { cache: 'no-store' })
        if (response.ok) {
          const data: { events?: ActivityEvent[]; count?: number } = await response.json()
          if (Array.isArray(data.events)) {
            setEvents(data.events)
            setPage(next)
            if (typeof data.count === 'number') setCount(data.count)
          }
        }
      } catch {
        // Network hiccup: keep the current page; the footer can retry.
      } finally {
        setLoading(false)
      }
    },
    [loading, pageCount],
  )

  return (
    <div className="max-w-3xl space-y-4">
      {/* R6-M2: one card like the live — header + p-0 divide list. */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Live Feed</CardTitle>
          <p className="text-sm text-muted-foreground">All events across your domains</p>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            /* R22-F6: the live's fetch state — a centered spinner replaces
                the list while a page loads (bundle: py-24 + h-5 w-5). */
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : events.length === 0 ? (
            /* R22-F2: the live's empty branch, byte-for-byte. */
            <p className="text-sm text-muted-foreground py-12 text-center">
              No activity yet. Install your pixel to start tracking.
            </p>
          ) : (
            <>
              <div className="divide-y divide-border">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 px-5 py-4 hover:bg-muted/20 transition-colors"
                  >
                    <div
                      className={
                        event.name === 'identification'
                          ? 'h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 gradient-primary'
                          : 'h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-muted'
                      }
                    >
                      {event.name === 'identification' ? (
                        <Mail className="h-3.5 w-3.5 text-primary-foreground" />
                      ) : (
                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium truncate">
                          {/* R7-F1: pageview rows show the truncated anonymous id
                              ("first 12 chars + ...") like the live; only
                              identification rows show the email. */}
                          {event.email ?? `${event.anonymousId}...`}
                        </span>
                        {event.name === 'identification' ? (
                          /* R17-F1: the live's Identified badge rides the
                              new-gen DEFAULT variant + the gradient tail —
                              byte-identical to the domains-Verified string
                              (bg-primary hover:bg-primary/80, no
                              hover:opacity-90). */
                          <Badge variant="default" className="text-[10px] px-1.5 py-0 gradient-primary text-primary-foreground border-0">
                            Identified
                          </Badge>
                        ) : (
                          /* R16: the live's Pageview badge is the LEGACY-gen base
                              (border) + text-foreground tail. */
                          <LegacyBadge className="text-foreground text-[10px] px-1.5 py-0">
                            Pageview
                          </LegacyBadge>
                        )}
                      </div>
                      {/* R16: two meta groups with gap-3, raw-text children —
                          the live renders domain/path as bare text (D8). */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" aria-hidden="true" />
                          {event.domain}
                        </span>
                        <span className="flex items-center gap-1">
                          <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                          {event.path}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs text-muted-foreground shrink-0 mt-1">
                      {relativeTime(event.createdAt)}
                    </span>
                  </div>
                ))}
              </div>

              {/* R22-F6: the live's pagination footer — only when the count
                  spans more than one 50-row page (bundle: c>1). */}
              {pageCount > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, count)} of {count}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={page === 0}
                      onClick={() => void goTo(page - 1)}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <span className="text-xs text-muted-foreground px-2">
                      Page {page + 1} of {pageCount}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={page >= pageCount - 1}
                      onClick={() => void goTo(page + 1)}
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, ChevronLeft, ChevronRight, Download, Eye, Mail, Search, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { publishVisitorsCounts } from '@/components/dashboard/chrome-store'
import { formatDate, initialsForEmail, relativeTime } from '@/lib/format'

export interface VisitorRow {
  id: string
  email: string | null
  anonymousId: string
  type: string | null
  companyName: string | null
  source: string
  confidence: number | null
  status: string
  pageviews: number
  firstSeen: string
  lastSeen: string
  domain: string
}

export interface VisitorFilters {
  q: string
  type: string // 'all' | 'individual' | 'company'
  confidence: string // 'all' | '90' | '75' | '50'
  source: string // 'all' | source key
}

type Segment = 'all' | 'individual' | 'company'

const SOURCE_LABELS: Record<string, string> = {
  direct: 'Direct',
  search: 'Search',
  social: 'Social',
  referral: 'Referral',
  campaign: 'Campaign',
}

interface VisitorsTableProps {
  visitors: VisitorRow[]
  total: number
  page: number
  pageCount: number
  counts: { all: number; individual: number; company: number }
  filters: VisitorFilters
}

export function VisitorsTable({ visitors, total, page, pageCount, counts, filters }: VisitorsTableProps) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState(filters.q)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Adjust state during render (React's documented pattern — never an
  // effect) when the URL-driven filters change: the search box follows the
  // URL (back/forward), and the row selection resets per page/filters.
  const filterKey = `${page}|${filters.q}|${filters.type}|${filters.confidence}|${filters.source}`
  const [syncedKey, setSyncedKey] = useState(filterKey)
  const [syncedQuery, setSyncedQuery] = useState(filters.q)
  if (syncedKey !== filterKey) {
    setSyncedKey(filterKey)
    setSelectedIds(new Set())
  }
  if (syncedQuery !== filters.q) {
    setSyncedQuery(filters.q)
    setQuery(filters.q)
  }

  // Publish segment counts to the dashboard chrome so the topbar subtitle
  // can render "N individuals · M companies identified" like the live app
  // (round-4 plan, Task S6).
  useEffect(() => {
    publishVisitorsCounts({ individual: counts.individual, company: counts.company })
  }, [counts.individual, counts.company])

  /** Push new filter values into the URL (single source of truth). */
  function navigate(overrides: Partial<VisitorFilters> & { page?: number }) {
    const next: Record<string, string> = {}
    const merged = {
      q: overrides.q !== undefined ? overrides.q : filters.q,
      type: overrides.type !== undefined ? overrides.type : filters.type,
      confidence:
        overrides.confidence !== undefined ? overrides.confidence : filters.confidence,
      source: overrides.source !== undefined ? overrides.source : filters.source,
    }
    if (merged.q) next.q = merged.q
    if (merged.type !== 'all') next.type = merged.type
    if (merged.confidence !== 'all') next.confidence = merged.confidence
    if (merged.source !== 'all') next.source = merged.source
    const targetPage = overrides.page ?? 1
    if (targetPage > 1) next.page = String(targetPage)

    const search = new URLSearchParams(next).toString()
    router.push(search ? `/dashboard/visitors?${search}` : '/dashboard/visitors')
  }

  // Debounced search: typing updates the URL after a pause.
  useEffect(() => {
    if (query === filters.q) return
    const timer = setTimeout(() => navigate({ q: query }), 350)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  function toggleRow(id: string, checked: boolean) {
    setSelectedIds((previous) => {
      const next = new Set(previous)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const pageSelected = visitors.length > 0 && visitors.every((v) => selectedIds.has(v.id))
  const someSelected = visitors.some((v) => selectedIds.has(v.id)) && !pageSelected

  function toggleAll(checked: boolean) {
    setSelectedIds((previous) => {
      const next = new Set(previous)
      for (const visitor of visitors) {
        if (checked) next.add(visitor.id)
        else next.delete(visitor.id)
      }
      return next
    })
  }

  const selected = visitors.find((v) => v.id === selectedId) ?? null

  const tabs: {
    key: Segment
    label: string
    count: number
    icon: React.ComponentType<{ className?: string }> | null
  }[] = [
    // Live app: plain-text tabs, icons only on Individuals/Companies.
    { key: 'all', label: 'All', count: counts.all, icon: null },
    { key: 'individual', label: 'Individuals', count: counts.individual, icon: User },
    { key: 'company', label: 'Companies', count: counts.company, icon: Building2 },
  ]

  /** WAI-ARIA tabs pattern: arrow keys move focus and selection. */
  function onTabKeyDown(event: React.KeyboardEvent, index: number) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    event.preventDefault()
    const direction = event.key === 'ArrowRight' ? 1 : -1
    const next = (index + direction + tabs.length) % tabs.length
    const node = tabRefs.current[next]
    node?.focus()
    navigate({ type: tabs[next].key })
  }

  const exportSelectedUrl =
    selectedIds.size > 0 ? `/api/export?ids=${[...selectedIds].join(',')}` : null

  return (
    <div className="space-y-4">
      {exportSelectedUrl && (
        <div className="flex justify-end">
          <Button asChild variant="outline" className="border-primary font-semibold hover:bg-primary/10">
            <a href={exportSelectedUrl} download>
              <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Export Selected ({selectedIds.size})
            </a>
          </Button>
        </div>
      )}

      {/* Segment tabs — plain text like the live app, on their own row */}
      <div className="flex items-center gap-5" role="tablist" aria-label="Visitor segments">
        {tabs.map((tab, index) => (
          <button
            key={tab.key}
            ref={(node) => {
              tabRefs.current[index] = node
            }}
            type="button"
            role="tab"
            aria-selected={filters.type === tab.key}
            tabIndex={filters.type === tab.key ? 0 : -1}
            onClick={() => navigate({ type: tab.key })}
            onKeyDown={(event) => onTabKeyDown(event, index)}
            className={cn(
              'flex items-center gap-1.5 text-sm transition-colors focus-brand',
              filters.type === tab.key
                ? 'font-bold text-foreground'
                : 'font-medium text-muted-foreground hover:text-foreground',
            )}
          >
              {tab.icon && <tab.icon className="h-4 w-4" aria-hidden="true" />}
              {tab.label}
              <span className="font-semibold tabular-nums">{tab.count}</span>
            </button>
          ))}
      </div>

      {/* Search + filters row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search emails, companies..."
            className="pl-8"
            aria-label="Search visitors"
          />
        </div>

        <Select
          value={filters.confidence}
          onValueChange={(value) => navigate({ confidence: value })}
        >
          <SelectTrigger className="w-[140px]" aria-label="Filter by confidence">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Confidence</SelectItem>
            <SelectItem value="90">90%+</SelectItem>
            <SelectItem value="75">75%+</SelectItem>
            <SelectItem value="50">50%+</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.source} onValueChange={(value) => navigate({ source: value })}>
          <SelectTrigger className="w-[130px]" aria-label="Filter by source">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {Object.entries(SOURCE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="w-10 px-4 py-3">
                  <Checkbox
                    className="rounded-full"
                    aria-label="Select all visitors on this page"
                    checked={pageSelected ? true : someSelected ? 'indeterminate' : false}
                    onCheckedChange={(checked) => toggleAll(checked === true)}
                    disabled={visitors.length === 0}
                  />
                </th>
                <th scope="col" className="px-2 py-3 font-semibold">Visitor</th>
                <th scope="col" className="px-2 py-3 font-semibold">Type</th>
                <th scope="col" className="px-2 py-3 font-semibold">Confidence</th>
                <th scope="col" className="px-2 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {visitors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    {total === 0 && counts.all === 0
                      ? 'No visitors yet. Install your pixel to get started.'
                      : 'No visitors match the current filters.'}
                  </td>
                </tr>
              ) : (
                visitors.map((visitor) => (
                  <tr
                    key={visitor.id}
                    onClick={() => setSelectedId(visitor.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        setSelectedId(visitor.id)
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View details for ${visitor.email ?? 'anonymous visitor'}`}
                    className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-muted/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
                  >
                    <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        className="rounded-full"
                        aria-label={`Select ${visitor.email ?? 'visitor'}`}
                        checked={selectedIds.has(visitor.id)}
                        onCheckedChange={(checked) => toggleRow(visitor.id, checked === true)}
                      />
                    </td>
                    <td className="px-2 py-3">
                      <span className="flex items-center gap-2.5">
                        {visitor.email ? (
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-extrabold text-white"
                            aria-hidden="true"
                          >
                            {initialsForEmail(visitor.email)}
                          </span>
                        ) : (
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
                            aria-hidden="true"
                          >
                            <Eye className="h-4 w-4" />
                          </span>
                        )}
                        <span className="min-w-0">
                          {visitor.email ? (
                            <span className="block truncate font-medium text-foreground">
                              {visitor.email}
                            </span>
                          ) : (
                            <span className="block truncate font-medium text-muted-foreground">
                              Anonymous visitor
                            </span>
                          )}
                          <span className="block truncate text-xs text-muted-foreground">
                            {visitor.domain}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      <Badge variant="secondary" className="bg-sky-50 text-sky-700 hover:bg-sky-50">
                        {SOURCE_LABELS[visitor.source] ?? visitor.source}
                      </Badge>
                    </td>
                    <td className="px-2 py-3">
                      {visitor.confidence !== null ? (
                        <span className="flex items-center gap-2">
                          <Progress
                            value={visitor.confidence}
                            className="h-1.5 w-14 [&>div]:bg-teal-500"
                            aria-hidden="true"
                          />
                          <span className="text-xs font-semibold tabular-nums text-foreground">
                            {visitor.confidence}%
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-2 py-3">
                      {visitor.status === 'active' ? (
                        <Badge variant="secondary" className="bg-primary/20 text-amber-800 hover:bg-primary/20">
                          active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted">
                          inactive
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                      {relativeTime(visitor.lastSeen)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {pageCount > 1 && (
          <nav
            aria-label="Visitor pages"
            className="flex items-center justify-between gap-3 border-t border-border px-4 py-3"
          >
            <p className="text-xs text-muted-foreground">
              Page <span className="font-semibold text-foreground">{page}</span> of{' '}
              <span className="font-semibold text-foreground">{pageCount}</span>
              {' · '}
              {total.toLocaleString()} visitor{total === 1 ? '' : 's'}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => navigate({ page: page - 1 })}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pageCount}
                onClick={() => navigate({ page: page + 1 })}
                aria-label="Next page"
              >
                Next
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </nav>
        )}
      </div>

      {/* Visitor detail sheet */}
      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2.5">
                  {selected.email ? (
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-primary-foreground"
                      aria-hidden="true"
                    >
                      {initialsForEmail(selected.email)}
                    </span>
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted" aria-hidden="true">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </span>
                  )}
                  {selected.email ?? 'Anonymous visitor'}
                </SheetTitle>
                <SheetDescription>
                  {selected.email ? 'Identified visitor' : 'Not yet identified'} · {selected.domain}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-2 space-y-5 px-4 pb-8">
                {selected.companyName && (
                  <p className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2.5 text-sm text-foreground">
                    <Building2 className="h-4 w-4 text-amber-600" aria-hidden="true" />
                    {selected.companyName}
                  </p>
                )}

                <dl className="space-y-3 text-sm">
                  {[
                    ['Email', selected.email ?? '—'],
                    ['Type', selected.type === 'company' ? 'Company (B2B)' : selected.type === 'individual' ? 'Individual (B2C)' : '—'],
                    ['Source', SOURCE_LABELS[selected.source] ?? selected.source],
                    ['Confidence', selected.confidence !== null ? `${selected.confidence}%` : '—'],
                    ['Pageviews', selected.pageviews.toString()],
                    ['First seen', formatDate(selected.firstSeen)],
                    ['Last active', relativeTime(selected.lastSeen)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-4">
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="text-right font-medium text-foreground">{value}</dd>
                    </div>
                  ))}
                </dl>

                {selected.email && (
                  <Button asChild className="w-full font-semibold">
                    <a href={`mailto:${selected.email}`}>
                      <Mail className="mr-1.5 h-4 w-4" aria-hidden="true" />
                      Reach out
                    </a>
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

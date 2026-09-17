'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowUpDown,
  Building2,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  Search,
  User,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import {
  publishSelectedVisitorIds,
  publishVisitorsCounts,
} from '@/components/dashboard/chrome-store'
import { isVisitorActive } from '@/lib/dashboard-nav'
import { formatDate, initialsForEmail, relativeTime } from '@/lib/format'

export interface VisitorRow {
  id: string
  email: string | null
  anonymousId: string
  type: string | null
  companyName: string | null
  city: string | null
  state: string | null
  country: string | null
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
  // can refresh after filter changes (the first paint is server-rendered
  // from getVisitorSegmentCounts — R6-C1).
  useEffect(() => {
    publishVisitorsCounts({ individual: counts.individual, company: counts.company })
  }, [counts.individual, counts.company])

  // R11: publish the row selection so the topbar's Export button swaps to
  // "Export (N)" with an ids-scoped href (the live has no bulk-action row).
  useEffect(() => {
    publishSelectedVisitorIds([...selectedIds])
  }, [selectedIds])

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

  const tabs: { key: Segment; label: string; count: number; icon: React.ComponentType<{ className?: string }> | null }[] = [
    // Live app: pill tabs with count badges, icons only on Individuals/Companies.
    { key: 'all', label: 'All', count: counts.all, icon: null },
    { key: 'individual', label: 'Individuals', count: counts.individual, icon: User },
    { key: 'company', label: 'Companies', count: counts.company, icon: Building2 },
  ]

  return (
    <div className="space-y-4">

      {/* Segment tabs — shadcn pill tabs with count badges like the live
          app (R6-H2); Radix owns the arrow-key roving focus. */}
      <Tabs
        value={filters.type}
        onValueChange={(value) => navigate({ type: value })}
      >
        <TabsList className="h-10 justify-start rounded-md p-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className="h-auto gap-1.5 rounded-sm px-3 py-1.5"
            >
              {tab.icon && <tab.icon className="h-4 w-4" aria-hidden="true" />}
              {tab.label}
              <span className="ml-0.5 inline-flex items-center rounded-full border border-transparent bg-secondary px-1.5 py-0 text-[10px] font-semibold text-secondary-foreground">
                {tab.count}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Search + filters row — live: h-10 search with pl-9 icon, w-44 selects */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search emails, companies..."
            className="h-10 pl-9"
            aria-label="Search visitors"
          />
        </div>

        <Select
          value={filters.confidence}
          onValueChange={(value) => navigate({ confidence: value })}
        >
          <SelectTrigger className="h-10 w-44" aria-label="Filter by confidence">
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
          <SelectTrigger className="h-10 w-40" aria-label="Filter by source">
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

        {/* R11: the live appends a muted "N selected" count to the filter
            row; the export action lives in the topbar (Export (N)). */}
        {selectedIds.size > 0 && (
          <span className="text-xs text-muted-foreground">
            {selectedIds.size} selected
          </span>
        )}
      </div>

      {/* Table — live chrome: muted/30 header strip, 11px uppercase columns
          with a sort glyph on VISITOR, square checkboxes, hover:muted/20 rows. */}
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th scope="col" className="w-10 p-3 pl-5">
                  <Checkbox
                    aria-label="Select all visitors on this page"
                    checked={pageSelected ? true : someSelected ? 'indeterminate' : false}
                    onCheckedChange={(checked) => toggleAll(checked === true)}
                    disabled={visitors.length === 0}
                    className="rounded-sm border-primary"
                  />
                </th>
                <th scope="col" className="p-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    Visitor
                    <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                  </span>
                </th>
                <th scope="col" className="p-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Type</th>
                <th scope="col" className="p-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Confidence</th>
                <th scope="col" className="p-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                <th scope="col" className="p-3 pr-5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {visitors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-3 py-12 text-center text-sm text-muted-foreground">
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
                    aria-label={`View details for ${visitor.email ?? 'visitor'}`}
                    className="border-b border-border transition-colors last:border-0 hover:bg-muted/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
                  >
                    <td className="p-3 pl-5" onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        aria-label={`Select ${visitor.email ?? 'visitor'}`}
                        checked={selectedIds.has(visitor.id)}
                        onCheckedChange={(checked) => toggleRow(visitor.id, checked === true)}
                        className="rounded-sm border-primary"
                      />
                    </td>
                    <td className="p-3">
                      <span className="flex items-center gap-3">
                        {visitor.type === 'company' ? (
                          // Live company rows: square yellow-tint avatar with
                          // a building icon, company name as the primary text.
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10"
                            aria-hidden="true"
                          >
                            <Building2 className="h-4 w-4 text-primary" />
                          </span>
                        ) : (
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-primary text-[10px] font-bold text-primary-foreground"
                            aria-hidden="true"
                          >
                            {initialsForEmail(visitor.email ?? '')}
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {visitor.type === 'company'
                              ? (visitor.companyName ?? visitor.email)
                              : visitor.email}
                          </span>
                          {visitor.type === 'company' ? (
                            // Live company sub-line: primary-tinted visits
                            // count (R6-H3) — the domain stays implicit.
                            <span className="block truncate text-[11px] font-mono text-muted-foreground">
                              <span className="ml-1.5 font-sans text-[10px] text-primary">
                                · {visitor.pageviews} {visitor.pageviews === 1 ? 'visit' : 'visits'}
                              </span>
                            </span>
                          ) : (
                            <span className="block truncate text-[11px] font-mono text-muted-foreground">
                              {visitor.domain}
                            </span>
                          )}
                        </span>
                      </span>
                    </td>
                    <td className="p-3">
                      {visitor.type === 'company' ? (
                        /* R11: px-2 badges keeping the variant hover. */
                        <Badge variant="secondary" className="border-amber-500/20 bg-amber-500/10 px-2 py-0 text-[10px] text-amber-600">
                          Company
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="border-neon-green/20 bg-neon-green/10 px-2 py-0 text-[10px] text-neon-green">
                          {SOURCE_LABELS[visitor.source] ?? visitor.source}
                        </Badge>
                      )}
                    </td>
                    <td className="p-3">
                      {visitor.type === 'company' && visitor.city ? (
                        // Live company rows show the resolved office location
                        // in the Confidence column instead of a bar.
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                          <span className="max-w-[180px] truncate">
                            {visitor.city}, {visitor.state}, {visitor.country}
                          </span>
                        </span>
                      ) : visitor.confidence !== null ? (
                        // Live confidence: a plain neon bar + 12px label.
                        <span className="flex items-center gap-2">
                          <span
                            className="h-1.5 w-14 overflow-hidden rounded-full bg-muted"
                            role="progressbar"
                            aria-valuenow={visitor.confidence}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${visitor.confidence}% confidence`}
                          >
                            <span
                              className="block h-full rounded-full bg-neon-green"
                              style={{ width: `${visitor.confidence}%` }}
                            />
                          </span>
                          <span className="text-xs font-medium text-foreground">
                            {visitor.confidence}%
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      {isVisitorActive(new Date(visitor.lastSeen)) ? (
                        <Badge variant="default" className="text-[10px] px-2 py-0">
                          active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] px-2 py-0">
                          inactive
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 pr-5 text-right text-sm text-muted-foreground">
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

      {/* Visitor detail sheet (clone value-add — the live rows are inert) */}
      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2.5">
                  {selected.type === 'company' ? (
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"
                      aria-hidden="true"
                    >
                      <Building2 className="h-5 w-5 text-primary" />
                    </span>
                  ) : (
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-xs font-bold text-primary-foreground"
                      aria-hidden="true"
                    >
                      {initialsForEmail(selected.email ?? '')}
                    </span>
                  )}
                  {selected.type === 'company' ? (selected.companyName ?? selected.email) : selected.email}
                </SheetTitle>
                <SheetDescription>
                  {selected.type === 'company' ? 'Company (B2B) visitor' : 'Identified visitor'} · {selected.domain}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-2 space-y-5 px-4 pb-8">
                <dl className="space-y-3 text-sm">
                  {[
                    ['Email', selected.email ?? '—'],
                    ['Type', selected.type === 'company' ? 'Company (B2B)' : selected.type === 'individual' ? 'Individual (B2C)' : '—'],
                    ...(selected.city && selected.state && selected.country
                      ? [['Location', `${selected.city}, ${selected.state}, ${selected.country}`] as [string, string]]
                      : []),
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

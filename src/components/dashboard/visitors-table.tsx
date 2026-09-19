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
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Building2Icon } from '@/components/dashboard/live-icons'
import { LegacyBadge, LEGACY_BADGE_SECONDARY, LEGACY_BADGE_DEFAULT } from '@/components/dashboard/content-badges'
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
  publishPageVisitorIds,
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
  confidence: string // 'all' | 'high' | 'medium' | 'low' (R21-F3 bands)
  source: string // 'all' | 'direct' | 'network' (R21-F4 identType)
}

type Segment = 'all' | 'individual' | 'company'

// R21-F4: the live's identification-source labels (the b2c Type-cell
// badge). Traffic attribution was retired — the live's rows carry the
// identification source, never the referrer.
const SOURCE_LABELS: Record<string, string> = {
  direct: 'Direct',
  network: 'Network',
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

  // R21-F1: publish the current page's row ids — the live's "Export All"
  // exports the displayed rows (the current tab's page), never the whole
  // account; the topbar scopes the href with these ids.
  useEffect(() => {
    publishPageVisitorIds(visitors.map((v) => v.id))
  }, [visitors])

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
    { key: 'company', label: 'Companies', count: counts.company, icon: Building2Icon },
  ]

  return (
    <div className="space-y-4">

      {/* Segment tabs — shadcn pill tabs with count badges like the live
          app (R6-H2); Radix owns the arrow-key roving focus. R16: the list
          carries NO consumer classes (the primitive base IS the live string)
          and the icons ship the live's h-3.5 single-name classes. */}
      <Tabs
        value={filters.type}
        onValueChange={(value) => navigate({ type: value })}
      >
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className="gap-1.5"
            >
              {tab.icon && <tab.icon className="h-3.5 w-3.5" aria-hidden="true" />}
              {tab.label}
              {/* R16 D1: legacy-gen count badge (live 158-char string). */}
              <LegacyBadge className={cn(LEGACY_BADGE_SECONDARY, 'text-[10px] px-1.5 py-0 ml-0.5')}>
                {tab.count}
              </LegacyBadge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Search + filters row — live: h-10 search with pl-9 icon, w-44 selects */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search emails, companies..."
            className="pl-9"
            aria-label="Search visitors"
          />
        </div>

        <Select
          value={filters.confidence}
          onValueChange={(value) => navigate({ confidence: value })}
        >
          <SelectTrigger className="w-44" aria-label="Filter by confidence">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {/* R21-F3: the live's band options (runtime-harvested from the
                live's Radix portal). */}
            <SelectItem value="all">All Confidence</SelectItem>
            <SelectItem value="high">High (85%+)</SelectItem>
            <SelectItem value="medium">Medium (70-84%)</SelectItem>
            <SelectItem value="low">Low (&lt;70%)</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.source} onValueChange={(value) => navigate({ source: value })}>
          <SelectTrigger className="w-40" aria-label="Filter by source">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {/* R21-F4: the live's source options — the identification
                source, not traffic attribution. */}
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="direct">Direct Signups</SelectItem>
            <SelectItem value="network">Network Matches</SelectItem>
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
          with a sort glyph on VISITOR, square checkboxes, hover:muted/20 rows.
          R16: th cells carry the live order (text-left first, no scope attr). */}
      {/* R16: the live wraps the table in a CARD (base classes + p-0 body,
          no overflow-hidden consumer). */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-3 pl-5 w-10">
                  <Checkbox
                    aria-label="Select all visitors on this page"
                    checked={pageSelected ? true : someSelected ? 'indeterminate' : false}
                    onCheckedChange={(checked) => toggleAll(checked === true)}
                    disabled={visitors.length === 0}
                  />
                </th>
                <th className="text-left p-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  <span className="inline-flex items-center gap-1">
                    Visitor
                    <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                  </span>
                </th>
                <th className="text-left p-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="text-left p-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Confidence</th>
                <th className="text-left p-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right p-3 pr-5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Last Active</th>
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
                    className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors "
                  >
                    <td className="p-3 pl-5" onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(visitor.id)}
                        onCheckedChange={(checked) => toggleRow(visitor.id, checked === true)}
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {visitor.type === 'company' ? (
                          // Live company rows: square yellow-tint chip with
                          // a building icon, company name as the primary text
                          // (R16: div-rooted, live class order).
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                            <Building2Icon className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0">
                            {initialsForEmail(visitor.email ?? '')}
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="text-sm font-medium block truncate">
                            {visitor.type === 'company'
                              ? (visitor.companyName ?? visitor.email)
                              : visitor.email}
                          </span>
                          {visitor.type === 'company' ? (
                            // Live company sub-line: primary-tinted visits
                            // count (R6-H3) — the domain stays implicit.
                            <span className="text-[11px] text-muted-foreground font-mono block truncate">
                              <span className="ml-1.5 text-[10px] text-primary font-sans">
                                · {visitor.pageviews} {visitor.pageviews === 1 ? 'visit' : 'visits'}
                              </span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground font-mono block truncate">
                              {visitor.domain}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      {visitor.type === 'company' ? (
                        /* R16 D1: legacy-gen badges with the amber/neon tails. */
                        <LegacyBadge className="hover:bg-secondary/80 text-[10px] px-2 py-0 bg-amber-500/10 text-amber-600 border-amber-500/20">
                          Company
                        </LegacyBadge>
                      ) : (
                        /* R21-F4: the live's identType badge — Direct keeps the
                           neon-green tail, Network ships electric-blue. */
                        <LegacyBadge
                          className={cn(
                            'hover:bg-secondary/80 text-[10px] px-2 py-0',
                            visitor.source === 'network'
                              ? 'bg-electric-blue/10 text-electric-blue border-electric-blue/20'
                              : 'bg-neon-green/10 text-neon-green border-neon-green/20',
                          )}
                        >
                          {SOURCE_LABELS[visitor.source] ?? visitor.source}
                        </LegacyBadge>
                      )}
                    </td>
                    <td className="p-3">
                      {visitor.type === 'company' ? (
                        // R21-F8: the live's b2b Confidence cell is ALWAYS the
                        // MapPin location div (location || "—" — never a bar,
                        // never a bare span; b2b confidence is null).
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                          <span className="truncate max-w-[180px]">
                            {[visitor.city, visitor.state, visitor.country]
                              .filter(Boolean)
                              .join(', ') || '—'}
                          </span>
                        </div>
                      ) : (
                        // R21-F5: the live's 3-tier bar fill — >=85 neon-green,
                        // >=70 electric-blue, else hot-pink.
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-14 rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                (visitor.confidence ?? 0) >= 85
                                  ? 'bg-neon-green'
                                  : (visitor.confidence ?? 0) >= 70
                                    ? 'bg-electric-blue'
                                    : 'bg-hot-pink',
                              )}
                              style={{ width: `${visitor.confidence ?? 0}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">
                            {visitor.confidence}%
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      {isVisitorActive(new Date(visitor.lastSeen)) ? (
                        <LegacyBadge className={cn(LEGACY_BADGE_DEFAULT, 'text-[10px] px-2 py-0')}>
                          active
                        </LegacyBadge>
                      ) : (
                        <LegacyBadge className={cn(LEGACY_BADGE_SECONDARY, 'text-[10px] px-2 py-0')}>
                          inactive
                        </LegacyBadge>
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
        </CardContent>
      </Card>

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

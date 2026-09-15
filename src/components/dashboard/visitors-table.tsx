'use client'

import { useMemo, useState } from 'react'
import { Building2, Download, Eye, Mail, Search, User } from 'lucide-react'
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

type Segment = 'all' | 'individual' | 'company'

const SOURCE_LABELS: Record<string, string> = {
  direct: 'Direct',
  search: 'Search',
  social: 'Social',
  referral: 'Referral',
  campaign: 'Campaign',
}

export function VisitorsTable({ visitors }: { visitors: VisitorRow[] }) {
  const [segment, setSegment] = useState<Segment>('all')
  const [query, setQuery] = useState('')
  const [confidence, setConfidence] = useState('all')
  const [source, setSource] = useState('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const counts = useMemo(
    () => ({
      all: visitors.length,
      individual: visitors.filter((v) => v.email && v.type === 'individual').length,
      company: visitors.filter((v) => v.type === 'company').length,
    }),
    [visitors],
  )

  const filtered = useMemo(() => {
    return visitors.filter((visitor) => {
      if (segment === 'individual' && visitor.type !== 'individual') return false
      if (segment === 'company' && visitor.type !== 'company') return false
      if (confidence !== 'all') {
        const min = Number(confidence)
        if ((visitor.confidence ?? 0) < min) return false
      }
      if (source !== 'all' && visitor.source !== source) return false
      if (query) {
        const q = query.toLowerCase()
        const haystack = `${visitor.email ?? ''} ${visitor.companyName ?? ''} ${visitor.domain}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [visitors, segment, query, confidence, source])

  const selected = visitors.find((v) => v.id === selectedId) ?? null

  const tabs: { key: Segment; label: string; count: number; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'all', label: 'All', count: counts.all, icon: Eye },
    { key: 'individual', label: 'Individuals', count: counts.individual, icon: User },
    { key: 'company', label: 'Companies', count: counts.company, icon: Building2 },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{counts.individual}</span> individuals ·{' '}
          <span className="font-semibold text-foreground">{counts.company}</span> companies identified
        </p>
        <Button asChild className="font-semibold shadow-sm">
          <a href="/api/export" download>
            <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Export All
          </a>
        </Button>
      </div>

      {/* Segment tabs + filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-border bg-card p-0.5" role="tablist" aria-label="Visitor segments">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={segment === tab.key}
              onClick={() => setSegment(tab.key)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus-brand',
                segment === tab.key
                  ? 'bg-primary/15 text-amber-700'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <tab.icon className="h-3.5 w-3.5" aria-hidden="true" />
              {tab.label}
              <span className="tabular-nums">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search emails, companies…"
            className="pl-8"
            aria-label="Search visitors"
          />
        </div>

        <Select value={confidence} onValueChange={setConfidence}>
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

        <Select value={source} onValueChange={setSource}>
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
                  <Checkbox aria-label="Select all visitors" disabled={filtered.length === 0} />
                </th>
                <th scope="col" className="px-2 py-3 font-semibold">Visitor</th>
                <th scope="col" className="px-2 py-3 font-semibold">Type</th>
                <th scope="col" className="px-2 py-3 font-semibold">Confidence</th>
                <th scope="col" className="px-2 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    {visitors.length === 0
                      ? 'No visitors yet. Install your pixel to get started.'
                      : 'No visitors match the current filters.'}
                  </td>
                </tr>
              ) : (
                filtered.map((visitor) => (
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
                      <Checkbox aria-label={`Select ${visitor.email ?? 'visitor'}`} />
                    </td>
                    <td className="px-2 py-3">
                      <span className="flex items-center gap-2.5">
                        {visitor.email ? (
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-extrabold text-primary-foreground"
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
                          <Progress value={visitor.confidence} className="h-1.5 w-14" aria-hidden="true" />
                          <span className="text-xs font-semibold tabular-nums text-teal-600">
                            {visitor.confidence}%
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-2 py-3">
                      <Badge variant="secondary" className="bg-primary/20 text-amber-800 hover:bg-primary/20">
                        {visitor.status}
                      </Badge>
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

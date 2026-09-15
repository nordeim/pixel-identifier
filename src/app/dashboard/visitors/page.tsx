import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { listVisitors } from '@/lib/analytics'
import { VisitorsTable } from '@/components/dashboard/visitors-table'

export const metadata: Metadata = {
  title: 'Visitors',
}

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 25
const SEGMENTS = ['all', 'individual', 'company'] as const
const SOURCES = ['direct', 'search', 'social', 'referral', 'campaign'] as const
const CONFIDENCES = ['90', '75', '50'] as const

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

interface VisitorsPageProps {
  searchParams: Promise<{
    q?: string | string[]
    type?: string | string[]
    page?: string | string[]
    confidence?: string | string[]
    source?: string | string[]
  }>
}

export default async function VisitorsPage({ searchParams }: VisitorsPageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const params = await searchParams

  // Every filter is URL-driven (F-24): server-side search, pagination and
  // segment counts stay correct past any page size.
  const q = firstParam(params.q)?.slice(0, 200) ?? ''
  const typeParam = firstParam(params.type)
  const type = (SEGMENTS as readonly string[]).includes(typeParam ?? '')
    ? (typeParam as 'individual' | 'company')
    : undefined
  const confidenceParam = firstParam(params.confidence)
  const minConfidence = (CONFIDENCES as readonly string[]).includes(confidenceParam ?? '')
    ? Number(confidenceParam)
    : undefined
  const sourceParam = firstParam(params.source)
  const source = (SOURCES as readonly string[]).includes(sourceParam ?? '')
    ? sourceParam
    : undefined
  const pageParam = Number(firstParam(params.page) ?? '1')
  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1

  const list = await listVisitors(session.user.id, {
    q,
    type,
    minConfidence,
    source,
    page,
    pageSize: PAGE_SIZE,
  })

  return (
    <VisitorsTable
      visitors={list.rows}
      total={list.total}
      page={list.page}
      pageCount={list.pageCount}
      counts={list.counts}
      filters={{ q, type: typeParam ?? 'all', confidence: confidenceParam ?? 'all', source: sourceParam ?? 'all' }}
    />
  )
}

'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Bell, Download, PanelLeft } from 'lucide-react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { SidebarNav, type UsageProps } from '@/components/dashboard/sidebar-nav'
import { toggleSidebar, useChromeState } from '@/components/dashboard/chrome-store'
import { PAGE_META, visitorsSubtitle } from '@/lib/dashboard-nav'
import { initialsForEmail } from '@/lib/format'
import type { VisitorsCounts } from '@/components/dashboard/chrome-store'

function pageMeta(pathname: string) {
  return PAGE_META[pathname] ?? PAGE_META['/dashboard']
}

export function Topbar({
  email,
  usage,
  unread,
  initialVisitorsCounts,
}: {
  email: string
  usage: UsageProps
  /** True iff an identification resolved in the last 7 days (honest dot). */
  unread: boolean
  /** Server-fetched global segment counts (R6-C1) — the visitors subtitle
   * is real HTML on first paint; the client store only refreshes it after
   * filter changes on the visitors page. */
  initialVisitorsCounts: VisitorsCounts
}) {
  const pathname = usePathname()
  const meta = pageMeta(pathname)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { visitorsCounts, selectedVisitorIds } = useChromeState()
  const isVisitors = pathname === '/dashboard/visitors'

  // R11: with rows selected, the live swaps the topbar Export button to
  // "Export (N)" with an ids-scoped href (no separate bulk-action row).
  const selectedCount = selectedVisitorIds.length
  const exportHref =
    isVisitors && selectedCount > 0
      ? `/api/export?ids=${selectedVisitorIds.join(',')}`
      : '/api/export'

  /** R15-F1: the sidebar breakpoint is md (768px) like the live — the
   * trigger collapses the desktop rail at md+ and opens the mobile sheet
   * below. */
  function onToggleClick() {
    if (window.matchMedia('(min-width: 768px)').matches) {
      toggleSidebar()
    } else {
      setMobileNavOpen(true)
    }
  }

  let subtitle = meta.subtitle
  if (isVisitors) {
    subtitle = visitorsSubtitle(visitorsCounts ?? initialVisitorsCounts)
  }

  return (
    <header className="h-14 flex items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-4">
        {/* R15-F2: the live's trigger — Button base + h-7 w-7 only (no
            variant/size fragment), the primitive's data-sidebar attr and
            an sr-only label. */}
        <Button
          variant="ghost"
          size={null}
          onClick={onToggleClick}
          className="h-7 w-7"
          data-sidebar="trigger"
        >
          <PanelLeft />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>

        {/* Mobile sheet (the same trigger opens it below md). R15-D8: the
            live's SheetContent classes — w-[--sidebar-width] driven by the
            inline 18rem override, slide-in-from-left, bg-sidebar p-0. */}
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent
            side="left"
            className="w-[--sidebar-width] bg-sidebar p-0"
            style={{ '--sidebar-width': '18rem' } as React.CSSProperties}
            data-sidebar="sidebar"
            data-mobile="true"
          >
            <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
            <SidebarNav usage={usage} />
          </SheetContent>
        </Sheet>

        {/* R5-H2: Install and Settings render their title in-page (H1) —
            the live topbar shows no title block on those routes.
            R15-F2: font-display h1 in a plain wrapper (no truncate/min-w-0
            — the live's current build). */}
        {!meta.inPageTitle && (
          <div>
            <h1 className="font-display text-sm font-semibold leading-none">
              {meta.title}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isVisitors && (
          /* R11: live Export = sm gradient button (h-9, glow, 300ms) that
              swaps to "Export (N)" while rows are selected. */
          <Button
            asChild
            size="sm"
            className="hidden gradient-primary text-primary-foreground shadow-lg glow-primary hover:opacity-90 transition-all duration-300 font-semibold sm:inline-flex"
          >
            <a href={exportHref} download>
              <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              {selectedCount > 0 ? `Export (${selectedCount})` : 'Export All'}
            </a>
          </Button>
        )}

        {/* R15-F2: the live's bell — ghost base + relative h-10 w-10, no
            labels; the unread dot is the bg-hot-pink utility. */}
        <Button variant="ghost" size={null} className="relative h-10 w-10">
          <Bell className="h-4 w-4" />
          {unread && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-hot-pink" />}
        </Button>

        {/* R5-H8: the live topbar avatar is a static gradient chip — no
            account dropdown (sign-out lives in the sidebar). R15-F2: the
            live's class order, text-xs + ml-2, no labels. */}
        <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground ml-2">
          {initialsForEmail(email)}
        </div>
      </div>
    </header>
  )
}

'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Bell, Download, PanelLeft } from 'lucide-react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { SidebarNav, type UsageProps } from '@/components/dashboard/sidebar-nav'
import { toggleSidebar, useChromeState } from '@/components/dashboard/chrome-store'
import { PAGE_META, NOTIFICATION_DOT_COLOR, visitorsSubtitle } from '@/lib/dashboard-nav'
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

  /** R11: the live ships ONE PanelLeft toggle (ghost h-7 w-7, icon at 16px
   * via the button's [&_svg]:size-4) — it collapses the desktop rail at
   * lg+ and opens the mobile sheet below. */
  function onToggleClick() {
    if (window.matchMedia('(min-width: 1024px)').matches) {
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
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex min-w-0 items-center gap-4">
        <Button
          variant="ghost"
          onClick={onToggleClick}
          className="h-7 w-7"
          aria-label="Toggle Sidebar"
        >
          <PanelLeft />
        </Button>

        {/* Controlled mobile sheet (the same PanelLeft button opens it). */}
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent side="left" className="w-72 bg-card p-0">
            <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
            <SidebarNav usage={usage} />
          </SheetContent>
        </Sheet>

        {/* R5-H2: Install and Settings render their title in-page (H1) —
            the live topbar shows no title block on those routes. */}
        {!meta.inPageTitle && (
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold leading-none text-foreground">
              {meta.title}
            </h1>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
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

        <Button
          variant="ghost"
          aria-label={unread ? 'New identifications' : 'No new notifications'}
          title={unread ? 'New identifications this week' : 'No new notifications'}
          className="relative h-10 w-10"
        >
          <Bell className="h-4 w-4" />
          {unread && (
            <span
              className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full"
              style={{ backgroundColor: NOTIFICATION_DOT_COLOR }}
              aria-hidden="true"
            />
          )}
        </Button>

        {/* R5-H8: the live topbar avatar is a static gradient chip — no
            account dropdown (sign-out lives in the sidebar). */}
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground gradient-primary"
          aria-label={`Signed in as ${email}`}
          title={email}
        >
          {initialsForEmail(email)}
        </div>
      </div>
    </header>
  )
}

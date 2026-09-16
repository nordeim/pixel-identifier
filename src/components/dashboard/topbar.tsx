'use client'

import { usePathname } from 'next/navigation'
import { Bell, Download, Menu, PanelLeft } from 'lucide-react'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
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
  const { visitorsCounts } = useChromeState()
  const isVisitors = pathname === '/dashboard/visitors'

  let subtitle = meta.subtitle
  if (isVisitors) {
    subtitle = visitorsSubtitle(visitorsCounts ?? initialVisitorsCounts)
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex min-w-0 items-center gap-4">
        {/* Mobile nav */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-card p-0">
            <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
            <SidebarNav usage={usage} />
          </SheetContent>
        </Sheet>

        {/* Desktop sidebar toggle (collapse to icon rail) */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:inline-flex"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <PanelLeft className="h-5 w-5" />
        </Button>

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
          <Button asChild className="hidden font-semibold shadow-sm sm:inline-flex">
            <a href="/api/export" download>
              <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Export All
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
              className="absolute right-2 top-2 h-2 w-2 rounded-full"
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

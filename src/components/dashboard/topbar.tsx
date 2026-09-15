'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Download, LogOut, Menu, PanelLeft } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { SidebarNav, type UsageProps } from '@/components/dashboard/sidebar-nav'
import { toggleSidebar, useChromeState } from '@/components/dashboard/chrome-store'
import { PAGE_META, NOTIFICATION_DOT_COLOR, visitorsSubtitle } from '@/lib/dashboard-nav'
import { initialsForEmail } from '@/lib/format'

function pageMeta(pathname: string) {
  return PAGE_META[pathname] ?? PAGE_META['/dashboard']
}

export function Topbar({
  email,
  usage,
  unread,
}: {
  email: string
  usage: UsageProps
  /** True iff an identification resolved in the last 7 days (honest dot). */
  unread: boolean
}) {
  const pathname = usePathname()
  const meta = pageMeta(pathname)
  const { visitorsCounts } = useChromeState()
  const isVisitors = pathname === '/dashboard/visitors'

  let subtitle = meta.subtitle
  if (isVisitors && visitorsCounts) {
    subtitle = visitorsSubtitle(visitorsCounts)
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

        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold leading-none text-foreground">
            {meta.title}
          </h1>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>
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
          size="icon"
          aria-label={unread ? 'New identifications' : 'No new notifications'}
          title={unread ? 'New identifications this week' : 'No new notifications'}
          className="relative"
        >
          <Bell className="h-4.5 w-4.5" />
          {unread && (
            <span
              className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full"
              style={{ backgroundColor: NOTIFICATION_DOT_COLOR }}
              aria-hidden="true"
            />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Account menu"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-white transition focus-brand hover:opacity-90"
            >
              {initialsForEmail(email)}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="truncate text-sm font-medium text-foreground">{email}</p>
              <p className="text-xs text-muted-foreground">{usage.planName} plan</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/pricing">Pricing &amp; Plan</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <button type="button" onClick={() => void signOut({ callbackUrl: '/' })}>
                <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                Sign out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

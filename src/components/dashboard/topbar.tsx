'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  Bell,
  Code2,
  CreditCard,
  Eye,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
} from 'lucide-react'
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
import { initialsForEmail } from '@/lib/format'
import { signOut } from 'next-auth/react'

const PAGE_META: Record<string, { icon: React.ComponentType<{ className?: string }>; title: string; subtitle: string }> = {
  '/dashboard': { icon: LayoutDashboard, title: 'Overview', subtitle: 'Your visitor identification at a glance' },
  '/dashboard/visitors': { icon: Eye, title: 'Visitors', subtitle: 'Everyone who has landed on your site' },
  '/dashboard/activity': { icon: Activity, title: 'Activity Log', subtitle: 'Real-time feed of visitor events' },
  '/dashboard/install': { icon: Code2, title: 'Install Your Pixel', subtitle: 'One snippet in your <head> tag — works on every page automatically' },
  '/dashboard/domains': { icon: Globe, title: 'Domains', subtitle: 'Manage the websites where your pixel is installed' },
  '/dashboard/pricing': { icon: CreditCard, title: 'Pricing & Plan', subtitle: 'Choose the right plan for your business' },
  '/dashboard/settings': { icon: Settings, title: 'Settings', subtitle: 'Manage your account and pixel configuration' },
}

function pageMeta(pathname: string) {
  return PAGE_META[pathname] ?? PAGE_META['/dashboard']
}

export function Topbar({ email, usage }: { email: string; usage: UsageProps }) {
  const pathname = usePathname()
  const meta = pageMeta(pathname)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-app/95 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
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

        <meta.icon className="hidden h-5 w-5 text-amber-600 sm:block" aria-hidden="true" />
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-foreground">{meta.title}</h1>
          <p className="hidden truncate text-xs text-muted-foreground md:block">{meta.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Honest empty state: no notification system exists yet, so no
            unread indicator is rendered (F-31a). */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications (none yet)"
          title="No notifications yet"
        >
          <Bell className="h-4.5 w-4.5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Account menu"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-primary-foreground transition focus-brand hover:opacity-90"
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

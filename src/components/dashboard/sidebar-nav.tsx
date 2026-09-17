'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  ChartColumn,
  CodeXml,
  CreditCard,
  Eye,
  Settings,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_SECTIONS, type NavItem } from '@/lib/dashboard-nav'
import { PixelcoWordmark } from '@/components/pixelco-logo'
import { SignOutButton } from '@/components/dashboard/sign-out-button'
import { Badge } from '@/components/ui/badge'

const ICONS: Record<NavItem['icon'], React.ComponentType<{ className?: string }>> = {
  'chart-column': ChartColumn,
  eye: Eye,
  activity: Activity,
  'code-xml': CodeXml,
  users: Users,
  'credit-card': CreditCard,
  settings: Settings,
}

export interface UsageProps {
  planName: string
  used: number
  limit: number
  percent: number
  period: 'lifetime' | 'monthly'
  overage: number
  /** Pre-formatted overage list price, e.g. "$15.00". */
  overageCostLabel: string
}

/**
 * R11-F3/F4: rebuilt to the live sidebar chrome (the live ships the shadcn
 * Sidebar suite; these are its effective classes — see
 * research/round11-audit/live-ground-truth.md §4): gap-2 section stack,
 * p-2 groups, h-8 px-2 labels, h-8 rounded-md menu buttons with the warm
 * sidebar-accent active pill, and a borderless p-4 footer whose plan badge
 * is the Badge component rendering the literal uppercase plan name.
 */
export function SidebarNav({
  usage,
  collapsed = false,
}: { usage: UsageProps; collapsed?: boolean }) {
  const pathname = usePathname()

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  return (
    <div className="flex h-full flex-col">
      {/* Live header: p-4, logo h-8 + font-display text-lg wordmark. */}
      <div className="flex items-center gap-2 p-4">
        <Link
          href="/dashboard"
          className="focus-brand rounded-lg"
          aria-label="Pixelco dashboard"
        >
          {collapsed ? (
            <span className="sr-only">Pixelco dashboard</span>
          ) : null}
          <PixelcoWordmark collapsed={collapsed} />
        </Link>
      </div>

      <nav
        className={cn(
          'flex min-h-0 flex-1 flex-col gap-2 overflow-auto',
          collapsed && 'overflow-hidden',
        )}
        aria-label="Dashboard navigation"
      >
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="relative flex w-full min-w-0 flex-col p-2">
            {!collapsed && (
              <p className="flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70">
                {section.title}
              </p>
            )}
            <ul className="flex w-full min-w-0 flex-col gap-1">
              {section.items.map((item) => {
                const active = isActive(item)
                const Icon = ICONS[item.icon]
                return (
                  <li key={item.href} className="relative">
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-md p-2 text-sm outline-none transition-colors focus-brand [&>span:last-child]:truncate [&_svg]:size-4 [&_svg]:shrink-0',
                        collapsed && 'size-8 justify-center p-2',
                        active
                          ? 'hover:bg-sidebar-accent/50 bg-sidebar-accent text-sidebar-accent-foreground font-medium hover:text-sidebar-accent-foreground'
                          : 'h-8 text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                      )}
                    >
                      <Icon aria-hidden="true" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Live footer: borderless p-4 stack; hidden in the icon rail. */}
      {!collapsed && (
        <div className="flex flex-col gap-2 p-4 space-y-3">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 gradient-primary text-primary-foreground border-0"
              >
                {usage.planName.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-snug">
              {usage.used} / {usage.limit.toLocaleString()} identifications
            </p>
            {usage.overage > 0 && (
              <p className="mt-1 text-[11px] font-medium text-amber-800">
                +{usage.overage.toLocaleString()} extra this period · ≈ {usage.overageCostLabel}
              </p>
            )}
            <div
              className="h-1.5 w-full rounded-full bg-muted mt-2 overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={usage.percent}
              aria-label={`${usage.percent}% of ${usage.period} identification allowance used`}
            >
              <div
                className="h-full rounded-full gradient-primary"
                style={{ width: `${Math.min(100, Math.max(0, usage.percent))}%` }}
              />
            </div>
          </div>
          <SignOutButton />
        </div>
      )}
    </div>
  )
}

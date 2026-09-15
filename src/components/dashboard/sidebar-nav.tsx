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

export function SidebarNav({
  usage,
  collapsed = false,
}: { usage: UsageProps; collapsed?: boolean }) {
  const pathname = usePathname()

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  return (
    <div className="flex h-full flex-col">
      {/* R5-H7: live header is p-4 with no border, logo h-8 w-8 + display face. */}
      <div
        className={cn(
          'flex items-center p-4',
          collapsed && 'justify-center',
        )}
      >
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
          'flex-1 space-y-6 overflow-y-auto py-4 brand-scroll',
          collapsed ? 'px-2' : 'px-3',
        )}
        aria-label="Dashboard navigation"
      >
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="px-3 pb-2 text-xs font-medium text-muted-foreground">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item)
                const Icon = ICONS[item.icon]
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'flex items-center rounded-[10px] text-sm font-medium transition-colors focus-brand',
                        collapsed ? 'justify-center px-2 py-2' : 'gap-3 px-3 py-2',
                        active
                          ? // Live tokens: warm off-white pill + golden text/icon (#CC9900).
                            'bg-[#F8F6F2] text-[#CC9900]'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                    >
                      <Icon
                        className={cn('h-4 w-4 shrink-0', active && 'text-[#CC9900]')}
                        aria-hidden="true"
                      />
                      {!collapsed && item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="border-t border-border p-3">
          {/* R5-H7: live usage card — bordered primary/5 card, gradient FREE
              badge, muted count, thin gradient-filled custom progress. */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <span className="inline-flex rounded-sm px-1.5 py-0 text-[10px] font-bold uppercase tracking-wider text-primary-foreground gradient-primary">
              {usage.planName}
            </span>
            <p className="mt-2 text-xs text-muted-foreground">
              {usage.used} / {usage.limit.toLocaleString()} identifications
            </p>
            {usage.overage > 0 && (
              <p className="mt-1 text-[11px] font-medium text-amber-800">
                +{usage.overage.toLocaleString()} extra this period · ≈ {usage.overageCostLabel}
              </p>
            )}
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
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
      {collapsed && (
        <div className="border-t border-border p-2">
          <SignOutButton collapsed />
        </div>
      )}
    </div>
  )
}

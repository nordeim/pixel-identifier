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
import { Progress } from '@/components/ui/progress'
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
      <div
        className={cn(
          'flex h-14 items-center border-b border-border',
          collapsed ? 'justify-center px-2' : 'px-5',
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
              <p className="px-3 pb-2 text-sm font-medium text-muted-foreground">
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
          <div className="rounded-xl bg-primary/10 p-3.5">
            <span className="inline-flex rounded-full bg-primary px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-primary-foreground">
              {usage.planName}
            </span>
            <p className="mt-2 text-xs font-medium text-foreground">
              {usage.used} / {usage.limit.toLocaleString()} identifications
            </p>
            {usage.overage > 0 && (
              <p className="mt-1 text-[11px] font-medium text-amber-800">
                +{usage.overage.toLocaleString()} extra this period · ≈ {usage.overageCostLabel}
              </p>
            )}
            <Progress
              value={usage.percent}
              className="mt-2 h-1.5"
              aria-label={`${usage.percent}% of ${usage.period} identification allowance used`}
            />
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

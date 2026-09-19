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
import { NAV_SECTIONS, type NavItem } from '@/lib/dashboard-nav'
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
 * The sidebar INNER (data-sidebar="sidebar" tree), shared verbatim by the
 * desktop rail and the mobile sheet.
 *
 * R15-F1: the live migrated to the shadcn Sidebar primitive — the header/
 * content/groups/menu carry data-sidebar attrs, the wordmark is the PNG
 * logo asset + an unlinked font-display span, menu buttons are
 * a[data-sidebar=menu-button] with the full peer/menu-button class string
 * (the app tail `h-8 text-sm hover:bg-sidebar-accent/50` and, on the
 * active route, the appended pill tail `bg-sidebar-accent
 * text-sidebar-accent-foreground font-medium`), and icons ship the live's
 * `mr-2 h-4 w-4` treatment. The collapse geometry is driven by
 * group-data-[collapsible=icon] variants — this tree renders identically
 * in both states (evidence: research/round15-audit/live/shell-full.json).
 */
export function SidebarNav({ usage }: { usage: UsageProps }) {
  const pathname = usePathname()

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  return (
    <div data-sidebar="sidebar" className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow">
      {/* Live header: the PNG logo asset + font-display wordmark (no link). */}
      <div data-sidebar="header" className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo-BxfT-ZTZ.png" alt="Pixelco" className="h-8 w-8 shrink-0" />
          <span className="font-display text-lg font-bold">Pixelco</span>
        </div>
      </div>
      <div
        data-sidebar="content"
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden"
      >
        {NAV_SECTIONS.map((section) => (
          <div
            key={section.title}
            data-sidebar="group"
            className="relative flex w-full min-w-0 flex-col p-2"
          >
            <div
              data-sidebar="group-label"
              className="flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0 group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0"
            >
              {section.title}
            </div>
            <div data-sidebar="group-content" className="w-full text-sm">
              <ul data-sidebar="menu" className="flex w-full min-w-0 flex-col gap-1">
                {section.items.map((item) => {
                  const active = isActive(item)
                  const Icon = ICONS[item.icon]
                  return (
                    <li key={item.href} data-sidebar="menu-item" className="group/menu-item relative">
                      <Link
                        href={item.href}
                        data-sidebar="menu-button"
                        data-size="default"
                        data-active="false"
                        aria-current={active ? 'page' : undefined}
                        className={[
                          'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-none ring-sidebar-ring transition-[width,height,padding] focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 hover:text-sidebar-accent-foreground h-8 text-sm hover:bg-sidebar-accent/50',
                          active
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                            : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {/* The live icons carry mr-2 on top of the button's
                            [&_svg]:size-4 (their lucide build predates the
                            aria-hidden default — R15-D11 keeps the
                            framework's idiomatic default). */}
                        <Icon className="mr-2 h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Live footer: borderless p-4 stack; the icon rail hides it via
          overflow (the live keeps the DOM, the geometry clips it). */}
      <div data-sidebar="footer" className="flex flex-col gap-2 p-4 space-y-3">
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
    </div>
  )
}

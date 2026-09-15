'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  CreditCard,
  Eye,
  Globe,
  LayoutDashboard,
  Settings,
  Code2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PixelcoWordmark } from '@/components/pixelco-logo'
import { Progress } from '@/components/ui/progress'
import { SignOutButton } from '@/components/dashboard/sign-out-button'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  exact?: boolean
}

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Analytics',
    items: [
      { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
      { href: '/dashboard/visitors', label: 'Visitors', icon: Eye },
      { href: '/dashboard/activity', label: 'Activity Log', icon: Activity },
    ],
  },
  {
    title: 'Setup',
    items: [
      { href: '/dashboard/install', label: 'Install Pixel', icon: Code2 },
      { href: '/dashboard/domains', label: 'Domains', icon: Globe },
    ],
  },
  {
    title: 'Account',
    items: [
      { href: '/dashboard/pricing', label: 'Pricing & Plan', icon: CreditCard },
      { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export interface UsageProps {
  planName: string
  used: number
  limit: number
  percent: number
  period: 'lifetime' | 'monthly'
}

export function SidebarNav({ usage }: { usage: UsageProps }) {
  const pathname = usePathname()

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-border px-5">
        <Link href="/dashboard" className="focus-brand rounded-lg" aria-label="Pixelco dashboard">
          <PixelcoWordmark />
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4 brand-scroll" aria-label="Dashboard navigation">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-brand',
                        active
                          ? 'bg-primary/15 text-amber-700'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                    >
                      <item.icon className={cn('h-4 w-4', active && 'text-amber-600')} aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className="rounded-xl bg-primary/15 p-3.5">
          <span className="inline-flex rounded-full bg-primary px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-primary-foreground">
            {usage.planName}
          </span>
          <p className="mt-2 text-xs font-medium text-foreground">
            {usage.used} / {usage.limit.toLocaleString()} identifications
          </p>
          <Progress
            value={usage.percent}
            className="mt-2 h-1.5"
            aria-label={`${usage.percent}% of ${usage.period} identification allowance used`}
          />
        </div>
        <SignOutButton />
      </div>
    </div>
  )
}

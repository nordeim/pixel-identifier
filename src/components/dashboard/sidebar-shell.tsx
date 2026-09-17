'use client'

import { useEffect } from 'react'

import { SidebarNav, type UsageProps } from '@/components/dashboard/sidebar-nav'
import { hydrateSidebar, useChromeState } from '@/components/dashboard/chrome-store'

/**
 * Desktop sidebar wrapper — the shadcn Sidebar primitive DOM (R15-F1).
 *
 * The provider carries data-state/data-collapsible (expanded ↔ collapsed
 * icon-rail; persisted via the chrome store, rehydrated after mount so SSR
 * and the first client paint agree). The layout is the primitive's own:
 * an in-flow transparent gap div reserves the rail width next to the main
 * column, and the sidebar itself is a fixed-position container — the
 * collapse geometry (16rem → 3rem) rides entirely on the
 * group-data-[collapsible=icon] variants, exactly like the live.
 */
export function SidebarShell({ usage }: { usage: UsageProps }) {
  const { sidebar } = useChromeState()
  const collapsed = sidebar === 'rail'

  useEffect(() => {
    hydrateSidebar()
  }, [])

  return (
    <div
      data-state={collapsed ? 'collapsed' : 'expanded'}
      data-collapsible={collapsed ? 'icon' : ''}
      data-variant="sidebar"
      data-side="left"
      className="group peer hidden text-sidebar-foreground md:block"
    >
      {/* In-flow gap: reserves the rail width beside the main column. */}
      <div className="relative h-svh w-[--sidebar-width] bg-transparent transition-[width] duration-200 ease-linear group-data-[collapsible=offcanvas]:w-0 group-data-[side=right]:rotate-180 group-data-[collapsible=icon]:w-[--sidebar-width-icon]" />
      {/* Fixed rail: the live's md: breakpoint (768px, not lg). */}
      <div className="fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] duration-200 ease-linear md:flex left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l">
        <SidebarNav usage={usage} />
      </div>
    </div>
  )
}

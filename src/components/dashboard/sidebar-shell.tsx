'use client'

import { useEffect } from 'react'

import { SidebarNav, type UsageProps } from '@/components/dashboard/sidebar-nav'
import { hydrateSidebar, useChromeState } from '@/components/dashboard/chrome-store'

/**
 * Desktop sidebar wrapper. Owns the expanded ↔ icon-rail geometry; the
 * toggle button lives in the topbar and flips the shared chrome store.
 * The persisted state is rehydrated after mount so SSR and the first
 * client paint agree (no hydration mismatch).
 */
export function SidebarShell({ usage }: { usage: UsageProps }) {
  const { sidebar } = useChromeState()

  useEffect(() => {
    hydrateSidebar()
  }, [])

  return (
    <aside
      className={`hidden shrink-0 border-r border-border bg-card transition-[width] duration-200 lg:block ${
        sidebar === 'rail' ? 'w-16' : 'w-64'
      }`}
      data-sidebar={sidebar}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <SidebarNav usage={usage} collapsed={sidebar === 'rail'} />
      </div>
    </aside>
  )
}

'use client'

import { LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

/**
 * NextAuth v4 exposes signOut only as a client API, so the sidebar and the
 * account menu both delegate to this button.
 */
export function SignOutButton({
  className,
  collapsed = false,
}: {
  className?: string
  collapsed?: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl: '/' })}
      title={collapsed ? 'Sign out' : undefined}
      className={cn(
        'flex w-full items-center rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-brand',
        collapsed ? 'justify-center px-2 py-2' : 'gap-3 px-3 py-2',
        className,
      )}
    >
      <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
      {collapsed ? <span className="sr-only">Sign out</span> : 'Sign out'}
    </button>
  )
}

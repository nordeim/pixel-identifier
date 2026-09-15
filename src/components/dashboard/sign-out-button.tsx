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
        // R5-H7: live sign-out — text-xs, gap-2, px-1, LogOut h-3.5.
        'flex w-full items-center rounded-lg py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-brand',
        collapsed ? 'justify-center px-2' : 'gap-2 px-1',
        className,
      )}
    >
      <LogOut className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {collapsed ? <span className="sr-only">Sign out</span> : 'Sign out'}
    </button>
  )
}

'use client'

import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { LogOutIcon } from '@/components/dashboard/live-icons'

/**
 * NextAuth v4 exposes signOut only as a client API, so the sidebar and the
 * account menu both delegate to this button.
 */
export function SignOutButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl: '/' })}
      className={cn(
        // R11: live sign-out — text-xs, gap-2, px-1, LogOut h-3.5; a plain
        // text button (no pill chrome, no hover tint). R16: focus-brand
        // dropped — the live's button carries no focus utility.
        'flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full px-1',
        className,
      )}
    >
      {/* R24 F4/F10: the live's log-out ships the legacy 0.462 geometry at
          h-3.5 w-3.5 with NO shrink-0 (verified DOM). */}
      <LogOutIcon className="h-3.5 w-3.5" aria-hidden="true" />
      Sign out
    </button>
  )
}

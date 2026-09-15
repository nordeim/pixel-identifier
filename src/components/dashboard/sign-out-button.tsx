'use client'

import { LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

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
        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-brand',
        className,
      )}
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      Sign out
    </button>
  )
}

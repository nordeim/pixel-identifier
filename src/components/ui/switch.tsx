'use client'

import { cn } from '@/lib/utils'

/**
 * Dependency-free accessible switch (role="switch"). Matches the off-white
 * pill styling of the live app's billing toggle. Toggles on click,
 * Space and Enter.
 */
export function Switch({
  checked,
  onCheckedChange,
  className,
  'aria-label': ariaLabel,
  id,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
  'aria-label'?: string
  id?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-border bg-muted transition-colors focus-brand disabled:cursor-not-allowed disabled:opacity-50',
        checked && 'bg-primary/60',
        className,
      )}
    >
      <span
        className={cn(
          'pointer-events-none block h-5 w-5 rounded-full bg-card shadow-sm transition-transform',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}

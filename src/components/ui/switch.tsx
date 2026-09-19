'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Radix-style billing switch, rebuilt to the live app bundle's current
 * strings (R16-F7): role="switch" + data-state + value="on", the peer
 * class string with the data-[state=checked/unchecked] bg variants, and
 * a thumb whose translate rides the same state variants (bg-background,
 * shadow-lg, ring-0). The dashboard pricing toggle is its only consumer —
 * the marketing pricing switch (R10 iOS-style w-14 h-7) is a separate
 * component.
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
  const state = checked ? 'checked' : 'unchecked'

  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={ariaLabel}
      data-state={state}
      value="on"
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    >
      <span
        data-state={state}
        className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      />
    </button>
  )
}

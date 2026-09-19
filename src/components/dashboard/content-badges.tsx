import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * R16 D1: the live's CURRENT build ships the LEGACY shadcn Badge generation
 * on content surfaces (visitors tab counts + type/status badges, the domains
 * Pending badge) — base WITH `border` and a secondary variant WITH
 * `text-secondary-foreground` — while the sidebar's FREE badge and the
 * domains Verified badge ship the new-gen string (see ui/badge.tsx). The
 * live renders both generations side by side; these consumers reproduce the
 * legacy string verbatim (evidence: research/round16-audit/live/).
 */
const legacyBadgeBase =
  'inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'

/**
 * The legacy "secondary" fragment — includes the variant's own foreground
 * token, which the new-gen Badge deliberately drops.
 */
export const LEGACY_BADGE_SECONDARY =
  'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80'

export const LEGACY_BADGE_DEFAULT =
  'border-transparent bg-primary text-primary-foreground hover:bg-primary/80'

export function LegacyBadge({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return <div className={cn(legacyBadgeBase, className)} {...props} />
}

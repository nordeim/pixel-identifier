import { cn } from '@/lib/utils'

/**
 * Pixelco mark — four rounded lobes bridged by a thick diagonal stroke,
 * filled with the brand's yellow→amber gradient. Rendered as inline SVG
 * (overlapping shapes share one gradient fill, so they read as a single
 * blob) — works in light and dark contexts without image requests.
 */
export function PixelcoLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      aria-hidden="true"
      className={cn('h-8 w-8', className)}
    >
      <defs>
        <linearGradient id="pixelcoGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD119" />
          <stop offset="100%" stopColor="#FFB800" />
        </linearGradient>
      </defs>
      {/* Central bridge: bottom-left → top-right, rounded ends. */}
      <line
        x1="55"
        y1="180"
        x2="190"
        y2="70"
        stroke="url(#pixelcoGrad)"
        strokeWidth="62"
        strokeLinecap="round"
      />
      {/* Four lobes clustered around the bridge ends. */}
      <circle cx="90" cy="85" r="40" fill="url(#pixelcoGrad)" />
      <circle cx="195" cy="75" r="35" fill="url(#pixelcoGrad)" />
      <circle cx="45" cy="172" r="33" fill="url(#pixelcoGrad)" />
      <circle cx="145" cy="172" r="37" fill="url(#pixelcoGrad)" />
    </svg>
  )
}

export function PixelcoWordmark({
  className,
  collapsed = false,
}: {
  className?: string
  collapsed?: boolean
}) {
  return (
    <span className={cn('inline-flex items-center', collapsed ? 'gap-0' : 'gap-2', className)}>
      <PixelcoLogo />
      {!collapsed && (
        <span className="font-display text-lg font-bold tracking-tight text-foreground">
          Pixelco
        </span>
      )}
    </span>
  )
}

/** Marketing wordmark: Pixelco lockup + "By Ai Viral" cursive subtext (live header/footer, R7-V4). */
export function PixelcoMarketingWordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <PixelcoLogo />
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-bold tracking-tight text-foreground">Pixelco</span>
        <span className="font-script text-xs italic text-muted-foreground translate-y-[3px]">By Ai Viral</span>
      </span>
    </span>
  )
}

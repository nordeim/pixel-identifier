import { cn } from '@/lib/utils'

/**
 * Pixelco mark — a pixelated spark. Rendered as inline SVG so it inherits
 * currentColor and works in light and dark contexts without image requests.
 */
export function PixelcoLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn('h-6 w-6', className)}
    >
      <rect x="2" y="2" width="6" height="6" rx="1" fill="#FACC15" />
      <rect x="16" y="2" width="6" height="6" rx="1" fill="#FACC15" />
      <rect x="9" y="9" width="6" height="6" rx="1" fill="#F59E0B" />
      <rect x="2" y="16" width="6" height="6" rx="1" fill="#FACC15" />
      <rect x="16" y="16" width="6" height="6" rx="1" fill="#FACC15" />
    </svg>
  )
}

export function PixelcoWordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <PixelcoLogo />
      <span className="text-lg font-extrabold tracking-tight text-foreground">
        Pixelco
      </span>
    </span>
  )
}

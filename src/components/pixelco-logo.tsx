import { cn } from '@/lib/utils'

/**
 * Contour trace of the live pixelco.io logo asset (550×550 PNG, fetched
 * 2026-09-16): OpenCV external contour → RDP simplification (59 anchors) →
 * Catmull-Rom smoothing, normalized to a 240×240 viewBox preserving the
 * original's transparent padding so the mark renders at the live's size
 * inside h-8/h-16 boxes. R8-F1: replaces the bar+circles construction that
 * read as an "X" next to the live's organic four-lobe silhouette.
 */
const LOGO_PATH =
  'M 183.3 43.2 C 179.9 45.4 174.9 49.8 172.4 53.2 C 169.9 56.6 169.1 58.1 168.4 63.7 C 167.8 69.3 169.0 81.6 168.4 86.8 C 167.9 92.1 167.9 90.9 165.4 95.1 C 162.9 99.4 157.1 108.3 153.2 112.1 C 149.2 116.0 146.1 117.4 141.8 118.3 C 137.5 119.1 131.5 118.9 127.4 117.4 C 123.4 115.9 119.7 112.0 117.4 109.1 C 115.1 106.2 114.2 105.7 113.9 99.9 C 113.6 94.2 116.0 80.4 115.6 74.6 C 115.3 68.8 113.6 68.0 111.7 65.0 C 109.8 62.1 107.4 59.1 104.3 56.7 C 101.1 54.3 97.2 51.8 92.9 50.6 C 88.7 49.4 82.6 49.6 79.0 49.7 C 75.4 49.9 74.4 50.2 71.6 51.5 C 68.7 52.8 65.1 54.3 62.0 57.6 C 58.8 60.9 54.5 65.9 52.8 71.1 C 51.1 76.4 51.0 84.2 51.5 89.0 C 52.0 93.8 52.9 95.4 55.9 99.9 C 58.8 104.4 67.1 111.5 69.4 116.1 C 71.7 120.7 70.3 124.2 69.4 127.4 C 68.4 130.6 65.8 133.3 63.7 135.3 C 61.6 137.2 61.7 138.4 56.7 139.2 C 51.7 140.0 39.1 139.3 33.6 140.1 C 28.1 140.9 26.7 142.5 24.0 144.0 C 21.3 145.5 19.8 145.9 17.5 149.2 C 15.1 152.6 11.1 159.5 10.0 164.1 C 8.9 168.7 9.7 172.7 10.9 176.7 C 12.1 180.8 14.8 185.5 17.5 188.5 C 20.1 191.6 24.1 193.7 26.6 195.1 C 29.1 196.5 29.5 196.5 32.7 196.8 C 36.0 197.1 42.4 197.5 46.3 196.8 C 50.1 196.1 52.5 195.6 55.9 192.9 C 59.3 190.1 64.1 185.5 66.8 180.2 C 69.5 174.9 70.4 165.5 72.0 161.0 C 73.6 156.5 74.0 156.1 76.4 153.2 C 78.8 150.2 83.0 145.8 86.4 143.6 C 89.8 141.3 93.3 140.2 96.9 139.6 C 100.5 139.1 104.9 139.1 108.2 140.1 C 111.6 141.0 114.8 143.1 116.9 145.3 C 119.1 147.5 119.5 147.8 121.3 153.2 C 123.1 158.5 125.4 171.4 127.9 177.2 C 130.3 183.0 133.6 185.6 136.1 188.1 C 138.7 190.6 140.2 191.2 143.1 192.0 C 146.1 192.8 150.0 193.6 154.0 192.9 C 158.1 192.1 163.9 190.4 167.6 187.6 C 171.3 184.9 174.7 183.7 176.3 176.3 C 177.9 168.9 176.3 151.5 177.2 143.1 C 178.0 134.7 179.8 130.8 181.5 125.7 C 183.3 120.5 185.2 116.0 187.6 112.1 C 190.0 108.3 191.1 105.9 195.9 102.5 C 200.7 99.2 211.7 95.4 216.4 92.1 C 221.1 88.7 222.5 85.6 224.3 82.5 C 226.1 79.3 227.1 77.5 227.3 73.3 C 227.6 69.2 227.2 62.1 225.6 57.6 C 224.0 53.1 221.4 49.6 217.7 46.7 C 214.1 43.8 208.0 41.2 203.8 40.1 C 199.5 39.1 195.8 39.6 192.4 40.1 C 189.0 40.7 186.6 41.0 183.3 43.2 Z'

export function PixelcoLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      aria-hidden="true"
      className={cn('h-8 w-8', className)}
    >
      <defs>
        {/* Live gradient, measured off the asset (R8-F1): #FFD119 at the
            bottom-left lobe → #FFB800 at the top-right lobe, i.e. 135°. */}
        <linearGradient id="pixelcoGrad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFD119" />
          <stop offset="100%" stopColor="#FFB800" />
        </linearGradient>
      </defs>
      <path d={LOGO_PATH} fill="url(#pixelcoGrad)" />
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
        // R11: the live sidebar wordmark text — font-display text-lg
        // font-bold, no tracking/foreground utilities.
        <span className="font-display text-lg font-bold">Pixelco</span>
      )}
    </span>
  )
}

/** Marketing wordmark: logo + "Pixelco" + the "By Ai Viral" cursive subtext
 * INLINE beside the wordmark (live header/footer, R7-V4; un-stacked R10 —
 * the live renders it as a sibling span with translate-y-[3px], not a
 * flex-col sub-line). */
export function PixelcoMarketingWordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <PixelcoLogo />
      <span className="text-lg font-bold text-foreground tracking-tight">
        Pixelco
      </span>
      <span className="font-script text-xs italic text-muted-foreground translate-y-[3px]">
        By Ai Viral
      </span>
    </span>
  )
}

import Link from 'next/link'
import { NotFoundTitle } from '@/components/not-found-title'

/**
 * Root not-found boundary (F-27), rebuilt to the live DOM verbatim (R11-F15):
 * a minimal centered block on bg-muted serving both app and marketing
 * misses — "404" / "Oops! Page not found" / a plain underlined home link.
 *
 * R24 F12 correction: R14-F10 claimed the live swaps the 404 tab title to
 * "Page Not Found | Pixelco" in its client router — disproven by settled-
 * load probes (the live's title stays "Pixelco" forever). The NotFoundTitle
 * island is therefore a KEPT VALUE-ADD in the R14-D3 category (per-page app
 * titles), not live parity; behavior unchanged.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <NotFoundTitle />
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <Link href="/" className="text-primary underline hover:text-primary/90 focus-brand rounded">
          Return to Home
        </Link>
      </div>
    </div>
  )
}

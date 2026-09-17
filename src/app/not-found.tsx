import Link from 'next/link'
import { NotFoundTitle } from '@/components/not-found-title'

/**
 * Root not-found boundary (F-27), rebuilt to the live DOM verbatim (R11-F15):
 * a minimal centered block on bg-muted serving both app and marketing
 * misses — "404" / "Oops! Page not found" / a plain underlined home link.
 * The tab title swaps to the live's "Page Not Found | Pixelco" via the
 * NotFoundTitle client island (R14-F10 — the live performs the same swap
 * in its client router).
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

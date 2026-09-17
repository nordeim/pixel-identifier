'use client'

import { useEffect } from 'react'

/**
 * 404 tab title (R14-F10) — the live pixelco.io serves its CSR shell with
 * the brand title and swaps `document.title` to "Page Not Found | Pixelco"
 * client-side when the router detects the miss (the clone keeps the
 * correct HTTP 404 status the live's SPA fallback cannot offer). This
 * island reproduces that swap for every not-found render — unmatched
 * routes and `notFound()` calls alike.
 *
 * Next's client metadata controller re-applies the resolved root <title>
 * after hydration, so a plain assignment gets overwritten; the observer
 * re-asserts until the controller settles. Unmount (client navigation)
 * disconnects and the next route's metadata applies normally.
 */
export function NotFoundTitle() {
  useEffect(() => {
    const TITLE = 'Page Not Found | Pixelco'
    const titleEl = document.head.querySelector('title')
    if (!titleEl) return

    const apply = () => {
      if (document.title !== TITLE) {
        document.title = TITLE
      }
    }
    apply()

    const observer = new MutationObserver(apply)
    observer.observe(titleEl, {
      childList: true,
      characterData: true,
      subtree: true,
    })

    return () => observer.disconnect()
  }, [])

  return null
}

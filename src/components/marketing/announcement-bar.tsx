'use client'

import { useState } from 'react'
import { ArrowRight, X } from 'lucide-react'

/**
 * Dismissible launch-offer bar (R6-M7): the live marketing bundle renders
 * its own yellow gradient-hero with the rocket emoji inside the text span,
 * a "Claim Now" link with an arrow glyph, and an absolutely-positioned
 * dismiss button.
 */
export function AnnouncementBar() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="gradient-hero-light relative px-4 py-2.5 text-sm text-primary-foreground">
      <div className="container mx-auto flex items-center justify-center gap-3 text-center">
        <span className="font-medium">
          🚀 Launch Offer — Get 100 free visitor identifications when you sign up today
        </span>
        <a
          href="/signup"
          className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 transition-opacity hover:opacity-80"
        >
          Claim Now{' '}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Dismiss announcement"
        className="absolute right-4 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

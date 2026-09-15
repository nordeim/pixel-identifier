'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="relative bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center text-sm font-medium">
        <span aria-hidden="true">🚀</span>
        <p>
          Launch Offer — Get 100 free visitor identifications when you sign up
          today.{' '}
          <a href="#pricing" className="underline underline-offset-2 hover:opacity-80">
            Claim Now →
          </a>
        </p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Dismiss announcement"
          className="absolute right-3 rounded-md p-1 opacity-70 transition hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

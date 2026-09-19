'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

/**
 * Docs sample-snippet copy button (R13-F5) — the live's copy affordance on
 * the SAMPLE code block. Writes the snippet text to the clipboard and
 * confirms with a check glyph.
 */
export function DocsCopyButton() {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      aria-label="Copy sample pixel code"
      className="absolute top-3 right-3 p-2 rounded-md bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
      onClick={() => {
        const snippet = document.getElementById('sample-snippet')?.textContent ?? ''
        void navigator.clipboard?.writeText(snippet).then(() => {
          setCopied(true)
          window.setTimeout(() => setCopied(false), 2000)
        })
      }}
    >
      {copied ? (
        /* R22-F8: the live's copy-success glyph carries text-green-500
            (runtime-verified on pixelco.io/docs). */
        <Check className="w-4 h-4 text-green-500" aria-hidden="true" />
      ) : (
        <Copy className="w-4 h-4" aria-hidden="true" />
      )}
    </button>
  )
}

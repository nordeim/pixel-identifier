'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    // R33-F2 ruling (18th probe generation, re-based on fresh live
    // evidence): the LIVE's install Quick Start button is AWAIT-GATED —
    // with a denied clipboard it does NOT swap (no "Copied!") and its
    // writeText rejection surfaces as an UNCAUGHT pageerror; with a
    // working clipboard it swaps. The docs-page copy button is the
    // OPPOSITE (unconditional swap — see docs-copy-button.tsx). This
    // button therefore keeps the gated shape; the catch below only
    // silences the live's uncaught-rejection defect (D-class, per the
    // R20 "never replicate a live defect" ruling) — the DOM behavior
    // (no swap on failure) is the live's.
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable (permissions/insecure context): the
      // user can still select the text manually.
      setCopied(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={copy}
      className={className}
      aria-label={copied ? 'Copied to clipboard' : 'Copy snippet to clipboard'}
    >
      {copied ? (
        <>
          {/* R22-F7c: the live's install copy state — an UNCOLORED check
              (uncolored) and the "Copied!" label. */}
          <Check className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
          Copy
        </>
      )}
    </Button>
  )
}

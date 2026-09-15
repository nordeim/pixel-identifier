'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable (permissions/insecure context): the user can
      // still select the text manually.
      setCopied(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={copy}
      className={className}
      aria-label={copied ? 'Copied to clipboard' : 'Copy snippet to clipboard'}
    >
      {copied ? (
        <>
          <Check className="mr-1 h-3.5 w-3.5 text-neon-green" aria-hidden="true" />
          Copied
        </>
      ) : (
        <>
          <Copy className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
          Copy
        </>
      )}
    </Button>
  )
}

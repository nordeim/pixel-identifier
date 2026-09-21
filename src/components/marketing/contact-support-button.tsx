'use client'

import { Button } from '@/components/ui/button'

/**
 * R22-F9: the live's docs "Contact Support" CTA is a real <button>
 * (default variant + the gradient tail, NO href — a dead button on the
 * live, ruled a defect). The clone keeps the WORKING behavior via an
 * onClick mailto — the R17 contact-sales pattern: tag parity + a
 * documented functional divergence (never ship a dead CTA).
 */
export function ContactSupportButton() {
  return (
    <Button
      variant={null}
      size={null}
      className="bg-primary hover:bg-primary/90 h-10 px-4 py-2 gradient-cta text-primary-foreground border-0 hover:opacity-90 font-semibold"
      onClick={() => {
        window.location.href = 'mailto:support@pixelco.io'
      }}
    >
      Contact Support
    </Button>
  )
}

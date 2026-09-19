'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PixelcoMarketingWordmark } from '@/components/pixelco-logo'
import { NAV_LINKS } from '@/lib/marketing-links'

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border">
      {/* R18-B7: the live's container rides the `container` utility with
          h-16 px-6 (no max-w-7xl/gap-4). */}
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        {/* R18-B7: the live puts the lockup classes directly on the anchor
            (focus-brand stays as D5 keyboard-a11y chrome). */}
        <Link href="/" className="flex items-center gap-2.5 focus-brand rounded-lg" aria-label="Pixelco home">
          {/* R10: the live header lockup uses gap-2.5 (the footer keeps gap-2). */}
          <PixelcoMarketingWordmark tracking />
        </Link>

        <nav className="hidden md:flex items-center gap-7" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus-brand rounded"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {/* R11: the live's header CTAs are both size sm — ghost + muted
              text for Log In, gradient-cta for Start Identifying. R18-B7:
              the live wraps each in a bare anchor around a real button. */}
          <Link href="/login">
            <Button
              variant={null}
              size={null}
              className="hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 text-muted-foreground font-medium"
            >
              Log In
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              variant={null}
              size={null}
              className="bg-primary hover:bg-primary/90 h-9 rounded-md px-3 gradient-cta text-primary-foreground border-0 hover:opacity-90 font-semibold"
            >
              Start Identifying
            </Button>
          </Link>
        </div>

        <button
          type="button"
          className="md:hidden text-foreground"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-border/60 bg-background md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              <Button variant="ghost" asChild className="text-muted-foreground font-medium">
                <Link href="/login" onClick={() => setOpen(false)}>
                  Log In
                </Link>
              </Button>
              <Button
                asChild
                className="gradient-cta text-primary-foreground border-0 hover:opacity-90 font-semibold"
              >
                <Link href="/signup" onClick={() => setOpen(false)}>
                  Start Identifying
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

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
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="focus-brand rounded-lg" aria-label="Pixelco home">
          {/* R10: the live header lockup uses gap-2.5 (the footer keeps gap-2). */}
          <PixelcoMarketingWordmark className="gap-2.5" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-brand rounded"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {/* R11: the live's header CTAs are both size sm — ghost + muted
              text for Log In, gradient-cta for Start Identifying. */}
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground font-medium">
            <Link href="/login">Log In</Link>
          </Button>
          <Button
            size="sm"
            asChild
            className="gradient-cta text-primary-foreground border-0 hover:opacity-90 font-semibold"
          >
            <Link href="/signup">Start Identifying</Link>
          </Button>
        </div>

        <button
          type="button"
          className="rounded-md p-2 md:hidden focus-brand"
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

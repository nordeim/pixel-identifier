import { Button } from '@/components/ui/button'

/**
 * Shared shell for the auth pages (R6-H4): the live's dark gradient-hero
 * canvas with two breathing blurred orbs (primary top-left, hot-pink
 * bottom-right) behind a centered rounded-lg card. The PNG logo sits
 * INSIDE the card at the live's h-16 size on every auth surface.
 *
 * R15-F3: the card renders base-first (Card primitive order) with the
 * header `p-6 text-center pb-2`, the logo is the self-hosted PNG asset
 * (an <img>, not the inline SVG), and the heading is an h3 on the live's
 * CardTitle pattern (`font-semibold tracking-tight font-display text-2xl`).
 */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <main className="gradient-hero relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Blurred breathing orbs (live .animate-pulse-glow). */}
      <div
        aria-hidden="true"
        className="animate-pulse-glow absolute left-10 top-20 h-72 w-72 rounded-full bg-primary/20 blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="animate-pulse-glow absolute bottom-10 right-10 h-96 w-96 rounded-full bg-hot-pink/20 blur-[120px]"
      />

      <div className="rounded-lg border bg-card text-card-foreground w-full max-w-md relative z-10 border-border/50 shadow-2xl">
        <div className="flex flex-col space-y-1.5 p-6 text-center pb-2">
          <div className="flex justify-center mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/logo-BxfT-ZTZ.png" alt="Pixelco" className="h-16 w-16" />
          </div>
          <h3 className="font-semibold tracking-tight font-display text-2xl">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="p-6 pt-0">{children}</div>
      </div>
    </main>
  )
}

/**
 * OAuth placeholders. R15-D3: the live's buttons run REAL Google OAuth
 * (they navigate to accounts.google.com) — the clone has no provider
 * credentials, so the buttons stay disabled (documented divergence), but
 * the DOM matches the live: Button primitive base + outline classes +
 * `h-10 px-4 py-2 w-full`, icons `h-4 w-4 mr-2`.
 */
export function OAuthButtons() {
  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        size={null}
        disabled
        className="h-10 px-4 py-2 w-full"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 mr-2">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
        </svg>
        Continue with Google
      </Button>
      <Button
        type="button"
        variant="outline"
        size={null}
        disabled
        className="h-10 px-4 py-2 w-full"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 mr-2" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
        Continue with Apple
      </Button>
    </div>
  )
}

/** The live's shadcn or-divider: hairline behind a card-backed label. */
export function OrDivider() {
  return (
    <div className="relative my-6" aria-hidden="true">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-2 text-muted-foreground">or</span>
      </div>
    </div>
  )
}

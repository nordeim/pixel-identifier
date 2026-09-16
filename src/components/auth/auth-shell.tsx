import { PixelcoLogo } from '@/components/pixelco-logo'

/**
 * Shared shell for the auth pages (R6-H4): the live's dark gradient-hero
 * canvas with two breathing blurred orbs (primary top-left, hot-pink
 * bottom-right) behind a centered rounded-lg card. The logo sits INSIDE
 * the card at the live's h-16 size on every auth surface.
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

      <div className="relative z-10 w-full max-w-md rounded-lg border border-border/50 bg-card text-card-foreground shadow-2xl">
        <div className="flex flex-col space-y-1.5 p-6 pb-2 text-center">
          <div className="mb-4 flex justify-center" aria-hidden="true">
            <PixelcoLogo className="h-16 w-16" />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="p-6 pt-0">{children}</div>
      </div>
    </main>
  )
}

export function OAuthButtons() {
  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled
        title="Google sign-in is not configured in this deployment — use email below"
        className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-input bg-background text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
      >
        <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18A10.97 10.97 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        Continue with Google
      </button>
      <button
        type="button"
        disabled
        title="Apple sign-in is not configured in this deployment — use email below"
        className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-input bg-background text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
      >
        <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4 fill-foreground" aria-hidden="true">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
        Continue with Apple
      </button>
    </div>
  )
}

/** The live's shadcn or-divider: hairline behind a card-backed label. */
export function OrDivider() {
  return (
    <div className="relative my-4" aria-hidden="true">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-2 text-muted-foreground">or</span>
      </div>
    </div>
  )
}

import { PixelcoLogo } from '@/components/pixelco-logo'

/**
 * Shared shell for the auth pages: dark canvas with a warm radial glow and a
 * centered white card, mirroring the product's sign-in aesthetic.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-stone-950 px-4 py-10"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(180,130,40,0.22), transparent), radial-gradient(ellipse 60% 50% at 50% 110%, rgba(120,80,20,0.18), transparent)',
      }}
    >
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center" aria-hidden="true">
          <PixelcoLogo className="h-10 w-10" />
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-2xl shadow-black/40">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{title}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>

        <p className="mt-6 text-center text-sm text-stone-400">{footer}</p>
      </div>
    </main>
  )
}

export function OAuthButtons() {
  return (
    <div className="space-y-2.5">
      <button
        type="button"
        disabled
        title="Google sign-in is not configured in this deployment — use email below"
        className="flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-stone-200 bg-stone-50 text-sm font-medium text-stone-700 opacity-60 cursor-not-allowed"
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
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
        className="flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-stone-200 bg-stone-50 text-sm font-medium text-stone-700 opacity-60 cursor-not-allowed"
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-stone-900" aria-hidden="true">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
        Continue with Apple
      </button>
    </div>
  )
}

export function OrDivider() {
  return (
    <div className="my-5 flex items-center gap-3" aria-hidden="true">
      <span className="h-px flex-1 bg-stone-200" />
      <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">or</span>
      <span className="h-px flex-1 bg-stone-200" />
    </div>
  )
}

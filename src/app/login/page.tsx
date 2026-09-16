import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { AuthShell, OAuthButtons, OrDivider } from '@/components/auth/auth-shell'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Sign In',
}

interface LoginPageProps {
  searchParams: Promise<{ registered?: string | string[] }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const registered = params.registered === '1'

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Pixelco account"
    >
      {registered && (
        <p className="flex items-start gap-2 rounded-lg bg-primary/10 px-3 py-2.5 text-sm text-foreground" role="status">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          Account created — sign in to continue to your dashboard.
        </p>
      )}
      <OAuthButtons />
      <OrDivider />
      <LoginForm />
      {/* R7: the live renders the auth footer link as a sibling AFTER the
          form, not inside it. R9-F3: this is the ONLY copy (a duplicate
          inside LoginForm shipped the link twice). */}
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Sign up free
        </Link>
      </p>
    </AuthShell>
  )
}

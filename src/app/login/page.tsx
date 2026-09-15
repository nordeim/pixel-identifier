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
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-semibold text-amber-400 hover:text-amber-300">
            Sign up free
          </Link>
        </>
      }
    >
      {registered && (
        <p className="flex items-start gap-2 rounded-lg bg-teal-500/10 px-3 py-2.5 text-sm text-teal-300" role="status">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Account created — sign in to continue to your dashboard.
        </p>
      )}
      <OAuthButtons />
      <OrDivider />
      <LoginForm />
    </AuthShell>
  )
}

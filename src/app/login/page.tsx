import type { Metadata } from 'next'
import { AuthShell, OAuthButtons, OrDivider } from '@/components/auth/auth-shell'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Sign In',
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Pixelco account"
      footer={
        <>
          Don&apos;t have an account?{' '}
          <a href="/signup" className="font-semibold text-amber-400 hover:text-amber-300">
            Sign up free
          </a>
        </>
      }
    >
      <OAuthButtons />
      <OrDivider />
      <LoginForm />
    </AuthShell>
  )
}

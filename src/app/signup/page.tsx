import type { Metadata } from 'next'
import { AuthShell, OAuthButtons, OrDivider } from '@/components/auth/auth-shell'
import { SignUpForm } from '@/components/auth/signup-form'

export const metadata: Metadata = {
  title: 'Create Your Account',
}

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Start identifying visitors in minutes"
      footer={
        <>
          Already have an account?{' '}
          <a href="/login" className="font-semibold text-amber-400 hover:text-amber-300">
            Sign in
          </a>
        </>
      }
    >
      <OAuthButtons />
      <OrDivider />
      <SignUpForm />
    </AuthShell>
  )
}

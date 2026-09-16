import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthShell, OrDivider } from '@/components/auth/auth-shell'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export const metadata: Metadata = {
  title: 'Forgot Password',
}

/**
 * Password-reset request page — the target of the login form's
 * "Forgot password?" link. The live product links here too but serves a
 * 404; this clone ships a working anti-enumeration form instead (a dead
 * link would be a bug in our product). Email transport is not implemented
 * — see the form's honest configuration note and PAD §11.
 */
export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link"
      logoClassName="h-16 w-16"
    >
      <ForgotPasswordForm />

      <OrDivider />

      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{' '}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  )
}

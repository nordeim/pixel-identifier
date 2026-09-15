'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { AlertCircle, ArrowRight, Loader2, ShieldCheck } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { signUpAction } from '@/actions/auth'
import type { BillingCycle, PlanId } from '@/lib/plans'

/**
 * Sign-up flow: the server action creates the account, then the client signs
 * in with NextAuth's credentials flow (v4 exposes signIn only client-side)
 * and enters the dashboard. Kept in the submit handler — not an effect — so
 * state transitions are driven by the user action, not by render cycles.
 */
export function SignUpForm({
  intentPlan = 'free',
  intentCycle = 'monthly',
}: {
  intentPlan?: PlanId
  intentCycle?: BillingCycle
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    setPending(true)
    setError(null)
    setFieldErrors(null)

    const result = await signUpAction(null, formData)
    if (!result.ok) {
      setError(result.error.message)
      setFieldErrors(result.error.fieldErrors ?? null)
      setPending(false)
      return
    }

    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')
    const signInResult = await signIn('credentials', { email, password, redirect: false })
    if (signInResult?.error) {
      // Account exists but the auto sign-in failed — continue at the login
      // page. Always release the pending state so the button recovers even
      // if navigation is slow (F-06).
      setPending(false)
      router.push('/login?registered=1')
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  const fieldError = (field: string): string | undefined => fieldErrors?.[field]?.[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Plan intent captured from the pricing page (?plan=…&cycle=…) */}
      <input type="hidden" name="plan" value={intentPlan} />
      <input type="hidden" name="cycle" value={intentCycle} />
      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email">Work Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
          aria-invalid={Boolean(fieldError('email'))}
        />
        {fieldError('email') && <p className="text-xs text-red-600">{fieldError('email')}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Min. 6 characters"
          minLength={6}
          required
          aria-invalid={Boolean(fieldError('password'))}
        />
        {fieldError('password') && <p className="text-xs text-red-600">{fieldError('password')}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          required
          aria-invalid={Boolean(fieldError('confirmPassword'))}
        />
        {fieldError('confirmPassword') && (
          <p className="text-xs text-red-600">{fieldError('confirmPassword')}</p>
        )}
      </div>

      <Button type="submit" disabled={pending} className="h-11 w-full text-sm font-bold">
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <>
            Start Free Trial
            <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
          </>
        )}
      </Button>

      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-teal-600" aria-hidden="true" />
        No credit card required
      </p>

      <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
        By signing up you agree to our{' '}
        <Link href="/" className="underline underline-offset-2 hover:text-foreground">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/" className="underline underline-offset-2 hover:text-foreground">
          Privacy Policy
        </Link>
        .
      </p>

      <p className="pt-1 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-amber-600 hover:text-amber-700">
          Sign in
        </Link>
      </p>
    </form>
  )
}

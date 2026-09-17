'use client'

import { useState } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

/**
 * Password-reset request form. Submission renders the standard
 * anti-enumeration response (same message whether or not the account
 * exists) plus an honest configuration note: this self-hostable clone has
 * no email transport, so reset links are not actually delivered until an
 * operator wires one up (PAD §11 — the same honesty rule as simulated
 * billing).
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [pending, setPending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Enter a valid email address.')
      return
    }
    setPending(true)
    // No transport is configured in this deployment; the request is
    // idempotent and stateless, so we acknowledge without revealing
    // whether the account exists.
    await new Promise((resolve) => setTimeout(resolve, 400))
    setPending(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="space-y-3 text-center" role="status">
        <p className="text-sm font-medium text-foreground">
          If an account exists for{' '}
          <span className="font-semibold">{email.trim()}</span>, a password
          reset link has been sent.
        </p>
        <p className="text-xs text-muted-foreground">
          Self-hosted note: email delivery must be configured by your
          operator for reset links to arrive.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="h-10 w-full font-semibold text-primary-foreground shadow-lg glow-primary transition-all duration-300 hover:opacity-90"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <>
            Send Reset Link
            <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
          </>
        )}
      </Button>
    </form>
  )
}

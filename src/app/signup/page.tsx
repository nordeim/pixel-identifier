import type { Metadata } from 'next'
import { AuthShell, OAuthButtons, OrDivider } from '@/components/auth/auth-shell'
import { SignUpForm } from '@/components/auth/signup-form'
import { PLANS, type BillingCycle, type PlanId } from '@/lib/plans'

export const metadata: Metadata = {
  title: 'Create Your Account',
}

interface SignUpPageProps {
  searchParams: Promise<{ plan?: string | string[]; cycle?: string | string[] }>
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  // The marketing pricing cards link here with ?plan=<id>&cycle=<cycle> —
  // keep that intent through account creation (F-28).
  const params = await searchParams
  const planParam = Array.isArray(params.plan) ? params.plan[0] : params.plan
  const cycleParam = Array.isArray(params.cycle) ? params.cycle[0] : params.cycle

  const plan: PlanId = planParam && planParam in PLANS ? (planParam as PlanId) : 'free'
  const cycle: BillingCycle = cycleParam === 'annual' ? 'annual' : 'monthly'

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start identifying visitors in minutes"
      logoClassName="h-16 w-16"
    >
      <OAuthButtons />
      <OrDivider />
      <SignUpForm intentPlan={plan} intentCycle={cycle} />
    </AuthShell>
  )
}

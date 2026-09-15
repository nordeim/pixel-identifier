import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireUser } from '@/lib/analytics'
import { db } from '@/lib/db'
import { SettingsPanel } from '@/components/dashboard/settings-panel'

export const metadata: Metadata = {
  title: 'Settings',
}

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const sessionUser = await requireUser(await getServerSession(authOptions))

  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    select: { email: true, company: true, website: true },
  })
  // A deleted-but-still-cookied account lands here: send it to the login page.
  if (!user) redirect('/login')

  return (
    <SettingsPanel
      email={user.email}
      company={user.company}
      website={user.website}
    />
  )
}

import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { SettingsPanel } from '@/components/dashboard/settings-panel'

export const metadata: Metadata = {
  title: 'Settings',
}

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, name: true, company: true, website: true },
  })
  if (!user) redirect('/login')

  return (
    <SettingsPanel
      email={user.email}
      name={user.name}
      company={user.company}
      website={user.website}
    />
  )
}

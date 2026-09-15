'use client'

import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/**
 * Install-page domain switcher: one snippet per registered domain. Uses a
 * combobox like the live app (round-4 parity) and navigates via the
 * `?site=<siteKey>` query param.
 */
export function DomainSwitcher({
  domains,
  activeSiteKey,
}: {
  domains: { siteKey: string; domain: string }[]
  activeSiteKey: string
}) {
  const router = useRouter()

  return (
    <Select
      value={activeSiteKey}
      onValueChange={(siteKey) => router.push(`/dashboard/install?site=${siteKey}`)}
    >
      <SelectTrigger className="w-[220px]" aria-label="Select domain">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {domains.map((option) => (
          <SelectItem key={option.siteKey} value={option.siteKey}>
            {option.domain}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

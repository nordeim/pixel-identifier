'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/**
 * Install-page domain switcher: one snippet per registered domain. Uses a
 * combobox like the live app (round-4 parity).
 *
 * R30-F3: the live's switcher is PURE CLIENT STATE — selecting a domain
 * swaps the trigger text and the snippet while the URL stays
 * /dashboard/install (no query param). The component is therefore
 * CONTROLLED: the selection state lives in the parent (InstallPanels) and
 * this is a pure presentational trigger — no navigation, no query param.
 */
export function DomainSwitcher({
  domains,
  activeSiteKey,
  onSiteChange,
}: {
  domains: { siteKey: string; domain: string }[]
  activeSiteKey: string
  onSiteChange: (siteKey: string) => void
}) {
  return (
    <Select value={activeSiteKey} onValueChange={onSiteChange}>
      <SelectTrigger className="w-[200px]" aria-label="Select domain">
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

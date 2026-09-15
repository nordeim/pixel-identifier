/**
 * Site selection helpers for the dashboard.
 */

export interface SelectableSite {
  siteKey: string
}

/**
 * Pick the site whose snippet the Install page should show: the site whose
 * key matches the `?site=` query parameter, else the first registered site.
 * Callers pass sites ordered by `createdAt` ascending.
 */
export function pickSelectedSite<T extends SelectableSite>(
  sites: T[],
  siteKeyParam: string | null,
): T | null {
  if (sites.length === 0) return null
  if (siteKeyParam) {
    const match = sites.find((site) => site.siteKey === siteKeyParam)
    if (match) return match
  }
  return sites[0]
}

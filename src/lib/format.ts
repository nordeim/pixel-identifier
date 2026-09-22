/** Presentation helpers shared by landing, dashboard and exports. */

export function relativeTime(date: Date | string): string {
  const then = typeof date === 'string' ? new Date(date) : date
  // R21-F9: the live's Ry formatter (index-nhmKaUsm.js), byte-for-byte:
  // "Just now" below one minute, "N min ago", "N hr ago", then the compact
  // "Nd ago" (no space) forever — no weeks branch, no date fallback.
  const minutes = Math.floor((Date.now() - then.getTime()) / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * Full-month date for marketing surfaces (R13-F9): the live blog cards
 * and article pages render "September 10, 2026" while the dashboard
 * keeps the short "Sep 15, 2026" form (formatDate above).
 */
export function formatDateLong(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

/** Avatar initials for an email address, e.g. "marcus.smith@…" -> "MA". */
export function initialsForEmail(email: string): string {
  const local = email.split('@')[0]
  const parts = local.split(/[._-]+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return local.slice(0, 2).toUpperCase()
}

/* csvCell was RETIRED in R21-F1: the export now replicates the live's
   byte format (raw unquoted values, LF, no BOM — see api/export/route.ts).
   The formula-injection guard is intentionally not re-applied: the live's
   own export ships raw values (never replicate-vs-exceed the live), and in
   this clone the exported values come only from the deterministic
   resolver's catalogs — no user-supplied text reaches a CSV cell. */

/**
 * R24 F6: the live dashboard's New This Week change badge, decoded from
 * its app bundle: `u = d>0 ? ((c-d)/d*100).toFixed(1) : "0"`,
 * `change = d>0 ? (Number(u)>=0 ? "+" : "") + u + "%" : ""` and
 * `up = Number(u) >= 0`. Empty change means NO badge (last week was 0);
 * the explicit `+` prefix only applies at >= 0 (negatives carry their own
 * minus). Pinned by tests/dashboard-r24-parity.test.tsx.
 */
export function weekOverWeekChange(
  current: number,
  lastWeek: number,
): { change: string; up: boolean } {
  if (lastWeek <= 0) return { change: '', up: true }
  const pct = ((current - lastWeek) / lastWeek * 100).toFixed(1)
  const up = Number(pct) >= 0
  return { change: `${up ? '+' : ''}${pct}%`, up }
}

/** Presentation helpers shared by landing, dashboard and exports. */

export function relativeTime(date: Date | string): string {
  const then = typeof date === 'string' ? new Date(date) : date
  const seconds = Math.max(0, Math.floor((Date.now() - then.getTime()) / 1000))
  if (seconds < 45) return 'Just now'
  if (seconds < 90) return '1 min ago'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}w ago`
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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

/** Escape a value for safe inclusion in a CSV cell (RFC 4180). */
export function csvCell(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? '' : String(value)
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

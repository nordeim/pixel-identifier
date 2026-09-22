import * as React from 'react'

/**
 * R16 D4: the live ships an older lucide generation whose icon class names
 * carry a single kebab token (`lucide-building2`, `lucide-trash2`,
 * `lucide-circle-help`). lucide-react 0.525 renames those icons and emits
 * the new name plus a legacy alias (`lucide-building2 lucide-building-2`),
 * a DOM-level drift. These components render the live's exact class string
 * with lucide's current path data — the same approach as R12's
 * CompanyBuildingIcon (a custom SVG where lucide couldn't match the live).
 * Internal path precision (2- vs 3-decimal) stays a documented divergence
 * (D11 category).
 *
 * R24: the live app bundle pins lucide-react v0.462.0 (declared verbatim
 * in assets/index-nhmKaUsm.js) — ten more icons drift GEOMETRICALLY (the
 * 2024 redesign landed between 0.462 and 0.525): bell, log-out, mail,
 * users, download, search, code, shopping-bag, trending-up/down. The
 * overrides below carry the live's exact 0.462 element sequences (incl.
 * the old polyline/line encodings and the rect-first mail order). The
 * live's MARKETING bundle ships the NEW generation — never use these
 * components outside dashboard/app contexts (see
 * tests/live-icons-r24.test.tsx). LoaderCircle needs no override: 0.525's
 * is byte-identical to the live's.
 */
function iconSvg(
  name: string,
  paths: React.ReactNode,
): React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' }> {
  function Icon({ className, ...rest }: { className?: string; 'aria-hidden'?: boolean | 'true' }) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className ? `lucide lucide-${name} ${className}` : `lucide lucide-${name}`}
        {...rest}
      >
        {paths}
      </svg>
    )
  }
  Icon.displayName = name
  return Icon
}

export const Building2Icon = iconSvg(
  'building2',
  <>
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
    <path d="M10 6h4" />
    <path d="M10 10h4" />
    <path d="M10 14h4" />
    <path d="M10 18h4" />
  </>,
)

export const Trash2Icon = iconSvg(
  'trash2',
  <>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </>,
)

export const CircleHelpIcon = iconSvg(
  'circle-help',
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </>,
)

// ---- R24: lucide-react 0.462 geometries (the live app bundle's pin) ----

export const BellIcon = iconSvg(
  'bell',
  <>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </>,
)

export const LogOutIcon = iconSvg(
  'log-out',
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </>,
)

export const MailIcon = iconSvg(
  'mail',
  <>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </>,
)

export const UsersIcon = iconSvg(
  'users',
  <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>,
)

export const DownloadIcon = iconSvg(
  'download',
  <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </>,
)

export const SearchIcon = iconSvg(
  'search',
  <>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </>,
)

export const CodeIcon = iconSvg(
  'code',
  <>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </>,
)

export const ShoppingBagIcon = iconSvg(
  'shopping-bag',
  <>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </>,
)

export const TrendingUpIcon = iconSvg(
  'trending-up',
  <>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </>,
)

export const TrendingDownIcon = iconSvg(
  'trending-down',
  <>
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
    <polyline points="16 17 22 17 22 11" />
  </>,
)

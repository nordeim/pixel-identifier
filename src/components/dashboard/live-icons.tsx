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

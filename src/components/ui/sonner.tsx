'use client'

import { Toaster as Sonner } from 'sonner'

/**
 * The sonner Toaster (R27-F1) — the live app bundle's toast runtime.
 *
 * Live-verified 2026-09-23 (12th probe generation): mutation feedback on
 * the live fires sonner SUCCESS toasts bottom-right — settings save →
 * "Settings saved", domain add → "Domain added successfully", domain
 * delete → "Domain removed" — title-only, Heroicons check-circle icon,
 * 4 s auto-dismiss. The runtime fingerprinted from the live's bundle as
 * sonner 1.7.4 (pinned exact in package.json); v2.0.x diverges (no CSS
 * :where() wrapper, -8px lift, a data-react-aria-top-layer attr).
 *
 * This wrapper is the shadcn sonner integration with the live's exact
 * toast class family. NO position/theme/offset/duration props — the live
 * runs sonner 1.7 defaults (bottom-right, light theme, 356px width,
 * 32/16px offsets, visibleToasts 3, gap 14), and every default is
 * reproduced by simply not overriding it. The <ol data-sonner-toaster>
 * renders ONLY while toasts exist; idle pages carry just the empty
 * <section aria-label="Notifications alt+T"> (byte-verified on the live
 * at rest).
 */

type ToasterProps = React.ComponentProps<typeof Sonner>

const TOAST_CLASS_NAMES = {
  toast:
    'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
  description: 'group-[.toast]:text-muted-foreground',
  actionButton:
    'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
  cancelButton:
    'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
} satisfies NonNullable<ToasterProps['toastOptions']>['classNames']

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{ classNames: TOAST_CLASS_NAMES }}
      {...props}
    />
  )
}

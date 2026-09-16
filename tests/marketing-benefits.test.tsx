import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Features } from '@/components/marketing/features'

/**
 * R10-F3 regression test: the live benefits section renders the six feature
 * items as a TWO-COLUMN grid — `grid sm:grid-cols-2 gap-x-6 gap-y-7` — with
 * items `flex gap-3`, icon chips `w-9 h-9 rounded-lg bg-secondary` holding
 * 18px (`w-4.5 h-4.5`) text-primary icons, h2 `font-bold … mt-2 mb-10`, and
 * the product screenshot in a padding-less
 * `relative rounded-xl shadow-elevated overflow-hidden border border-border
 * bg-card` wrap (img `w-full`). The clone previously shipped a single-column
 * `space-y-6` list with 20px icons and a padded shadow-xl wrap.
 */

const html = renderToStaticMarkup(<Features />)

describe('Features / benefits (R10-F3 live DOM parity)', () => {
  it('renders the feature items as the live 2-column grid', () => {
    expect(html).toContain('grid sm:grid-cols-2 gap-x-6 gap-y-7')
    expect(html).not.toContain('space-y-6')
  })

  it('renders the live item anatomy (flex gap-3, 9x9 secondary icon chip, 18px icons)', () => {
    expect(html).toContain('w-9 h-9 rounded-lg bg-secondary')
    expect(html).toContain('flex gap-3')
    expect(html).toContain('w-4.5 h-4.5')
    expect(html).not.toContain('h-5 w-5')
    // Live item text anatomy: semibold text-sm titles, text-xs bodies.
    expect(html).toContain('font-semibold text-sm text-foreground mb-0.5')
    expect(html).toContain('text-xs text-muted-foreground leading-relaxed')
  })

  it('renders the live h2 rhythm (font-bold, mt-2 mb-10)', () => {
    expect(html).toContain('font-bold')
    expect(html).toContain('mt-2 mb-10')
    expect(html).not.toContain('font-extrabold')
  })

  it('wraps the screenshot the live way — no padding, shadow-elevated', () => {
    expect(html).toContain('relative rounded-xl shadow-elevated overflow-hidden border border-border bg-card')
    expect(html).not.toContain('p-4')
    expect(html).not.toContain('shadow-xl')
    expect(html).not.toContain('shadow-black/5')
  })
})

import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Hero } from '@/components/marketing/hero'

/**
 * R10-F2 regression test: the live hero, extracted verbatim from the
 * pixelco.io DOM —
 *
 *   <section class="pt-16 pb-20 overflow-hidden">
 *     <div class="container mx-auto px-6">
 *       <div class="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
 *         <div class="max-w-xl">
 *           badge:  inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
 *                   bg-card border border-border mb-6 — ★★★★★ (text-highlight)
 *                   + w-px h-3 bg-border divider + accent-dot label
 *                   (text-xs font-medium text-muted-foreground; NOT uppercase,
 *                   no emoji)
 *           h1:     text-4xl sm:text-5xl lg:text-[3.5rem] font-bold
 *                   tracking-tight leading-[1.1] sm:leading-none mb-5 —
 *                   the em-dash lives INSIDE the italic gradient span.
 *                   (R12-F2: the live's Tailwind v3 pairs sm:text-5xl
 *                   with line-height:1, and variant rules cascade AFTER
 *                   plain utilities — so at >=sm the H1 renders ratio 1.0
 *                   despite leading-[1.1]. The clone's v4 --tw-leading
 *                   machinery lets leading-[1.1] win everywhere, +17px on
 *                   the hero; sm:leading-none reproduces the live's
 *                   effective metrics. Sub-sm keeps 1.1 like the live.)
 *           p:      text-lg text-muted-foreground leading-relaxed mb-8 with
 *                   italic <em>and</em>
 *           pills:  rounded-lg bg-card border border-border (mb-8) ✓
 *           row:    avatars + stars (mb-6 — no mt-8)
 *           CTAs:   flex flex-col sm:flex-row gap-3 mb-4 — primary
 *                   gradient-cta px-7 h-12 w-full sm:w-auto, secondary
 *                   border bg-background hover:bg-card font-medium
 *           takes:  text-xs text-muted-foreground, "·" separators
 *         (no radial-gradient decoration div anywhere in the section)
 */

const html = renderToStaticMarkup(<Hero />)

describe('Hero (R10-F2 live DOM parity)', () => {
  it('ships the live section + container + grid + text-column structure', () => {
    expect(html).toContain('pt-16 pb-20 overflow-hidden')
    expect(html).toContain('container mx-auto px-6')
    expect(html).toContain('grid lg:grid-cols-2 gap-12 lg:gap-8 items-center')
    expect(html).toContain('max-w-xl')
  })

  it('renders the card-chip badge (stars + divider + accent dot), not the amber emoji pill', () => {
    expect(html).toContain('bg-card border border-border mb-6')
    expect(html).toContain('px-3.5 py-1.5 rounded-full')
    expect(html).toContain('★★★★★')
    expect(html).toContain('text-highlight')
    expect(html).toContain('w-px h-3 bg-border')
    expect(html).toContain('rounded-full bg-accent')
    expect(html).toContain('WORLD&#x27;S FIRST B2C EMAIL IDENTIFICATION')
    // The old amber pill badge carried border-primary/40 + an emoji; the
    // live feed widget's icon chips (bg-primary/10) are legitimate.
    expect(html).not.toContain('border-primary/40')
    expect(html).not.toContain('🌟')
  })

  it('renders the live h1 (bold, 3.5rem, leading-[1.1] sm:leading-none, italic gradient span holding the dash)', () => {
    expect(html).toContain('lg:text-[3.5rem] font-bold tracking-tight leading-[1.1] sm:leading-none mb-5')
    expect(html).not.toContain('font-extrabold')
    // The dash lives inside the italic gradient span, verbatim live markup.
    expect(html).toContain('<span class="text-gradient-hero italic">— By Their Email</span>')
  })

  it('renders the live subtitle rhythm (mb-8, italic and) and trust pills', () => {
    expect(html).toContain('text-lg text-muted-foreground leading-relaxed mb-8')
    expect(html).toContain('<em>and</em>')
    expect(html).toContain('px-3 py-1.5 rounded-lg bg-card border border-border text-sm')
    expect(html).toContain('mb-8 flex flex-wrap gap-3')
  })

  it('renders the avatar row directly after the pills (mb-6, no extra mt-8)', () => {
    expect(html).toContain('flex items-center gap-4 mb-6')
    expect(html).not.toContain('mb-6 mt-8')
  })

  it('renders the live CTA pair (gradient primary + white bg-background secondary)', () => {
    expect(html).toContain('flex flex-col sm:flex-row gap-3 mb-4')
    expect(html).toContain('gradient-cta')
    expect(html).toContain('w-full sm:w-auto')
    expect(html).toMatch(/bg-background[^"]*border-border|border-border[^"]*bg-background/)
    expect(html).toContain('px-7 h-12 text-base font-semibold')
  })

  it('renders the takes-line in text-xs with the live "·" separators', () => {
    expect(html).toContain('text-xs text-muted-foreground')
    expect(html).toContain('Takes less than 2 minutes · Free plan available · No credit card required')
  })

  it('drops the radial-gradient decoration the live does not ship', () => {
    expect(html).not.toContain('radial-gradient')
  })
})

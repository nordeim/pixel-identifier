'use client'

import { useEffect } from 'react'

/**
 * R12-F1: scroll-reveal entrance animations, the live's motion language
 * (research/round12-audit — 39 elements, translateY 12/16/20/24px, ~100ms
 * sibling stagger, once). ONE shared IntersectionObserver arms every
 * `[data-reveal]` element on mount (sets `--reveal-y` from the attribute +
 * the `reveal-armed` class that activates the transition) and flips it to
 * `.is-revealed` when it enters the viewport — never un-revealing, exactly
 * like the live.
 *
 * Progressive enhancement: the CSS hidden state is scoped to `.js-reveal`
 * (set by a pre-paint inline script in the marketing layout), so no-JS
 * readers see the full page. The live's CSR shell cannot offer that.
 */

export function RevealObserver() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (elements.length === 0) return

    // Arm: materialize the translate offset + activate the transition.
    // Doing both in one synchronous pass means the offset applies before
    // any transition could run (elements are invisible at this point).
    for (const el of elements) {
      const y = el.getAttribute('data-reveal')
      el.style.setProperty('--reveal-y', `${Number.parseInt(y ?? '16', 10) || 0}px`)
      const delay = el.getAttribute('data-reveal-delay')
      if (delay) el.style.transitionDelay = `${delay}ms`
      el.classList.add('reveal-armed')
    }

    // One observer for the whole page — entries flip to the terminal
    // state once and are immediately unobserved (the live never
    // un-reveals on exit).
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-revealed')
          observer.unobserve(entry.target)
        }
      },
      // A generous margin pre-reveals just-below-fold content so the
      // entrance is already underway as the section scrolls into view.
      { rootMargin: '0px 0px -10% 0px', threshold: 0 },
    )

    for (const el of elements) observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return null
}

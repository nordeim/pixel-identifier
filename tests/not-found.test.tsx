import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import NotFound from '@/app/not-found'

/**
 * R11-F15 regression test: the live 404 (served for both app and marketing
 * misses — verified at app.pixelco.io/dashboard/nonexistent and on the
 * marketing domain) is a minimal centered block:
 *
 *   <div class="flex min-h-screen items-center justify-center bg-muted">
 *     <div class="text-center">
 *       <h1 class="mb-4 text-4xl font-bold">404</h1>
 *       <p class="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
 *       <a href="/" class="text-primary underline hover:text-primary/90">
 *         Return to Home</a>
 *     </div>
 *   </div>
 */

const html = renderToStaticMarkup(<NotFound />)

describe('root 404 boundary (R11-F15 live parity)', () => {
  it('renders the minimal centered layout on bg-muted', () => {
    expect(html).toContain('flex min-h-screen items-center justify-center bg-muted')
    expect(html).toContain('text-center')
  })

  it('renders the live copy: big 404, Oops! Page not found, Return to Home', () => {
    expect(html).toMatch(/<h1[^>]*class="mb-4 text-4xl font-bold">404<\/h1>/)
    expect(html).toMatch(
      /<p[^>]*class="mb-4 text-xl text-muted-foreground">Oops! Page not found<\/p>/,
    )
    // class precedes href in Next's Link output — pin both pieces.
    expect(html).toContain('class="text-primary underline hover:text-primary/90 focus-brand rounded"')
    expect(html).toContain('href="/"')
    expect(html).toContain('>Return to Home</a>')
  })

  it('ships none of the old Compass/two-button chrome', () => {
    expect(html).not.toContain('Compass')
    expect(html).not.toContain('Back to home')
    expect(html).not.toContain('Go to dashboard')
    expect(html).not.toContain('bg-app')
  })
})

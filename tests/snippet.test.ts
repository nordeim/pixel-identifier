import { describe, expect, it } from 'vitest'
import vm from 'node:vm'
import { buildSnippet, collectorUrlFromHeaders } from '@/lib/snippet'

describe('collectorUrlFromHeaders (F-15: forwarded host must be sanitised)', () => {
  it('passes through a legitimate host', () => {
    expect(collectorUrlFromHeaders('app.pixelco.example', 'https')).toBe(
      'https://app.pixelco.example/pixel.js',
    )
  })

  it('includes a port when present', () => {
    expect(collectorUrlFromHeaders('localhost:3000', 'http')).toBe(
      'http://localhost:3000/pixel.js',
    )
  })

  it('defaults the protocol to https for junk values', () => {
    expect(collectorUrlFromHeaders('app.example', 'javascript')).toBe(
      'https://app.example/pixel.js',
    )
    expect(collectorUrlFromHeaders('app.example', null)).toBe('https://app.example/pixel.js')
  })

  it('rejects a host carrying path traversal or quote breakout', () => {
    const hostile = "evil.com/';alert(1);//"
    const url = collectorUrlFromHeaders(hostile, 'https')
    expect(url).not.toContain("';alert(1);//")
    expect(url).toBe('https://localhost:3000/pixel.js')
  })

  it('rejects hosts with spaces, control chars, or scheme separators', () => {
    for (const hostile of ['evil.com alert(1)', 'a\tb.com', 'https://evil.com', '']) {
      expect(collectorUrlFromHeaders(hostile, 'https')).toBe('https://localhost:3000/pixel.js')
    }
  })
})

describe('buildSnippet (defence in depth)', () => {
  it('embeds the site key and collector URL into the loader', () => {
    const snippet = buildSnippet('px_0123456789abcdef', 'https://app.example/pixel.js')
    expect(snippet).toContain("s.src='https://app.example/pixel.js'")
    expect(snippet).toContain("i.head.appendChild(s);})(window,document,'px','px_0123456789abcdef');")
  })

  it('escapes a hostile collector URL so it cannot break out of the JS string', () => {
    // Even if a hostile value slipped past the host validator, the snippet
    // must not let it terminate the string literal.
    const hostile = "https://x.example/pixel.js';alert(1);//"
    const snippet = buildSnippet('px_0123456789abcdef', hostile)
    expect(snippet).toContain("\\'")
    expect(snippet).not.toMatch(/pixel\.js';alert/)
  })

  it('rejects a malformed site key outright', () => {
    expect(() => buildSnippet("px_evil';alert(1);//", 'https://app.example/pixel.js')).toThrow(
      /site key/i,
    )
    expect(() => buildSnippet('', 'https://app.example/pixel.js')).toThrow(/site key/i)
  })
})

describe('buildSnippet (R5-C1: the emitted snippet must actually execute)', () => {
  /**
   * Regression harness for the round-5 critical defect: the loader used to
   * pass the STRING 'document' where the IIFE expected the document OBJECT,
   * so every pasted snippet threw `TypeError: i.createElement is not a
   * function` before loading the collector. This test runs the real emitted
   * snippet in a VM with just enough browser to prove the script tag is
   * created, configured and appended.
   */
  function runSnippet(snippet: string): {
    created: { tag: string; src?: string; attrs: Record<string, string> }[]
    appended: { tag: string; src?: string; attrs: Record<string, string> }[]
    window: Record<string, unknown>
  } {
    const created: { tag: string; src?: string; attrs: Record<string, string> }[] = []
    const appended: { tag: string; src?: string; attrs: Record<string, string> }[] = []

    const fakeDocument = {
      createElement: (tag: string) => {
        const element = {
          tag,
          attrs: {} as Record<string, string>,
          set src(value: string) {
            element.attrs.__src = value
          },
          get src(): string | undefined {
            return element.attrs.__src
          },
          setAttribute: (name: string, value: string) => {
            element.attrs[name] = value
          },
        }
        created.push(element)
        return element
      },
      head: {
        appendChild: (element: unknown) => {
          appended.push(element as { tag: string; attrs: Record<string, string> })
        },
      },
    }

    const sandbox: Record<string, unknown> = {
      document: fakeDocument,
      window: {},
    }
    sandbox.window = sandbox
    vm.createContext(sandbox)

    const js = snippet.replace(/^<script>\s*/, '').replace(/\s*<\/script>$/, '')
    vm.runInContext(js, sandbox)
    return { created, appended, window: sandbox as Record<string, unknown> }
  }

  it('creates, configures and appends the collector script tag', () => {
    const snippet = buildSnippet('px_0123456789abcdef', 'https://cdn.example/pixel.js')
    const { created, appended } = runSnippet(snippet)

    expect(created).toHaveLength(1)
    expect(created[0]?.tag).toBe('script')
    expect(created[0]?.attrs.__src).toBe('https://cdn.example/pixel.js')
    expect(created[0]?.attrs['data-site']).toBe('px_0123456789abcdef')
    expect(appended).toHaveLength(1)
    expect(appended[0]?.tag).toBe('script')
  })

  it('initialises the _pxq command queue on window for the collector', () => {
    const snippet = buildSnippet('px_0123456789abcdef', 'https://cdn.example/pixel.js')
    const { window } = runSnippet(snippet)
    expect(Array.isArray(window._pxq)).toBe(true)
  })
})

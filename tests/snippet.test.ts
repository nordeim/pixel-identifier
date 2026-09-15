import { describe, expect, it } from 'vitest'
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
    expect(snippet).toContain("i.head.appendChild(s)})(window,'document','px','px_0123456789abcdef')")
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

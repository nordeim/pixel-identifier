import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { PlatformInstructions } from '@/components/dashboard/platform-instructions'
import { buildPlatformSnippet } from '@/lib/snippet'

/**
 * R24 F2 — the install page's Platform Instructions were WRONG: the clone
 * shipped invented WordPress/Shopify/GTM steps (Theme File Editor etc.)
 * while the live ships the "Insert Headers and Footers" plugin path for
 * WordPress, a different Shopify flow, and a GTM flow — all with
 * <code>-chip literals (text-xs bg-muted px-1.5 py-0.5 rounded font-mono),
 * font-medium UI-path spans, and a per-tab snippet <pre> under the steps
 * (html tab has NO pre; the pres ride text-xs, not the Quick Start's
 * text-sm). The GTM pre is a VARIANT of the snippet whose
 * setAttribute('data-site', …) argument is the LITERAL key. Evidence: R24
 * plan, 9th probe generation (all four live tabs captured verbatim).
 */

const SITE_KEY = 'px_0123456789abcdef'
const COLLECTOR = 'https://cdn.example.com/pixel.js'

function renderTab(defaultValue: 'html' | 'wordpress' | 'shopify' | 'gtm') {
  return renderToStaticMarkup(
    <PlatformInstructions
      siteKey={SITE_KEY}
      collectorUrl={COLLECTOR}
      defaultValue={defaultValue}
    />,
  )
}

describe('R24 F2 — buildPlatformSnippet contract', () => {
  it('wordpress: the plugin-path comment header + the standard snippet', () => {
    const out = buildPlatformSnippet('wordpress', SITE_KEY, COLLECTOR)
    expect(out.startsWith(`<!-- Add to your theme's header.php or use a plugin like "Insert Headers and Footers" -->`)).toBe(true)
    expect(out).toContain('<!-- Paste this before the closing </head> tag -->')
    expect(out).toContain(`s.src='${COLLECTOR}'`)
    expect(out).toContain(`s.setAttribute('data-site',e)`)
    expect(out).toContain(`,'px','${SITE_KEY}')`)
  })

  it('shopify: the theme.liquid comment header + the standard snippet', () => {
    const out = buildPlatformSnippet('shopify', SITE_KEY, COLLECTOR)
    expect(out).toContain('<!-- In Shopify Admin → Online Store → Themes → Edit Code -->')
    expect(out).toContain('<!-- Open theme.liquid and paste before </head> -->')
    expect(out).toContain(`s.setAttribute('data-site',e)`)
  })

  it('gtm: the GTM header + the LITERAL-KEY setAttribute variant', () => {
    const out = buildPlatformSnippet('gtm', SITE_KEY, COLLECTOR)
    expect(out).toContain('<!-- In GTM, create a Custom HTML tag -->')
    expect(out).toContain('<!-- Trigger: All Pages -->')
    // the GTM variant inlines the key in setAttribute (not the e param)
    expect(out).toContain(`s.setAttribute('data-site','${SITE_KEY}')`)
    expect(out).not.toContain("s.setAttribute('data-site',e)")
  })

  it('validates the site key exactly like buildSnippet', () => {
    expect(() => buildPlatformSnippet('wordpress', 'not_a_key', COLLECTOR)).toThrow(
      /Invalid site key/,
    )
  })
})

describe('R24 F2 — HTML tab (steps only, code chips, NO pre)', () => {
  const html = renderTab('html')

  it('renders the live HTML step titles', () => {
    expect(html).toContain('Open your HTML file')
    expect(html).toContain('Find the &lt;head&gt; tag')
    expect(html).toContain('Paste the snippet')
    expect(html).toContain('Deploy your site')
  })

  it('wraps step literals in the live code chips', () => {
    expect(html).toContain(
      '<code class="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">index.html</code>',
    )
    expect(html).toContain(
      '<code class="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">&lt;/head&gt;</code>',
    )
  })

  it('renders NO snippet pre on the HTML tab', () => {
    expect(html).not.toContain('<pre')
  })
})

describe('R24 F2 — WordPress tab (plugin path + pre)', () => {
  const html = renderTab('wordpress')

  it('renders the live WordPress steps (the plugin path, not the Theme File Editor)', () => {
    // NOTE: renderToStaticMarkup entity-encodes apostrophes/quotes in
    // text nodes (' -> &#x27;, " -> &quot;) — the live's client-rendered DOM
    // shows the same TEXT without entities; both decode identically.
    expect(html).toContain('Install &#x27;Insert Headers and Footers&#x27; plugin')
    expect(html).toContain('Add the snippet')
    expect(html).toContain('search for &quot;Insert Headers and Footers&quot; by WPCode')
    expect(html).not.toContain('Theme File Editor')
    expect(html).not.toContain('header.php</code> in the right sidebar')
  })

  it('wraps UI paths in font-medium spans', () => {
    expect(html).toContain('<span class="font-medium">Plugins → Add New</span>')
    expect(html).toContain('<span class="font-medium">Code Snippets → Header &amp; Footer</span>')
    expect(html).toContain('<span class="font-medium">&quot;Header&quot;</span>')
  })

  it('renders the per-tab snippet pre (text-xs, live classes, plugin header)', () => {
    expect(html).toContain('<div class="relative mt-3">')
    expect(html).toContain(
      'bg-foreground/5 border border-border rounded-lg p-4 text-xs font-mono overflow-x-auto leading-relaxed',
    )
    expect(html).toContain(`s.src=&#x27;${COLLECTOR}&#x27;`)
    expect(html).toContain(`,&#x27;px&#x27;,&#x27;${SITE_KEY}&#x27;)`)
  })
})

describe('R24 F2 — Shopify tab (theme.liquid path + pre)', () => {
  const html = renderTab('shopify')

  it('renders the live Shopify steps', () => {
    expect(html).toContain('Open theme editor')
    expect(html).toContain('Edit theme.liquid')
    expect(html).toContain('Paste before &lt;/head&gt;')
    expect(html).not.toContain('On your active theme, click')
  })

  it('wraps the Actions path in a font-medium span and theme.liquid in a code chip', () => {
    expect(html).toContain(
      '<span class="font-medium">Online Store → Themes → Actions → Edit Code</span>',
    )
    expect(html).toContain(
      '<code class="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">theme.liquid</code>',
    )
  })

  it('renders the per-tab snippet pre with the Shopify header', () => {
    expect(html).toContain('&lt;!-- In Shopify Admin → Online Store → Themes → Edit Code --&gt;')
    expect(html).toContain('&lt;!-- Open theme.liquid and paste before &lt;/head&gt; --&gt;')
  })
})

describe('R24 F2 — GTM tab (custom-HTML tag flow + literal-key pre)', () => {
  const html = renderTab('gtm')

  it('renders the live GTM steps', () => {
    expect(html).toContain('Create a new tag')
    expect(html).toContain('Paste the code')
    expect(html).toContain('Set the trigger')
    expect(html).toContain('Publish')
    expect(html).toContain('<span class="font-medium">Tags → New → Custom HTML</span>')
    expect(html).toContain('<span class="font-medium">&quot;All Pages&quot;</span>')
    expect(html).not.toContain('name the tag "Pixelco"')
  })

  it('renders the GTM snippet variant with the literal key', () => {
    expect(html).toContain(`s.setAttribute(&#x27;data-site&#x27;,&#x27;${SITE_KEY}&#x27;)`)
  })
})

describe('R24 F4 — platform tab icons ship the legacy geometry', () => {
  const html = renderTab('html')

  it('code icons use the old polyline encoding', () => {
    expect(html).toContain('lucide lucide-code h-3.5 w-3.5')
    expect(html).toContain('<polyline points="16 18 22 12 16 6"></polyline>')
  })

  it('the shopify tab icon uses the pre-redesign shopping-bag geometry', () => {
    const shopify = renderTab('shopify')
    expect(shopify).toContain('lucide lucide-shopping-bag h-3.5 w-3.5')
    expect(shopify).toContain('M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z')
  })
})

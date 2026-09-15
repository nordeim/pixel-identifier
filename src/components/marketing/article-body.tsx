import Link from 'next/link'
import type { ReactNode } from 'react'

/**
 * Renders the blog article format used by src/data/blog-posts.ts: blank-line
 * separated blocks, where a block is a paragraph, a `- ` bullet list, a
 * `1. ` numbered list, or a `|` table. Inline: **bold**, *italic*,
 * [text](https://…).
 *
 * The input is the repo's own content module — never user input — so this
 * is a renderer for a fixed, tested subset rather than a general markdown
 * parser. Link hrefs are still constrained to http(s)/mailto.
 */

const HREF_OK = /^(https?:\/\/|mailto:)/

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  // Tokenize bold, italics and links in one pass; plain runs pass through.
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)\s]+\))/g)
  return tokens.filter(Boolean).map((token, index) => {
    const key = `${keyPrefix}-${index}`
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={key}>{token.slice(2, -2)}</strong>
    }
    if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      return <em key={key}>{token.slice(1, -1)}</em>
    }
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(token)
    if (link) {
      const [, label, href] = link
      if (HREF_OK.test(href)) {
        return (
          <a
            key={key}
            href={href}
            className="font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-800 focus-brand"
            {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {label}
          </a>
        )
      }
      return <span key={key}>{label}</span>
    }
    return <span key={key}>{token}</span>
  })
}

function renderTable(lines: string[], key: string): ReactNode {
  const rows = lines.map((line) =>
    line
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((cell) => cell.trim()),
  )
  const [header, ...body] = rows
  return (
    <div key={key} className="my-6 overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left">
            {header.map((cell, index) => (
              <th key={index} scope="col" className="px-4 py-2.5 font-semibold text-foreground">
                {renderInline(cell, `${key}-h-${index}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border/60 last:border-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-2.5 text-muted-foreground">
                  {renderInline(cell, `${key}-r${rowIndex}-c${cellIndex}`)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ArticleBody({ content }: { content: string }) {
  const blocks = content.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean)

  return (
    <div className="space-y-5 text-[15px] leading-relaxed text-muted-foreground">
      {blocks.map((block, index) => {
        const key = `block-${index}`
        const lines = block.split('\n').map((line) => line.trim())

        if (lines.every((line) => line.startsWith('|')) && lines.length >= 2) {
          return renderTable(lines, key)
        }
        if (lines.every((line) => line.startsWith('- '))) {
          return (
            <ul key={key} className="ml-5 list-disc space-y-2">
              {lines.map((line, li) => (
                <li key={`${key}-${li}`}>{renderInline(line.slice(2), `${key}-${li}`)}</li>
              ))}
            </ul>
          )
        }
        if (lines.every((line) => /^\d+\.\s/.test(line))) {
          return (
            <ol key={key} className="ml-5 list-decimal space-y-2">
              {lines.map((line, li) => (
                <li key={`${key}-${li}`}>{renderInline(line.replace(/^\d+\.\s/, ''), `${key}-${li}`)}</li>
              ))}
            </ol>
          )
        }
        return <p key={key}>{renderInline(lines.join(' '), key)}</p>
      })}
      {/* Blog-internal cross-links keep readers inside the site. */}
      <p className="border-t border-border/60 pt-5 text-sm">
        Curious who is browsing your site right now?{' '}
        <Link href="/signup" className="font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-800 focus-brand">
          Try Pixelco free
        </Link>{' '}
        — 100 identifications, no credit card.
      </p>
    </div>
  )
}

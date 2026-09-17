import type { ReactNode } from 'react'

/**
 * Renders the article format used by src/data/blog-posts.ts (and the
 * round-13 legal-pages data): blank-line separated blocks, where a block
 * is a paragraph, a `## `/`### ` heading, a `- ` bullet list, a `1. `
 * numbered list, or a `|` table. Inline: **bold**, *italic*,
 * [text](https://…).
 *
 * R13-F7: the live blog body is a `prose prose-sm` wrapper whose
 * arbitrary-variant classes style CLASSLESS descendant elements
 * (`[&_h2]:text-xl … [&_a]:text-primary [&_a]:hover:underline`) — variant
 * "blog" reproduces exactly that. The legal pages instead carry direct
 * classes on every element and group their sections in <section>
 * wrappers — variant "legal". The input is the repo's own content
 * modules — never user input — so this is a renderer for a fixed, tested
 * subset rather than a general markdown parser. Link hrefs are still
 * constrained to http(s)/mailto/relative.
 */

const HREF_OK = /^(https?:\/\/|mailto:|\/)/

type Variant = 'blog' | 'legal'

function renderInline(text: string, keyPrefix: string, variant: Variant): ReactNode[] {
  // Tokenize bold, italics and links in one pass; plain runs pass through
  // as bare strings (the live DOM has no <span> wrappers on plain text).
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
        if (variant === 'blog') {
          // classless — the prose wrapper's [&_a] variants style it
          return (
            <a
              key={key}
              href={href}
              {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {label}
            </a>
          )
        }
        return (
          <a key={key} href={href} className="text-primary hover:underline">
            {label}
          </a>
        )
      }
      return label
    }
    return token
  })
}

function renderTable(lines: string[], key: string, variant: Variant): ReactNode {
  const rows = lines.map((line) =>
    line
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((cell) => cell.trim()),
  )
  const [header, ...body] = rows
  // R13-E2: the live's only table (CCPA §2) uses these exact classes.
  return (
    <div key={key} className="overflow-x-auto mt-3">
      <table className="w-full text-sm border border-border">
        <thead>
          <tr className="bg-muted/50">
            {header.map((cell, index) => (
              <th key={index} scope="col" className="text-left p-3 border-b border-border text-foreground font-semibold">
                {renderInline(cell, `${key}-h-${index}`, variant)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-muted-foreground">
          {body.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="p-3">
                  {renderInline(cell, `${key}-r${rowIndex}-c${cellIndex}`, variant)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const LEGAL_H2 = 'text-xl font-semibold text-foreground'
const LEGAL_H3 = 'text-lg font-medium text-foreground mt-4'
const LEGAL_P = 'text-muted-foreground leading-relaxed'
const LEGAL_UL = 'list-disc pl-5 text-muted-foreground space-y-2'
const LEGAL_OL = 'list-decimal pl-5 text-muted-foreground space-y-2'

function Blocks({ content, variant }: { content: string; variant: Variant }) {
  const blocks = content.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean)

  return (
    <>
      {blocks.map((block, index) => {
        const key = `block-${index}`
        const lines = block.split('\n').map((line) => line.trim())

        if (lines.every((line) => line.startsWith('|')) && lines.length >= 2) {
          return renderTable(lines, key, variant)
        }
        if (variant === 'legal' && /^## /.test(lines[0])) {
          return (
            <h2 key={key} className={LEGAL_H2}>
              {lines[0].slice(3)}
            </h2>
          )
        }
        if (variant === 'legal' && /^### /.test(lines[0])) {
          return (
            <h3 key={key} className={LEGAL_H3}>
              {lines[0].slice(4)}
            </h3>
          )
        }
        if (variant === 'blog' && /^## /.test(lines[0])) {
          return <h2 key={key}>{lines[0].slice(3)}</h2>
        }
        if (variant === 'blog' && /^### /.test(lines[0])) {
          return <h3 key={key}>{lines[0].slice(4)}</h3>
        }
        if (lines.every((line) => line.startsWith('- '))) {
          return (
            <ul key={key} className={variant === 'legal' ? LEGAL_UL : undefined}>
              {lines.map((line, li) => (
                <li key={`${key}-${li}`}>{renderInline(line.slice(2), `${key}-${li}`, variant)}</li>
              ))}
            </ul>
          )
        }
        if (lines.every((line) => /^\d+\.\s/.test(line))) {
          return (
            <ol key={key} className={variant === 'legal' ? LEGAL_OL : undefined}>
              {lines.map((line, li) => (
                <li key={`${key}-${li}`}>{renderInline(line.replace(/^\d+\.\s/, ''), `${key}-${li}`, variant)}</li>
              ))}
            </ol>
          )
        }
        return (
          <p key={key} className={variant === 'legal' ? LEGAL_P : undefined}>
            {renderInline(lines.join(' '), key, variant)}
          </p>
        )
      })}
    </>
  )
}

export function ArticleBody({ content, variant = 'blog' }: { content: string; variant?: Variant }) {
  if (variant === 'legal') {
    // The live legal pages wrap every numbered section in a <section>
    // element; the outer prose div carries space-y-8.
    const sections: ReactNode[] = []
    let current: ReactNode[] = []
    const blocks = content.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)
    for (const block of blocks) {
      if (/^## /.test(block) && current.length > 0) {
        sections.push(<section key={`sec-${sections.length}`}>{current}</section>)
        current = []
      }
      current.push(
        <Blocks key={`blk-${current.length}`} content={block} variant="legal" />,
      )
    }
    if (current.length > 0) {
      sections.push(<section key={`sec-${sections.length}`}>{current}</section>)
    }
    return <div className="prose prose-sm max-w-none space-y-8 text-foreground/90">{sections}</div>
  }

  return (
    <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed space-y-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-2 [&_a]:text-primary [&_a]:hover:underline">
      <Blocks content={content} variant="blog" />
    </div>
  )
}

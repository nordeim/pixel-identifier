import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'

/**
 * R11-F2 regression test: the live app ships the LEGACY generation of the
 * shadcn primitives — extracted verbatim off app.pixelco.io (see
 * research/round11-audit/live-ground-truth.md §3). The clone had drifted to
 * the new-generation primitives (data-slot attrs, gap-6/py-6 card roots =
 * +48px on every card, rounded-md badges, right-side select indicators,
 * ring-[3px] focus rings, h-9 default buttons). These tests pin the live's
 * exact rendered class strings (tailwind-merge collapsed).
 */

describe('Button (legacy live chrome)', () => {
  it('renders the legacy base with ring-offset focus rings and h-10 default size', () => {
    const html = renderToStaticMarkup(<Button>Go</Button>)
    expect(html).toContain(
      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    )
    expect(html).toContain('bg-primary text-primary-foreground hover:bg-primary/90')
    expect(html).toContain('h-10 px-4 py-2')
    expect(html).not.toContain('data-slot')
    expect(html).not.toContain('ring-[3px]')
  })

  it('ships the live sm size and ghost/secondary variants', () => {
    const sm = renderToStaticMarkup(
      <Button size="sm" variant="ghost">
        Log In
      </Button>,
    )
    expect(sm).toContain('h-9 rounded-md px-3')
    expect(sm).toContain('hover:bg-accent hover:text-accent-foreground')

    const secondary = renderToStaticMarkup(
      <Button variant="secondary">Save</Button>,
    )
    expect(secondary).toContain(
      'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    )
  })

  it('keeps svg sizing through the [&_svg] selector (live pattern)', () => {
    const html = renderToStaticMarkup(
      <Button>
        Start Free <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
      </Button>,
    )
    // renderToStaticMarkup escapes the [&_svg] ampersands.
    expect(html).toContain(
      '[&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0',
    )
    expect(html).toContain('lucide-arrow-right')
  })
})

describe('Badge (legacy live chrome)', () => {
  it('renders the legacy pill: rounded-full border font-semibold', () => {
    const html = renderToStaticMarkup(<Badge>FREE</Badge>)
    expect(html).toContain(
      'inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    )
    expect(html).toContain(
      'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
    )
    expect(html).not.toContain('rounded-md')
    expect(html).not.toContain('data-slot')
  })

  it('ships the secondary variant with its own hover', () => {
    const html = renderToStaticMarkup(<Badge variant="secondary">Pending</Badge>)
    expect(html).toContain(
      'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
    )
  })

  it('ships the outline variant the activity feed uses', () => {
    const html = renderToStaticMarkup(<Badge variant="outline">Pageview</Badge>)
    expect(html).toContain('text-foreground')
    expect(html).not.toContain('bg-secondary')
  })
})

describe('Card family (legacy live chrome)', () => {
  it('renders the flat legacy card root (no py-6/gap-6 growth)', () => {
    const html = renderToStaticMarkup(<Card>inner</Card>)
    expect(html).toContain(
      'rounded-lg border bg-card text-card-foreground shadow-sm',
    )
    expect(html).not.toContain('py-6')
    expect(html).not.toContain('gap-6')
    expect(html).not.toContain('data-slot')
  })

  it('renders the legacy header/content/footer paddings', () => {
    const html = renderToStaticMarkup(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Foot</CardFooter>
      </Card>,
    )
    expect(html).toContain('flex flex-col space-y-1.5 p-6')
    expect(html).toContain('p-6 pt-0')
    expect(html).toContain('flex items-center p-6 pt-0')
    expect(html).toContain('text-sm text-muted-foreground')
  })

  it('renders CardTitle as an h3 with the live font-display base', () => {
    const html = renderToStaticMarkup(
      <CardTitle className="text-base">Trend</CardTitle>,
    )
    expect(html).toContain('<h3')
    expect(html).toContain('font-semibold tracking-tight font-display text-base')
  })
})

describe('Tabs (legacy live chrome)', () => {
  it('renders the h-10 rounded-md list and rounded-sm triggers', () => {
    const html = renderToStaticMarkup(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">HTML</TabsTrigger>
        </TabsList>
        <TabsContent value="a">content</TabsContent>
      </Tabs>,
    )
    expect(html).toContain(
      'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
    )
    expect(html).toContain('rounded-sm px-3 py-1.5 text-sm font-medium')
    expect(html).toContain('data-[state=active]:bg-background')
    expect(html).toContain('data-[state=active]:shadow-sm')
    expect(html).toContain('ring-offset-background')
    expect(html).not.toContain('rounded-lg')
    expect(html).not.toContain('p-[3px]')
  })
})

describe('Input (legacy live chrome)', () => {
  it('renders the h-10 bg-background input with a 2px focus ring', () => {
    const html = renderToStaticMarkup(<Input placeholder="Search" />)
    expect(html).toContain('h-10 w-full rounded-md border border-input bg-background')
    expect(html).toContain('focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2')
    expect(html).toContain('ring-offset-background')
    // The bare bg-transparent is gone; file:bg-transparent legitimately
    // stays (the live input keeps it for file inputs).
    expect(html).not.toMatch(/[^:a-z-]bg-transparent/)
    expect(html).not.toContain('ring-[3px]')
  })
})

describe('Checkbox (legacy live chrome)', () => {
  it('renders the legacy rounded-sm checkbox with the 2px focus ring', () => {
    const html = renderToStaticMarkup(<Checkbox aria-label="select" />)
    expect(html).toContain(
      'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background',
    )
    expect(html).toContain('data-[state=checked]:bg-primary')
    expect(html).toContain('focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2')
    expect(html).not.toContain('rounded-[4px]')
    expect(html).not.toContain('ring-[3px]')
  })
})

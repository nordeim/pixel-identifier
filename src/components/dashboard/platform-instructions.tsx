'use client'

import { Globe, PanelsTopLeft } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CodeIcon, ShoppingBagIcon } from '@/components/dashboard/live-icons'
import {
  buildPlatformSnippet,
  type PlatformId,
} from '@/lib/snippet'

/**
 * R24 F2 rewrite. The prior round's WordPress/Shopify/GTM steps were
 * invented (Theme File Editor etc.); the live ships the "Insert Headers
 * and Footers" plugin path for WordPress, a different Shopify flow and a
 * GTM flow — captured verbatim (R24 plan, 9th probe generation):
 *
 * - step literals render as <code> chips (text-xs bg-muted px-1.5 py-0.5
 *   rounded font-mono — the same chip the Quick Start subtitle uses);
 * - UI paths render as <span class="font-medium">;
 * - WordPress/Shopify/GTM append a per-tab snippet pre (text-xs — NOT the
 *   Quick Start pre's text-sm) in a `relative mt-3` wrapper; the HTML tab
 *   has steps only;
 * - the tab icons ship the live app bundle's legacy lucide generation
 *   (R24 F4 — code / shopping-bag; globe is generation-stable).
 */

/** A step text is a run of segments: raw text, a literal code chip, or a UI-path emphasis. */
type StepSegment = string | { code: string } | { strong: string }

interface PlatformStep {
  title: string
  segments: StepSegment[]
}

const code = (value: string): StepSegment => ({ code: value })
const strong = (value: string): StepSegment => ({ strong: value })

const HTML_STEPS: PlatformStep[] = [
  {
    title: 'Open your HTML file',
    segments: [
      'Open the main HTML file of your website (usually ',
      code('index.html'),
      ').',
    ],
  },
  {
    title: 'Find the <head> tag',
    segments: ['Locate the ', code('<head>'), ' section of your page.'],
  },
  {
    title: 'Paste the snippet',
    segments: [
      'Paste the pixel code just before the closing ',
      code('</head>'),
      ' tag. It only needs to be in your main layout file — it will work on every page.',
    ],
  },
  {
    title: 'Deploy your site',
    segments: [
      'Save and deploy your changes. Visit your site, then check your Pixelco dashboard to confirm events are arriving.',
    ],
  },
]

const WORDPRESS_STEPS: PlatformStep[] = [
  {
    title: "Install 'Insert Headers and Footers' plugin",
    segments: [
      'Go to ',
      strong('Plugins → Add New'),
      ' and search for "Insert Headers and Footers" by WPCode. Install and activate it.',
    ],
  },
  {
    title: 'Add the snippet',
    segments: [
      'Go to ',
      strong('Code Snippets → Header & Footer'),
      '. Paste the pixel code in the ',
      strong('"Header"'),
      ' section.',
    ],
  },
  {
    title: 'Save',
    segments: [
      'Click Save. The pixel is now active on all pages of your WordPress site.',
    ],
  },
]

const SHOPIFY_STEPS: PlatformStep[] = [
  {
    title: 'Open theme editor',
    segments: ['Go to ', strong('Online Store → Themes → Actions → Edit Code'), '.'],
  },
  {
    title: 'Edit theme.liquid',
    segments: ['Open ', code('theme.liquid'), ' from the Layout section.'],
  },
  {
    title: 'Paste before </head>',
    segments: [
      'Find the ',
      code('</head>'),
      ' tag and paste the pixel code just above it.',
    ],
  },
  {
    title: 'Save',
    segments: ['Click Save. The pixel now runs on every page of your Shopify store.'],
  },
]

const GTM_STEPS: PlatformStep[] = [
  {
    title: 'Create a new tag',
    segments: ['In Google Tag Manager, go to ', strong('Tags → New → Custom HTML'), '.'],
  },
  {
    title: 'Paste the code',
    segments: ['Paste the pixel snippet into the HTML field.'],
  },
  {
    title: 'Set the trigger',
    segments: ['Set the trigger to ', strong('"All Pages"'), '.'],
  },
  {
    title: 'Publish',
    segments: ['Save the tag and publish your GTM container.'],
  },
]

const PLATFORMS: {
  id: 'html' | PlatformId
  label: string
  icon: React.ComponentType<{ className?: string }>
  steps: PlatformStep[]
}[] = [
  // Icon set mirrors the live app: code / globe / shopping-bag / code —
  // with the R24 legacy geometries where the live's 0.462 build drifts.
  { id: 'html', label: 'HTML / Custom', icon: CodeIcon, steps: HTML_STEPS },
  { id: 'wordpress', label: 'WordPress', icon: Globe, steps: WORDPRESS_STEPS },
  { id: 'shopify', label: 'Shopify', icon: ShoppingBagIcon, steps: SHOPIFY_STEPS },
  { id: 'gtm', label: 'Google Tag Manager', icon: CodeIcon, steps: GTM_STEPS },
]

function StepSegments({ segments }: { segments: StepSegment[] }) {
  return (
    <p className="text-sm text-muted-foreground">
      {segments.map((segment, index) =>
        typeof segment === 'string' ? (
          segment
        ) : 'code' in segment ? (
          <code
            key={index}
            className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono"
          >
            {segment.code}
          </code>
        ) : (
          <span key={index} className="font-medium">
            {segment.strong}
          </span>
        ),
      )}
    </p>
  )
}

export function PlatformInstructions({
  siteKey,
  collectorUrl,
  defaultValue = 'html',
}: {
  siteKey: string
  collectorUrl: string
  /** R24: SSR renders only the active Radix panel — tests pin each tab by
   * rendering the component once per defaultValue. */
  defaultValue?: 'html' | 'wordpress' | 'shopify' | 'gtm'
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          {/* R17-F3: the live's chip — bare geometry-first div. */}
          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
            <PanelsTopLeft className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg">
              Platform Instructions
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Step-by-step guides for popular platforms.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={defaultValue} className="w-full">
          <TabsList className="w-full justify-start mb-4">
            {PLATFORMS.map((platform) => (
              <TabsTrigger
                key={platform.id}
                value={platform.id}
                className="gap-1.5"
              >
                <platform.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {platform.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {PLATFORMS.map((platform) => (
            <TabsContent key={platform.id} value={platform.id} className="space-y-4">
              <div className="space-y-3">
                {platform.steps.map((step, index) => (
                  <div key={step.title} className="flex gap-3">
                    {/* R17-F3: bare geometry-first step chip (no wrapper aria-hidden). */}
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{step.title}</p>
                      <StepSegments segments={step.segments} />
                    </div>
                  </div>
                ))}
              </div>
              {/* R24 F2: the per-tab snippet pre (WordPress/Shopify/GTM;
                  the HTML tab has steps only). text-xs — NOT the Quick
                  Start pre's text-sm. */}
              {platform.id !== 'html' && (
                <div className="relative mt-3">
                  <pre className="bg-foreground/5 border border-border rounded-lg p-4 text-xs font-mono overflow-x-auto leading-relaxed">
                    <code>
                      {buildPlatformSnippet(
                        platform.id,
                        siteKey,
                        collectorUrl,
                      )}
                    </code>
                  </pre>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

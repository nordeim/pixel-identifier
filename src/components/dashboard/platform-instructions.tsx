'use client'

import { Code, Globe, PanelsTopLeft, ShoppingBag } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const WORDPRESS_STEPS = [
  {
    title: 'Open your WordPress admin',
    text: 'Log in to your WordPress dashboard (usually yoursite.com/wp-admin).',
  },
  {
    title: 'Navigate to Appearance → Theme File Editor',
    text: 'In the left sidebar, go to Appearance, then click Theme File Editor. Alternatively, use a plugin like "Insert Headers and Footers".',
  },
  {
    title: 'Edit the header.php file',
    text: 'In the Theme File Editor, find and click header.php in the right sidebar to open it for editing.',
  },
  {
    title: 'Paste the snippet before </head>',
    text: 'Paste the pixel code just before the closing </head> tag, then click Update File.',
  },
]

const SHOPIFY_STEPS = [
  {
    title: 'Open your Shopify admin',
    text: 'Log in to your Shopify store admin panel.',
  },
  {
    title: 'Go to Online Store → Themes',
    text: 'Navigate to Online Store in the left sidebar, then click Themes.',
  },
  {
    title: 'Click "Edit code"',
    text: 'On your active theme, click the "…" menu and select Edit code.',
  },
  {
    title: 'Paste into theme.liquid',
    text: 'Open the theme.liquid file and paste the pixel code just before the closing </head> tag, then click Save.',
  },
]

const GTM_STEPS = [
  {
    title: 'Open Google Tag Manager',
    text: 'Log in to your Google Tag Manager workspace.',
  },
  {
    title: 'Create a new tag',
    text: 'Click Add a new tag, then choose Custom HTML as the tag type.',
  },
  {
    title: 'Paste the snippet',
    text: 'Paste the pixel code (including the <script> tags) into the HTML field.',
  },
  {
    title: 'Trigger on All Pages',
    text: 'Choose the "All Pages" trigger (Page View), name the tag "Pixelco", then publish your container.',
  },
]

// Live HTML guide carries four steps (incl. the deploy confirmation step).
const HTML_STEPS = [
  {
    title: 'Open your HTML file',
    text: 'Open the main HTML file of your website (usually index.html).',
  },
  {
    title: 'Find the <head> tag',
    text: 'Locate the <head> section of your page.',
  },
  {
    title: 'Paste the snippet',
    text: 'Paste the pixel code just before the closing </head> tag. It only needs to be in your main layout file — it will work on every page.',
  },
  {
    title: 'Deploy your site',
    text: 'Save and deploy your changes. Visit your site, then check your Pixelco dashboard to confirm events are arriving.',
  },
]

const PLATFORMS = [
  // Icon set mirrors the live app: code / globe / shopping-bag / code.
  { id: 'html', label: 'HTML / Custom', icon: Code, steps: HTML_STEPS },
  { id: 'wordpress', label: 'WordPress', icon: Globe, steps: WORDPRESS_STEPS },
  { id: 'shopify', label: 'Shopify', icon: ShoppingBag, steps: SHOPIFY_STEPS },
  { id: 'gtm', label: 'Google Tag Manager', icon: Code, steps: GTM_STEPS },
]

export function PlatformInstructions() {
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
        <Tabs defaultValue="html" className="w-full">
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
                      <p className="text-sm text-muted-foreground">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

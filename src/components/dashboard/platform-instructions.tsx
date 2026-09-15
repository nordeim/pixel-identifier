'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
]

const PLATFORMS = [
  { id: 'html', label: '<> HTML / Custom', steps: HTML_STEPS },
  { id: 'wordpress', label: 'WordPress', steps: WORDPRESS_STEPS },
  { id: 'shopify', label: 'Shopify', steps: SHOPIFY_STEPS },
  { id: 'gtm', label: '<> Google Tag Manager', steps: GTM_STEPS },
]

export function PlatformInstructions() {
  return (
    <section className="rounded-xl border border-border bg-card shadow-sm" aria-labelledby="platform-heading">
      <div className="border-b border-border p-5">
        <h2 id="platform-heading" className="flex items-center gap-2 text-base font-bold text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-sm" aria-hidden="true">
            🖥️
          </span>
          Platform Instructions
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">Step-by-step guides for popular platforms.</p>
      </div>

      <Tabs defaultValue="html" className="p-5">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/60 p-1">
          {PLATFORMS.map((platform) => (
            <TabsTrigger
              key={platform.id}
              value={platform.id}
              className="data-[state=active]:bg-card data-[state=active]:text-foreground"
            >
              {platform.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {PLATFORMS.map((platform) => (
          <TabsContent key={platform.id} value={platform.id} className="mt-5">
            <ol className="space-y-5">
              {platform.steps.map((step, index) => (
                <li key={step.title} className="flex gap-3.5">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-primary-foreground"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { ChartColumn, Code, Settings, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DocsCopyButton } from '@/components/marketing/docs-copy-button'

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'Get started with Pixelco in under 5 minutes.',
}

/**
 * R13-F5: rebuilt on the live DOM (research/round13-audit/content/
 * page-docs.json) — numbered step cards, the sample-snippet warning box
 * + SAMPLE-badged code block with copy button, platform instructions,
 * and the common-questions cards.
 */
const STEPS = [
  {
    icon: Settings,
    title: '1. Create Your Account',
    text: 'Sign up for a free Pixelco account and add your website domain in the dashboard.',
  },
  {
    icon: Code,
    title: '2. Install the Pixel',
    text: 'Copy the pixel code snippet and paste it into the <head> section of your website, just before the closing </head> tag.',
  },
  {
    icon: Zap,
    title: '3. Verify Installation',
    text: "Visit your website and check the Pixelco dashboard — you should see a green 'Active' status within a few minutes.",
  },
  {
    icon: ChartColumn,
    title: '4. Start Identifying',
    text: "That's it! Pixelco will begin identifying anonymous visitors and populating your dashboard with contact data in real time.",
  },
]

const PLATFORMS = [
  {
    name: 'WordPress',
    text: "Go to Appearance → Theme Editor → header.php. Paste the pixel code before </head>. Or use a plugin like 'Insert Headers & Footers'.",
  },
  {
    name: 'Shopify',
    text: 'Go to Online Store → Themes → Edit Code → theme.liquid. Paste the pixel code before </head>.',
  },
  {
    name: 'Webflow',
    text: 'Go to Project Settings → Custom Code → Head Code. Paste the pixel code and publish.',
  },
  {
    name: 'Wix',
    text: 'Go to Settings → Custom Code → Add Custom Code. Paste the pixel code, set it to load on all pages in the Head.',
  },
  {
    name: 'Next.js / React',
    text: 'Add the script tag to your _document.tsx (Next.js) or index.html (React/Vite) inside the <head> tag.',
  },
  {
    name: 'Custom HTML',
    text: 'Paste the pixel code directly into the <head> section of every page, or in your shared layout/template file.',
  },
]

const QUESTIONS = [
  {
    q: 'Does the pixel slow down my website?',
    a: 'No. The Pixelco script is loaded asynchronously and is under 5KB — it has zero impact on page load speed.',
  },
  {
    q: 'Is the pixel GDPR compliant?',
    a: 'Pixelco is 100% cookieless and does not use cookies or local storage. However, you should consult your legal team about disclosure requirements in your jurisdiction.',
  },
  {
    q: 'How quickly will I see results?',
    a: "You'll start seeing identified visitors within minutes of installation. Results improve over the first 24-48 hours as more traffic flows through.",
  },
]

const SAMPLE_SNIPPET = `<!-- Pixelco Tracking Pixel -->
<script>
  (function(p,i,x,e,l){
    p._pxid=p._pxid||[];
    var s=i.createElement('script');
    s.async=true;
    s.src='https://cdn.pixelco.com/pixel.js';
    s.setAttribute('data-site-id',e);
    var f=i.getElementsByTagName('script')[0];
    f.parentNode.insertBefore(s,f);
  })(window,document,'pxid','YOUR_SITE_ID');
</script>`

export default function DocsPage() {
  return (
    <div className="container mx-auto px-6 py-16 max-w-4xl">
      <Link href="/" className="text-sm text-primary hover:underline mb-6 inline-block">
        ← Back to Home
      </Link>

      <h1 className="text-4xl font-bold text-foreground mb-3">Documentation</h1>
      <p className="text-muted-foreground mb-12 text-lg">Get started with Pixelco in under 5 minutes.</p>

      <div className="grid sm:grid-cols-2 gap-5 mb-14">
        {STEPS.map((step) => (
          <div key={step.title} className="border border-border rounded-xl p-6 bg-card shadow-card">
            <step.icon className="w-8 h-8 text-primary mb-3" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.text}</p>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-4">Example Pixel Code</h2>
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4 flex items-start gap-3">
        <span className="text-yellow-500 text-lg mt-0.5" aria-hidden="true">⚠️</span>
        <p className="text-sm text-yellow-300 leading-relaxed">
          <strong className="text-yellow-400">This is a sample snippet for illustration only.</strong>{' '}
          Your real, unique pixel code will be generated automatically when you complete onboarding in
          your <Link href="/dashboard/install" className="text-primary underline hover:no-underline">Pixelco dashboard</Link>.
        </p>
      </div>

      <div className="relative mb-14">
        <div className="absolute top-3 left-3 bg-yellow-500/20 text-yellow-400 text-xs font-semibold px-2 py-0.5 rounded">
          SAMPLE
        </div>
        <pre className="bg-card border border-yellow-500/20 rounded-xl p-5 pt-10 overflow-x-auto text-sm font-mono text-muted-foreground leading-relaxed opacity-80">
          <code id="sample-snippet">{SAMPLE_SNIPPET}</code>
        </pre>
        <DocsCopyButton />
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-4">Platform-Specific Instructions</h2>
      <div className="space-y-4 mb-14">
        {PLATFORMS.map((platform) => (
          <div key={platform.name} className="border border-border rounded-xl p-5 bg-card shadow-card">
            <h3 className="text-base font-semibold text-foreground mb-1">{platform.name}</h3>
            <p className="text-sm text-muted-foreground">{platform.text}</p>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-4">Common Questions</h2>
      <div className="space-y-4 mb-10">
        {QUESTIONS.map((item) => (
          <div key={item.q} className="border border-border rounded-xl p-5 bg-card">
            <h3 className="font-semibold text-foreground mb-1">{item.q}</h3>
            <p className="text-sm text-muted-foreground">{item.a}</p>
          </div>
        ))}
      </div>

      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">Need help? Reach out to our team.</p>
        <Button
          asChild
          variant={null}
          size={null}
          className="bg-primary hover:bg-primary/90 h-10 px-4 py-2 gradient-cta text-primary-foreground border-0 hover:opacity-90 font-semibold"
        >
          <Link href="mailto:support@pixelco.io">Contact Support</Link>
        </Button>
      </div>
    </div>
  )
}

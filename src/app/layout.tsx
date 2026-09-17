import type { Metadata } from "next";
import { Inter, Space_Grotesk, DM_Sans, Dancing_Script } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { siteUrl } from "@/lib/site-url";

// Typography parity (R5-H1): the live app renders Inter for body copy and
// Space Grotesk for display faces (card titles, H1s, KPI values, prices,
// sidebar brand); the marketing site renders DM Sans; code/paths stay mono.
// Dancing Script (R7-V4) is the live marketing wordmark's "By Ai Viral"
// cursive subtext face.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    // R13-F10: the live's exact brand title (marketing routes render this
    // verbatim; the live's CSR shell never swaps it per route).
    default: "Pixelco — Identify Anonymous Website Visitors by Email",
    // R14-F2: the live's suffix separator is "|" (posts, legal, 404, blog).
    template: "%s | Pixelco",
  },
  // R14-F1: the live-verbatim landing description.
  description:
    "Pixelco identifies anonymous website visitors by their real email address. B2C and B2B. One pixel snippet, no forms needed. Start free today.",
  robots: {
    // R14-F13: the live marketing head ships <meta name="robots"
    // content="index, follow" />.
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Pixelco — Identify Anonymous Website Visitors by Email",
    description:
      "Pixelco identifies anonymous website visitors by their real email address. B2C and B2B. One pixel snippet, no forms needed. Start free today.",
    siteName: "Pixelco",
    type: "website",
    // R14-F6: per-page og:url + og:locale like the live's head.
    url: "/",
    locale: "en_US",
    // R14-F5: the live's 1200×630 social image, self-hosted (the live
    // hotlinks its builder's storage; the clone stays self-contained).
    images: [{ url: "/og-image.webp", width: 1200, height: 630 }],
  },
  twitter: {
    // R14-F7: the live ships a large summary card.
    card: "summary_large_image",
    title: "Pixelco — Identify Anonymous Website Visitors by Email",
    description:
      "Pixelco identifies anonymous website visitors by their real email address. B2C and B2B. One pixel snippet, no forms needed. Start free today.",
  },
  alternates: {
    // R14-F8: per-page canonical links like the live.
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${dmSans.variable} ${dancingScript.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

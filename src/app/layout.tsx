import type { Metadata } from "next";
import { Inter, Space_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { siteUrl } from "@/lib/site-url";

// Typography parity (R5-H1): the live app renders Inter for body copy and
// Space Grotesk for display faces (card titles, H1s, KPI values, prices,
// sidebar brand); the marketing site renders DM Sans; code/paths stay mono.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Pixelco — Identify Anonymous Website Visitors By Their Email",
    template: "%s · Pixelco",
  },
  description:
    "One pixel snippet reveals who's browsing your site. B2B companies and individual consumers — identified by their real email address. No forms. No popups. No cookies.",
  keywords: [
    "visitor identification",
    "email identification",
    "website visitor tracking",
    "B2C lead generation",
    "anonymous visitor reveal",
  ],
  openGraph: {
    title: "Pixelco — Identify Anonymous Website Visitors By Their Email",
    description:
      "One pixel snippet reveals who's browsing your site — by their real email address.",
    siteName: "Pixelco",
    type: "website",
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
        className={`${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

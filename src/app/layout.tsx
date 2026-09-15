import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { siteUrl } from "@/lib/site-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
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
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

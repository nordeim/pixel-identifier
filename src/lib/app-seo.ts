import type { Metadata } from 'next'

/**
 * App-bundle metadata (R14-F9).
 *
 * The live serves its product on a separate origin (app.pixelco.io) whose
 * CSR shell ships its own head block — `og:title` "Pixelco", the
 * description "Visitor identification platform dashboard", a 1920×1080
 * social image and a large twitter card — and notably NO canonical,
 * og:url, og:locale or robots meta (round-14 audit extraction). The clone
 * deploys marketing + app on one origin, so app surfaces (login, signup,
 * forgot-password, dashboard) override the root marketing og block with
 * this shape while keeping their per-page tab titles (R13 ruling: the
 * live's "Pixelco"-everywhere tab title is a CSR artifact).
 *
 * `twitter:site @Lovable` from the live's head is a build-platform
 * artifact and is deliberately NOT replicated (same ruling category as
 * the forgot-password dead link, PAD §11).
 */
export function appSeoMetadata(): Metadata {
  return {
    openGraph: {
      title: 'Pixelco',
      description: 'Visitor identification platform dashboard',
      images: [{ url: '/app-og-image.png' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Pixelco',
      description: 'Visitor identification platform dashboard',
    },
  }
}

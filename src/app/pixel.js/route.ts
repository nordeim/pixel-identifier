import { NextRequest, NextResponse } from 'next/server'
import { COLLECTOR_SCRIPT } from '@/lib/collector-script'

/**
 * Collector script served at /pixel.js.
 *
 * Loaded by customer sites via the install snippet:
 *   <script src="https://app.example.com/pixel.js" data-site="px_..." async></script>
 *
 * Responsibilities: derive the ingest endpoint from its own src origin,
 * maintain a per-site visitor id in localStorage (cookieless), and ship
 * pageview beacons — including SPA route changes — as text/plain JSON so
 * sendBeacon never triggers a CORS preflight.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
} as const

export async function GET(_request: NextRequest): Promise<NextResponse> {
  return new NextResponse(COLLECTOR_SCRIPT, {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  })
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

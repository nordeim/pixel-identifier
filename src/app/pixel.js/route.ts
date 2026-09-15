import { NextRequest, NextResponse } from 'next/server'

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

const SCRIPT_BODY = String.raw`
(function () {
  'use strict';

  var scriptEl = document.currentScript;
  var siteKey = scriptEl && scriptEl.getAttribute('data-site');
  if (!siteKey) return;

  var collectorSrc = scriptEl.getAttribute('src') || '';
  var endpoint;
  try {
    endpoint = new URL('/api/track', new URL(collectorSrc, location.href)).href;
  } catch (err) {
    return;
  }

  var VID_KEY = '_px_vid_' + siteKey;

  function getVid() {
    try {
      var vid = localStorage.getItem(VID_KEY);
      if (vid) return vid;
      vid = 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
      localStorage.setItem(VID_KEY, vid);
      return vid;
    } catch (err) {
      return 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
    }
  }

  function send() {
    var payload = {
      k: siteKey,
      u: location.href,
      p: location.pathname + location.search,
      r: document.referrer || '',
      t: document.title || '',
      v: getVid(),
      w: window.screen ? window.screen.width : 0,
      h: window.screen ? window.screen.height : 0
    };
    var body = JSON.stringify(payload);
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(endpoint, new Blob([body], { type: 'text/plain;charset=UTF-8' }));
        return;
      }
    } catch (err) { /* fall through to fetch */ }
    try {
      fetch(endpoint, {
        method: 'POST',
        body: body,
        keepalive: true,
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' }
      }).catch(function () {});
    } catch (err) { /* browser blocked — nothing to do */ }
  }

  send();

  // SPA route tracking: catch history API navigation and back/forward.
  var lastPath = location.pathname;
  function onRouteChange() {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      send();
    }
  }
  var push = history.pushState;
  if (push) {
    history.pushState = function () {
      push.apply(history, arguments);
      onRouteChange();
    };
    history.replaceState = function () {
      var replace = history.replaceState;
      replace.apply(history, arguments);
      onRouteChange();
    };
  }
  window.addEventListener('popstate', onRouteChange);
})();
`

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
} as const

export async function GET(_request: NextRequest): Promise<NextResponse> {
  return new NextResponse(SCRIPT_BODY, {
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

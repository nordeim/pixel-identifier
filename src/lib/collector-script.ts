/**
 * Collector script served at /pixel.js.
 *
 * Kept as a lib module (not inline in the route) so the emitted JavaScript is
 * a testable artefact: tests execute it in a VM with mocked browser globals
 * and assert SPA route-change behaviour without a real browser.
 */

export const COLLECTOR_SCRIPT = String.raw`
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
      v: getVid()
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
  // Capture BOTH originals before patching: resolving history.replaceState
  // inside the wrapper would return the wrapper itself and recurse forever.
  var push = history.pushState;
  var replace = history.replaceState;
  if (push && replace) {
    history.pushState = function () {
      push.apply(history, arguments);
      onRouteChange();
    };
    history.replaceState = function () {
      replace.apply(history, arguments);
      onRouteChange();
    };
  }
  window.addEventListener('popstate', onRouteChange);
})();
`

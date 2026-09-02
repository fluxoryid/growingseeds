// GrowingSeeds service worker
// -----------------------------------------------------------------------
// Two jobs:
//
// 1. APP SHELL (this document, manifest, icons): precached on install so
//    the installed app still LAUNCHES when the device is offline -- the
//    core requirement for a real "installed app" experience, not just an
//    offline-tolerant page. Served network-first-with-cache-fallback, so a
//    parent online gets the latest version automatically, while an offline
//    launch still opens instantly from cache instead of failing.
//
// 2. EXTERNAL AUDIO/FONT/SDK ASSETS (Freesound, Google's celebration SFX
//    library, Google Fonts, the Supabase JS SDK bundle): once a clip has
//    played successfully while online, cache it so it plays instantly (and
//    still plays at all) on later visits even with a flaky or absent
//    connection. Served cache-first -- a hit never touches the network at
//    all, which also makes repeat plays feel instant even while online.
//
// NOTE: this file must live at the SAME LEVEL as index.html (the
// root of wherever this app is hosted), not inside assets/ -- a service
// worker can never control pages outside the directory its own script is
// in (that's a hard browser restriction, not a bug), so if this file were
// nested one level down it could never actually control the main page.

const CACHE_NAME = 'growingseeds-shell-v2';

const APP_SHELL_URLS = [
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
];

const CACHEABLE_EXTERNAL_ORIGINS = [
  'cdn.freesound.org',
  'freesound.org',
  'actions.google.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.jsdelivr.net',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .catch(() => { /* best-effort -- a slow/blocked precache shouldn't block install */ })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

function isAppShellRequest(url, sameOrigin) {
  if (!sameOrigin) return false;
  // Matches this page's own document, manifest, and icons -- anything else
  // same-origin (e.g. a future asset not in the precache list) just falls
  // through to the network untouched.
  return APP_SHELL_URLS.some((shellUrl) => url.pathname.endsWith(shellUrl.replace('./', '/')))
    || url.pathname === '/' || url.pathname.endsWith('/index.html');
}

self.addEventListener('fetch', (event) => {
  let url;
  try {
    url = new URL(event.request.url);
  } catch (e) {
    return; // not a fetchable URL (e.g. chrome-extension://) -- ignore
  }

  if (event.request.method !== 'GET') return;

  const sameOrigin = url.origin === self.location.origin;

  if (isAppShellRequest(url, sameOrigin)) {
    // Network-first, cache-fallback: an online parent always gets the
    // latest build; an offline launch still opens from the last-cached copy.
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  if (!sameOrigin && !CACHEABLE_EXTERNAL_ORIGINS.includes(url.hostname)) return;
  if (!sameOrigin) {
    // Cache-first for the external CDN assets (audio/fonts/SDK).
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        try {
          const response = await fetch(event.request);
          if (response && response.ok) cache.put(event.request, response.clone());
          return response;
        } catch (err) {
          // Offline and not yet cached -- let the app's own fallback (a
          // synthesized chime for sounds) take over rather than hanging.
          throw err;
        }
      })
    );
  }
});

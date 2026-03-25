/* ===================================================
   Service Worker — Spillsamling
   Bump CACHE version whenever static assets change.
   =================================================== */
const CACHE = 'games-v4';

const ASSETS = [
  './',
  './index.html',
  './shared.css',
  './manifest.json',
  './favicon.svg',
  './stats.html',
  './install.html',
  './icons/icon.svg',
  './games/tallpyramide.html',
  './games/labyrint.html'
];

// ---- Install: pre-cache all assets ----
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ---- Activate: remove old caches ----
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ---- Fetch: cache-first strategy ----
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => cached);
    })
  );
});

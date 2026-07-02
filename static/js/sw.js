/* ============================================================
   Mnemo AI — Service Worker (sw.js)
   ============================================================
   Enables Mnemo AI to work as an installable, offline-capable PWA.

   STRATEGY OVERVIEW:
     - CACHE-FIRST for static assets (.css/.js) — these rarely
       change, so loading instantly from cache makes the app feel
       fast.
     - NETWORK-FIRST for all /api/* routes — these hit live Cognee
       memory data, so we always try the network first; caching
       them would risk showing stale journal entries, stats, or
       AI replies.
     - CACHE-FIRST (with network fallback) for page routes — this
       is what lets the app shell actually open while offline.

   VERSIONING:
     CACHE_NAME is versioned ("mnemo-cache-v1"). To ship an update
     that changes cached files, bump this string (e.g. "v2"). The
     activate handler automatically deletes old-versioned caches.
   ============================================================ */

const CACHE_NAME = 'mnemo-cache-v1';

// Page shell — routes we want available even with no network.
const PRECACHE_ROUTES = [
  '/',
  '/dashboard',
  '/chat',
  '/journal',
  '/insights',
  '/goals',
  '/timeline',
  '/future',
  '/forget'
];

/* ----- INSTALL: pre-cache the page shell ----- */
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE_ROUTES);
    })
  );
  self.skipWaiting();
});

/* ----- ACTIVATE: clean up old cache versions ----- */
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (name) {
            return name.startsWith('mnemo-cache-') && name !== CACHE_NAME;
          })
          .map(function (name) {
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

/* ----- FETCH: route each request to the right strategy ----- */
self.addEventListener('fetch', function (event) {
  const url = new URL(event.request.url);

  // Never intercept non-GET requests (POST /api/remember etc.)
  if (event.request.method !== 'GET') {
    return;
  }

  // STRATEGY 1: NETWORK-FIRST for all /api/* routes.
  // Always try live Cognee data first; only fall back to a cached
  // copy if the network request fails (e.g. user is offline).
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(function (networkResponse) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        })
        .catch(function () {
          return caches.match(event.request);
        })
    );
    return;
  }

  // STRATEGY 2: CACHE-FIRST for static assets (.css/.js).
  // We control exactly when these update by bumping CACHE_NAME,
  // so serving instantly from cache is both faster and safe.
  if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
    event.respondWith(
      caches.match(event.request).then(function (cachedResponse) {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then(function (networkResponse) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        });
      })
    );
    return;
  }

  // STRATEGY 3: CACHE-FIRST (network fallback) for everything else
  // — mainly page navigations like /dashboard, /journal, etc.
  // This is what lets the app shell open while offline.
  event.respondWith(
    caches.match(event.request).then(function (cachedResponse) {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then(function (networkResponse) {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      });
    })
  );
});
// COMPASS Service Worker — provides offline caching of the app shell.
// Required for PWA installability on desktop browsers (Chrome, Edge, Brave).
const CACHE_NAME = 'compass-v1';

self.addEventListener('install', (event) => {
  // Skip waiting so the new SW activates immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of any open clients
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Cache-first strategy: serve from cache, fall back to network, update cache in background
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cached) => {
        const networkFetch = fetch(event.request)
          .then((response) => {
            if (response && response.status === 200 && response.type === 'basic') {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => cached);
        return cached || networkFetch;
      });
    })
  );
});

// PokéAyman Static Asset & Artwork Cache Service Worker
const CACHE_NAME = 'pokeayman-assets-v1';

// Static asset matching rules (PokeAPI official artwork, local assets, game cards, sound samples)
function isStaticAsset(url) {
  const u = url.toLowerCase();
  return (
    u.includes('sprites/pokemon') ||
    u.includes('pokeapi.co') ||
    u.includes('cdn.jsdelivr.net/gh/pokeapi/sprites') ||
    u.includes('raw.githubusercontent.com/pokeapi/sprites') ||
    u.includes('/pokeayman/assets/') ||
    u.includes('/assets/') ||
    /\.(png|jpe?g|webp|svg|gif|ico|woff2?|ttf|mp3|wav|ogg)$/.test(u.split('?')[0])
  );
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = request.url;

  // We only cache image, media, artwork, and static game assets
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        // Cache-First strategy: Return cached version immediately if available
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch over network, store in Cache Storage, and return response
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          // If offline and not in cache, fallback
          return cachedResponse || Promise.reject(error);
        }
      })
    );
  }
});

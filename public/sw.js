const CACHE_NAME = 'petia-cache-v1.4.3';

const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/agenda',
  '/pets',
  '/tutores',
  '/checkin',
  '/manifest.json',
  '/icons/petshop-icon.svg',
  '/icons/petshop-icon-192.png',
  '/icons/petshop-icon-512.png',
  '/icons/petshop-apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
];

// Install Event — Safe cache addition without throwing on single URL failure
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        STATIC_ASSETS.map((url) =>
          fetch(url)
            .then((res) => {
              if (res.ok) return cache.put(url, res);
            })
            .catch(() => {})
        )
      );
    })
  );
  self.skipWaiting();
});

// Activate Event — Cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event — Robust Network-First for Navigation & Cache-First for Static Assets
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle HTTP/HTTPS GET requests
  if (request.method !== 'GET') return;
  if (!request.url.startsWith('http')) return;

  // Navigation requests (HTML pages): Network First, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = await caches.match('/dashboard');
          if (fallback) return fallback;
          return new Response('Offline — Petia', {
            status: 503,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        })
    );
    return;
  }

  // Static Assets (_next/static, icons, images, styles): Cache First, fallback to network
  if (
    request.url.includes('/_next/static/') ||
    request.url.includes('/icons/') ||
    request.url.endsWith('.png') ||
    request.url.endsWith('.svg') ||
    request.url.endsWith('.ico')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Default GET requests: Network with Cache Fallback
  event.respondWith(
    fetch(request).catch(async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      return new Response('', { status: 408 });
    })
  );
});

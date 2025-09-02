// Enhanced service-worker.js with advanced caching strategies
const CACHE_NAME = 'easy-access-utilities-v2';
const STATIC_CACHE = 'static-cache-v2';
const DYNAMIC_CACHE = 'dynamic-cache-v2';

// Assets to cache immediately
const urlsToCache = [
  '/',
  '/index.html',
  '/chime.mp3',
  '/sounds/tick.mp3',
  '/sounds/rain.mp3',
  '/sounds/cafe.mp3',
  '/sounds/white.mp3',
  '/sounds/forest.mp3',
  '/placeholder.svg',
  '/favicon.ico'
];

// Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Install the service worker and cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Network-first strategy for API calls, cache-first for static assets
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle different types of requests with appropriate strategies
  if (request.destination === 'document') {
    // HTML pages - Network first, fallback to cache
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
  } else if (request.destination === 'script' || request.destination === 'style') {
    // JS/CSS - Cache first, fallback to network
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(request).then(response => {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
            return response;
          });
        })
    );
  } else if (request.destination === 'image') {
    // Images - Cache first with stale-while-revalidate
    event.respondWith(
      caches.match(request)
        .then(response => {
          const fetchPromise = fetch(request).then(response => {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
            return response;
          });

          return response || fetchPromise;
        })
    );
  } else {
    // Other requests - Network first
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match(request);
        })
    );
  }
});

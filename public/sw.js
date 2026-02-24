const CACHE_NAME = 'l2p-v2';

// Paths that should never be cached (API routes, edit pages)
const NO_CACHE_PATTERNS = [
  /^\/api\//,
  /\/edit\/?$/,
  /\/history\/?/,
  /\/login\/?$/,
];

function shouldCache(url) {
  const path = new URL(url).pathname;
  return !NO_CACHE_PATTERNS.some(pattern => pattern.test(path));
}

// Install: cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/favicon.svg',
        '/icons/icon-192.png',
        '/icons/icon-512.png',
      ]);
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network-first with cache fallback (skip API/edit routes)
self.addEventListener('fetch', (event) => {
  if (!shouldCache(event.request.url) || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

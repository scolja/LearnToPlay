const CACHE_NAME = 'l2p-v3';
const GUIDE_CACHE_PREFIX = 'l2p-guide-';
const FONT_CACHE = 'l2p-fonts';

// Paths that should never be cached (API routes, edit pages)
const NO_CACHE_PATTERNS = [
  /^\/api\//,
  /\/edit\/?$/,
  /\/history\/?/,
  /\/login\/?$/,
];

function shouldCache(url) {
  const u = new URL(url);
  // Cache same-origin and Google Fonts
  if (u.origin !== self.location.origin &&
      u.hostname !== 'fonts.googleapis.com' &&
      u.hostname !== 'fonts.gstatic.com') {
    return false;
  }
  if (u.origin === self.location.origin) {
    return !NO_CACHE_PATTERNS.some(pattern => pattern.test(u.pathname));
  }
  return true;
}

function isGoogleFont(url) {
  const u = new URL(url);
  return u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com';
}

function extractSlugFromGuideUrl(pathname) {
  const m = pathname.match(/^\/games\/([^/]+)\/(learn|glossary)\/?$/);
  return m ? m[1] : null;
}

function extractImageUrls(html) {
  const urls = new Set();
  // Match src="/images/..." attributes
  let m;
  const srcPattern = /src="(\/images\/[^"]+)"/g;
  while ((m = srcPattern.exec(html)) !== null) urls.add(m[1]);
  // Match url(/images/...) in inline styles
  const urlPattern = /url\(["']?(\/images\/[^"')]+)["']?\)/g;
  while ((m = urlPattern.exec(html)) !== null) urls.add(m[1]);
  return [...urls];
}

// ---------------------------------------------------------------------------
// Install: cache the app shell
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Activate: clean up old caches (preserve guide + font caches)
// ---------------------------------------------------------------------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) =>
            key !== CACHE_NAME &&
            !key.startsWith(GUIDE_CACHE_PREFIX) &&
            key !== FONT_CACHE
          )
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// ---------------------------------------------------------------------------
// Message handler: guide caching operations
// ---------------------------------------------------------------------------
self.addEventListener('message', (event) => {
  const { type, requestId } = event.data;

  if (type === 'CACHE_GUIDE') {
    handleCacheGuide(event).catch(() => {});
  } else if (type === 'REMOVE_GUIDE') {
    handleRemoveGuide(event).catch(() => {});
  } else if (type === 'CHECK_GUIDE') {
    handleCheckGuide(event).catch(() => {});
  }
});

async function postToClient(client, msg) {
  if (client) {
    client.postMessage(msg);
  } else {
    const clients = await self.clients.matchAll();
    clients.forEach((c) => c.postMessage(msg));
  }
}

async function handleCacheGuide(event) {
  const { slug, heroImage, requestId } = event.data;
  const client = event.source;
  const cacheName = GUIDE_CACHE_PREFIX + slug;

  try {
    const cache = await caches.open(cacheName);
    const urls = [];

    // 1. Fetch learn page and glossary page
    const learnUrl = `/games/${slug}/learn/`;
    const glossaryUrl = `/games/${slug}/glossary/`;

    const learnResp = await fetch(learnUrl);
    if (!learnResp.ok) throw new Error(`Failed to fetch learn page: ${learnResp.status}`);
    const learnHtml = await learnResp.clone().text();
    await cache.put(learnUrl, learnResp);
    urls.push(learnUrl);

    // Fetch glossary (non-fatal if it fails)
    try {
      const glossaryResp = await fetch(glossaryUrl);
      if (glossaryResp.ok) {
        await cache.put(glossaryUrl, glossaryResp);
        urls.push(glossaryUrl);
      }
    } catch { /* glossary is optional */ }

    // 2. Extract image URLs from learn page HTML
    const imageUrls = extractImageUrls(learnHtml);

    // 3. Add hero image if not already included
    if (heroImage && !imageUrls.includes(heroImage)) {
      imageUrls.push(heroImage);
    }

    const totalResources = imageUrls.length;
    let loaded = 0;

    // 4. Fetch and cache each image
    for (const imgUrl of imageUrls) {
      try {
        const resp = await fetch(imgUrl);
        if (resp.ok) {
          await cache.put(imgUrl, resp);
          urls.push(imgUrl);
        }
      } catch { /* skip failed images */ }
      loaded++;
      await postToClient(client, {
        type: 'DOWNLOAD_PROGRESS',
        requestId,
        slug,
        loaded,
        total: totalResources,
      });
    }

    await postToClient(client, {
      type: 'CACHE_GUIDE_COMPLETE',
      requestId,
      slug,
      success: true,
      resourceCount: urls.length,
    });
  } catch (err) {
    await postToClient(client, {
      type: 'CACHE_GUIDE_COMPLETE',
      requestId,
      slug,
      success: false,
      error: err.message || 'Download failed',
    });
  }
}

async function handleRemoveGuide(event) {
  const { slug, requestId } = event.data;
  const client = event.source;
  await caches.delete(GUIDE_CACHE_PREFIX + slug);
  await postToClient(client, {
    type: 'REMOVE_GUIDE_COMPLETE',
    requestId,
    slug,
  });
}

async function handleCheckGuide(event) {
  const { slug, requestId } = event.data;
  const client = event.source;
  const exists = await caches.has(GUIDE_CACHE_PREFIX + slug);
  let resourceCount = 0;
  if (exists) {
    const cache = await caches.open(GUIDE_CACHE_PREFIX + slug);
    const keys = await cache.keys();
    resourceCount = keys.length;
  }
  await postToClient(client, {
    type: 'CHECK_GUIDE_RESULT',
    requestId,
    slug,
    cached: exists,
    resourceCount,
  });
}

// ---------------------------------------------------------------------------
// Fetch: network-first with multi-cache fallback
// ---------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  if (!shouldCache(url) || event.request.method !== 'GET') {
    return;
  }

  // Google Fonts: cache-first (fonts are immutable once versioned)
  if (isGoogleFont(url)) {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            if (response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
        })
      )
    );
    return;
  }

  // All other requests: network-first with multi-cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(async () => {
        // Network failed — check caches

        // If this is an RSC request (Next.js client-side nav) for a guide page,
        // try returning the cached full HTML instead
        const isRsc = event.request.headers.get('RSC') === '1' ||
                      event.request.headers.get('Next-Router-State-Tree');
        const pathname = new URL(event.request.url).pathname;
        const slug = extractSlugFromGuideUrl(pathname);

        if (isRsc && slug) {
          const guideCache = await caches.open(GUIDE_CACHE_PREFIX + slug);
          const cached = await guideCache.match(pathname);
          if (cached) {
            // Return HTML response — browser will do a full page load
            return new Response(await cached.text(), {
              status: 200,
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            });
          }
        }

        // Check guide-specific caches
        if (slug) {
          const guideCache = await caches.open(GUIDE_CACHE_PREFIX + slug);
          const guideCached = await guideCache.match(event.request);
          if (guideCached) return guideCached;
        }

        // Check guide caches for images
        if (pathname.startsWith('/images/')) {
          const allKeys = await caches.keys();
          for (const key of allKeys) {
            if (key.startsWith(GUIDE_CACHE_PREFIX)) {
              const cache = await caches.open(key);
              const match = await cache.match(event.request);
              if (match) return match;
            }
          }
        }

        // Fall back to app shell cache
        return caches.match(event.request);
      })
  );
});

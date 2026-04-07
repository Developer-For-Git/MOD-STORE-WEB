const CACHE_VERSION = 'v12';
const CACHE_NAME = `modstore-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  './', './index.html', './manifest.json',
  './css/reset.css?v=9', './css/tokens.css?v=9', './css/components.css?v=9', './css/animations.css?v=9',
  './js/app.js?v=9', './js/store.js', './js/api.js',
  './js/utils/search.js', './js/utils/insights-calc.js',
  './js/views/catalog.js', './js/views/detail.js',
  './js/views/insights.js', './js/views/favorites.js', './js/views/settings.js',
  './data/sample.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[SW] Install cache failed:', err))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k.startsWith('modstore-') && k !== CACHE_NAME)
            .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (!url.protocol.startsWith('http')) return;

  // Network-first for JSON catalog data
  if (url.pathname.endsWith('.json') && !url.pathname.includes('manifest')) {
    event.respondWith(networkFirst(request));
    return;
  }
  // Cache-first for all other assets
  event.respondWith(cacheFirst(request));
});

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res.ok) (await caches.open(CACHE_NAME)).put(req, res.clone());
    return res;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(req) {
  try {
    const res = await fetch(req);
    if (res.ok) (await caches.open(CACHE_NAME)).put(req, res.clone());
    return res;
  } catch {
    const cached = await caches.match(req);
    return cached || new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503, headers: { 'Content-Type': 'application/json' }
    });
  }
}

self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

const CACHE_NAME = 'excel-automation-v1';
const BASE_PATH = '/MicrosoftExcelAutomation';

const urlsToCache = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/style.css`,
  `${BASE_PATH}/script.js`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/studentview.html`,
  `${BASE_PATH}/adminview.html`,
  `${BASE_PATH}/PaidPage.html`,
  `${BASE_PATH}/icon-192.png`,
  `${BASE_PATH}/icon-512.png`
];

// INSTALL: Cache all required assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const url of urlsToCache) {
        try {
          await cache.add(url);
        } catch (err) {
          console.error(`❌ Failed to cache: ${url}`, err);
        }
      }
    })
  );
});

// ACTIVATE: Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// FETCH: Serve from cache, or fetch and fallback
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Special handling for studentview.html with query params
  if (url.pathname.endsWith('/studentview.html')) {
    event.respondWith(
      caches.match(`${BASE_PATH}/studentview.html`).then(response => {
        return response || fetch(`${BASE_PATH}/studentview.html`);
      }).catch(() => {
        return new Response('Offline: studentview.html not available', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain' }
        });
      })
    );
    return;
  }

  // Default behavior
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }).catch(async error => {
      console.error('Fetch failed:', error);
      if (event.request.headers.get('accept')?.includes('text/html')) {
        return await caches.match(`${BASE_PATH}/index.html`);
      }
      return new Response('You are offline and this resource is not cached.', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain' }
      });
    })
  );
});


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
  const requestURL = new URL(event.request.url);

  // Special case: match any version of studentview.html (with query strings)
  if (requestURL.pathname.endsWith('/studentview.html')) {
    event.respondWith(
      caches.match(`${BASE_PATH}/studentview.html`).then(response => {
        return response || fetch(event.request);
      }).catch(async error => {
        console.error('StudentView fetch failed:', error);
        return new Response('Offline: studentview.html is unavailable.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      })
    );
    return;
  }

  // Default fetch handler
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }).catch(async error => {
      console.error('Fetch failed:', error);

      if (event.request.headers.get('accept')?.includes('text/html')) {
        const fallback = await caches.match(`${BASE_PATH}/index.html`);
        if (fallback) return fallback;
      }

      return new Response('You are offline and this resource is not cached.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' }
      });
    })
  );
});

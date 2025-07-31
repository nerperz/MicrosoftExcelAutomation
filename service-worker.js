const CACHE_NAME = 'excel-automation-v1';
const BASE_PATH = '/MicrosoftExcelAutomation';

const urlsToCache = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/style.css`,
  `${BASE_PATH}/script.js`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/studentview.html?name=${encodeURIComponent(matchedKey)}&date=${encodeURIComponent(date)}&item=${encodeURIComponent(item)}&credits=${currentCredits}`,
  `${BASE_PATH}/adminview.html`,
  `${BASE_PATH}/PaidPage.html?name=${encodeURIComponent(name)}&date=${encodeURIComponent(date)}&item=${encodeURIComponent(item)}&credits=${encodeURIComponent(newCredits)}`,
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

self.addEventListener('fetch', function(event) {
  const url = new URL(event.request.url);

  // Handle requests to studentview.html with query params
  if (url.pathname.endsWith('studentview.html')) {
    event.respondWith(
      caches.match('/studentview.html').then(function(response) {
        return response || fetch(event.request);
      })
    );
    return;
  }

  // Default handler
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

// FETCH: Serve from cache, or fallback safely
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }).catch(async error => {
      console.error('Fetch failed:', error);

      // If this is an HTML request, return cached index.html if available
      if (event.request.headers.get('accept')?.includes('text/html')) {
        const fallback = await caches.match(`${BASE_PATH}/index.html`);
        if (fallback) return fallback;
      }

      // Otherwise, return a valid offline text response
      return new Response('You are offline and this resource is not cached.', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain' }
      });
    })
  );
});

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

  // Normalize paths
  const path = url.pathname;

  // Match /PaidPage.html with any query parameters
  if (path.endsWith('/PaidPage.html')) {
    event.respondWith(
      caches.match('/MicrosoftExcelAutomation/PaidPage.html').then(response => {
        return response || fetch('/MicrosoftExcelAutomation/PaidPage.html');
      }).catch(() => new Response('Offline: PaidPage.html not cached', { status: 503 }))
    );
    return;
  }

  // Match /studentview.html with any query parameters
  if (path.endsWith('/studentview.html')) {
    event.respondWith(
      caches.match('/MicrosoftExcelAutomation/studentview.html').then(response => {
        return response || fetch('/MicrosoftExcelAutomation/studentview.html');
      }).catch(() => new Response('Offline: studentview.html not cached', { status: 503 }))
    );
    return;
  }

  // Default strategy
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }).catch(() => new Response('Offline: resource not cached', { status: 503 }))
  );
});

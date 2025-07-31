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

// INSTALL
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.error('Caching failed', err))
  );
});

// ACTIVATE
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
});

// FETCH
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }).catch(async error => {
      console.error('Fetch failed:', error);

      // Check if it's an HTML page request
      if (event.request.headers.get('accept')?.includes('text/html')) {
        const fallback = await caches.match(`${BASE_PATH}/index.html`);
        if (fallback) return fallback;
      }

      // Generic fallback Response
      return new Response('Offline and resource not cached.', {
        status: 503,
        statusText: 'Offline',
        headers: { 'Content-Type': 'text/plain' }
      });
    })
  );
});


const CACHE_NAME = 'excel-automation-cache-v1';
const urlsToCache = [
  '/MicrosoftExcelAutomation/',
  '/MicrosoftExcelAutomation/index.html',
  '/MicrosoftExcelAutomation/style.css',
  '/MicrosoftExcelAutomation/script.js',
  '/MicrosoftExcelAutomation/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

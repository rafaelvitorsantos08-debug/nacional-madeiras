self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('nacional-madeiras-store').then((cache) => cache.addAll([
      '/',
      '/index.html',
    ])),
  );
});

self.addEventListener('fetch', (e) => {
  // Simple fetch from network
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

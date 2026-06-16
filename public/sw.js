self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('nacional-madeiras-store').then((cache) => cache.addAll([
      '/',
      '/index.html',
    ])),
  );
});

self.addEventListener('fetch', (e) => {
  if (!e.request.url.startsWith('http')) return;
  e.respondWith(
    fetch(e.request).catch(async () => {
      const cached = await caches.match(e.request);
      if (cached) return cached;
      return new Response("Network error", { status: 408, headers: { "Content-Type": "text/plain" } });
    })
  );
});

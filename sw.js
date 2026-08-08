const CACHE = 'sproochentest-v18.0.5';
const ASSETS = ['./','index.html','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(e.request, copy));
    return response;
  }).catch(() => e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error())));
});

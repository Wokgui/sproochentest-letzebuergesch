const CACHE = 'sproochentest-v19.9.0';
const ASSETS = ['./','index.html','manifest.json','fixes.js','oral.js','patch-v197.js','patch-v198.js','patch-v199.js','icon-192.png','icon-512.png'];

self.addEventListener('install', e => e.waitUntil(
  caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
));

self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())
));

async function patchedIndex(){
  let response;
  try{ response = await fetch('./index.html', {cache:'no-store'}); }
  catch(e){ response = await caches.match('./index.html'); }
  if(!response) return Response.error();
  let html = await response.text();
  html = html.replace(/<script src="\.\/fixes\.js[^>]*><\/script>/g,'');
  html = html.replace(/<script src="\.\/oral\.js[^>]*><\/script>/g,'');
  html = html.replace(/<script src="\.\/patch-v197\.js[^>]*><\/script>/g,'');
  html = html.replace(/<script src="\.\/patch-v198\.js[^>]*><\/script>/g,'');
  html = html.replace(/<script src="\.\/patch-v199\.js[^>]*><\/script>/g,'');
  html = html.replace('</body>','<script src="./fixes.js?v=19.5"></script><script src="./oral.js?v=19.6"></script><script src="./patch-v197.js?v=19.7"></script><script src="./patch-v198.js?v=19.8"></script><script src="./patch-v199.js?v=19.9"></script></body>');
  return new Response(html,{status:200,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== self.location.origin) return;
  const url = new URL(e.request.url);
  if(e.request.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname === self.registration.scope.replace(self.location.origin,'')){
    e.respondWith(patchedIndex());
    return;
  }
  e.respondWith(fetch(e.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(e.request, copy));
    return response;
  }).catch(() => caches.match(e.request)));
});
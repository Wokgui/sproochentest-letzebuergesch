const CACHE='letzlies-v33';
const CORE=['/','/index.html','/styles.css','/manifest.webmanifest','/icon.svg','/icon-192.png','/icon-512.png','/icon-maskable-192.png','/icon-maskable-512.png','/apple-touch-icon.png','/src/app.js','/src/data.js','/src/audio.js','/src/dictionary.js','/covers/intro.svg','/covers/cafe.svg','/covers/train.svg','/covers/late.svg','/covers/languages.svg','/covers/free.svg','/covers/mobility.svg','/covers/history.svg','/covers/shopping.svg','/covers/weekend.svg','/covers/fair.svg','/covers/mullerthal.svg','/covers/moselle.svg','/covers/restaurant.svg','/covers/home.svg','/covers/bus.svg','/covers/apartment.svg','/covers/doctor.svg','/covers/remote.svg','/covers/missed-train.svg','/covers/weather.svg','/covers/sport.svg','/covers/cinema.svg','/covers/course.svg','/covers/neighbor.svg','/covers/energy.svg','/covers/concert.svg','/covers/commune.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)));});
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()]));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);if(u.origin!==location.origin)return;
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request).catch(()=>caches.match('/index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{
    if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(cache=>cache.put(e.request,copy));}
    return r;
  })));
});

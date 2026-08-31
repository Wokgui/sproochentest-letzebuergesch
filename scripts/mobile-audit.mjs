import { readFile, access } from 'node:fs/promises';

const root=new URL('../',import.meta.url);
const text=async p=>readFile(new URL(p,root),'utf8');
const fail=msg=>{throw new Error(`Audit mobile/PWA: ${msg}`)};
const must=(ok,msg)=>{if(!ok)fail(msg)};

const manifest=JSON.parse(await text('manifest.webmanifest'));
must(manifest.id==='/', 'manifest.id doit être /');
must(manifest.start_url==='/'&&manifest.scope==='/', 'start_url/scope invalides');
must(manifest.display==='standalone', 'display standalone manquant');
must(manifest.theme_color&&manifest.background_color, 'couleurs PWA manquantes');
const icons=manifest.icons||[];
for(const [src,size] of [['/icon-192.png','192x192'],['/icon-512.png','512x512'],['/icon-maskable-192.png','192x192'],['/icon-maskable-512.png','512x512']]){
  const row=icons.find(x=>x.src===src&&x.sizes===size&&x.type==='image/png');
  must(row,`${src} absent du manifeste`);
  await access(new URL(src.slice(1),root));
}
must(icons.some(x=>String(x.purpose||'').includes('maskable')), 'icône maskable absente');

function pngSize(buf){
  must(buf.length>24&&buf.toString('ascii',1,4)==='PNG','PNG invalide');
  return [buf.readUInt32BE(16),buf.readUInt32BE(20)];
}
for(const [file,w] of [['icon-192.png',192],['icon-512.png',512],['icon-maskable-192.png',192],['icon-maskable-512.png',512],['apple-touch-icon.png',180]]){
  const [pw,ph]=pngSize(await readFile(new URL(file,root)));
  must(pw===w&&ph===w,`${file}: ${pw}×${ph}, attendu ${w}×${w}`);
}

const html=await text('index.html');
must(/viewport-fit=cover/.test(html),'viewport-fit=cover absent');
must(/apple-touch-icon\.png/.test(html),'apple-touch-icon absent');
must(/mobile-web-app-capable/.test(html),'meta mobile-web-app-capable absent');
const css=await text('styles.css');
for(const marker of ['safe-area-inset-top','safe-area-inset-bottom','100dvh','touch-action:manipulation','min-height:44px','@media(max-width:360px)']) must(css.includes(marker),`CSS mobile manquant: ${marker}`);
const sw=await text('sw.js');
must(sw.includes("const CACHE='letzlies-v33'"),'cache v33 absent');
must(sw.includes("e.request.mode==='navigate'"),'fallback navigation absent');
must(sw.includes("caches.match('/index.html')"),'fallback index hors ligne absent');
for(const f of ['/icon-192.png','/icon-512.png','/icon-maskable-512.png']) must(sw.includes(f),`${f} absent du cache CORE`);
const app=await text('src/app.js');
must(app.includes('beforeinstallprompt'),'gestion beforeinstallprompt absente');
must(app.includes('appinstalled'),'gestion appinstalled absente');
must(app.includes('install-pwa'),'bouton installation absent');
console.log('Audit mobile/PWA: manifeste, icônes, safe-area, cibles tactiles, installation et fallback hors ligne OK');

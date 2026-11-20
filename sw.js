/* Service worker: deja la app funcionando sin conexión.
   Cuando publiques cambios, sube el número de VERSION para que los dispositivos se actualicen. */
const VERSION='cancionero-v1';
const CORE=['./','index.html','styles.css','songs.js','spotify.js','app.js','manifest.json','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==VERSION).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    // Propios: primero la red (siempre fresco con conexión), si falla, lo guardado.
    e.respondWith(fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(VERSION).then(x=>x.put(r,c))}return res}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))));
    return;
  }
  if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){
    // Tipografías: lo guardado primero, y se refresca por detrás.
    e.respondWith(caches.open(VERSION).then(c=>c.match(r).then(m=>{const n=fetch(r).then(res=>{c.put(r,res.clone());return res}).catch(()=>m);return m||n})));
  }
  // Spotify y todo lo demás: sin tocar.
});

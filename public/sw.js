const CACHE='biosnap-v3';
const OFFLINE='/offline.html';
const ASSETS=['/','/index.html','/src/main.jsx','/src/App.jsx','/src/styles.css','/manifest.webmanifest',OFFLINE];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  e.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const cached=await cache.match(e.request);
    if(cached) return cached;
    try{
      const res=await fetch(e.request);
      if(res.ok && new URL(e.request.url).origin===self.location.origin){ cache.put(e.request,res.clone()); }
      return res;
    }catch{ return (await cache.match(OFFLINE))||new Response('offline'); }
  })());
});

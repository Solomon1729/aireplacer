// アプリ本体とONNX Runtimeをキャッシュして、2回目以降オフラインで起動できるようにする
const C='lmr-v1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(clients.claim()));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url),own=u.origin===location.origin;
  if(e.request.method!=='GET'||!(own||u.host==='cdn.jsdelivr.net'))return;
  e.respondWith(caches.open(C).then(async c=>{
    const hit=await c.match(e.request);
    if(hit&&!own)return hit;                       // CDNはキャッシュ優先
    try{const r=await fetch(e.request);if(r.ok)c.put(e.request,r.clone());return r}
    catch(err){if(hit)return hit;throw err}        // 自分のファイルは通常ネット優先、オフライン時はキャッシュ
  }));
});

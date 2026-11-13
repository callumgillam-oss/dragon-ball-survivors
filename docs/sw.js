// Offline cache: network-first (revalidating with the server, so an update never mixes old and new files), cache fallback when offline.
const CACHE = 'dbs-v2.6';
const FILES = ['./', './index.html', './v2.js', './art2.js', './ui2.js', './fix.js', './patch21.js', './prog.js', './w3.js', './heroes3.js', './sys3.js', './cut3.js', './w4.js', './lv3.js', './w5.js', './lv4.js', './endless.js', './dball5.js', './cut4.js', './ui4.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});

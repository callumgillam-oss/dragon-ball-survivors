// Offline cache: network-first (revalidating with the server, so an update never mixes old and new files), cache fallback when offline.
const CACHE = 'dbs-v3.0.13';
const FILES = ['./', './index.html', './v2.js', './art2.js', './ui2.js', './fix.js', './patch21.js', './prog.js', './w3.js', './heroes3.js', './sys3.js', './cut3.js', './w4.js', './lv3.js', './w5.js', './lv4.js', './endless.js', './dball5.js', './bal5.js', './cut4.js', './ui4.js', './rw5.js', './fx6.js', './ui6.js', './cut6.js', './snd6.js', './fix7.js', './v7.js', './opt8.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
// Network-first with a time limit: a stalled request falls back to the cached copy after 6 s instead of hanging the page
// (Edge report: a refresh left every script pending, so the game froze). Only good responses are cached, and the page
// itself is only ever served in place of a page, never in place of a script.
const NET_T = 6000;
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const fromCache = () => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : null)).then(r => r || Response.error());
  e.respondWith(
    Promise.race([fetch(req, { cache: 'no-cache' }), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), NET_T))])
      .then(r => { if (r && r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return r; } return fromCache().then(c => c.type === 'error' ? r : c); })
      .catch(fromCache)
  );
});

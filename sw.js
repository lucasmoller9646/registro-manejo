// Service worker: deja el app disponible sin conexión y se actualiza solo.
// La página (index.html) se pide SIEMPRE primero a la red (si no hay señal, se usa la guardada): así cada versión nueva que se sube
// a GitHub llega sola, sin desinstalar el app. El resto se sirve de la copia guardada.
const APP_VERSION = '4.4.0';
const CACHE = 'manejo-ypoti-' + APP_VERSION;
const FILES = ['./', './index.html', './manifest.webmanifest'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('message', e => { if (e.data === 'saltar') self.skipWaiting(); });
function deLaRed(req, ms) { return new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('lento')), ms); fetch(req, { cache: 'no-store' }).then(r => { clearTimeout(t); res(r); }, err => { clearTimeout(t); rej(err); }); }); }
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // mapas, satélite y servidor: siempre a la red
  if (/sw\.js$/.test(url.pathname)) return;
  const pagina = e.request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
  if (pagina) {
    e.respondWith(deLaRed(e.request, 6000).then(r => { if (r && r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); } return r; })
      .catch(() => caches.match('./index.html').then(hit => hit || caches.match(e.request, { ignoreSearch: true }))));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; })));
});

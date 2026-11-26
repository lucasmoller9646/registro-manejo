// Service worker: deja el app disponible sin conexión y se actualiza solo.
// La página (index.html) se pide SIEMPRE primero a la red (si no hay señal, se usa la guardada): así cada versión nueva que se sube
// a GitHub llega sola, sin desinstalar el app. El resto se sirve de la copia guardada.
const APP_VERSION = '4.15.8';
const CACHE = 'manejo-ypoti-' + APP_VERSION;
const FILES = ['./', './index.html', './manifest.webmanifest'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting())); });
// v4.15.6: borra solo sus propias copias viejas (en ypoti.com/apps conviven varios apps en el mismo dominio)
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k.indexOf('manejo-ypoti-') === 0).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('message', e => { if (e.data === 'saltar') self.skipWaiting(); });
function espera(ms) { return new Promise((_, rej) => setTimeout(() => rej(new Error('lento')), ms)); }
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // mapas, satélite y servidor: siempre a la red
  if (/sw\.js$/.test(url.pathname)) return;
  const pagina = e.request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
  if (pagina) {
    // v4.15.5: si la señal es lenta se muestra la copia guardada a los 6 s, pero la descarga sigue y deja guardada la versión
    // nueva (antes se cortaba y con señal débil el app quedaba en la versión vieja).
    let guardado = Promise.resolve();
    const red = fetch(e.request, { cache: 'no-store' }).then(r => { if (r && r.ok) { const copy = r.clone(); guardado = caches.open(CACHE).then(c => c.put('./index.html', copy)).catch(() => {}); } return r; });
    e.waitUntil(red.then(() => guardado, () => {}));
    e.respondWith(Promise.race([red, espera(6000)]).then(r => r && r.ok ? r : Promise.reject(new Error('http')))
      .catch(() => caches.match('./index.html').then(hit => hit || red)));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; })));
});

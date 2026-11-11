// Офлайн-кэш «Зайкина луга».
// Код игры (страница, js, css): сначала сеть, чтобы обновления приходили сразу; без сети берётся из кэша.
// Three.js, шрифты, иконки: сначала кэш, они не меняются.
// При добавлении новых файлов допишите их в CORE и увеличьте номер версии в CACHE.
const CACHE = 'zaykin-lug-v2';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './js/audio.js',
  './js/bunny.js',
  './js/core.js',
  './js/data.js',
  './js/decor-ui.js',
  './js/furniture.js',
  './js/fx.js',
  './js/main.js',
  './js/places/home.js',
  './js/places/meadow.js',
  './js/save.js',
  './js/thumbs.js',
  './js/ui.js',
  './lib/three.min.js',
  './fonts/fonts.css',
  './fonts/nunito-cyrillic-700-normal.woff2',
  './fonts/nunito-cyrillic-800-normal.woff2',
  './fonts/nunito-cyrillic-900-normal.woff2',
  './fonts/nunito-latin-700-normal.woff2',
  './fonts/nunito-latin-800-normal.woff2',
  './fonts/nunito-latin-900-normal.woff2',
  './fonts/pacifico-cyrillic-400-normal.woff2',
  './fonts/pacifico-latin-400-normal.woff2',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];
const STATIC = /\/(lib|fonts|icons)\//;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  if (STATIC.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      }))
    );
    return;
  }

  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});

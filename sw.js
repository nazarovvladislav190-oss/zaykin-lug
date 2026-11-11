// Офлайн-кэш «Зайкина луга».
// Страница игры: сначала сеть (чтобы новые версии приходили сразу), без сети — из кэша.
// Three.js, шрифты, иконки: сначала кэш (они не меняются).
// При изменении этих файлов увеличьте номер версии в CACHE.
const CACHE = 'zaykin-lug-v1';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
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
];

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
  const isPage = req.mode === 'navigate' || req.destination === 'document';

  if (isPage) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res && (res.ok || res.type === 'opaque')) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    }))
  );
});

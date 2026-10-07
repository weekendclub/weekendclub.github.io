/* 社会福祉士 国試ドリル  オフライン用 Service Worker
   同じサイト内のファイルだけをキャッシュする（外部への通信はしない）。
   ファイルを更新したら CACHE の版を上げること。 */
var CACHE = 'swdrill-v1.2.1';
var FILES = [
  './', './index.html', '../drill/style.css', '../drill/app.js', './manifest.webmanifest',
  './data/subjects.js', './data/g1.js', './data/g2.js', './data/g3.js', './data/g4.js', './data/g5.js', './data/g6.js',
  './data/s2_g1.js', './data/s2_g2.js', './data/s2_g3.js', './data/s2_g4.js', './data/s2_g5.js', './data/s2_g6.js',
  './icons/icon.svg', './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png'
];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('swdrill-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// ネットワーク優先（最新を取得）→ 失敗したらキャッシュ。オフラインでも起動できる。
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
      return res;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true }).then(function (hit) { return hit || caches.match('./index.html'); });
    })
  );
});

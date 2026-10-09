/* 心理英語ノート  オフライン用 Service Worker
   同じサイト内のファイルだけをキャッシュする（外部への通信はしない）。
   ファイルを更新したら CACHE の版を上げること。
   キャッシュ名の接頭辞は国試ドリル（swdrill-／cppdrill-）と分け、互いのキャッシュを消さないようにする。 */
var CACHE = 'psyeng-v1.1.0';
var FILES = [
  './', './index.html', './eigo.css', './app.js', '../study-link.js', '../drill/style.css', './manifest.webmanifest',
  './data/words.js', './data/grammar.js', './data/read1.js', './data/read2.js', './data/read3.js', './data/guide.js',
  './icons/icon.svg', './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png'
];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('psyeng-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
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

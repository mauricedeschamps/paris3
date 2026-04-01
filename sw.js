const CACHE_NAME = 'paris-guide-v1';
const urlsToCache = [
  '/',
  'index.html',  // 実際のHTMLファイル名に合わせてください（例: index.html）
  'manifest.json',
  'https://fonts.googleapis.com/css2?family=Segoe+UI&display=swap',

'icons/icon-192.png',
'icons/icon-512.png'

  // 必要に応じて外部画像やAPIなども追加可能
];

// インストール時：キャッシュに必要なファイルを保存
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// フェッチ時：キャッシュ優先、なければネットワーク
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // キャッシュがあればそれを返す
        if (response) {
          return response;
        }
        // なければネットワークから取得
        return fetch(event.request).then(
          networkResponse => {
            // レスポンスが有効ならキャッシュにも保存（オプション）
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
            return networkResponse;
          }
        );
      })
  );
});

// 古いキャッシュの削除
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
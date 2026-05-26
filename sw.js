const CACHE_NAME = 'focusdo-cache-v15'; // 👈 v3로 올려서 새 설정을 강제 인식시킵니다.
const urlsToCache = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];
// 서비스 워커 설치 및 리소스 캐싱
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache and storing assets');
      return cache.addAll(urlsToCache);
    })
  );
  // 대기 중인 서비스 워커를 즉시 활성화
  self.skipWaiting();
});

// 기존 구버전 캐시 삭제 정리
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 네트워크 요청 오프라인 대응 및 캐시 우선 제공
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        // 네트워크 실패 시 캐시된 index.html 반환
        return caches.match('./index.html');
      });
    })
  );
});
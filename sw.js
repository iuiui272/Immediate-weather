const ASSET_CACHE_CACHE_NAME = 'liquid-glass-weather-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './app.js',
    './sw.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(ASSET_CACHE_CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== ASSET_CACHE_CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Intercept requests for static structural layou
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then((networkResponse) => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }
                const cacheCopy = networkResponse.clone();
                caches.open(ASSET_CACHE_CACHE_NAME).then((cache) => {
                    cache.put(event.request, cacheCopy);
                });
                return networkResponse;
            });
        })
    );
    /
});
//

const CRITICAL_CACHE_IDENTITY = 'aether-weather-v1';
const HARD_MANIFEST = [
    './',
    './index.html',
    './app.js',
    './sw.js'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CRITICAL_CACHE_IDENTITY).then((c) => c.addAll(HARD_MANIFEST))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((ks) => Promise.all(ks.map((k) => {
            if (k !== CRITICAL_CACHE_IDENTITY) return caches.delete(k);
        })))
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((cached) => {
            if (cached) return cached;
            return fetch(e.request).then((res) => {
                if(!res || res.status !== 200 || res.type !== 'basic') return res;
                const activeDuplicate = res.clone();
                caches.open(CRITICAL_CACHE_IDENTITY).then((c) => c.put(e.request, activeDuplicate));
                return res;
            });
        })
    );
});

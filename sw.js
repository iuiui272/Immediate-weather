const CACHE_NAME = 'weather-v1';

self.addEventListener('install', (e) => e.waitUntil(caches.open(CACHE_NAME)));

self.addEventListener('sync', (event) => {
    if (event.tag === 'priority-weather-fetch') {
        event.waitUntil(fetch('/api/weather-severe').then(res => {
            // Logic to update IndexedDB directly from background
            console.log('Priority data synced');
        }));
    }
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then(res => res || fetch(event.request))
    );
});

/**
 * AETHER SERVICE WORKER // ADVANCED CACHING ENGINE
 * Strategy: Cache-First for assets, Stale-While-Revalidate for dynamic API data.
 */

const VERSION = 'aether-v1';
const CACHE_STATIC = 'static-assets-' + VERSION;
const CACHE_API = 'weather-api-' + VERSION;

const ASSETS_TO_PRECACHE = [
    './',
    './index.html',
    './app.js'
];

// 1. INSTALL: Precache the static shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_STATIC).then((cache) => cache.addAll(ASSETS_TO_PRECACHE))
    );
    self.skipWaiting();
});

// 2. ACTIVATE: Cleanup old versions
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_STATIC && key !== CACHE_API)
                    .map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// 3. FETCH: The Routing Engine
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Strategy A: API Requests (Stale-While-Revalidate)
    if (url.origin === 'https://api.open-meteo.com' || url.origin === 'https://geocoding-api.open-meteo.com') {
        event.respondWith(staleWhileRevalidate(event.request, CACHE_API));
    } 
    // Strategy B: Static Assets (Cache-First)
    else {
        event.respondWith(cacheFirst(event.request, CACHE_STATIC));
    }
});

// --- STRATEGY HELPERS ---

async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    // Return cache if found, else fetch from network
    return cachedResponse || fetch(request);
}

async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    // Start background network fetch
    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    });

    // Return cached immediately if available, or wait for network
    return cachedResponse || fetchPromise;
}

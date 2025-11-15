const CACHE_NAME = 'bib-cache-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './js/html5-qrcode.min.js'
];

// Installer le Service Worker 
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Cache ouvert');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Activer le Service Worker et nettoyer les anciens caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Ancien cache supprimé', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Intercepter les requêtes réseau (stratégie "Cache First")
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Si la ressource est dans le cache, la retourner
                if (response) {
                    return response;
                }
                // Sinon, essayer de la récupérer sur le réseau
                return fetch(event.request);
            })
    );
});

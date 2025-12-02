// Récupère la version depuis les paramètres de l'URL du script
const version = new URL(location).searchParams.get('v');
const CACHE_NAME = `bib-cache-${version || 'dev'}`;

// Les URLs des assets incluent maintenant la version pour le cache busting
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    `./css/style.css?v=${version}`,
    `./js/app.js?v=${version}`,
    `./js/config.js?v=${version}`,
    'https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js'
];

// Installer le Service Worker 
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Force le nouveau SW à s'activer immédiatement
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Cache ouvert pour version', version);
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
                    // Supprime tous les caches qui commencent par 'bib-cache-' mais ne sont pas le cache actuel
                    if (cacheName.startsWith('bib-cache-') && cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Ancien cache supprimé', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Prend le contrôle de la page immédiatement
    );
});

// Intercepter les requêtes réseau (stratégie "Cache First")
self.addEventListener('fetch', (event) => {
    // Ignore les requêtes non-GET et les requêtes vers le backend
    if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Si la ressource est dans le cache, la retourner
                if (response) {
                    return response;
                }
                // Sinon, essayer de la récupérer sur le réseau
                // Important : Ne pas mettre en cache les requêtes à la volée ici
                // pour éviter de cacher des ressources non versionnées.
                return fetch(event.request);
            })
    );
});

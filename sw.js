// Service Worker para caché básico
const CACHE_NAME = 'zoalum-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/catalogo-ella.html',
  '/style.css',
  '/assets/placeholder.jpg'
];

// Instalar Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activar y limpiar cachés antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Estrategia Cache First
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devuelve del caché si existe
        if (response) {
          return response;
        }
        
        // Clona la petición
        const fetchRequest = event.request.clone();
        
        // Hace la petición a la red
        return fetch(fetchRequest).then(response => {
          // Verifica que sea válida
          if(!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clona la respuesta
          const responseToCache = response.clone();
          
          // Agrega al caché
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
  );
});
const CACHE_NAME = 'chamada-consultorio-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/medico.html',
  '/paciente.html',
  '/style.css',
  '/script-medico.js',
  '/script-paciente.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
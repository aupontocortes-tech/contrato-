// Service Worker básico para PWA
const CACHE_NAME = 'contraton-v3'; // Incrementado para forçar atualização
const urlsToCache = [
  '/',
  '/dashboard',
  '/dashboard/alunos',
  '/dashboard/planos',
  '/dashboard/contratos',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  // Força a atualização imediata do service worker
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  // Estratégia Network-First: sempre busca na rede primeiro, usa cache apenas se offline
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a requisição foi bem-sucedida, atualiza o cache
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Se offline ou erro, tenta buscar no cache
        return caches.match(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  // Força a ativação imediata e limpa caches antigos
  event.waitUntil(
    Promise.all([
      self.clients.claim(), // Assume controle de todas as páginas abertas
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

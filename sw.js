const CACHE_NAME = 'fargkombinationer-v7';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/main.js',
  '/data/fargkombinationer_WCAG.json',
  '/manifest.json',
  '/favicon.ico'
];

// Funktion för att hämta bas-sökväg
function getBasePath() {
  return new URL(self.registration.scope).pathname;
}

// Installera service worker och cacha resurser
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching all assets');
        return cache.addAll(urlsToCache).catch(error => {
          console.log('Kunde inte cacha alla resurser:', error);
        });
      })
  );
});

// Hantera begäranden med cache-first strategi
self.addEventListener('fetch', event => {
  // Hämta bas-sökväg
  const basePath = getBasePath();
  
  // Skapa en ny URL med rätt bas-sökväg
  const url = new URL(event.request.url);
  const requestUrl = url.pathname.startsWith(basePath) 
    ? new Request(event.request.url.replace(url.origin + basePath, url.origin))
    : event.request;

  event.respondWith(
    caches.match(requestUrl)
      .then(response => {
        // Cache hit - returnera svaret
        if (response) {
          return response;
        }
        
        // Klona begäran eftersom den bara kan användas en gång
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Kontrollera om vi fick ett giltigt svar
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Klona svaret eftersom det bara kan användas en gång
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

// Uppdatera cache när en ny version finns
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

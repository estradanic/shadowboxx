let CACHE_NAME = "BAD_VERSION";
const self = this;

// Install SW
self.addEventListener("install", async (event) => {
  event.waitUntil(fetch("asset-manifest.json")
    .then((assetsResponse) => assetsResponse.json()
      .then((assets) => fetch("variables.json")
        .then((variablesResponse) => variablesResponse.json()
          .then((variables) => {
            console.log({variables});
            CACHE_NAME = "version-" + variables.version;
            return caches.open(CACHE_NAME)
              .then((cache) => cache.addAll(Object.values(assets.files)))
  })))));
});

// Activate the SW
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [];
  cacheWhitelist.push(CACHE_NAME);
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames.map((cacheName) => {
          if(!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      ))
  );
});

// Middleware for fetches (caching vs. online)
self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("parsefiles.back4app.com")) {
    // Respond with online only if cached doesn't exist
    event.respondWith(
      caches.open(CACHE_NAME)
        .then((cache) => cache.match(event.request)
          .then((cacheResponse) => {
            if (!cacheResponse) {
              return fetch(event.request)
                .then((networkResponse) => {
                  cache.put(event.request, networkResponse.clone());
                  return networkResponse;
                })
            } else {
              return cacheResponse;
            }
          })
        )
    );
  } else {
    // Respond with cached only if online doesn't work
    event.respondWith(
      caches.open(CACHE_NAME)
        .then((cache) => fetch(event.request)
          .then((response) => !!response ? response : cache.match(event.request))
          .catch(() => cache.match(event.request))
        )
    );
  }
});

const CACHE_NAME = "Shadowboxx";

const sw = this as unknown as ServiceWorkerGlobalScope;

// Middleware for fetches (caching vs. online)
sw.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // Don't bother managing non-http(s) requests or requests to httpbin.org,
  // which are used for determining online status
  if (
    (url.protocol !== "http:" && url.protocol !== "https:") ||
    url.host === "httpbin.org"
  ) {
    return;
  }
  if (url.host === "parsefiles.back4app.com") {
    // For images, respond with online only if cached doesn't exist
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cacheResponse) => {
          if (!cacheResponse) {
            return fetch(event.request.clone()).then((networkResponse) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          } else {
            return cacheResponse;
          }
        })
      )
    );
  } else if (event.request.method !== "GET") {
    // For non-GETs, explicitly send fetch request instead of allowing pass-through
    // to avoid Firefox's CORS problems
    event.respondWith(
      fetch(event.request).catch((e) => {
        throw new Error(`Fetch failed for request: ${event.request}`);
      })
    );
  }
});

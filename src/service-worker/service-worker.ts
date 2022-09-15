const CACHE_NAME = "Shadowboxx";

const sw = this as unknown as ServiceWorkerGlobalScope;

const frontendRoutes = [
  "/home",
  "/login",
  "/images",
  "/settings",
  "/signup",
  "/",
];

// Install SW
sw.addEventListener("install", async (event) => {
  return sw.skipWaiting();
});

// Whether to put new cache entries.
let useCache = true;

// Activate the SW
sw.addEventListener("activate", () => {
  return sw.clients.claim()
});

// Middleware for fetches (caching vs. online)
sw.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // Don't bother managing non-http requests or requests to httpbin.org,
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
              if (useCache) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            });
          } else {
            return cacheResponse;
          }
        })
      )
    );
  } else if (event.request.method === "GET") {
    // We can use the built-in service worker cache api if it's a GET request
    // Respond with cached only if online doesn't work
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        fetch(event.request)
          .then((response) => {
            if (response && useCache) {
              cache
                .put(event.request, response.clone())
                .catch((e) => console.error(e, "Request:", event.request));
            }
            if (response) {
              return response;
            }
            const cacheKey = frontendRoutes.includes(event.request.url)
              ? "/index.html"
              : event.request;
            return cache.match(cacheKey).then((cacheResponse) => {
              if (cacheResponse) {
                return cacheResponse;
              }
              throw new Error(`Fetch Failed for request: ${event.request}`);
            });
          })
          .catch((e) => {
            const cacheKey = frontendRoutes.includes(event.request.url)
              ? "/index.html"
              : event.request;
            return cache.match(cacheKey).then((cacheResponse) => {
              if (cacheResponse) {
                return cacheResponse;
              }
              throw new Error(`Fetch failed for request: ${event.request}`);
            });
          })
      )
    );
  }
});

sw.addEventListener("message", (event) => {
  if (event.data.useCache !== undefined) {
    useCache = event.data.useCache;
  }
});

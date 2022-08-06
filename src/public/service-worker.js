let CACHE_NAME = "BAD_VERSION";
const self = this;

const frontendRoutes = [
  "/home",
  "/login",
  "/images",
  "/settings",
  "/signup",
  "/",
];

// Import idb-keyval library: https://github.com/jakearchibald/idb-keyval#all-bundles
// Idb-keyval creates a IndexedDB database with simple operations such as `get` and `set`
self.importScripts('https://cdn.jsdelivr.net/npm/idb-keyval@6/dist/umd.js');

// Install SW
self.addEventListener("install", async (event) => {
  event.waitUntil(fetch("asset-manifest.json")
    .then((assetsResponse) => assetsResponse.json()
      .then((assets) => fetch("variables.json")
        .then((variablesResponse) => variablesResponse.json()
          .then((variables) => {
            CACHE_NAME = "version-" + variables.version;
            console.log("Version:", CACHE_NAME);
            return caches.open(CACHE_NAME)
              .then((cache) => {
                return cache.addAll(Object.values(assets.files));
  })})))));
});

// Whether to put new cache entries.
let useCache = true;

// Activate the SW
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [];
  cacheWhitelist.push(CACHE_NAME);
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames.map((cacheName) => {
          if(!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName)
              .then(self.clients.claim());
          }
        })
      ))
  );
});

const serializeHeaders = (headers) => {
  const serialized = {};
  for (const entry of headers.entries()) {
    serialized[entry[0]] = entry[1];
  }
  return serialized;
};

const serializeResponse = (response) => {
  const serialized = {
    headers: serializeHeaders(response.headers),
    status: response.status,
    statusText: response.statusText,
  };
  return response.clone().text().then((body) => {
    serialized.body = body;
    return Promise.resolve(serialized);
  })
};

const serializeRequest = (request) => {
  const serialized = {
    url: request.url,
    headers: serializeHeaders(request.headers),
    method: request.method,
    mode: request.mode,
    credentials: request.credentials,
    cache: request.cache,
    redirect: request.redirect,
    referrer: request.referrer,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    return request.clone().text().then((body) => {
      serialized.body = body;
      if (JSON.parse(body)._method === "PUT") {
        // This is a modifying request. We don't want to cache this.
        return null;
      }
      return JSON.stringify(serialized);
    });
  }
  return Promise.resolve(JSON.stringify(serialized));
};

const deserializeResponse = (data) => {
  return Promise.resolve(new Response(data.body, data));
};

// Middleware for fetches (caching vs. online)
self.addEventListener("fetch", (event) => {
  // Don't bother managing non-http requests or requests to httpbin.org,
  // which are used for determining online status
  if (
    !event.request.url.startsWith("http")
      || event.request.url.includes("httpbin.org")
  ) {
    return;
  }
  if (event.request.url.includes("parsefiles.back4app.com")) {
    // Respond with online only if cached doesn't exist
    event.respondWith(
      caches.open(CACHE_NAME)
        .then((cache) => cache.match(event.request)
          .then((cacheResponse) => {
            if (!cacheResponse) {
              return fetch(event.request.clone())
                .then((networkResponse) => {
                  if (useCache) {
                    cache.put(event.request, networkResponse.clone());
                  }
                  return networkResponse;
                })
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
      caches.open(CACHE_NAME)
        .then((cache) => fetch(event.request)
          .then((response) => {
            if (!!response) {
              if (useCache) {
                cache.put(event.request, response.clone())
                  .catch((e) => console.error(e, "Request:", event.request));
              }
              return response;
            }
            const cacheKey = frontendRoutes.includes(event.request.url)
              ? "/index.html" : event.request;
            return cache.match(cacheKey)
              .then((response) => {
                console.warn("Could not get network response. Returning from the cache.", e, "Request:", event.request, "Response:", response);
                return response;
              });
          })
          .catch((e) => {
            const cacheKey = frontendRoutes.includes(event.request.url) ? "/index.html" : event.request;
            return cache.match(cacheKey)
              .then((response) => {
                console.warn("Could not get network response. Returning from the cache.", e, "Request:", event.request, "Response:", response);
                return response;
              });
          })
        )
    );
  } else if (event.request.method !== "PUT") {
    // For other requests, we use idbKeyval
    // Respond with cached only if online doesn't work
    event.respondWith(
      fetch(event.request.clone())
        .then((response) => {
          if (!!response) {
            if (useCache) {
              serializeRequest(event.request)
                .then((serializedRequest) => {
                  if (serializedRequest !== null) {
                  serializeResponse(response)
                    .then((serializedResponse) => idbKeyval.set(serializedRequest, serializedResponse)
                      .catch((e) => console.warn("Could not cache response.", e, "Request:", serializedRequest, "Response:", serializedResponse)))
                  }
                });
            }
            return response.clone();
          } else {
            console.warn("Network response was empty. Returning from cache");
            return serializeRequest(event.request)
              .then((serializedRequest) => idbKeyval.get(serializedRequest)
                .then((serializedResponse) => deserializeResponse(serializedResponse)));
          }
        })
        .catch(() => serializeRequest(event.request)
          .then((serializedRequest) => idbKeyval.get(serializedRequest)
            .then((serializedResponse) => deserializeResponse(serializedResponse))))
    );
  }
});

self.addEventListener("message", (event) => {
  if (event.data.useCache !== undefined) {
    useCache = event.data.useCache;
  }
});

import { cacheNames, clientsClaim } from "workbox-core";
import {
  registerRoute,
  setCatchHandler,
  setDefaultHandler,
} from "workbox-routing";
import { NetworkFirst, NetworkOnly } from "workbox-strategies";
import type { ManifestEntry } from "workbox-build";
import { createStore, get, set } from "idb-keyval";
import {
  SHARE_TARGET_DB_NAME,
  SHARE_TARGET_STORE_NAME,
  SHARE_TARGET_STORE_KEY,
} from "./sharedExports";

declare let self: ServiceWorkerGlobalScope;

const shareTargetStore = createStore(
  SHARE_TARGET_DB_NAME,
  SHARE_TARGET_STORE_NAME
);

const manifest = (self as any).__WB_MANIFEST as Array<ManifestEntry>;

const cacheEntries: RequestInfo[] = [];

const manifestURLs = manifest.map((entry) => {
  const url = new URL(entry.url, self.location.toString());
  cacheEntries.push(
    new Request(url.href, {
      credentials: "same-origin",
    })
  );
  return url.href;
});

self.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(cacheNames.precache).then((cache) => {
      return cache.addAll(cacheEntries);
    })
  );
});

self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(cacheNames.precache).then((cache) => {
      // clean up those who are not listed in manifestURLs
      cache.keys().then((keys) => {
        keys.forEach((request) => {
          if (!manifestURLs.includes(request.url)) {
            cache.delete(request);
          }
        });
      });
    })
  );
});

self.addEventListener("message", async (event: ExtendableMessageEvent) => {
  if (event.data === SHARE_TARGET_STORE_KEY) {
    const files = await get(SHARE_TARGET_STORE_KEY, shareTargetStore);
    const channel = new BroadcastChannel(SHARE_TARGET_STORE_KEY);
    channel.postMessage(files);
  }
});

registerRoute(
  ({ url }) => manifestURLs.includes(url.href),
  new NetworkFirst({ cacheName: cacheNames.precache, networkTimeoutSeconds: 3 })
);

registerRoute(
  ({ url }) => url.host === "parsefiles.back4app.com",
  async ({ request }) => {
    const cache = await caches.open(cacheNames.runtime);
    const cacheResponse = await cache.match(request);
    if (cacheResponse) {
      return cacheResponse;
    }
    const networkResponse = await fetch(request.clone());
    cache.put(request, networkResponse.clone());
    return networkResponse;
  }
);

registerRoute(({ url }) => url.host === "httpbin.org", new NetworkOnly());

const shareTargetHandler = async ({ event }: { event: FetchEvent }) => {
  const formData = await event.request.formData();
  const files = formData.getAll("media");
  await set("sharedFiles", files, shareTargetStore);
  return Response.redirect("/share", 303);
};

registerRoute("/share_target", shareTargetHandler as any, "POST");

registerRoute(
  ({ url }) =>
    url.host !== "httpbin.org" && url.host !== "parsefiles.back4app.com",
  new NetworkFirst(),
  "GET"
);

setDefaultHandler(new NetworkOnly());

// fallback to app-shell for document request
setCatchHandler(({ event }): Promise<Response> => {
  switch ((event as any).request.destination) {
    case "document":
      return caches.match("index.html").then((r) => {
        return r ? Promise.resolve(r) : Promise.resolve(Response.error());
      });
    default:
      return Promise.resolve(Response.error());
  }
});

self.skipWaiting();
clientsClaim();
// sw.js
const CACHE_NAME = "version-2"; // bump the version when updating SW
const ASSET_CACHE = "assets-v1";
const urlsToCache = ["/", "/index.html", "/offline.html"]; // ensure leading slash for scope

// install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// activate - clean up old caches
self.addEventListener("activate", (event) => {
  const allow = new Set([CACHE_NAME, ASSET_CACHE]);
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.map((n) => {
          if (!allow.has(n)) {
            return caches.delete(n);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// helper: classify requests
const isNavigationRequest = (request) => request.mode === "navigate";
const isAssetRequest = (url) => {
  const { pathname } = new URL(url);
  return (
    pathname.startsWith("/assets/") ||
    /\.(?:js|css|png|jpg|jpeg|gif|svg|webp|ico|map|woff2?|ttf|eot)$/.test(pathname)
  );
};

// fetch
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Handle navigations (HTML pages): network-first, fallback to offline.html
  if (isNavigationRequest(request)) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          return fresh;
        } catch (err) {
          const cache = await caches.open(CACHE_NAME);
          const cached = await cache.match("/offline.html");
          return cached || new Response("Offline", { status: 503 });
        }
      })()
    );
    return;
  }

  // Handle static assets: cache-first
  if (isAssetRequest(request.url)) {
    event.respondWith(
      (async () => {
        const assetCache = await caches.open(ASSET_CACHE);
        const cached = await assetCache.match(request);
        if (cached) return cached;

        try {
          const response = await fetch(request);
          // Only cache successful (200) same-origin GET responses
          if (response.ok && request.method === "GET" && new URL(request.url).origin === self.location.origin) {
            assetCache.put(request, response.clone());
          }
          return response;
        } catch (err) {
          // Do NOT return offline.html for assets; just fail.
          return new Response("", { status: 504, statusText: "Gateway Timeout" });
        }
      })()
    );
    return;
  }

  // Other requests (e.g., APIs): network-first, fallback to cache if available
  event.respondWith(
    (async () => {
      try {
        const resp = await fetch(request);
        return resp;
      } catch {
        const cached = await caches.match(request);
        return cached || new Response("Offline", { status: 503 });
      }
    })()
  );
});
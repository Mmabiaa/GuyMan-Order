/**
 * Replacement service worker (legacy installs only).
 * Does NOT use Cache.put — avoids POST errors. Clears old caches on activate.
 * New app code does not register this; it exists so browsers can replace a broken old sw.js.
 */
self.addEventListener("install", (e) => {
  e.waitUntil(self.skipWaiting())
})

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (e) => {
  e.respondWith(fetch(e.request))
})

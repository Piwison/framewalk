/*
 * FrameWalk service worker — lean, hand-written, and honest about its limits.
 *
 * Strategy:
 *   - navigations  -> network-first, fall back to the cached app shell ("/")
 *                     then to /offline. Online users always get fresh routes;
 *                     offline users still reach Today, Diary, and Settings (all
 *                     read from IndexedDB / the bundled mission library).
 *   - static GETs  -> stale-while-revalidate (fast, self-healing on deploy).
 *
 * CACHE_VERSION is bumped on every deploy so stale caches are purged on activate
 * (the classic PWA footgun the grill flagged — handled explicitly here).
 *
 * Production upgrade path: replace this with @serwist/next for Workbox-grade
 * precaching of hashed Next assets. See docs/SKILLS-TO-IMPORT.md.
 */

const CACHE_VERSION = "framewalk-v1";
const PRECACHE = [
  "/",
  "/offline",
  "/diary",
  "/settings",
  "/manifest.webmanifest",
  "/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // never touch cross-origin

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(request, copy));
          return res;
        })
        .catch(async () =>
          (await caches.match(request)) ||
          (await caches.match("/")) ||
          (await caches.match("/offline")) ||
          new Response("Offline", { status: 503, statusText: "Offline" }),
        ),
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});

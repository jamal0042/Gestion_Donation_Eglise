/* Service worker PWA — Église de Bunia */
const VERSION = "eglise-bunia-v1";

const STATIC = [
  "/",
  "/offrande",
  "/projets",
  "/vision",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(STATIC)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Pages et API : réseau d'abord, repli cache en mode hors-ligne.
  if (request.mode === "navigate" || url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((reponse) => {
          if (request.mode === "navigate" && reponse.ok) {
            const copie = reponse.clone();
            caches.open(VERSION).then((cache) => cache.put(request, copie));
          }
          return reponse;
        })
        .catch(() =>
          caches
            .match(request, { ignoreSearch: true })
            .then((reponse) => reponse || caches.match("/")),
        ),
    );
    return;
  }

  // Actifs statiques : cache d'abord, puis réseau avec mise en cache.
  event.respondWith(
    caches.match(request).then(
      (reponse) =>
        reponse ||
        fetch(request).then((reponse) => {
          const copie = reponse.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copie));
          return reponse;
        }),
    ),
  );
});
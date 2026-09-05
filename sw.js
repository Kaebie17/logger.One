// sw.js -- offline cache for Logger.One.
//
// This app has no backend: every page is a static file and all real data
// lives in localStorage, not behind any API. So there's no cache-vs-network
// race to manage for dynamic responses -- the whole job here is "make sure
// the app shell (every page, script and stylesheet) is available with the
// network off", plus a light runtime cache for anything not in that list
// (mainly per-exercise images/videos, which aren't precached below since
// they're sparse, mostly-empty data fields rather than fixed app files).
//
// Bump CACHE_NAME whenever any precached file changes. The activate handler
// deletes any cache whose name doesn't match, so this is what actually
// pushes an update out -- browsers only re-check this script's own bytes
// for changes, they don't know when styles.css or exercisesDB.js changed
// unless this version string changes too.
const CACHE_NAME = "logger-one-v20";

const PRECACHE_URLS = [
  "index.html", "exercises.html", "exercisedetails.html", "history.html",
  "logworkout.html", "pastworkout.html", "profile.html", "settings.html",
  "stats.html", "template.html", "trends.html",

  "functions.js", "index.js", "exercises.js", "history.js", "logworkout.js",
  "pastworkout.js", "profile.js", "settings.js", "stats.js", "svgcode.js",
  "template.js", "trends.js", "savedworkouts.js", "exercisesDB.js",

  "styles.css", "manifest.json",

  "media/icons/icon180.png", "media/icons/icon192.png",
  "media/icons/icon512.png", "media/icons/icons8-excel-50.png",
];

self.addEventListener("install", (event) => {
  // NOT calling skipWaiting() here on purpose. A worker that finishes
  // installing while an older one still controls open pages goes into
  // "waiting" rather than taking over immediately -- that's what functions.js
  // watches for to show the "update available" banner. Activating instantly
  // would swap the app out from under a page mid-use with no warning.
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

// Sent by functions.js when the user taps the update banner -- only then
// does this worker take over and the old cache get cleaned up in activate.
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        // Opportunistically cache anything else same-origin that gets
        // fetched successfully (exercise images/videos, anything added to
        // the app later without a matching sw.js update) so it's available
        // offline on the NEXT visit, even though it wasn't precached.
        if (response.ok && new URL(event.request.url).origin === location.origin) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => {
        // Offline and not cached. For a page navigation specifically, fall
        // back to the cached index.html rather than a bare browser error --
        // covers the case where something requests "/" instead of the exact
        // "index.html" this cache was keyed on.
        if (event.request.mode === "navigate") return caches.match("index.html");
        return Response.error();
      });
    })
  );
});

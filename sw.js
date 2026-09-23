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
const CACHE_NAME = "logger-one-v77";

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
// GET_VERSION lets any page ask which build is actually controlling it right
// now (see the on-screen version tag in functions.js) -- a fast, visible way
// to confirm whether a given device is truly on the latest deploy instead of
// guessing from symptoms.
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
  if (event.data === "GET_VERSION") event.ports[0]?.postMessage(CACHE_NAME);
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

// The app shell (every page navigation, plus its own .html/.js/.css files)
// is NETWORK-FIRST: always try the live network when online, only falling
// back to the cache when the fetch genuinely fails (offline). Cache-first
// (the old strategy, kept below for everything else) is why normal Safari
// could keep serving old app code while Private Browsing -- which never
// carries forward an old service worker/cache state -- always saw the
// current deploy: cache-first PREFERS the cache whenever one exists,
// regardless of whether the network has something newer, so an
// already-cached device had no reason to ever check. Network-first closes
// that gap directly: a normal page load now behaves the same as Private
// Browsing's "always ask the network first" for the code that actually
// matters, while still keeping the app usable offline as a fallback, which
// remains this cache's real job.
function isAppShellRequest(request) {
  if (request.mode === "navigate") return true;
  const { pathname, origin } = new URL(request.url);
  return origin === location.origin && /\.(html|js|css)$/.test(pathname);
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (isAppShellRequest(event.request)) {
    event.respondWith(
      fetch(event.request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }).catch(() =>
        caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Offline, never cached, and (for a page navigation specifically)
          // not the exact URL this cache was keyed on -- fall back to
          // index.html rather than a bare browser error.
          if (event.request.mode === "navigate") return caches.match("index.html");
          return Response.error();
        })
      )
    );
    return;
  }

  // Everything else (icons, exercise images/videos) -- cache-first, as
  // before. These rarely change and instant-load matters more than
  // freshness here; still opportunistically cached the first time they're
  // fetched successfully so they're available offline afterward.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        if (response.ok && new URL(event.request.url).origin === location.origin) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => Response.error());
    })
  );
});

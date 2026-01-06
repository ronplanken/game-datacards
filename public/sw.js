const CACHE_VERSION = "v1";
const STATIC_CACHE = `gdc-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `gdc-runtime-${CACHE_VERSION}`;

// Assets to cache immediately on install
const PRECACHE_ASSETS = ["/mobile", "/manifest.json", "/favicon.ico", "/logo192.png", "/logo512.png"];

// Install event - cache critical resources
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("Precaching static assets...");
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log("Service Worker installed successfully");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Failed to cache assets during install:", error);
      })
  );
});

// Activate event - clean up old caches and take control
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== RUNTIME_CACHE) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim(),
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  try {
    // Strategy 1: Cache First for static assets
    if (isStaticAsset(url.pathname)) {
      return await cacheFirst(request);
    }

    // Strategy 2: Network First for pages and dynamic content
    return await networkFirst(request);
  } catch (error) {
    console.error("Request failed:", error);

    // Return offline fallback for navigation requests
    if (request.mode === "navigate") {
      return await getOfflineFallback();
    }

    // For other requests, try cache or return network error
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response("Offline", { status: 503 });
  }
}

// Cache First Strategy - for static assets
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

// Network First Strategy - for pages and dynamic content
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Helper function to identify static assets
function isStaticAsset(pathname) {
  return (
    pathname.startsWith("/static/") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".woff") ||
    pathname.endsWith(".woff2") ||
    pathname.endsWith(".ttf")
  );
}

// Offline fallback page
async function getOfflineFallback() {
  const cache = await caches.open(STATIC_CACHE);
  const cachedMobile = await cache.match("/mobile");

  if (cachedMobile) {
    return cachedMobile;
  }

  // Create a basic offline page if none exists
  return new Response(
    `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Offline - Game Datacards</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: #001529;
            color: #fff;
            text-align: center;
            padding: 20px;
          }
          .container { max-width: 400px; }
          h1 { color: #1890ff; margin-bottom: 16px; }
          button {
            background: #1890ff;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 16px;
            font-size: 16px;
          }
          button:active { background: #096dd9; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>You're Offline</h1>
          <p>It looks like you're not connected to the internet.</p>
          <p>Your previously viewed datacards should still be accessible once you're back online.</p>
          <button onclick="window.location.reload()">Try Again</button>
        </div>
      </body>
    </html>
  `,
    {
      headers: { "Content-Type": "text/html" },
    }
  );
}

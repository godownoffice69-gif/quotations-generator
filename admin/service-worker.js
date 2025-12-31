/**
 * Service Worker for Order Management System PWA
 * Handles offline caching, background sync, and push notifications
 */

const CACHE_VERSION = 'oms-v1.1.0';
const CACHE_NAME = `oms-cache-${CACHE_VERSION}`;

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/admin/index.html',
  '/admin/manifest.json',
  '/admin/firepowersfx.png',
  '/admin/js/utils/helpers.js',
  '/admin/js/utils/firebase-config.js',
  '/admin/icons/icon-192x192.png',
  '/admin/icons/icon-512x512.png',
  '/admin/icons/icon-144x144.png',
  '/admin/icons/icon-72x72.png',
  '/admin/icons/icon-96x96.png',
  '/admin/icons/icon-128x128.png',
  '/admin/icons/icon-152x152.png',
  '/admin/icons/icon-384x384.png'
];

// Dynamic cache for feature modules (loaded on demand)
const DYNAMIC_CACHE = 'oms-dynamic-v1';

// CDN resources (external libraries)
const CDN_CACHE = 'oms-cdn-v1';

// Firebase URLs (don't cache these)
const FIREBASE_URLS = [
  'firestore.googleapis.com',
  'firebase.googleapis.com',
  'firebasestorage.googleapis.com',
  'securetoken.googleapis.com'
];

/**
 * Install Event - Cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

/**
 * Activate Event - Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME &&
                cacheName !== DYNAMIC_CACHE &&
                cacheName !== CDN_CACHE) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation complete');
        return self.clients.claim(); // Take control immediately
      })
  );
});

/**
 * Fetch Event - Network-first strategy with cache fallback
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Don't cache Firebase requests
  if (FIREBASE_URLS.some(domain => url.hostname.includes(domain))) {
    return; // Let Firebase requests go through normally
  }

  // Don't cache POST/PUT/DELETE requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different request types
  if (url.pathname.includes('/admin/js/features/')) {
    // Feature modules - cache dynamically
    event.respondWith(cacheFirstStrategy(request, DYNAMIC_CACHE));
  } else if (url.origin.includes('cdnjs.cloudflare.com') ||
             url.origin.includes('cdn.jsdelivr.net') ||
             url.origin.includes('fonts.googleapis.com')) {
    // CDN resources - cache-first strategy
    event.respondWith(cacheFirstStrategy(request, CDN_CACHE));
  } else if (url.pathname.includes('/admin/')) {
    // App resources - network-first strategy
    event.respondWith(networkFirstStrategy(request, CACHE_NAME));
  }
});

/**
 * Network-first strategy: Try network, fallback to cache
 */
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      console.log('[Service Worker] Serving from cache:', request.url);
      return cachedResponse;
    }

    // No cache available
    return new Response('Offline - Resource not available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}

/**
 * Cache-first strategy: Try cache, fallback to network
 */
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    console.log('[Service Worker] Serving from cache:', request.url);
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);
    return new Response('Offline - Resource not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

/**
 * Background Sync - Handle failed requests
 */
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);

  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  } else if (event.tag === 'sync-data') {
    event.waitUntil(syncAllData());
  }
});

/**
 * Sync orders to Firestore
 */
async function syncOrders() {
  console.log('[Service Worker] Syncing orders...');
  // This will be triggered when connection is restored
  // The app will handle actual Firestore sync
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'SYNC_ORDERS',
      message: 'Background sync triggered'
    });
  });
}

/**
 * Sync all data to Firestore
 */
async function syncAllData() {
  console.log('[Service Worker] Syncing all data...');
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'SYNC_ALL_DATA',
      message: 'Full sync triggered'
    });
  });
}

/**
 * Push Notification Handler
 * This will be used for Firebase Cloud Messaging
 */
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');

  let notificationData = {
    title: 'Order Management System',
    body: 'You have a new notification',
    icon: '/admin/icons/icon-192x192.png',
    badge: '/admin/icons/icon-96x96.png',
    tag: 'oms-notification',
    requireInteraction: false,
    vibrate: [200, 100, 200]
  };

  // Parse push data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data,
        data: data // Store original data for click handling
      };
    } catch (error) {
      console.error('[Service Worker] Error parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

/**
 * Notification Click Handler
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.notification.tag);

  event.notification.close();

  // Extract action data
  const data = event.notification.data || {};
  const url = data.url || '/admin/index.html';

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes('/admin/') && 'focus' in client) {
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              data: data
            });
            return client.focus();
          }
        }

        // Open new window if app not open
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

/**
 * Message Handler - Communication with main app
 */
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'CACHE_URLS') {
    // Cache specific URLs on demand
    const urls = event.data.urls || [];
    event.waitUntil(
      caches.open(DYNAMIC_CACHE).then(cache => cache.addAll(urls))
    );
  } else if (event.data.type === 'CLEAR_CACHE') {
    // Clear all caches
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});

/**
 * Periodic Background Sync (if supported)
 */
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    console.log('[Service Worker] Periodic sync:', event.tag);

    if (event.tag === 'sync-data-hourly') {
      event.waitUntil(syncAllData());
    }
  });
}

console.log('[Service Worker] Loaded successfully');

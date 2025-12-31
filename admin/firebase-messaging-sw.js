// Firebase Cloud Messaging Service Worker
// This handles push notifications when app is in background

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Firebase configuration (same as in your app)
firebase.initializeApp({
  apiKey: "AIzaSyC5c2BmVHnbWlBwwHtFwll97nq_xOdqxCc",
  authDomain: "firepowersfx-2558.firebaseapp.com",
  projectId: "firepowersfx-2558",
  storageBucket: "firepowersfx-2558.firebasestorage.app",
  messagingSenderId: "723483292867",
  appId: "1:723483292867:web:MTg2MATAwZWYtOGI4NGzL1TikMjctY"
});

const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM Background] Message received:', payload);

  const notificationTitle = payload.notification?.title || 'Order Management System';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new update',
    icon: '/admin/icons/icon-192x192.png',
    badge: '/admin/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    tag: payload.data?.orderId || 'oms-notification',
    data: payload.data || {},
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Open',
        icon: '/admin/icons/icon-72x72.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[FCM Background] Notification clicked:', event);

  event.notification.close();

  if (event.action === 'open') {
    const urlToOpen = event.notification.data?.url || '/admin/index.html';
    const tab = event.notification.data?.tab || null;

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if app is already open
          for (const client of clientList) {
            if (client.url.includes('/admin/') && 'focus' in client) {
              // Send message to open specific tab
              if (tab) {
                client.postMessage({
                  type: 'NOTIFICATION_CLICK',
                  tab: tab,
                  data: event.notification.data
                });
              }
              return client.focus();
            }
          }
          // Open new window if app not open
          if (clients.openWindow) {
            let url = urlToOpen;
            if (tab) {
              url += `?tab=${tab}`;
            }
            return clients.openWindow(url);
          }
        })
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    console.log('[FCM Background] Notification dismissed');
  }
});

console.log('[FCM Background] Service Worker loaded successfully');

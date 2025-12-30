# 🔔 Firebase Cloud Messaging Setup Guide

Based on your Firebase Console screenshot, here's exactly what you need to do:

## ✅ What You Already Have

From your screenshot, I can see:
- ✅ **Firebase Cloud Messaging API (V1)** - **Enabled** ✓
- ✅ **Sender ID:** `723483292867`
- ✅ **Service Account:** Available

---

## 🔑 Step 1: Get Your VAPID Key (Web Push Certificate)

In the **same page** you showed in the screenshot:

1. **Scroll down** to the **"Web Push certificates"** section (visible at bottom of your screenshot)

2. You'll see one of these:

   **If you see "Generate key pair" button:**
   ```
   ┌─────────────────────────────────┐
   │  Web Push certificates          │
   │                                 │
   │  [ Generate key pair ]          │
   └─────────────────────────────────┘
   ```
   - Click **"Generate key pair"**
   - A **public key** (VAPID key) will appear
   - **Copy it** - looks like: `BKxyz...abc123` (long string)

   **OR if you already have a key pair:**
   ```
   ┌─────────────────────────────────┐
   │  Web Push certificates          │
   │                                 │
   │  Key pair                       │
   │  BKxyz...abc123                 │  ← This is your VAPID key!
   │                                 │
   └─────────────────────────────────┘
   ```
   - Just **copy the key shown**

3. **Save this key** - you'll need it for Step 2!

---

## 📝 Step 2: Create Firebase Messaging Service Worker

Create `/admin/firebase-messaging-sw.js` (in your admin folder):

```javascript
// Firebase Cloud Messaging Service Worker
// This handles push notifications when app is in background

importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Your Firebase configuration (same as in your app)
// Copy from /admin/js/utils/firebase-config.js
firebase.initializeApp({
  apiKey: "AIzaSyC5c2BmVHnbWlBwwHtFwll97nq_xOdqxCc",  // Your existing API key
  authDomain: "firepowersfx-2558.firebaseapp.com",
  projectId: "firepowersfx-2558",
  storageBucket: "firepowersfx-2558.firebasestorage.app",
  messagingSenderId: "723483292867",  // From your screenshot!
  appId: "1:723483292867:web:MTg2MATAwZWYtOGI4NGzL1TikMjctY"
});

const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new update',
    icon: '/admin/icons/icon-192x192.png',
    badge: '/admin/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    tag: payload.data?.orderId || 'oms-notification',
    data: payload.data || {},
    actions: [
      {
        action: 'open',
        title: 'Open',
        icon: '/admin/icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Dismiss'
      }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);

  event.notification.close();

  if (event.action === 'open') {
    const urlToOpen = event.notification.data?.url || '/admin/index.html';
    event.waitUntil(clients.openWindow(urlToOpen));
  }
});

console.log('[firebase-messaging-sw.js] Service Worker loaded for FCM');
```

---

## 💻 Step 3: Create Notifications Service Module

Create `/admin/js/services/notifications.js`:

```javascript
/**
 * Push Notifications Service using Firebase Cloud Messaging
 */

export const NotificationService = {
  messaging: null,

  /**
   * Initialize Firebase Messaging
   */
  async init() {
    if (!firebase || !firebase.messaging) {
      console.error('❌ Firebase Messaging not available');
      return false;
    }

    try {
      this.messaging = firebase.messaging();
      console.log('✅ Notification service initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize messaging:', error);
      return false;
    }
  },

  /**
   * Request notification permission from user
   */
  async requestPermission() {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      return true;
    } else if (permission === 'denied') {
      console.warn('⚠️ Notification permission denied');
      return false;
    } else {
      console.log('ℹ️ Notification permission dismissed');
      return false;
    }
  },

  /**
   * Get FCM token for this device
   * IMPORTANT: Replace YOUR_VAPID_KEY with the key from Step 1!
   */
  async getToken() {
    if (!this.messaging) {
      await this.init();
    }

    try {
      const token = await this.messaging.getToken({
        vapidKey: 'YOUR_VAPID_KEY_FROM_STEP_1'  // ← PASTE YOUR KEY HERE!
        // Example: 'BKxyz...abc123' (the long key from Firebase Console)
      });

      if (token) {
        console.log('✅ FCM Token obtained:', token);
        return token;
      } else {
        console.warn('⚠️ No registration token available');
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
      return null;
    }
  },

  /**
   * Subscribe user to push notifications
   */
  async subscribe(oms) {
    // Request permission
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      alert('Please enable notifications in your browser settings');
      return false;
    }

    // Get FCM token
    const token = await this.getToken();
    if (!token) {
      alert('Failed to get notification token. Please try again.');
      return false;
    }

    // Save token to user's Firestore document
    try {
      const user = firebase.auth().currentUser;
      if (user) {
        await firebase.firestore().collection('users').doc(user.uid).set({
          fcmToken: token,
          notificationsEnabled: true,
          notificationPreferences: {
            orderChanges: true,
            lowStock: true,
            newOrders: true,
            payments: true
          },
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log('✅ FCM token saved to Firestore');

        if (oms && typeof oms.showToast === 'function') {
          oms.showToast('✅ Notifications enabled successfully!');
        }

        return true;
      }
    } catch (error) {
      console.error('❌ Error saving FCM token:', error);
      return false;
    }
  },

  /**
   * Listen for foreground messages
   */
  setupForegroundListener(oms) {
    if (!this.messaging) return;

    this.messaging.onMessage((payload) => {
      console.log('📨 Foreground message received:', payload);

      const title = payload.notification?.title || 'New Notification';
      const body = payload.notification?.body || '';

      // Show toast notification in app
      if (oms && typeof oms.showToast === 'function') {
        oms.showToast(`${title}: ${body}`);
      }

      // Also show browser notification
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body: body,
          icon: '/admin/icons/icon-192x192.png',
          badge: '/admin/icons/icon-96x96.png',
          tag: payload.data?.orderId || 'oms-notification',
          data: payload.data
        });
      }
    });
  },

  /**
   * Trigger notification for order status change
   */
  async notifyOrderStatusChange(order, oldStatus, newStatus) {
    // This will be called from your order update code
    // The actual notification sending happens via Cloud Function
    console.log(`📢 Order ${order.orderId} status changed: ${oldStatus} → ${newStatus}`);

    // Save notification trigger to Firestore
    // Your Cloud Function will listen and send the actual notification
    try {
      await firebase.firestore().collection('notification_triggers').add({
        type: 'order_status_change',
        orderId: order.orderId,
        oldStatus: oldStatus,
        newStatus: newStatus,
        clientName: order.clientName,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error triggering notification:', error);
    }
  },

  /**
   * Trigger low stock notification
   */
  async notifyLowStock(item) {
    try {
      await firebase.firestore().collection('notification_triggers').add({
        type: 'low_stock',
        itemName: item.name,
        quantity: item.quantity,
        threshold: item.lowStockThreshold || 5,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error triggering low stock notification:', error);
    }
  }
};

// Make globally available
if (typeof window !== 'undefined') {
  window.NotificationService = NotificationService;
}
```

---

## 🔗 Step 4: Integrate into Your App

Update `/admin/index.html` to import and initialize notifications:

Add after the Service Worker registration:

```javascript
// After line ~17584 (after service worker registration)

// Import and initialize Notification Service
import { NotificationService } from './js/services/notifications.js';

// Initialize when OMS is ready
window.addEventListener('OMSReady', async () => {
  console.log('🔔 Initializing push notifications...');

  // Initialize notification service
  await NotificationService.init();

  // Setup foreground message listener
  NotificationService.setupForegroundListener(window.OMS);

  // Check if user already subscribed
  const user = firebase.auth().currentUser;
  if (user) {
    const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
    if (userDoc.exists && userDoc.data().notificationsEnabled) {
      console.log('✅ User already subscribed to notifications');
    } else {
      // Show notification permission prompt after 5 seconds
      setTimeout(() => {
        if (confirm('Enable push notifications to get updates about orders, stock, and payments?')) {
          NotificationService.subscribe(window.OMS);
        }
      }, 5000);
    }
  }
});
```

---

## 🎯 Step 5: Add Notification Triggers

Update your order update function:

```javascript
// In your order status update code
async updateOrderStatus(orderId, newStatus) {
  const order = this.data.orders.find(o => o.orderId === orderId);
  const oldStatus = order.status;

  // Update order
  order.status = newStatus;
  await this.updateOrderInFirebase(order);

  // Trigger notification
  if (window.NotificationService) {
    await NotificationService.notifyOrderStatusChange(order, oldStatus, newStatus);
  }
}

// For low stock alerts
checkAndNotifyLowStock(item) {
  const threshold = this.data.settings?.lowStockThreshold || 5;
  if (item.quantity <= threshold) {
    if (window.NotificationService) {
      NotificationService.notifyLowStock(item);
    }
  }
}
```

---

## ⚙️ Step 6: Add Settings UI

Add to your Settings tab:

```html
<div class="settings-section">
  <h3>🔔 Push Notifications</h3>

  <div id="notificationStatus" style="padding: 1rem; background: #f0f0f0; border-radius: 8px; margin-bottom: 1rem;">
    <strong>Status:</strong> <span id="notifStatusText">Not enabled</span>
  </div>

  <button onclick="NotificationService.subscribe(window.OMS)" class="btn btn-primary">
    🔔 Enable Push Notifications
  </button>

  <div style="margin-top: 1.5rem;">
    <h4>Notification Types:</h4>
    <label style="display: block; margin: 0.5rem 0;">
      <input type="checkbox" id="notifyOrderChanges" checked> Order Status Changes
    </label>
    <label style="display: block; margin: 0.5rem 0;">
      <input type="checkbox" id="notifyLowStock" checked> Low Stock Alerts
    </label>
    <label style="display: block; margin: 0.5rem 0;">
      <input type="checkbox" id="notifyNewOrders" checked> New Orders
    </label>
    <label style="display: block; margin: 0.5rem 0;">
      <input type="checkbox" id="notifyPayments" checked> Payment Received
    </label>
  </div>
</div>
```

---

## 🧪 Testing Your Setup

### **Test 1: Check Browser Console**
1. Open your app
2. Press F12 → Console
3. Look for:
   ```
   ✅ Notification service initialized
   ✅ FCM Token obtained: eXaMpLe...
   ✅ FCM token saved to Firestore
   ```

### **Test 2: Send Test Notification**

Use Firebase Console:
1. Go to **Cloud Messaging** in left menu
2. Click **"Send your first message"**
3. Enter:
   - **Notification title:** "Test Order Update"
   - **Notification text:** "Order FP001 status changed to Completed"
4. Click **"Send test message"**
5. Paste your FCM token
6. Click **"Test"**

You should see a notification! 🎉

### **Test 3: In-App Notification**
1. Update an order status
2. Check console for: `📢 Order status changed`
3. Check Firestore → `notification_triggers` collection for new entry

---

## 🚀 Quick Start Checklist

- [ ] **Step 1:** Copy VAPID key from Firebase Console
- [ ] **Step 2:** Create `firebase-messaging-sw.js`
- [ ] **Step 3:** Create `notifications.js` module (paste VAPID key!)
- [ ] **Step 4:** Import in index.html
- [ ] **Step 5:** Add notification triggers to order updates
- [ ] **Step 6:** Add Settings UI
- [ ] **Test:** Send test notification from Firebase Console

---

## 📝 Summary

**You have:**
- ✅ Sender ID: `723483292867`
- ✅ FCM API (V1) enabled
- ⏳ VAPID key (get from Web Push certificates section)

**You need:**
1. Copy VAPID key (5 seconds)
2. Create 2 files (5 minutes - just copy/paste from this guide!)
3. Test notifications (2 minutes)

**Total time: ~10 minutes** ⏱️

---

## 🆘 Troubleshooting

**"Messaging is not defined"**
- Make sure `firebase-messaging-sw.js` is in `/admin/` folder
- Check browser console for Firebase loading errors

**"Permission denied"**
- User clicked "Block" on notification permission
- Reset in browser: Settings → Site Settings → Notifications → Allow

**"No token received"**
- Check VAPID key is correctly pasted in `notifications.js`
- Verify Web Push certificate exists in Firebase Console

**Notifications not showing:**
- Check browser notification permissions
- Test with Firebase Console "Send test message"
- Check `notification_triggers` collection in Firestore

---

Good luck! Your push notifications will be working in ~10 minutes! 🎉

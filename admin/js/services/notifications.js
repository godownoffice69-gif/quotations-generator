/**
 * Push Notifications Service using Firebase Cloud Messaging
 * Handles notification permissions, FCM tokens, and sending notifications
 */

export const NotificationService = {
  messaging: null,
  isInitialized: false,

  /**
   * Initialize Firebase Messaging
   */
  async init() {
    if (this.isInitialized) {
      return true;
    }

    if (!window.firebase || !firebase.messaging) {
      console.error('❌ Firebase Messaging not available');
      return false;
    }

    try {
      // CRITICAL: Register the Firebase Messaging Service Worker first
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/admin/firebase-messaging-sw.js', {
            scope: '/admin/'
          });
          console.log('✅ Firebase Messaging Service Worker registered:', registration.scope);

          // Wait for service worker to be active
          if (registration.installing) {
            await new Promise((resolve) => {
              registration.installing.addEventListener('statechange', (e) => {
                if (e.target.state === 'activated') {
                  resolve();
                }
              });
            });
          }

          // Initialize Firebase Messaging with the registered service worker
          this.messaging = firebase.messaging();
          this.messaging.useServiceWorker(registration);
        } catch (swError) {
          console.error('❌ Service Worker registration failed:', swError);
          // Try without explicit registration (Firebase will auto-register)
          this.messaging = firebase.messaging();
        }
      } else {
        this.messaging = firebase.messaging();
      }

      this.isInitialized = true;
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
   *
   * ⚠️ IMPORTANT: YOU NEED TO ADD YOUR VAPID KEY ON LINE 100!
   *
   * Get your VAPID key from Firebase Console:
   * 1. Go to Project Settings → Cloud Messaging
   * 2. Scroll down to "Web Push certificates"
   * 3. Click "Generate key pair" if you don't have one
   * 4. Copy the key (starts with "BK..." or "B...")
   * 5. Paste it on line 100 below (replace 'YOUR_VAPID_KEY_HERE')
   */
  async getToken() {
    if (!this.messaging) {
      await this.init();
    }

    try {
      const vapidKey = 'YOUR_VAPID_KEY_HERE';  // ← LINE 100: PASTE YOUR VAPID KEY HERE!
      // Example: 'BKxyz...abc123' (long string from Firebase Console)

      // Check if user actually added the VAPID key
      if (vapidKey === 'YOUR_VAPID_KEY_HERE') {
        console.error('❌ VAPID KEY NOT ADDED!');
        console.error('📝 You must add your VAPID key on line 100 of notifications.js');
        console.error('🔑 Get it from: Firebase Console → Project Settings → Cloud Messaging → Web Push certificates');
        alert('❌ VAPID KEY MISSING!\n\nYou need to add your Firebase VAPID key in notifications.js (line 100).\n\nGet it from:\nFirebase Console → Project Settings → Cloud Messaging → Web Push certificates');
        return null;
      }

      const token = await this.messaging.getToken({
        vapidKey: vapidKey
      });

      if (token) {
        console.log('✅ FCM Token obtained:', token.substring(0, 20) + '...');
        return token;
      } else {
        console.warn('⚠️ No registration token available');
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
      console.error('💡 Common fixes:');
      console.error('   1. Add your VAPID key on line 100');
      console.error('   2. Make sure service worker is registered');
      console.error('   3. Check internet connection');
      console.error('   4. Try refreshing the page');
      return null;
    }
  },

  /**
   * Subscribe user to push notifications
   */
  async subscribe(oms) {
    // Initialize if not already done
    if (!this.isInitialized) {
      const initialized = await this.init();
      if (!initialized) {
        alert('❌ Failed to initialize notifications. Please refresh the page.');
        return false;
      }
    }

    // Request permission
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      alert('⚠️ Please enable notifications in your browser settings to receive updates.');
      return false;
    }

    // Get FCM token
    const token = await this.getToken();
    if (!token) {
      alert('❌ Failed to get notification token. Please check:\n1. You added your VAPID key in notifications.js (line 60)\n2. You have internet connection\n3. Try refreshing the page');
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
            payments: true,
            teamUpdates: true
          },
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
          },
          lastTokenUpdate: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log('✅ FCM token saved to Firestore');

        if (oms && typeof oms.showToast === 'function') {
          oms.showToast('✅ Push notifications enabled successfully!');
        }

        // Update UI
        this.updateNotificationUI('enabled');

        return true;
      } else {
        console.error('❌ No user logged in');
        alert('Please log in first to enable notifications.');
        return false;
      }
    } catch (error) {
      console.error('❌ Error saving FCM token:', error);
      alert('❌ Failed to save notification settings. Error: ' + error.message);
      return false;
    }
  },

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(oms) {
    try {
      const user = firebase.auth().currentUser;
      if (user) {
        await firebase.firestore().collection('users').doc(user.uid).update({
          notificationsEnabled: false,
          fcmToken: firebase.firestore.FieldValue.delete()
        });

        console.log('✅ Unsubscribed from notifications');

        if (oms && typeof oms.showToast === 'function') {
          oms.showToast('Notifications disabled');
        }

        // Update UI
        this.updateNotificationUI('disabled');

        return true;
      }
    } catch (error) {
      console.error('❌ Error unsubscribing:', error);
      return false;
    }
  },

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences, oms) {
    try {
      const user = firebase.auth().currentUser;
      if (user) {
        await firebase.firestore().collection('users').doc(user.uid).update({
          notificationPreferences: preferences
        });

        console.log('✅ Notification preferences updated');

        if (oms && typeof oms.showToast === 'function') {
          oms.showToast('Notification preferences saved');
        }

        return true;
      }
    } catch (error) {
      console.error('❌ Error updating preferences:', error);
      return false;
    }
  },

  /**
   * Listen for foreground messages (when app is open)
   */
  setupForegroundListener(oms) {
    if (!this.messaging) {
      console.warn('⚠️ Messaging not initialized, skipping foreground listener');
      return;
    }

    this.messaging.onMessage((payload) => {
      console.log('📨 Foreground message received:', payload);

      const title = payload.notification?.title || 'Order Management System';
      const body = payload.notification?.body || 'You have a new update';
      const data = payload.data || {};

      // Show in-app toast notification
      if (oms && typeof oms.showToast === 'function') {
        oms.showToast(`${title}: ${body}`, 'info');
      }

      // Also show browser notification
      if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body: body,
          icon: '/admin/icons/icon-192x192.png',
          badge: '/admin/icons/icon-96x96.png',
          tag: data.orderId || 'oms-notification',
          data: data,
          vibrate: [200, 100, 200],
          requireInteraction: false
        });

        // Handle notification click
        notification.onclick = () => {
          window.focus();
          notification.close();

          // Navigate to specific tab if provided
          if (data.tab && oms && typeof oms.switchTab === 'function') {
            oms.switchTab(data.tab);
          }
        };
      }
    });

    console.log('✅ Foreground notification listener set up');
  },

  /**
   * Update notification UI status
   */
  updateNotificationUI(status) {
    const statusElement = document.getElementById('notifStatusText');
    const enableBtn = document.getElementById('enableNotificationsBtn');
    const disableBtn = document.getElementById('disableNotificationsBtn');

    if (statusElement) {
      if (status === 'enabled') {
        statusElement.textContent = '✅ Enabled';
        statusElement.style.color = '#4caf50';
      } else {
        statusElement.textContent = '❌ Disabled';
        statusElement.style.color = '#f44336';
      }
    }

    if (enableBtn && disableBtn) {
      if (status === 'enabled') {
        enableBtn.style.display = 'none';
        disableBtn.style.display = 'inline-block';
      } else {
        enableBtn.style.display = 'inline-block';
        disableBtn.style.display = 'none';
      }
    }
  },

  /**
   * Check current notification status
   */
  async checkStatus() {
    try {
      const user = firebase.auth().currentUser;
      if (user) {
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          const data = userDoc.data();
          const isEnabled = data.notificationsEnabled === true;
          this.updateNotificationUI(isEnabled ? 'enabled' : 'disabled');
          return isEnabled;
        }
      }
    } catch (error) {
      console.error('Error checking notification status:', error);
    }
    return false;
  },

  /**
   * Trigger notification for order status change
   * This saves a trigger in Firestore that your Cloud Function will process
   */
  async notifyOrderStatusChange(order, oldStatus, newStatus) {
    try {
      console.log(`📢 Triggering notification: Order ${order.orderId} ${oldStatus} → ${newStatus}`);

      // Save notification trigger to Firestore
      // Your Cloud Function will listen to this collection and send actual notifications
      await firebase.firestore().collection('notification_triggers').add({
        type: 'order_status_change',
        orderId: order.orderId,
        clientName: order.clientName,
        oldStatus: oldStatus,
        newStatus: newStatus,
        venue: order.venue || '',
        date: order.date || order.startDate || '',
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        processed: false
      });

      console.log('✅ Order status change notification triggered');
    } catch (error) {
      console.error('❌ Error triggering notification:', error);
    }
  },

  /**
   * Trigger low stock notification
   */
  async notifyLowStock(item, currentQuantity, threshold) {
    try {
      console.log(`📢 Triggering low stock notification: ${item.name} (${currentQuantity} left)`);

      await firebase.firestore().collection('notification_triggers').add({
        type: 'low_stock',
        itemId: item.id || item.name,
        itemName: item.name,
        quantity: currentQuantity,
        threshold: threshold,
        category: item.category || 'Unknown',
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        processed: false
      });

      console.log('✅ Low stock notification triggered');
    } catch (error) {
      console.error('❌ Error triggering low stock notification:', error);
    }
  },

  /**
   * Trigger new order notification
   */
  async notifyNewOrder(order) {
    try {
      console.log(`📢 Triggering new order notification: ${order.orderId}`);

      await firebase.firestore().collection('notification_triggers').add({
        type: 'new_order',
        orderId: order.orderId,
        clientName: order.clientName,
        venue: order.venue || '',
        date: order.date || order.startDate || '',
        status: order.status || 'Pending',
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        processed: false
      });

      console.log('✅ New order notification triggered');
    } catch (error) {
      console.error('❌ Error triggering new order notification:', error);
    }
  },

  /**
   * Trigger payment received notification
   */
  async notifyPaymentReceived(orderId, amount, paymentMethod) {
    try {
      console.log(`📢 Triggering payment notification: ₹${amount} for ${orderId}`);

      await firebase.firestore().collection('notification_triggers').add({
        type: 'payment_received',
        orderId: orderId,
        amount: amount,
        paymentMethod: paymentMethod || 'Cash',
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        processed: false
      });

      console.log('✅ Payment received notification triggered');
    } catch (error) {
      console.error('❌ Error triggering payment notification:', error);
    }
  }
};

// Make globally available
if (typeof window !== 'undefined') {
  window.NotificationService = NotificationService;
}

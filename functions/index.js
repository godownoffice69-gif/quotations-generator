/**
 * Firebase Cloud Functions for Push Notifications
 *
 * This function listens to the notification_triggers collection
 * and sends push notifications to subscribed users
 */

const {onDocumentCreated} = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Send push notification when a notification trigger is created
 * Triggers on: /notification_triggers/{triggerId}
 */
exports.sendPushNotification = onDocumentCreated('notification_triggers/{triggerId}', async (event) => {
  const trigger = event.data.data();
  const triggerId = event.params.triggerId;

  console.log('📢 Notification trigger created:', triggerId, trigger);

  try {
    // Get all users with FCM tokens
    const usersSnapshot = await admin.firestore()
      .collection('users')
      .where('notificationsEnabled', '==', true)
      .where('fcmToken', '!=', null)
      .get();

    if (usersSnapshot.empty) {
      console.log('⚠️ No users with FCM tokens found');
      return;
    }

    console.log(`📱 Found ${usersSnapshot.size} users with notifications enabled`);

    // Build notification based on trigger type
    let notification = {};
    let data = {};

    switch (trigger.type) {
      case 'order_status_change':
        notification = {
          title: '📦 Order Status Updated',
          body: `Order ${trigger.orderId} for ${trigger.clientName} changed from ${trigger.oldStatus} to ${trigger.newStatus}`
        };
        data = {
          orderId: trigger.orderId || '',
          type: 'order_status_change',
          tab: 'history',
          url: '/admin/index.html?tab=history'
        };
        break;

      case 'new_order':
        notification = {
          title: '🆕 New Order Created',
          body: `New order ${trigger.orderId} for ${trigger.clientName} - ${trigger.eventType || 'Event'}`
        };
        data = {
          orderId: trigger.orderId || '',
          type: 'new_order',
          tab: 'history',
          url: '/admin/index.html?tab=history'
        };
        break;

      case 'low_stock':
        notification = {
          title: '📉 Low Stock Alert',
          body: `${trigger.itemName} is running low (${trigger.quantity} left, threshold: ${trigger.threshold})`
        };
        data = {
          itemName: trigger.itemName || '',
          type: 'low_stock',
          tab: 'inventory',
          url: '/admin/index.html?tab=inventory'
        };
        break;

      case 'payment_received':
        notification = {
          title: '💰 Payment Received',
          body: `Payment of ₹${trigger.amount} received from ${trigger.clientName}`
        };
        data = {
          orderId: trigger.orderId || '',
          amount: String(trigger.amount || 0),
          type: 'payment_received',
          tab: 'financials',
          url: '/admin/index.html?tab=financials'
        };
        break;

      default:
        notification = {
          title: '🔔 Order Management System',
          body: trigger.message || 'You have a new notification'
        };
        data = {
          type: trigger.type || 'general',
          tab: 'orders',
          url: '/admin/index.html'
        };
    }

    // Send notification to each user
    const tokens = [];
    const userPreferences = {};

    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      if (userData.fcmToken) {
        tokens.push(userData.fcmToken);
        userPreferences[userData.fcmToken] = userData.notificationPreferences || {};
      }
    });

    if (tokens.length === 0) {
      console.log('⚠️ No valid FCM tokens found');
      return;
    }

    // Filter tokens based on user preferences
    const filteredTokens = tokens.filter(token => {
      const prefs = userPreferences[token];

      // Check if user has this notification type enabled
      switch (trigger.type) {
        case 'order_status_change':
          return prefs.orderChanges !== false;
        case 'new_order':
          return prefs.newOrders !== false;
        case 'low_stock':
          return prefs.lowStock !== false;
        case 'payment_received':
          return prefs.payments !== false;
        default:
          return true;
      }
    });

    if (filteredTokens.length === 0) {
      console.log('⚠️ No users have this notification type enabled');
      return;
    }

    console.log(`📤 Sending notification to ${filteredTokens.length} devices...`);

    // Send multicast message
    const message = {
      notification: notification,
      data: data,
      tokens: filteredTokens,
      webpush: {
        notification: {
          icon: '/admin/icons/icon-192x192.png',
          badge: '/admin/icons/icon-96x96.png',
          requireInteraction: false,
          vibrate: [200, 100, 200],
          tag: trigger.orderId || 'oms-notification',
          actions: [
            {
              action: 'open',
              title: 'Open'
            },
            {
              action: 'dismiss',
              title: 'Dismiss'
            }
          ]
        },
        fcmOptions: {
          link: data.url
        }
      }
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    console.log('✅ Notifications sent successfully:');
    console.log(`   - Success: ${response.successCount}`);
    console.log(`   - Failed: ${response.failureCount}`);

    // Remove invalid tokens
    if (response.failureCount > 0) {
      const tokensToRemove = [];

      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`❌ Failed to send to token ${idx}:`, resp.error);

          // Remove invalid tokens
          if (resp.error.code === 'messaging/invalid-registration-token' ||
              resp.error.code === 'messaging/registration-token-not-registered') {
            tokensToRemove.push(filteredTokens[idx]);
          }
        }
      });

      // Clean up invalid tokens from Firestore
      if (tokensToRemove.length > 0) {
        console.log(`🧹 Cleaning up ${tokensToRemove.length} invalid tokens...`);

        const batch = admin.firestore().batch();

        for (const token of tokensToRemove) {
          const userQuery = await admin.firestore()
            .collection('users')
            .where('fcmToken', '==', token)
            .limit(1)
            .get();

          if (!userQuery.empty) {
            const userDoc = userQuery.docs[0];
            batch.update(userDoc.ref, {
              fcmToken: admin.firestore.FieldValue.delete(),
              notificationsEnabled: false
            });
          }
        }

        await batch.commit();
        console.log('✅ Invalid tokens cleaned up');
      }
    }

    // Delete the trigger after processing (optional - keeps collection clean)
    await admin.firestore()
      .collection('notification_triggers')
      .doc(triggerId)
      .delete();

    console.log('🧹 Trigger deleted after processing');

    return {
      success: true,
      sentCount: response.successCount,
      failedCount: response.failureCount
    };

  } catch (error) {
    console.error('❌ Error sending push notification:', error);
    throw error;
  }
});

/**
 * Clean up old notification triggers (runs daily)
 * Deletes triggers older than 24 hours
 */
exports.cleanupOldTriggers = require('firebase-functions').pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const oldTriggersSnapshot = await admin.firestore()
      .collection('notification_triggers')
      .where('timestamp', '<', oneDayAgo)
      .get();

    if (oldTriggersSnapshot.empty) {
      console.log('No old triggers to clean up');
      return null;
    }

    console.log(`Cleaning up ${oldTriggersSnapshot.size} old triggers...`);

    const batch = admin.firestore().batch();
    oldTriggersSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`✅ Cleaned up ${oldTriggersSnapshot.size} old triggers`);

    return null;
  });

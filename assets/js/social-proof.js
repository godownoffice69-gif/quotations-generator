/**
 * Social Proof Notifications - Website Integration
 *
 * Displays "John from Mumbai just booked 2 tables" style notifications
 * to build trust and create urgency
 */

(function() {
    'use strict';

    // State
    let notifications = [];
    let currentIndex = 0;
    let displayTimer = null;
    let loopTimer = null;

    /**
     * Initialize social proof notifications
     */
    async function init() {
        console.log('👥 Initializing social proof notifications...');

        // Load active notifications from Firestore
        await loadNotifications();

        if (notifications.length === 0) {
            console.log('📭 No active notifications found');
            return;
        }

        console.log(`✅ Loaded ${notifications.length} active notification(s)`);

        // Start showing notifications after initial delay
        const firstNotification = notifications[0];
        const initialDelay = (firstNotification.initialDelay || 5) * 1000;

        console.log(`⏳ Waiting ${initialDelay/1000}s before showing first notification...`);

        setTimeout(() => {
            showNextNotification();
        }, initialDelay);
    }

    /**
     * Load active notifications from Firestore
     */
    async function loadNotifications() {
        try {
            const { collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            const db = window.db;
            if (!db) {
                console.warn('⚠️ DB not available');
                return;
            }

            const q = query(
                collection(db, 'social_proof_notifications'),
                where('status', '==', 'active')
            );

            const snapshot = await getDocs(q);

            notifications = [];
            snapshot.forEach(doc => {
                notifications.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            console.log('✅ Loaded notifications:', notifications.map(n => n.title).join(', '));

        } catch (error) {
            console.error('❌ Error loading notifications:', error);
        }
    }

    /**
     * Show next notification in sequence
     */
    function showNextNotification() {
        if (notifications.length === 0) return;

        const notification = notifications[currentIndex];

        console.log(`📢 Showing notification: ${notification.title}`);
        displayNotification(notification);

        // Track view
        trackAnalytics(notification.id, 'view');

        // Advance to next notification
        currentIndex = (currentIndex + 1) % notifications.length;

        // Schedule next notification if looping is enabled
        if (notification.loopNotifications) {
            const delayBetween = (notification.delayBetween || 10) * 1000;
            loopTimer = setTimeout(() => {
                showNextNotification();
            }, delayBetween);
        }
    }

    /**
     * Display notification on screen
     */
    function displayNotification(notification) {
        // Create notification element
        const notifEl = document.createElement('div');
        notifEl.className = 'social-proof-notification';
        notifEl.dataset.notificationId = notification.id;

        // Position class
        const positionClass = notification.position || 'bottom-left';
        notifEl.classList.add(`position-${positionClass}`);

        // Build HTML
        let imageHTML = '';
        if (notification.showImage && notification.imageUrl) {
            imageHTML = `<img src="${escapeHtml(notification.imageUrl)}" alt="${escapeHtml(notification.customerName)}" class="notification-avatar">`;
        } else {
            // Default avatar icon based on type
            const typeEmojis = {
                booking: '📅',
                quotation: '📝',
                purchase: '🛒',
                signup: '✅',
                custom: '💬'
            };
            imageHTML = `<div class="notification-icon">${typeEmojis[notification.type] || '💬'}</div>`;
        }

        notifEl.innerHTML = `
            ${imageHTML}
            <div class="notification-content">
                <div class="notification-text">
                    <strong>${escapeHtml(notification.customerName)}</strong> from <strong>${escapeHtml(notification.location)}</strong><br>
                    ${escapeHtml(notification.message)}
                </div>
                <div class="notification-time">Just now</div>
            </div>
            <button class="notification-close" aria-label="Close">&times;</button>
        `;

        // Add click handler for link (if provided)
        if (notification.link) {
            notifEl.style.cursor = 'pointer';
            notifEl.addEventListener('click', (e) => {
                if (!e.target.classList.contains('notification-close')) {
                    trackAnalytics(notification.id, 'click');
                    window.open(notification.link, '_blank');
                }
            });
        }

        // Close button handler
        const closeBtn = notifEl.querySelector('.notification-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            hideNotification(notifEl);
        });

        // Append to body
        document.body.appendChild(notifEl);

        // Trigger fade-in animation
        setTimeout(() => {
            notifEl.classList.add('show');
        }, 100);

        // Auto-hide after display duration
        const displayDuration = (notification.displayDuration || 5) * 1000;
        displayTimer = setTimeout(() => {
            hideNotification(notifEl);
        }, displayDuration);
    }

    /**
     * Hide and remove notification
     */
    function hideNotification(notifEl) {
        notifEl.classList.remove('show');

        setTimeout(() => {
            if (notifEl.parentNode) {
                notifEl.remove();
            }
        }, 400); // Match CSS transition duration
    }

    /**
     * Track analytics (views, clicks)
     */
    async function trackAnalytics(notificationId, eventType) {
        try {
            const { doc, updateDoc, increment } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            const db = window.db;
            if (!db) return;

            const notifRef = doc(db, 'social_proof_notifications', notificationId);

            if (eventType === 'view') {
                await updateDoc(notifRef, {
                    'analytics.views': increment(1)
                });
                console.log('✅ View tracked');
            } else if (eventType === 'click') {
                await updateDoc(notifRef, {
                    'analytics.clicks': increment(1)
                });
                console.log('✅ Click tracked');
            }
        } catch (error) {
            console.error('❌ Error tracking analytics:', error);
        }
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Inject CSS styles
     */
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .social-proof-notification {
                position: fixed;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
                padding: 1rem;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                min-width: 300px;
                max-width: 400px;
                z-index: 9999;
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                border: 1px solid rgba(0, 0, 0, 0.08);
            }

            .social-proof-notification.show {
                opacity: 1;
                transform: translateY(0);
            }

            /* Positions */
            .social-proof-notification.position-bottom-left {
                bottom: 2rem;
                left: 2rem;
            }

            .social-proof-notification.position-bottom-right {
                bottom: 2rem;
                right: 2rem;
            }

            .social-proof-notification.position-top-left {
                top: 2rem;
                left: 2rem;
            }

            .social-proof-notification.position-top-right {
                top: 2rem;
                right: 2rem;
            }

            .notification-avatar {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                object-fit: cover;
                flex-shrink: 0;
            }

            .notification-icon {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                flex-shrink: 0;
            }

            .notification-content {
                flex: 1;
                min-width: 0;
            }

            .notification-text {
                font-size: 0.9rem;
                line-height: 1.4;
                color: #333;
                margin-bottom: 0.25rem;
            }

            .notification-time {
                font-size: 0.75rem;
                color: #999;
            }

            .notification-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                color: #999;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s;
                flex-shrink: 0;
            }

            .notification-close:hover {
                background: rgba(0, 0, 0, 0.05);
                color: #333;
            }

            /* Mobile responsive */
            @media (max-width: 768px) {
                .social-proof-notification {
                    min-width: calc(100vw - 2rem);
                    max-width: calc(100vw - 2rem);
                    left: 1rem !important;
                    right: 1rem !important;
                }

                .social-proof-notification.position-top-left,
                .social-proof-notification.position-top-right {
                    top: 1rem;
                }

                .social-proof-notification.position-bottom-left,
                .social-proof-notification.position-bottom-right {
                    bottom: 1rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injectStyles();
            init();
        });
    } else {
        injectStyles();
        init();
    }

    // Expose API for manual control (if needed)
    window.SocialProof = {
        reload: init,
        stop: () => {
            clearTimeout(displayTimer);
            clearTimeout(loopTimer);
            document.querySelectorAll('.social-proof-notification').forEach(el => el.remove());
        }
    };

})();

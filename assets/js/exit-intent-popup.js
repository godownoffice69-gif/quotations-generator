/**
 * Exit Intent Popups - Website Integration
 *
 * Detects when visitors are about to leave and displays targeted popups
 * with special offers to capture them before they go.
 *
 * Features:
 * - Exit intent detection (mouse leaving viewport)
 * - Countdown timer support
 * - Page-specific targeting
 * - Scheduling support
 * - Analytics tracking (views, conversions, dismissals)
 * - Mobile-responsive design
 * - One popup per session (cookie-based)
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        cookieName: 'exitPopupShown',
        cookieDays: 7, // Don't show again for 7 days
        exitThreshold: 10, // Mouse must be within 10px of top
        mobileEnabled: true // Show on mobile (on scroll up instead of mouse exit)
    };

    // State
    let popups = [];
    let currentPopup = null;
    let exitIntentListenerAdded = false;
    let hasShownPopup = false;

    /**
     * Initialize exit intent popups
     */
    async function init() {
        // Check if popup was already shown in this session
        if (getCookie(CONFIG.cookieName)) {
            console.log('Exit popup already shown in this session');
            return;
        }

        // Load popups from Firebase
        await loadPopups();

        // Setup exit intent detection after delay
        if (popups.length > 0) {
            const firstPopup = popups[0];
            const delay = (firstPopup.delay || 0) * 1000;

            setTimeout(() => {
                setupExitIntent();
            }, delay);
        }
    }

    /**
     * Load active popups from Firestore
     */
    async function loadPopups() {
        try {
            // Import Firestore functions
            const { collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            // Get current page type
            const currentPage = getCurrentPage();

            // Query Firestore for active popups using modular SDK
            const db = window.db;
            const popupsRef = collection(db, 'exit_intent_popups');
            const q = query(popupsRef, where('status', '==', 'active'));
            const snapshot = await getDocs(q);

            const now = new Date();

            popups = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(popup => {
                    // Check if popup is scheduled
                    if (popup.schedule && popup.schedule.startDate && popup.schedule.endDate) {
                        const start = new Date(popup.schedule.startDate);
                        const end = new Date(popup.schedule.endDate);
                        end.setHours(23, 59, 59); // End of day

                        if (now < start || now > end) {
                            return false; // Outside schedule
                        }
                    }

                    // Check page targeting
                    if (popup.pages && popup.pages.length > 0) {
                        if (!popup.pages.includes('all') && !popup.pages.includes(currentPage)) {
                            return false; // Wrong page
                        }
                    }

                    return true;
                });

            console.log(`✅ Loaded ${popups.length} eligible exit intent popup(s)`);
        } catch (error) {
            console.error('❌ Error loading exit intent popups:', error);
            popups = [];
        }
    }

    /**
     * Get current page type
     */
    function getCurrentPage() {
        const path = window.location.pathname;

        if (path === '/' || path === '/index.html') {
            return 'homepage';
        } else if (path.includes('quotation')) {
            return 'quotation';
        }

        return 'other';
    }

    /**
     * Setup exit intent detection
     */
    function setupExitIntent() {
        if (exitIntentListenerAdded) return;

        // Desktop: Mouse leaving viewport
        if (!isMobile()) {
            // Use mousemove to detect when cursor goes to top (more reliable than mouseout)
            document.addEventListener('mousemove', handleMouseMove);
            console.log('✅ Desktop exit intent enabled (mouse move to top)');
        } else if (CONFIG.mobileEnabled) {
            // Mobile: Scroll up detection (alternative for mobile)
            let lastScrollY = window.scrollY;
            let scrollUpCount = 0;

            window.addEventListener('scroll', () => {
                const currentScrollY = window.scrollY;

                if (currentScrollY < lastScrollY) {
                    scrollUpCount++;
                    // Trigger after user scrolls up 3 times
                    if (scrollUpCount >= 3 && !hasShownPopup) {
                        showPopup();
                    }
                } else {
                    scrollUpCount = 0; // Reset if scrolling down
                }

                lastScrollY = currentScrollY;
            });
            console.log('✅ Mobile exit intent enabled (scroll up detection)');
        }

        exitIntentListenerAdded = true;
    }

    /**
     * Handle mouse movement (desktop exit detection)
     */
    function handleMouseMove(e) {
        // Check if mouse is in the top 50px of viewport (about to leave)
        if (e.clientY <= 50 && !hasShownPopup) {
            // Remove listener after triggering once
            document.removeEventListener('mousemove', handleMouseMove);
            console.log('🎯 Exit intent detected! (mouse at top)');
            showPopup();
        }
    }

    /**
     * Handle mouse leaving viewport (backup method)
     */
    function handleMouseOut(e) {
        // Check if mouse is leaving through the top of the viewport
        if (e.clientY < CONFIG.exitThreshold && !hasShownPopup) {
            showPopup();
        }
    }

    /**
     * Show the popup
     */
    function showPopup() {
        if (hasShownPopup || popups.length === 0) return;

        hasShownPopup = true;
        currentPopup = popups[0]; // Show first eligible popup

        // Track view
        trackAnalytics('view');

        // Build and display popup
        renderPopup();

        // Set cookie to prevent showing again
        setCookie(CONFIG.cookieName, 'true', CONFIG.cookieDays);
    }

    /**
     * Render popup HTML
     */
    function renderPopup() {
        const popup = currentPopup;

        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'exitPopupOverlay';
        overlay.className = 'exit-popup-overlay';

        // Build countdown HTML
        let countdownHTML = '';
        if (popup.countdown && popup.countdown.enabled) {
            const duration = popup.countdown.durationMinutes;
            countdownHTML = `
                <div class="exit-popup-countdown">
                    <div class="countdown-timer" data-duration="${duration}">
                        <span class="countdown-minutes">00</span>:<span class="countdown-seconds">00</span>
                    </div>
                    <div class="countdown-label">Offer expires in:</div>
                </div>
            `;
        }

        // Build popup HTML
        overlay.innerHTML = `
            <div class="exit-popup-modal" style="background-color: ${popup.backgroundColor}; ${popup.backgroundImage ? `background-image: url('${popup.backgroundImage}'); background-size: cover; background-position: center;` : ''}">
                <button class="exit-popup-close" onclick="window.ExitPopup.close(false)">&times;</button>

                <div class="exit-popup-content">
                    <h2 class="exit-popup-title">${escapeHtml(popup.title)}</h2>
                    <p class="exit-popup-discount">${escapeHtml(popup.discountText)}</p>

                    ${popup.description ? `<p class="exit-popup-description">${escapeHtml(popup.description)}</p>` : ''}

                    ${countdownHTML}

                    <button class="exit-popup-cta"
                            style="background-color: ${popup.buttonColor}; color: ${popup.buttonTextColor};"
                            onclick="window.ExitPopup.close(true)">
                        ${escapeHtml(popup.buttonText)}
                    </button>

                    <p class="exit-popup-dismiss">
                        <a href="#" onclick="window.ExitPopup.close(false); return false;">No thanks, I'll leave</a>
                    </p>
                </div>
            </div>

            <style>
                .exit-popup-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 999999;
                    animation: fadeIn 0.3s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .exit-popup-modal {
                    position: relative;
                    max-width: 600px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                    border-radius: 16px;
                    padding: 3rem 2rem;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
                    animation: slideUp 0.4s ease;
                }

                @keyframes slideUp {
                    from {
                        transform: translateY(50px) scale(0.9);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                }

                .exit-popup-close {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: rgba(0, 0, 0, 0.3);
                    border: none;
                    color: white;
                    font-size: 2rem;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    line-height: 1;
                    transition: all 0.3s;
                }

                .exit-popup-close:hover {
                    background: rgba(0, 0, 0, 0.5);
                    transform: rotate(90deg);
                }

                .exit-popup-content {
                    position: relative;
                    z-index: 1;
                }

                .exit-popup-title {
                    font-size: 2rem;
                    font-weight: 700;
                    margin: 0 0 1rem;
                    line-height: 1.2;
                }

                .exit-popup-discount {
                    font-size: 1.3rem;
                    font-weight: 600;
                    margin: 0 0 1rem;
                    color: #f59e0b;
                }

                .exit-popup-description {
                    font-size: 1rem;
                    margin: 0 0 1.5rem;
                    opacity: 0.9;
                }

                .exit-popup-countdown {
                    margin: 1.5rem 0;
                }

                .countdown-timer {
                    font-size: 3rem;
                    font-weight: 700;
                    color: #ef4444;
                    margin-bottom: 0.5rem;
                    font-family: 'Courier New', monospace;
                }

                .countdown-label {
                    font-size: 0.9rem;
                    opacity: 0.8;
                }

                .exit-popup-cta {
                    display: inline-block;
                    padding: 1rem 2.5rem;
                    font-size: 1.2rem;
                    font-weight: 600;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    text-decoration: none;
                }

                .exit-popup-cta:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0,0,0,0.3);
                }

                .exit-popup-dismiss {
                    margin-top: 1.5rem;
                    font-size: 0.9rem;
                }

                .exit-popup-dismiss a {
                    color: inherit;
                    opacity: 0.7;
                    text-decoration: underline;
                }

                .exit-popup-dismiss a:hover {
                    opacity: 1;
                }

                /* Mobile responsive */
                @media (max-width: 768px) {
                    .exit-popup-modal {
                        padding: 2rem 1.5rem;
                    }

                    .exit-popup-title {
                        font-size: 1.5rem;
                    }

                    .exit-popup-discount {
                        font-size: 1.1rem;
                    }

                    .countdown-timer {
                        font-size: 2rem;
                    }

                    .exit-popup-cta {
                        padding: 0.8rem 2rem;
                        font-size: 1rem;
                    }
                }
            </style>
        `;

        document.body.appendChild(overlay);

        // Start countdown if enabled
        if (popup.countdown && popup.countdown.enabled) {
            startCountdown(popup.countdown.durationMinutes);
        }

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    /**
     * Start countdown timer
     */
    function startCountdown(minutes) {
        const timerElement = document.querySelector('.countdown-timer');
        if (!timerElement) return;

        let totalSeconds = minutes * 60;

        const interval = setInterval(() => {
            totalSeconds--;

            if (totalSeconds <= 0) {
                clearInterval(interval);
                // Auto-close popup when timer expires
                close(false);
                return;
            }

            const mins = Math.floor(totalSeconds / 60);
            const secs = totalSeconds % 60;

            const minutesEl = timerElement.querySelector('.countdown-minutes');
            const secondsEl = timerElement.querySelector('.countdown-seconds');

            if (minutesEl) minutesEl.textContent = String(mins).padStart(2, '0');
            if (secondsEl) secondsEl.textContent = String(secs).padStart(2, '0');

            // Add urgency color when < 1 minute
            if (totalSeconds < 60) {
                timerElement.style.color = '#ef4444';
                timerElement.style.animation = 'pulse 1s infinite';
            }
        }, 1000);
    }

    /**
     * Close popup
     * @param {boolean} converted - Whether user clicked CTA (converted) or dismissed
     */
    function close(converted) {
        const overlay = document.getElementById('exitPopupOverlay');
        if (overlay) {
            overlay.remove();
        }

        // Re-enable body scroll
        document.body.style.overflow = '';

        // Track analytics
        if (converted) {
            trackAnalytics('conversion');

            // Save popup offer details to localStorage for quotation tracking
            if (currentPopup) {
                const popupOffer = {
                    popupId: currentPopup.id,
                    popupTitle: currentPopup.title,
                    discountText: currentPopup.discountText,
                    description: currentPopup.description,
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem('activePopupOffer', JSON.stringify(popupOffer));
                console.log('💾 Popup offer saved for quotation tracking:', popupOffer);
            }

            // Redirect to quotation page
            window.location.href = '/quotation.html';
        } else {
            trackAnalytics('dismissal');
        }
    }

    /**
     * Track analytics
     */
    async function trackAnalytics(eventType) {
        if (!currentPopup) {
            console.warn('⚠️ Cannot track analytics: No popup active');
            return;
        }

        console.log(`📊 Attempting to track ${eventType} for popup ID: ${currentPopup.id}`);

        try {
            // Import Firestore functions
            const { doc, updateDoc, increment } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            const db = window.db;
            if (!db) {
                console.error('❌ Firebase DB not available for analytics tracking');
                return;
            }

            const popupRef = doc(db, 'exit_intent_popups', currentPopup.id);

            if (eventType === 'view') {
                await updateDoc(popupRef, {
                    'analytics.views': increment(1)
                });
                console.log(`✅ View tracked successfully for: ${currentPopup.title}`);
            } else if (eventType === 'conversion') {
                await updateDoc(popupRef, {
                    'analytics.conversions': increment(1)
                });
                console.log(`✅ Conversion tracked successfully for: ${currentPopup.title}`);

                // Also track in Google Analytics if available
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'exit_popup_conversion', {
                        'event_category': 'Exit Popup',
                        'event_label': currentPopup.title
                    });
                }
            } else if (eventType === 'dismissal') {
                await updateDoc(popupRef, {
                    'analytics.dismissals': increment(1)
                });
                console.log(`✅ Dismissal tracked successfully for: ${currentPopup.title}`);
            }
        } catch (error) {
            console.error('❌ Error tracking exit popup analytics:', error);
            console.error('Error details:', {
                eventType,
                popupId: currentPopup?.id,
                popupTitle: currentPopup?.title,
                errorMessage: error.message
            });
        }
    }

    /**
     * Check if device is mobile
     */
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth < 768;
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     * Set cookie
     */
    function setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    }

    /**
     * Get cookie
     */
    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    // Public API
    window.ExitPopup = {
        close,
        init
    };

    /**
     * Wait for Firebase to be ready
     */
    function waitForFirebase() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds max

            const checkFirebase = () => {
                attempts++;

                // Check for Firebase DB (window.firebaseDB is set in index.html)
                if (window.firebaseDB) {
                    console.log('✅ Firebase DB ready for exit popups');
                    resolve(window.firebaseDB);
                } else if (attempts >= maxAttempts) {
                    console.warn('⚠️ Firebase DB not found - exit popups disabled');
                    reject(new Error('Firebase DB not available'));
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            checkFirebase();
        });
    }

    // Auto-initialize when Firebase is ready
    (async function() {
        try {
            const db = await waitForFirebase();
            window.db = db; // Set window.db for compatibility
            await init();
        } catch (error) {
            console.warn('Exit popups disabled:', error.message);
        }
    })();

})();

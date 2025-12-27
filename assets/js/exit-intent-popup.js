/**
 * Exit Intent Popups - Website Integration (Option 3: Simple but Effective)
 *
 * Enhanced with:
 * - Exit intent (mouse to top 50px)
 * - Scroll depth tracking (70% desktop, 75% mobile)
 * - Quotation creation check
 * - 20-second minimum time on page
 * - 24-hour frequency capping (localStorage)
 * - Device-specific logic
 * - Smart messaging based on trigger type
 * - Background click to close
 * - "Don't show again" checkbox
 * - Mobile-optimized bottom sheet style
 * - Fade-in animation
 * - Analytics tracking
 */

(function() {
    'use strict';

    // Configuration - Will be loaded from Firestore
    let CONFIG = {
        localStorage: {
            popupShownKey: 'exitPopupLastShown',
            dontShowAgainKey: 'exitPopupDontShow',
            quotationCreatedKey: 'quotationCreated'
        },
        timeOnPage: 20000, // Default: 20 seconds minimum
        scrollDepth: {
            desktop: 0.70, // Default: 70% for desktop
            mobile: 0.75  // Default: 75% for mobile
        },
        exitThreshold: 50, // Default: Top 50px for exit intent
        frequencyCap: {
            session: true,           // Default: Once per session
            hours: 24,              // Default: 24 hours between shows
            dontShowDays: 7         // Default: 7 days if "Don't show again" clicked
        },
        smartMessages: {
            exitIntent: {
                title: "Wait! Before you go...",
                subtitle: "Get your free quote in 2 minutes!"
            },
            scrollDepth: {
                title: "Interested in our services?",
                subtitle: "Create a custom quotation now!"
            },
            timeBased: {
                title: "Still browsing?",
                subtitle: "Let us help you find the perfect package!"
            }
        },
        triggersEnabled: {
            exitIntent: true,
            scrollDepth: true,
            checkQuotationCreated: true
        },
        styling: {
            animationDuration: 400,
            backdropBlur: 4,
            mobileBottomSheet: true,
            backgroundClickClose: true
        }
        cookieName: 'exitPopupShown',
        cookieDays: 0.04, // Don't show again for ~1 hour (0.04 days = 1 hour)
        exitThreshold: 150, // Mouse must be within 150px of top (easier to trigger)
        mobileEnabled: true // Show on mobile (on scroll up instead of mouse exit)
    };

    // State
    let popups = [];
    let currentPopup = null;
    let triggerType = null; // 'exit-intent' or 'scroll-depth' or 'time-based'
    let hasShownPopup = false;
    let pageLoadTime = Date.now();
    let highestScrollDepth = 0;
    let listenersActive = false;

    /**
     * Load configuration from Firestore
     */
    async function loadSettings() {
        try {
            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const db = window.db;

            if (!db) {
                console.warn('⚠️ DB not available, using default settings');
                return;
            }

            const settingsDoc = await getDoc(doc(db, 'popup_settings', 'config'));

            if (settingsDoc.exists()) {
                const settings = settingsDoc.data();
                console.log('✅ Loaded popup settings from Firestore');

                // Merge with CONFIG (keep localStorage keys unchanged)
                CONFIG = {
                    ...CONFIG,
                    timeOnPage: settings.timeOnPage || CONFIG.timeOnPage,
                    scrollDepth: settings.scrollDepth || CONFIG.scrollDepth,
                    exitThreshold: settings.exitThreshold || CONFIG.exitThreshold,
                    frequencyCap: {
                        ...CONFIG.frequencyCap,
                        ...settings.frequencyCap
                    },
                    smartMessages: settings.smartMessages || CONFIG.smartMessages,
                    triggersEnabled: settings.triggersEnabled || CONFIG.triggersEnabled,
                    styling: settings.styling || CONFIG.styling
                };

                console.log('📊 Settings:', {
                    scrollDepth: CONFIG.scrollDepth,
                    timeOnPage: CONFIG.timeOnPage / 1000 + 's',
                    triggers: CONFIG.triggersEnabled
                });
            } else {
                console.log('📝 No custom settings found, using defaults');
            }
        } catch (error) {
            console.warn('⚠️ Error loading settings, using defaults:', error.message);
        }
    }

    /**
     * Initialize exit intent popups
     */
    async function init() {
        console.log('🎯 Initializing smart exit popup system...');

        // Load settings from Firestore first
        await loadSettings();

        // Check if user clicked "Don't show again"
        if (checkDontShowAgain()) {
            console.log('⏭️ User opted out - popup disabled');
            return;
        }

        // Check frequency cap
        if (!checkFrequencyCap()) {
            console.log('⏱️ Frequency cap active - popup shown recently');
            return;
        }

        // Check if quotation check is enabled and user has created a quotation
        if (CONFIG.triggersEnabled.checkQuotationCreated && hasCreatedQuotation()) {
            console.log('✅ User already created quotation - no need to show popup');
        console.log('🚀 Initializing exit intent popups...');
        console.log('📱 Device type:', isMobile() ? 'Mobile' : 'Desktop');

        // Check if popup was already shown in this session
        const cookieExists = getCookie(CONFIG.cookieName);
        console.log('🍪 Cookie check:', cookieExists ? 'Found (popup already shown)' : 'Not found (can show popup)');

        if (cookieExists) {
            console.log('⏸️ Exit popup already shown in this session - skipping');
            return;
        }

        // Load popups from Firebase
        await loadPopups();

        if (popups.length === 0) {
            console.log('📭 No eligible popups found');
            return;
        }

        // Wait for minimum time on page before becoming eligible
        setTimeout(() => {
            console.log(`⏰ Time on page requirement met (${CONFIG.timeOnPage/1000}s) - popup now eligible`);
            setupTriggers();
        }, CONFIG.timeOnPage);
    }

    /**
     * Check if "Don't show again" was clicked
     */
    function checkDontShowAgain() {
        const dontShowUntil = localStorage.getItem(CONFIG.localStorage.dontShowAgainKey);
        if (!dontShowUntil) return false;

        const expiryDate = new Date(dontShowUntil);
        const now = new Date();

        if (now < expiryDate) {
            return true; // Still in "don't show" period
        } else {
            // Expired, clear it
            localStorage.removeItem(CONFIG.localStorage.dontShowAgainKey);
            return false;
            console.log(`⏱️ Setting up exit intent with ${delay / 1000}s delay...`);
            setTimeout(() => {
                setupExitIntent();
            }, delay);
        } else {
            console.log('❌ No eligible popups found');
        }
    }

    /**
     * Check 24-hour frequency cap
     */
    function checkFrequencyCap() {
        const lastShown = localStorage.getItem(CONFIG.localStorage.popupShownKey);
        if (!lastShown) return true; // Never shown before

        const lastShownDate = new Date(lastShown);
        const now = new Date();
        const hoursSinceLastShown = (now - lastShownDate) / (1000 * 60 * 60);

        return hoursSinceLastShown >= CONFIG.frequencyCap.hours;
    }

    /**
     * Check if user has created a quotation
     */
    function hasCreatedQuotation() {
        // Check localStorage for quotation creation flag
        const quotationCreated = localStorage.getItem(CONFIG.localStorage.quotationCreatedKey);
        return quotationCreated === 'true';
    }

    /**
     * Load active popups from Firestore
     */
    async function loadPopups() {
        try {
            const { collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            const currentPage = getCurrentPage();
            const db = window.db;
            const popupsRef = collection(db, 'exit_intent_popups');
            const q = query(popupsRef, where('status', '==', 'active'));
            const snapshot = await getDocs(q);

            const now = new Date();

            popups = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(popup => {
                    // Check schedule
                    if (popup.schedule && popup.schedule.startDate && popup.schedule.endDate) {
                        const start = new Date(popup.schedule.startDate);
                        const end = new Date(popup.schedule.endDate);
                        end.setHours(23, 59, 59);

                        if (now < start || now > end) {
                            return false;
                        }
                    }

                    // Check page targeting
                    if (popup.pages && popup.pages.length > 0) {
                        if (!popup.pages.includes('all') && !popup.pages.includes(currentPage)) {
                            return false;
                        }
                    }

                    return true;
                });

            console.log(`✅ Loaded ${popups.length} eligible popup(s)`);
        } catch (error) {
            console.error('❌ Error loading popups:', error);
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
     * Setup all popup triggers
     */
    function setupTriggers() {
        if (listenersActive) return;

        const isMobileDevice = isMobile();
        const activeTriggersLog = [];

        if (!isMobileDevice) {
            // Desktop triggers
            console.log('🖥️ Desktop triggers:');

            // Exit intent (if enabled)
            if (CONFIG.triggersEnabled.exitIntent) {
                document.addEventListener('mousemove', handleMouseMove);
                activeTriggersLog.push(`  ✓ Exit intent (mouse to top ${CONFIG.exitThreshold}px)`);
            } else {
                activeTriggersLog.push(`  ✗ Exit intent (disabled)`);
            }

            // Scroll depth (if enabled)
            if (CONFIG.triggersEnabled.scrollDepth) {
                window.addEventListener('scroll', handleScrollDepth);
                activeTriggersLog.push(`  ✓ Scroll depth (${CONFIG.scrollDepth.desktop * 100}%)`);
            } else {
                activeTriggersLog.push(`  ✗ Scroll depth (disabled)`);
            }
        } else {
            // Mobile triggers
            console.log('📱 Mobile triggers:');

            // Scroll depth only (no exit intent on mobile)
            if (CONFIG.triggersEnabled.scrollDepth) {
                window.addEventListener('scroll', handleScrollDepth);
                activeTriggersLog.push(`  ✓ Scroll depth (${CONFIG.scrollDepth.mobile * 100}%)`);
            } else {
                activeTriggersLog.push(`  ✗ Scroll depth (disabled)`);
            }
        }

        activeTriggersLog.forEach(log => console.log(log));

        // Check if at least one trigger is active
        const hasActiveTriggers = (!isMobileDevice && (CONFIG.triggersEnabled.exitIntent || CONFIG.triggersEnabled.scrollDepth)) ||
                                  (isMobileDevice && CONFIG.triggersEnabled.scrollDepth);

        if (!hasActiveTriggers) {
            console.warn('⚠️ No triggers enabled! Popup will never show.');
        }

        listenersActive = true;
    }

    /**
     * Handle mouse movement (desktop exit intent)
     */
    function handleMouseMove(e) {
        if (hasShownPopup) return;

        // Check if mouse is in the top area of viewport (about to leave)
        if (e.clientY <= CONFIG.exitThreshold) {
            triggerType = 'exit-intent';
            console.log(`🎯 Exit intent detected! (mouse at ${e.clientY}px, threshold: ${CONFIG.exitThreshold}px)`);
            showPopup();
        }
    }

    /**
     * Handle scroll depth tracking
     */
    function handleScrollDepth() {
        if (hasShownPopup) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = scrollTop / docHeight;

        // Update highest scroll depth
        if (scrollPercent > highestScrollDepth) {
            highestScrollDepth = scrollPercent;
        }

        const threshold = isMobile() ? CONFIG.scrollDepth.mobile : CONFIG.scrollDepth.desktop;

        if (scrollPercent >= threshold) {
            triggerType = 'scroll-depth';
            console.log(`📜 Scroll depth reached! (${Math.round(scrollPercent * 100)}%)`);
            showPopup();
        }
    }

    /**
     * Show the popup with smart messaging
     */
    function showPopup() {
        console.log('🎬 showPopup() called');
        console.log('hasShownPopup:', hasShownPopup, 'popups.length:', popups.length);

        if (hasShownPopup || popups.length === 0) {
            console.log('⏸️ Popup blocked:', hasShownPopup ? 'Already shown' : 'No popups available');
            return;
        }

        hasShownPopup = true;
        currentPopup = popups[0]; // Show first eligible popup

        // Record show timestamp
        localStorage.setItem(CONFIG.localStorage.popupShownKey, new Date().toISOString());
        console.log('✅ Showing popup:', currentPopup.title);

        // Track view
        trackAnalytics('view');

        // Build and display popup
        renderPopup();
    }

    /**
     * Get smart message based on trigger type
     */
    function getSmartMessage() {
        const messages = {
            'exit-intent': CONFIG.smartMessages.exitIntent,
            'scroll-depth': CONFIG.smartMessages.scrollDepth,
            'time-based': CONFIG.smartMessages.timeBased
        };

        return messages[triggerType] || CONFIG.smartMessages.scrollDepth;
    }

    /**
     * Render popup HTML with all enhancements
     */
    function renderPopup() {
        const popup = currentPopup;
        const smartMsg = getSmartMessage();
        const isMobileDevice = isMobile();

        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'exitPopupOverlay';
        overlay.className = 'exit-popup-overlay';

        // Add click to close on background (if enabled in settings)
        if (CONFIG.styling.backgroundClickClose) {
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    close(false);
                }
            });
        }

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

        // Mobile bottom sheet class (if enabled in settings)
        const mobileClass = (isMobileDevice && CONFIG.styling.mobileBottomSheet) ? 'mobile-bottom-sheet' : '';

        // Build popup HTML
        overlay.innerHTML = `
            <div class="exit-popup-modal ${mobileClass}" style="background-color: ${popup.backgroundColor}; ${popup.backgroundImage ? `background-image: url('${popup.backgroundImage}'); background-size: cover; background-position: center;` : ''}">
                <button class="exit-popup-close" onclick="window.ExitPopup.close(false)" aria-label="Close">&times;</button>

                <div class="exit-popup-content">
                    <div class="smart-message">
                        <div class="smart-title">${escapeHtml(smartMsg.title)}</div>
                        <div class="smart-subtitle">${escapeHtml(smartMsg.subtitle)}</div>
                    </div>

                    <h2 class="exit-popup-title">${escapeHtml(popup.title)}</h2>
                    <p class="exit-popup-discount">${escapeHtml(popup.discountText)}</p>

                    ${popup.description ? `<p class="exit-popup-description">${escapeHtml(popup.description)}</p>` : ''}

                    ${countdownHTML}

                    <button class="exit-popup-cta"
                            style="background-color: ${popup.buttonColor}; color: ${popup.buttonTextColor};"
                            onclick="window.ExitPopup.close(true)">
                        ${escapeHtml(popup.buttonText)}
                    </button>

                    <div class="exit-popup-options">
                        <label class="dont-show-checkbox">
                            <input type="checkbox" id="dontShowAgain">
                            <span>Don't show this again</span>
                        </label>
                        <p class="exit-popup-dismiss">
                            <a href="#" onclick="window.ExitPopup.close(false); return false;">No thanks, I'll leave</a>
                        </p>
                    </div>
                </div>
            </div>

            <style>
                .exit-popup-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.75);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 999999;
                    animation: fadeIn ${CONFIG.styling.animationDuration}ms ease;
                    backdrop-filter: blur(${CONFIG.styling.backdropBlur}px);
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .exit-popup-modal {
                    position: relative;
                    max-width: 600px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                    border-radius: 20px;
                    padding: 3rem 2rem;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                    animation: slideUp ${CONFIG.styling.animationDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                @keyframes slideUp {
                    from {
                        transform: translateY(50px) scale(0.95);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                }

                /* Mobile Bottom Sheet Style */
                @media (max-width: 768px) {
                    .exit-popup-overlay {
                        align-items: flex-end;
                    }

                    .exit-popup-modal.mobile-bottom-sheet {
                        width: 100%;
                        max-width: 100%;
                        border-radius: 20px 20px 0 0;
                        max-height: 85vh;
                        padding: 2rem 1.5rem 2.5rem;
                        animation: slideUpMobile ${CONFIG.styling.animationDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1);
                    }

                    @keyframes slideUpMobile {
                        from {
                            transform: translateY(100%);
                            opacity: 0.8;
                        }
                        to {
                            transform: translateY(0);
                            opacity: 1;
                        }
                    }

                    /* Handle notch for mobile */
                    .exit-popup-modal.mobile-bottom-sheet::before {
                        content: '';
                        display: block;
                        width: 40px;
                        height: 4px;
                        background: rgba(0,0,0,0.2);
                        border-radius: 2px;
                        position: absolute;
                        top: 12px;
                        left: 50%;
                        transform: translateX(-50%);
                    }
                }

                .exit-popup-close {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: rgba(0, 0, 0, 0.15);
                    border: 2px solid rgba(255,255,255,0.3);
                    color: rgba(0,0,0,0.7);
                    font-size: 1.8rem;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    cursor: pointer;
                    line-height: 1;
                    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                }

                .exit-popup-close:hover {
                    background: rgba(0, 0, 0, 0.3);
                    transform: rotate(90deg) scale(1.1);
                    border-color: rgba(255,255,255,0.5);
                }

                .exit-popup-content {
                    position: relative;
                    z-index: 1;
                }

                /* Smart Message */
                .smart-message {
                    margin-bottom: 1.5rem;
                    padding: 1rem;
                    background: rgba(139, 92, 246, 0.1);
                    border-radius: 12px;
                    border: 2px dashed rgba(139, 92, 246, 0.3);
                }

                .smart-title {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #7C3AED;
                    margin-bottom: 0.25rem;
                }

                .smart-subtitle {
                    font-size: 0.95rem;
                    font-weight: 500;
                    color: #8B5CF6;
                }

                .exit-popup-title {
                    font-size: 2rem;
                    font-weight: 700;
                    margin: 0 0 1rem;
                    line-height: 1.2;
                    color: #1F2937;
                }

                .exit-popup-discount {
                    font-size: 1.3rem;
                    font-weight: 600;
                    margin: 0 0 1rem;
                    color: #F59E0B;
                    background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .exit-popup-description {
                    font-size: 1rem;
                    margin: 0 0 1.5rem;
                    opacity: 0.85;
                    color: #374151;
                }

                .exit-popup-countdown {
                    margin: 1.5rem 0;
                    padding: 1rem;
                    background: rgba(239, 68, 68, 0.05);
                    border-radius: 12px;
                }

                .countdown-timer {
                    font-size: 3rem;
                    font-weight: 700;
                    color: #EF4444;
                    margin-bottom: 0.5rem;
                    font-family: 'Courier New', monospace;
                    letter-spacing: 2px;
                }

                .countdown-label {
                    font-size: 0.9rem;
                    opacity: 0.8;
                    font-weight: 500;
                    color: #6B7280;
                }

                .exit-popup-cta {
                    display: inline-block;
                    padding: 1rem 2.5rem;
                    font-size: 1.2rem;
                    font-weight: 600;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    text-decoration: none;
                    position: relative;
                    overflow: hidden;
                }

                .exit-popup-cta::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.2);
                    transform: translate(-50%, -50%);
                    transition: width 0.6s, height 0.6s;
                }

                .exit-popup-cta:hover::before {
                    width: 300px;
                    height: 300px;
                }

                .exit-popup-cta:hover {
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.25);
                }

                .exit-popup-cta:active {
                    transform: translateY(-1px) scale(0.98);
                }

                /* Options Section */
                .exit-popup-options {
                    margin-top: 1.5rem;
                    padding-top: 1rem;
                    border-top: 1px solid rgba(0,0,0,0.1);
                }

                .dont-show-checkbox {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    margin-bottom: 0.75rem;
                    font-size: 0.95rem;
                    color: #6B7280;
                    transition: color 0.2s;
                }

                .dont-show-checkbox:hover {
                    color: #374151;
                }

                .dont-show-checkbox input[type="checkbox"] {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                    accent-color: #8B5CF6;
                }

                .exit-popup-dismiss {
                    margin: 0;
                    font-size: 0.9rem;
                }

                .exit-popup-dismiss a {
                    color: #6B7280;
                    opacity: 0.8;
                    text-decoration: underline;
                    transition: all 0.2s;
                }

                .exit-popup-dismiss a:hover {
                    opacity: 1;
                    color: #374151;
                }

                /* Mobile optimizations */
                @media (max-width: 768px) {
                    .exit-popup-title {
                        font-size: 1.5rem;
                    }

                    .exit-popup-discount {
                        font-size: 1.1rem;
                    }

                    .countdown-timer {
                        font-size: 2.2rem;
                    }

                    .exit-popup-cta {
                        padding: 0.9rem 2rem;
                        font-size: 1.05rem;
                        width: 100%;
                    }

                    .smart-title {
                        font-size: 1rem;
                    }

                    .smart-subtitle {
                        font-size: 0.9rem;
                    }
                }

                /* Accessibility */
                @media (prefers-reduced-motion: reduce) {
                    .exit-popup-overlay,
                    .exit-popup-modal {
                        animation: none;
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
                close(false);
                return;
            }

            const mins = Math.floor(totalSeconds / 60);
            const secs = totalSeconds % 60;

            const minutesEl = timerElement.querySelector('.countdown-minutes');
            const secondsEl = timerElement.querySelector('.countdown-seconds');

            if (minutesEl) minutesEl.textContent = String(mins).padStart(2, '0');
            if (secondsEl) secondsEl.textContent = String(secs).padStart(2, '0');

            // Add urgency animation when < 1 minute
            if (totalSeconds < 60) {
                timerElement.style.animation = 'pulse 1s infinite';
            }
        }, 1000);
    }

    /**
     * Close popup
     * @param {boolean} converted - Whether user clicked CTA
     */
    function close(converted) {
        // Check "Don't show again" checkbox
        const dontShowCheckbox = document.getElementById('dontShowAgain');
        if (dontShowCheckbox && dontShowCheckbox.checked) {
            const dontShowUntil = new Date();
            dontShowUntil.setDate(dontShowUntil.getDate() + CONFIG.frequencyCap.dontShowDays);
            localStorage.setItem(CONFIG.localStorage.dontShowAgainKey, dontShowUntil.toISOString());
            console.log(`🚫 User opted out for ${CONFIG.frequencyCap.dontShowDays} days`);
        }

        const overlay = document.getElementById('exitPopupOverlay');
        if (overlay) {
            // Fade out animation
            const fadeOutDuration = CONFIG.styling.animationDuration || 300;
            overlay.style.animation = `fadeOut ${fadeOutDuration}ms ease`;
            setTimeout(() => overlay.remove(), fadeOutDuration);
        }

        // Re-enable body scroll
        document.body.style.overflow = '';

        // Track analytics
        if (converted) {
            trackAnalytics('conversion');

            // Save popup offer details to localStorage
            if (currentPopup) {
                const popupOffer = {
                    popupId: currentPopup.id,
                    popupTitle: currentPopup.title,
                    discountText: currentPopup.discountText,
                    description: currentPopup.description,
                    triggerType: triggerType,
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem('activePopupOffer', JSON.stringify(popupOffer));
                console.log('💾 Popup offer saved:', popupOffer);
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
        if (!currentPopup) return;

        console.log(`📊 Tracking ${eventType} for popup: ${currentPopup.title}`);

        try {
            const { doc, updateDoc, increment } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            const db = window.db;
            if (!db) return;

            const popupRef = doc(db, 'exit_intent_popups', currentPopup.id);

            if (eventType === 'view') {
                await updateDoc(popupRef, {
                    'analytics.views': increment(1)
                });
                console.log(`✅ View tracked`);
            } else if (eventType === 'conversion') {
                await updateDoc(popupRef, {
                    'analytics.conversions': increment(1)
                });
                console.log(`✅ Conversion tracked`);

                // Google Analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'exit_popup_conversion', {
                        'event_category': 'Exit Popup',
                        'event_label': currentPopup.title,
                        'trigger_type': triggerType
                    });
                }
            } else if (eventType === 'dismissal') {
                await updateDoc(popupRef, {
                    'analytics.dismissals': increment(1)
                });
                console.log(`✅ Dismissal tracked`);
            }
        } catch (error) {
            console.error('❌ Error tracking analytics:', error);
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

    /**
     * Clear the exit popup cookie (for testing)
     */
    function clearCookie() {
        document.cookie = `${CONFIG.cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        console.log('🗑️ Exit popup cookie cleared - popup can be shown again');
    }

    // Public API
    window.ExitPopup = {
        close,
        init,
        clearCookie
    };

    /**
     * Wait for Firebase to be ready
     */
    function waitForFirebase() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50;

            const checkFirebase = () => {
                attempts++;

                if (window.firebaseDB) {
                    console.log('✅ Firebase DB ready');
                    resolve(window.firebaseDB);
                } else if (attempts >= maxAttempts) {
                    console.warn('⚠️ Firebase DB not found');
                    reject(new Error('Firebase DB not available'));
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            checkFirebase();
        });
    }

    /**
     * Add CSS for fade out animation
     */
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Auto-initialize when Firebase is ready
    (async function() {
        try {
            const db = await waitForFirebase();
            window.db = db;
            await init();
        } catch (error) {
            console.warn('Exit popups disabled:', error.message);
        }
    })();

})();

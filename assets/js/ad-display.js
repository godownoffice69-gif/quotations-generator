/**
 * Ad Display System
 * Fetches and displays advertisements from Firestore
 * Handles analytics tracking (views, clicks)
 */

class AdDisplayManager {
    constructor() {
        this.ads = [];
        this.currentPage = this.detectCurrentPage();
        this.db = null;
        this.analytics = {};
        console.log('🎯 AdDisplayManager initialized for page:', this.currentPage);
    }

    /**
     * Detect current page
     * @returns {string} Page identifier (home, quotation, etc.)
     */
    detectCurrentPage() {
        const path = window.location.pathname;
        console.log('📍 Current path:', path);
        if (path.includes('quotation.html')) return 'quotation';
        if (path.includes('index.html') || path === '/' || path === '') return 'home';
        return 'other';
    }

    /**
     * Initialize Firebase and load ads
     */
    async init() {
        try {
            console.log('🚀 Initializing ad display system...');

            // Wait for Firebase to be ready
            let attempts = 0;
            while (typeof firebase === 'undefined' && attempts < 50) {
                console.log('⏳ Waiting for Firebase... attempt', attempts + 1);
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }

            if (typeof firebase === 'undefined') {
                console.error('❌ Firebase not loaded after waiting, ads will not be displayed');
                return;
            }

            console.log('✅ Firebase detected, initializing Firestore...');
            this.db = firebase.firestore();
            this.loadAds(); // Set up real-time listener (no need to await)

            console.log('📥 Loading ads from Firestore...');
            await this.loadAds();

            console.log('🎨 Displaying ads...');
            this.displayAds();

            console.log('✅ Ad display system ready!');
        } catch (error) {
            console.error('❌ Error initializing ad display:', error);
            console.error('Error details:', error.message, error.stack);
        }
    }

    /**
     * Load ads from Firestore with real-time updates
     */
    async loadAds() {
        try {
            // Set up real-time listener for advertisements
            this.db.collection('advertisements').onSnapshot(snapshot => {
                const allAds = snapshot.docs.map(doc => doc.data());

                // Filter ads based on:
                // 1. Status (active or scheduled within date range)
                // 2. Page (all or current page)
                // 3. Visibility
                this.ads = allAds.filter(ad => {
                    // Check visibility
                    if (!ad.isVisible) return false;

                    // Check page
                    if (ad.placement?.page !== 'all' && ad.placement?.page !== this.currentPage) {
                        return false;
                    }

                    // Check status and schedule
                    if (ad.status === 'inactive') return false;

                    if (ad.status === 'scheduled') {
                        const now = new Date();
                        const startDate = ad.schedule?.startDate ? new Date(ad.schedule.startDate) : null;
                        const endDate = ad.schedule?.endDate ? new Date(ad.schedule.endDate) : null;

                        if (startDate && now < startDate) return false;
                        if (endDate && now > endDate) return false;
                    }

                    return true;
                });

                console.log(`✅ Loaded ${this.ads.length} active ads for ${this.currentPage} page (real-time)`);

                // Re-display ads when they change
                this.displayAds();
            }, error => {
                console.error('Error loading ads from Firestore:', error);
                this.ads = [];
            });
        } catch (error) {
            console.error('❌ Error setting up ad listener, falling back to static fetch:', error);

            try {
                console.log('📡 Fetching from Firestore collection: advertisements');
                const snapshot = await this.db.collection('advertisements').get();
                console.log('📦 Raw snapshot size:', snapshot.size);

                const allAds = snapshot.docs.map(doc => {
                    console.log('📄 Ad document:', doc.id, doc.data());
                    return doc.data();
                });
                console.log('📊 Total ads fetched:', allAds.length);

                // Filter ads based on:
                // 1. Status (active or scheduled within date range)
                // 2. Page (all or current page)
                // 3. Visibility
                this.ads = allAds.filter(ad => {
                    console.log('🔍 Filtering ad:', ad.title);

                    // Check visibility
                    if (!ad.isVisible) {
                        console.log('  ❌ Not visible');
                        return false;
                    }

                    // Check page
                    const adPage = ad.placement?.page || 'all';
                    console.log('  📍 Ad page:', adPage, '| Current page:', this.currentPage);
                    if (adPage !== 'all' && adPage !== this.currentPage) {
                        console.log('  ❌ Page mismatch');
                        return false;
                    }

                    // Check status and schedule
                    console.log('  📊 Status:', ad.status);
                    if (ad.status === 'inactive') {
                        console.log('  ❌ Inactive');
                        return false;
                    }

                    if (ad.status === 'scheduled') {
                        const now = new Date();
                        const startDate = ad.schedule?.startDate ? new Date(ad.schedule.startDate) : null;
                        const endDate = ad.schedule?.endDate ? new Date(ad.schedule.endDate) : null;

                        console.log('  ⏰ Schedule check:', { now, startDate, endDate });
                        if (startDate && now < startDate) {
                            console.log('  ❌ Not started yet');
                            return false;
                        }
                        if (endDate && now > endDate) {
                            console.log('  ❌ Already ended');
                            return false;
                        }
                    }

                    console.log('  ✅ Ad passed all filters');
                    return true;
                });

                console.log(`✅ Loaded ${this.ads.length} active ads for ${this.currentPage} page`);
                console.log('📋 Filtered ads:', this.ads);
            } catch (innerError) {
                console.error('❌ Error loading ads from Firestore:', innerError);
                console.error('Error details:', innerError.message, innerError.stack);
                this.ads = [];
            }
        }
    }

    /**
     * Display ads in their designated positions
     */
    displayAds() {
        console.log('🎨 Starting to display ads...');

        if (this.ads.length === 0) {
            console.log('⚠️ No ads to display');
            return;
        }

        // Group ads by position
        const adsByPosition = {};
        this.ads.forEach(ad => {
            const position = ad.placement?.position || 'header';
            console.log('📍 Ad position:', position, '| Ad:', ad.title);
            if (!adsByPosition[position]) {
                adsByPosition[position] = [];
            }
            adsByPosition[position].push(ad);
        });

        console.log('📊 Ads grouped by position:', Object.keys(adsByPosition));

        // Render ads for each position
        Object.keys(adsByPosition).forEach(position => {
            console.log('🎨 Rendering ads for position:', position);
            this.renderAdsForPosition(position, adsByPosition[position]);
        });
    }

    /**
     * Render ads for a specific position
     * @param {string} position - Position identifier
     * @param {Array} ads - Ads to render
     */
    renderAdsForPosition(position, ads) {
        const containerId = `ad-${position}`;
        console.log('🎨 Looking for container:', containerId);

        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ Ad container #${containerId} not found in DOM`);
            console.log('Available containers:',
                Array.from(document.querySelectorAll('[id^="ad-"]')).map(el => el.id));
            return;
        }

        console.log('✅ Container found:', containerId);

        // Sort by displayOrder
        ads.sort((a, b) => (a.placement?.displayOrder || 0) - (b.placement?.displayOrder || 0));

        // Render each ad
        ads.forEach(ad => {
            console.log('🎨 Creating ad element for:', ad.title);
            const adElement = this.createAdElement(ad);
            container.appendChild(adElement);
            console.log('✅ Ad element appended to container');

            // Track view
            this.trackView(ad.id);
        });

        console.log(`✅ Rendered ${ads.length} ads in ${containerId}`);
    }

    /**
     * Create HTML element for an ad
     * @param {Object} ad - Ad data
     * @returns {HTMLElement} Ad element
     */
    createAdElement(ad) {
        const wrapper = document.createElement('div');
        wrapper.className = `ad-wrapper ad-type-${ad.type}`;
        wrapper.setAttribute('data-ad-id', ad.id);

        let content = '';

        if (ad.type === 'image') {
            content = this.renderImageAd(ad);
        } else if (ad.type === 'text') {
            content = this.renderTextAd(ad);
        } else if (ad.type === 'video') {
            content = this.renderVideoAd(ad);
        }

        wrapper.innerHTML = content;

        // Add click tracking
        if (ad.content.link || ad.content.buttonLink) {
            wrapper.style.cursor = 'pointer';
            wrapper.addEventListener('click', (e) => {
                this.trackClick(ad.id);
                const link = ad.content.link || ad.content.buttonLink;
                if (link) {
                    window.open(link, '_blank');
                }
            });
        }

        return wrapper;
    }

    /**
     * Render image ad
     * @param {Object} ad - Ad data
     * @returns {string} HTML string
     */
    renderImageAd(ad) {
        const imageUrl = ad.content.imageUrl;
        const altText = ad.content.altText || ad.title;

        return `
            <div class="ad-image">
                <img src="${imageUrl}" alt="${altText}" loading="lazy">
            </div>
        `;
    }

    /**
     * Render text ad
     * @param {Object} ad - Ad data
     * @returns {string} HTML string
     */
    renderTextAd(ad) {
        const headline = ad.content.headline || '';
        const description = ad.content.description || '';
        const buttonText = ad.content.buttonText || '';
        const buttonLink = ad.content.buttonLink || '#';
        const textColor = ad.content.textColor || '#ffffff';
        const animation = ad.content.animation || 'none';
        const animationClass = animation !== 'none' ? `ad-animation-${animation}` : '';

        // Typography settings
        const headlineSize = ad.content.headlineSize || '2';
        const descSize = ad.content.descSize || '1.1';
        const fontWeight = ad.content.fontWeight || '700';
        const textAlign = ad.content.textAlign || 'center';
        const letterSpacing = ad.content.letterSpacing || '0';
        const lineHeight = ad.content.lineHeight || '1.5';
        const textShadow = ad.content.textShadow ? '2px 2px 4px rgba(0,0,0,0.8)' : 'none';

        return `
            <div class="ad-text" style="text-align: ${textAlign}; background: transparent; padding: 0;">
                ${headline ? `<h3 class="${animationClass}" style="font-size: ${headlineSize}rem; margin-bottom: 1rem; color: ${textColor}; display: inline-block; font-weight: ${fontWeight}; letter-spacing: ${letterSpacing}px; line-height: ${lineHeight}; text-shadow: ${textShadow};">${headline}</h3>` : ''}
                ${description ? `<p class="${animationClass}" style="font-size: ${descSize}rem; margin-bottom: 1.5rem; color: ${textColor}; display: inline-block; font-weight: ${fontWeight}; letter-spacing: ${letterSpacing}px; line-height: ${lineHeight}; text-shadow: ${textShadow};">${description}</p>` : ''}
                ${buttonText ? `<a href="${buttonLink}" class="${animationClass}" style="display: inline-block; color: ${textColor}; padding: 0.75rem 2rem; border: 2px solid ${textColor}; border-radius: 8px; font-size: 1rem; font-weight: ${fontWeight}; text-decoration: none; cursor: pointer; letter-spacing: ${letterSpacing}px; text-shadow: ${textShadow};">${buttonText}</a>` : ''}
            </div>
        `;
    }

    /**
     * Render video ad
     * @param {Object} ad - Ad data
     * @returns {string} HTML string
     */
    renderVideoAd(ad) {
        const videoUrl = ad.content.videoUrl;
        const autoplay = ad.content.autoplay ? 'autoplay' : '';
        const muted = ad.content.muted ? 'muted' : '';
        const embedUrl = this.getVideoEmbedUrl(videoUrl, autoplay, muted);

        return `
            <div class="ad-video">
                <iframe
                    src="${embedUrl}"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                    style="width: 100%; height: 400px; border-radius: 12px;">
                </iframe>
            </div>
        `;
    }

    /**
     * Convert video URL to embed URL
     * @param {string} url - Video URL
     * @param {string} autoplay - Autoplay parameter
     * @param {string} muted - Muted parameter
     * @returns {string} Embed URL
     */
    getVideoEmbedUrl(url, autoplay, muted) {
        // YouTube
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            let videoId = '';
            if (url.includes('youtube.com/watch?v=')) {
                videoId = url.split('v=')[1]?.split('&')[0];
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1]?.split('?')[0];
            } else if (url.includes('youtube.com/embed/')) {
                videoId = url.split('embed/')[1]?.split('?')[0];
            }

            const params = [];
            if (autoplay) params.push('autoplay=1');
            if (muted) params.push('mute=1');
            const queryString = params.length > 0 ? '?' + params.join('&') : '';

            return `https://www.youtube.com/embed/${videoId}${queryString}`;
        }

        // Instagram
        if (url.includes('instagram.com')) {
            let postUrl = url.replace(/\/$/, '');
            if (postUrl.includes('/reel/') || postUrl.includes('/p/')) {
                if (!postUrl.includes('/embed')) {
                    return `${postUrl}/embed/`;
                }
                return postUrl;
            }
        }

        return url;
    }

    /**
     * Track ad view (impression)
     * @param {string} adId - Ad ID
     */
    async trackView(adId) {
        try {
            // Prevent duplicate tracking in same session
            if (this.analytics[adId]?.viewed) return;

            const adRef = this.db.collection('advertisements').doc(adId);
            await adRef.update({
                'analytics.views': firebase.firestore.FieldValue.increment(1),
                'analytics.impressions': firebase.firestore.FieldValue.increment(1)
            });

            // Mark as viewed in session
            if (!this.analytics[adId]) this.analytics[adId] = {};
            this.analytics[adId].viewed = true;

            console.log(`📊 Tracked view for ad: ${adId}`);
        } catch (error) {
            console.error('Error tracking view:', error);
        }
    }

    /**
     * Track ad click
     * @param {string} adId - Ad ID
     */
    async trackClick(adId) {
        try {
            const adRef = this.db.collection('advertisements').doc(adId);
            await adRef.update({
                'analytics.clicks': firebase.firestore.FieldValue.increment(1)
            });

            console.log(`🖱️ Tracked click for ad: ${adId}`);
        } catch (error) {
            console.error('Error tracking click:', error);
        }
    }
}

// Initialize ad display when DOM is ready
console.log('📜 Ad display script loaded');

function initializeAdManager() {
    console.log('🎬 Initializing AdDisplayManager...');
    const adManager = new AdDisplayManager();
    adManager.init();
}

if (document.readyState === 'loading') {
    console.log('⏳ DOM still loading, waiting...');
    document.addEventListener('DOMContentLoaded', initializeAdManager);
} else {
    console.log('✅ DOM already loaded, initializing now');
    // Wait a bit for Firebase compat to load
    setTimeout(initializeAdManager, 500);
}

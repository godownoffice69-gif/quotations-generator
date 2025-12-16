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
    }

    /**
     * Detect current page
     * @returns {string} Page identifier (home, quotation, etc.)
     */
    detectCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('quotation.html')) return 'quotation';
        if (path.includes('index.html') || path === '/') return 'home';
        return 'other';
    }

    /**
     * Initialize Firebase and load ads
     */
    async init() {
        try {
            // Initialize Firebase (using existing global Firebase instance)
            if (typeof firebase === 'undefined') {
                console.warn('Firebase not loaded, ads will not be displayed');
                return;
            }

            this.db = firebase.firestore();
            this.loadAds(); // Set up real-time listener (no need to await)
        } catch (error) {
            console.error('Error initializing ad display:', error);
        }
    }

    /**
     * Load ads from Firestore with real-time updates
     */
    loadAds() {
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
            console.error('Error setting up ad listener:', error);
            this.ads = [];
        }
    }

    /**
     * Display ads in their designated positions
     */
    displayAds() {
        // Group ads by position
        const adsByPosition = {};
        this.ads.forEach(ad => {
            const position = ad.placement?.position || 'header';
            if (!adsByPosition[position]) {
                adsByPosition[position] = [];
            }
            adsByPosition[position].push(ad);
        });

        // Render ads for each position
        Object.keys(adsByPosition).forEach(position => {
            this.renderAdsForPosition(position, adsByPosition[position]);
        });
    }

    /**
     * Render ads for a specific position
     * @param {string} position - Position identifier
     * @param {Array} ads - Ads to render
     */
    renderAdsForPosition(position, ads) {
        const container = document.getElementById(`ad-${position}`);
        if (!container) {
            console.warn(`Ad container #ad-${position} not found`);
            return;
        }

        // Sort by displayOrder
        ads.sort((a, b) => (a.placement?.displayOrder || 0) - (b.placement?.displayOrder || 0));

        // Render each ad
        ads.forEach(ad => {
            const adElement = this.createAdElement(ad);
            container.appendChild(adElement);

            // Track view
            this.trackView(ad.id);
        });
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
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const adManager = new AdDisplayManager();
        adManager.init();
    });
} else {
    const adManager = new AdDisplayManager();
    adManager.init();
}

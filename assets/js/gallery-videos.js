/**
 * ============================================
 * GALLERY VIDEOS LOADER
 * ============================================
 *
 * Loads and displays videos from Firestore in the "Our Spectacular Work" gallery
 * Replaces static photos with dynamic video content from admin panel
 */

class GalleryVideos {
    constructor() {
        this.videos = [];
        this.db = null;
    }

    /**
     * Initialize the gallery videos
     */
    async init() {
        try {
            console.log('🎬 Initializing Gallery Videos...');

            // Wait for Firebase to be initialized
            await this.waitForFirebase();

            // Load videos from Firestore
            await this.loadVideos();

            // Render videos in gallery
            this.renderGallery();

            console.log('✅ Gallery Videos initialized successfully!');
        } catch (error) {
            console.error('❌ Error initializing gallery videos:', error);
            this.showError();
        }
    }

    /**
     * Wait for Firebase to be initialized
     */
    async waitForFirebase() {
        return new Promise((resolve) => {
            const checkFirebase = () => {
                if (window.firebaseDB) {
                    this.db = window.firebaseDB;
                    resolve();
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            checkFirebase();
        });
    }

    /**
     * Load videos from Firestore
     */
    async loadVideos() {
        try {
            const { getDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            console.log('📦 Loading videos from Firestore (admin/data)...');

            const dataDoc = await getDoc(doc(this.db, 'admin', 'data'));

            if (dataDoc.exists()) {
                const data = dataDoc.data();
                this.videos = (data.videos || []).filter(v => v.visible !== false);

                console.log(`✅ Loaded ${this.videos.length} visible videos`);
            } else {
                console.warn('⚠️ No videos found in Firestore');
                this.videos = [];
            }
        } catch (error) {
            console.error('❌ Error loading videos from Firestore:', error);
            throw error;
        }
    }

    /**
     * Render videos in the gallery grid
     */
    renderGallery() {
        const galleryGrid = document.querySelector('.gallery-grid');

        if (!galleryGrid) {
            console.warn('⚠️ Gallery grid not found');
            return;
        }

        if (this.videos.length === 0) {
            galleryGrid.innerHTML = `
                <div class="gallery-empty-state">
                    <div class="empty-icon">🎬</div>
                    <h3>No Videos Available</h3>
                    <p>Videos will appear here once uploaded in the admin panel</p>
                </div>
            `;
            return;
        }

        // Clear existing static content
        galleryGrid.innerHTML = '';

        // Add videos to gallery
        this.videos.forEach(video => {
            const videoItem = this.createVideoItem(video);
            galleryGrid.appendChild(videoItem);
        });

        console.log(`✅ Rendered ${this.videos.length} videos in gallery`);
    }

    /**
     * Create a video gallery item element
     */
    createVideoItem(video) {
        const item = document.createElement('div');
        item.className = 'gallery-item gallery-video-item';
        item.setAttribute('data-category', 'all'); // Make videos show up in all filters

        const embedUrl = this.getEmbedUrl(video.url);
        const platform = this.getPlatform(video.url);

        item.innerHTML = `
            <div class="gallery-video-wrapper">
                <iframe
                    src="${embedUrl}"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                    loading="lazy">
                </iframe>
                <div class="video-platform-badge">${platform}</div>
            </div>
            <div class="gallery-overlay">
                <h3>${video.title || 'FirepowerSFX Video'}</h3>
                <p>See our spectacular work in action</p>
            </div>
        `;

        return item;
    }

    /**
     * Convert YouTube/Instagram URL to embed URL
     */
    getEmbedUrl(url) {
        // YouTube
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            let videoId = '';
            if (url.includes('youtube.com/watch?v=')) {
                videoId = url.split('v=')[1]?.split('&')[0];
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1]?.split('?')[0];
            } else if (url.includes('youtube.com/embed/')) {
                return url;
            }
            return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
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
     * Get platform name from URL
     */
    getPlatform(url) {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            return '📺 YouTube';
        }
        if (url.includes('instagram.com')) {
            return '📷 Instagram';
        }
        return '🎬 Video';
    }

    /**
     * Show error message in gallery
     */
    showError() {
        const galleryGrid = document.querySelector('.gallery-grid');

        if (galleryGrid) {
            galleryGrid.innerHTML = `
                <div class="gallery-empty-state">
                    <div class="empty-icon">❌</div>
                    <h3>Unable to Load Videos</h3>
                    <p>Please try refreshing the page or contact support</p>
                </div>
            `;
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const galleryVideos = new GalleryVideos();
        galleryVideos.init();
    });
} else {
    const galleryVideos = new GalleryVideos();
    galleryVideos.init();
}

// Make globally available
if (typeof window !== 'undefined') {
    window.GalleryVideos = GalleryVideos;
}

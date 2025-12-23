/**
 * ============================================
 * GALLERY VIDEOS LOADER
 * ============================================
 *
 * Loads and displays videos from Firestore in the "Our Spectacular Work" gallery
 */

(async function() {
    'use strict';

    console.log('🎬 Gallery Videos Loader starting...');

    try {
        // Wait for Firebase to be initialized
        await waitForFirebase();
        console.log('✅ Firebase ready for video loading');

        // Load videos from Firestore
        const videos = await loadVideos();
        console.log(`✅ Loaded ${videos.length} videos`);

        // Render videos in gallery
        renderGallery(videos);

    } catch (error) {
        console.error('❌ Error loading gallery videos:', error);
        showError();
    }

    /**
     * Wait for Firebase to be initialized
     */
    function waitForFirebase() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds max

            const checkFirebase = () => {
                attempts++;
                console.log(`🔍 Checking for Firebase DB... attempt ${attempts}`);

                if (window.firebaseDB) {
                    console.log('✅ Firebase DB found!');
                    resolve(window.firebaseDB);
                } else if (attempts >= maxAttempts) {
                    console.error('❌ Firebase DB not found after 5 seconds');
                    reject(new Error('Firebase DB not available'));
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
    async function loadVideos() {
        try {
            const { getDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const db = window.firebaseDB;

            console.log('📦 Loading videos from Firestore (admin/data)...');

            const dataDoc = await getDoc(doc(db, 'admin', 'data'));

            if (dataDoc.exists()) {
                const data = dataDoc.data();
                const allVideos = data.videos || [];
                // Filter only visible videos
                const visibleVideos = allVideos.filter(v => v.visible !== false);

                console.log(`✅ Found ${visibleVideos.length} visible videos out of ${allVideos.length} total`);
                return visibleVideos;
            } else {
                console.warn('⚠️ No admin/data document found in Firestore');
                return [];
            }
        } catch (error) {
            console.error('❌ Error loading videos from Firestore:', error);
            return [];
        }
    }

    /**
     * Render videos in the gallery grid
     */
    function renderGallery(videos) {
        const galleryGrid = document.querySelector('.gallery-grid');

        console.log('🎨 renderGallery called with', videos.length, 'videos');
        console.log('📍 Gallery grid element:', galleryGrid);

        if (!galleryGrid) {
            console.error('❌ Gallery grid not found! Cannot render videos.');
            return;
        }

        if (videos.length === 0) {
            console.warn('⚠️ No videos to render, showing empty state');
            galleryGrid.innerHTML = `
                <div class="gallery-empty-state">
                    <div class="empty-icon">🎬</div>
                    <h3>No Videos Available</h3>
                    <p>Upload videos in the admin panel to showcase your spectacular work</p>
                </div>
            `;
            return;
        }

        console.log('🧹 Clearing gallery grid...');
        // Clear existing loading state
        galleryGrid.innerHTML = '';

        // Add videos to gallery
        console.log('🎬 Creating video items...');
        videos.forEach((video, index) => {
            console.log(`Creating video ${index + 1}:`, video.title, video.url);
            const videoItem = createVideoItem(video);
            galleryGrid.appendChild(videoItem);
        });

        console.log(`✅ Successfully rendered ${videos.length} videos in gallery!`);

        // Dispatch event to notify that videos are loaded (for filter initialization)
        const event = new CustomEvent('videosLoaded', { detail: { count: videos.length } });
        document.dispatchEvent(event);
        console.log('📢 Dispatched videosLoaded event');
    }

    /**
     * Create a video gallery item element
     */
    function createVideoItem(video) {
        console.log('🎬 Creating video item for:', video.url);

        const item = document.createElement('div');
        item.className = 'gallery-item gallery-video-item';
        item.setAttribute('data-category', 'all'); // Show in all filters

        const embedUrl = getEmbedUrl(video.url);
        const platform = getPlatform(video.url);
        const aspectRatio = getAspectRatio(video.url);

        console.log(`  ↳ Embed URL: ${embedUrl}`);
        console.log(`  ↳ Platform: ${platform}`);
        console.log(`  ↳ Aspect Ratio: ${aspectRatio}`);

        // Use CSS aspect-ratio property for better video display
        // 9/16 for vertical (Instagram Reels), 16/9 for horizontal, 1/1 for square
        const aspectRatioStyle = aspectRatio;

        console.log(`  ↳ Aspect Ratio: ${aspectRatioStyle}`);

        item.innerHTML = `
            <div class="gallery-video-wrapper" style="aspect-ratio: ${aspectRatioStyle};">
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
                <h3>${escapeHtml(video.title || 'FirepowerSFX Video')}</h3>
                <p>See our spectacular work in action</p>
            </div>
        `;

        console.log('  ✅ Video item created successfully');
        return item;
    }

    /**
     * Convert YouTube/Instagram URL to embed URL
     */
    function getEmbedUrl(url) {
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
            // Remove query parameters first, THEN remove trailing slash
            let postUrl = url.split('?')[0].replace(/\/$/, '');

            console.log(`  ↳ Cleaned Instagram URL: ${postUrl}`);

            if (postUrl.includes('/reel/') || postUrl.includes('/p/') || postUrl.includes('/tv/')) {
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
    function getPlatform(url) {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            return '📺 YouTube';
        }
        if (url.includes('instagram.com')) {
            return '📷 Instagram';
        }
        return '🎬 Video';
    }

    /**
     * Get aspect ratio based on video type
     */
    function getAspectRatio(url) {
        // Instagram reels/stories - portrait (9:16)
        if (url.includes('instagram.com/reel/') || url.includes('instagram.com/tv/') || url.includes('instagram.com/stories/')) {
            return '9/16';
        }
        // Instagram posts - square (1:1)
        if (url.includes('instagram.com/p/')) {
            return '1/1';
        }
        // YouTube and others - landscape (16:9)
        return '16/9';
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
     * Show error message in gallery
     */
    function showError() {
        const galleryGrid = document.querySelector('.gallery-grid');

        if (galleryGrid) {
            galleryGrid.innerHTML = `
                <div class="gallery-empty-state">
                    <div class="empty-icon">❌</div>
                    <h3>Unable to Load Videos</h3>
                    <p>Please try refreshing the page</p>
                </div>
            `;
        }
    }

})();

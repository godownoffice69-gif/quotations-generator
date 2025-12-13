/* ============================================
   VIDEOS - Video Management Module
   ============================================ */

/**
 * Videos - Manage YouTube and Instagram videos for quotation website
 */
export const Videos = {
    /**
     * Render the videos management interface
     * @param {Object} oms - Order Management System instance
     */
    renderVideos(oms) {
        const videos = oms.data.videos || [];

        const html = `
            <div class="videos-container">
                <div class="section-header">
                    <h2>🎥 Video Management</h2>
                    <p class="subtitle">Manage videos displayed on your quotation website</p>
                    <button class="btn btn-primary" onclick="OMS.showAddVideoModal()">
                        ➕ Add New Video
                    </button>
                </div>

                <div class="videos-grid" id="videos-grid">
                    ${videos.length === 0 ? `
                        <div class="empty-state">
                            <div class="empty-icon">🎬</div>
                            <h3>No Videos Yet</h3>
                            <p>Add YouTube or Instagram videos to showcase on your website</p>
                            <button class="btn btn-primary" onclick="OMS.showAddVideoModal()">
                                Add First Video
                            </button>
                        </div>
                    ` : videos.map((video, index) => this.renderVideoCard(oms, video, index)).join('')}
                </div>
            </div>

            <style>
                .videos-container {
                    padding: 20px;
                }

                .section-header {
                    margin-bottom: 30px;
                    text-align: center;
                }

                .section-header h2 {
                    font-size: 32px;
                    margin-bottom: 8px;
                    color: #333;
                }

                .section-header .subtitle {
                    font-size: 16px;
                    color: #666;
                    margin-bottom: 20px;
                }

                .videos-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 24px;
                    margin-top: 30px;
                }

                .video-card {
                    background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    transition: all 0.3s ease;
                    border: 1px solid #e9ecef;
                }

                .video-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
                }

                .video-preview {
                    position: relative;
                    width: 100%;
                    height: 200px;
                    background: #000;
                    overflow: hidden;
                }

                .video-preview iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                }

                .video-platform-badge {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    backdrop-filter: blur(8px);
                }

                .video-info {
                    padding: 20px;
                }

                .video-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 8px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .video-url {
                    font-size: 14px;
                    color: #6c757d;
                    margin-bottom: 12px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .video-meta {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 16px;
                    font-size: 13px;
                    color: #6c757d;
                }

                .video-actions {
                    display: flex;
                    gap: 8px;
                }

                .video-actions button {
                    flex: 1;
                    padding: 10px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.2s;
                }

                .btn-edit {
                    background: #3b82f6;
                    color: white;
                }

                .btn-edit:hover {
                    background: #2563eb;
                }

                .btn-delete {
                    background: #ef4444;
                    color: white;
                }

                .btn-delete:hover {
                    background: #dc2626;
                }

                .empty-state {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 60px 20px;
                }

                .empty-icon {
                    font-size: 80px;
                    margin-bottom: 20px;
                }

                .empty-state h3 {
                    font-size: 24px;
                    color: #333;
                    margin-bottom: 8px;
                }

                .empty-state p {
                    font-size: 16px;
                    color: #6c757d;
                    margin-bottom: 24px;
                }

                @media (max-width: 768px) {
                    .videos-grid {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        `;

        document.getElementById('videos').innerHTML = html;
    },

    /**
     * Render individual video card
     * @param {Object} oms - OMS instance
     * @param {Object} video - Video data
     * @param {number} index - Video index
     * @returns {string} HTML for video card
     */
    renderVideoCard(oms, video, index) {
        const embedUrl = this.getEmbedUrl(video.url);
        const platform = this.getPlatform(video.url);
        const createdDate = new Date(video.createdAt).toLocaleDateString();

        return `
            <div class="video-card">
                <div class="video-preview">
                    <iframe
                        src="${embedUrl}"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen>
                    </iframe>
                    <div class="video-platform-badge">${platform}</div>
                </div>
                <div class="video-info">
                    <div class="video-title">${video.title || 'Untitled Video'}</div>
                    <div class="video-url">${video.url}</div>
                    <div class="video-meta">
                        <span>📅 ${createdDate}</span>
                        <span>👁️ Visible: ${video.visible ? 'Yes' : 'No'}</span>
                    </div>
                    <div class="video-actions">
                        <button class="btn-edit" onclick="OMS.editVideo(${index})">
                            ✏️ Edit
                        </button>
                        <button class="btn-delete" onclick="OMS.deleteVideo(${index})">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Convert YouTube/Instagram URL to embed URL
     * @param {string} url - Video URL
     * @returns {string} Embed URL
     */
    getEmbedUrl(url) {
        // YouTube
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            let videoId = '';
            if (url.includes('youtube.com/watch?v=')) {
                videoId = url.split('v=')[1]?.split('&')[0];
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1]?.split('?')[0];
            }
            return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
        }

        // Instagram
        if (url.includes('instagram.com')) {
            // Remove trailing slash if exists
            const cleanUrl = url.replace(/\/$/, '');
            return `${cleanUrl}/embed/`;
        }

        return url;
    },

    /**
     * Get platform name from URL
     * @param {string} url - Video URL
     * @returns {string} Platform name
     */
    getPlatform(url) {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            return '📺 YouTube';
        }
        if (url.includes('instagram.com')) {
            return '📷 Instagram';
        }
        return '🎬 Video';
    },

    /**
     * Show add video modal
     * @param {Object} oms - OMS instance
     */
    showAddVideoModal(oms) {
        const modalHtml = `
            <div class="modal-overlay" onclick="OMS.closeVideoModal()"></div>
            <div class="modal-content video-modal">
                <div class="modal-header">
                    <h3>➕ Add New Video</h3>
                    <button class="modal-close" onclick="OMS.closeVideoModal()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Video Title</label>
                        <input type="text" id="videoTitle" class="form-control" placeholder="e.g., Wedding Sparklers Showcase">
                    </div>
                    <div class="form-group">
                        <label>Video URL *</label>
                        <input type="url" id="videoUrl" class="form-control" placeholder="Paste YouTube or Instagram link">
                        <small>Supports YouTube and Instagram videos</small>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="videoVisible" checked>
                            Show on website
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="OMS.closeVideoModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="OMS.saveVideo()">Save Video</button>
                </div>
            </div>

            <style>
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 9998;
                }

                .video-modal {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    border-radius: 16px;
                    width: 90%;
                    max-width: 500px;
                    z-index: 9999;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                }

                .modal-header {
                    padding: 24px;
                    border-bottom: 1px solid #e9ecef;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .modal-header h3 {
                    margin: 0;
                    font-size: 24px;
                }

                .modal-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #6c757d;
                    padding: 0;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                }

                .modal-close:hover {
                    background: #f8f9fa;
                }

                .modal-body {
                    padding: 24px;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                    color: #333;
                }

                .form-control {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e9ecef;
                    border-radius: 8px;
                    font-size: 15px;
                    transition: border-color 0.2s;
                }

                .form-control:focus {
                    outline: none;
                    border-color: #3b82f6;
                }

                .form-group small {
                    display: block;
                    margin-top: 6px;
                    color: #6c757d;
                    font-size: 13px;
                }

                .modal-footer {
                    padding: 20px 24px;
                    border-top: 1px solid #e9ecef;
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                }

                .btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 15px;
                    transition: all 0.2s;
                }

                .btn-primary {
                    background: #3b82f6;
                    color: white;
                }

                .btn-primary:hover {
                    background: #2563eb;
                }

                .btn-secondary {
                    background: #e9ecef;
                    color: #495057;
                }

                .btn-secondary:hover {
                    background: #dee2e6;
                }
            </style>
        `;

        // Remove existing modal if any
        const existing = document.querySelector('.modal-overlay');
        if (existing) existing.remove();

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    /**
     * Show edit video modal
     * @param {Object} oms - OMS instance
     * @param {number} index - Video index
     */
    editVideo(oms, index) {
        const video = oms.data.videos[index];
        this.showAddVideoModal(oms);

        // Pre-fill form
        setTimeout(() => {
            document.getElementById('videoTitle').value = video.title || '';
            document.getElementById('videoUrl').value = video.url || '';
            document.getElementById('videoVisible').checked = video.visible !== false;
        }, 100);

        // Change save button to update
        const saveBtn = document.querySelector('.modal-footer .btn-primary');
        saveBtn.textContent = 'Update Video';
        saveBtn.onclick = () => oms.updateVideo(index);
    },

    /**
     * Close video modal
     */
    closeVideoModal() {
        const overlay = document.querySelector('.modal-overlay');
        if (overlay) overlay.remove();

        const modal = document.querySelector('.video-modal');
        if (modal) modal.remove();
    },

    /**
     * Save new video
     * @param {Object} oms - OMS instance
     */
    async saveVideo(oms) {
        const title = document.getElementById('videoTitle').value.trim();
        const url = document.getElementById('videoUrl').value.trim();
        const visible = document.getElementById('videoVisible').checked;

        if (!url) {
            alert('Please enter a video URL');
            return;
        }

        const video = {
            title: title || 'Untitled Video',
            url,
            visible,
            createdAt: new Date().toISOString()
        };

        if (!oms.data.videos) {
            oms.data.videos = [];
        }

        oms.data.videos.push(video);

        // Save to Firestore
        try {
            await oms.saveVideosToFirestore();
            this.closeVideoModal();
            this.renderVideos(oms);
            alert('✅ Video added successfully!');
        } catch (error) {
            console.error('Error saving video:', error);
            alert('❌ Error saving video. Please try again.');
        }
    },

    /**
     * Update existing video
     * @param {Object} oms - OMS instance
     * @param {number} index - Video index
     */
    async updateVideo(oms, index) {
        const title = document.getElementById('videoTitle').value.trim();
        const url = document.getElementById('videoUrl').value.trim();
        const visible = document.getElementById('videoVisible').checked;

        if (!url) {
            alert('Please enter a video URL');
            return;
        }

        oms.data.videos[index] = {
            ...oms.data.videos[index],
            title: title || 'Untitled Video',
            url,
            visible
        };

        try {
            await oms.saveVideosToFirestore();
            this.closeVideoModal();
            this.renderVideos(oms);
            alert('✅ Video updated successfully!');
        } catch (error) {
            console.error('Error updating video:', error);
            alert('❌ Error updating video. Please try again.');
        }
    },

    /**
     * Delete video
     * @param {Object} oms - OMS instance
     * @param {number} index - Video index
     */
    async deleteVideo(oms, index) {
        if (!confirm('Are you sure you want to delete this video?')) {
            return;
        }

        oms.data.videos.splice(index, 1);

        try {
            await oms.saveVideosToFirestore();
            this.renderVideos(oms);
            alert('✅ Video deleted successfully!');
        } catch (error) {
            console.error('Error deleting video:', error);
            alert('❌ Error deleting video. Please try again.');
        }
    }
};

// Make Videos available globally for backward compatibility
if (typeof window !== 'undefined') {
    window.Videos = Videos;
}

/* ============================================
   ADVERTISEMENTS - Ad Management Module
   ============================================ */

/**
 * Advertisements - Manage ads displayed on the quotation website
 * Supports Image, Text, and Video ads with scheduling and analytics
 */
export const Advertisements = {
    /**
     * Render the advertisements management interface
     * @param {Object} oms - Order Management System instance
     */
    renderAdvertisements(oms) {
        const ads = oms.data.advertisements || [];

        // Filter stats
        const activeAds = ads.filter(ad => ad.status === 'active').length;
        const scheduledAds = ads.filter(ad => ad.status === 'scheduled').length;
        const inactiveAds = ads.filter(ad => ad.status === 'inactive').length;

        const html = `
            <div class="advertisements-container">
                <div class="section-header">
                    <h2>📢 Ad Manager</h2>
                    <p class="subtitle">Manage advertisements displayed on your quotation website</p>
                    <div class="header-actions">
                        <button class="btn btn-primary" onclick="OMS.showCreateAdModal()">
                            ➕ Create New Ad
                        </button>
                    </div>
                </div>

                <!-- Stats Cards -->
                <div class="ad-stats-grid">
                    <div class="stat-card stat-active">
                        <div class="stat-icon">✅</div>
                        <div class="stat-info">
                            <div class="stat-value">${activeAds}</div>
                            <div class="stat-label">Active Ads</div>
                        </div>
                    </div>
                    <div class="stat-card stat-scheduled">
                        <div class="stat-icon">⏰</div>
                        <div class="stat-info">
                            <div class="stat-value">${scheduledAds}</div>
                            <div class="stat-label">Scheduled</div>
                        </div>
                    </div>
                    <div class="stat-card stat-inactive">
                        <div class="stat-icon">⏸️</div>
                        <div class="stat-info">
                            <div class="stat-value">${inactiveAds}</div>
                            <div class="stat-label">Inactive</div>
                        </div>
                    </div>
                    <div class="stat-card stat-total">
                        <div class="stat-icon">📊</div>
                        <div class="stat-info">
                            <div class="stat-value">${ads.length}</div>
                            <div class="stat-label">Total Ads</div>
                        </div>
                    </div>
                </div>

                <!-- Filter Tabs -->
                <div class="ad-filters">
                    <button class="filter-btn active" data-filter="all" onclick="OMS.filterAds('all')">
                        All (${ads.length})
                    </button>
                    <button class="filter-btn" data-filter="active" onclick="OMS.filterAds('active')">
                        Active (${activeAds})
                    </button>
                    <button class="filter-btn" data-filter="scheduled" onclick="OMS.filterAds('scheduled')">
                        Scheduled (${scheduledAds})
                    </button>
                    <button class="filter-btn" data-filter="inactive" onclick="OMS.filterAds('inactive')">
                        Inactive (${inactiveAds})
                    </button>
                </div>

                <!-- Ads Grid -->
                <div class="ads-grid" id="ads-grid">
                    ${ads.length === 0 ? `
                        <div class="empty-state">
                            <div class="empty-icon">📢</div>
                            <h3>No Advertisements Yet</h3>
                            <p>Create your first ad to display on your quotation website</p>
                            <button class="btn btn-primary" onclick="OMS.showCreateAdModal()">
                                Create First Ad
                            </button>
                        </div>
                    ` : ads.map((ad, index) => this.renderAdCard(oms, ad, index)).join('')}
                </div>
            </div>

            <style>
                .advertisements-container {
                    padding: 20px;
                    max-width: 1400px;
                    margin: 0 auto;
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

                .header-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                /* Stats Grid */
                .ad-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .stat-card {
                    background: white;
                    padding: 20px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    transition: transform 0.2s;
                }

                .stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
                }

                .stat-icon {
                    font-size: 32px;
                    width: 60px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 12px;
                }

                .stat-active .stat-icon { background: rgba(16, 185, 129, 0.1); }
                .stat-scheduled .stat-icon { background: rgba(245, 158, 11, 0.1); }
                .stat-inactive .stat-icon { background: rgba(107, 114, 128, 0.1); }
                .stat-total .stat-icon { background: rgba(139, 92, 246, 0.1); }

                .stat-info {
                    flex: 1;
                }

                .stat-value {
                    font-size: 28px;
                    font-weight: 700;
                    color: #333;
                }

                .stat-label {
                    font-size: 14px;
                    color: #666;
                }

                /* Filters */
                .ad-filters {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 24px;
                    overflow-x: auto;
                    padding-bottom: 8px;
                }

                .filter-btn {
                    padding: 10px 20px;
                    border: 2px solid #e5e7eb;
                    background: white;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .filter-btn:hover {
                    border-color: #8b5cf6;
                    background: rgba(139, 92, 246, 0.05);
                }

                .filter-btn.active {
                    background: #8b5cf6;
                    color: white;
                    border-color: #8b5cf6;
                }

                /* Ads Grid */
                .ads-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
                    gap: 24px;
                }

                .ad-card {
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    transition: all 0.3s ease;
                    border: 2px solid #e9ecef;
                }

                .ad-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
                }

                .ad-card.hidden {
                    display: none;
                }

                /* Ad Preview */
                .ad-preview {
                    position: relative;
                    width: 100%;
                    min-height: 200px;
                    background: #f8f9fa;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }

                .ad-preview img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .ad-preview iframe {
                    width: 100%;
                    height: 250px;
                    border: none;
                }

                .ad-preview-text {
                    padding: 30px;
                    text-align: center;
                }

                .ad-preview-text h3 {
                    font-size: 24px;
                    margin-bottom: 12px;
                    color: #333;
                }

                .ad-preview-text p {
                    color: #666;
                    line-height: 1.6;
                }

                /* Status Badge */
                .ad-status-badge {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    backdrop-filter: blur(8px);
                }

                .status-active {
                    background: rgba(16, 185, 129, 0.9);
                    color: white;
                }

                .status-scheduled {
                    background: rgba(245, 158, 11, 0.9);
                    color: white;
                }

                .status-inactive {
                    background: rgba(107, 114, 128, 0.9);
                    color: white;
                }

                /* Type Badge */
                .ad-type-badge {
                    position: absolute;
                    top: 12px;
                    left: 12px;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    backdrop-filter: blur(8px);
                }

                /* Ad Info */
                .ad-info {
                    padding: 20px;
                }

                .ad-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 8px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .ad-meta {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 16px;
                    font-size: 13px;
                    color: #6c757d;
                }

                .ad-meta-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                /* Analytics */
                .ad-analytics {
                    display: flex;
                    gap: 16px;
                    padding: 12px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    margin-bottom: 16px;
                }

                .analytics-item {
                    flex: 1;
                    text-align: center;
                }

                .analytics-value {
                    font-size: 20px;
                    font-weight: 700;
                    color: #333;
                }

                .analytics-label {
                    font-size: 12px;
                    color: #6c757d;
                }

                /* Actions */
                .ad-actions {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 8px;
                }

                .ad-actions button {
                    padding: 10px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 13px;
                    transition: all 0.2s;
                }

                .btn-toggle {
                    background: #f59e0b;
                    color: white;
                }

                .btn-toggle:hover {
                    background: #d97706;
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

                /* Empty State */
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

                /* Responsive */
                @media (max-width: 768px) {
                    .ads-grid {
                        grid-template-columns: 1fr;
                    }

                    .ad-stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            </style>
        `;

        document.getElementById('advertisements').innerHTML = html;
    },

    /**
     * Render individual ad card
     * @param {Object} oms - OMS instance
     * @param {Object} ad - Ad data
     * @param {number} index - Ad index
     * @returns {string} HTML for ad card
     */
    renderAdCard(oms, ad, index) {
        const createdDate = new Date(ad.createdAt).toLocaleDateString();
        const statusClass = `status-${ad.status}`;
        const statusText = ad.status.charAt(0).toUpperCase() + ad.status.slice(1);

        // Get type icon
        const typeIcons = {
            image: '🖼️ Image',
            text: '📝 Text',
            video: '🎥 Video'
        };

        // Render preview based on type
        let previewHtml = '';
        if (ad.type === 'image' && ad.content.imageUrl) {
            previewHtml = `<img src="${ad.content.imageUrl}" alt="${ad.content.altText || ad.title}">`;
        } else if (ad.type === 'video' && ad.content.videoUrl) {
            const embedUrl = this.getEmbedUrl(ad.content.videoUrl);
            previewHtml = `<iframe src="${embedUrl}" allowfullscreen></iframe>`;
        } else if (ad.type === 'text') {
            previewHtml = `
                <div class="ad-preview-text" style="background: ${ad.content.backgroundColor || '#8b5cf6'}; color: ${ad.content.textColor || '#ffffff'};">
                    <h3>${ad.content.headline || 'Text Ad'}</h3>
                    <p>${ad.content.description || ''}</p>
                </div>
            `;
        }

        // Calculate analytics
        const views = ad.analytics?.views || 0;
        const clicks = ad.analytics?.clicks || 0;
        const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : 0;

        // Get placement info
        const placement = ad.placement?.position || 'header';
        const page = ad.placement?.page || 'all';

        return `
            <div class="ad-card" data-status="${ad.status}" data-type="${ad.type}">
                <div class="ad-preview">
                    ${previewHtml}
                    <div class="ad-status-badge ${statusClass}">${statusText}</div>
                    <div class="ad-type-badge">${typeIcons[ad.type]}</div>
                </div>
                <div class="ad-info">
                    <div class="ad-title">${ad.title}</div>
                    <div class="ad-meta">
                        <div class="ad-meta-item">📍 ${placement}</div>
                        <div class="ad-meta-item">📄 ${page}</div>
                        <div class="ad-meta-item">📅 ${createdDate}</div>
                        <div class="ad-meta-item">👁️ ${ad.isVisible ? 'Visible' : 'Hidden'}</div>
                    </div>

                    <!-- Analytics -->
                    <div class="ad-analytics">
                        <div class="analytics-item">
                            <div class="analytics-value">${views}</div>
                            <div class="analytics-label">Views</div>
                        </div>
                        <div class="analytics-item">
                            <div class="analytics-value">${clicks}</div>
                            <div class="analytics-label">Clicks</div>
                        </div>
                        <div class="analytics-item">
                            <div class="analytics-value">${ctr}%</div>
                            <div class="analytics-label">CTR</div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="ad-actions">
                        <button class="btn-toggle" onclick="OMS.toggleAdStatus('${ad.id}', ${index})">
                            ${ad.status === 'active' ? '⏸️ Pause' : '▶️ Activate'}
                        </button>
                        <button class="btn-edit" onclick="OMS.editAd(${index})">
                            ✏️ Edit
                        </button>
                        <button class="btn-delete" onclick="OMS.deleteAd('${ad.id}', ${index})">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Convert video URL to embed URL
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
    },

    /**
     * Filter ads by status
     * @param {Object} oms - OMS instance
     * @param {string} filter - Filter type (all, active, scheduled, inactive)
     */
    filterAds(oms, filter) {
        const cards = document.querySelectorAll('.ad-card');
        const filterBtns = document.querySelectorAll('.filter-btn');

        // Update active button
        filterBtns.forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Filter cards
        cards.forEach(card => {
            if (filter === 'all') {
                card.classList.remove('hidden');
            } else {
                if (card.dataset.status === filter) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            }
        });
    },

    /**
     * Show create ad modal
     * @param {Object} oms - OMS instance
     */
    showCreateAdModal(oms) {
        const modalHtml = `
            <div class="modal-overlay" id="adModalOverlay" onclick="OMS.closeAdModal()"></div>
            <div class="modal-content ad-modal" id="adModal">
                <div class="modal-header">
                    <h3>➕ Create New Advertisement</h3>
                    <button class="modal-close" onclick="OMS.closeAdModal()">✕</button>
                </div>
                <div class="modal-body">
                    <!-- Ad Type Selection -->
                    <div class="form-group">
                        <label>Ad Type *</label>
                        <div class="ad-type-selector">
                            <button type="button" class="type-btn active" data-type="image" onclick="OMS.selectAdType('image')">
                                🖼️ Image Ad
                            </button>
                            <button type="button" class="type-btn" data-type="text" onclick="OMS.selectAdType('text')">
                                📝 Text Ad
                            </button>
                            <button type="button" class="type-btn" data-type="video" onclick="OMS.selectAdType('video')">
                                🎥 Video Ad
                            </button>
                        </div>
                    </div>

                    <!-- Common Fields -->
                    <div class="form-group">
                        <label>Ad Title *</label>
                        <input type="text" id="adTitle" class="form-control" placeholder="e.g., Summer Special Offer">
                    </div>

                    <!-- Image Ad Fields -->
                    <div id="imageAdFields" class="ad-type-fields">
                        <div class="form-group">
                            <label>Upload Image *</label>
                            <input type="file" id="adImageFile" class="form-control" accept="image/*" onchange="OMS.previewAdImage(event)">
                            <small>Recommended: 1920x400px for header, Max: 5MB</small>
                            <div id="imagePreview" style="margin-top: 12px; display: none;">
                                <img id="imagePreviewImg" style="max-width: 100%; border-radius: 8px;">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Link URL</label>
                            <input type="url" id="adImageLink" class="form-control" placeholder="https://example.com">
                        </div>
                        <div class="form-group">
                            <label>Alt Text</label>
                            <input type="text" id="adImageAlt" class="form-control" placeholder="Promotional banner">
                        </div>
                    </div>

                    <!-- Text Ad Fields -->
                    <div id="textAdFields" class="ad-type-fields" style="display: none;">
                        <div class="form-group">
                            <label>Headline *</label>
                            <input type="text" id="adTextHeadline" class="form-control" placeholder="Get 20% Off!">
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="adTextDescription" class="form-control" rows="3" placeholder="Limited time offer..."></textarea>
                        </div>
                        <div class="form-group">
                            <label>Button Text</label>
                            <input type="text" id="adTextButton" class="form-control" placeholder="Learn More">
                        </div>
                        <div class="form-group">
                            <label>Button Link</label>
                            <input type="url" id="adTextLink" class="form-control" placeholder="https://example.com">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Background Color</label>
                                <input type="color" id="adTextBgColor" class="form-control" value="#8b5cf6">
                            </div>
                            <div class="form-group">
                                <label>Text Color</label>
                                <input type="color" id="adTextColor" class="form-control" value="#ffffff">
                            </div>
                        </div>
                    </div>

                    <!-- Video Ad Fields -->
                    <div id="videoAdFields" class="ad-type-fields" style="display: none;">
                        <div class="form-group">
                            <label>Video Source *</label>
                            <select id="adVideoSource" class="form-control" onchange="OMS.changeVideoSource()">
                                <option value="youtube">YouTube URL</option>
                                <option value="instagram">Instagram URL</option>
                                <option value="upload">Upload Video File</option>
                            </select>
                        </div>
                        <div class="form-group" id="videoUrlField">
                            <label>Video URL *</label>
                            <input type="url" id="adVideoUrl" class="form-control" placeholder="Paste YouTube or Instagram link">
                        </div>
                        <div class="form-group" id="videoUploadField" style="display: none;">
                            <label>Upload Video *</label>
                            <input type="file" id="adVideoFile" class="form-control" accept="video/*">
                            <small>Max: 50MB</small>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="adVideoAutoplay" checked>
                                Autoplay video
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="adVideoMuted" checked>
                                Muted by default
                            </label>
                        </div>
                    </div>

                    <!-- Placement Settings -->
                    <div class="form-section">
                        <h4>📍 Placement Settings</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Position *</label>
                                <select id="adPosition" class="form-control">
                                    <option value="header">Header Banner</option>
                                    <option value="sidebar">Sidebar</option>
                                    <option value="footer">Footer</option>
                                    <option value="popup">Popup/Modal</option>
                                    <option value="between-sections">Between Sections</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Display On *</label>
                                <select id="adPage" class="form-control">
                                    <option value="all">All Pages</option>
                                    <option value="home">Home Page Only</option>
                                    <option value="quotation">Quotation Page Only</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Schedule Settings -->
                    <div class="form-section">
                        <h4>⏰ Schedule Settings</h4>
                        <div class="form-group">
                            <label>Status *</label>
                            <select id="adStatus" class="form-control" onchange="OMS.toggleScheduleFields()">
                                <option value="active">Active Now</option>
                                <option value="scheduled">Schedule for Later</option>
                                <option value="inactive">Inactive (Draft)</option>
                            </select>
                        </div>
                        <div id="scheduleFields" style="display: none;">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Start Date</label>
                                    <input type="datetime-local" id="adStartDate" class="form-control">
                                </div>
                                <div class="form-group">
                                    <label>End Date</label>
                                    <input type="datetime-local" id="adEndDate" class="form-control">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Visibility -->
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="adVisible" checked>
                            Show ad on website
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="OMS.closeAdModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="OMS.saveAd()" id="saveAdBtn">Create Ad</button>
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
                    animation: fadeIn 0.2s;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .ad-modal {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    border-radius: 16px;
                    width: 90%;
                    max-width: 700px;
                    max-height: 90vh;
                    overflow-y: auto;
                    z-index: 9999;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    animation: slideUp 0.3s;
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -40%);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%);
                    }
                }

                .modal-header {
                    padding: 24px;
                    border-bottom: 1px solid #e9ecef;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: sticky;
                    top: 0;
                    background: white;
                    z-index: 10;
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

                .form-section {
                    margin: 24px 0;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 12px;
                }

                .form-section h4 {
                    margin-bottom: 16px;
                    font-size: 18px;
                    color: #333;
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
                    border-color: #8b5cf6;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                .form-group small {
                    display: block;
                    margin-top: 6px;
                    color: #6c757d;
                    font-size: 13px;
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: normal;
                    cursor: pointer;
                }

                .checkbox-label input[type="checkbox"] {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                }

                /* Ad Type Selector */
                .ad-type-selector {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                }

                .type-btn {
                    padding: 16px;
                    border: 2px solid #e9ecef;
                    background: white;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.2s;
                }

                .type-btn:hover {
                    border-color: #8b5cf6;
                    background: rgba(139, 92, 246, 0.05);
                }

                .type-btn.active {
                    background: #8b5cf6;
                    color: white;
                    border-color: #8b5cf6;
                }

                .modal-footer {
                    padding: 20px 24px;
                    border-top: 1px solid #e9ecef;
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                    position: sticky;
                    bottom: 0;
                    background: white;
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
                    background: #8b5cf6;
                    color: white;
                }

                .btn-primary:hover {
                    background: #7c3aed;
                }

                .btn-secondary {
                    background: #e9ecef;
                    color: #495057;
                }

                .btn-secondary:hover {
                    background: #dee2e6;
                }

                @media (max-width: 768px) {
                    .ad-type-selector,
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        `;

        // Remove existing modal if any
        const existing = document.querySelector('.modal-overlay');
        if (existing) existing.remove();
        const existingModal = document.querySelector('.ad-modal');
        if (existingModal) existingModal.remove();

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    /**
     * Select ad type
     * @param {Object} oms - OMS instance
     * @param {string} type - Ad type (image, text, video)
     */
    selectAdType(oms, type) {
        // Update active button
        document.querySelectorAll('.type-btn').forEach(btn => {
            if (btn.dataset.type === type) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Show/hide relevant fields
        document.getElementById('imageAdFields').style.display = type === 'image' ? 'block' : 'none';
        document.getElementById('textAdFields').style.display = type === 'text' ? 'block' : 'none';
        document.getElementById('videoAdFields').style.display = type === 'video' ? 'block' : 'none';
    },

    /**
     * Toggle schedule fields based on status
     * @param {Object} oms - OMS instance
     */
    toggleScheduleFields(oms) {
        const status = document.getElementById('adStatus').value;
        const scheduleFields = document.getElementById('scheduleFields');
        scheduleFields.style.display = status === 'scheduled' ? 'block' : 'none';
    },

    /**
     * Change video source type
     * @param {Object} oms - OMS instance
     */
    changeVideoSource(oms) {
        const source = document.getElementById('adVideoSource').value;
        const urlField = document.getElementById('videoUrlField');
        const uploadField = document.getElementById('videoUploadField');

        if (source === 'upload') {
            urlField.style.display = 'none';
            uploadField.style.display = 'block';
        } else {
            urlField.style.display = 'block';
            uploadField.style.display = 'none';
        }
    },

    /**
     * Preview ad image
     * @param {Event} event - File input change event
     */
    previewAdImage(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('imagePreview');
                const img = document.getElementById('imagePreviewImg');
                img.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    },

    /**
     * Close ad modal
     */
    closeAdModal() {
        const overlay = document.getElementById('adModalOverlay');
        if (overlay) overlay.remove();

        const modal = document.getElementById('adModal');
        if (modal) modal.remove();
    },

    /**
     * Save new ad
     * @param {Object} oms - OMS instance
     */
    async saveAd(oms) {
        const saveBtn = document.getElementById('saveAdBtn');
        const originalText = saveBtn.textContent;

        try {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';

            // Get active ad type
            const activeTypeBtn = document.querySelector('.type-btn.active');
            const adType = activeTypeBtn.dataset.type;

            // Get common fields
            const title = document.getElementById('adTitle').value.trim();
            if (!title) {
                alert('Please enter an ad title');
                return;
            }

            const status = document.getElementById('adStatus').value;
            const position = document.getElementById('adPosition').value;
            const page = document.getElementById('adPage').value;
            const isVisible = document.getElementById('adVisible').checked;

            // Build content object based on type
            let content = {};

            if (adType === 'image') {
                const imageFile = document.getElementById('adImageFile').files[0];
                if (!imageFile) {
                    alert('Please select an image file');
                    return;
                }

                // Upload image to Firebase Storage
                const imageUrl = await oms.uploadAdImage(imageFile);

                content = {
                    imageUrl,
                    link: document.getElementById('adImageLink').value.trim(),
                    altText: document.getElementById('adImageAlt').value.trim()
                };
            } else if (adType === 'text') {
                const headline = document.getElementById('adTextHeadline').value.trim();
                if (!headline) {
                    alert('Please enter a headline');
                    return;
                }

                content = {
                    headline,
                    description: document.getElementById('adTextDescription').value.trim(),
                    buttonText: document.getElementById('adTextButton').value.trim(),
                    buttonLink: document.getElementById('adTextLink').value.trim(),
                    backgroundColor: document.getElementById('adTextBgColor').value,
                    textColor: document.getElementById('adTextColor').value
                };
            } else if (adType === 'video') {
                const videoSource = document.getElementById('adVideoSource').value;

                if (videoSource === 'upload') {
                    const videoFile = document.getElementById('adVideoFile').files[0];
                    if (!videoFile) {
                        alert('Please select a video file');
                        return;
                    }

                    // Upload video to Firebase Storage
                    const videoUrl = await oms.uploadAdVideo(videoFile);
                    content = {
                        videoUrl,
                        platform: 'upload',
                        autoplay: document.getElementById('adVideoAutoplay').checked,
                        muted: document.getElementById('adVideoMuted').checked
                    };
                } else {
                    const videoUrl = document.getElementById('adVideoUrl').value.trim();
                    if (!videoUrl) {
                        alert('Please enter a video URL');
                        return;
                    }

                    content = {
                        videoUrl,
                        platform: videoSource,
                        autoplay: document.getElementById('adVideoAutoplay').checked,
                        muted: document.getElementById('adVideoMuted').checked
                    };
                }
            }

            // Build schedule object
            const schedule = {};
            if (status === 'scheduled') {
                schedule.startDate = document.getElementById('adStartDate').value;
                schedule.endDate = document.getElementById('adEndDate').value;
            }

            // Create ad object
            const ad = {
                id: 'ad_' + Date.now(),
                type: adType,
                title,
                status,
                content,
                placement: {
                    position,
                    page,
                    displayOrder: 1
                },
                schedule,
                analytics: {
                    views: 0,
                    clicks: 0,
                    impressions: 0
                },
                isVisible,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: oms.currentUser?.email || 'admin'
            };

            // Save to data
            if (!oms.data.advertisements) {
                oms.data.advertisements = [];
            }
            oms.data.advertisements.push(ad);

            // Save to Firestore
            await oms.saveAdsToFirestore();

            this.closeAdModal();
            this.renderAdvertisements(oms);
            oms.showToast('✅ Advertisement created successfully!');
        } catch (error) {
            console.error('Error saving ad:', error);
            oms.showToast('❌ Error creating advertisement. Please try again.', 'error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = originalText;
        }
    },

    /**
     * Edit existing ad
     * @param {Object} oms - OMS instance
     * @param {number} index - Ad index
     */
    async editAd(oms, index) {
        const ad = oms.data.advertisements[index];
        this.showCreateAdModal(oms);

        // Pre-fill form
        setTimeout(() => {
            document.getElementById('adTitle').value = ad.title || '';
            document.getElementById('adStatus').value = ad.status || 'active';
            document.getElementById('adPosition').value = ad.placement?.position || 'header';
            document.getElementById('adPage').value = ad.placement?.page || 'all';
            document.getElementById('adVisible').checked = ad.isVisible !== false;

            // Select ad type
            this.selectAdType(oms, ad.type);

            // Fill type-specific fields
            if (ad.type === 'image') {
                document.getElementById('adImageLink').value = ad.content.link || '';
                document.getElementById('adImageAlt').value = ad.content.altText || '';
                if (ad.content.imageUrl) {
                    const preview = document.getElementById('imagePreview');
                    const img = document.getElementById('imagePreviewImg');
                    img.src = ad.content.imageUrl;
                    preview.style.display = 'block';
                }
            } else if (ad.type === 'text') {
                document.getElementById('adTextHeadline').value = ad.content.headline || '';
                document.getElementById('adTextDescription').value = ad.content.description || '';
                document.getElementById('adTextButton').value = ad.content.buttonText || '';
                document.getElementById('adTextLink').value = ad.content.buttonLink || '';
                document.getElementById('adTextBgColor').value = ad.content.backgroundColor || '#8b5cf6';
                document.getElementById('adTextColor').value = ad.content.textColor || '#ffffff';
            } else if (ad.type === 'video') {
                if (ad.content.platform === 'upload') {
                    document.getElementById('adVideoSource').value = 'upload';
                } else {
                    document.getElementById('adVideoSource').value = ad.content.platform || 'youtube';
                    document.getElementById('adVideoUrl').value = ad.content.videoUrl || '';
                }
                document.getElementById('adVideoAutoplay').checked = ad.content.autoplay !== false;
                document.getElementById('adVideoMuted').checked = ad.content.muted !== false;
            }

            // Fill schedule if exists
            if (ad.schedule?.startDate) {
                document.getElementById('adStartDate').value = ad.schedule.startDate;
            }
            if (ad.schedule?.endDate) {
                document.getElementById('adEndDate').value = ad.schedule.endDate;
            }

            this.toggleScheduleFields(oms);
        }, 100);

        // Change save button to update
        const saveBtn = document.getElementById('saveAdBtn');
        saveBtn.textContent = 'Update Ad';
        saveBtn.onclick = () => oms.updateAd(index);
    },

    /**
     * Update existing ad
     * @param {Object} oms - OMS instance
     * @param {number} index - Ad index
     */
    async updateAd(oms, index) {
        // Similar to saveAd but update existing ad
        const saveBtn = document.getElementById('saveAdBtn');
        const originalText = saveBtn.textContent;

        try {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Updating...';

            const ad = oms.data.advertisements[index];

            // Update fields (similar logic to saveAd)
            ad.title = document.getElementById('adTitle').value.trim();
            ad.status = document.getElementById('adStatus').value;
            ad.placement.position = document.getElementById('adPosition').value;
            ad.placement.page = document.getElementById('adPage').value;
            ad.isVisible = document.getElementById('adVisible').checked;
            ad.updatedAt = new Date().toISOString();

            // Update type-specific content
            if (ad.type === 'text') {
                ad.content.headline = document.getElementById('adTextHeadline').value.trim();
                ad.content.description = document.getElementById('adTextDescription').value.trim();
                ad.content.buttonText = document.getElementById('adTextButton').value.trim();
                ad.content.buttonLink = document.getElementById('adTextLink').value.trim();
                ad.content.backgroundColor = document.getElementById('adTextBgColor').value;
                ad.content.textColor = document.getElementById('adTextColor').value;
            }

            await oms.saveAdsToFirestore();
            this.closeAdModal();
            this.renderAdvertisements(oms);
            oms.showToast('✅ Advertisement updated successfully!');
        } catch (error) {
            console.error('Error updating ad:', error);
            oms.showToast('❌ Error updating advertisement. Please try again.', 'error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = originalText;
        }
    },

    /**
     * Toggle ad status (active/inactive)
     * @param {Object} oms - OMS instance
     * @param {string} adId - Ad ID
     * @param {number} index - Ad index
     */
    async toggleAdStatus(oms, adId, index) {
        try {
            const ad = oms.data.advertisements[index];

            if (ad.status === 'active') {
                ad.status = 'inactive';
            } else {
                ad.status = 'active';
            }

            ad.updatedAt = new Date().toISOString();

            await oms.saveAdsToFirestore();
            this.renderAdvertisements(oms);

            const statusText = ad.status === 'active' ? 'activated' : 'paused';
            oms.showToast(`✅ Ad ${statusText} successfully!`);
        } catch (error) {
            console.error('Error toggling ad status:', error);
            oms.showToast('❌ Error updating ad status. Please try again.', 'error');
        }
    },

    /**
     * Delete ad
     * @param {Object} oms - OMS instance
     * @param {string} adId - Ad ID
     * @param {number} index - Ad index
     */
    async deleteAd(oms, adId, index) {
        if (!confirm('Are you sure you want to delete this advertisement? This action cannot be undone.')) {
            return;
        }

        try {
            oms.data.advertisements.splice(index, 1);
            await oms.saveAdsToFirestore();
            this.renderAdvertisements(oms);
            oms.showToast('✅ Advertisement deleted successfully!');
        } catch (error) {
            console.error('Error deleting ad:', error);
            oms.showToast('❌ Error deleting advertisement. Please try again.', 'error');
        }
    }
};

// Make Advertisements available globally for backward compatibility
if (typeof window !== 'undefined') {
    window.Advertisements = Advertisements;
}

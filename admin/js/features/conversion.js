/* ============================================
   CONVERSION & MARKETING - All-in-one conversion optimization tools
   ============================================ */

/**
 * Marketing & Conversion Feature Module
 *
 * Provides unified management of:
 * 1. Popups & Alerts (Exit Intent, Social Proof, Sticky Bars)
 * 2. Content Management (Hero, Testimonials, Before/After, Trust Elements)
 * 3. Pricing & Campaigns (Dynamic Pricing, Incentives, Discount Campaigns)
 * 4. Communication (Email Templates, WhatsApp Templates, Chatbot)
 * 5. Display Settings (Instagram, Reviews, Comparison, Scarcity)
 * 6. Wizard Controls (Upsells, Customization, Messages)
 * 7. Availability Settings (Public Calendar Display)
 *
 * @exports Conversion
 */

import { Utils } from '../utils/helpers.js';

export const Conversion = {
    currentSection: 'popups', // Default section
    exitPopupsListenerActive: false, // Track if real-time listener is active

    /**
     * Render main Marketing & Conversion interface
     * @param {Object} oms - Reference to OMS
     */
    renderConversion(oms) {
        const container = document.getElementById('conversion');

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">🎯 Marketing & Conversion Tools</h2>
                    <p style="margin: 0.5rem 0 0; color: var(--text-gray); font-size: 0.9rem;">
                        Manage all website conversion optimization features from one place - no coding required!
                    </p>
                </div>

                <!-- Sub-navigation -->
                <div style="background: var(--bg-body); padding: 1rem; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);">
                    <div class="conversion-subnav" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <button class="conversion-subnav-btn active" data-section="popups">
                            🔔 Popups & Alerts
                        </button>
                        <button class="conversion-subnav-btn" data-section="content">
                            🎨 Content Management
                        </button>
                        <button class="conversion-subnav-btn" data-section="pricing">
                            💰 Pricing & Campaigns
                        </button>
                        <button class="conversion-subnav-btn" data-section="communication">
                            💬 Communication
                        </button>
                        <button class="conversion-subnav-btn" data-section="display">
                            👁️ Display Settings
                        </button>
                        <button class="conversion-subnav-btn" data-section="wizard">
                            🧙 Wizard Controls
                        </button>
                        <button class="conversion-subnav-btn" data-section="availability">
                            📅 Availability
                        </button>
                        <button class="conversion-subnav-btn" data-section="videos">
                            🎥 Videos
                        </button>
                        <button class="conversion-subnav-btn" data-section="ads">
                            📢 Ads
                        </button>
                        <button class="conversion-subnav-btn" data-section="packages">
                            📦 Packages
                        </button>
                        <button class="conversion-subnav-btn" data-section="leads">
                            🎯 Leads
                        </button>
                    </div>
                </div>

                <!-- Content Area -->
                <div id="conversionContent" style="padding: 1.5rem;">
                    <!-- Dynamic content loaded here -->
                </div>
            </div>

            <!-- CSS for sub-navigation -->
            <style>
                .conversion-subnav-btn {
                    background: var(--white);
                    border: 1px solid var(--border);
                    padding: 0.6rem 1rem;
                    border-radius: var(--radius);
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: var(--transition);
                    color: var(--text-dark);
                    font-weight: 500;
                }

                .conversion-subnav-btn:hover {
                    background: var(--bg-hover);
                    border-color: var(--primary);
                }

                .conversion-subnav-btn.active {
                    background: var(--primary);
                    color: var(--white);
                    border-color: var(--primary);
                }
            </style>
        `;

        // Add event listeners for sub-navigation
        const subnavBtns = container.querySelectorAll('.conversion-subnav-btn');
        subnavBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                subnavBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Render section
                const section = btn.dataset.section;
                this.currentSection = section;
                this.renderSection(section, oms);
            });
        });

        // Render default section
        this.renderSection(this.currentSection, oms);
    },

    /**
     * Render specific section content
     * @param {string} section - Section name
     * @param {Object} oms - Reference to OMS
     */
    async renderSection(section, oms) {
        const contentArea = document.getElementById('conversionContent');

        switch(section) {
            case 'popups':
                this.renderPopupsSection(oms, contentArea);
                break;
            case 'content':
                this.renderContentSection(oms, contentArea);
                break;
            case 'pricing':
                this.renderPricingSection(oms, contentArea);
                break;
            case 'communication':
                this.renderCommunicationSection(oms, contentArea);
                break;
            case 'display':
                this.renderDisplaySection(oms, contentArea);
                break;
            case 'wizard':
                this.renderWizardSection(oms, contentArea);
                break;
            case 'availability':
                this.renderAvailabilitySection(oms, contentArea);
                break;
            case 'videos':
                await this.renderVideosSection(oms, contentArea);
                break;
            case 'ads':
                await this.renderAdsSection(oms, contentArea);
                break;
            case 'packages':
                await this.renderPackagesSection(oms, contentArea);
                break;
            case 'leads':
                await this.renderLeadsSection(oms, contentArea);
                break;
            default:
                contentArea.innerHTML = '<p>Section not found</p>';
        }
    },

    /* =========================================
       SECTION 1: POPUPS & ALERTS
       ========================================= */
    renderPopupsSection(oms, container) {
        container.innerHTML = `
            <div style="margin-bottom: 2rem;">
                <h3 style="margin: 0 0 0.5rem;">🔔 Popups & Alerts Management</h3>
                <p style="color: var(--text-gray); margin: 0;">Create exit intent popups, social proof notifications, and sticky bars to capture leaving visitors</p>
            </div>

            <!-- Sub-tabs for Popups -->
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 2px solid var(--border); padding-bottom: 0.5rem; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 0.5rem;">
                    <button class="popup-subtab active" data-popup-type="exit-intent">Exit Intent Popups</button>
                    <button class="popup-subtab" data-popup-type="social-proof">Social Proof Notifications</button>
                    <button class="popup-subtab" data-popup-type="sticky-bar">Sticky Bars</button>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="Conversion.showPopupSettings()" style="white-space: nowrap;">
                    ⚙️ Popup Settings
                </button>
            </div>

            <div id="popupTypeContent">
                <!-- Dynamic content -->
            </div>

            <style>
                .popup-subtab {
                    background: none;
                    border: none;
                    padding: 0.5rem 1rem;
                    cursor: pointer;
                    font-weight: 500;
                    color: var(--text-gray);
                    border-bottom: 2px solid transparent;
                    transition: var(--transition);
                }
                .popup-subtab:hover {
                    color: var(--primary);
                }
                .popup-subtab.active {
                    color: var(--primary);
                    border-bottom-color: var(--primary);
                }
            </style>
        `;

        // Add subtab listeners
        const subtabs = container.querySelectorAll('.popup-subtab');
        subtabs.forEach(tab => {
            tab.addEventListener('click', () => {
                subtabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.renderPopupType(tab.dataset.popupType, oms);
            });
        });

        // Render default
        this.renderPopupType('exit-intent', oms);
    },

    renderPopupType(type, oms) {
        const typeContent = document.getElementById('popupTypeContent');

        if (type === 'exit-intent') {
            this.renderExitIntentPopups(oms, typeContent);
        } else if (type === 'social-proof') {
            this.renderSocialProofNotifications(oms, typeContent);
        } else if (type === 'sticky-bar') {
            this.renderStickyBars(oms, typeContent);
        }
    },

    async renderExitIntentPopups(oms, container) {
        // Load existing popups
        const popups = await this.loadExitIntentPopups(oms);

        // Set up real-time listener for analytics updates (only once)
        if (!this.exitPopupsListenerActive) {
            const db = window.db;
            if (db) {
                console.log('🔧 Setting up real-time analytics listener for exit_intent_popups collection...');
                db.collection('exit_intent_popups').onSnapshot(
                    (snapshot) => {
                        console.log('📊 Firestore snapshot received! Changes:', snapshot.docChanges().length);
                        snapshot.docChanges().forEach(change => {
                            console.log(`  - ${change.type}: ${change.doc.id}`, change.doc.data().analytics);
                        });

                        // Reload popups and re-render without setting up another listener
                        this.loadExitIntentPopups(oms).then(updatedPopups => {
                            const grid = document.getElementById('exitPopupsGrid');
                            if (grid) {
                                console.log('✅ Updating popup grid with', updatedPopups.length, 'popups');
                                if (updatedPopups.length > 0) {
                                    grid.innerHTML = updatedPopups.map(popup => this.renderExitPopupCard(popup, oms)).join('');
                                } else {
                                    grid.innerHTML = `
                                        <div class="empty-state">
                                            <div style="font-size: 2rem; margin-bottom: 1rem;">📭</div>
                                            <p>No popups created yet</p>
                                        </div>
                                    `;
                                }
                            } else {
                                console.warn('⚠️ exitPopupsGrid element not found');
                            }
                        }).catch(error => {
                            console.error('❌ Error reloading popups:', error);
                        });
                    },
                    (error) => {
                        console.error('❌ Error in analytics listener:', error);
                    }
                );
                this.exitPopupsListenerActive = true;
                console.log('✅ Real-time analytics listener activated for exit_intent_popups');
            } else {
                console.error('❌ Firebase DB not available - cannot set up real-time listener');
            }
        } else {
            console.log('ℹ️ Real-time listener already active, skipping setup');
        }

        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <div>
                    <h4 style="margin: 0;">Exit Intent Popups</h4>
                    <p style="margin: 0.25rem 0 0; color: var(--text-gray); font-size: 0.85rem;">
                        Show special offers when visitors try to leave your website
                    </p>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary" onclick="Conversion.refreshExitPopups()" title="Refresh analytics manually">
                        🔄 Refresh
                    </button>
                    <button class="btn btn-primary" onclick="Conversion.showCreateExitPopupModal()">
                        ➕ Create New Popup
                    </button>
                </div>
            </div>

            <!-- Stats Cards -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                <div class="stat-card">
                    <div class="stat-value">${popups.filter(p => p.status === 'active').length}</div>
                    <div class="stat-label">Active Popups</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${popups.filter(p => p.status === 'scheduled').length}</div>
                    <div class="stat-label">Scheduled</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${popups.filter(p => p.status === 'inactive').length}</div>
                    <div class="stat-label">Inactive</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${popups.reduce((sum, p) => sum + (p.analytics?.views || 0), 0)}</div>
                    <div class="stat-label">Total Views</div>
                </div>
            </div>

            <!-- Filter Buttons -->
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                <button class="filter-btn active" data-filter="all">All (${popups.length})</button>
                <button class="filter-btn" data-filter="active">Active (${popups.filter(p => p.status === 'active').length})</button>
                <button class="filter-btn" data-filter="scheduled">Scheduled (${popups.filter(p => p.status === 'scheduled').length})</button>
                <button class="filter-btn" data-filter="inactive">Inactive (${popups.filter(p => p.status === 'inactive').length})</button>
            </div>

            <!-- Popups Grid -->
            <div id="exitPopupsGrid" class="popups-grid">
                ${popups.length === 0 ? `
                    <div class="empty-state">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">🎯</div>
                        <h3>No Exit Intent Popups Yet</h3>
                        <p>Create your first popup to capture leaving visitors with special offers</p>
                        <button class="btn btn-primary" onclick="Conversion.showCreateExitPopupModal()">
                            Create Your First Popup
                        </button>
                    </div>
                ` : popups.map(popup => this.renderExitPopupCard(popup, oms)).join('')}
            </div>

            <style>
                .popups-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 1.5rem;
                }

                .popup-card {
                    background: var(--white);
                    border: 1px solid var(--border);
                    border-radius: var(--radius);
                    overflow: hidden;
                    transition: var(--transition);
                }

                .popup-card:hover {
                    box-shadow: var(--shadow-lg);
                    transform: translateY(-2px);
                }

                .popup-card-header {
                    padding: 1rem;
                    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
                    color: var(--white);
                }

                .popup-card-body {
                    padding: 1rem;
                }

                .popup-card-footer {
                    padding: 1rem;
                    background: var(--bg-body);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 1px solid var(--border);
                }

                .filter-btn {
                    background: var(--white);
                    border: 1px solid var(--border);
                    padding: 0.4rem 0.8rem;
                    border-radius: var(--radius);
                    cursor: pointer;
                    font-size: 0.85rem;
                    transition: var(--transition);
                }

                .filter-btn:hover {
                    border-color: var(--primary);
                    color: var(--primary);
                }

                .filter-btn.active {
                    background: var(--primary);
                    color: var(--white);
                    border-color: var(--primary);
                }

                .empty-state {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 3rem 1rem;
                    color: var(--text-gray);
                }
            </style>
        `;

        // Add filter functionality
        const filterBtns = container.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterExitPopups(btn.dataset.filter, popups, oms);
            });
        });
    },

    renderExitPopupCard(popup, oms) {
        const statusColors = {
            active: 'var(--success)',
            scheduled: 'var(--warning)',
            inactive: 'var(--text-gray)'
        };

        return `
            <div class="popup-card" data-popup-id="${popup.id}">
                <div class="popup-card-header">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 0.5rem; font-size: 1.1rem;">${Utils.escapeHtml(popup.title)}</h4>
                            <div style="display: flex; gap: 0.5rem; align-items: center; font-size: 0.85rem; opacity: 0.9;">
                                <span style="background: rgba(255,255,255,0.2); padding: 0.2rem 0.6rem; border-radius: 12px;">
                                    ${popup.discountText || 'No discount'}
                                </span>
                            </div>
                        </div>
                        <span style="background: ${statusColors[popup.status]}; padding: 0.3rem 0.8rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; white-space: nowrap;">
                            ${popup.status.toUpperCase()}
                        </span>
                    </div>
                </div>

                <div class="popup-card-body">
                    <div style="margin-bottom: 1rem;">
                        <div style="font-size: 0.85rem; color: var(--text-gray); margin-bottom: 0.5rem;">
                            <strong>Pages:</strong> ${popup.pages?.join(', ') || 'All pages'}
                        </div>
                        ${popup.schedule ? `
                            <div style="font-size: 0.85rem; color: var(--text-gray);">
                                <strong>Schedule:</strong> ${new Date(popup.schedule.startDate).toLocaleDateString()} - ${new Date(popup.schedule.endDate).toLocaleDateString()}
                            </div>
                        ` : ''}
                    </div>

                    <!-- Analytics -->
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-top: 1rem;">
                        <div style="text-align: center; padding: 0.5rem; background: var(--bg-body); border-radius: 4px;">
                            <div style="font-size: 1.2rem; font-weight: 600; color: var(--primary);">
                                ${popup.analytics?.views || 0}
                            </div>
                            <div style="font-size: 0.7rem; color: var(--text-gray);">Views</div>
                        </div>
                        <div style="text-align: center; padding: 0.5rem; background: var(--bg-body); border-radius: 4px;">
                            <div style="font-size: 1.2rem; font-weight: 600; color: var(--success);">
                                ${popup.analytics?.conversions || 0}
                            </div>
                            <div style="font-size: 0.7rem; color: var(--text-gray);">Conversions</div>
                        </div>
                        <div style="text-align: center; padding: 0.5rem; background: var(--bg-body); border-radius: 4px;">
                            <div style="font-size: 1.2rem; font-weight: 600; color: var(--info);">
                                ${popup.analytics?.views > 0 ? ((popup.analytics.conversions / popup.analytics.views) * 100).toFixed(1) : 0}%
                            </div>
                            <div style="font-size: 0.7rem; color: var(--text-gray);">CVR</div>
                        </div>
                    </div>
                </div>

                <div class="popup-card-footer">
                    <div style="display: flex; gap: 0.5rem;">
                        <label class="toggle-switch" title="Toggle Active/Inactive">
                            <input type="checkbox" ${popup.status === 'active' ? 'checked' : ''}
                                   onchange="Conversion.togglePopupStatus('${popup.id}', this.checked)">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-sm btn-secondary" onclick="Conversion.editExitPopup('${popup.id}')">
                            ✏️ Edit
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="Conversion.deleteExitPopup('${popup.id}')">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    filterExitPopups(filter, popups, oms) {
        const grid = document.getElementById('exitPopupsGrid');
        let filtered = popups;

        if (filter !== 'all') {
            filtered = popups.filter(p => p.status === filter);
        }

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">🔍</div>
                    <p>No ${filter} popups found</p>
                </div>
            `;
        } else {
            grid.innerHTML = filtered.map(popup => this.renderExitPopupCard(popup, oms)).join('');
        }
    },

    async loadExitIntentPopups(oms) {
        try {
            // Use window.db (Firebase Firestore instance initialized in admin panel)
            const db = window.db;
            if (!db) {
                console.error('Firebase not initialized');
                return [];
            }
            const snapshot = await db.collection('exit_intent_popups').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error loading exit intent popups:', error);
            return [];
        }
    },

    showCreateExitPopupModal(popupData = null) {
        const isEdit = popupData !== null;
        const modalId = 'exitPopupModal';

        // Remove existing modal if any
        const existingModal = document.getElementById(modalId);
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2 class="modal-title">${isEdit ? '✏️ Edit' : '➕ Create'} Exit Intent Popup</h2>
                    <button class="modal-close" onclick="document.getElementById('${modalId}').remove()">&times;</button>
                </div>

                <div class="modal-body">
                    <form id="exitPopupForm">
                        <!-- Basic Information -->
                        <div style="margin-bottom: 1.5rem;">
                            <h3 style="margin: 0 0 1rem; font-size: 1.1rem; color: var(--primary);">📝 Basic Information</h3>

                            <div class="form-group">
                                <label class="form-label">Popup Title *</label>
                                <input type="text" id="popup-title" class="form-input"
                                       placeholder="e.g., Wait! Don't Leave Without Your Quote"
                                       value="${isEdit ? Utils.escapeHtml(popupData.title) : ''}" required>
                                <small style="color: var(--text-gray);">This is the main headline visitors will see</small>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Discount/Offer Text *</label>
                                <input type="text" id="popup-discount" class="form-input"
                                       placeholder="e.g., Get 15% OFF if you book in next 10 minutes"
                                       value="${isEdit ? Utils.escapeHtml(popupData.discountText || '') : ''}" required>
                                <small style="color: var(--text-gray);">Describe the special offer</small>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Description (Optional)</label>
                                <textarea id="popup-description" class="form-input" rows="3"
                                          placeholder="Additional details about the offer...">${isEdit ? Utils.escapeHtml(popupData.description || '') : ''}</textarea>
                            </div>
                        </div>

                        <!-- Countdown Timer -->
                        <div style="margin-bottom: 1.5rem;">
                            <h3 style="margin: 0 0 1rem; font-size: 1.1rem; color: var(--primary);">⏰ Countdown Timer</h3>

                            <div class="form-group">
                                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                    <input type="checkbox" id="popup-countdown-enabled"
                                           ${isEdit && popupData.countdown?.enabled ? 'checked' : ''}>
                                    <span>Enable countdown timer (creates urgency)</span>
                                </label>
                            </div>

                            <div class="form-group" id="countdown-duration-group" style="display: ${isEdit && popupData.countdown?.enabled ? 'block' : 'none'};">
                                <label class="form-label">Duration (minutes)</label>
                                <input type="number" id="popup-countdown-duration" class="form-input"
                                       min="1" max="60" value="${isEdit && popupData.countdown?.durationMinutes ? popupData.countdown.durationMinutes : 10}">
                            </div>
                        </div>

                        <!-- Call-to-Action Button -->
                        <div style="margin-bottom: 1.5rem;">
                            <h3 style="margin: 0 0 1rem; font-size: 1.1rem; color: var(--primary);">🎯 Call-to-Action Button</h3>

                            <div class="form-group">
                                <label class="form-label">Button Text *</label>
                                <input type="text" id="popup-button-text" class="form-input"
                                       placeholder="e.g., Get My Discount Now"
                                       value="${isEdit ? Utils.escapeHtml(popupData.buttonText || 'Get Quote') : 'Get Quote'}" required>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div class="form-group">
                                    <label class="form-label">Button Color</label>
                                    <input type="color" id="popup-button-color" class="form-input"
                                           value="${isEdit ? popupData.buttonColor || '#8B5CF6' : '#8B5CF6'}"
                                           style="height: 50px;">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Text Color</label>
                                    <input type="color" id="popup-button-text-color" class="form-input"
                                           value="${isEdit ? popupData.buttonTextColor || '#FFFFFF' : '#FFFFFF'}"
                                           style="height: 50px;">
                                </div>
                            </div>
                        </div>

                        <!-- Background & Styling -->
                        <div style="margin-bottom: 1.5rem;">
                            <h3 style="margin: 0 0 1rem; font-size: 1.1rem; color: var(--primary);">🎨 Background & Styling</h3>

                            <div class="form-group">
                                <label class="form-label">Background Image URL (Optional)</label>
                                <input type="url" id="popup-bg-image" class="form-input"
                                       placeholder="https://example.com/background.jpg"
                                       value="${isEdit ? popupData.backgroundImage || '' : ''}">
                                <small style="color: var(--text-gray);">Leave empty for solid color background</small>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Background Color</label>
                                <input type="color" id="popup-bg-color" class="form-input"
                                       value="${isEdit ? popupData.backgroundColor || '#FFFFFF' : '#FFFFFF'}"
                                       style="height: 50px;">
                            </div>
                        </div>

                        <!-- Display Settings -->
                        <div style="margin-bottom: 1.5rem;">
                            <h3 style="margin: 0 0 1rem; font-size: 1.1rem; color: var(--primary);">👁️ Display Settings</h3>

                            <div class="form-group">
                                <label class="form-label">Show on Pages *</label>
                                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                                        <input type="checkbox" class="popup-pages" value="all"
                                               ${isEdit && popupData.pages?.includes('all') ? 'checked' : !isEdit ? 'checked' : ''}>
                                        <span>All Pages</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                                        <input type="checkbox" class="popup-pages" value="homepage"
                                               ${isEdit && popupData.pages?.includes('homepage') ? 'checked' : ''}>
                                        <span>Homepage Only</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                                        <input type="checkbox" class="popup-pages" value="quotation"
                                               ${isEdit && popupData.pages?.includes('quotation') ? 'checked' : ''}>
                                        <span>Quotation Page Only</span>
                                    </label>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Delay (seconds)</label>
                                <input type="number" id="popup-delay" class="form-input"
                                       min="0" max="60" value="${isEdit ? popupData.delay || 0 : 0}">
                                <small style="color: var(--text-gray);">Wait this many seconds before detecting exit intent</small>
                            </div>
                        </div>

                        <!-- Scheduling -->
                        <div style="margin-bottom: 1.5rem;">
                            <h3 style="margin: 0 0 1rem; font-size: 1.1rem; color: var(--primary);">📅 Scheduling (Optional)</h3>

                            <div class="form-group">
                                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                    <input type="checkbox" id="popup-schedule-enabled"
                                           ${isEdit && popupData.schedule ? 'checked' : ''}>
                                    <span>Schedule specific dates</span>
                                </label>
                            </div>

                            <div id="schedule-dates-group" style="display: ${isEdit && popupData.schedule ? 'grid' : 'none'}; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div class="form-group">
                                    <label class="form-label">Start Date</label>
                                    <input type="date" id="popup-start-date" class="form-input"
                                           value="${isEdit && popupData.schedule?.startDate ? popupData.schedule.startDate : ''}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">End Date</label>
                                    <input type="date" id="popup-end-date" class="form-input"
                                           value="${isEdit && popupData.schedule?.endDate ? popupData.schedule.endDate : ''}">
                                </div>
                            </div>
                        </div>

                        <!-- Status -->
                        <div style="margin-bottom: 1.5rem;">
                            <h3 style="margin: 0 0 1rem; font-size: 1.1rem; color: var(--primary);">🚦 Status</h3>

                            <div class="form-group">
                                <label class="form-label">Initial Status</label>
                                <select id="popup-status" class="form-input">
                                    <option value="active" ${isEdit && popupData.status === 'active' ? 'selected' : ''}>Active (Show Immediately)</option>
                                    <option value="inactive" ${isEdit && popupData.status === 'inactive' ? 'selected' : ''}>Inactive (Don't Show)</option>
                                    <option value="scheduled" ${isEdit && popupData.status === 'scheduled' ? 'selected' : ''}>Scheduled (Show on Dates)</option>
                                </select>
                            </div>
                        </div>
                    </form>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('${modalId}').remove()">
                        Cancel
                    </button>
                    <button type="button" class="btn btn-primary" onclick="Conversion.saveExitPopup(${isEdit ? `'${popupData.id}'` : 'null'})">
                        ${isEdit ? '💾 Update Popup' : '✨ Create Popup'}
                    </button>
                </div>
            </div>

            <style>
                .modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: fadeIn 0.2s;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .modal-content {
                    background: var(--white);
                    border-radius: var(--radius);
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    animation: slideUp 0.3s;
                }

                @keyframes slideUp {
                    from { transform: translateY(50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .modal-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .modal-title {
                    margin: 0;
                    font-size: 1.5rem;
                }

                .modal-close {
                    background: none;
                    border: none;
                    font-size: 2rem;
                    cursor: pointer;
                    color: var(--text-gray);
                    line-height: 1;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                }

                .modal-close:hover {
                    color: var(--danger);
                }

                .modal-body {
                    padding: 1.5rem;
                }

                .modal-footer {
                    padding: 1rem 1.5rem;
                    border-top: 1px solid var(--border);
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.5rem;
                }

                .form-group {
                    margin-bottom: 1rem;
                }

                .form-label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                    color: var(--text-dark);
                }

                .form-input {
                    width: 100%;
                    padding: 0.6rem;
                    border: 1px solid var(--border);
                    border-radius: var(--radius);
                    font-size: 0.95rem;
                    transition: var(--transition);
                }

                .form-input:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
                }
            </style>
        `;

        document.body.appendChild(modal);

        // Add event listeners for conditional fields
        const countdownEnabled = document.getElementById('popup-countdown-enabled');
        const countdownDurationGroup = document.getElementById('countdown-duration-group');
        countdownEnabled.addEventListener('change', (e) => {
            countdownDurationGroup.style.display = e.target.checked ? 'block' : 'none';
        });

        const scheduleEnabled = document.getElementById('popup-schedule-enabled');
        const scheduleDatesGroup = document.getElementById('schedule-dates-group');
        scheduleEnabled.addEventListener('change', (e) => {
            scheduleDatesGroup.style.display = e.target.checked ? 'grid' : 'none';
        });

        // Handle "All Pages" checkbox logic
        const pagesCheckboxes = document.querySelectorAll('.popup-pages');
        pagesCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.value === 'all' && e.target.checked) {
                    pagesCheckboxes.forEach(cb => {
                        if (cb.value !== 'all') cb.checked = false;
                    });
                } else if (e.target.value !== 'all' && e.target.checked) {
                    pagesCheckboxes.forEach(cb => {
                        if (cb.value === 'all') cb.checked = false;
                    });
                }
            });
        });
    },

    async saveExitPopup(popupId) {
        const db = window.db;
        if (!db) {
            alert('Firebase not initialized');
            return;
        }

        // Gather form data
        const title = document.getElementById('popup-title').value.trim();
        const discountText = document.getElementById('popup-discount').value.trim();
        const description = document.getElementById('popup-description').value.trim();
        const buttonText = document.getElementById('popup-button-text').value.trim();
        const buttonColor = document.getElementById('popup-button-color').value;
        const buttonTextColor = document.getElementById('popup-button-text-color').value;
        const backgroundImage = document.getElementById('popup-bg-image').value.trim();
        const backgroundColor = document.getElementById('popup-bg-color').value;
        const delay = parseInt(document.getElementById('popup-delay').value);
        const status = document.getElementById('popup-status').value;

        // Validate required fields
        if (!title || !discountText || !buttonText) {
            alert('Please fill in all required fields');
            return;
        }

        // Get selected pages
        const pagesCheckboxes = document.querySelectorAll('.popup-pages:checked');
        const pages = Array.from(pagesCheckboxes).map(cb => cb.value);
        if (pages.length === 0) {
            alert('Please select at least one page to display the popup');
            return;
        }

        // Countdown settings
        const countdownEnabled = document.getElementById('popup-countdown-enabled').checked;
        const countdown = countdownEnabled ? {
            enabled: true,
            durationMinutes: parseInt(document.getElementById('popup-countdown-duration').value)
        } : { enabled: false };

        // Schedule settings
        const scheduleEnabled = document.getElementById('popup-schedule-enabled').checked;
        const schedule = scheduleEnabled ? {
            startDate: document.getElementById('popup-start-date').value,
            endDate: document.getElementById('popup-end-date').value
        } : null;

        // Build popup data object
        const popupData = {
            title,
            discountText,
            description,
            buttonText,
            buttonColor,
            buttonTextColor,
            backgroundImage,
            backgroundColor,
            pages,
            delay,
            countdown,
            schedule,
            status,
            updatedAt: new Date().toISOString()
        };

        // Only add analytics for new popups (not updates)
        if (!popupId) {
            popupData.analytics = {
                views: 0,
                conversions: 0,
                dismissals: 0
            };
            popupData.createdAt = new Date().toISOString();
        }

        try {
            if (popupId) {
                // Update existing popup
                await db.collection('exit_intent_popups').doc(popupId).update(popupData);
                alert('✅ Popup updated successfully!');
            } else {
                // Create new popup
                await db.collection('exit_intent_popups').add(popupData);
                alert('✅ Popup created successfully!');
            }

            // Close modal
            document.getElementById('exitPopupModal').remove();

            // Refresh the list
            this.renderPopupType('exit-intent', window.OMS);
        } catch (error) {
            console.error('Error saving popup:', error);
            alert('❌ Error saving popup: ' + error.message);
        }
    },

    async togglePopupStatus(popupId, isActive) {
        const db = window.db;
        if (!db) return;

        try {
            const newStatus = isActive ? 'active' : 'inactive';
            await db.collection('exit_intent_popups').doc(popupId).update({
                status: newStatus,
                updatedAt: new Date().toISOString()
            });

            console.log(`Popup ${popupId} status changed to ${newStatus}`);

            // Refresh the list
            setTimeout(() => {
                this.renderPopupType('exit-intent', window.OMS);
            }, 500);
        } catch (error) {
            console.error('Error toggling popup status:', error);
            alert('Error updating popup status');
        }
    },

    async editExitPopup(popupId) {
        const db = window.db;
        if (!db) return;

        try {
            const doc = await db.collection('exit_intent_popups').doc(popupId).get();
            if (doc.exists) {
                const popupData = { id: doc.id, ...doc.data() };
                this.showCreateExitPopupModal(popupData);
            }
        } catch (error) {
            console.error('Error loading popup:', error);
            alert('Error loading popup data');
        }
    },

    async deleteExitPopup(popupId) {
        if (!confirm('Are you sure you want to delete this popup? This action cannot be undone.')) {
            return;
        }

        const db = window.db;
        if (!db) return;

        try {
            await db.collection('exit_intent_popups').doc(popupId).delete();
            alert('✅ Popup deleted successfully');

            // Refresh the list
            this.renderPopupType('exit-intent', window.OMS);
        } catch (error) {
            console.error('Error deleting popup:', error);
            alert('❌ Error deleting popup: ' + error.message);
        }
    },

    async refreshExitPopups() {
        console.log('🔄 Manual refresh requested...');
        try {
            // Find container by ID without '#' prefix
            let container = document.getElementById('popups-exit-intent-container');

            // If not found, try finding the parent conversion container
            if (!container) {
                console.log('🔍 Container not found, looking for conversion tab...');
                const conversionTab = document.getElementById('conversion');
                if (conversionTab) {
                    // Find the exit-intent container within conversion tab
                    container = conversionTab.querySelector('[id*="exit-intent"]') ||
                               conversionTab.querySelector('.exit-popups-container');
                }
            }

            if (container) {
                await this.renderExitIntentPopups(window.OMS, container);
                console.log('✅ Popups refreshed successfully');
                if (window.OMS && window.OMS.showToast) {
                    window.OMS.showToast('Popups refreshed', 'success');
                }
            } else {
                console.error('❌ Container not found for refresh');
                console.log('Available elements:', {
                    conversion: !!document.getElementById('conversion'),
                    exitIntentContainers: document.querySelectorAll('[id*="exit"]').length
                });
                if (window.OMS && window.OMS.showToast) {
                    window.OMS.showToast('Please open Marketing tab first', 'warning');
                }
            }
        } catch (error) {
            console.error('❌ Error refreshing popups:', error);
            if (window.OMS && window.OMS.showToast) {
                window.OMS.showToast('Refresh failed: ' + error.message, 'error');
            }
        }
    },

    /**
     * Show Popup Settings Modal
     */
    async showPopupSettings() {
        const modalId = 'popupSettingsModal';

        // Load current settings
        const settings = await this.loadPopupSettings();

        // Remove existing modal if any
        const existingModal = document.getElementById(modalId);
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal';
        modal.style.display = 'flex'; // Ensure modal is visible
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 900px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2 class="modal-title">⚙️ Exit Popup Configuration</h2>
                    <button class="modal-close" onclick="document.getElementById('${modalId}').remove()">&times;</button>
                </div>

                <div class="modal-body">
                    <form id="popupSettingsForm">
                        <!-- Trigger Settings -->
                        <div style="margin-bottom: 2rem;">
                            <h3 style="margin: 0 0 1rem; font-size: 1.1rem; color: var(--primary);">🎯 Trigger Settings</h3>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div class="form-group">
                                    <label class="form-label">Desktop Scroll Depth (%)</label>
                                    <input type="number" id="settings-desktop-scroll" class="form-input"
                                           min="50" max="100" step="5" value="${settings.scrollDepth.desktop * 100}">
                                    <small style="color: var(--text-gray);">Trigger when user scrolls this % of page</small>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Mobile Scroll Depth (%)</label>
                                    <input type="number" id="settings-mobile-scroll" class="form-input"
                                           min="50" max="100" step="5" value="${settings.scrollDepth.mobile * 100}">
                                    <small style="color: var(--text-gray);">Higher for mobile (users scroll more)</small>
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
                                <div class="form-group">
                                    <label class="form-label">Exit Intent Threshold (px)</label>
                                    <input type="number" id="settings-exit-threshold" class="form-input"
                                           min="10" max="100" step="10" value="${settings.exitThreshold}">
                                    <small style="color: var(--text-gray);">Mouse within X pixels of top triggers exit</small>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Time on Page (seconds)</label>
                                    <input type="number" id="settings-time-on-page" class="form-input"
                                           min="5" max="120" step="5" value="${settings.timeOnPage / 1000}">
                                    <small style="color: var(--text-gray);">Wait before popup becomes eligible</small>
                                </div>
                            </div>
                        </div>

                        <!-- Frequency Capping -->
                        <div style="margin-bottom: 2rem;">
                            <h3 style="margin: 0 0 1rem; font-size: 1.1rem; color: var(--primary);">⏱️ Frequency Capping</h3>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div class="form-group">
                                    <label class="form-label">Hours Between Shows</label>
                                    <input type="number" id="settings-frequency-hours" class="form-input"
                                           min="1" max="168" step="1" value="${settings.frequencyCap.hours}">
                                    <small style="color: var(--text-gray);">After showing, wait X hours before showing again</small>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">"Don't Show Again" Days</label>
                                    <input type="number" id="settings-dont-show-days" class="form-input"
                                           min="1" max="365" step="1" value="${settings.frequencyCap.dontShowDays}">
                                    <small style="color: var(--text-gray);">Opt-out duration when user checks "don't show"</small>
                                </div>
                            </div>

                            <div class="form-group" style="margin-top: 1rem;">
                                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                    <input type="checkbox" id="settings-session-once"
                                           ${settings.frequencyCap.session ? 'checked' : ''}>
                                    <span>Show only once per session (recommended)</span>
                                </label>
                                <small style="color: var(--text-gray); display: block; margin-left: 1.8rem;">
                                    Prevents annoying users with multiple popups in same visit
                                </small>
                            </div>
                        </div>

                        <!-- Smart Messages -->
                        <div style="margin-bottom: 2rem;">
                            <h3 style="margin: 0 0 1rem; font-size: 1.1rem; color: var(--primary);">💬 Smart Messages</h3>
                            <p style="color: var(--text-gray); margin: 0 0 1rem; font-size: 0.9rem;">
                                Customize messages shown based on how popup was triggered
                            </p>

                            <!-- Exit Intent Messages -->
                            <div style="background: var(--bg-body); padding: 1rem; border-radius: var(--radius); margin-bottom: 1rem;">
                                <h4 style="margin: 0 0 0.5rem; font-size: 0.95rem;">🏃 Exit Intent Trigger</h4>
                                <div class="form-group">
                                    <label class="form-label">Title</label>
                                    <input type="text" id="settings-exit-title" class="form-input"
                                           value="${settings.smartMessages.exitIntent.title}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Subtitle</label>
                                    <input type="text" id="settings-exit-subtitle" class="form-input"
                                           value="${settings.smartMessages.exitIntent.subtitle}">
                                </div>
                            </div>

                            <!-- Scroll Depth Messages -->
                            <div style="background: var(--bg-body); padding: 1rem; border-radius: var(--radius); margin-bottom: 1rem;">
                                <h4 style="margin: 0 0 0.5rem; font-size: 0.95rem;">📜 Scroll Depth Trigger</h4>
                                <div class="form-group">
                                    <label class="form-label">Title</label>
                                    <input type="text" id="settings-scroll-title" class="form-input"
                                           value="${settings.smartMessages.scrollDepth.title}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Subtitle</label>
                                    <input type="text" id="settings-scroll-subtitle" class="form-input"
                                           value="${settings.smartMessages.scrollDepth.subtitle}">
                                </div>
                            </div>

                            <!-- Time-Based Messages -->
                            <div style="background: var(--bg-body); padding: 1rem; border-radius: var(--radius);">
                                <h4 style="margin: 0 0 0.5rem; font-size: 0.95rem;">⏰ Time-Based Trigger</h4>
                                <div class="form-group">
                                    <label class="form-label">Title</label>
                                    <input type="text" id="settings-time-title" class="form-input"
                                           value="${settings.smartMessages.timeBased.title}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Subtitle</label>
                                    <input type="text" id="settings-time-subtitle" class="form-input"
                                           value="${settings.smartMessages.timeBased.subtitle}">
                                </div>
                            </div>
                        </div>

                        <!-- Trigger Enable/Disable -->
                        <div style="margin-bottom: 2rem;">
                            <h3 style="margin: 0 0 1rem; font-size: 1.1rem; color: var(--primary);">🔌 Trigger Control</h3>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div class="form-group">
                                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                        <input type="checkbox" id="settings-enable-exit-intent"
                                               ${settings.triggersEnabled.exitIntent ? 'checked' : ''}>
                                        <span>Enable Exit Intent (Desktop)</span>
                                    </label>
                                    <small style="color: var(--text-gray); display: block; margin-left: 1.8rem;">
                                        Trigger when mouse moves to top of page
                                    </small>
                                </div>
                                <div class="form-group">
                                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                        <input type="checkbox" id="settings-enable-scroll-depth"
                                               ${settings.triggersEnabled.scrollDepth ? 'checked' : ''}>
                                        <span>Enable Scroll Depth</span>
                                    </label>
                                    <small style="color: var(--text-gray); display: block; margin-left: 1.8rem;">
                                        Trigger when user scrolls to threshold
                                    </small>
                                </div>
                            </div>

                            <div class="form-group" style="margin-top: 1rem;">
                                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                    <input type="checkbox" id="settings-check-quotation"
                                           ${settings.triggersEnabled.checkQuotationCreated ? 'checked' : ''}>
                                    <span>Hide popup if user already created quotation</span>
                                </label>
                                <small style="color: var(--text-gray); display: block; margin-left: 1.8rem;">
                                    Don't show to converted users (recommended)
                                </small>
                            </div>
                        </div>

                        <!-- Styling Options -->
                        <div style="margin-bottom: 2rem;">
                            <h3 style="margin: 0 0 1rem; font-size: 1.1rem; color: var(--primary);">🎨 Styling Options</h3>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div class="form-group">
                                    <label class="form-label">Animation Duration (ms)</label>
                                    <input type="number" id="settings-animation-duration" class="form-input"
                                           min="100" max="1000" step="100" value="${settings.styling.animationDuration}">
                                    <small style="color: var(--text-gray);">Fade-in/out animation speed</small>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Backdrop Blur (px)</label>
                                    <input type="number" id="settings-backdrop-blur" class="form-input"
                                           min="0" max="20" step="2" value="${settings.styling.backdropBlur}">
                                    <small style="color: var(--text-gray);">Background blur effect (0 = none)</small>
                                </div>
                            </div>

                            <div class="form-group">
                                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                    <input type="checkbox" id="settings-mobile-bottom-sheet"
                                           ${settings.styling.mobileBottomSheet ? 'checked' : ''}>
                                    <span>Use bottom sheet design on mobile</span>
                                </label>
                                <small style="color: var(--text-gray); display: block; margin-left: 1.8rem;">
                                    Slides from bottom on mobile (better UX)
                                </small>
                            </div>

                            <div class="form-group">
                                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                    <input type="checkbox" id="settings-background-close"
                                           ${settings.styling.backgroundClickClose ? 'checked' : ''}>
                                    <span>Allow closing by clicking background</span>
                                </label>
                                <small style="color: var(--text-gray); display: block; margin-left: 1.8rem;">
                                    Users can dismiss by clicking outside popup
                                </small>
                            </div>
                        </div>
                    </form>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('${modalId}').remove()">
                        Cancel
                    </button>
                    <button type="button" class="btn btn-primary" onclick="Conversion.savePopupSettings()">
                        💾 Save Settings
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    /**
     * Load popup settings from Firestore
     */
    async loadPopupSettings() {
        try {
            const db = window.db;
            if (!db) {
                console.error('Firebase not initialized');
                return this.getDefaultSettings();
            }

            const doc = await db.collection('popup_settings').doc('config').get();

            if (doc.exists) {
                console.log('✅ Loaded popup settings from Firestore');
                return doc.data();
            } else {
                console.log('📝 No settings found, using defaults');
                return this.getDefaultSettings();
            }
        } catch (error) {
            console.error('Error loading popup settings:', error);
            return this.getDefaultSettings();
        }
    },

    /**
     * Get default settings
     */
    getDefaultSettings() {
        return {
            scrollDepth: {
                desktop: 0.70,
                mobile: 0.75
            },
            exitThreshold: 50,
            timeOnPage: 20000,
            frequencyCap: {
                session: true,
                hours: 24,
                dontShowDays: 7
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
            },
            updatedAt: new Date().toISOString(),
            version: '1.0.0'
        };
    },

    /**
     * Save popup settings to Firestore
     */
    async savePopupSettings() {
        try {
            const db = window.db;
            if (!db) {
                alert('Firebase not initialized');
                return;
            }

            // Gather settings from form
            const settings = {
                scrollDepth: {
                    desktop: parseFloat(document.getElementById('settings-desktop-scroll').value) / 100,
                    mobile: parseFloat(document.getElementById('settings-mobile-scroll').value) / 100
                },
                exitThreshold: parseInt(document.getElementById('settings-exit-threshold').value),
                timeOnPage: parseInt(document.getElementById('settings-time-on-page').value) * 1000,
                frequencyCap: {
                    session: document.getElementById('settings-session-once').checked,
                    hours: parseInt(document.getElementById('settings-frequency-hours').value),
                    dontShowDays: parseInt(document.getElementById('settings-dont-show-days').value)
                },
                smartMessages: {
                    exitIntent: {
                        title: document.getElementById('settings-exit-title').value.trim(),
                        subtitle: document.getElementById('settings-exit-subtitle').value.trim()
                    },
                    scrollDepth: {
                        title: document.getElementById('settings-scroll-title').value.trim(),
                        subtitle: document.getElementById('settings-scroll-subtitle').value.trim()
                    },
                    timeBased: {
                        title: document.getElementById('settings-time-title').value.trim(),
                        subtitle: document.getElementById('settings-time-subtitle').value.trim()
                    }
                },
                triggersEnabled: {
                    exitIntent: document.getElementById('settings-enable-exit-intent').checked,
                    scrollDepth: document.getElementById('settings-enable-scroll-depth').checked,
                    checkQuotationCreated: document.getElementById('settings-check-quotation').checked
                },
                styling: {
                    animationDuration: parseInt(document.getElementById('settings-animation-duration').value),
                    backdropBlur: parseInt(document.getElementById('settings-backdrop-blur').value),
                    mobileBottomSheet: document.getElementById('settings-mobile-bottom-sheet').checked,
                    backgroundClickClose: document.getElementById('settings-background-close').checked
                },
                updatedAt: new Date().toISOString(),
                version: '1.0.0'
            };

            // Save to Firestore
            await db.collection('popup_settings').doc('config').set(settings);

            alert('✅ Popup settings saved successfully!\n\n⚠️ Note: Settings will take effect on next page load for website visitors.');

            // Close modal
            document.getElementById('popupSettingsModal').remove();

        } catch (error) {
            console.error('Error saving popup settings:', error);
            alert('❌ Error saving settings: ' + error.message);
        }
    },

    async renderSocialProofNotifications(oms, container) {
        // Load existing notifications
        const notifications = await this.loadSocialProofNotifications(oms);

        // Set up real-time listener for analytics updates (only once)
        if (!this.socialProofListenerActive) {
            const db = window.db;
            if (db) {
                console.log('🔧 Setting up real-time listener for social_proof_notifications...');
                db.collection('social_proof_notifications').onSnapshot(
                    (snapshot) => {
                        console.log('📊 Social proof snapshot received! Changes:', snapshot.docChanges().length);
                        this.loadSocialProofNotifications(oms).then(updated => {
                            const grid = document.getElementById('socialProofGrid');
                            if (grid) {
                                console.log('✅ Updating social proof grid with', updated.length, 'notifications');
                                if (updated.length > 0) {
                                    grid.innerHTML = updated.map(notif => this.renderSocialProofCard(notif, oms)).join('');
                                } else {
                                    grid.innerHTML = `
                                        <div class="empty-state">
                                            <div style="font-size: 2rem; margin-bottom: 1rem;">📭</div>
                                            <p>No notifications created yet</p>
                                        </div>
                                    `;
                                }
                            }
                        });
                    },
                    (error) => console.error('❌ Error in social proof listener:', error)
                );
                this.socialProofListenerActive = true;
                console.log('✅ Real-time listener activated for social_proof_notifications');
            }
        }

        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <div>
                    <h4 style="margin: 0;">Social Proof Notifications</h4>
                    <p style="margin: 0.25rem 0 0; color: var(--text-gray); font-size: 0.85rem;">
                        Show "John from Mumbai just booked 2 tables" style notifications to build trust
                    </p>
                </div>
                <button class="btn btn-primary" onclick="Conversion.showCreateSocialProofModal()">
                    ➕ Create Notification
                </button>
            </div>

            <!-- Stats Cards -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                <div class="stat-card">
                    <div class="stat-value">${notifications.filter(n => n.status === 'active').length}</div>
                    <div class="stat-label">Active Notifications</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${notifications.filter(n => n.status === 'inactive').length}</div>
                    <div class="stat-label">Inactive</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${notifications.reduce((sum, n) => sum + (n.analytics?.views || 0), 0)}</div>
                    <div class="stat-label">Total Views</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${notifications.reduce((sum, n) => sum + (n.analytics?.clicks || 0), 0)}</div>
                    <div class="stat-label">Total Clicks</div>
                </div>
            </div>

            <!-- Notifications Grid -->
            <div id="socialProofGrid" class="popups-grid">
                ${notifications.length === 0 ? `
                    <div class="empty-state">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">👥</div>
                        <h3>No Social Proof Notifications Yet</h3>
                        <p>Create notifications to show recent customer activity and build trust</p>
                        <button class="btn btn-primary" onclick="Conversion.showCreateSocialProofModal()">
                            Create Your First Notification
                        </button>
                    </div>
                ` : notifications.map(notif => this.renderSocialProofCard(notif, oms)).join('')}
            </div>
        `;
    },

    renderStickyBars(oms, container) {
        container.innerHTML = `
            <div>
                <h4>Sticky Bars</h4>
                <p style="color: var(--text-gray);">
                    Top/bottom sticky announcement bars - COMING SOON
                </p>
            </div>
        `;
    },

    /* =========================================
       SOCIAL PROOF NOTIFICATIONS - HELPER FUNCTIONS
       ========================================= */

    async loadSocialProofNotifications(oms) {
        try {
            const db = window.db;
            if (!db) return [];

            const snapshot = await db.collection('social_proof_notifications').get();
            const notifications = [];

            snapshot.forEach(doc => {
                notifications.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return notifications;
        } catch (error) {
            console.error('Error loading social proof notifications:', error);
            return [];
        }
    },

    renderSocialProofCard(notif, oms) {
        const statusColor = notif.status === 'active' ? 'var(--success)' : 'var(--text-gray)';
        const typeIcons = {
            booking: '📅',
            quotation: '📝',
            purchase: '🛒',
            signup: '✅',
            custom: '💬'
        };

        return `
            <div class="popup-card" data-notification-id="${notif.id}">
                <div class="popup-card-body">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <span style="font-size: 1.5rem;">${typeIcons[notif.type] || '💬'}</span>
                            <div>
                                <h4 style="margin: 0; font-size: 0.95rem;">${notif.title}</h4>
                                <span style="font-size: 0.75rem; color: var(--text-gray);">${notif.type}</span>
                            </div>
                        </div>
                        <span class="status-badge" style="background: ${statusColor}; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem;">
                            ${notif.status}
                        </span>
                    </div>

                    <div style="background: var(--bg-body); padding: 0.75rem; border-radius: var(--radius); margin-bottom: 1rem; font-size: 0.85rem;">
                        <strong>${notif.customerName}</strong> from <strong>${notif.location}</strong><br>
                        ${notif.message}
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin-bottom: 1rem; font-size: 0.85rem;">
                        <div>
                            <div style="color: var(--text-gray);">Position</div>
                            <strong>${notif.position || 'bottom-left'}</strong>
                        </div>
                        <div>
                            <div style="color: var(--text-gray);">Duration</div>
                            <strong>${notif.displayDuration || 5}s</strong>
                        </div>
                        <div>
                            <div style="color: var(--text-gray);">Delay</div>
                            <strong>${notif.initialDelay || 5}s</strong>
                        </div>
                        <div>
                            <div style="color: var(--text-gray);">Loop</div>
                            <strong>${notif.loopNotifications ? 'Yes' : 'No'}</strong>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; padding: 0.75rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: var(--radius); color: white; margin-bottom: 1rem;">
                        <div style="text-align: center;">
                            <div style="font-size: 1.5rem; font-weight: bold;">${notif.analytics?.views || 0}</div>
                            <div style="font-size: 0.75rem; opacity: 0.9;">Views</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 1.5rem; font-weight: bold;">${notif.analytics?.clicks || 0}</div>
                            <div style="font-size: 0.75rem; opacity: 0.9;">Clicks</div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-sm btn-secondary" style="flex: 1;" onclick="Conversion.editSocialProof('${notif.id}')">
                            ✏️ Edit
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="Conversion.deleteSocialProof('${notif.id}')">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    showCreateSocialProofModal(notificationId = null) {
        const modalId = 'socialProofModal';
        const isEdit = !!notificationId;

        // Remove existing modal
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        // Default values for new notification
        let notification = {
            title: '',
            type: 'booking',
            customerName: '',
            location: '',
            message: '',
            position: 'bottom-left',
            displayDuration: 5,
            initialDelay: 5,
            delayBetween: 10,
            loopNotifications: true,
            showImage: false,
            imageUrl: '',
            link: '',
            status: 'active'
        };

        // If editing, load existing data
        if (isEdit) {
            const db = window.db;
            db.collection('social_proof_notifications').doc(notificationId).get().then(doc => {
                if (doc.exists) {
                    notification = { id: doc.id, ...doc.data() };
                    this.renderSocialProofModalContent(modalId, notification, isEdit);
                }
            });
        } else {
            this.renderSocialProofModalContent(modalId, notification, isEdit);
        }
    },

    renderSocialProofModalContent(modalId, notification, isEdit) {
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal';
        modal.style.display = 'flex';

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2 class="modal-title">${isEdit ? '✏️ Edit' : '➕ Create'} Social Proof Notification</h2>
                    <button class="modal-close" onclick="document.getElementById('${modalId}').remove()">&times;</button>
                </div>

                <div class="modal-body">
                    <form id="socialProofForm">
                        <!-- Title -->
                        <div class="form-group">
                            <label class="form-label">Notification Title</label>
                            <input type="text" id="sp-title" class="form-input"
                                   value="${notification.title}"
                                   placeholder="e.g., Recent Booking" required>
                        </div>

                        <!-- Type -->
                        <div class="form-group">
                            <label class="form-label">Notification Type</label>
                            <select id="sp-type" class="form-input">
                                <option value="booking" ${notification.type === 'booking' ? 'selected' : ''}>📅 Booking</option>
                                <option value="quotation" ${notification.type === 'quotation' ? 'selected' : ''}>📝 Quotation Created</option>
                                <option value="purchase" ${notification.type === 'purchase' ? 'selected' : ''}>🛒 Purchase</option>
                                <option value="signup" ${notification.type === 'signup' ? 'selected' : ''}>✅ Sign Up</option>
                                <option value="custom" ${notification.type === 'custom' ? 'selected' : ''}>💬 Custom</option>
                            </select>
                        </div>

                        <!-- Customer Name & Location -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label class="form-label">Customer Name</label>
                                <input type="text" id="sp-customer-name" class="form-input"
                                       value="${notification.customerName}"
                                       placeholder="e.g., Rajesh" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Location</label>
                                <input type="text" id="sp-location" class="form-input"
                                       value="${notification.location}"
                                       placeholder="e.g., Mumbai" required>
                            </div>
                        </div>

                        <!-- Message -->
                        <div class="form-group">
                            <label class="form-label">Message</label>
                            <input type="text" id="sp-message" class="form-input"
                                   value="${notification.message}"
                                   placeholder="e.g., just booked 5 tables" required>
                        </div>

                        <!-- Position & Duration -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label class="form-label">Position</label>
                                <select id="sp-position" class="form-input">
                                    <option value="bottom-left" ${notification.position === 'bottom-left' ? 'selected' : ''}>Bottom Left</option>
                                    <option value="bottom-right" ${notification.position === 'bottom-right' ? 'selected' : ''}>Bottom Right</option>
                                    <option value="top-left" ${notification.position === 'top-left' ? 'selected' : ''}>Top Left</option>
                                    <option value="top-right" ${notification.position === 'top-right' ? 'selected' : ''}>Top Right</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Display Duration (seconds)</label>
                                <input type="number" id="sp-display-duration" class="form-input"
                                       value="${notification.displayDuration}" min="3" max="30" required>
                            </div>
                        </div>

                        <!-- Timing Settings -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label class="form-label">Initial Delay (seconds)</label>
                                <input type="number" id="sp-initial-delay" class="form-input"
                                       value="${notification.initialDelay}" min="0" max="60" required>
                                <small style="color: var(--text-gray);">Wait before first notification</small>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Delay Between (seconds)</label>
                                <input type="number" id="sp-delay-between" class="form-input"
                                       value="${notification.delayBetween}" min="5" max="300" required>
                                <small style="color: var(--text-gray);">Time between repeated notifications</small>
                            </div>
                        </div>

                        <!-- Loop & Image Options -->
                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="checkbox" id="sp-loop" ${notification.loopNotifications ? 'checked' : ''}>
                                <span>Loop notifications continuously</span>
                            </label>
                        </div>

                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="checkbox" id="sp-show-image" ${notification.showImage ? 'checked' : ''}>
                                <span>Show customer image/avatar</span>
                            </label>
                        </div>

                        <div class="form-group" id="image-url-group" style="display: ${notification.showImage ? 'block' : 'none'};">
                            <label class="form-label">Image URL</label>
                            <input type="url" id="sp-image-url" class="form-input"
                                   value="${notification.imageUrl || ''}"
                                   placeholder="https://example.com/avatar.jpg">
                        </div>

                        <!-- Link -->
                        <div class="form-group">
                            <label class="form-label">Link (optional)</label>
                            <input type="url" id="sp-link" class="form-input"
                                   value="${notification.link || ''}"
                                   placeholder="https://example.com/page">
                            <small style="color: var(--text-gray);">Where to redirect when clicked</small>
                        </div>

                        <!-- Status -->
                        <div class="form-group">
                            <label class="form-label">Status</label>
                            <select id="sp-status" class="form-input">
                                <option value="active" ${notification.status === 'active' ? 'selected' : ''}>✅ Active</option>
                                <option value="inactive" ${notification.status === 'inactive' ? 'selected' : ''}>⏸️ Inactive</option>
                            </select>
                        </div>
                    </form>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('${modalId}').remove()">
                        Cancel
                    </button>
                    <button type="button" class="btn btn-primary" onclick="Conversion.saveSocialProof('${notification.id || ''}')">
                        💾 Save Notification
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Show/hide image URL field based on checkbox
        document.getElementById('sp-show-image').addEventListener('change', (e) => {
            document.getElementById('image-url-group').style.display = e.target.checked ? 'block' : 'none';
        });
    },

    async saveSocialProof(notificationId) {
        try {
            const db = window.db;
            if (!db) {
                alert('Firebase not initialized');
                return;
            }

            // Get form values
            const data = {
                title: document.getElementById('sp-title').value.trim(),
                type: document.getElementById('sp-type').value,
                customerName: document.getElementById('sp-customer-name').value.trim(),
                location: document.getElementById('sp-location').value.trim(),
                message: document.getElementById('sp-message').value.trim(),
                position: document.getElementById('sp-position').value,
                displayDuration: parseInt(document.getElementById('sp-display-duration').value),
                initialDelay: parseInt(document.getElementById('sp-initial-delay').value),
                delayBetween: parseInt(document.getElementById('sp-delay-between').value),
                loopNotifications: document.getElementById('sp-loop').checked,
                showImage: document.getElementById('sp-show-image').checked,
                imageUrl: document.getElementById('sp-image-url').value.trim(),
                link: document.getElementById('sp-link').value.trim(),
                status: document.getElementById('sp-status').value,
                updatedAt: new Date().toISOString()
            };

            // Validate
            if (!data.title || !data.customerName || !data.location || !data.message) {
                alert('Please fill in all required fields');
                return;
            }

            if (notificationId) {
                // Update existing
                await db.collection('social_proof_notifications').doc(notificationId).update(data);
                console.log('✅ Notification updated');
            } else {
                // Create new
                data.analytics = { views: 0, clicks: 0 };
                data.createdAt = new Date().toISOString();
                await db.collection('social_proof_notifications').add(data);
                console.log('✅ Notification created');
            }

            // Close modal
            document.getElementById('socialProofModal').remove();

            // Refresh list
            const oms = window.OMS;
            const container = document.getElementById('popupTypeContent');
            if (container) {
                this.renderSocialProofNotifications(oms, container);
            }

        } catch (error) {
            console.error('Error saving notification:', error);
            alert('Error saving notification: ' + error.message);
        }
    },

    async editSocialProof(notificationId) {
        this.showCreateSocialProofModal(notificationId);
    },

    async deleteSocialProof(notificationId) {
        if (!confirm('Are you sure you want to delete this notification?')) {
            return;
        }

        try {
            const db = window.db;
            await db.collection('social_proof_notifications').doc(notificationId).delete();
            console.log('✅ Notification deleted');

            // Refresh list
            const oms = window.OMS;
            const container = document.getElementById('popupTypeContent');
            if (container) {
                this.renderSocialProofNotifications(oms, container);
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
            alert('Error deleting notification: ' + error.message);
        }
    },

    /* =========================================
       SECTION 2: CONTENT MANAGEMENT
       ========================================= */
    renderContentSection(oms, container) {
        container.innerHTML = `
            <div>
                <h3>🎨 Content Management</h3>
                <p style="color: var(--text-gray); margin-bottom: 2rem;">
                    Manage hero section, testimonials, before/after gallery, and trust elements
                </p>

                <!-- Placeholder for content management -->
                <div class="card">
                    <div class="card-body">
                        <h4>Hero Section Settings</h4>
                        <p style="color: var(--text-gray);">Upload hero videos, images, customize text - COMING SOON</p>
                    </div>
                </div>

                <div class="card" style="margin-top: 1rem;">
                    <div class="card-body">
                        <h4>Testimonials Management</h4>
                        <p style="color: var(--text-gray);">Add customer reviews and video testimonials - COMING SOON</p>
                    </div>
                </div>

                <div class="card" style="margin-top: 1rem;">
                    <div class="card-body">
                        <h4>Before/After Gallery</h4>
                        <p style="color: var(--text-gray);">Upload comparison images - COMING SOON</p>
                    </div>
                </div>

                <div class="card" style="margin-top: 1rem;">
                    <div class="card-body">
                        <h4>Trust Elements</h4>
                        <p style="color: var(--text-gray);">Manage badges, certifications, social proof - COMING SOON</p>
                    </div>
                </div>
            </div>
        `;
    },

    /* =========================================
       SECTION 3: PRICING & CAMPAIGNS
       ========================================= */
    renderPricingSection(oms, container) {
        container.innerHTML = `
            <div>
                <h3>💰 Pricing & Campaigns</h3>
                <p style="color: var(--text-gray); margin-bottom: 2rem;">
                    Configure dynamic pricing rules, advance payment incentives, and discount campaigns
                </p>
                <div class="card">
                    <div class="card-body">
                        <p style="color: var(--text-gray);">Pricing features - COMING SOON</p>
                    </div>
                </div>
            </div>
        `;
    },

    /* =========================================
       SECTION 4: COMMUNICATION
       ========================================= */
    renderCommunicationSection(oms, container) {
        container.innerHTML = `
            <div>
                <h3>💬 Communication</h3>
                <p style="color: var(--text-gray); margin-bottom: 2rem;">
                    Manage email templates, WhatsApp auto-replies, and chatbot responses
                </p>
                <div class="card">
                    <div class="card-body">
                        <p style="color: var(--text-gray);">Communication features - COMING SOON</p>
                    </div>
                </div>
            </div>
        `;
    },

    /* =========================================
       SECTION 5: DISPLAY SETTINGS
       ========================================= */
    renderDisplaySection(oms, container) {
        container.innerHTML = `
            <div>
                <h3>👁️ Display Settings</h3>
                <p style="color: var(--text-gray); margin-bottom: 2rem;">
                    Configure Instagram feed, Google Reviews, comparison table, and scarcity indicators
                </p>
                <div class="card">
                    <div class="card-body">
                        <p style="color: var(--text-gray);">Display features - COMING SOON</p>
                    </div>
                </div>
            </div>
        `;
    },

    /* =========================================
       SECTION 6: WIZARD CONTROLS
       ========================================= */
    renderWizardSection(oms, container) {
        container.innerHTML = `
            <div>
                <h3>🧙 Wizard Controls</h3>
                <p style="color: var(--text-gray); margin-bottom: 2rem;">
                    Customize quotation wizard, package upsells, and progress messages
                </p>
                <div class="card">
                    <div class="card-body">
                        <p style="color: var(--text-gray);">Wizard features - COMING SOON</p>
                    </div>
                </div>
            </div>
        `;
    },

    /* =========================================
       SECTION 7: AVAILABILITY SETTINGS
       ========================================= */
    renderAvailabilitySection(oms, container) {
        container.innerHTML = `
            <div>
                <h3>📅 Availability Settings</h3>
                <p style="color: var(--text-gray); margin-bottom: 2rem;">
                    Control public calendar display and availability indicators
                </p>
                <div class="card">
                    <div class="card-body">
                        <p style="color: var(--text-gray);">Availability features - COMING SOON</p>
                    </div>
                </div>
            </div>
        `;
    },

    /* =========================================
       VIDEOS SECTION
       ========================================= */
    async renderVideosSection(oms, container) {
        // Create a wrapper div with id="videos" so OMS.renderVideos() can find it
        container.innerHTML = '<div id="videos"></div>';

        // Wait a tick for DOM to update
        await new Promise(resolve => setTimeout(resolve, 0));

        // Call OMS renderVideos which will populate the #videos element
        if (oms && typeof oms.renderVideos === 'function') {
            oms.renderVideos();
        } else {
            container.innerHTML = '<p style="color: var(--text-gray);">Video management not available</p>';
        }
    },

    /* =========================================
       ADS SECTION
       ========================================= */
    async renderAdsSection(oms, container) {
        // Create a wrapper div with id="advertisements" so OMS.renderAdvertisements() can find it
        container.innerHTML = '<div id="advertisements"></div>';

        // Wait a tick for DOM to update
        await new Promise(resolve => setTimeout(resolve, 0));

        // Call OMS renderAdvertisements which will populate the #advertisements element
        if (oms && typeof oms.renderAdvertisements === 'function') {
            oms.renderAdvertisements();
        } else {
            container.innerHTML = '<p style="color: var(--text-gray);">Ad management not available</p>';
        }
    },

    /* =========================================
       PACKAGES SECTION
       ========================================= */
    async renderPackagesSection(oms, container) {
        // Create a wrapper div with id="packages" to match the original tab structure
        container.innerHTML = '<div id="packages" style="display: block;"></div>';

        // Wait a tick for DOM to update
        await new Promise(resolve => setTimeout(resolve, 0));

        // Get the packages container
        const packagesDiv = document.getElementById('packages');
        if (!packagesDiv) {
            console.error('❌ Failed to create packages container');
            return;
        }

        // Create the inner structure that PackageManager expects
        packagesDiv.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">📦 Package Management</h2>
                </div>
                <div class="card-body">
                    <div id="packages-container">
                        <div style="text-align: center; padding: 3rem;">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">⏳</div>
                            <p>Loading packages...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize PackageManager if not already done
        if (!window.packageManager) {
            try {
                const BUILD_TIMESTAMP = Date.now();
                const { PackageManager } = await import(`../packages/package-manager.js?v=${BUILD_TIMESTAMP}`);
                window.packageManager = new PackageManager();
                console.log('✅ PackageManager created');
            } catch (error) {
                console.error('❌ Failed to load PackageManager:', error);
                container.innerHTML = '<p style="color: var(--danger);">Failed to load package manager</p>';
                return;
            }
        }

        // Initialize and render (this will update the packages-container div)
        try {
            console.log('🔄 Initializing PackageManager...');
            await window.packageManager.init();
            console.log('✅ PackageManager initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize packages:', error);
        }
    },

    /* =========================================
       LEADS SECTION
       ========================================= */
    async renderLeadsSection(oms, container) {
        // Create a wrapper div with id="leads" to match the original tab structure
        container.innerHTML = '<div id="leads" style="display: block;"></div>';

        // Wait a tick for DOM to update
        await new Promise(resolve => setTimeout(resolve, 0));

        // Get the leads container
        const leadsDiv = document.getElementById('leads');
        if (!leadsDiv) {
            console.error('❌ Failed to create leads container');
            return;
        }

        // Create the inner structure that LeadsManager expects
        leadsDiv.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">🎯 Lead Management</h2>
                </div>
                <div class="card-body">
                    <!-- Filter Buttons -->
                    <div id="leads-filter-buttons" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 2rem;">
                        <!-- Filter buttons will be rendered here -->
                    </div>

                    <!-- Leads List -->
                    <div id="leads-list-container">
                        <div style="text-align: center; padding: 3rem;">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">⏳</div>
                            <p>Loading leads...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize LeadsManager if not already done
        if (!window.leadsManager) {
            try {
                const BUILD_TIMESTAMP = Date.now();
                const { LeadsManager } = await import(`../leads/leads-manager.js?v=${BUILD_TIMESTAMP}`);
                window.leadsManager = new LeadsManager();
                console.log('✅ LeadsManager created');
            } catch (error) {
                console.error('❌ Failed to load LeadsManager:', error);
                container.innerHTML = '<p style="color: var(--danger);">Failed to load leads manager</p>';
                return;
            }
        }

        // Initialize and render (this will update the filter buttons and leads list)
        try {
            console.log('🔄 Initializing LeadsManager...');
            await window.leadsManager.init();
            console.log('✅ LeadsManager initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize leads:', error);
        }
    }
};

// Make globally accessible
window.Conversion = Conversion;

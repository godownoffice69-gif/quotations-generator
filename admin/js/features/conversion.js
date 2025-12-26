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
    renderSection(section, oms) {
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
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 2px solid var(--border); padding-bottom: 0.5rem;">
                <button class="popup-subtab active" data-popup-type="exit-intent">Exit Intent Popups</button>
                <button class="popup-subtab" data-popup-type="social-proof">Social Proof Notifications</button>
                <button class="popup-subtab" data-popup-type="sticky-bar">Sticky Bars</button>
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
                <button class="btn btn-primary" onclick="Conversion.showCreateExitPopupModal()">
                    ➕ Create New Popup
                </button>
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
            analytics: popupId ? undefined : {
                views: 0,
                conversions: 0,
                dismissals: 0
            },
            updatedAt: new Date().toISOString()
        };

        if (!popupId) {
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

    renderSocialProofNotifications(oms, container) {
        container.innerHTML = `
            <div>
                <h4>Social Proof Notifications</h4>
                <p style="color: var(--text-gray);">
                    Create "Rajesh just booked..." style notifications - COMING SOON
                </p>
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
    }
};

// Make globally accessible
window.Conversion = Conversion;

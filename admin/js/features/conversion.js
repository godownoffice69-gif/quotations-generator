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
            const snapshot = await oms.db.collection('exit_intent_popups').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error loading exit intent popups:', error);
            return [];
        }
    },

    showCreateExitPopupModal() {
        // Will implement modal creation
        alert('Exit popup creation modal - TO BE IMPLEMENTED');
    },

    async togglePopupStatus(popupId, isActive) {
        // Will implement toggle
        console.log('Toggle popup', popupId, isActive);
    },

    editExitPopup(popupId) {
        // Will implement edit
        alert('Edit popup ' + popupId + ' - TO BE IMPLEMENTED');
    },

    async deleteExitPopup(popupId) {
        if (confirm('Are you sure you want to delete this popup?')) {
            // Will implement delete
            console.log('Delete popup', popupId);
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

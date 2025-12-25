/**
 * ============================================
 * LEADS MANAGER - Admin leads management
 * ============================================
 *
 * Provides:
 * - View all leads
 * - Filter leads by status
 * - Mark leads as contacted/quoted/converted/lost
 * - Convert lead to order
 * - View lead details
 */

export class LeadsManager {
    constructor() {
        this.leads = [];
        this.filteredLeads = [];
        this.currentFilter = 'all';
        this.currentLead = null;
    }

    /**
     * Initialize leads manager
     */
    async init() {
        console.log('🎯 Leads Manager initialized');

        try {
            await this.loadLeads();
        } catch (error) {
            console.error('❌ Error loading leads:', error);
            // Still render even if loading fails
        }

        this.setupEventListeners();
        this.render(); // Always render, even if loading failed
    }

    /**
     * Load leads from Firebase
     */
    async loadLeads() {
        try {
            // Use the existing Firebase instance from window.db (initialized in admin/index.html)
            const db = window.db;
            if (!db) {
                throw new Error('Firebase Firestore not initialized');
            }

            const snapshot = await db.collection('leads')
                .orderBy('createdAt', 'desc')
                .get();

            this.leads = [];

            snapshot.forEach(doc => {
                this.leads.push({
                    docId: doc.id,
                    ...doc.data()
                });
            });

            console.log(`✅ Loaded ${this.leads.length} leads`);
            this.applyFilter();

        } catch (error) {
            console.error('❌ Error loading leads:', error);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Filter buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.lead-filter-btn')) {
                const btn = e.target.closest('.lead-filter-btn');
                this.setFilter(btn.dataset.filter);
            }

            if (e.target.closest('.view-lead-btn')) {
                const btn = e.target.closest('.view-lead-btn');
                const leadDocId = btn.dataset.leadDocId;
                this.viewLeadDetails(leadDocId);
            }

            if (e.target.closest('.update-lead-status-btn')) {
                const btn = e.target.closest('.update-lead-status-btn');
                const leadDocId = btn.dataset.leadDocId;
                const newStatus = btn.dataset.newStatus;
                this.updateLeadStatus(leadDocId, newStatus);
            }

            if (e.target.closest('.convert-to-order-btn')) {
                const btn = e.target.closest('.convert-to-order-btn');
                const leadDocId = btn.dataset.leadDocId;
                this.convertToOrder(leadDocId);
            }

            if (e.target.matches('#close-lead-details-btn')) {
                this.closeLeadDetails();
            }
        });

        // Real-time updates listener
        this.setupRealtimeListener();
    }

    /**
     * Setup realtime listener for new leads
     */
    async setupRealtimeListener() {
        try {
            // Use the existing Firebase instance from window.db (initialized in admin/index.html)
            const db = window.db;
            if (!db) {
                throw new Error('Firebase Firestore not initialized');
            }

            db.collection('leads')
                .orderBy('createdAt', 'desc')
                .onSnapshot((snapshot) => {
                    const currentCount = this.leads.length;

                    this.leads = [];
                    snapshot.forEach(doc => {
                        this.leads.push({
                            docId: doc.id,
                            ...doc.data()
                        });
                    });

                    // Show notification if new leads arrived
                    if (this.leads.length > currentCount) {
                        const newLeadsCount = this.leads.length - currentCount;
                        OMS?.showNotification(`${newLeadsCount} new lead(s) received!`, 'success');
                    }

                    this.applyFilter();
                    this.render();

                    console.log('✅ Leads updated in real-time');
                });

        } catch (error) {
            console.error('❌ Error setting up realtime listener:', error);
        }
    }

    /**
     * Apply filter
     */
    applyFilter() {
        if (this.currentFilter === 'all') {
            this.filteredLeads = [...this.leads];
        } else {
            this.filteredLeads = this.leads.filter(lead => lead.status === this.currentFilter);
        }
    }

    /**
     * Set filter
     */
    setFilter(filter) {
        this.currentFilter = filter;
        this.applyFilter();
        this.render();
    }

    /**
     * Render leads
     */
    render() {
        this.renderFilterButtons();
        this.renderLeadsList();
    }

    /**
     * Render filter buttons
     */
    renderFilterButtons() {
        const container = document.getElementById('leads-filter-buttons');
        if (!container) return;

        const filters = [
            { id: 'all', label: 'All Leads', count: this.leads.length },
            { id: 'new', label: '🆕 New', count: this.leads.filter(l => l.status === 'new').length },
            { id: 'contacted', label: '📞 Contacted', count: this.leads.filter(l => l.status === 'contacted').length },
            { id: 'quoted', label: '💰 Quoted', count: this.leads.filter(l => l.status === 'quoted').length },
            { id: 'converted', label: '✅ Converted', count: this.leads.filter(l => l.status === 'converted').length },
            { id: 'lost', label: '❌ Lost', count: this.leads.filter(l => l.status === 'lost').length }
        ];

        let html = '';
        filters.forEach(filter => {
            const activeClass = this.currentFilter === filter.id ? 'active' : '';
            html += `
                <button class="lead-filter-btn ${activeClass}" data-filter="${filter.id}">
                    ${filter.label} (${filter.count})
                </button>
            `;
        });

        container.innerHTML = html;
    }

    /**
     * Render leads list
     */
    renderLeadsList() {
        const container = document.getElementById('leads-list-container');
        if (!container) return;

        if (this.filteredLeads.length === 0) {
            // Show error message if no leads loaded AND current filter is 'all'
            // (this likely means Firestore permissions issue)
            if (this.currentFilter === 'all' && this.leads.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 3rem; color: #64748B;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
                        <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: #1E293B;">Unable to load leads</h3>
                        <p style="margin-bottom: 1rem;">Please ensure Firestore security rules are deployed.</p>
                        <div style="background: #FEF3C7; padding: 1rem; border-radius: 8px; margin: 1rem auto; max-width: 500px; text-align: left;">
                            <strong style="color: #92400E;">⚡ Action Required:</strong>
                            <ol style="margin: 0.5rem 0 0 1.5rem; color: #92400E;">
                                <li>Go to Firebase Console</li>
                                <li>Navigate to Firestore Database → Rules</li>
                                <li>Deploy the updated security rules</li>
                                <li>Refresh this page</li>
                            </ol>
                        </div>
                        <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 1rem;">
                            🔄 Reload Page
                        </button>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div style="text-align: center; padding: 3rem; color: #64748B;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">🎯</div>
                        <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: #1E293B;">No leads found</h3>
                        <p>Leads will appear here when customers submit the quotation form</p>
                    </div>
                `;
            }
            return;
        }

        let html = '<div class="leads-grid">';

        this.filteredLeads.forEach(lead => {
            html += this.renderLeadCard(lead);
        });

        html += '</div>';

        container.innerHTML = html;
    }

    /**
     * Render individual lead card
     */
    renderLeadCard(lead) {
        const statusBadges = {
            'new': '<span class="badge badge-success">🆕 New</span>',
            'contacted': '<span class="badge badge-info">📞 Contacted</span>',
            'quoted': '<span class="badge badge-warning">💰 Quoted</span>',
            'converted': '<span class="badge badge-success">✅ Converted</span>',
            'lost': '<span class="badge badge-danger">❌ Lost</span>'
        };

        const eventTypeEmoji = {
            'wedding': '💍',
            'corporate': '🏢',
            'birthday': '🎂',
            'anniversary': '🎊',
            'other': '🎉'
        };

        const createdDate = lead.createdAt ? this.formatDate(lead.createdAt.toDate()) : 'Just now';
        const totalItems = lead.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

        // Check for popup offer
        const hasPopupOffer = lead.popupOffer && lead.popupOffer.popupId;
        const popupOfferBadge = hasPopupOffer ?
            `<span class="badge" style="background: linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%); color: #1E293B; font-weight: 600; animation: pulse 2s infinite;">
                🎁 SPECIAL OFFER
            </span>` : '';

        return `
            <div class="lead-card" style="${hasPopupOffer ? 'border-left: 4px solid #FF6B6B;' : ''}">
                <div class="lead-card-header">
                    <div>
                        <strong style="font-size: 1.125rem;">${lead.leadId || 'N/A'}</strong>
                        <div style="font-size: 0.75rem; color: #64748B; margin-top: 0.25rem;">${createdDate}</div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        ${statusBadges[lead.status] || ''}
                        ${popupOfferBadge}
                    </div>
                </div>

                ${hasPopupOffer ? `
                    <div style="background: linear-gradient(135deg, #FFF5E1 0%, #FFE4B5 100%); padding: 0.75rem; margin: 0.5rem 0; border-radius: 6px; border: 1px solid #FFD700;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <span style="font-size: 1.5rem;">🎯</span>
                            <strong style="color: #B8860B;">Popup Offer Applied</strong>
                        </div>
                        <div style="font-size: 0.9rem; color: #333; margin-bottom: 0.25rem;">
                            <strong>${lead.popupOffer.discountText || 'Special Discount'}</strong>
                        </div>
                        ${lead.popupOffer.description ? `
                            <div style="font-size: 0.85rem; color: #666; margin-bottom: 0.5rem;">
                                ${lead.popupOffer.description}
                            </div>
                        ` : ''}
                        <div style="font-size: 0.75rem; color: #B8860B; font-style: italic;">
                            ⚠️ Remember to apply this discount during checkout!
                        </div>
                    </div>
                ` : ''}

                <div class="lead-card-body">
                    <div class="lead-info-row">
                        <div class="lead-info-label">Customer</div>
                        <div class="lead-info-value">
                            ${lead.customer?.name || 'N/A'}
                        </div>
                    </div>

                    <div class="lead-info-row">
                        <div class="lead-info-label">Phone</div>
                        <div class="lead-info-value">
                            <a href="tel:${lead.customer?.phone || ''}">${lead.customer?.phone || 'N/A'}</a>
                        </div>
                    </div>

                    <div class="lead-info-row">
                        <div class="lead-info-label">Event</div>
                        <div class="lead-info-value">
                            ${eventTypeEmoji[lead.eventType] || '🎉'} ${this.capitalize(lead.eventType || 'N/A')}
                        </div>
                    </div>

                    <div class="lead-info-row">
                        <div class="lead-info-label">Venue</div>
                        <div class="lead-info-value">${lead.venue?.name || 'N/A'}</div>
                    </div>

                    <div class="lead-info-row">
                        <div class="lead-info-label">Date</div>
                        <div class="lead-info-value">
                            ${lead.eventDate ? this.formatDateShort(lead.eventDate) : 'N/A'} at ${lead.eventTime || 'N/A'}
                        </div>
                    </div>

                    <div class="lead-info-row">
                        <div class="lead-info-label">Package</div>
                        <div class="lead-info-value">
                            ${lead.packageType === 'premade' ? lead.selectedPackageName || 'Pre-made' : 'Custom'}
                        </div>
                    </div>

                    <div class="lead-info-row">
                        <div class="lead-info-label">Items</div>
                        <div class="lead-info-value">
                            ${lead.items?.length || 0} items (${totalItems} units)
                        </div>
                    </div>
                </div>

                <div class="lead-card-actions">
                    <button class="view-lead-btn btn btn-primary btn-small" data-lead-doc-id="${lead.docId}">
                        👁️ View Details
                    </button>

                    ${lead.status === 'new' ? `
                        <button class="update-lead-status-btn btn btn-info btn-small" data-lead-doc-id="${lead.docId}" data-new-status="contacted">
                            📞 Mark Contacted
                        </button>
                    ` : ''}

                    ${lead.status === 'contacted' ? `
                        <button class="update-lead-status-btn btn btn-warning btn-small" data-lead-doc-id="${lead.docId}" data-new-status="quoted">
                            💰 Mark Quoted
                        </button>
                    ` : ''}

                    ${lead.status === 'quoted' || lead.status === 'contacted' ? `
                        <button class="convert-to-order-btn btn btn-success btn-small" data-lead-doc-id="${lead.docId}">
                            ✅ Convert to Order
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * View lead details
     */
    viewLeadDetails(leadDocId) {
        const lead = this.leads.find(l => l.docId === leadDocId);
        if (!lead) return;

        this.currentLead = lead;

        const modal = document.getElementById('lead-details-modal');
        if (!modal) return;

        // Render lead details
        const container = document.getElementById('lead-details-content');
        if (!container) return;

        const createdDate = lead.createdAt ? this.formatDateTime(lead.createdAt.toDate()) : 'Just now';
        const totalItems = lead.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

        let html = `
            <div class="lead-details-section">
                <h3>Customer Information</h3>
                <div class="detail-row">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${lead.customer?.name || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">
                        <a href="tel:${lead.customer?.phone || ''}">${lead.customer?.phone || 'N/A'}</a>
                        <a href="https://wa.me/91${lead.customer?.phone || ''}" target="_blank" class="btn btn-success btn-small" style="margin-left: 0.5rem;">
                            📱 WhatsApp
                        </a>
                    </span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${lead.customer?.email || 'Not provided'}</span>
                </div>
                ${lead.customer?.specialRequests ? `
                    <div class="detail-row">
                        <span class="detail-label">Special Requests:</span>
                        <span class="detail-value">${lead.customer.specialRequests}</span>
                    </div>
                ` : ''}
            </div>

            <div class="lead-details-section">
                <h3>Event Information</h3>
                <div class="detail-row">
                    <span class="detail-label">Event Type:</span>
                    <span class="detail-value">${this.capitalize(lead.eventType || 'N/A')}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Venue:</span>
                    <span class="detail-value">${lead.venue?.name || 'N/A'}</span>
                </div>
                ${lead.venue?.address ? `
                    <div class="detail-row">
                        <span class="detail-label">Address:</span>
                        <span class="detail-value">${lead.venue.address}</span>
                    </div>
                ` : ''}
                <div class="detail-row">
                    <span class="detail-label">Date & Time:</span>
                    <span class="detail-value">
                        ${lead.eventDate ? this.formatDateShort(lead.eventDate) : 'N/A'} at ${lead.eventTime || 'N/A'}
                    </span>
                </div>
            </div>

            <div class="lead-details-section">
                <h3>Package Selection</h3>
                <div class="detail-row">
                    <span class="detail-label">Package Type:</span>
                    <span class="detail-value">
                        ${lead.packageType === 'premade' ? `Pre-made: ${lead.selectedPackageName || 'N/A'}` : 'Custom Package'}
                    </span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Items:</span>
                    <span class="detail-value">${lead.items?.length || 0} items (${totalItems} units)</span>
                </div>
            </div>

            <div class="lead-details-section">
                <h3>Selected Items</h3>
                <div class="items-table">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #F1F5F9; text-align: left;">
                                <th style="padding: 0.75rem;">Item Name</th>
                                <th style="padding: 0.75rem;">Category</th>
                                <th style="padding: 0.75rem; text-align: center;">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${lead.items?.map(item => `
                                <tr style="border-bottom: 1px solid #E2E8F0;">
                                    <td style="padding: 0.75rem;">${item.name}</td>
                                    <td style="padding: 0.75rem;">${item.categoryName || 'N/A'}</td>
                                    <td style="padding: 0.75rem; text-align: center; font-weight: 600;">${item.quantity}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="3" style="padding: 1rem; text-align: center;">No items</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="lead-details-section">
                <h3>Lead Information</h3>
                <div class="detail-row">
                    <span class="detail-label">Lead ID:</span>
                    <span class="detail-value">${lead.leadId || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value">${this.capitalize(lead.status || 'N/A')}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Created:</span>
                    <span class="detail-value">${createdDate}</span>
                </div>
                ${lead.sessionInfo?.city ? `
                    <div class="detail-row">
                        <span class="detail-label">Location:</span>
                        <span class="detail-value">${lead.sessionInfo.city}, ${lead.sessionInfo.region || ''}, ${lead.sessionInfo.country || ''}</span>
                    </div>
                ` : ''}
                ${lead.sessionInfo?.device ? `
                    <div class="detail-row">
                        <span class="detail-label">Device:</span>
                        <span class="detail-value">${this.capitalize(lead.sessionInfo.device)}</span>
                    </div>
                ` : ''}
            </div>
        `;

        container.innerHTML = html;
        modal.style.display = 'block';
    }

    /**
     * Close lead details
     */
    closeLeadDetails() {
        const modal = document.getElementById('lead-details-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.currentLead = null;
    }

    /**
     * Update lead status
     */
    async updateLeadStatus(leadDocId, newStatus) {
        try {
            // Use the existing Firebase instance from window.db (initialized in admin/index.html)
            const db = window.db;
            if (!db) {
                throw new Error('Firebase Firestore not initialized');
            }

            await db.collection('leads').doc(leadDocId).update({
                status: newStatus,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('✅ Lead status updated:', leadDocId, newStatus);

            // Update local data
            const lead = this.leads.find(l => l.docId === leadDocId);
            if (lead) {
                lead.status = newStatus;
            }

            this.applyFilter();
            this.render();

            OMS?.showNotification('Lead status updated successfully', 'success');

        } catch (error) {
            console.error('❌ Error updating lead status:', error);
            OMS?.showNotification('Error updating lead status', 'error');
        }
    }

    /**
     * Convert lead to order
     */
    async convertToOrder(leadDocId) {
        const lead = this.leads.find(l => l.docId === leadDocId);
        if (!lead) return;

        if (!confirm(`Convert lead ${lead.leadId} to order? This will create a new order in the Orders tab.`)) {
            return;
        }

        try {
            // Here you would integrate with OMS to create the order
            // For now, just update the lead status to converted
            await this.updateLeadStatus(leadDocId, 'converted');

            OMS?.showNotification('Lead converted to order successfully! (Feature coming soon)', 'success');

            // TODO: Integrate with OMS.createOrderFromLead()

        } catch (error) {
            console.error('❌ Error converting lead to order:', error);
            OMS?.showNotification('Error converting lead to order', 'error');
        }
    }

    /**
     * Utility: Format date
     */
    formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;

        return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    /**
     * Utility: Format date time
     */
    formatDateTime(date) {
        return date.toLocaleString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Utility: Format date short
     */
    formatDateShort(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    /**
     * Utility: Capitalize
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Make globally available
if (typeof window !== 'undefined') {
    window.LeadsManager = LeadsManager;
}

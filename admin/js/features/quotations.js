/**
 * Quotations Module - Phase 3A: Rendering & Display Functions
 * Extracted from monolithic index.html
 *
 * This module handles quotation management including:
 * - Creating and editing quotations
 * - Managing single-day, multi-function, and multi-day quotations
 * - Item selection and pricing
 * - Discount calculations
 * - PDF generation
 * - Converting quotations to orders
 */

// ============ PHASE 3A: RENDERING & DISPLAY FUNCTIONS ============

export const Quotations = {

    // Main render function - determines view mode
    renderQuotations(oms) {
        const container = document.getElementById('quotations');

        // Initialize quotations data if not exists
        if (!oms.data.quotations) {
            oms.data.quotations = [];
        }

        const viewMode = oms.quotationViewMode || 'list'; // 'list' or 'create'

        if (viewMode === 'create' || viewMode === 'edit') {
            this.renderQuotationForm(oms);
        } else {
            this.renderQuotationsList(oms);
        }
    },

    // Render quotations list view
    renderQuotationsList(oms) {
        const container = document.getElementById('quotations');
        const quotations = oms.data.quotations || [];

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">📄 Quotations</h2>
                    <button class="btn btn-success" onclick="Quotations.createNewQuotation(window.OMS)">➕ Create New Quotation</button>
                </div>

                <div class="form-row">
                    <input type="text" id="quotationSearch" class="form-input" placeholder="Search quotations by customer, date...">
                </div>

                <div id="quotationsListContainer">
                    ${quotations.length === 0 ? `
                        <div style="text-align: center; padding: 3rem; color: #999;">
                            <h3>📄 No Quotations Yet</h3>
                            <p>Create your first quotation to get started</p>
                            <button class="btn btn-primary" onclick="Quotations.createNewQuotation(window.OMS)">Create Quotation</button>
                        </div>
                    ` : this.renderQuotationsTable(oms, quotations)}
                </div>
            </div>
        `;

        // Add search listener
        setTimeout(() => {
            const searchInput = document.getElementById('quotationSearch');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.filterQuotations(oms, e.target.value);
                });
            }
        }, 100);
    },

    // Render quotations table
    renderQuotationsTable(oms, quotations) {
        const sortedQuotations = quotations.sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Event Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedQuotations.map(q => `
                            <tr>
                                <td>
                                    <strong>${q.customer.name}</strong><br>
                                    <small>${q.customer.contact}</small>
                                </td>
                                <td>${Utils.formatDate(q.customer.eventDate)}</td>
                                <td><strong>₹${q.financials.grandTotal.toLocaleString('en-IN')}</strong></td>
                                <td>
                                    <span class="status-badge ${q.status === 'converted' ? 'success' : q.status === 'sent' ? 'info' : 'warning'}">
                                        ${q.status === 'converted' ? '✓ Converted' : q.status === 'sent' ? '📤 Sent' : '📝 Draft'}
                                    </span>
                                </td>
                                <td><small>${Utils.formatDate(q.createdAt)}</small></td>
                                <td>
                                    <div class="btn-group">
                                        <button class="btn btn-info btn-small" onclick="Quotations.viewQuotationPDF(window.OMS, '${q.id}')" title="View PDF">👁️</button>
                                        <button class="btn btn-primary btn-small" onclick="Quotations.editQuotation(window.OMS, '${q.id}')" title="Edit">✏️</button>
                                        ${q.status !== 'converted' ? `<button class="btn btn-warning btn-small" onclick="Quotations.convertQuotationToOrder(window.OMS, '${q.id}')" title="Convert to Order">🔄</button>` : ''}
                                        <button class="btn btn-danger btn-small" onclick="Quotations.deleteQuotation(window.OMS, '${q.id}')" title="Delete">🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    // Filter quotations by search query
    filterQuotations(oms, searchQuery) {
        const quotations = oms.data.quotations || [];
        let filteredQuotations = quotations;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filteredQuotations = quotations.filter(q => {
                return (
                    (q.customer.name && q.customer.name.toLowerCase().includes(query)) ||
                    (q.customer.contact && q.customer.contact.includes(query)) ||
                    (q.customer.eventVenue && q.customer.eventVenue.toLowerCase().includes(query)) ||
                    (q.quotationNumber && q.quotationNumber.toLowerCase().includes(query))
                );
            });
        }

        document.getElementById('quotationsListContainer').innerHTML = this.renderQuotationsTable(oms, filteredQuotations);
    },

    // Create new quotation
    createNewQuotation(oms) {
        oms.editingQuotationId = null;
        oms.currentQuotation = {
            orderType: 'single', // 'single', 'multifunction', 'multiday'
            items: [],
            functions: [], // For multifunction single day
            days: [], // For multiday orders
            customer: {},
            discount: { type: 'percentage', value: 0, amount: 0 },
            financials: { subtotal: 0, discountAmount: 0, grandTotal: 0 }
        };
        oms.quotationViewMode = 'create';
        this.renderQuotations(oms);
    },

    // Render quotation form (create/edit)
    renderQuotationForm(oms) {
        const container = document.getElementById('quotations');
        const q = oms.currentQuotation || {
            items: [],
            customer: {},
            discount: { type: 'percentage', value: 0, amount: 0 },
            financials: { subtotal: 0, discountAmount: 0, grandTotal: 0 }
        };
        const isEditing = !!oms.editingQuotationId;

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h2 class="card-title">📝 ${isEditing ? 'Edit' : 'Create'} Quotation</h2>
                        <button class="btn btn-secondary" onclick="Quotations.cancelQuotationEdit(window.OMS)">← Back to List</button>
                    </div>
                </div>

                <!-- Order Type Selection -->
                <div class="card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                    <h3 style="color: white; margin: 0 0 1rem 0;">📋 Order Type</h3>
                    <p style="color: rgba(255,255,255,0.9); margin-bottom: 1rem; font-size: 0.9rem;">Select the type of quotation you want to create</p>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                        <button type="button" class="order-type-btn ${!q.orderType || q.orderType === 'single' ? 'active' : ''}" onclick="Quotations.setQuotationOrderType(window.OMS, 'single')" style="padding: 1.5rem; background: ${!q.orderType || q.orderType === 'single' ? 'white' : 'rgba(255,255,255,0.2)'}; color: ${!q.orderType || q.orderType === 'single' ? '#667eea' : 'white'}; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s;">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">📝</div>
                            <div>Single Function</div>
                            <div style="font-size: 0.75rem; opacity: 0.8; margin-top: 0.25rem;">One event, one day</div>
                        </button>
                        <button type="button" class="order-type-btn ${q.orderType === 'multifunction' ? 'active' : ''}" onclick="Quotations.setQuotationOrderType(window.OMS, 'multifunction')" style="padding: 1.5rem; background: ${q.orderType === 'multifunction' ? 'white' : 'rgba(255,255,255,0.2)'}; color: ${q.orderType === 'multifunction' ? '#667eea' : 'white'}; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s;">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">📋</div>
                            <div>Multiple Functions</div>
                            <div style="font-size: 0.75rem; opacity: 0.8; margin-top: 0.25rem;">Same day, different events</div>
                        </button>
                        <button type="button" class="order-type-btn ${q.orderType === 'multiday' ? 'active' : ''}" onclick="Quotations.setQuotationOrderType(window.OMS, 'multiday')" style="padding: 1.5rem; background: ${q.orderType === 'multiday' ? 'white' : 'rgba(255,255,255,0.2)'}; color: ${q.orderType === 'multiday' ? '#667eea' : 'white'}; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s;">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">📅</div>
                            <div>Multiple Days</div>
                            <div style="font-size: 0.75rem; opacity: 0.8; margin-top: 0.25rem;">Multiple days & functions</div>
                        </button>
                    </div>
                </div>

                <div class="card" style="background: #f9f9f9;">
                    <!-- Customer Details -->
                    <h3 style="margin: 0 0 1rem 0;">👤 Customer Details</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label required">Customer Name</label>
                            <input type="text" id="quotCustomerName" class="form-input" value="${q.customer.name || ''}" required placeholder="Enter customer name" list="customerNamesList" oninput="Quotations.autoFillQuotationCustomer(window.OMS, this.value)">
                            <datalist id="customerNamesList">
                                ${oms.data.customers.map(c => `<option value="${c.name}" data-contact="${c.contact}">`).join('')}
                            </datalist>
                        </div>
                        <div class="form-group">
                            <label class="form-label required">Contact Number</label>
                            <input type="tel" id="quotCustomerContact" class="form-input" value="${q.customer.contact || ''}" required placeholder="Enter contact number">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Email (Optional)</label>
                            <input type="email" id="quotCustomerEmail" class="form-input" value="${q.customer.email || ''}" placeholder="Enter email">
                        </div>
                        <div class="form-group">
                            <label class="form-label required">Event Date</label>
                            <input type="date" id="quotEventDate" class="form-input" value="${q.customer.eventDate || ''}" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Event Venue (Live Location Search)</label>
                        <input type="text" id="quotEventVenue" class="form-input" value="${q.customer.eventVenue || ''}" placeholder="🔍 Search for venue location...">
                        <div id="quotSelectedVenueDisplay" style="display: ${q.customer.eventVenue ? 'block' : 'none'}; margin-top: 0.5rem; padding: 0.75rem; background: white; border-radius: 8px; border: 1px solid #e0e0e0;">
                            <div style="display: flex; align-items: start; gap: 0.5rem;">
                                <div style="font-size: 1.5rem;">📍</div>
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; color: #1976D2;">${q.customer.eventVenueName || q.customer.eventVenue || ''}</div>
                                    <div style="font-size: 0.875rem; color: #666; margin-top: 0.25rem;">${q.customer.eventVenue || ''}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Notes (Optional)</label>
                        <textarea id="quotNotes" class="form-input" rows="3" placeholder="Add any special notes, requests, or instructions for this quotation...">${q.notes || ''}</textarea>
                    </div>
                </div>

                <!-- Items/Functions Section - Conditional based on order type -->
                ${!q.orderType || q.orderType === 'single' ? `
                <!-- Single Function Items -->
                <div class="card">
                    <h3 style="margin: 0 0 1rem 0;">📦 Items</h3>
                    <div class="form-group" style="position: relative;">
                        <input type="text" id="quotItemSearch" class="form-input quotItemSearch" data-context="single" placeholder="🔍 Search items from inventory or add custom...">
                        <div id="quotItemSearchResults" class="search-dropdown" style="display: none;"></div>
                    </div>

                    <div id="quotationItemsContainer">
                        ${q.items && q.items.length === 0 ? `
                            <div style="text-align: center; padding: 2rem; color: #999;">
                                <p>No items added yet. Search and add items above.</p>
                            </div>
                        ` : this.renderQuotationItems(oms, q.items || [])}
                    </div>

                    <button type="button" class="btn btn-primary" onclick="Quotations.addCustomQuotationItem(window.OMS)">➕ Add Custom Item</button>
                </div>
                ` : ''}

                ${q.orderType === 'multifunction' ? `
                <!-- Multiple Functions - Same Day -->
                <div class="card">
                    <h3 style="margin: 0 0 1rem 0;">📋 Functions</h3>
                    <p style="color: var(--text-gray); margin-bottom: 1rem;">Add multiple functions for the same day event</p>

                    <div id="quotMultiFunctionsContainer">
                        ${(q.functions || []).map((func, idx) => this.renderQuotationFunction(oms, func, idx)).join('')}
                        ${(!q.functions || q.functions.length === 0) ? `
                            <div style="text-align: center; padding: 2rem; color: #999;">
                                <p>No functions added yet. Click below to add your first function.</p>
                            </div>
                        ` : ''}
                    </div>

                    <button type="button" class="btn btn-primary" onclick="Quotations.addQuotationFunction(window.OMS)">➕ Add Function</button>
                </div>
                ` : ''}

                ${q.orderType === 'multiday' ? `
                <!-- Multiple Days -->
                <div class="card">
                    <h3 style="margin: 0 0 1rem 0;">📅 Days & Functions</h3>
                    <p style="color: var(--text-gray); margin-bottom: 1rem;">Add days with functions and items for each day</p>

                    <div id="quotMultiDaysContainer">
                        ${(q.days || []).map((day, idx) => this.renderQuotationDay(oms, day, idx)).join('')}
                        ${(!q.days || q.days.length === 0) ? `
                            <div style="text-align: center; padding: 2rem; color: #999;">
                                <p>No days added yet. Click below to add your first day.</p>
                            </div>
                        ` : ''}
                    </div>

                    <button type="button" class="btn btn-primary" onclick="Quotations.addQuotationDay(window.OMS)">➕ Add Day</button>
                </div>
                ` : ''}

                <!-- Discount Section -->
                <div class="card" style="background: #fff3cd;">
                    <h3 style="margin: 0 0 1rem 0;">💰 Discount</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Discount Type</label>
                            <select id="quotDiscountType" class="form-select" onchange="Quotations.updateQuotationDiscount(window.OMS)">
                                <option value="percentage" ${q.discount.type === 'percentage' ? 'selected' : ''}>Percentage (%)</option>
                                <option value="fixed" ${q.discount.type === 'fixed' ? 'selected' : ''}>Fixed Amount (₹)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Discount Value</label>
                            <input type="number" id="quotDiscountValue" class="form-input" value="${q.discount.value || 0}" min="0" step="0.01" oninput="Quotations.updateQuotationDiscount(window.OMS)">
                        </div>
                    </div>
                </div>

                <!-- Financial Summary -->
                <div class="card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                    <h3 style="color: white; margin: 0 0 1.5rem 0;">💵 Financial Summary</h3>

                    <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                            <span>Subtotal:</span>
                            <strong id="quotSubtotal">₹0</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                            <span>Discount:</span>
                            <strong id="quotDiscountAmount">- ₹0</strong>
                        </div>
                        <hr style="border-color: rgba(255,255,255,0.3);">
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; font-size: 1.25rem;">
                            <span><strong>Grand Total:</strong></span>
                            <strong id="quotGrandTotal">₹0</strong>
                        </div>
                    </div>

                    <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 8px;">
                        <h4 style="color: white; margin: 0 0 1rem 0; font-size: 1rem;">Payment Schedule:</h4>
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                            <span>Booking Amount (50%):</span>
                            <strong id="quotBooking50">₹0</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                            <span>Before Event (50%):</span>
                            <strong id="quotBeforeEvent50">₹0</strong>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="card">
                    <div class="btn-group">
                        <button class="btn btn-secondary" onclick="Quotations.cancelQuotationEdit(window.OMS)">Cancel</button>
                        <button class="btn btn-info" onclick="Quotations.previewQuotationPDF(window.OMS)">👁️ Preview PDF</button>
                        <button class="btn btn-primary" onclick="Quotations.saveQuotation(window.OMS, 'draft')">💾 Save as Draft</button>
                        <button class="btn btn-success" onclick="Quotations.saveQuotation(window.OMS, 'sent')">💾 Save Quotation</button>
                    </div>
                </div>
            </div>
        `;

        // Initialize item search and Google Maps autocomplete after render
        setTimeout(() => {
            this.initQuotationItemSearch(oms);
            this.initQuotationVenueAutocomplete(oms);
            this.recalculateQuotation(oms);
        }, 100);
    },

    // Render quotation items table
    renderQuotationItems(oms, items) {
        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th style="width: 5%;">#</th>
                            <th style="width: 35%;">Item Name</th>
                            <th style="width: 15%;">Quantity</th>
                            <th style="width: 20%;">Rate (₹)</th>
                            <th style="width: 20%;">Subtotal</th>
                            <th style="width: 5%;"></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map((item, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>
                                    <input type="text" class="form-input" value="${item.name}" onchange="Quotations.updateQuotationItem(window.OMS, ${index}, 'name', this.value)" style="width: 100%;">
                                </td>
                                <td>
                                    <input type="number" class="form-input" value="${item.quantity}" min="1" onchange="Quotations.updateQuotationItem(window.OMS, ${index}, 'quantity', this.value)" style="width: 100%;">
                                </td>
                                <td>
                                    <input type="number" class="form-input" value="${item.rate}" min="0" step="0.01" onchange="Quotations.updateQuotationItem(window.OMS, ${index}, 'rate', this.value)" style="width: 100%;">
                                </td>
                                <td><strong>₹${item.subtotal.toLocaleString('en-IN')}</strong></td>
                                <td>
                                    <button class="btn btn-danger btn-small" onclick="Quotations.removeQuotationItem(window.OMS, ${index})" title="Remove">×</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    // Initialize item search functionality
    initQuotationItemSearch(oms) {
        // Setup search for all quotItemSearch inputs using event delegation
        const container = document.getElementById('quotations');
        if (!container) return;

        // Remove old listeners
        const oldSearchInputs = container.querySelectorAll('.quotItemSearch');
        oldSearchInputs.forEach(input => {
            const clone = input.cloneNode(true);
            input.parentNode.replaceChild(clone, input);
        });

        // Add listeners to all search inputs
        container.addEventListener('input', (e) => {
            if (!e.target.classList.contains('quotItemSearch')) return;

            const searchInput = e.target;
            const query = searchInput.value.toLowerCase().trim();
            const context = searchInput.dataset.context;
            const funcIndex = searchInput.dataset.funcIndex;
            const dayIndex = searchInput.dataset.dayIndex;

            // Create or get dropdown
            let dropdown = searchInput.parentElement.querySelector('.search-dropdown');
            if (!dropdown) {
                dropdown = document.createElement('div');
                dropdown.className = 'search-dropdown';
                dropdown.style.cssText = 'position: absolute; top: 100%; left: 0; right: 0; margin-top: 4px; z-index: 1000; background: white; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-height: 250px; overflow-y: auto; display: none;';
                searchInput.parentElement.style.position = 'relative';
                searchInput.parentElement.appendChild(dropdown);
            }

            if (query.length < 2) {
                dropdown.style.display = 'none';
                return;
            }

            // Search from inventory
            const items = oms.data.inventory?.items || [];
            const matches = items.filter(item =>
                item.name.toLowerCase().includes(query)
            ).slice(0, 10);

            if (matches.length > 0) {
                dropdown.innerHTML = matches.map(item => {
                    const onclickHandler = context === 'single'
                        ? `Quotations.selectQuotationItem(window.OMS, '${item.name.replace(/'/g, "\\'")}', ${item.defaultPrice || 0})`
                        : context === 'multifunction'
                        ? `Quotations.selectQuotationFunctionItem(window.OMS, ${funcIndex}, '${item.name.replace(/'/g, "\\'")}', ${item.defaultPrice || 0})`
                        : `Quotations.selectQuotationDayFunctionItem(window.OMS, ${dayIndex}, ${funcIndex}, '${item.name.replace(/'/g, "\\'")}', ${item.defaultPrice || 0})`;

                    return `
                        <div onclick="${onclickHandler}"
                             style="padding: 0.75rem 1rem; cursor: pointer; border-bottom: 1px solid #f0f0f0; transition: background 0.2s;"
                             onmouseover="this.style.background='#f5f5f5'"
                             onmouseout="this.style.background='white'">
                            <div style="font-weight: 500;">${item.name}</div>
                            <div style="font-size: 0.85rem; color: #666;">
                                ${item.category ? `Category: ${item.category} • ` : ''}
                                Price: ₹${(item.defaultPrice || 0).toLocaleString('en-IN')}
                            </div>
                        </div>
                    `;
                }).join('');
                dropdown.style.display = 'block';
            } else {
                dropdown.style.display = 'none';
            }
        });

        // Close all dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.classList.contains('quotItemSearch')) {
                container.querySelectorAll('.search-dropdown').forEach(d => d.style.display = 'none');
            }
        });
    },

    // Initialize Google Maps venue autocomplete
    initQuotationVenueAutocomplete(oms) {
        if (typeof google === 'undefined' || !google.maps) {
            console.log('⏳ Google Maps not loaded yet for quotation, retrying...');
            setTimeout(() => this.initQuotationVenueAutocomplete(oms), 500);
            return;
        }

        const venueInput = document.getElementById('quotEventVenue');
        if (!venueInput) {
            console.log('Quotation venue input not found');
            return;
        }

        try {
            const autocomplete = new google.maps.places.Autocomplete(venueInput, {
                componentRestrictions: { country: 'in' },
                fields: ['name', 'formatted_address', 'geometry', 'place_id']
            });

            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (!place.geometry) return;

                // Update current quotation with venue data
                if (!oms.currentQuotation.customer) {
                    oms.currentQuotation.customer = {};
                }
                oms.currentQuotation.customer.eventVenue = place.formatted_address;
                oms.currentQuotation.customer.eventVenueName = place.name;
                oms.currentQuotation.customer.eventVenueCoordinates = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                };

                // Update input value
                venueInput.value = place.formatted_address;

                // Show selected venue
                const display = document.getElementById('quotSelectedVenueDisplay');
                if (display) {
                    display.innerHTML = `
                        <div style="display: flex; align-items: start; gap: 0.5rem;">
                            <div style="font-size: 1.5rem;">📍</div>
                            <div style="flex: 1;">
                                <div style="font-weight: 600; color: #1976D2;">${place.name}</div>
                                <div style="font-size: 0.875rem; color: #666; margin-top: 0.25rem;">${place.formatted_address}</div>
                            </div>
                        </div>
                    `;
                    display.style.display = 'block';
                }

                console.log('✅ Quotation venue selected:', place.name);
            });

            console.log('✅ Quotation venue autocomplete initialized');
        } catch (error) {
            console.error('Error initializing quotation venue autocomplete:', error);
        }
    },

    // Select item for multifunction order
    selectQuotationFunctionItem(oms, funcIndex, itemName, price) {
        if (!oms.currentQuotation.functions[funcIndex].items) {
            oms.currentQuotation.functions[funcIndex].items = [];
        }
        oms.currentQuotation.functions[funcIndex].items.push({
            name: itemName,
            quantity: 1,
            price: price || 0
        });
        this.renderQuotations(oms);
    },

    // Select item for multiday order
    selectQuotationDayFunctionItem(oms, dayIndex, funcIndex, itemName, price) {
        if (!oms.currentQuotation.days[dayIndex].functions[funcIndex].items) {
            oms.currentQuotation.days[dayIndex].functions[funcIndex].items = [];
        }
        oms.currentQuotation.days[dayIndex].functions[funcIndex].items.push({
            name: itemName,
            quantity: 1,
            price: price || 0
        });
        this.renderQuotations(oms);
    },

    // Select item for single day order
    selectQuotationItem(oms, itemName, price) {
        const dropdown = document.getElementById('quotItemSearchDropdown');
        const searchInput = document.getElementById('quotItemSearch');

        if (!oms.currentQuotation.items) {
            oms.currentQuotation.items = [];
        }

        // Add item to quotation
        oms.currentQuotation.items.push({
            name: itemName,
            quantity: 1,
            rate: price || 0,
            subtotal: price || 0
        });

        // Clear search and close dropdown
        if (searchInput) searchInput.value = '';
        if (dropdown) dropdown.style.display = 'none';

        // Re-render
        this.renderQuotations(oms);
    },

    // Render function card for multifunction order
    renderQuotationFunction(oms, func, index) {
        const items = func.items || [];
        return `
            <div class="card" style="background: #f9f9f9; margin-bottom: 1rem; border-left: 4px solid var(--primary);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h4 style="margin: 0;">Function ${index + 1}: ${func.name || 'Unnamed Function'}</h4>
                    <button type="button" class="btn btn-danger btn-small" onclick="Quotations.removeQuotationFunction(window.OMS, ${index})">🗑️ Remove</button>
                </div>
                <div class="form-group">
                    <label class="form-label">Function Type</label>
                    <input type="text" class="form-input" value="${func.name || ''}" list="quotFunctionsList"
                           onchange="Quotations.updateQuotationFunctionName(window.OMS, ${index}, this.value)"
                           placeholder="e.g., Sangeet, Reception, Haldi">
                    <datalist id="quotFunctionsList">
                        ${oms.data.eventsList.map(event => `<option value="${event}">`).join('')}
                    </datalist>
                </div>
                <div class="form-group">
                    <label class="form-label">📍 Venue/Location (for this function)</label>
                    <input type="text" id="quotFunc_${index}_venue" class="form-input" value="${func.venue || ''}"
                           onchange="Quotations.updateQuotationFunctionField(window.OMS, ${index}, 'venue', this.value)"
                           placeholder="🔍 Enter venue/location for this function...">
                </div>
                <div class="form-group">
                    <label class="form-label">📝 Notes (for this function)</label>
                    <textarea id="quotFunc_${index}_notes" class="form-input" rows="2"
                              onchange="Quotations.updateQuotationFunctionField(window.OMS, ${index}, 'notes', this.value)"
                              placeholder="Add notes specific to this function...">${func.notes || ''}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Items</label>
                    <div style="position: relative; margin-bottom: 0.5rem;">
                        <input type="text" class="form-input quotItemSearch" data-func-index="${index}" data-context="multifunction" placeholder="🔍 Search items from inventory...">
                    </div>
                    <div id="quotFunctionItems_${index}">
                        ${items.map((item, itemIdx) => {
                            const subtotal = (parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0);
                            return `
                            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center;">
                                <input type="text" class="form-input" value="${item.name}" onchange="Quotations.updateQuotationFunctionItem(window.OMS, ${index}, ${itemIdx}, 'name', this.value)" placeholder="Item name">
                                <input type="number" class="form-input" value="${item.quantity}" onchange="Quotations.updateQuotationFunctionItem(window.OMS, ${index}, ${itemIdx}, 'quantity', this.value)" placeholder="Qty">
                                <input type="number" class="form-input" value="${item.price}" onchange="Quotations.updateQuotationFunctionItem(window.OMS, ${index}, ${itemIdx}, 'price', this.value)" placeholder="Price">
                                <div style="font-weight: 600; color: #2196F3;">₹${subtotal.toLocaleString('en-IN')}</div>
                                <button type="button" class="btn btn-danger btn-small" onclick="Quotations.removeQuotationFunctionItem(window.OMS, ${index}, ${itemIdx})">×</button>
                            </div>
                        `;}).join('')}
                    </div>
                    ${items.length > 0 ? `<div style="text-align: right; font-weight: 700; color: #2196F3; margin-top: 0.5rem; padding: 0.5rem; background: #e3f2fd; border-radius: 4px;">Function Total: ₹${(func.subtotal || 0).toLocaleString('en-IN')}</div>` : ''}
                    <button type="button" class="btn btn-secondary btn-small" onclick="Quotations.addQuotationFunctionItem(window.OMS, ${index})">+ Add Item</button>
                </div>
            </div>
        `;
    },

    // Render day card for multiday order
    renderQuotationDay(oms, day, dayIndex) {
        const functions = day.functions || [];
        return `
            <div class="card" style="background: #e8f4f8; margin-bottom: 1rem; border-left: 4px solid #2196F3;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h4 style="margin: 0;">📅 Day ${dayIndex + 1}: ${day.date || 'No date set'}</h4>
                    <button type="button" class="btn btn-danger btn-small" onclick="Quotations.removeQuotationDay(window.OMS, ${dayIndex})">🗑️ Remove Day</button>
                </div>
                <div class="form-group">
                    <label class="form-label">Date</label>
                    <input type="date" class="form-input" value="${day.date || ''}" onchange="Quotations.updateQuotationDayDate(window.OMS, ${dayIndex}, this.value)">
                </div>
                <h5 style="margin: 1rem 0;">Functions for this day:</h5>
                <div id="quotDayFunctions_${dayIndex}">
                    ${functions.map((func, funcIdx) => `
                        <div class="card" style="background: white; margin-bottom: 0.5rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <input type="text" class="form-input" style="flex: 1; margin-right: 0.5rem;" value="${func.name || ''}" list="quotFunctionsList_${dayIndex}_${funcIdx}"
                                       onchange="Quotations.updateQuotationDayFunctionName(window.OMS, ${dayIndex}, ${funcIdx}, this.value)"
                                       placeholder="Function type">
                                <datalist id="quotFunctionsList_${dayIndex}_${funcIdx}">
                                    ${oms.data.eventsList.map(event => `<option value="${event}">`).join('')}
                                </datalist>
                                <button type="button" class="btn btn-danger btn-small" onclick="Quotations.removeQuotationDayFunction(window.OMS, ${dayIndex}, ${funcIdx})">×</button>
                            </div>
                            <div style="margin-bottom: 0.5rem;">
                                <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem; color: #666;">📍 Venue/Location</label>
                                <input type="text" class="form-input" id="quotDayFunc_${dayIndex}_${funcIdx}_venue" value="${func.venue || ''}"
                                       onchange="Quotations.updateQuotationDayFunctionField(window.OMS, ${dayIndex}, ${funcIdx}, 'venue', this.value)"
                                       placeholder="Enter venue for this function...">
                            </div>
                            <div style="margin-bottom: 0.5rem;">
                                <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem; color: #666;">📝 Notes</label>
                                <textarea class="form-input" id="quotDayFunc_${dayIndex}_${funcIdx}_notes" rows="2"
                                          onchange="Quotations.updateQuotationDayFunctionField(window.OMS, ${dayIndex}, ${funcIdx}, 'notes', this.value)"
                                          placeholder="Add notes for this function...">${func.notes || ''}</textarea>
                            </div>
                            <div style="position: relative; margin-bottom: 0.5rem;">
                                <input type="text" class="form-input quotItemSearch" data-day-index="${dayIndex}" data-func-index="${funcIdx}" data-context="multiday" placeholder="🔍 Search items...">
                            </div>
                            <div id="quotDayFunctionItems_${dayIndex}_${funcIdx}">
                                ${(func.items || []).map((item, itemIdx) => {
                                    const subtotal = (parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0);
                                    return `
                                    <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center;">
                                        <input type="text" class="form-input" value="${item.name}" onchange="Quotations.updateQuotationDayFunctionItem(window.OMS, ${dayIndex}, ${funcIdx}, ${itemIdx}, 'name', this.value)" placeholder="Item">
                                        <input type="number" class="form-input" value="${item.quantity}" onchange="Quotations.updateQuotationDayFunctionItem(window.OMS, ${dayIndex}, ${funcIdx}, ${itemIdx}, 'quantity', this.value)" placeholder="Qty">
                                        <input type="number" class="form-input" value="${item.price}" onchange="Quotations.updateQuotationDayFunctionItem(window.OMS, ${dayIndex}, ${funcIdx}, ${itemIdx}, 'price', this.value)" placeholder="Price">
                                        <div style="font-weight: 600; color: #2196F3;">₹${subtotal.toLocaleString('en-IN')}</div>
                                        <button type="button" class="btn btn-danger btn-small" onclick="Quotations.removeQuotationDayFunctionItem(window.OMS, ${dayIndex}, ${funcIdx}, ${itemIdx})">×</button>
                                    </div>
                                `;}).join('')}
                            </div>
                            ${(func.items || []).length > 0 ? `<div style="text-align: right; font-weight: 700; color: #2196F3; margin-top: 0.5rem; padding: 0.5rem; background: #e3f2fd; border-radius: 4px;">Function Total: ₹${(func.subtotal || 0).toLocaleString('en-IN')}</div>` : ''}
                            <button type="button" class="btn btn-secondary btn-small" onclick="Quotations.addQuotationDayFunctionItem(window.OMS, ${dayIndex}, ${funcIdx})">+ Add Item</button>
                        </div>
                    `).join('')}
                </div>
                ${functions.length > 0 ? `<div style="text-align: right; font-weight: 700; color: #1976D2; margin-top: 1rem; padding: 0.75rem; background: #bbdefb; border-radius: 4px; font-size: 1.1rem;">Day Total: ₹${(day.subtotal || 0).toLocaleString('en-IN')}</div>` : ''}
                <button type="button" class="btn btn-primary btn-small" onclick="Quotations.addQuotationDayFunction(window.OMS, ${dayIndex})">+ Add Function</button>
            </div>
        `;
    },

    // ============ PHASE 3B-3E: ITEM MANAGEMENT, STRUCTURE, CALCULATIONS & CRUD ============

    // Phase 3B: Item Management Functions

    addQuotationItemByName(oms, itemName) {
        // Search in inventory first
        const inventoryItem = oms.data.inventory?.items?.find(i =>
            i.name.toLowerCase() === itemName.toLowerCase()
        );

        const newItem = {
            name: itemName,
            quantity: 1,
            rate: inventoryItem?.defaultPrice || 0,
            subtotal: inventoryItem?.defaultPrice || 0
        };

        oms.currentQuotation.items.push(newItem);
        this.updateQuotationDisplay(oms);
    },

    addCustomQuotationItem(oms) {
        const itemName = prompt('Enter item name:');
        if (!itemName) return;

        const newItem = {
            name: itemName,
            quantity: 1,
            rate: 0,
            subtotal: 0
        };

        oms.currentQuotation.items.push(newItem);
        this.updateQuotationDisplay(oms);
    },

    updateQuotationItem(oms, index, field, value) {
        if (!oms.currentQuotation.items[index]) return;

        // Validation for price and quantity fields
        if (field === 'quantity' || field === 'rate') {
            const numValue = parseFloat(value) || 0;

            // Prevent negative values
            if (numValue < 0) {
                oms.showToast(`${field === 'quantity' ? 'Quantity' : 'Price'} cannot be negative`, 'error');
                return;
            }

            // Warn about very large values
            if (numValue > 10000000) { // 1 crore
                if (!confirm(`${field === 'quantity' ? 'Quantity' : 'Price'} is very large (${numValue.toLocaleString('en-IN')}). Continue?`)) {
                    return;
                }
            }

            oms.currentQuotation.items[index][field] = numValue;
        } else {
            // Name field - trim whitespace
            oms.currentQuotation.items[index][field] = value.trim();
        }

        // Recalculate subtotal
        const item = oms.currentQuotation.items[index];
        item.subtotal = item.quantity * item.rate;

        this.recalculateQuotation(oms);
        this.updateQuotationDisplay(oms);
    },

    removeQuotationItem(oms, index) {
        oms.currentQuotation.items.splice(index, 1);
        this.updateQuotationDisplay(oms);
    },

    updateQuotationDisplay(oms) {
        const container = document.getElementById('quotationItemsContainer');
        if (container && oms.currentQuotation) {
            container.innerHTML = oms.currentQuotation.items.length === 0 ?
                `<div style="text-align: center; padding: 2rem; color: #999;"><p>No items added yet. Search and add items above.</p></div>` :
                this.renderQuotationItems(oms, oms.currentQuotation.items);
        }
        this.recalculateQuotation(oms);
    },

    // Phase 3C: Order Type & Structure Management Functions

    autoFillQuotationCustomer(oms, customerName) {
        // Find customer by name and auto-fill contact
        const customer = oms.data.customers.find(c => c.name === customerName);
        if (customer) {
            document.getElementById('quotCustomerContact').value = customer.contact || '';
            if (customer.email) {
                document.getElementById('quotCustomerEmail').value = customer.email;
            }
        }
    },

    setQuotationOrderType(oms, type) {
        if (!oms.currentQuotation) return;
        oms.currentQuotation.orderType = type;

        // Initialize appropriate data structures
        if (type === 'single') {
            if (!oms.currentQuotation.items) oms.currentQuotation.items = [];
        } else if (type === 'multifunction') {
            if (!oms.currentQuotation.functions) oms.currentQuotation.functions = [];
        } else if (type === 'multiday') {
            if (!oms.currentQuotation.days) oms.currentQuotation.days = [];
        }

        this.renderQuotations(oms);
    },

    addQuotationFunction(oms) {
        if (!oms.currentQuotation.functions) oms.currentQuotation.functions = [];
        oms.currentQuotation.functions.push({ name: '', items: [] });
        this.renderQuotations(oms);
    },

    addQuotationDay(oms) {
        if (!oms.currentQuotation.days) oms.currentQuotation.days = [];
        oms.currentQuotation.days.push({ date: '', functions: [] });
        this.renderQuotations(oms);
    },

    removeQuotationFunction(oms, index) {
        if (confirm('Remove this function?')) {
            oms.currentQuotation.functions.splice(index, 1);
            this.renderQuotations(oms);
        }
    },

    removeQuotationDay(oms, index) {
        if (confirm('Remove this day?')) {
            oms.currentQuotation.days.splice(index, 1);
            this.renderQuotations(oms);
        }
    },

    updateQuotationFunctionName(oms, funcIndex, value) {
        oms.currentQuotation.functions[funcIndex].name = value;
        this.recalculateQuotation(oms);
    },

    updateQuotationFunctionField(oms, funcIndex, field, value) {
        oms.currentQuotation.functions[funcIndex][field] = value;
        // No need to recalculate for notes/venue fields
    },

    addQuotationFunctionItem(oms, funcIndex) {
        if (!oms.currentQuotation.functions[funcIndex].items) {
            oms.currentQuotation.functions[funcIndex].items = [];
        }
        oms.currentQuotation.functions[funcIndex].items.push({ name: '', quantity: 1, price: 0 });
        this.renderQuotations(oms);
    },

    removeQuotationFunctionItem(oms, funcIndex, itemIndex) {
        oms.currentQuotation.functions[funcIndex].items.splice(itemIndex, 1);
        this.renderQuotations(oms);
    },

    updateQuotationFunctionItem(oms, funcIndex, itemIndex, field, value) {
        // Validation for price and quantity fields
        if (field === 'quantity' || field === 'price') {
            const numValue = parseFloat(value) || 0;

            // Prevent negative values
            if (numValue < 0) {
                oms.showToast(`${field === 'quantity' ? 'Quantity' : 'Price'} cannot be negative`, 'error');
                return;
            }

            // Warn about very large values
            if (numValue > 10000000) { // 1 crore
                if (!confirm(`${field === 'quantity' ? 'Quantity' : 'Price'} is very large (${numValue.toLocaleString('en-IN')}). Continue?`)) {
                    return;
                }
            }

            oms.currentQuotation.functions[funcIndex].items[itemIndex][field] = numValue;
        } else {
            // Name field - trim whitespace
            oms.currentQuotation.functions[funcIndex].items[itemIndex][field] = value.trim();
        }

        this.recalculateQuotation(oms);
        this.renderQuotations(oms); // Re-render to show updated subtotals
    },

    updateQuotationDayDate(oms, dayIndex, value) {
        oms.currentQuotation.days[dayIndex].date = value;
    },

    addQuotationDayFunction(oms, dayIndex) {
        if (!oms.currentQuotation.days[dayIndex].functions) {
            oms.currentQuotation.days[dayIndex].functions = [];
        }
        oms.currentQuotation.days[dayIndex].functions.push({ name: '', items: [] });
        this.renderQuotations(oms);
    },

    removeQuotationDayFunction(oms, dayIndex, funcIndex) {
        oms.currentQuotation.days[dayIndex].functions.splice(funcIndex, 1);
        this.renderQuotations(oms);
    },

    updateQuotationDayFunctionName(oms, dayIndex, funcIndex, value) {
        oms.currentQuotation.days[dayIndex].functions[funcIndex].name = value;
    },

    updateQuotationDayFunctionField(oms, dayIndex, funcIndex, field, value) {
        oms.currentQuotation.days[dayIndex].functions[funcIndex][field] = value;
        // No need to recalculate for notes/venue fields
    },

    addQuotationDayFunctionItem(oms, dayIndex, funcIndex) {
        if (!oms.currentQuotation.days[dayIndex].functions[funcIndex].items) {
            oms.currentQuotation.days[dayIndex].functions[funcIndex].items = [];
        }
        oms.currentQuotation.days[dayIndex].functions[funcIndex].items.push({ name: '', quantity: 1, price: 0 });
        this.renderQuotations(oms);
    },

    removeQuotationDayFunctionItem(oms, dayIndex, funcIndex, itemIndex) {
        oms.currentQuotation.days[dayIndex].functions[funcIndex].items.splice(itemIndex, 1);
        this.renderQuotations(oms);
    },

    updateQuotationDayFunctionItem(oms, dayIndex, funcIndex, itemIndex, field, value) {
        // Validation for price and quantity fields
        if (field === 'quantity' || field === 'price') {
            const numValue = parseFloat(value) || 0;

            // Prevent negative values
            if (numValue < 0) {
                oms.showToast(`${field === 'quantity' ? 'Quantity' : 'Price'} cannot be negative`, 'error');
                return;
            }

            // Warn about very large values
            if (numValue > 10000000) { // 1 crore
                if (!confirm(`${field === 'quantity' ? 'Quantity' : 'Price'} is very large (${numValue.toLocaleString('en-IN')}). Continue?`)) {
                    return;
                }
            }

            oms.currentQuotation.days[dayIndex].functions[funcIndex].items[itemIndex][field] = numValue;
        } else {
            // Name field - trim whitespace
            oms.currentQuotation.days[dayIndex].functions[funcIndex].items[itemIndex][field] = value.trim();
        }

        this.recalculateQuotation(oms);
        this.renderQuotations(oms); // Re-render to show updated subtotals
    },

    // Phase 3D: Calculation & Business Logic

    updateQuotationDiscount(oms) {
        const type = Utils.get('quotDiscountType');
        let value = parseFloat(Utils.get('quotDiscountValue')) || 0;

        // Validate discount value
        if (value < 0) {
            oms.showToast('Discount cannot be negative', 'error');
            Utils.set('quotDiscountValue', 0);
            return;
        }

        // Prevent percentage discount > 100%
        if (type === 'percentage' && value > 100) {
            oms.showToast('Discount percentage cannot exceed 100%', 'error');
            Utils.set('quotDiscountValue', 100);
            value = 100;
        }

        // Warn if fixed discount exceeds subtotal
        if (type === 'fixed' && value > oms.currentQuotation.financials.subtotal) {
            oms.showToast('Warning: Discount exceeds subtotal. Grand total will be ₹0.', 'warning');
        }

        oms.currentQuotation.discount = { type, value, amount: 0 };
        this.recalculateQuotation(oms);
    },

    recalculateQuotation(oms) {
        const q = oms.currentQuotation;
        if (!q) return;

        let totalSubtotal = 0;

        // Calculate based on order type
        if (!q.orderType || q.orderType === 'single') {
            // Single function order - calculate from q.items
            if (q.items && q.items.length > 0) {
                q.items.forEach(item => {
                    const price = parseFloat(item.rate || item.price) || 0;
                    const quantity = parseFloat(item.quantity) || 0;
                    item.subtotal = price * quantity;
                    totalSubtotal += item.subtotal;
                });
            }
        } else if (q.orderType === 'multifunction') {
            // Multifunction order - calculate from q.functions
            if (q.functions && q.functions.length > 0) {
                q.functions.forEach(func => {
                    let functionSubtotal = 0;
                    if (func.items && func.items.length > 0) {
                        func.items.forEach(item => {
                            const price = parseFloat(item.price) || 0;
                            const quantity = parseFloat(item.quantity) || 0;
                            item.subtotal = price * quantity;
                            functionSubtotal += item.subtotal;
                        });
                    }
                    func.subtotal = functionSubtotal;
                    totalSubtotal += functionSubtotal;
                });
            }
        } else if (q.orderType === 'multiday') {
            // Multiday order - calculate from q.days
            if (q.days && q.days.length > 0) {
                q.days.forEach(day => {
                    let daySubtotal = 0;
                    if (day.functions && day.functions.length > 0) {
                        day.functions.forEach(func => {
                            let functionSubtotal = 0;
                            if (func.items && func.items.length > 0) {
                                func.items.forEach(item => {
                                    const price = parseFloat(item.price) || 0;
                                    const quantity = parseFloat(item.quantity) || 0;
                                    item.subtotal = price * quantity;
                                    functionSubtotal += item.subtotal;
                                });
                            }
                            func.subtotal = functionSubtotal;
                            daySubtotal += functionSubtotal;
                        });
                    }
                    day.subtotal = daySubtotal;
                    totalSubtotal += daySubtotal;
                });
            }
        }

        // Update quotation financials
        q.financials.subtotal = totalSubtotal;

        // Calculate discount
        if (q.discount.type === 'percentage') {
            q.financials.discountAmount = (q.financials.subtotal * q.discount.value) / 100;
        } else {
            q.financials.discountAmount = parseFloat(q.discount.value) || 0;
        }

        // Calculate grand total
        q.financials.grandTotal = Math.max(0, q.financials.subtotal - q.financials.discountAmount);

        // Calculate payment schedule (50/50 split)
        q.financials.booking50 = (q.financials.grandTotal * 0.5).toFixed(2);
        q.financials.beforeEvent50 = (q.financials.grandTotal * 0.5).toFixed(2);

        // Update display
        this.updateFinancialDisplay(oms);
    },

    updateFinancialDisplay(oms) {
        const q = oms.currentQuotation;
        if (!q) return;

        const subtotalEl = document.getElementById('quotSubtotal');
        const discountEl = document.getElementById('quotDiscountAmount');
        const grandTotalEl = document.getElementById('quotGrandTotal');
        const booking50El = document.getElementById('quotBooking50');
        const beforeEvent50El = document.getElementById('quotBeforeEvent50');

        if (subtotalEl) subtotalEl.textContent = `₹${q.financials.subtotal.toLocaleString('en-IN')}`;
        if (discountEl) discountEl.textContent = `- ₹${q.financials.discountAmount.toLocaleString('en-IN')}`;
        if (grandTotalEl) grandTotalEl.textContent = `₹${q.financials.grandTotal.toLocaleString('en-IN')}`;
        if (booking50El) booking50El.textContent = `₹${parseFloat(q.financials.booking50).toLocaleString('en-IN')}`;
        if (beforeEvent50El) beforeEvent50El.textContent = `₹${parseFloat(q.financials.beforeEvent50).toLocaleString('en-IN')}`;
    },

    // Phase 3E: CRUD Operations

    cancelQuotationEdit(oms) {
        oms.quotationViewMode = 'list';
        oms.editingQuotationId = null;
        oms.currentQuotation = null;
        this.renderQuotations(oms);
    },

    async saveQuotation(oms, status = 'draft') {
        const q = oms.currentQuotation;
        if (!q) return;

        // Validate
        const customerName = Utils.get('quotCustomerName');
        const customerContact = Utils.get('quotCustomerContact');
        const eventDate = Utils.get('quotEventDate');

        if (!customerName || !customerContact || !eventDate) {
            oms.showToast('Please fill customer name, contact, and event date', 'error');
            return;
        }

        // Validate items based on order type
        let hasItems = false;

        if (!q.orderType || q.orderType === 'single') {
            hasItems = q.items && q.items.length > 0;
        } else if (q.orderType === 'multifunction') {
            hasItems = q.functions && q.functions.length > 0 &&
                       q.functions.some(func => func.items && func.items.length > 0);
        } else if (q.orderType === 'multiday') {
            hasItems = q.days && q.days.length > 0 &&
                       q.days.some(day =>
                           day.functions && day.functions.length > 0 &&
                           day.functions.some(func => func.items && func.items.length > 0)
                       );
        }

        if (!hasItems) {
            oms.showToast('Please add at least one item to save quotation', 'error');
            return;
        }

        // Gather data
        q.customer = {
            name: customerName,
            contact: customerContact,
            email: Utils.get('quotCustomerEmail'),
            eventDate: eventDate,
            eventVenue: Utils.get('quotEventVenue'),
            eventVenueName: q.customer?.eventVenueName || '',
            eventVenueCoordinates: q.customer?.eventVenueCoordinates || null
        };

        // Add notes field
        q.notes = Utils.get('quotNotes') || '';

        const quotationData = {
            ...q,
            status: status,
            updatedAt: new Date().toISOString()
        };

        try {
            if (oms.editingQuotationId) {
                // Update existing
                quotationData.id = oms.editingQuotationId;
                quotationData.quotationNumber = q.quotationNumber;
                quotationData.createdAt = q.createdAt;

                await db.collection('quotations').doc(oms.editingQuotationId).update(quotationData);
                oms.showToast('✅ Quotation updated!', 'success');
            } else {
                // Create new
                quotationData.quotationNumber = await this.generateQuotationNumber(oms);
                quotationData.createdAt = new Date().toISOString();
                quotationData.quotationDate = new Date().toISOString().split('T')[0];
                quotationData.validUntil = this.calculateValidUntil();

                const docRef = await db.collection('quotations').add(quotationData);
                quotationData.id = docRef.id;

                oms.showToast('✅ Quotation saved!', 'success');
            }

            // Reload quotations
            await this.loadQuotationsFromFirestore(oms);

            // Return to list
            oms.quotationViewMode = 'list';
            this.renderQuotations(oms);

            return quotationData;
        } catch (error) {
            console.error('Error saving quotation:', error);
            oms.showToast('Error: ' + error.message, 'error');
        }
    },

    async generateQuotationNumber(oms) {
        const year = new Date().getFullYear();
        const quotations = oms.data.quotations || [];
        const thisYearQuotations = quotations.filter(q =>
            q.quotationNumber && q.quotationNumber.startsWith(`QT-${year}`)
        );

        const nextNumber = thisYearQuotations.length + 1;
        return `QT-${year}-${String(nextNumber).padStart(3, '0')}`;
    },

    calculateValidUntil() {
        const date = new Date();
        date.setDate(date.getDate() + 15); // Valid for 15 days
        return date.toISOString().split('T')[0];
    },

    async editQuotation(oms, quotationId) {
        const quotation = oms.data.quotations.find(q => q.id === quotationId);
        if (!quotation) {
            oms.showToast('Quotation not found', 'error');
            return;
        }

        oms.editingQuotationId = quotationId;
        oms.currentQuotation = JSON.parse(JSON.stringify(quotation)); // Deep copy
        oms.quotationViewMode = 'edit';
        this.renderQuotations(oms);
    },

    async deleteQuotation(oms, quotationId) {
        if (!confirm('Delete this quotation?')) return;

        try {
            await db.collection('quotations').doc(quotationId).delete();
            oms.showToast('✅ Quotation deleted', 'success');

            await this.loadQuotationsFromFirestore(oms);
            this.renderQuotations(oms);
        } catch (error) {
            console.error('Error deleting quotation:', error);
            oms.showToast('Error: ' + error.message, 'error');
        }
    },

    async loadQuotationsFromFirestore(oms) {
        try {
            const snapshot = await db.collection('quotations').orderBy('createdAt', 'desc').get();
            const quotations = [];

            snapshot.forEach(doc => {
                quotations.push({ id: doc.id, ...doc.data() });
            });

            oms.data.quotations = quotations;
            console.log(`✅ Loaded ${quotations.length} quotations`);
        } catch (error) {
            console.error('Error loading quotations:', error);
        }
    },

    // Placeholder functions for later phases (PDF & Conversion)
    viewQuotationPDF(oms, quotationId) { console.warn('viewQuotationPDF - to be extracted in Phase 3F'); },
    previewQuotationPDF(oms) { console.warn('previewQuotationPDF - to be extracted in Phase 3F'); },
    downloadQuotationPDF(oms, quotationId) { console.warn('downloadQuotationPDF - to be extracted in Phase 3F'); },
    convertQuotationToOrder(oms, quotationId) { console.warn('convertQuotationToOrder - to be extracted in Phase 3G'); },
};

// Export to window for backward compatibility
if (typeof window !== 'undefined') {
    window.Quotations = Quotations;
}

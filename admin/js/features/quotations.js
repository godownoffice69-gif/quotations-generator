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

    // Placeholder functions for later phases (to be extracted in subsequent phases)
    cancelQuotationEdit(oms) { console.warn('cancelQuotationEdit - to be extracted in later phase'); },
    addQuotationItemByName(oms, itemName) { console.warn('addQuotationItemByName - to be extracted in later phase'); },
    addCustomQuotationItem(oms) { console.warn('addCustomQuotationItem - to be extracted in later phase'); },
    updateQuotationItem(oms, index, field, value) { console.warn('updateQuotationItem - to be extracted in later phase'); },
    removeQuotationItem(oms, index) { console.warn('removeQuotationItem - to be extracted in later phase'); },
    updateQuotationDiscount(oms) { console.warn('updateQuotationDiscount - to be extracted in later phase'); },
    recalculateQuotation(oms) { console.warn('recalculateQuotation - to be extracted in later phase'); },
    autoFillQuotationCustomer(oms, customerName) { console.warn('autoFillQuotationCustomer - to be extracted in later phase'); },
    setQuotationOrderType(oms, type) { console.warn('setQuotationOrderType - to be extracted in later phase'); },
    addQuotationFunction(oms) { console.warn('addQuotationFunction - to be extracted in later phase'); },
    addQuotationDay(oms) { console.warn('addQuotationDay - to be extracted in later phase'); },
    removeQuotationFunction(oms, index) { console.warn('removeQuotationFunction - to be extracted in later phase'); },
    removeQuotationDay(oms, index) { console.warn('removeQuotationDay - to be extracted in later phase'); },
    updateQuotationFunctionName(oms, funcIndex, value) { console.warn('updateQuotationFunctionName - to be extracted in later phase'); },
    updateQuotationFunctionField(oms, funcIndex, field, value) { console.warn('updateQuotationFunctionField - to be extracted in later phase'); },
    addQuotationFunctionItem(oms, funcIndex) { console.warn('addQuotationFunctionItem - to be extracted in later phase'); },
    removeQuotationFunctionItem(oms, funcIndex, itemIndex) { console.warn('removeQuotationFunctionItem - to be extracted in later phase'); },
    updateQuotationFunctionItem(oms, funcIndex, itemIndex, field, value) { console.warn('updateQuotationFunctionItem - to be extracted in later phase'); },
    updateQuotationDayDate(oms, dayIndex, value) { console.warn('updateQuotationDayDate - to be extracted in later phase'); },
    addQuotationDayFunction(oms, dayIndex) { console.warn('addQuotationDayFunction - to be extracted in later phase'); },
    removeQuotationDayFunction(oms, dayIndex, funcIndex) { console.warn('removeQuotationDayFunction - to be extracted in later phase'); },
    updateQuotationDayFunctionName(oms, dayIndex, funcIndex, value) { console.warn('updateQuotationDayFunctionName - to be extracted in later phase'); },
    updateQuotationDayFunctionField(oms, dayIndex, funcIndex, field, value) { console.warn('updateQuotationDayFunctionField - to be extracted in later phase'); },
    addQuotationDayFunctionItem(oms, dayIndex, funcIndex) { console.warn('addQuotationDayFunctionItem - to be extracted in later phase'); },
    removeQuotationDayFunctionItem(oms, dayIndex, funcIndex, itemIndex) { console.warn('removeQuotationDayFunctionItem - to be extracted in later phase'); },
    updateQuotationDayFunctionItem(oms, dayIndex, funcIndex, itemIndex, field, value) { console.warn('updateQuotationDayFunctionItem - to be extracted in later phase'); },
    saveQuotation(oms, status) { console.warn('saveQuotation - to be extracted in later phase'); },
    editQuotation(oms, quotationId) { console.warn('editQuotation - to be extracted in later phase'); },
    deleteQuotation(oms, quotationId) { console.warn('deleteQuotation - to be extracted in later phase'); },
    loadQuotationsFromFirestore(oms) { console.warn('loadQuotationsFromFirestore - to be extracted in later phase'); },
    viewQuotationPDF(oms, quotationId) { console.warn('viewQuotationPDF - to be extracted in later phase'); },
    previewQuotationPDF(oms) { console.warn('previewQuotationPDF - to be extracted in later phase'); },
    downloadQuotationPDF(oms, quotationId) { console.warn('downloadQuotationPDF - to be extracted in later phase'); },
    convertQuotationToOrder(oms, quotationId) { console.warn('convertQuotationToOrder - to be extracted in later phase'); },
};

// Export to window for backward compatibility
if (typeof window !== 'undefined') {
    window.Quotations = Quotations;
}

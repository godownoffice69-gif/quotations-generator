/**
 * History Module
 *
 * Extracted from monolithic OMS class for better code organization.
 * Handles:
 * - Order history display with filtering
 * - Order search functionality
 * - Order merge/unmerge operations
 * - Real-time history search
 *
 * All functions accept `oms` as first parameter following the modular pattern.
 */

import { Utils } from '../utils/helpers.js';

export const History = {

    // ==================== PHASE 10A: HISTORY RENDERING ====================

    /**
     * Render order history tab with search and merge functionality
     * @param {Object} oms - Reference to OMS
     */
    async renderHistory(oms) {
        const container = document.getElementById('history');
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">${oms.t('orderHistory')}</h2>
                </div>
                <div class="btn-group">
                    <button class="btn btn-success" data-action="exportData">${oms.t('export')}</button>
                </div>
                <!-- Floating Merge Button -->
                <button class="btn btn-primary" id="mergeSelectedBtn"
                    style="display: none; position: fixed; bottom: 30px; right: 30px; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.3); padding: 15px 25px; font-size: 16px;"
                    onclick="History.showMergeModal(window.OMS)">
                    🔗 Merge Selected Orders (<span id="mergeCount">0</span>)
                </button>
                <div class="form-group" style="margin: 20px 0; position: relative;">
                    <label class="form-label">🔍 Search Orders</label>
                    <input type="text" id="historySearch" class="form-input" placeholder="Search by client name, order ID, date, or venue...">
                    <div id="historySearchResults" class="search-dropdown"></div>
                </div>
                <div id="historyContainer"></div>
            </div>
        `;

        // Add search functionality
        this.setupHistorySearch(oms);

        // Initialize selected orders array
        oms.selectedOrdersForMerge = [];

        // Check if user can manage financials
        const canManageFinancials = await oms.canViewFinancials();

        // IMPORTANT: Filter out orders that have been merged into other orders
        // Only show orders that are NOT marked as isMerged
        const visibleOrders = oms.data.orders.filter(o => !o.isMerged);
        console.log(`📋 History: Showing ${visibleOrders.length} orders (filtered out ${oms.data.orders.length - visibleOrders.length} merged orders)`);

        oms.renderTable('historyContainer', [
            { key: 'select', label: '☑️', render: o => {
                const isMergedOrder = o.mergedFrom && o.mergedFrom.length > 0;
                return `<input type="checkbox" class="order-select-checkbox" data-order-id="${o.docId || o.orderId}" ${isMergedOrder ? 'disabled' : ''} onchange="History.toggleOrderSelection(window.OMS, '${o.docId || o.orderId}')">`;
            }},
            { key: 'orderId', label: oms.t('orderId'), render: o => {
                const mergeStatus = o.mergedFrom && o.mergedFrom.length > 0
                    ? `<span style="color: #667eea; font-weight: bold;">🔗 MERGED (${o.mergedFrom.length} orders)</span>`
                    : '';
                return `<span class="order-id-highlight">${o.orderId}</span> ${mergeStatus}`;
            }},
            { key: 'clientName', label: oms.t('client') },
            { key: 'venue', label: oms.t('venue') },
            { key: 'date', label: oms.t('date'), render: o => {
                if (o.isMultiDay) {
                    return `${Utils.formatDate(o.startDate)} ${oms.t('to')} ${Utils.formatDate(o.endDate)}`;
                }
                return Utils.formatDate(o.date);
            }},
            { key: 'status', label: oms.t('status'), render: o => `<span class="status-badge status-${o.status.toLowerCase()}">${oms.t(o.status.toLowerCase())}</span>` }
        ], visibleOrders, (row) => {
            const isMergedOrder = row.mergedFrom && row.mergedFrom.length > 0;
            const unmergeBtn = isMergedOrder ? `<button class="btn btn-info btn-small" onclick="History.unmergeOrder(window.OMS, '${row.docId || row.orderId}')">🔓 Unmerge</button>` : '';
            const paymentExpenseButtons = canManageFinancials ? `
                <button class="btn btn-primary btn-small" onclick="OMS.addPaymentForOrder('${row.docId || row.orderId}')">💵 Payment</button>
                <button class="btn btn-warning btn-small" onclick="OMS.addExpenseForOrder('${row.docId || row.orderId}')">💸 Expense</button>
            ` : '';
            return `
                <button class="btn btn-secondary btn-small" data-action="edit" data-type="order" data-id="${row.docId || row.orderId}">${oms.t('edit')}</button>
                <button class="btn btn-success btn-small" data-action="print" data-id="${row.docId || row.orderId}">${oms.t('print')}</button>
                ${paymentExpenseButtons}
                ${unmergeBtn}
                <button class="btn btn-danger btn-small" data-action="delete" data-type="order" data-id="${row.docId || row.orderId}">${oms.t('delete')}</button>
            `;
        });
    },

    // ==================== PHASE 10B: SEARCH & FILTER ====================

    /**
     * Setup history search functionality with real-time filtering
     * @param {Object} oms - Reference to OMS
     */
    setupHistorySearch(oms) {
        const searchInput = document.getElementById('historySearch');
        const searchResults = document.getElementById('historySearchResults');

        if (!searchInput || !searchResults) return;

        let searchTimeout;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim().toLowerCase();

            if (query.length < 2) {
                searchResults.style.display = 'none';
                searchResults.innerHTML = '';
                return;
            }

            searchTimeout = setTimeout(() => {
                // Search through all orders
                const results = oms.data.orders.filter(order => {
                    const clientName = (order.clientName || '').toLowerCase();
                    const orderId = (order.orderId || '').toLowerCase();
                    const venue = (order.venue || '').toLowerCase();
                    const date = order.isMultiDay
                        ? `${Utils.formatDate(order.startDate)} ${Utils.formatDate(order.endDate)}`.toLowerCase()
                        : Utils.formatDate(order.date).toLowerCase();

                    return clientName.includes(query) ||
                           orderId.includes(query) ||
                           venue.includes(query) ||
                           date.includes(query);
                }); // Show all matching results (no limit)

                if (results.length === 0) {
                    searchResults.innerHTML = '<div class="search-dropdown-item">No orders found</div>';
                    searchResults.style.display = 'block';
                } else {
                    searchResults.innerHTML = results.map(order => {
                        const dateDisplay = order.isMultiDay
                            ? `${Utils.formatDate(order.startDate)} - ${Utils.formatDate(order.endDate)}`
                            : Utils.formatDate(order.date);
                        const statusClass = `status-${order.status.toLowerCase()}`;

                        return `
                            <div class="search-dropdown-item" data-order-id="${order.docId || order.orderId}" style="cursor: pointer; padding: 10px; border-bottom: 1px solid var(--border-color);">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <strong>${order.orderId || '[No ID]'}</strong> - ${order.clientName}
                                        <br>
                                        <small style="color: var(--text-gray);">
                                            📅 ${dateDisplay} | 📍 ${order.venue || 'N/A'}
                                        </small>
                                    </div>
                                    <span class="status-badge ${statusClass}">${order.status}</span>
                                </div>
                            </div>
                        `;
                    }).join('');
                    searchResults.style.display = 'block';

                    // Add click handlers to search results
                    searchResults.querySelectorAll('.search-dropdown-item').forEach(item => {
                        const orderId = item.getAttribute('data-order-id');
                        if (orderId && orderId !== 'null') {
                            item.addEventListener('click', () => {
                                // Find the order
                                const order = oms.data.orders.find(o =>
                                    o.docId === orderId || o.orderId === orderId
                                );

                                if (order) {
                                    // Switch to orders tab
                                    oms.switchTab('orders');
                                    // Load order into form for editing
                                    if (window.Orders && typeof window.Orders.loadOrderToForm === 'function') {
                                        window.Orders.loadOrderToForm(oms, order);
                                    }
                                    // Clear search
                                    searchInput.value = '';
                                    searchResults.style.display = 'none';
                                }
                            });
                        }
                    });
                }
            }, 300); // Debounce 300ms
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });
    },

    /**
     * Toggle order selection for merge
     * @param {Object} oms - Reference to OMS
     * @param {string} orderId - Order ID to toggle
     */
    toggleOrderSelection(oms, orderId) {
        const checkbox = document.querySelector(`.order-select-checkbox[data-order-id="${orderId}"]`);
        if (!checkbox) return;

        if (checkbox.checked) {
            if (!oms.selectedOrdersForMerge.includes(orderId)) {
                oms.selectedOrdersForMerge.push(orderId);
            }
        } else {
            oms.selectedOrdersForMerge = oms.selectedOrdersForMerge.filter(id => id !== orderId);
        }

        // Show/hide merge button based on selection count
        const mergeBtn = document.getElementById('mergeSelectedBtn');
        const mergeCount = document.getElementById('mergeCount');
        if (mergeBtn) {
            mergeBtn.style.display = oms.selectedOrdersForMerge.length >= 2 ? 'block' : 'none';
            if (mergeCount) {
                mergeCount.textContent = oms.selectedOrdersForMerge.length;
            }
        }
    },

    // ==================== PHASE 10C: MERGE/UNMERGE ====================

    /**
     * Show merge orders modal
     * @param {Object} oms - Reference to OMS
     */
    showMergeModal(oms) {
        if (oms.selectedOrdersForMerge.length < 2) {
            alert('Please select at least 2 orders to merge');
            return;
        }

        // Get selected orders
        const selectedOrders = oms.selectedOrdersForMerge.map(id =>
            oms.data.orders.find(o => (o.docId || o.orderId) === id)
        ).filter(o => o);

        if (selectedOrders.length < 2) {
            alert('Error: Could not find selected orders');
            return;
        }

        // Create modal HTML
        const modalHTML = `
            <div class="modal show" id="mergeModalOverlay" onclick="if(event.target === this) document.getElementById('mergeModalOverlay').remove();">
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h2>🔗 Merge Orders</h2>
                    </div>
                    <div class="modal-body">
                        <p style="margin-bottom: 1rem; color: #666;">Select which order to keep as the base. All other orders' content will be merged into it.</p>

                        <div class="form-group">
                            <label class="form-label">Select Base Order:</label>
                            <select id="mergeBaseOrder" class="form-select" onchange="History.updateMergeOrderId(window.OMS)">
                                ${selectedOrders.map(order => `
                                    <option value="${order.docId || order.orderId}">
                                        ${order.orderId} - ${order.clientName} (${order.isMultiDay ? `${Utils.formatDate(order.startDate)} to ${Utils.formatDate(order.endDate)}` : Utils.formatDate(order.date)})
                                    </option>
                                `).join('')}
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Merged Order ID (editable):</label>
                            <input type="text" id="mergedOrderId" class="form-input" value="${selectedOrders[0].orderId}">
                            <small style="color: #666;">You can change the Order ID for the merged order</small>
                        </div>

                        <div style="background: #f0f0f0; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                            <h4 style="margin: 0 0 0.5rem 0;">Orders to be merged:</h4>
                            <ul style="margin: 0; padding-left: 1.5rem;">
                                ${selectedOrders.map(order => `
                                    <li>${order.orderId} - ${order.clientName}</li>
                                `).join('')}
                            </ul>
                            <p style="margin-top: 0.5rem; font-size: 0.9em; color: #666;">
                                Original orders will be marked as "merged" and can be unmerged later.
                            </p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="document.getElementById('mergeModalOverlay').remove()">Cancel</button>
                        <button class="btn btn-primary" onclick="History.performMerge(window.OMS)">🔗 Merge Orders</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    /**
     * Update merge order ID when base order changes
     * @param {Object} oms - Reference to OMS
     */
    updateMergeOrderId(oms) {
        const baseOrderSelect = document.getElementById('mergeBaseOrder');
        const orderIdInput = document.getElementById('mergedOrderId');
        if (!baseOrderSelect || !orderIdInput) return;

        const baseOrderId = baseOrderSelect.value;
        const baseOrder = oms.data.orders.find(o => (o.docId || o.orderId) === baseOrderId);
        if (baseOrder) {
            orderIdInput.value = baseOrder.orderId;
        }
    },

    /**
     * Execute merge operation
     * @param {Object} oms - Reference to OMS
     */
    async performMerge(oms) {
        const baseOrderSelect = document.getElementById('mergeBaseOrder');
        const orderIdInput = document.getElementById('mergedOrderId');

        if (!baseOrderSelect || !orderIdInput) return;

        const baseOrderId = baseOrderSelect.value;
        const newOrderId = orderIdInput.value.trim();

        if (!newOrderId) {
            alert('Please enter an Order ID for the merged order');
            return;
        }

        try {
            // Get all selected orders
            const ordersToMerge = oms.selectedOrdersForMerge.map(id =>
                oms.data.orders.find(o => (o.docId || o.orderId) === id)
            ).filter(o => o);

            // Get base order
            const baseOrder = ordersToMerge.find(o => (o.docId || o.orderId) === baseOrderId);
            const otherOrders = ordersToMerge.filter(o => (o.docId || o.orderId) !== baseOrderId);

            if (!baseOrder) {
                alert('Error: Base order not found');
                return;
            }

            // Store original orders data for unmerge
            const mergedFromData = ordersToMerge.map(order => ({
                docId: order.docId,
                orderId: order.orderId,
                orderData: JSON.parse(JSON.stringify(order)) // Deep copy
            }));

            // Create merged order by combining content
            const mergedOrder = JSON.parse(JSON.stringify(baseOrder)); // Deep copy
            mergedOrder.orderId = newOrderId;
            mergedOrder.mergedFrom = mergedFromData;
            mergedOrder.mergedAt = new Date().toISOString();

            // Merge items from other orders (for single-day orders)
            if (!mergedOrder.isMultiDay) {
                otherOrders.forEach(order => {
                    if (!order.isMultiDay && order.items && order.items.length > 0) {
                        mergedOrder.items = [...(mergedOrder.items || []), ...order.items];
                    }
                });
            }

            // Merge day-wise data for multi-day orders
            if (mergedOrder.isMultiDay) {
                otherOrders.forEach(order => {
                    if (order.isMultiDay && order.dayWiseData) {
                        // Merge dayWiseData intelligently
                        order.dayWiseData.forEach(dayData => {
                            const existingDayIndex = mergedOrder.dayWiseData.findIndex(d => d.date === dayData.date);
                            if (existingDayIndex >= 0) {
                                // Merge functions for same date
                                mergedOrder.dayWiseData[existingDayIndex].functions = [
                                    ...(mergedOrder.dayWiseData[existingDayIndex].functions || []),
                                    ...(dayData.functions || [])
                                ];
                            } else {
                                // Add new date
                                mergedOrder.dayWiseData.push(dayData);
                            }
                        });
                    }
                });
            }

            // Merge notes
            const allNotes = ordersToMerge.map(o => o.notes).filter(n => n && n.trim()).join('\n---\n');
            if (allNotes) {
                mergedOrder.notes = allNotes;
            }

            // Update merged order in Firebase
            await this.updateOrderInFirebase(oms, mergedOrder, baseOrder.docId);

            // Mark other orders as merged
            for (const order of otherOrders) {
                const updatedOrder = { ...order, isMerged: true, mergedInto: newOrderId };
                await this.updateOrderInFirebase(oms, updatedOrder, order.docId);
            }

            // Reload data
            await oms.loadOrdersFromFirestore();

            // Close modal
            document.getElementById('mergeModalOverlay')?.remove();

            // Clear selection
            oms.selectedOrdersForMerge = [];

            // Refresh history view
            this.renderHistory(oms);

            alert(`✅ Successfully merged ${ordersToMerge.length} orders into ${newOrderId}`);

        } catch (error) {
            console.error('Error merging orders:', error);
            alert('Error merging orders: ' + error.message);
        }
    },

    /**
     * Unmerge an order and restore original orders
     * @param {Object} oms - Reference to OMS
     * @param {string} orderId - ID of merged order to unmerge
     */
    async unmergeOrder(oms, orderId) {
        if (!confirm('Are you sure you want to unmerge this order? This will restore all original separate orders.')) {
            return;
        }

        try {
            // Find the merged order
            const mergedOrder = oms.data.orders.find(o => (o.docId || o.orderId) === orderId);

            if (!mergedOrder || !mergedOrder.mergedFrom) {
                alert('Error: This is not a merged order');
                return;
            }

            console.log(`🔓 Unmerging order ${orderId}. Will restore ${mergedOrder.mergedFrom.length} original orders:`,
                mergedOrder.mergedFrom.map(o => `${o.orderId} (docId: ${o.docId})`));

            // Restore all original orders
            for (const originalData of mergedOrder.mergedFrom) {
                const restoredOrder = originalData.orderData;

                // Explicitly remove merge-related fields from Firestore
                restoredOrder.isMerged = firebase.firestore.FieldValue.delete();
                restoredOrder.mergedInto = firebase.firestore.FieldValue.delete();
                restoredOrder.mergedFrom = firebase.firestore.FieldValue.delete();
                restoredOrder.mergedAt = firebase.firestore.FieldValue.delete();

                console.log(`📝 Restoring order ${originalData.orderId} to docId ${originalData.docId}`);
                await this.updateOrderInFirebase(oms, restoredOrder, originalData.docId);
            }

            // Reload data
            await oms.loadOrdersFromFirestore();

            // Refresh history view
            this.renderHistory(oms);

            alert(`✅ Successfully unmerged order. ${mergedOrder.mergedFrom.length} original orders restored.`);

        } catch (error) {
            console.error('Error unmerging order:', error);
            alert('Error unmerging order: ' + error.message);
        }
    },

    /**
     * Update order in Firebase (helper function)
     * @param {Object} oms - Reference to OMS
     * @param {Object} orderData - Order data to update
     * @param {string} docId - Document ID
     */
    async updateOrderInFirebase(oms, orderData, docId) {
        if (!docId) {
            throw new Error('Document ID is required for update');
        }

        const orderRef = firebase.firestore().collection('orders').doc(docId);
        await orderRef.update(orderData);

        console.log(`Order ${docId} updated in Firebase`);
    }

};

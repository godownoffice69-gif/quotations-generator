/* ============================================
   CUSTOMERS - Customer management display logic
   ============================================ */

/**
 * Customer Feature Module
 *
 * Provides:
 * - Customer list rendering
 * - Customer search/filtering
 * - Customer statistics
 *
 * @exports Customers
 */

import { Utils } from '../utils/helpers.js';

export const Customers = {
    /**
     * Render customers tab with search
     * @param {Object} oms - Reference to OMS
     */
    render(oms) {
        const container = document.getElementById('customers');
        if (!container) return;

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">${oms.t('customers')}</h2>
                </div>
                <div class="form-row">
                    <input type="text" id="customerSearch" class="form-input" placeholder="${oms.t('searchPlaceholder')}">
                    <button class="btn btn-primary" onclick="OMS.refreshCustomerDatabase()">🔄 ${oms.t('reset')}</button>
                </div>
                <div id="customersContainer"></div>
            </div>
        `;

        // Initial render with all customers
        this.filterAndDisplay('', oms);

        // Add real-time search listener (only once)
        setTimeout(() => {
            const searchInput = document.getElementById('customerSearch');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.filterAndDisplay(e.target.value, oms);
                });
            }
        }, 100);
    },

    /**
     * Filter and display customers based on search query
     * @param {string} searchQuery - Search query string
     * @param {Object} oms - Reference to OMS
     */
    filterAndDisplay(searchQuery, oms) {
        // Filter customers based on search query
        let filteredCustomers = oms.data.customers;
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filteredCustomers = oms.data.customers.filter(customer => {
                return (
                    (customer.name && customer.name.toLowerCase().includes(query)) ||
                    (customer.contact && customer.contact.toLowerCase().includes(query)) ||
                    (customer.email && customer.email.toLowerCase().includes(query))
                );
            });
        }

        // Only re-render the table, not the entire page
        oms.renderTable('customersContainer', [
            { key: 'name', label: oms.t('customerName') },
            { key: 'contact', label: oms.t('contact') },
            { key: 'totalOrders', label: oms.t('totalOrdersCount') },
            { key: 'lastOrderDate', label: oms.t('lastOrder'), render: c => Utils.formatDate(c.lastOrderDate) }
        ], filteredCustomers, (row) => `
            <button class="btn btn-secondary btn-small" onclick="OMS.viewCustomerOrders('${row.id}')">${oms.t('viewOrders')}</button>
            <button class="btn btn-primary btn-small" onclick="OMS.createOrderForCustomer('${row.id}')">${oms.t('orders')}</button>
        `);
    },

    /**
     * Get customer statistics
     * @param {Array} customers - Customer array
     * @returns {Object} Statistics object
     */
    getStats(customers) {
        if (!customers || customers.length === 0) {
            return {
                total: 0,
                topCustomer: null,
                avgOrdersPerCustomer: 0
            };
        }

        const totalOrders = customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0);
        const topCustomer = customers.reduce((prev, curr) =>
            (prev.totalOrders > curr.totalOrders) ? prev : curr
        );

        return {
            total: customers.length,
            topCustomer: topCustomer,
            avgOrdersPerCustomer: (totalOrders / customers.length).toFixed(1)
        };
    },

    /**
     * Get customer by ID
     * @param {Array} customers - Customer array
     * @param {string} customerId - Customer ID
     * @returns {Object|null} Customer object or null
     */
    getById(customers, customerId) {
        return customers.find(c => c.id === customerId) || null;
    },

    /**
     * Get customers with high order count (VIP customers)
     * @param {Array} customers - Customer array
     * @param {number} threshold - Minimum orders for VIP status (default: 5)
     * @returns {Array} VIP customers
     */
    getVIPCustomers(customers, threshold = 5) {
        return customers.filter(c => c.totalOrders >= threshold);
    }
};

// Make globally available
if (typeof window !== 'undefined') {
    window.Customers = Customers;
}

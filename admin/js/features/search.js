/* ============================================
   GLOBAL SEARCH - Search across orders, customers, and inventory
   ============================================ */

/**
 * Global Search Feature Module
 *
 * Provides unified search across:
 * - Orders (by order ID, client name, venue)
 * - Customers (by name, contact)
 * - Inventory items (by name)
 *
 * @exports GlobalSearch
 */

import { Utils } from '../utils/helpers.js';

export const GlobalSearch = {
    /**
     * Initialize global search functionality
     * Sets up event listeners for search input and keyboard shortcuts
     * @param {Object} oms - Reference to OMS object for data access
     */
    init(oms) {
        const input = document.getElementById('globalSearch');
        const results = document.getElementById('globalSearchResults');

        if (!input || !results) {
            console.warn('⚠️ Global search elements not found');
            return;
        }

        // Debounced search on input
        input.addEventListener('input', Utils.debounce((e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query.length < 2) {
                results.classList.remove('show');
                return;
            }

            const searchResults = this.performSearch(query, oms.data);
            this.displayResults(searchResults, oms);
        }, 300));

        // Escape key to close search results
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                results.classList.remove('show');
                input.value = '';
            }
        });

        console.log('✅ Global search initialized');
    },

    /**
     * Perform search across all data sources
     * @param {string} query - Search query (lowercased)
     * @param {Object} data - OMS data object containing orders, customers, inventory
     * @returns {Array} Array of search results with type and data
     */
    performSearch(query, data) {
        const results = [];

        // Search orders by ID, client name, and venue
        if (data.orders && Array.isArray(data.orders)) {
            data.orders.forEach(order => {
                if (order.orderId && order.orderId.toLowerCase().includes(query) ||
                    order.clientName && order.clientName.toLowerCase().includes(query) ||
                    order.venue && order.venue.toLowerCase().includes(query)) {
                    results.push({ type: 'order', data: order });
                }
            });
        }

        // Search customers by name and contact
        if (data.customers && Array.isArray(data.customers)) {
            data.customers.forEach(customer => {
                if (customer.name && customer.name.toLowerCase().includes(query) ||
                    customer.contact && customer.contact.includes(query)) {
                    results.push({ type: 'customer', data: customer });
                }
            });
        }

        // Search inventory items by name
        if (data.inventory && data.inventory.items && Array.isArray(data.inventory.items)) {
            data.inventory.items.forEach(item => {
                if (item.name && item.name.toLowerCase().includes(query)) {
                    results.push({ type: 'item', data: item });
                }
            });
        }

        // Limit to top 10 results
        return results.slice(0, 10);
    },

    /**
     * Display search results in the dropdown
     * @param {Array} results - Search results array
     * @param {Object} oms - Reference to OMS for navigation
     */
    displayResults(results, oms) {
        const container = document.getElementById('globalSearchResults');
        if (!container) return;

        if (results.length === 0) {
            container.innerHTML = '<div class="search-result-item">No results found</div>';
        } else {
            container.innerHTML = results.map(r => {
                const displayText = r.type === 'order'
                    ? `${r.data.orderId} - ${r.data.clientName}`
                    : r.type === 'customer'
                    ? r.data.name
                    : r.data.name;

                const searchId = r.data.id || r.data.orderId || '';

                return `
                    <div class="search-result-item" onclick="GlobalSearch.navigateToResult('${r.type}', '${searchId}', OMS)">
                        <div>
                            <div class="search-result-type">${r.type}</div>
                            <div>${displayText}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }
        container.classList.add('show');
    },

    /**
     * Navigate to the selected search result
     * @param {string} type - Result type (order, customer, item)
     * @param {string} id - Item ID
     * @param {Object} oms - Reference to OMS for tab switching
     */
    navigateToResult(type, id, oms) {
        const tabMap = {
            order: 'history',
            customer: 'customers',
            item: 'inventory'
        };

        if (tabMap[type]) {
            oms.switchTab(tabMap[type]);
        }

        // Close search dropdown
        const results = document.getElementById('globalSearchResults');
        const input = document.getElementById('globalSearch');
        if (results) results.classList.remove('show');
        if (input) input.value = '';
    }
};

// Make globally available for inline onclick handlers
if (typeof window !== 'undefined') {
    window.GlobalSearch = GlobalSearch;
}

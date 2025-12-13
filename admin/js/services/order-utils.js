/* ============================================
   ORDER UTILITIES SERVICE - ID generation, calculations, formatting
   ============================================ */

/**
 * Order Utilities Service Module
 *
 * Handles:
 * - Order ID generation and management
 * - Total amount calculations
 * - Date formatting for orders
 * - Order data transformations
 *
 * @exports OrderUtils
 */

import { Utils } from '../utils/helpers.js';

export const OrderUtils = {
    /**
     * Generate next order ID based on prefix and counter
     * @param {Object} settings - OMS settings object
     * @returns {string} Next order ID (e.g., "FP001")
     */
    getNextOrderId(settings) {
        const prefix = settings.invoicePrefix || 'FP';
        const counter = settings.orderIdCounter || 1;
        return `${prefix}${String(counter).padStart(3, '0')}`;
    },

    /**
     * Increment order ID counter and return new ID
     * @param {Object} settings - OMS settings object (mutated)
     * @returns {string} New order ID
     */
    incrementOrderCounter(settings) {
        settings.orderIdCounter = (settings.orderIdCounter || 1) + 1;
        return this.getNextOrderId(settings);
    },

    /**
     * Determine final order ID based on status
     * NEW ID SYSTEM: Only completed orders get FP IDs
     * @param {string} manualOrderId - Manually entered order ID
     * @param {string} status - Order status (completed, confirmed, pending)
     * @returns {Object} { orderId: string, error: string|null }
     */
    determineFinalOrderId(manualOrderId, status) {
        const statusLower = status.toLowerCase();

        if (statusLower === 'completed') {
            // Completed orders MUST have manual FP ID
            if (manualOrderId && manualOrderId.startsWith('FP')) {
                return {
                    orderId: manualOrderId,
                    error: null
                };
            } else {
                return {
                    orderId: null,
                    error: '⚠️ Completed orders require a manual FP ID (e.g., FP001)'
                };
            }
        } else {
            // Pending/Confirmed orders have NO ID (blank)
            return {
                orderId: '',
                error: null
            };
        }
    },

    /**
     * Calculate total amount from order items
     * Handles both single-day and multi-day orders
     * @param {Object} orderData - Order data object
     * @returns {number} Total amount
     */
    calculateTotalAmount(orderData) {
        if (orderData.isMultiDay) {
            // Multi-day: sum all items from all functions of all days
            return (orderData.dayWiseData || []).reduce((sum, day) => {
                const dayTotal = (day.functions || []).reduce((daySum, func) => {
                    const funcTotal = (func.items || []).reduce((itemSum, item) => {
                        return itemSum + ((item.price || 0) * (item.quantity || 0));
                    }, 0);
                    return daySum + funcTotal;
                }, 0);
                return sum + dayTotal;
            }, 0);
        } else {
            // Single-day: sum all items
            return (orderData.items || []).reduce((sum, item) => {
                return sum + ((item.price || 0) * (item.quantity || 0));
            }, 0);
        }
    },

    /**
     * Convert admin order data to Firestore quotation format
     * @param {Object} orderData - Order data from form
     * @param {number} totalAmount - Calculated total amount
     * @param {Object} weatherData - Weather data object
     * @returns {Object} Firestore-compatible order data
     */
    convertToFirestoreFormat(orderData, totalAmount, weatherData) {
        return {
            orderId: orderData.orderId,
            isMultiDay: orderData.isMultiDay || false,
            startDate: orderData.startDate || null,
            endDate: orderData.endDate || null,
            dayWiseData: orderData.dayWiseData || [],
            customer: {
                name: orderData.clientName,
                phone: orderData.contact,
                venue: orderData.venue,
                dates: orderData.isMultiDay
                    ? `${Utils.formatDate(orderData.startDate)} to ${Utils.formatDate(orderData.endDate)}`
                    : this.convertToQuotationDateFormat(orderData.date),
                timeSlot: orderData.readyTime || '',
                functionType: orderData.eventType || '',
                location: ''
            },
            functionType: orderData.eventType || '',
            items: orderData.isMultiDay ? [] : (orderData.items || []).map(item => ({
                name: item.name,
                qty: item.quantity,
                desc: item.remarks || '',
                price: item.price || 0
            })),
            totalAmount: totalAmount,
            clientName: orderData.clientName,
            contact: orderData.contact,
            venue: orderData.venue,
            venueMapLink: orderData.venueMapLink || null,
            venueLocation: orderData.venueLocation || null,
            date: orderData.date || '',
            readyTime: orderData.readyTime || '',
            eventType: orderData.eventType || '',
            transport: orderData.transport || '',
            driverName: orderData.driverName || '',
            transport2: orderData.transport2 || '',
            driverName2: orderData.driverName2 || '',
            operator: orderData.operator || '',
            helper: orderData.helper || '',
            status: orderData.status.toLowerCase(),
            notes: orderData.notes || '',
            weather: weatherData,
            createdAt: orderData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    },

    /**
     * Convert date format for quotation display
     * @param {string} dateStr - Date string (YYYY-MM-DD)
     * @returns {string} Formatted date for quotation
     */
    convertToQuotationDateFormat(dateStr) {
        if (!dateStr) return '';
        return Utils.formatDate(dateStr);
    },

    /**
     * Generate unique document ID for Firestore
     * Uses order ID if available, otherwise generates timestamp-based ID
     * @param {string} orderId - Order ID
     * @returns {string} Document ID
     */
    generateDocId(orderId) {
        if (orderId && orderId.trim()) {
            return orderId;
        }
        // Generate timestamp-based ID for orders without FP ID
        return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Check if two orders are the same (for duplicate detection)
     * @param {Object} order1 - First order
     * @param {Object} order2 - Second order
     * @returns {boolean} True if orders match
     */
    isSameOrder(order1, order2) {
        if (!order1 || !order2) return false;

        // Compare by docId first
        if (order1.docId && order2.docId && order1.docId === order2.docId) {
            return true;
        }

        // Compare by orderId if both have one
        if (order1.orderId && order2.orderId && order1.orderId === order2.orderId) {
            return true;
        }

        return false;
    },

    /**
     * Get display name for order (order ID or fallback text)
     * @param {Object} order - Order object
     * @returns {string} Display name
     */
    getOrderDisplayName(order) {
        if (order.orderId && order.orderId.trim()) {
            return order.orderId;
        }
        if (order.docId) {
            return `Order ${order.docId.substring(0, 8)}...`;
        }
        return '[No ID]';
    }
};

// Make globally available for backward compatibility
if (typeof window !== 'undefined') {
    window.OrderUtils = OrderUtils;
}

/* ============================================
   ORDERS - Complete Order Management System
   ============================================ */

/**
 * Orders Feature Module
 *
 * Provides comprehensive order management:
 * - Order form rendering and data collection
 * - CRUD operations (Create, Read, Update, Delete)
 * - Multi-day order support with day-wise functions
 * - PDF generation (single & multi-order)
 * - WhatsApp message generation
 * - Item search and management
 * - Inventory deduction
 * - Order status tracking (Pending → Confirmed → Completed)
 * - Draft auto-save integration
 * - Location extraction from Google Maps links
 * - Weather integration
 *
 * @exports Orders
 */

import { Utils } from '../utils/helpers.js';

export const Orders = {
    /**
     * Render Orders tab
     * This is the main entry point called by lazy loader
     * @param {Object} oms - Reference to OMS
     */
    renderOrders(oms) {
        console.log('📦 Orders module loaded and rendering');

        // The orders tab rendering is handled by existing code in index.html
        // for now. This module provides extracted helper functions.

        // Initialize item search when tab opens
        if (typeof oms.initItemSearch === 'function') {
            oms.initItemSearch();
        }

        // Populate events dropdown
        if (typeof oms.populateEventsDatalist === 'function') {
            oms.populateEventsDatalist();
        }
    }
};

// Make globally available for backward compatibility
if (typeof window !== 'undefined') {
    window.Orders = Orders;
}

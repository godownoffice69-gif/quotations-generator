/* ============================================
   ORDER FORM SERVICE - Form data collection, validation, location extraction
   ============================================ */

/**
 * Order Form Service Module
 *
 * Handles:
 * - Form data collection (single-day and multi-day orders)
 * - Venue location extraction from Google Maps links
 * - Form validation
 * - Helper data processing
 *
 * @exports OrderForm
 */

import { Utils } from '../utils/helpers.js';

export const OrderForm = {
    /**
     * Collect all form data for order creation/update
     * @param {Object} oms - Reference to OMS for accessing currentOrderItems
     * @returns {Object} Complete order data object
     */
    collectFormData(oms) {
        const transport = Utils.get('transport');
        const eventType = Utils.get('eventTypeSelect');
        const isMultiDay = eventType === 'multi';

        // Get helper names from text input
        const helperInput = document.getElementById('helper');
        const selectedHelpers = helperInput ? helperInput.value.trim() : '';

        // Collect day-wise data for multi-day events
        let dayWiseData = [];
        if (isMultiDay) {
            const startDate = Utils.get('startDate');
            const endDate = Utils.get('endDate');
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;

            for (let i = 0; i < diffDays; i++) {
                const currentDate = new Date(start);
                currentDate.setDate(start.getDate() + i);

                // Get functions for this day
                const dayFunctions = window.dayFunctionsData?.[i] || [];

                dayWiseData.push({
                    dayNumber: i + 1,
                    date: Utils.toDateString(currentDate),
                    functions: dayFunctions.map(func => ({
                        functionType: func.functionType || '',
                        timeSlot: func.timeSlot || '',
                        driver: func.driver || '',
                        operator: func.operator || '',
                        helper: func.helper || '',
                        notes: func.notes || '',
                        items: func.items || []
                    }))
                });
            }
        }

        const transport2 = Utils.get('transport2');

        // Get location data - prioritize autocomplete selection, then fall back to manual Maps link
        let venueLocation = null;
        const mapLink = Utils.get('venueMapLink');

        // Check if user selected place from autocomplete
        if (window.selectedPlaceData) {
            venueLocation = {
                lat: window.selectedPlaceData.lat,
                lng: window.selectedPlaceData.lng,
                source: 'google_autocomplete',
                place_id: window.selectedPlaceData.place_id,
                formatted_address: window.selectedPlaceData.formatted_address
            };
            console.log('✅ Using location from autocomplete:', venueLocation);
            console.log('📍 Will save to Firestore:', {
                venue: Utils.get('venue'),
                venueLocation: venueLocation,
                venueMapLink: mapLink
            });
        }
        // Otherwise, try to extract from manually pasted Maps link
        else if (mapLink && mapLink.trim()) {
            venueLocation = this.extractLocationFromMapsLink(mapLink);
            console.log('✅ Using location extracted from Maps link:', venueLocation);
        } else {
            // Only log once to avoid console spam
            if (!window._venueLocationWarned) {
                console.warn('⚠️ No venue location data available');
                window._venueLocationWarned = true;
            }
        }

        return {
            orderId: Utils.get('orderId'),
            isMultiDay: isMultiDay,
            date: isMultiDay ? null : Utils.get('orderDate'),
            startDate: isMultiDay ? Utils.get('startDate') : null,
            endDate: isMultiDay ? Utils.get('endDate') : null,
            dayWiseData: dayWiseData,
            lastEventDate: isMultiDay ? Utils.get('endDate') : Utils.get('orderDate'),
            readyTime: Utils.get('readyTime'),
            clientName: Utils.get('clientName'),
            contact: Utils.get('contact'),
            venue: Utils.get('venue'),
            venueMapLink: mapLink || null, // Store the Google Maps link
            venueLocation: venueLocation, // Extracted coordinates from Maps link
            eventType: Utils.get('eventType'),
            transport: transport === 'Other' ? Utils.get('customTransport') : transport,
            driverName: Utils.get('driverName'),
            transport2: transport2 === 'Other' ? Utils.get('customTransport2') : transport2,
            driverName2: Utils.get('driverName2'),
            operator: Utils.get('operator'),
            helper: selectedHelpers,
            status: Utils.get('orderStatus'),
            notes: Utils.get('orderNotes'),
            items: isMultiDay ? [] : [...(oms.currentOrderItems || [])],
            createdAt: new Date().toISOString()
        };
    },

    /**
     * Extract latitude and longitude from Google Maps link
     * Supports multiple Google Maps URL formats
     * @param {string} link - Google Maps URL
     * @returns {Object|null} Location object with lat/lng or null if extraction fails
     */
    extractLocationFromMapsLink(link) {
        if (!link) return null;

        try {
            // Google Maps link formats:
            // https://maps.app.goo.gl/... (short link - can't extract directly)
            // https://www.google.com/maps/place/.../@LAT,LNG,ZOOMz/...
            // https://www.google.com/maps/@LAT,LNG,ZOOMz
            // https://maps.google.com/?q=LAT,LNG
            // https://www.google.com/maps/search/?api=1&query=LAT,LNG
            // https://goo.gl/maps/... (short link)

            // Try to find coordinates in various formats
            let lat = null, lng = null;

            // Format 1: query=LAT,LNG (from API links)
            const queryMatch = link.match(/[?&]query=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
            if (queryMatch) {
                lat = parseFloat(queryMatch[1]);
                lng = parseFloat(queryMatch[2]);
            }

            // Format 2: @LAT,LNG or ?q=LAT,LNG
            if (!lat) {
                const coordMatch = link.match(/[@?]q?=?(-?\d+\.?\d*),(-?\d+\.?\d*)/);
                if (coordMatch) {
                    lat = parseFloat(coordMatch[1]);
                    lng = parseFloat(coordMatch[2]);
                }
            }

            // Format 3: /maps/place/NAME/@LAT,LNG
            if (!lat) {
                const placeMatch = link.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
                if (placeMatch) {
                    lat = parseFloat(placeMatch[1]);
                    lng = parseFloat(placeMatch[2]);
                }
            }

            if (lat && lng) {
                return {
                    lat: lat,
                    lng: lng,
                    source: 'google_maps_link'
                };
            }

            // Only warn once per unique link to avoid console spam
            if (!this._warnedLinks) this._warnedLinks = new Set();
            if (!this._warnedLinks.has(link)) {
                console.warn('Could not extract coordinates from Maps link:', link);
                this._warnedLinks.add(link);
            }
            return null;
        } catch (error) {
            console.error('Error extracting location from Maps link:', error);
            return null;
        }
    },

    /**
     * Validate order form data based on event type
     * @param {string} eventType - 'multi' for multi-day, other for single-day
     * @returns {Array} Array of error messages (empty if valid)
     */
    validateOrderForm(eventType) {
        const isMultiDay = eventType === 'multi';

        let requiredFields = ['clientName', 'orderStatus'];

        if (isMultiDay) {
            requiredFields.push('startDate', 'endDate');
        } else {
            requiredFields.push('orderDate');
        }

        return Utils.validateRequired(requiredFields);
    },

    /**
     * Check if order form has unsaved changes
     * @param {Object} currentData - Current form data
     * @param {Object} savedData - Previously saved data
     * @returns {boolean} True if there are unsaved changes
     */
    hasUnsavedChanges(currentData, savedData) {
        if (!savedData) return false;

        // Compare key fields
        const fieldsToCompare = ['clientName', 'contact', 'venue', 'date', 'status', 'notes'];

        for (const field of fieldsToCompare) {
            if (currentData[field] !== savedData[field]) {
                return true;
            }
        }

        return false;
    }
};

// Make globally available for backward compatibility
if (typeof window !== 'undefined') {
    window.OrderForm = OrderForm;
}

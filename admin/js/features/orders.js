/* ============================================
   ORDERS - Complete Order Management System
   ============================================

   PHASE 2 MODERNIZATION - Core Order Functions

   This module contains the extracted order management functions.
   Due to the massive size (~5000 lines), we're extracting incrementally:

   PHASE 2A (THIS FILE): Core functions
   - Form utilities
   - Data collection
   - Events management
   - PDF calculation helpers
   - WhatsApp helpers

   PHASE 2B (FUTURE): Advanced functions
   - Full CRUD operations
   - PDF generation
   - History & merge functions
   - Calendar integration

   ============================================ */

import { Utils } from '../utils/helpers.js';

export const Orders = {
    /**
     * Render Orders tab - Entry point called by lazy loader
     */
    renderOrders(oms) {
        console.log('📦 Orders module loaded and rendering');

        // Initialize item search when tab opens
        if (typeof oms.initItemSearch === 'function') {
            oms.initItemSearch();
        }

        // Populate events dropdown
        this.populateEventsDatalist(oms);

        // Populate time dropdown
        this.populateTimeDropdown(oms);

        // Update weather mini dashboard
        this.updateWeatherMiniDashboard(oms);
    },

    // ============ FORM UTILITIES ============

    populateTimeDropdown(oms) {
        const select = document.getElementById('readyTime');
        if (!select) return;

        select.innerHTML = '<option value="">Select Time</option>';

        for (let h = 1; h <= 12; h++) {
            for (let m = 0; m < 60; m += 30) {
                ['AM', 'PM'].forEach(period => {
                    const time = `${h}:${m.toString().padStart(2, '0')} ${period}`;
                    select.add(new Option(time, time));
                });
            }
        }
    },

    async refreshOrderId(oms) {
        const nextId = await this.previewNextOrderId(oms);
        Utils.set('orderId', nextId);
    },

    async previewNextOrderId(oms) {
        const prefix = oms.data.settings.invoicePrefix || 'FP';
        const counter = oms.data.settings.orderIdCounter || 1;
        return `${prefix}${String(counter).padStart(3, '0')}`;
    },

    async updateWeatherMiniDashboard(oms) {
        try {
            const city = oms.data.settings?.defaultCity || 'Delhi';
            const apiKey = oms.data.settings?.weatherApiKey || '';

            console.log('🌤️ Fetching weather for:', city);
            const weather = await Utils.getWeather(city, apiKey);

            const iconElement = document.querySelector('.weather-mini-icon');
            const tempElement = document.querySelector('.weather-mini-temp');
            const conditionElement = document.querySelector('.weather-mini-condition');

            if (iconElement && tempElement && conditionElement) {
                iconElement.textContent = Utils.getWeatherEmoji(weather.condition);
                tempElement.textContent = weather.temp !== 'N/A' ? `${weather.temp}°C` : '--°C';
                conditionElement.textContent = weather.condition !== 'N/A' ? weather.condition : 'Loading...';
            }
        } catch (error) {
            console.error('❌ Error updating weather:', error);

            const iconElement = document.querySelector('.weather-mini-icon');
            const tempElement = document.querySelector('.weather-mini-temp');
            const conditionElement = document.querySelector('.weather-mini-condition');

            if (iconElement && tempElement && conditionElement) {
                iconElement.textContent = '⚠️';
                tempElement.textContent = '--°C';
                conditionElement.textContent = 'Error';
            }
        }
    },

    getNextOrderId(oms) {
        const prefix = oms.data.settings.invoicePrefix || 'FP';
        const counter = oms.data.settings.orderIdCounter || 1;
        return `${prefix}${String(counter).padStart(3, '0')}`;
    },

    incrementOrderCounter(oms) {
        oms.data.settings.orderIdCounter = (oms.data.settings.orderIdCounter || 1) + 1;
        this.refreshOrderId(oms);
    },

    // ============ DATA COLLECTION ============

    collectFormData(oms) {
        const transport = Utils.get('transport');
        const eventType = Utils.get('eventTypeSelect');
        const isMultiDay = eventType === 'multi';

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
        let venueLocation = null;
        const mapLink = Utils.get('venueMapLink');

        if (window.selectedPlaceData) {
            venueLocation = {
                lat: window.selectedPlaceData.lat,
                lng: window.selectedPlaceData.lng,
                source: 'google_autocomplete',
                place_id: window.selectedPlaceData.place_id,
                formatted_address: window.selectedPlaceData.formatted_address
            };
        } else if (mapLink && mapLink.trim()) {
            venueLocation = this.extractLocationFromMapsLink(mapLink);
        }

        return {
            workType: 'order',
            editMode: oms.editingOrderId ? true : false,
            editingOrderId: oms.editingOrderId || null,
            editingDocId: oms.editingDocId || null,
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
            venueMapLink: mapLink || null,
            venueLocation: venueLocation,
            eventType: Utils.get('eventType'),
            transport: transport === 'Other' ? Utils.get('customTransport') : transport,
            driverName: Utils.get('driverName'),
            transport2: transport2 === 'Other' ? Utils.get('customTransport2') : transport2,
            driverName2: Utils.get('driverName2'),
            operator: Utils.get('operator'),
            helper: selectedHelpers,
            status: Utils.get('orderStatus'),
            notes: Utils.get('orderNotes'),
            items: isMultiDay ? [] : [...oms.currentOrderItems],
            createdAt: new Date().toISOString()
        };
    },

    extractLocationFromMapsLink(link) {
        if (!link) return null;

        try {
            let lat = null, lng = null;

            const queryMatch = link.match(/[?&]query=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
            if (queryMatch) {
                lat = parseFloat(queryMatch[1]);
                lng = parseFloat(queryMatch[2]);
            }

            if (!lat) {
                const coordMatch = link.match(/[@?]q?=?(-?\d+\.?\d*),(-?\d+\.?\d*)/);
                if (coordMatch) {
                    lat = parseFloat(coordMatch[1]);
                    lng = parseFloat(coordMatch[2]);
                }
            }

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

            return null;
        } catch (error) {
            console.error('Error extracting location from Maps link:', error);
            return null;
        }
    },

    // ============ EVENTS MANAGEMENT ============

    async addCustomEventsToList(oms, orderData) {
        try {
            const newEvents = new Set();

            if (!orderData.isMultiDay && orderData.eventType && orderData.eventType.trim()) {
                const event = orderData.eventType.trim();
                if (!oms.data.eventsList.includes(event)) {
                    newEvents.add(event);
                }
            }

            if (orderData.isMultiDay && orderData.dayWiseData) {
                orderData.dayWiseData.forEach(day => {
                    if (day.functions) {
                        day.functions.forEach(func => {
                            if (func.functionType && func.functionType.trim()) {
                                const event = func.functionType.trim();
                                if (!oms.data.eventsList.includes(event)) {
                                    newEvents.add(event);
                                }
                            }
                        });
                    }
                });
            }

            if (newEvents.size > 0) {
                newEvents.forEach(event => {
                    oms.data.eventsList.push(event);
                });

                oms.data.eventsList.sort();

                await db.collection('settings').doc('eventsList').set({
                    events: oms.data.eventsList,
                    updatedAt: new Date().toISOString()
                });

                this.populateEventsDatalist(oms);

                console.log('✅ Added new custom events:', Array.from(newEvents));
            }
        } catch (error) {
            console.error('Error saving custom events:', error);
        }
    },

    populateEventsDatalist(oms) {
        const eventTypeSelect = document.getElementById('eventType');
        if (!eventTypeSelect) {
            return;
        }

        if (!oms.data.eventsList || !Array.isArray(oms.data.eventsList)) {
            oms.data.eventsList = [
                'Haldi', 'Mehendi', 'Barat', 'Carnival', 'Varmala', 'Sangeet',
                'Entry of groom', 'Entry of Bride', 'Entry of Couple', 'Bride Welcome',
                'Surprise Barat', 'Reception', 'Wedding', 'Mameru', 'Gotreju', 'Sufi Night',
                'Birthday', 'Party', 'New Year Party', 'Anniversary', 'Shobha yatra',
                'Ganesh Agman', 'Ganesh Visarjan'
            ];
        }

        const currentValue = eventTypeSelect.value;
        eventTypeSelect.innerHTML = '<option value="">Select Event Type</option>';

        oms.data.eventsList.forEach(event => {
            const option = document.createElement('option');
            option.value = event;
            option.textContent = event;
            eventTypeSelect.appendChild(option);
        });

        if (currentValue && oms.data.eventsList.includes(currentValue)) {
            eventTypeSelect.value = currentValue;
        }
    },

    // ============ PDF CALCULATION HELPERS ============

    calculateOrderRequirements(order) {
        const items = [];

        if (order.dayWiseData && Array.isArray(order.dayWiseData) && order.dayWiseData.length > 0) {
            order.dayWiseData.forEach(day => {
                if (day.functions && Array.isArray(day.functions)) {
                    day.functions.forEach(func => {
                        if (func.items && Array.isArray(func.items)) {
                            items.push(...func.items);
                        }
                    });
                }
            });
        } else if (order.items && Array.isArray(order.items)) {
            items.push(...order.items);
        }

        const dryMachines = items.filter(item => {
            const name = item.name?.toLowerCase() || '';
            return name.includes('dry ice');
        }).reduce((sum, item) => sum + (item.quantity || 0), 0);
        const dryIceNeeded = dryMachines * 20;

        const flowerShowerKeywords = ['flower shower', 'flower shower machine'];
        const flowerShowerMachines = items.filter(item => {
            const name = item.name?.toLowerCase() || '';
            return flowerShowerKeywords.some(keyword => name.includes(keyword)) ||
                   (name.includes('flower') && name.includes('shower'));
        }).reduce((sum, item) => sum + (item.quantity || 0), 0);
        const flowersNeeded = flowerShowerMachines * 20;

        const electricity3KV = ['showven sonic boom (co2 jet)', 'dry ice machine', '5 head flame'];
        const electricity1KV = ['sparkular machine', 'spinner machine', 'cyclone', 'waver', 'circle flame', 'snow machine', 'fan wheel'];

        let totalElectricityKV = 0;
        items.forEach(item => {
            const itemNameLower = item.name?.toLowerCase() || '';
            const qty = item.quantity || 0;

            if (electricity3KV.some(name => itemNameLower.includes(name))) {
                totalElectricityKV += qty * 3;
            } else if (electricity1KV.some(name => itemNameLower.includes(name))) {
                totalElectricityKV += qty * 1;
            }
        });

        return {
            dryIceNeeded,
            dryMachines,
            flowersNeeded,
            flowerShowerMachines,
            totalElectricityKV,
            items
        };
    },

    getPaperDimensions(oms) {
        const format = oms.data.settings.paperFormat || 'A4';
        const orientation = oms.data.settings.paperOrientation || 'portrait';

        const formats = {
            'A4': { width: 2480, height: 3508 },
            'Legal': { width: 2550, height: 4200 },
            'Letter': { width: 2550, height: 3300 },
            'A3': { width: 3508, height: 4960 },
            'A5': { width: 1748, height: 2480 },
            'Tabloid': { width: 3300, height: 5100 }
        };

        let dimensions = formats[format] || formats['A4'];

        if (orientation === 'landscape') {
            return {
                width: dimensions.height,
                height: dimensions.width
            };
        }

        return dimensions;
    },

    updateLoadingMessage(loadingElement, message) {
        if (loadingElement && loadingElement.querySelector('.loading-text')) {
            loadingElement.querySelector('.loading-text').textContent = message;
        }
    },

    // ============ WHATSAPP HELPERS ============

    filterOrdersByDate(oms, date) {
        return oms.data.orders.filter(o => {
            if (!o.isMultiDay && o.date) {
                const orderDate = new Date(o.date).toISOString().split('T')[0];
                const targetDate = new Date(date).toISOString().split('T')[0];
                if (orderDate === targetDate) {
                    return true;
                }
            }

            if (o.isMultiDay && o.dayWiseData && Array.isArray(o.dayWiseData) && o.dayWiseData.length > 0) {
                const hasMatch = o.dayWiseData.some(day => {
                    const dayDate = new Date(day.date).toISOString().split('T')[0];
                    const targetDate = new Date(date).toISOString().split('T')[0];
                    return dayDate === targetDate;
                });
                if (hasMatch) {
                    return true;
                }
                return false;
            }

            if (o.isMultiDay && o.startDate && o.endDate) {
                const targetDate = new Date(date);
                const start = new Date(o.startDate);
                const end = new Date(o.endDate);
                if (targetDate >= start && targetDate <= end) {
                    return true;
                }
            }
            return false;
        });
    }
};

// Make globally available for backward compatibility
if (typeof window !== 'undefined') {
    window.Orders = Orders;
}

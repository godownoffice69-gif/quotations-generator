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
    },

    // ============ CRUD OPERATIONS ============

    async saveOrder(oms) {
        const eventType = Utils.get('eventTypeSelect');
        const isMultiDay = eventType === 'multi';

        let requiredFields = ['clientName', 'orderStatus'];

        if (isMultiDay) {
            requiredFields.push('startDate', 'endDate');
        } else {
            requiredFields.push('orderDate');
        }

        const errors = Utils.validateRequired(requiredFields);
        if (errors.length > 0) {
            oms.showToast('Please fill all required fields', 'error');
            return;
        }

        const orderData = this.collectFormData(oms);
        const status = orderData.status.toLowerCase();
        const manualOrderId = Utils.get('orderId').trim();

        let finalOrderId;

        if (status === 'completed') {
            if (manualOrderId && manualOrderId.startsWith('FP')) {
                finalOrderId = manualOrderId;
                console.log('✅ Using manual FP ID:', finalOrderId);
            } else {
                oms.showToast('⚠️ Completed orders require a manual FP ID (e.g., FP001)', 'error');
                return;
            }
        } else {
            finalOrderId = '';
            console.log('⏳ Order saved without ID (status: ' + status + ')');
        }

        orderData.orderId = finalOrderId;

        try {
            console.log('💾 Saving order:', orderData.orderId);

            let existingSnapshot;

            if (oms.editingOrderId || oms.editingDocId) {
                if (oms.editingDocId) {
                    const doc = await db.collection('orders').doc(oms.editingDocId).get();
                    existingSnapshot = doc.exists ? { empty: false, docs: [doc] } : { empty: true };
                    console.log('✏️ Editing existing order by docId:', oms.editingDocId);
                } else {
                    existingSnapshot = await db.collection('orders')
                        .where('orderId', '==', oms.editingOrderId)
                        .get();
                    console.log('✏️ Editing existing order:', oms.editingOrderId);
                }
            } else if (finalOrderId) {
                existingSnapshot = await db.collection('orders')
                    .where('orderId', '==', finalOrderId)
                    .get();
            } else {
                existingSnapshot = { empty: true };
            }

            const totalAmount = orderData.isMultiDay
                ? (orderData.dayWiseData || []).reduce((sum, day) => {
                    const dayTotal = (day.functions || []).reduce((daySum, func) => {
                        const funcTotal = (func.items || []).reduce((itemSum, item) => {
                            return itemSum + ((item.price || 0) * (item.quantity || 0));
                        }, 0);
                        return daySum + funcTotal;
                    }, 0);
                    return sum + dayTotal;
                }, 0)
                : (orderData.items || []).reduce((sum, item) => {
                    return sum + ((item.price || 0) * (item.quantity || 0));
                }, 0);

            console.log('💰 Calculated total amount:', totalAmount);

            let weatherData = null;
            try {
                const weatherApiKey = oms.data.settings?.weatherApiKey || '';
                const defaultCity = oms.data.settings?.defaultCity || 'Delhi';
                weatherData = await Utils.getWeather(defaultCity, weatherApiKey);
                console.log('🌤️ Weather data fetched:', weatherData);
            } catch (error) {
                console.warn('⚠️ Could not fetch weather data:', error);
            }

            orderData.weather = weatherData;

            const firestoreData = {
                orderId: finalOrderId,
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

            if (!existingSnapshot.empty) {
                const docId = existingSnapshot.docs[0].id;
                const oldData = existingSnapshot.docs[0].data();
                const oldOrderId = oldData.orderId || '';

                console.log('✏️ Updating order, old ID:', oldOrderId || '[blank]', 'new ID:', finalOrderId || '[blank]');

                if (oldOrderId !== finalOrderId && finalOrderId) {
                    console.log('🔄 Status upgraded - assigning FP ID to order');

                    await db.collection('orders').doc(docId).delete();
                    console.log('🗑️ Deleted old doc (ID: ' + (oldOrderId || docId) + ')');

                    await db.collection('orders').doc(finalOrderId).set(firestoreData);
                    console.log('✅ Created new doc with FP ID:', finalOrderId);
                    orderData.docId = finalOrderId;

                    const completeOrderData = {
                        ...orderData,
                        isMultiDay: orderData.isMultiDay || false,
                        startDate: orderData.startDate || null,
                        endDate: orderData.endDate || null,
                        dayWiseData: orderData.dayWiseData || [],
                        totalAmount: totalAmount
                    };

                    const localIndex = oms.data.orders.findIndex(o =>
                        (o.orderId && o.orderId === oldOrderId) ||
                        (o.docId && o.docId === docId)
                    );
                    if (localIndex !== -1) {
                        oms.data.orders[localIndex] = completeOrderData;
                    }

                    oms.showToast(`Order upgraded: ${oldOrderId || '[No ID]'} → ${finalOrderId} ✅`);
                    this.clearForm(oms, true);
                } else {
                    await db.collection('orders').doc(docId).update(firestoreData);
                    console.log('✅ Updated order:', finalOrderId || docId);
                    orderData.docId = docId;

                    const completeOrderData = {
                        ...orderData,
                        isMultiDay: orderData.isMultiDay || false,
                        startDate: orderData.startDate || null,
                        endDate: orderData.endDate || null,
                        dayWiseData: orderData.dayWiseData || [],
                        totalAmount: totalAmount
                    };

                    const localIndex = oms.data.orders.findIndex(o =>
                        (o.orderId && o.orderId === finalOrderId) ||
                        (o.docId && o.docId === docId)
                    );
                    if (localIndex !== -1) {
                        oms.data.orders[localIndex] = completeOrderData;
                    }

                    if (status === 'completed') {
                        if (orderData.items && orderData.items.length > 0) {
                            this.recordItemHistory(oms, orderData.items, orderData);
                        }

                        if (orderData.isMultiDay && orderData.dayWiseData) {
                            orderData.dayWiseData.forEach(day => {
                                day.functions.forEach(func => {
                                    if (func.items && func.items.length > 0) {
                                        this.recordItemHistory(oms, func.items, orderData, day.date, func.functionType);
                                    }
                                });
                            });
                        }
                    }

                    oms.showToast('Order updated! ✏️');
                    this.clearForm(oms, true);
                }

                await this.addCustomEventsToList(oms, orderData);

                oms.editingOrderId = null;
                oms.editingDocId = null;

            } else {
                console.log('🆕 Creating new order');

                console.log('💾 Saving to Firestore - venue data:', {
                    venue: firestoreData.venue,
                    venueLocation: firestoreData.venueLocation,
                    venueMapLink: firestoreData.venueMapLink
                });

                let docRef;
                if (finalOrderId) {
                    docRef = await db.collection('orders').doc(finalOrderId).set(firestoreData);
                    orderData.docId = finalOrderId;
                    console.log('✅ Saved with FP ID:', finalOrderId);
                } else {
                    docRef = await db.collection('orders').add(firestoreData);
                    orderData.docId = docRef.id;
                    console.log('✅ Saved with auto ID:', docRef.id);
                }

                console.log('✅ venueLocation saved:', !!firestoreData.venueLocation, firestoreData.venueLocation);
                console.log('✅ venueMapLink saved:', !!firestoreData.venueMapLink, firestoreData.venueMapLink);

                const completeOrderData = {
                    ...orderData,
                    isMultiDay: orderData.isMultiDay || false,
                    startDate: orderData.startDate || null,
                    endDate: orderData.endDate || null,
                    dayWiseData: orderData.dayWiseData || [],
                    totalAmount: totalAmount
                };

                const localExists = oms.data.orders.some(o =>
                    (o.orderId && o.orderId === finalOrderId) ||
                    (o.docId && o.docId === orderData.docId)
                );
                if (!localExists) {
                    oms.data.orders.push(completeOrderData);
                    console.log('✅ Order added to local array with totalAmount:', totalAmount);
                }

                const displayId = finalOrderId || `[${status.toUpperCase()}]`;

                if (status === 'completed') {
                    if (orderData.items && orderData.items.length > 0) {
                        this.deductInventory(oms, orderData.items, orderData.orderId);
                        this.recordItemHistory(oms, orderData.items, orderData);
                    }

                    if (orderData.isMultiDay && orderData.dayWiseData) {
                        orderData.dayWiseData.forEach(day => {
                            day.functions.forEach(func => {
                                if (func.items && func.items.length > 0) {
                                    this.recordItemHistory(oms, func.items, orderData, day.date, func.functionType);
                                }
                            });
                        });
                    }
                }

                if (typeof oms.addAuditEntry === 'function') {
                    oms.addAuditEntry(orderData.orderId || orderData.docId, {
                        action: 'created',
                        user: (await oms.getCurrentUser())?.name || 'Admin',
                        timestamp: new Date().toISOString(),
                        details: `Order created with status: ${status}`
                    });
                }

                oms.showToast(`Order ${displayId} saved to Firestore! 🆕`);

                this.clearForm(oms, true);
                this.refreshOrderId(oms);

                await this.addCustomEventsToList(oms, orderData);

                if (typeof oms.saveToStorage === 'function') {
                    oms.saveToStorage();
                }
                if (typeof oms.updateAllDisplays === 'function') {
                    oms.updateAllDisplays();
                }
                localStorage.removeItem('oms_draft');
            }

        } catch (error) {
            console.error('❌ Error saving to Firestore:', error);
            oms.showToast('Error saving order: ' + error.message, 'error');
        }
    },

    // ============ FORM MANAGEMENT ============

    clearForm(oms, skipConfirmation = false) {
        oms.editingOrderId = null;
        oms.editingDocId = null;

        if (!skipConfirmation && oms.hasUnsavedChanges && oms.hasUnsavedChanges() && !confirm('Clear all data?')) {
            return;
        }

        const orderForm = document.getElementById('orderForm');
        if (orderForm) orderForm.reset();

        oms.currentOrderItems = [];
        if (typeof oms.updateOrderItemsTable === 'function') {
            oms.updateOrderItemsTable();
        }

        const originalOrdersContainer = document.getElementById('originalOrdersContainer');
        if (originalOrdersContainer) {
            originalOrdersContainer.innerHTML = '';
        }

        this.refreshOrderId(oms);
        Utils.set('orderDate', Utils.toDateString(new Date()));

        const customTransportGroup = document.getElementById('customTransportGroup');
        const customTransport2Group = document.getElementById('customTransport2Group');
        if (customTransportGroup) customTransportGroup.classList.add('hidden');
        if (customTransport2Group) customTransport2Group.classList.add('hidden');

        window.selectedPlaceData = null;

        if (window.dayFunctionsData) {
            window.dayFunctionsData = {};
        }

        Utils.set('eventTypeSelect', 'single');
        const singleDayFields = document.getElementById('singleDayFields');
        const multiDayFields = document.getElementById('multiDayFields');
        if (singleDayFields) singleDayFields.style.display = 'grid';
        if (multiDayFields) multiDayFields.style.display = 'none';

        const eventTypeSelect = document.getElementById('eventTypeSelect');
        if (eventTypeSelect) {
            const event = new Event('change');
            eventTypeSelect.dispatchEvent(event);
        }

        const multiDayContainer = document.getElementById('multiDayContainer');
        if (multiDayContainer) {
            multiDayContainer.innerHTML = '';
        }

        const functionsContainer = document.getElementById('functionsContainer');
        if (functionsContainer) {
            functionsContainer.innerHTML = '';
        }

        const dayWiseFunctions = document.getElementById('dayWiseFunctions');
        if (dayWiseFunctions) {
            dayWiseFunctions.style.display = 'none';
        }

        if (typeof oms.showToast === 'function') {
            oms.showToast('Form cleared');
        }
    },

    duplicateOrder(oms, identifier) {
        const order = oms.data.orders.find(o =>
            o.orderId === identifier || o.docId === identifier
        );

        if (!order) {
            oms.showToast('Order not found', 'error');
            return;
        }

        if (confirm(`Duplicate order for "${order.clientName}"?\n\nThis will create a new order with the same details.`)) {
            oms.editingOrderId = null;
            oms.editingDocId = null;

            Object.entries({
                orderId: '',
                clientName: order.clientName,
                contact: order.contact,
                venue: order.venue,
                orderDate: Utils.toDateString(new Date()),
                readyTime: order.readyTime,
                eventType: order.eventType,
                transport: ['Bolero', 'Isuzu', 'Porter'].includes(order.transport) ? order.transport : 'Other',
                customTransport: !['Bolero', 'Isuzu', 'Porter'].includes(order.transport) ? order.transport : '',
                driverName: order.driverName || '',
                operator: order.operator || '',
                helper: order.helper || '',
                orderStatus: 'Pending',
                orderNotes: order.notes ? `[DUPLICATED] ${order.notes}` : '[DUPLICATED ORDER]'
            }).forEach(([key, value]) => Utils.set(key, value));

            oms.currentOrderItems = order.items ? order.items.map(item => ({...item})) : [];
            if (typeof oms.updateOrderItemsTable === 'function') {
                oms.updateOrderItemsTable();
            }

            if (!['Bolero', 'Isuzu', 'Porter'].includes(order.transport)) {
                const customTransportGroup = document.getElementById('customTransportGroup');
                if (customTransportGroup) customTransportGroup.classList.remove('hidden');
            }

            if (typeof oms.switchTab === 'function') {
                oms.switchTab('orders');
            }
            oms.showToast(`✅ Order duplicated! Review and save.`, 'success');

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },

    // ============ INVENTORY INTEGRATION ============

    deductInventory(oms, items, orderId) {
        if (!items || items.length === 0) return;

        items.forEach(orderItem => {
            const inventoryItem = oms.data.inventory.items.find(i =>
                i.name.toLowerCase() === orderItem.name.toLowerCase()
            );

            if (inventoryItem) {
                const previousQty = inventoryItem.quantity;
                inventoryItem.quantity -= orderItem.quantity;

                console.log(`📦 Deducted ${orderItem.quantity} ${orderItem.name} from inventory (${previousQty} → ${inventoryItem.quantity})`);

                if (inventoryItem.quantity <= oms.data.settings.lowStockThreshold) {
                    oms.showToast(`⚠️ LOW STOCK: ${inventoryItem.name} (${inventoryItem.quantity} left)`, 'warning');
                }

                if (inventoryItem.quantity < 0) {
                    oms.showToast(`🚨 CRITICAL: ${inventoryItem.name} stock is NEGATIVE!`, 'error');
                }
            }
        });

        if (typeof oms.saveToStorage === 'function') {
            oms.saveToStorage();
        }
    },

    async recordItemHistory(oms, items, orderData, specificDate = null, functionType = null) {
        if (!items || items.length === 0) return;

        console.log(`📜 Recording item history for order ${orderData.orderId}`);

        const usedAt = new Date().toISOString();
        const eventDate = specificDate || orderData.date || orderData.startDate;

        for (const item of items) {
            const historyRecord = {
                itemName: item.name,
                quantity: item.quantity,
                orderId: orderData.orderId,
                clientName: orderData.clientName,
                venue: orderData.venue,
                eventDate: eventDate,
                functionType: functionType || orderData.eventType || '',
                usedAt: usedAt,
                remarks: item.remarks || ''
            };

            oms.data.itemHistory.push(historyRecord);

            try {
                await db.collection('itemHistory').add(historyRecord);
                console.log(`✅ Saved item history: ${item.name} x${item.quantity} for order ${orderData.orderId}`);
            } catch (error) {
                console.error('❌ Error saving item history to Firestore:', error);
            }
        }

        if (typeof oms.saveToStorage === 'function') {
            oms.saveToStorage();
        }
    },

    convertToQuotationDateFormat(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateStr;
    },

    // ============ FORM LOADING ============

    loadOrderToForm(oms, order) {
        // Clear the form first to prevent data mixing between orders
        const wasCleared = !oms.hasUnsavedChanges();
        if (!wasCleared) {
            // Clear without confirmation since we're loading a different order
            document.getElementById('orderForm').reset();
            oms.currentOrderItems = [];
            oms.updateOrderItemsTable();
            window.dayFunctionsData = {};

            // Clear multiday containers
            const multiDayContainer = document.getElementById('multiDayContainer');
            if (multiDayContainer) multiDayContainer.innerHTML = '';
            const functionsContainer = document.getElementById('functionsContainer');
            if (functionsContainer) functionsContainer.innerHTML = '';
        }

        // Store original order ID and docId for updates
        oms.editingOrderId = order.orderId;
        oms.editingDocId = order.docId;

        console.log('🔍 Loading order to form:', order);
        console.log('🔍 Order status:', order.status);
        console.log('🔍 Is Multi-Day:', order.isMultiDay);

        // Show merged order indicator if this is a merged order
        if (order.mergedFrom && order.mergedFrom.length > 0) {
            const mergedOrderIds = order.mergedFrom.map(m => m.orderId).join(', ');
            oms.showToast(`🔗 MERGED ORDER: This order was created by merging ${order.mergedFrom.length} orders (${mergedOrderIds})`, 'info', 8000);
            console.log('🔗 This is a MERGED order from:', order.mergedFrom);
        }

        // Check if this is a multi-day order
        if (order.isMultiDay) {
            // Load multi-day order
            console.log('📅 Loading multi-day order with dayWiseData:', order.dayWiseData);

            // Set event type to multi
            Utils.set('eventTypeSelect', 'multi');

            // Load basic fields
            Object.entries({
                orderId: order.orderId,
                clientName: order.clientName,
                contact: order.contact,
                venue: order.venue,
                venueMapLink: order.venueMapLink || '',
                startDate: order.startDate,
                endDate: order.endDate,
                transport: ['Bolero', 'Isuzu', 'Porter'].includes(order.transport) ? order.transport : 'Other',
                customTransport: !['Bolero', 'Isuzu', 'Porter'].includes(order.transport) ? order.transport : '',
                orderStatus: order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : '',
                orderNotes: order.notes
            }).forEach(([key, value]) => Utils.set(key, value));

            // Restore venue location data if available
            if (order.venueLocation) {
                window.selectedPlaceData = {
                    name: order.venue || '',
                    lat: order.venueLocation.lat,
                    lng: order.venueLocation.lng,
                    formatted_address: order.venueLocation.formatted_address || '',
                    place_id: order.venueLocation.place_id || '',
                    url: order.venueLocation.url || '',
                    source: order.venueLocation.source || 'restored'
                };
            }

            // Show/hide transport fields
            if (!['Bolero', 'Isuzu', 'Porter'].includes(order.transport)) {
                document.getElementById('customTransportGroup').classList.remove('hidden');
            }

            // Trigger event type change to show multi-day fields
            const eventTypeSelect = document.getElementById('eventTypeSelect');
            if (eventTypeSelect) {
                const event = new Event('change');
                eventTypeSelect.dispatchEvent(event);
            }

            // Wait for DOM to update, then regenerate day-wise functions
            setTimeout(() => {
                // Initialize dayFunctionsData
                window.dayFunctionsData = {};

                // Generate day-wise functions based on date range
                oms.generateDayWiseFunctions();

                // Wait a bit more for function cards to be created
                setTimeout(() => {
                    // Populate each day's functions from order.dayWiseData
                    if (order.dayWiseData && Array.isArray(order.dayWiseData)) {
                        order.dayWiseData.forEach((day, dayIndex) => {
                            if (day.functions && Array.isArray(day.functions)) {
                                // First, add additional function cards if needed (beyond the default first one)
                                const additionalFunctions = day.functions.length - 1;
                                for (let i = 0; i < additionalFunctions; i++) {
                                    oms.addFunctionToDay(dayIndex, false);
                                }

                                // Now populate all functions after a short delay
                                setTimeout(() => {
                                    // Store function data
                                    window.dayFunctionsData[dayIndex] = day.functions.map(f => ({...f}));

                                    day.functions.forEach((func, funcIndex) => {
                                        const functionId = `day${dayIndex}func${funcIndex}`;

                                        // Populate form fields
                                        const typeInput = document.getElementById(`${functionId}Type`);
                                        const timeInput = document.getElementById(`${functionId}Time`);
                                        const venueInput = document.getElementById(`${functionId}Venue`);
                                        const transportSelect = document.getElementById(`${functionId}Transport`);
                                        const driverSelect = document.getElementById(`${functionId}Driver`);
                                        const operatorSelect = document.getElementById(`${functionId}Operator`);
                                        const helperSelect = document.getElementById(`${functionId}Helper`);
                                        const notesTextarea = document.getElementById(`${functionId}Notes`);

                                        if (typeInput) typeInput.value = func.functionType || '';
                                        if (timeInput) timeInput.value = func.timeSlot || '';
                                        if (venueInput) venueInput.value = func.venue || '';

                                        // Handle multi-select fields (transport, driver, helper)
                                        if (transportSelect && func.transport) {
                                            const transports = func.transport.split(',').map(t => t.trim());
                                            Array.from(transportSelect.options).forEach(option => {
                                                option.selected = transports.includes(option.value);
                                            });
                                        }

                                        if (driverSelect && func.driver) {
                                            const drivers = func.driver.split(',').map(d => d.trim());
                                            Array.from(driverSelect.options).forEach(option => {
                                                option.selected = drivers.includes(option.value);
                                            });
                                        }

                                        if (operatorSelect) operatorSelect.value = func.operator || '';

                                        if (helperSelect && func.helper) {
                                            helperSelect.value = func.helper;
                                        }

                                        if (notesTextarea) notesTextarea.value = func.notes || '';

                                        // Update function data in memory
                                        oms.updateFunctionData(dayIndex, funcIndex, 'functionType', func.functionType || '');
                                        oms.updateFunctionData(dayIndex, funcIndex, 'timeSlot', func.timeSlot || '');
                                        oms.updateFunctionData(dayIndex, funcIndex, 'venue', func.venue || '');
                                        oms.updateFunctionData(dayIndex, funcIndex, 'transport', func.transport || '');
                                        oms.updateFunctionData(dayIndex, funcIndex, 'driver', func.driver || '');
                                        oms.updateFunctionData(dayIndex, funcIndex, 'operator', func.operator || '');
                                        oms.updateFunctionData(dayIndex, funcIndex, 'helper', func.helper || '');
                                        oms.updateFunctionData(dayIndex, funcIndex, 'notes', func.notes || '');

                                        // Set items for this function
                                        if (func.items && Array.isArray(func.items)) {
                                            // IMPORTANT: Normalize item fields for consistency
                                            window.dayFunctionsData[dayIndex][funcIndex].items = func.items.map(item => ({
                                                name: item.name || '',
                                                quantity: item.quantity || item.qty || 0,
                                                remarks: item.remarks || item.desc || '',
                                                price: item.price || 0
                                            }));
                                            oms.updateFunctionItemsList(dayIndex, funcIndex);
                                        }
                                    });
                                }, 100);
                            }
                        });
                    }

                    console.log('✅ Multi-day order loaded successfully');
                }, 300);
            }, 200);

        } else {
            // Load single-day order
            // IMPORTANT: Set event type to single day first to ensure proper form display
            Utils.set('eventTypeSelect', 'single');

            // Show single day fields, hide multiday fields
            const singleDayFields = document.getElementById('singleDayFields');
            const multiDayFields = document.getElementById('multiDayFields');
            if (singleDayFields) singleDayFields.style.display = 'grid';
            if (multiDayFields) multiDayFields.style.display = 'none';

            // Trigger event type change to update required fields
            const eventTypeSelect = document.getElementById('eventTypeSelect');
            if (eventTypeSelect) {
                const event = new Event('change');
                eventTypeSelect.dispatchEvent(event);
            }

            Object.entries({
                orderId: order.orderId,
                clientName: order.clientName,
                contact: order.contact,
                venue: order.venue,
                venueMapLink: order.venueMapLink || '',
                orderDate: order.date,
                readyTime: order.readyTime,
                eventType: order.eventType,
                transport: ['Bolero', 'Isuzu', 'Porter'].includes(order.transport) ? order.transport : 'Other',
                customTransport: !['Bolero', 'Isuzu', 'Porter'].includes(order.transport) ? order.transport : '',
                driverName: order.driverName,
                transport2: order.transport2 && ['Bolero', 'Isuzu', 'Porter'].includes(order.transport2) ? order.transport2 : (order.transport2 ? 'Other' : ''),
                customTransport2: order.transport2 && !['Bolero', 'Isuzu', 'Porter'].includes(order.transport2) ? order.transport2 : '',
                driverName2: order.driverName2 || '',
                operator: order.operator,
                orderStatus: order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : '',
                orderNotes: order.notes
            }).forEach(([key, value]) => Utils.set(key, value));

            // Restore venue location data if available
            if (order.venueLocation) {
                window.selectedPlaceData = {
                    name: order.venue || '',
                    lat: order.venueLocation.lat,
                    lng: order.venueLocation.lng,
                    formatted_address: order.venueLocation.formatted_address || '',
                    place_id: order.venueLocation.place_id || '',
                    url: order.venueLocation.url || '',
                    source: order.venueLocation.source || 'restored'
                };
            }

            // Load helper names to text input
            if (order.helper) {
                const helperInput = document.getElementById('helper');
                if (helperInput) {
                    helperInput.value = order.helper;
                }
            }

            if (!['Bolero', 'Isuzu', 'Porter'].includes(order.transport)) {
                document.getElementById('customTransportGroup').classList.remove('hidden');
            }

            if (order.transport2 && !['Bolero', 'Isuzu', 'Porter'].includes(order.transport2)) {
                document.getElementById('customTransport2Group').classList.remove('hidden');
            }

            // IMPORTANT: Normalize item fields to ensure consistency
            // Items from Firestore might use 'qty' but UI expects 'quantity'
            oms.currentOrderItems = order.items ? order.items.map(item => ({
                name: item.name || '',
                quantity: item.quantity || item.qty || 0, // Support both field names
                remarks: item.remarks || item.desc || '', // Support both field names
                price: item.price || 0
            })) : [];

            console.log(`📋 Loaded ${oms.currentOrderItems.length} items for order`, {
                orderId: order.orderId,
                sampleItem: oms.currentOrderItems[0],
                isMerged: !!order.mergedFrom
            });

            oms.updateOrderItemsTable();

            // Show original orders cards if this is a merged order
            this.renderOriginalOrdersCards(oms, order);
        }

        // Trigger status change to show/hide order ID field
        setTimeout(() => {
            const statusSelect = document.getElementById('orderStatus');
            if (statusSelect) {
                const event = new Event('change');
                statusSelect.dispatchEvent(event);
            }
        }, 100);
    },

    // Render editable cards for original orders in a merged order
    renderOriginalOrdersCards(oms, order) {
        const container = document.getElementById('originalOrdersContainer');

        // If container doesn't exist yet, create it
        if (!container) {
            const orderForm = document.getElementById('orderForm');
            if (orderForm) {
                const newContainer = document.createElement('div');
                newContainer.id = 'originalOrdersContainer';
                newContainer.style.marginTop = '2rem';
                orderForm.parentNode.insertBefore(newContainer, orderForm.nextSibling);
            }
        }

        const originalOrdersContainer = document.getElementById('originalOrdersContainer');
        if (!originalOrdersContainer) return;

        // Check if this is a merged order
        if (!order.mergedFrom || order.mergedFrom.length === 0) {
            originalOrdersContainer.innerHTML = '';
            return;
        }

        console.log('🔗 Rendering original orders cards for merged order:', order.orderId);

        // Generate HTML for original orders cards
        const cardsHTML = `
            <div class="card" style="margin-top: 2rem; background: #f9f9f9; border: 2px solid #667eea;">
                <div class="card-header" style="background: #667eea; color: white; padding: 1rem;">
                    <h3 style="margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                        🔗 ORIGINAL ORDERS (${order.mergedFrom.length})
                    </h3>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; opacity: 0.9;">
                        You can edit each original order's details below and save changes individually
                    </p>
                </div>
                <div style="padding: 1.5rem;">
                    ${order.mergedFrom.map((originalOrder, index) => this.renderOriginalOrderCard(oms, originalOrder, index)).join('')}
                </div>
            </div>
        `;

        originalOrdersContainer.innerHTML = cardsHTML;
    },

    renderOriginalOrderCard(oms, originalOrderData, index) {
        const order = originalOrderData.orderData;
        const cardId = `originalOrder_${index}`;

        // Get items list
        const itemsList = order.items && order.items.length > 0
            ? order.items.map(item => `${item.name} x${item.quantity || item.qty || 0}`).join(', ')
            : 'No items';

        return `
            <div class="card" style="margin-bottom: 1.5rem; background: white; border: 1px solid #ddd;" id="${cardId}">
                <div style="background: #f5f5f5; padding: 1rem; border-bottom: 2px solid #ddd;">
                    <h4 style="margin: 0; color: #667eea; display: flex; justify-content: space-between; align-items: center;">
                        📋 Order: ${order.orderId}
                        <button type="button" class="btn btn-small"
                                style="background: #667eea; color: white;"
                                onclick="Orders.toggleOriginalOrderEdit('${cardId}')">
                            ✏️ Edit
                        </button>
                    </h4>
                </div>

                <!-- View Mode -->
                <div id="${cardId}_view" style="padding: 1.5rem;">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem;">
                        <div><strong>📅 Date:</strong> ${order.date || 'N/A'}</div>
                        <div><strong>⏰ Ready Time:</strong> ${order.readyTime || 'N/A'}</div>
                        <div><strong>👤 Client:</strong> ${order.clientName || 'N/A'}</div>
                        <div><strong>📞 Contact:</strong> ${order.contact || 'N/A'}</div>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <strong>📍 Venue:</strong> ${order.venue || 'N/A'}
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem;">
                        <div><strong>🚗 Transport:</strong> ${order.transport || 'N/A'}</div>
                        <div><strong>🚘 Driver:</strong> ${order.driverName || 'N/A'}</div>
                        <div><strong>🎬 Operator:</strong> ${order.operator || 'N/A'}</div>
                        <div><strong>👷 Helper:</strong> ${order.helper || 'N/A'}</div>
                    </div>
                    <div style="padding: 1rem; background: #f9f9f9; border-radius: 4px;">
                        <strong>📦 Items:</strong> ${itemsList}
                    </div>
                    ${order.notes ? `<div style="margin-top: 1rem;"><strong>📝 Notes:</strong><br>${order.notes}</div>` : ''}
                </div>

                <!-- Edit Mode (Hidden by default) -->
                <div id="${cardId}_edit" style="display: none; padding: 1.5rem; background: #fefefe;">
                    <form onsubmit="Orders.saveOriginalOrder(event, ${index}, '${order.docId}')">
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem;">
                            <div class="form-group">
                                <label class="form-label">📅 Date</label>
                                <input type="date" class="form-input" id="${cardId}_date" value="${order.date || ''}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">⏰ Ready Time</label>
                                <input type="text" class="form-input" id="${cardId}_readyTime" value="${order.readyTime || ''}" placeholder="e.g., 10:00 AM">
                            </div>
                        </div>

                        <div class="form-group" style="margin-bottom: 1rem;">
                            <label class="form-label">📍 Venue</label>
                            <input type="text" class="form-input" id="${cardId}_venue" value="${order.venue || ''}" required>
                        </div>

                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem;">
                            <div class="form-group">
                                <label class="form-label">🚗 Transport</label>
                                <input type="text" class="form-input" id="${cardId}_transport" value="${order.transport || ''}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">🚘 Driver</label>
                                <input type="text" class="form-input" id="${cardId}_driverName" value="${order.driverName || ''}">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem;">
                            <div class="form-group">
                                <label class="form-label">🎬 Operator</label>
                                <input type="text" class="form-input" id="${cardId}_operator" value="${order.operator || ''}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">👷 Helper</label>
                                <input type="text" class="form-input" id="${cardId}_helper" value="${order.helper || ''}">
                            </div>
                        </div>

                        <div class="form-group" style="margin-bottom: 1rem;">
                            <label class="form-label">📝 Notes</label>
                            <textarea class="form-textarea" id="${cardId}_notes" rows="3">${order.notes || ''}</textarea>
                        </div>

                        <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                            <button type="button" class="btn btn-secondary" onclick="Orders.toggleOriginalOrderEdit('${cardId}')">
                                Cancel
                            </button>
                            <button type="submit" class="btn btn-success">
                                💾 Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    toggleOriginalOrderEdit(cardId) {
        const viewMode = document.getElementById(`${cardId}_view`);
        const editMode = document.getElementById(`${cardId}_edit`);

        if (viewMode && editMode) {
            const isEditing = editMode.style.display !== 'none';
            viewMode.style.display = isEditing ? 'block' : 'none';
            editMode.style.display = isEditing ? 'none' : 'block';
        }
    },

    async saveOriginalOrder(event, index, docId) {
        event.preventDefault();
        const cardId = `originalOrder_${index}`;

        // Get oms instance from window
        const oms = window.OMS;
        if (!oms) {
            console.error('OMS instance not found');
            return;
        }

        try {
            // Collect form data
            const updatedData = {
                date: Utils.get(`${cardId}_date`),
                readyTime: Utils.get(`${cardId}_readyTime`),
                venue: Utils.get(`${cardId}_venue`),
                transport: Utils.get(`${cardId}_transport`),
                driverName: Utils.get(`${cardId}_driverName`),
                operator: Utils.get(`${cardId}_operator`),
                helper: Utils.get(`${cardId}_helper`),
                notes: Utils.get(`${cardId}_notes`)
            };

            console.log('💾 Saving original order changes:', docId, updatedData);

            // Get the full order from Firestore
            const orderDoc = await db.collection('orders').doc(docId).get();
            if (!orderDoc.exists) {
                throw new Error('Order not found in Firestore');
            }

            const fullOrder = orderDoc.data();

            // Update with new data
            const updatedOrder = {
                ...fullOrder,
                ...updatedData,
                updatedAt: new Date().toISOString()
            };

            // Save to Firestore
            await db.collection('orders').doc(docId).update(updatedOrder);

            oms.showToast(`✅ Order updated successfully!`, 'success');

            // Toggle back to view mode
            this.toggleOriginalOrderEdit(cardId);

            // Reload orders to refresh display
            await oms.loadOrdersFromFirestore();

            // Reload the current merged order
            const currentOrder = oms.data.orders.find(o => o.docId === oms.editingDocId);
            if (currentOrder) {
                this.loadOrderToForm(oms, currentOrder);
            }

        } catch (error) {
            console.error('❌ Error saving original order:', error);
            oms.showToast(`Error: ${error.message}`, 'error');
        }
    },

    // ============ PDF GENERATION ============

    async generateSingleOrderImage(oms, order) {
        const isMobile = Utils.isMobileDevice();
        const deviceType = Utils.getDeviceType();
        const loading = oms.showLoading(isMobile ? 'Generating image (mobile mode)...' : 'Generating image...');

        try {
            const template = document.getElementById('printTemplate');
            const colors = oms.data.settings.printColors;
            const fontSize = oms.data.settings.printFontSize || 26;
            const bgColor = oms.data.settings.printBgColor || '#ffffff';
            const textColor = oms.data.settings.printTextColor || '#000000';

            // Get paper dimensions based on settings
            const paperDimensions = this.getPaperDimensions(oms);

            // Mobile optimization: Validate canvas dimensions before proceeding
            const baseScale = oms.data.settings.imageQuality || 2;
            const optimizedScale = Utils.getOptimalCanvasScale(baseScale);

            const canvasWidth = Math.round(paperDimensions.width * optimizedScale);
            const canvasHeight = Math.round(paperDimensions.height * optimizedScale);

            const validation = Utils.validateCanvasDimensions(canvasWidth, canvasHeight);
            if (!validation.valid) {
                oms.hideLoading(loading);
                oms.showToast(`⚠️ ${validation.reason}. Please reduce image quality in settings.`, 'error');
                console.error('Canvas validation failed:', validation.reason);
                return;
            }

            if (isMobile && optimizedScale < baseScale) {
                console.log(`📱 Mobile device detected (${deviceType}): Quality auto-reduced from ${baseScale} to ${optimizedScale} for better compatibility`);
            }

            // Apply left margin from settings (convert mm to pixels: 1mm = 11.811px at 300 DPI)
            const leftMarginMm = oms.data.settings.tableSettings?.leftMargin || 50;
            const leftMarginPx = Math.round(leftMarginMm * 11.811);
            template.style.paddingLeft = leftMarginPx + 'px';

            // Set template width to match paper dimensions
            template.style.width = paperDimensions.width + 'px';
            template.style.paddingRight = '80px';

            template.innerHTML = this.buildOrderHTML(oms, order, fontSize, colors, false, bgColor, textColor);
            template.style.display = 'block';

            // Increased wait time for mobile devices (they need more time for DOM to settle)
            await new Promise(r => setTimeout(r, isMobile ? 500 : 300));

            // Create canvas with optimized scale
            let canvas;
            try {
                canvas = await html2canvas(template, {
                    scale: optimizedScale,
                    backgroundColor: bgColor,
                    width: paperDimensions.width,
                    logging: false,
                    useCORS: true,
                    allowTaint: false,
                    // Mobile-specific optimizations
                    removeContainer: true,
                    imageTimeout: isMobile ? 30000 : 15000
                });
            } catch (canvasError) {
                console.error('html2canvas failed:', canvasError);

                // Retry with even lower quality for mobile
                if (isMobile && optimizedScale > 1) {
                    console.log('⚠️ Retrying with scale 1 for mobile compatibility...');
                    this.updateLoadingMessage(loading, 'Retrying with lower quality...');

                    canvas = await html2canvas(template, {
                        scale: 1,
                        backgroundColor: bgColor,
                        width: paperDimensions.width,
                        logging: false,
                        useCORS: true,
                        allowTaint: false,
                        removeContainer: true,
                        imageTimeout: 30000
                    });
                } else {
                    throw canvasError;
                }
            }

            template.style.display = 'none';

            // Use Promise-based blob creation with better error handling
            this.updateLoadingMessage(loading, 'Creating download file...');

            let blob;
            try {
                blob = await Utils.canvasToBlobPromise(canvas, 'image/png', 0.95);
            } catch (blobError) {
                console.error('PNG blob creation failed:', blobError);

                // Fallback to JPEG with lower quality for mobile
                if (isMobile) {
                    console.log('⚠️ Retrying with JPEG format for mobile compatibility...');
                    this.updateLoadingMessage(loading, 'Trying alternative format...');
                    blob = await Utils.canvasToBlobPromise(canvas, 'image/jpeg', 0.85);
                } else {
                    throw blobError;
                }
            }

            // Check blob size
            const blobSizeMB = (blob.size / 1024 / 1024).toFixed(2);
            console.log(`📊 Image size: ${blobSizeMB} MB`);

            if (blob.size > 50 * 1024 * 1024 && isMobile) {
                oms.hideLoading(loading);
                oms.showToast('⚠️ Image too large for mobile device. Please reduce quality in settings.', 'error');
                return;
            }

            // Create download
            try {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                const fileExt = blob.type.includes('jpeg') ? 'jpg' : 'png';
                link.download = `Order_${order.orderId}.${fileExt}`;

                // Mobile-specific download handling
                if (isMobile) {
                    // For mobile, add a small delay and use different approach
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    link.click();
                }

                // Delay cleanup for mobile browsers
                setTimeout(() => URL.revokeObjectURL(url), isMobile ? 1000 : 100);

                oms.hideLoading(loading);
                oms.showToast(`✅ Image downloaded! (${blobSizeMB} MB)`);
            } catch (downloadError) {
                console.error('Download failed:', downloadError);
                oms.hideLoading(loading);
                oms.showToast('❌ Download failed: ' + downloadError.message, 'error');
            }
        } catch (error) {
            oms.hideLoading(loading);
            console.error('Image generation error:', error);

            // Mobile-friendly error message
            if (isMobile) {
                oms.showToast(`❌ Failed on ${deviceType}: ${error.message}. Try reducing image quality in settings.`, 'error');
            } else {
                oms.showToast('❌ Error: ' + error.message, 'error');
            }
        }
    },

    buildOrderHTML(oms, order, fontSize, colors, compact = false, bgColor = '#ffffff', textColor = '#000000', orderNumber = null) {
        const ts = oms.data.settings.tableSettings;
        const orderIdBg = colors.orderIdBg || '#667eea';
        const orderIdText = colors.orderIdText || '#ffffff';
        const functionColor = oms.data.settings.functionColor || '#667eea';

        // Calculate requirements for this order
        const requirements = this.calculateOrderRequirements(order);

        return `
            <div style="margin-bottom: ${compact ? '25px' : '60px'}; ${compact ? 'border: 3px solid #CC8800; box-shadow: inset 0 0 0 3px #CC0000; padding: 15px;' : ''}; color: ${textColor}; background: ${bgColor};">
                ${!compact ? `<div style="text-align: center; margin-bottom: 40px;">
                    <h1 style="color: ${colors.headerText}; background: ${colors.headerBg}; padding: 20px;">
                        Order Management
                    </h1>
                    <h2 style="margin-top: 20px; color: ${textColor};">
                        <span style="background: ${orderIdBg}; color: ${orderIdText}; padding: 10px 20px; border-radius: 8px;">
                            ${order.orderId}
                        </span>
                    </h2>
                </div>` : ''}

                <!-- FP- Field at center/top (YELLOW BACKGROUND REMOVED) -->
                <div style="text-align: center; margin-bottom: ${compact ? '15px' : '25px'}; margin-top: ${compact ? '10px' : '0'};">
                    ${orderNumber ? `<div style="display: inline-block; font-size: ${fontSize + 6}px; font-weight: bold; color: ${textColor}; margin-right: 15px; vertical-align: middle;">Order ${orderNumber}</div>` : ''}
                    <div style="display: inline-block; border: 2px solid ${textColor}; padding: 8px 25px; font-size: ${fontSize + 4}px; font-weight: bold; color: ${textColor}; vertical-align: middle;">
                        FP-<span style="display: inline-block; min-width: 150px; border-bottom: 2px solid ${textColor}; margin-left: 10px; white-space: nowrap;">${order.orderId && order.orderId.startsWith('FP') ? order.orderId.substring(2) : ''}</span>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: ${compact ? '12px' : '20px'}; font-size: ${fontSize}px; margin-bottom: ${compact ? '12px' : '20px'}; color: ${textColor};">
                    <div>
                        ${order.isMultiDay ? `
                            <strong style="color: ${textColor};">Start Date:</strong> <span style="background: #ffeb3b; color: #000000; padding: 2px 4px;">${Utils.formatDate(order.startDate) || 'N/A'}</span><br>
                            <strong style="color: ${textColor};">End Date:</strong> <span style="background: #ffeb3b; color: #000000; padding: 2px 4px;">${Utils.formatDate(order.endDate) || 'N/A'}</span><br>
                        ` : `
                            <strong style="color: ${textColor};">Date:</strong> <span style="background: #ffeb3b; color: #000000; padding: 2px 4px;">${Utils.formatDate(order.date) || 'N/A'}</span><br>
                            <strong style="color: ${textColor};">Time:</strong> <span style="background: #ffeb3b; color: #000000; padding: 2px 4px;">${order.readyTime || '-'}</span><br>
                        `}
                        <strong style="color: ${textColor};">Client:</strong> ${order.clientName || '-'}<br>
                        <strong style="color: ${textColor};">Contact:</strong> ${order.contact || '-'}<br>
                        <strong style="color: ${textColor};">Venue:</strong> ${order.venue || '-'}
                    </div>
                    <div>
                        <div style="font-size: 50px; font-weight: bold; color: ${textColor};">Dry Ice: ${requirements.dryIceNeeded > 0 ? requirements.dryIceNeeded + ' kg (' + requirements.dryMachines + ' machine' + (requirements.dryMachines !== 1 ? 's' : '') + ')' : ''}</div>
                        <div style="font-size: 50px; font-weight: bold; color: ${textColor};">Flowers: ${requirements.flowersNeeded > 0 ? requirements.flowersNeeded + ' kg (' + requirements.flowerShowerMachines + ' machine' + (requirements.flowerShowerMachines !== 1 ? 's' : '') + ')' : ''}</div>
                        <div style="font-size: 50px; font-weight: bold; color: ${textColor};">Electricity: ${requirements.totalElectricityKV > 0 ? requirements.totalElectricityKV + ' KV' : ''}</div>
                        <strong style="color: ${textColor};">Transport:</strong> ${order.transport || '-'}<br>
                        <strong style="color: ${textColor};">Driver:</strong> ${order.driverName || '-'}<br>
                        ${order.transport2 ? `<strong style="color: ${textColor};">Transport 2:</strong> ${order.transport2}<br>` : ''}
                        ${order.driverName2 ? `<strong style="color: ${textColor};">Driver 2:</strong> ${order.driverName2}<br>` : ''}
                    </div>
                    <div>
                        <strong style="color: ${textColor};">Event:</strong> ${order.eventType || '-'}<br>
                        <strong style="color: ${textColor};">Operator:</strong> ${order.operator || '-'}<br>
                        <strong style="color: ${textColor};">Helper(s):</strong> ${order.helper || '-'}
                    </div>
                </div>

                <!-- Dividing line between top info and items -->
                <div style="border-top: 3px solid ${textColor}; margin: ${compact ? '15px' : '25px'} 0;"></div>

                    ${order.dayWiseData && order.dayWiseData.length > 0 ?
                    '<div style="margin-top: ' + (compact ? '15px' : '30px') + ';">' +
                        '<h3 style="color: ' + colors.headerText + '; background: ' + colors.headerBg + '; padding: ' + (compact ? '10px' : '15px') + '; text-align: center;">Day-wise Details</h3>' +
                        order.dayWiseData.map((day, idx) =>
                            '<div style="margin-top: ' + (compact ? '12px' : '25px') + '; border: 2px solid ' + colors.tableBorder + '; padding: ' + (compact ? '10px' : '15px') + '; background: rgba(102, 126, 234, 0.05);">' +
                                '<h4 style="color: ' + orderIdBg + '; margin-bottom: ' + (compact ? '8px' : '15px') + ';">Day ' + day.dayNumber + ' - <span style="background: #ffeb3b; color: #000000; padding: 2px 4px;">' + Utils.formatDate(day.date) + '</span></h4>' +
                                (day.functions && day.functions.length > 0 ?
                                    day.functions.map((func, funcIdx) =>
                                        '<div style="background: ' + bgColor + '; padding: ' + (compact ? '10px' : '15px') + '; border: 1px solid ' + colors.tableBorder + '; border-radius: 6px; margin-top: ' + (funcIdx > 0 ? (compact ? '8px' : '15px') : '0') + '; color: ' + textColor + ';">' +
                                            '<h5 style="color: ' + functionColor + '; margin-bottom: ' + (compact ? '6px' : '10px') + '; font-size: ' + (fontSize - 2) + 'px;">Function ' + (funcIdx + 1) + '</h5>' +
                                            '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: ' + (compact ? '8px' : '12px') + '; font-size: ' + fontSize + 'px; margin-bottom: ' + (compact ? '6px' : '10px') + '; color: ' + textColor + ';">' +
                                                '<div>' +
                                                    '<strong style="color: ' + textColor + ';">Type:</strong> ' + (func.functionType || '-') + '<br>' +
                                                    '<strong style="color: ' + textColor + ';">Time:</strong> <span style="background: #ffeb3b; color: #000000; padding: 2px 4px;">' + (func.timeSlot || '-') + '</span>' +
                                                '</div>' +
                                                '<div>' +
                                                    '<strong style="color: ' + textColor + ';">Driver:</strong> ' + (func.driver || '-') + '<br>' +
                                                    '<strong style="color: ' + textColor + ';">Operator:</strong> ' + (func.operator || '-') +
                                                '</div>' +
                                                '<div>' +
                                                    '<strong style="color: ' + textColor + ';">Helper:</strong> ' + (func.helper || '-') +
                                                '</div>' +
                                            '</div>' +
                                            (func.notes ? '<div style="font-size: ' + fontSize + 'px; margin-bottom: ' + (compact ? '6px' : '10px') + '; color: ' + textColor + ';"><strong style="color: ' + textColor + ';">Notes:</strong> ' + func.notes + '</div>' : '') +
                                            (func.items && func.items.length > 0 ?
                                                '<div style="font-size: ' + (fontSize - 4) + 'px; color: ' + textColor + '; margin-top: ' + (compact ? '8px' : '12px') + ';">' +
                                                    func.items.map((item, i) =>
                                                        '<div style="padding: ' + (compact ? '4px' : '6px') + ' 0; color: ' + textColor + ';">' +
                                                            '<span style="color: ' + textColor + ';">' + (i + 1) + '. ' + item.name + ' - ' + item.quantity + (item.quantity == 1 ? ' Pc' : ' Pcs') + (item.remarks ? ' - Remarks: ' + item.remarks : '') + '</span>' +
                                                        '</div>'
                                                    ).join('') +
                                                '</div>'
                                            : '<p style="text-align: center; color: #666; font-style: italic; margin-top: ' + (compact ? '6px' : '10px') + ';">No items for this function</p>') +
                                        '</div>'
                                    ).join('')
                                : '<p style="text-align: center; color: #666; font-style: italic; margin-top: 10px;">No functions for this day</p>') +
                            '</div>'
                        ).join('') +
                    '</div>'
                : ''}

                ${!order.isMultiDay && order.items && order.items.length > 0 ? `
                    <div style="font-size: ${fontSize - 4}px; margin-top: ${compact ? '12px' : '20px'}; color: ${textColor};">
                        ${order.items.map((item, i) => `
                            <div style="padding: ${compact ? '4px' : '6px'} 0; color: ${textColor};">
                                <span style="color: ${textColor};">${i + 1}. ${item.name} - ${item.quantity} ${item.quantity == 1 ? 'Pc' : 'Pcs'}${item.remarks ? ' - Remarks: ' + item.remarks : ''}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : (!order.isMultiDay ? '<p style="text-align: center; color: #666; font-style: italic; margin-top: ' + (compact ? '12px' : '20px') + ';">No items added</p>' : '')}

                ${order.notes ? `
                    <div style="margin-top: ${compact ? '10px' : '20px'}; font-size: ${fontSize}px; color: ${textColor};">
                        <strong style="color: ${textColor};">Notes:</strong><br>
                        <div style="background: ${colors.notesBg}; padding: ${compact ? '10px' : '15px'}; border: 1px solid ${colors.tableBorder}; color: ${textColor};">
                            ${order.notes}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    },

    // ============ WHATSAPP MESSAGES ============

    generateWhatsAppSingleOrderMessage(oms, order, orderNumber, selectedDate) {
        if (!order) return '';

        let message = `Order ${orderNumber}\n`;
        message += `Date: ${Utils.formatDate(selectedDate)}\n\n`;
        message += `━━━━━━━━━━━━━━━━\n`;
        message += `${order.clientName || 'N/A'}\n`;
        message += `Contact: ${order.contact || 'N/A'}\n`;

        // Venue with location combined
        if (order.venue && order.venue !== 'N/A') {
            message += `Venue: ${order.venue}`;

            // Add Google Maps location link - check all possible sources
            let mapsUrl = null;

            // Priority 1: venueLocation with coordinates
            if (order.venueLocation && order.venueLocation.lat && order.venueLocation.lng) {
                if (order.venueLocation.place_id) {
                    mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.venue)}&query_place_id=${order.venueLocation.place_id}`;
                } else {
                    mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.venue)}+${order.venueLocation.lat},${order.venueLocation.lng}`;
                }
            }
            // Priority 2: venueMapLink (stored link)
            else if (order.venueMapLink && order.venueMapLink.trim()) {
                mapsUrl = order.venueMapLink;
            }

            if (mapsUrl) {
                message += `\nLocation: ${mapsUrl}`;
            }
            message += `\n`;
        }

        message += `Time: ${order.readyTime || ''}\n\n`;

        // Find specific day data for multi-day orders
        let specificDayData = null;
        if (order.isMultiDay && order.dayWiseData && order.dayWiseData.length > 0) {
            specificDayData = order.dayWiseData.find(dayData => dayData.date === selectedDate);
        }

        // Collect items for this order
        let orderItems = [];

        // Functions and items (compact format - no "Items:" label)
        if (specificDayData && specificDayData.functions) {
            specificDayData.functions.forEach((func, funcIdx) => {
                if (func.items && func.items.length > 0) {
                    // Function name
                    if (func.functionType) {
                        message += `Function - ${func.functionType}`;
                        if (func.timeSlot) message += ` (${func.timeSlot})`;
                        message += `\n`;
                    } else if (specificDayData.functions.length > 1) {
                        message += `Function ${funcIdx + 1}`;
                        if (func.timeSlot) message += ` (${func.timeSlot})`;
                        message += `\n`;
                    }

                    // Items directly (no "Items:" label)
                    func.items.forEach(item => {
                        message += `${item.name} ${item.quantity}`;
                        if (item.remarks) message += ` (${item.remarks})`;
                        message += `\n`;
                        orderItems.push(item);
                    });
                }
            });
        } else if (order.items && order.items.length > 0) {
            // Single-day order items
            order.items.forEach(item => {
                message += `${item.name} ${item.quantity}`;
                if (item.remarks) message += ` (${item.remarks})`;
                message += `\n`;
                orderItems.push(item);
            });
        }

        // Calculate RAW MATERIALS for this order only
        let dryIceMachines = 0;
        let flowerShowerMachines = 0;
        let electricityKV = 0;

        orderItems.forEach(item => {
            const itemNameLower = item.name?.toLowerCase() || '';
            const qty = item.quantity || 0;

            // Dry ice machines
            if (itemNameLower.includes('dry ice')) {
                dryIceMachines += qty;
            }

            // Flower shower machines
            if ((itemNameLower.includes('flower') && itemNameLower.includes('shower')) ||
                itemNameLower.includes('flower shower machine')) {
                flowerShowerMachines += qty;
            }

            // Electricity - 3KV machines
            const electricity3KV = ['showven sonic boom (co2 jet)', 'sonic boom', 'dry ice machine', '5 head flame'];
            if (electricity3KV.some(name => itemNameLower.includes(name))) {
                electricityKV += qty * 3;
            }
            // Electricity - 1KV machines
            else {
                const electricity1KV = ['sparkular', 'spinner', 'cyclone', 'waver', 'circle flame', 'snow machine', 'fan wheel'];
                if (electricity1KV.some(name => itemNameLower.includes(name))) {
                    electricityKV += qty * 1;
                }
            }
        });

        // Add raw materials for this order
        if (dryIceMachines > 0) {
            const dryIceNeeded = dryIceMachines * 20; // 20kg per machine
            message += `\n━━━━━━━━━━━━━━━━\n`;
            message += `DRY ICE: ${dryIceNeeded}kg\n`;
            message += `(${dryIceMachines} machine${dryIceMachines !== 1 ? 's' : ''} x 20kg)\n`;
        }

        if (flowerShowerMachines > 0) {
            const flowersNeeded = flowerShowerMachines * 20; // 20kg per machine
            message += `━━━━━━━━━━━━━━━━\n`;
            message += `FLOWERS: ${flowersNeeded}kg\n`;
            message += `(${flowerShowerMachines} machine${flowerShowerMachines !== 1 ? 's' : ''} x 20kg)\n`;
        }

        if (electricityKV > 0) {
            message += `━━━━━━━━━━━━━━━━\n`;
            message += `ELECTRICITY: ${electricityKV}KV\n`;
        }

        message += `\nFirepowerSFX Order Management`;

        return message;
    },

    updateWhatsAppDateFilter(oms) {
        const dateInput = document.getElementById('whatsappFilterDate');
        const previewDiv = document.getElementById('whatsappOrdersPreview');
        const noOrdersDiv = document.getElementById('whatsappNoOrders');
        const ordersListDiv = document.getElementById('whatsappOrdersList');
        const orderCountSpan = document.getElementById('whatsappOrderCount');

        if (!dateInput || !dateInput.value) {
            previewDiv.style.display = 'none';
            noOrdersDiv.style.display = 'none';
            return;
        }

        const selectedDate = dateInput.value;
        const filteredOrders = this.filterOrdersByDate(oms, selectedDate);

        if (filteredOrders.length === 0) {
            previewDiv.style.display = 'none';
            noOrdersDiv.style.display = 'block';
            return;
        }

        // Show preview
        noOrdersDiv.style.display = 'none';
        previewDiv.style.display = 'block';
        orderCountSpan.textContent = filteredOrders.length;

        // Generate individual message cards for each order
        ordersListDiv.innerHTML = '';

        filteredOrders.forEach((order, index) => {
            const orderNumber = index + 1;
            const message = this.generateWhatsAppSingleOrderMessage(oms, order, orderNumber, selectedDate);

            // Create card for this order
            const orderCard = document.createElement('div');
            orderCard.style.cssText = 'background: var(--bg-card); border: 2px solid var(--border); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;';

            orderCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                    <h4 style="margin: 0; color: var(--primary);">📋 Order ${orderNumber}</h4>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-primary btn-small" onclick="Orders.copyOrderMessage(oms, ${index})" title="Copy Message">
                            📋 Copy
                        </button>
                        <button class="btn btn-success btn-small" onclick="Orders.sendSingleOrderWhatsApp(oms, ${index})" title="Send WhatsApp">
                            📱 Send
                        </button>
                    </div>
                </div>
                <div style="font-size: 0.9rem; white-space: pre-wrap; font-family: monospace; background: var(--bg-hover); padding: 0.75rem; border-radius: 4px; max-height: 250px; overflow-y: auto;">
                    ${message}
                </div>
            `;

            ordersListDiv.appendChild(orderCard);
        });

        // Store orders and date for message operations
        oms.whatsappCurrentOrders = filteredOrders;
        oms.whatsappCurrentDate = selectedDate;
    },

    copyOrderMessage(oms, orderIndex) {
        const order = oms.whatsappCurrentOrders[orderIndex];
        const orderNumber = orderIndex + 1;
        const message = this.generateWhatsAppSingleOrderMessage(oms, order, orderNumber, oms.whatsappCurrentDate);

        // Copy to clipboard
        navigator.clipboard.writeText(message).then(() => {
            oms.showToast(`✅ Order ${orderNumber} message copied to clipboard!`, 'success');
        }).catch(err => {
            console.error('Failed to copy:', err);
            oms.showToast('Failed to copy message', 'error');
        });
    },

    sendSingleOrderWhatsApp(oms, orderIndex) {
        const order = oms.whatsappCurrentOrders[orderIndex];
        const orderNumber = orderIndex + 1;
        const message = this.generateWhatsAppSingleOrderMessage(oms, order, orderNumber, oms.whatsappCurrentDate);

        // Encode and open WhatsApp
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');

        oms.showToast(`📱 Opening WhatsApp for Order ${orderNumber}...`, 'success');
    }
};

// Make globally available for backward compatibility
if (typeof window !== 'undefined') {
    window.Orders = Orders;
}

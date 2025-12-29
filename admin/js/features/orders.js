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
    }
};

// Make globally available for backward compatibility
if (typeof window !== 'undefined') {
    window.Orders = Orders;
}

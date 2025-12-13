/* ============================================
   PREPARATION - Weather forecasts, material calculations, preparation planning
   ============================================ */

/**
 * Preparation Feature Module
 *
 * Provides:
 * - Material/item forecasting for date ranges
 * - Weather integration for event planning
 * - Inventory vs required calculations
 * - Preparation reports and printing
 *
 * @exports Preparation
 */

import { Utils } from '../utils/helpers.js';

export const Preparation = {
    /**
     * Render preparation interface
     * @param {Object} oms - Reference to OMS
     */
    renderPreparation(oms) {
        const container = document.getElementById('preparation');
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">${oms.t('preparationForecast')}</h2>
                    <p style="color: var(--text-gray); margin-top: 0.5rem;">${oms.t('itemsToPrep')}</p>
                </div>

                <div class="card">
                    <h3>${oms.t('selectDateRange')}</h3>
                    <div class="form-row" style="margin-bottom: 1rem;">
                        <button class="btn btn-secondary" onclick="OMS.quickForecast('today')">${oms.t('today')}</button>
                        <button class="btn btn-secondary" onclick="OMS.quickForecast('tomorrow')">${oms.t('tomorrow') || 'Tomorrow'}</button>
                        <button class="btn btn-secondary" onclick="OMS.quickForecast('week')">${oms.t('next7Days') || 'Next 7 Days'}</button>
                        <button class="btn btn-secondary" onclick="OMS.quickForecast('month')">${oms.t('next30Days') || 'Next 30 Days'}</button>
                    </div>
                    <div class="form-row">
                        <div style="flex: 1;">
                            <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">${oms.t('from')}</label>
                            <input type="date" id="forecastStartDate" class="form-input" value="${today}">
                        </div>
                        <div style="flex: 1;">
                            <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">${oms.t('to')}</label>
                            <input type="date" id="forecastEndDate" class="form-input" value="${tomorrow}">
                        </div>
                        <div style="display: flex; align-items: flex-end;">
                            <button class="btn btn-primary" onclick="OMS.generateForecast()" style="height: fit-content;">
                                🔍 ${oms.t('generateReport')}
                            </button>
                        </div>
                    </div>
                </div>

                <div id="forecastResults"></div>
            </div>
        `;

        // Auto-generate forecast for tomorrow
        setTimeout(() => this.generateForecast(oms), 100);
    },

    /**
     * Quick forecast for common periods
     * @param {Object} oms - Reference to OMS
     * @param {string} period - today/tomorrow/week/month
     */
    quickForecast(oms, period) {
        const today = new Date();
        const startInput = document.getElementById('forecastStartDate');
        const endInput = document.getElementById('forecastEndDate');

        let start = new Date(today);
        let end = new Date(today);

        switch(period) {
            case 'today':
                break;
            case 'tomorrow':
                start.setDate(start.getDate() + 1);
                end.setDate(end.getDate() + 1);
                break;
            case 'week':
                end.setDate(end.getDate() + 7);
                break;
            case 'month':
                end.setDate(end.getDate() + 30);
                break;
        }

        startInput.value = start.toISOString().split('T')[0];
        endInput.value = end.toISOString().split('T')[0];

        this.generateForecast(oms);
    },

    /**
     * Generate preparation forecast
     * @param {Object} oms - Reference to OMS
     */
    async generateForecast(oms) {
        const startDate = Utils.get('forecastStartDate');
        const endDate = Utils.get('forecastEndDate');

        if (!startDate || !endDate) {
            oms.showToast('Please select both start and end dates', 'error');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end < start) {
            oms.showToast('End date must be after start date', 'error');
            return;
        }

        // Get orders in date range
        const ordersInRange = this.getOrdersInDateRange(oms, startDate, endDate);

        // Aggregate items
        const itemsMap = new Map();
        const orderItemsMap = new Map();

        ordersInRange.forEach(order => {
            const items = oms.getItemsFromOrder(order, startDate, endDate);

            items.forEach(item => {
                const current = itemsMap.get(item.name) || 0;
                itemsMap.set(item.name, current + item.quantity);

                if (!orderItemsMap.has(item.name)) {
                    orderItemsMap.set(item.name, []);
                }
                orderItemsMap.get(item.name).push({
                    orderId: order.orderId,
                    clientName: order.clientName,
                    quantity: item.quantity
                });
            });
        });

        // Convert to array and sort
        const aggregatedItems = Array.from(itemsMap, ([name, quantity]) => {
            const inventoryItem = oms.data.inventory.items.find(i =>
                i.name.toLowerCase() === name.toLowerCase()
            );

            return {
                name,
                required: quantity,
                inStock: inventoryItem ? inventoryItem.quantity : 0,
                difference: inventoryItem ? inventoryItem.quantity - quantity : -quantity,
                orders: orderItemsMap.get(name) || []
            };
        }).sort((a, b) => b.required - a.required);

        // Fetch weather
        const weatherApiKey = oms.data.settings.weatherApiKey || '';
        const defaultCity = oms.data.settings.defaultCity || 'Delhi';
        const weatherData = await Utils.getWeatherForecast(defaultCity, startDate, weatherApiKey);

        // Render results (delegate to OMS for now due to complex HTML generation)
        if (typeof oms.renderForecastResults === 'function') {
            oms.renderForecastResults(ordersInRange, aggregatedItems, startDate, endDate, weatherData);
        }
    },

    /**
     * Get orders in date range
     * @param {Object} oms - Reference to OMS
     * @param {string} startDate - Start date
     * @param {string} endDate - End date
     * @returns {Array} Filtered orders
     */
    getOrdersInDateRange(oms, startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        return oms.data.orders.filter(order => {
            // Handle multi-day events
            if (order.isMultiDay) {
                const orderStart = new Date(order.startDate);
                const orderEnd = new Date(order.endDate);
                return (orderStart <= end && orderEnd >= start);
            }

            // Single day events
            const orderDate = new Date(order.date || order.orderDate || order.createdAt);
            return orderDate >= start && orderDate <= end;
        });
    }
};

// Make globally available for backward compatibility
if (typeof window !== 'undefined') {
    window.Preparation = Preparation;
}

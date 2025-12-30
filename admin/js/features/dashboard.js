/* ============================================
   DASHBOARD - Dashboard stats and recent orders display
   ============================================ */

/**
 * Dashboard Feature Module
 *
 * Provides:
 * - Statistics cards (total orders, confirmed, completed, customers, low stock, today's orders)
 * - Recent orders table
 * - Top customer info
 *
 * @exports Dashboard
 */

import { Utils } from '../utils/helpers.js';

export const Dashboard = {
    /**
     * Render dashboard statistics and recent orders
     * @param {Object} oms - Reference to OMS for data access
     */
    render(oms) {
        this.renderStats(oms);
        this.renderRecentOrders(oms);
        this.renderTopCustomer(oms);

        // Render analytics charts (revenue, status, monthly, top items)
        if (typeof oms.renderAnalyticsCharts === 'function') {
            oms.renderAnalyticsCharts();
        }

        // Render top 10 customers list
        this.renderTop10Customers(oms);
    },

    /**
     * Render statistics cards
     * @param {Object} oms - Reference to OMS
     */
    renderStats(oms) {
        // Filter out merged orders for accurate counts
        const visibleOrders = oms.data.orders.filter(o => !o.isMerged);

        const stats = [
            { label: oms.t('totalOrders'), value: visibleOrders.length, class: '' },
            { label: oms.t('confirmedOrders'), value: visibleOrders.filter(o => o.status && o.status.toLowerCase() === 'confirmed').length, class: 'success' },
            { label: oms.t('completedOrders'), value: visibleOrders.filter(o => o.status && o.status.toLowerCase() === 'completed').length, class: 'info' },
            { label: oms.t('customers'), value: oms.data.customers.length, class: '' },
            { label: oms.t('lowStock'), value: oms.data.inventory.items.filter(i => i.quantity <= oms.data.settings.lowStockThreshold).length, class: 'warning' },
            { label: oms.t('today'), value: visibleOrders.filter(o => o.date === Utils.toDateString(new Date())).length, class: 'danger' }
        ];

        const statsContainer = document.getElementById('dashboardStats');
        if (statsContainer) {
            statsContainer.innerHTML = stats.map(s => `
                <div class="stat-card ${s.class}">
                    <div class="stat-value">${s.value}</div>
                    <div class="stat-label">${s.label}</div>
                </div>
            `).join('');
        }
    },

    /**
     * Render recent orders table
     * @param {Object} oms - Reference to OMS
     */
    renderRecentOrders(oms) {
        const visibleOrders = oms.data.orders.filter(o => !o.isMerged);
        const recentOrders = visibleOrders.slice(-5).reverse();

        oms.renderTable('recentOrdersContainer', [
            { key: 'orderId', label: oms.t('orderId'), render: o => `<span class="order-id-highlight">${o.orderId}</span>` },
            { key: 'clientName', label: oms.t('client') },
            { key: 'eventType', label: oms.t('event'), render: o => o.eventType || oms.t('na') },
            { key: 'date', label: oms.t('date'), render: o => {
                if (o.isMultiDay) {
                    return `${Utils.formatDate(o.startDate)} ${oms.t('to')} ${Utils.formatDate(o.endDate)}`;
                }
                return Utils.formatDate(o.date);
            }},
            { key: 'status', label: oms.t('status'), render: o => `<span class="status-badge status-${o.status.toLowerCase()}">${o.status}</span>` }
        ], recentOrders, (row) => `
            <button class="btn btn-secondary btn-small" data-action="edit" data-type="order" data-id="${row.docId || row.orderId}">${oms.t('view')}</button>
            <button class="btn btn-info btn-small" onclick="OMS.duplicateOrder('${row.docId || row.orderId}')">📋 ${oms.t('duplicate')}</button>
            <button class="btn btn-success btn-small" data-action="print" data-id="${row.docId || row.orderId}">${oms.t('print')}</button>
        `);
    },

    /**
     * Render top customer information
     * @param {Object} oms - Reference to OMS
     */
    renderTopCustomer(oms) {
        const topCustomerContainer = document.getElementById('topCustomerInfo');
        if (!topCustomerContainer) return;

        if (oms.data.customers.length > 0) {
            const top = oms.data.customers.reduce((prev, curr) =>
                (prev.totalOrders > curr.totalOrders) ? prev : curr
            );
            topCustomerContainer.innerHTML = `
                <div style="background: var(--light); padding: 1rem; border-radius: var(--radius);">
                    <strong>${top.name}</strong><br>
                    ${top.contact}<br>
                    <strong>${top.totalOrders} ${oms.t('ordersText')}</strong>
                </div>
            `;
        } else {
            topCustomerContainer.innerHTML = `
                <div style="background: var(--light); padding: 1rem; border-radius: var(--radius); text-align: center; color: #999;">
                    ${oms.t('noCustomersYet') || 'No customers yet'}
                </div>
            `;
        }
    },

    /**
     * Render top 10 customers list (moved from old renderDashboard)
     * @param {Object} oms - Reference to OMS
     */
    renderTop10Customers(oms) {
        const container = document.getElementById('topCustomerInfo');
        if (!container) return;

        if (oms.data.customers.length > 0) {
            // Sort customers by total orders (descending) and take top 10
            const topCustomers = [...oms.data.customers]
                .sort((a, b) => b.totalOrders - a.totalOrders)
                .slice(0, 10);

            container.innerHTML = `
                <div style="background: var(--light); padding: 1rem; border-radius: var(--radius);">
                    ${topCustomers.map((customer, index) => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; ${index < topCustomers.length - 1 ? 'border-bottom: 1px solid #e0e0e0;' : ''}">
                            <div style="flex: 1;">
                                <strong>${index + 1}. ${customer.name}</strong><br>
                                <span style="font-size: 0.875rem; color: var(--text-gray);">${customer.contact}</span>
                            </div>
                            <div style="text-align: right;">
                                <strong style="color: var(--primary); font-size: 1.125rem;">${customer.totalOrders}</strong>
                                <span style="font-size: 0.875rem; color: var(--text-gray); display: block;">${oms.t('ordersText')}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }
};

// Make globally available
if (typeof window !== 'undefined') {
    window.Dashboard = Dashboard;
}

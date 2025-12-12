/* ============================================
   ANALYTICS - Website visitor tracking, order analytics, device/location stats
   ============================================ */

/**
 * Analytics Feature Module
 *
 * Provides:
 * - Website visitor analytics (page views, sessions, cart actions)
 * - Device and location breakdown
 * - Order status analytics
 * - Event type distribution
 * - Customer analytics
 *
 * @exports Analytics
 */

export const Analytics = {
    /**
     * Render complete analytics dashboard
     * @param {Object} oms - Reference to OMS
     */
    renderAnalytics(oms) {
        const container = document.getElementById('analytics');
        const trackingData = oms.data.trackingData || [];
        const orders = oms.data.orders || [];

        // Website visitor analytics
        const pageViews = trackingData.filter(t => t.type === 'page_view').length;
        const cartActions = trackingData.filter(t => t.type === 'cart_add' || t.type === 'cart_remove').length;
        const uniqueSessions = [...new Set(trackingData.map(t => t.sessionId))].length;

        // Get device breakdown
        const devices = {};
        trackingData.forEach(t => {
            const device = t.userInfo?.device || 'Unknown';
            devices[device] = (devices[device] || 0) + 1;
        });

        // Get location breakdown
        const locations = {};
        trackingData.forEach(t => {
            const city = t.userInfo?.city || 'Unknown';
            locations[city] = (locations[city] || 0) + 1;
        });

        // Order-based analytics
        const totalOrders = orders.length;
        const confirmedOrders = orders.filter(o => o.status === 'Confirmed').length;
        const completedOrders = orders.filter(o => o.status === 'Completed').length;
        const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;

        // Get event type breakdown
        const eventTypes = {};
        orders.forEach(o => {
            const type = o.eventType || 'Other';
            eventTypes[type] = (eventTypes[type] || 0) + 1;
        });

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">${oms.t('analyticsReport')}</h2>
                </div>

                <div class="stats-grid">
                    <div class="stat-card info">
                        <div class="stat-value">${pageViews}</div>
                        <div class="stat-label">${oms.t('analytics')}</div>
                    </div>
                    <div class="stat-card warning">
                        <div class="stat-value">${uniqueSessions}</div>
                        <div class="stat-label">${oms.t('customers')}</div>
                    </div>
                    <div class="stat-card success">
                        <div class="stat-value">${cartActions}</div>
                        <div class="stat-label">${oms.t('actions')}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${trackingData.length}</div>
                        <div class="stat-label">${oms.t('totalOrders')}</div>
                    </div>
                </div>
            </div>

            <div class="card">
                <h3 class="card-title">${oms.t('analytics')}</h3>
                <div class="stats-grid">
                    ${Object.entries(devices).length > 0 ? Object.entries(devices).map(([device, count]) => `
                        <div class="stat-card">
                            <div class="stat-value">${count}</div>
                            <div class="stat-label">${device}</div>
                        </div>
                    `).join('') : `<p style="text-align: center; color: var(--text-gray); padding: 2rem;">${oms.t('noDataForRange')}</p>`}
                </div>
            </div>

            <div class="card">
                <h3 class="card-title">${oms.t('analytics')}</h3>
                <div class="stats-grid">
                    ${Object.entries(locations).length > 0 ? Object.entries(locations).slice(0, 8).map(([city, count]) => `
                        <div class="stat-card">
                            <div class="stat-value">${count}</div>
                            <div class="stat-label">${city}</div>
                        </div>
                    `).join('') : `<p style="text-align: center; color: var(--text-gray); padding: 2rem;">${oms.t('noDataForRange')}</p>`}
                </div>
            </div>

            <div class="card">
                <h3 class="card-title">${oms.t('history')}</h3>
                <div class="table-container">
                    ${trackingData.length > 0 ? `
                    <table class="table">
                        <thead>
                            <tr>
                                <th>${oms.t('readyTime')}</th>
                                <th>${oms.t('eventType')}</th>
                                <th>${oms.t('status')}</th>
                                <th>${oms.t('venue')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${trackingData.slice(0, 20).map(t => {
                                const date = t.timestamp instanceof Date ? t.timestamp : new Date(t.timestamp);
                                const formattedDate = date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                                const formattedType = (t.type || 'unknown').replace(/_/g, ' ').split(' ').map(word =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ');

                                return `
                                    <tr>
                                        <td>${formattedDate}</td>
                                        <td><span class="status-badge">${formattedType}</span></td>
                                        <td>${t.userInfo?.device || oms.t('na')}</td>
                                        <td>${t.userInfo?.city || oms.t('na')}${t.userInfo?.country ? ', ' + t.userInfo.country : ''}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                    ` : `<p style="text-align: center; color: var(--text-gray); padding: 2rem;">${oms.t('noDataForRange')}</p>`}
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">${oms.t('analytics')}</h2>
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${totalOrders}</div>
                        <div class="stat-label">${oms.t('totalOrders')}</div>
                    </div>
                    <div class="stat-card success">
                        <div class="stat-value">${confirmedOrders}</div>
                        <div class="stat-label">${oms.t('confirmedOrders')}</div>
                    </div>
                    <div class="stat-card info">
                        <div class="stat-value">${completedOrders}</div>
                        <div class="stat-label">${oms.t('completedOrders')}</div>
                    </div>
                    <div class="stat-card danger">
                        <div class="stat-value">${cancelledOrders}</div>
                        <div class="stat-label">${oms.t('cancelledOrders')}</div>
                    </div>
                </div>
            </div>

            <div class="card">
                <h3 class="card-title">${oms.t('eventType')}</h3>
                <div class="stats-grid">
                    ${Object.entries(eventTypes).length > 0 ? Object.entries(eventTypes).map(([type, count]) => `
                        <div class="stat-card">
                            <div class="stat-value">${count}</div>
                            <div class="stat-label">${type}</div>
                        </div>
                    `).join('') : `<p style="text-align: center; color: var(--text-gray); padding: 2rem;">${oms.t('noDataForRange')}</p>`}
                </div>
            </div>

            <div class="card">
                <h3 class="card-title">${oms.t('customers')}</h3>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${oms.data.customers.length}</div>
                        <div class="stat-label">${oms.t('customers')}</div>
                    </div>
                    <div class="stat-card success">
                        <div class="stat-value">${oms.data.customers.filter(c => c.totalOrders > 1).length}</div>
                        <div class="stat-label">${oms.t('customers')}</div>
                    </div>
                    <div class="stat-card warning">
                        <div class="stat-value">${oms.data.customers.filter(c => c.totalOrders === 1).length}</div>
                        <div class="stat-label">${oms.t('customers')}</div>
                    </div>
                    <div class="stat-card info">
                        <div class="stat-value">${oms.data.customers.length > 0 ? Math.round(orders.length / oms.data.customers.length * 10) / 10 : 0}</div>
                        <div class="stat-label">${oms.t('totalOrdersCount')}</div>
                    </div>
                </div>
            </div>
        `;
    }
};

// Make globally available for backward compatibility
if (typeof window !== 'undefined') {
    window.Analytics = Analytics;
}

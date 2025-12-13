/* ============================================
   FINANCIALS - Payment tracking, expenses, financial reports
   ============================================ */

/**
 * Financials Feature Module
 *
 * Provides:
 * - Financial dashboard with metrics and analytics
 * - Payment management (add, edit, delete)
 * - Expense tracking
 * - Date range filtering for financial data
 * - Credit payment reminders
 * - Financial report export
 * - Monthly comparison reports
 * - Order financial recalculation
 * - Firestore synchronization
 *
 * @exports Financials
 */

import { Utils } from '../utils/helpers.js';

export const Financials = {
    /**
     * Render main financials dashboard with metrics and data
     * @param {Object} oms - Reference to OMS
     */
    async renderFinancials(oms) {
        const container = document.getElementById('financials');
        const orders = oms.data.orders || [];
        const expenses = oms.data.expenses || [];
        const payments = oms.data.payments || [];

        // Check if user can view financials
        const canManageFinancials = await oms.canViewFinancials();

        // Initialize default date range (current month)
        const now = new Date();
        const defaultStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const defaultEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Calculate financial metrics
        const calculateFinancials = (startDate, endDate) => {
            const start = startDate ? new Date(startDate) : defaultStartDate;
            const end = endDate ? new Date(endDate) : defaultEndDate;
            end.setHours(23, 59, 59, 999); // Include the entire end date

            // Filter orders by date range
            const filteredOrders = orders.filter(o => {
                const orderDate = o.orderDate ? new Date(o.orderDate) : new Date(o.createdAt || 0);
                return orderDate >= start && orderDate <= end;
            });

            // Filter expenses by date range
            const filteredExpenses = expenses.filter(e => {
                const expenseDate = e.date ? new Date(e.date) : new Date(e.timestamp?.toDate?.() || 0);
                return expenseDate >= start && expenseDate <= end;
            });

            // Filter payments by date range
            const filteredPayments = payments.filter(p => {
                const paymentDate = p.paymentDate ? new Date(p.paymentDate) : new Date(p.timestamp?.toDate?.() || 0);
                return paymentDate >= start && paymentDate <= end;
            });

            // Calculate revenue
            const totalRevenue = filteredOrders.reduce((sum, o) => {
                const amount = parseFloat(o.financials?.grandTotal || o.totalAmount || 0);
                return sum + amount;
            }, 0);

            // Calculate payments received (filtered by date range)
            const paymentsReceived = filteredPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

            // Calculate total payments received (all time)
            const totalPaymentsReceived = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

            // Calculate outstanding dues
            const outstandingDues = filteredOrders.reduce((sum, o) => {
                const balanceDue = parseFloat(o.financials?.balanceDue || 0);
                return sum + balanceDue;
            }, 0);

            // Calculate total costs
            const directCosts = filteredOrders.reduce((sum, o) => {
                const costs = o.financials?.directCosts?.total || 0;
                return sum + parseFloat(costs);
            }, 0);

            const indirectCosts = filteredExpenses.reduce((sum, e) => {
                if (e.category !== 'Materials Purchase') {
                    return sum + parseFloat(e.amount || 0);
                }
                return sum;
            }, 0);

            const totalCosts = directCosts + indirectCosts;

            // Calculate profit (FIXED: Use actual payments received, not promised revenue)
            // Profit = Cash Received - Costs (Cash accounting method)
            const grossProfit = paymentsReceived - directCosts;
            const netProfit = paymentsReceived - totalCosts;
            const profitMargin = paymentsReceived > 0 ? ((netProfit / paymentsReceived) * 100).toFixed(2) : 0;

            return {
                totalRevenue,
                paymentsReceived,
                totalPaymentsReceived,
                outstandingDues,
                directCosts,
                indirectCosts,
                totalCosts,
                grossProfit,
                netProfit,
                profitMargin,
                ordersCount: filteredOrders.length,
                expensesCount: filteredExpenses.length,
                paymentsCount: filteredPayments.length,
                filteredOrders,
                filteredExpenses,
                filteredPayments
            };
        };

        const metrics = calculateFinancials();

        // Check if user has no financial data - might indicate permission issues
        const hasNoFinancialData = expenses.length === 0 && payments.length === 0;
        const roleSetupWarning = hasNoFinancialData ? `
            <div class="card" style="background: #fff3e0; border-left: 4px solid #ff9800; margin-bottom: 1.5rem;">
                <div style="padding: 1.5rem;">
                    <h3 style="color: #f57c00; margin: 0 0 0.5rem 0;">⚠️ No Financial Data Found</h3>
                    <p style="margin: 0.5rem 0; color: #666;">
                        If you're seeing this message and can't load expenses or payments, you might not have the proper role configured in Firestore.
                    </p>
                    <p style="margin: 0.5rem 0; color: #666;">
                        <strong>Check the browser console for permission errors.</strong>
                    </p>
                    <button onclick="OMS.showRoleSetupDialog()"
                            style="background: #ff9800; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: bold; margin-top: 1rem;">
                        🔐 Setup Your Role
                    </button>
                    <button onclick="window.location.href='setup-admin-users.html'"
                            style="background: #2196F3; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: bold; margin-top: 1rem; margin-left: 0.5rem;">
                        📖 View Setup Guide
                    </button>
                </div>
            </div>
        ` : '';

        container.innerHTML = `
            ${roleSetupWarning}
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">💰 Financial Management</h2>
                </div>

                <!-- Date Range Selector -->
                <div class="card" style="background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); color: white;">
                    <h3 style="color: white; margin-bottom: 1rem;">📅 Date Range Selection</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" style="color: white;">From Date</label>
                            <input type="date" id="finStartDate" class="form-input" value="${Utils.toDateString(defaultStartDate)}">
                        </div>
                        <div class="form-group">
                            <label class="form-label" style="color: white;">To Date</label>
                            <input type="date" id="finEndDate" class="form-input" value="${Utils.toDateString(defaultEndDate)}">
                        </div>
                    </div>
                    <div class="btn-group" style="margin-top: 1rem;">
                        <button class="btn btn-secondary" onclick="OMS.setFinancialRange('today')">📆 Today</button>
                        <button class="btn btn-secondary" onclick="OMS.setFinancialRange('week')">📆 This Week</button>
                        <button class="btn btn-secondary" onclick="OMS.setFinancialRange('month')">📆 This Month</button>
                        <button class="btn btn-secondary" onclick="OMS.setFinancialRange('quarter')">📆 This Quarter</button>
                        <button class="btn btn-secondary" onclick="OMS.setFinancialRange('year')">📆 This Year</button>
                        <button class="btn btn-success" onclick="OMS.applyFinancialRange()">🔍 Apply Range</button>
                    </div>
                </div>

                <!-- Financial Dashboard -->
                <div class="stats-grid">
                    <div class="stat-card success">
                        <div class="stat-value">₹${metrics.totalRevenue.toLocaleString('en-IN')}</div>
                        <div class="stat-label">Total Revenue</div>
                    </div>
                    <div class="stat-card info">
                        <div class="stat-value">₹${metrics.paymentsReceived.toLocaleString('en-IN')} / ₹${metrics.totalPaymentsReceived.toLocaleString('en-IN')}</div>
                        <div class="stat-label">Payments Received (Period / All Time)</div>
                    </div>
                    <div class="stat-card warning">
                        <div class="stat-value">₹${metrics.outstandingDues.toLocaleString('en-IN')}</div>
                        <div class="stat-label">Outstanding Dues</div>
                    </div>
                    <div class="stat-card danger">
                        <div class="stat-value">₹${metrics.totalCosts.toLocaleString('en-IN')}</div>
                        <div class="stat-label">Total Costs</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">₹${metrics.directCosts.toLocaleString('en-IN')}</div>
                        <div class="stat-label">Direct Costs</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">₹${metrics.indirectCosts.toLocaleString('en-IN')}</div>
                        <div class="stat-label">Indirect/Overhead Costs</div>
                    </div>
                    <div class="stat-card ${metrics.grossProfit >= 0 ? 'success' : 'danger'}">
                        <div class="stat-value">₹${metrics.grossProfit.toLocaleString('en-IN')}</div>
                        <div class="stat-label">Gross Profit</div>
                    </div>
                    <div class="stat-card ${metrics.netProfit >= 0 ? 'success' : 'danger'}">
                        <div class="stat-value">₹${metrics.netProfit.toLocaleString('en-IN')}</div>
                        <div class="stat-label">Net Profit</div>
                    </div>
                    <div class="stat-card ${metrics.profitMargin >= 20 ? 'success' : metrics.profitMargin >= 10 ? 'warning' : 'danger'}">
                        <div class="stat-value">${metrics.profitMargin}%</div>
                        <div class="stat-label">Profit Margin</div>
                    </div>
                    <div class="stat-card info">
                        <div class="stat-value">${metrics.ordersCount}</div>
                        <div class="stat-label">Orders</div>
                    </div>
                    <div class="stat-card warning">
                        <div class="stat-value">${metrics.paymentsCount} / ${payments.length}</div>
                        <div class="stat-label">Payments (Period / Total)</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${metrics.expensesCount} / ${expenses.length}</div>
                        <div class="stat-label">Expenses (Period / Total)</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="btn-group">
                    ${canManageFinancials ? `
                        <button class="btn btn-success" onclick="OMS.showAddPaymentModal()">💵 Add Payment</button>
                        <button class="btn btn-warning" onclick="OMS.showAddExpenseModal()">💸 Add Expense</button>
                    ` : ''}
                    <button class="btn btn-info" onclick="OMS.exportFinancialReport()">📊 Export Report</button>
                    <button class="btn btn-primary" onclick="OMS.showMonthlyComparison()">📈 Monthly Comparison</button>
                </div>
            </div>

            <!-- Payments Section -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">💵 Payment History</h3>
                </div>
                <div class="table-container">
                    ${payments.length > 0 ? `
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Payment Type</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Transaction ID</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${payments.slice(0, 50).map(p => {
                                    const hasBreakdown = p.itemBreakdown && p.itemBreakdown.length > 0;
                                    const paymentTypeDisplay = p.paymentType || 'N/A';
                                    return `
                                    <tr>
                                        <td>${Utils.formatDate(p.paymentDate || p.timestamp?.toDate?.())}</td>
                                        <td>${p.orderId || 'N/A'}</td>
                                        <td>${p.customerName || 'N/A'}</td>
                                        <td><strong>${paymentTypeDisplay}</strong></td>
                                        <td>
                                            ₹${parseFloat(p.amount || 0).toLocaleString('en-IN')}
                                            ${hasBreakdown ? '<br><button class="btn btn-info btn-small" style="margin-top: 0.25rem;" onclick="OMS.togglePaymentBreakdown(\'' + p.id + '\')">📋 View Details</button>' : ''}
                                        </td>
                                        <td>${p.paymentMethod || 'N/A'}</td>
                                        <td>${p.transactionId || 'N/A'}</td>
                                        <td>
                                            ${canManageFinancials ? `
                                                <button class="btn btn-info btn-small" onclick="OMS.editPayment('${p.id}')">Edit</button>
                                                <button class="btn btn-danger btn-small" onclick="OMS.deletePayment('${p.id}')">Delete</button>
                                            ` : '<span style="color: var(--text-gray); font-style: italic;">View Only</span>'}
                                        </td>
                                    </tr>
                                    ${hasBreakdown ? `
                                    <tr id="breakdown_${p.id}" style="display: none; background: #f5f5f5;">
                                        <td colspan="8" style="padding: 1rem;">
                                            <div style="background: white; padding: 1rem; border-radius: 8px; border: 2px solid #667eea;">
                                                <h4 style="margin: 0 0 1rem 0; color: #667eea;">📋 Item-wise Breakdown</h4>
                                                <table style="width: 100%; border-collapse: collapse;">
                                                    <thead>
                                                        <tr style="background: #f0f0f0;">
                                                            <th style="padding: 0.5rem; text-align: left; border: 1px solid #ddd;">Item Name</th>
                                                            <th style="padding: 0.5rem; text-align: center; border: 1px solid #ddd;">Quantity</th>
                                                            <th style="padding: 0.5rem; text-align: right; border: 1px solid #ddd;">Price/Unit</th>
                                                            <th style="padding: 0.5rem; text-align: right; border: 1px solid #ddd;">Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        ${p.itemBreakdown.map(item => `
                                                            <tr>
                                                                <td style="padding: 0.5rem; border: 1px solid #ddd;">${item.itemName}</td>
                                                                <td style="padding: 0.5rem; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
                                                                <td style="padding: 0.5rem; text-align: right; border: 1px solid #ddd;">₹${parseFloat(item.pricePerUnit).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                                                <td style="padding: 0.5rem; text-align: right; border: 1px solid #ddd; font-weight: bold;">₹${parseFloat(item.itemTotal).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                                            </tr>
                                                        `).join('')}
                                                        <tr style="background: #e8eaf6; font-weight: bold;">
                                                            <td colspan="3" style="padding: 0.75rem; text-align: right; border: 1px solid #ddd;">Grand Total:</td>
                                                            <td style="padding: 0.75rem; text-align: right; border: 1px solid #ddd; font-size: 1.1em; color: #667eea;">₹${parseFloat(p.amount).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </td>
                                    </tr>
                                    ` : ''}
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    ` : `<p style="text-align: center; padding: 2rem; color: var(--text-gray);">No payment records found. Click "Add Payment" to get started.</p>`}
                </div>
            </div>

            <!-- Expenses Section -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">💸 Expenses</h3>
                </div>
                <div class="table-container">
                    ${expenses.length > 0 ? `
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Category</th>
                                    <th>Description</th>
                                    <th>Vendor</th>
                                    <th>Amount</th>
                                    <th>Payment Method</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${expenses.slice(0, 50).map(e => `
                                    <tr>
                                        <td>${Utils.formatDate(e.date || e.timestamp?.toDate?.())}</td>
                                        <td>${e.category || 'N/A'}</td>
                                        <td>${e.description || 'N/A'}</td>
                                        <td>${e.vendor || 'N/A'}</td>
                                        <td>₹${parseFloat(e.amount || 0).toLocaleString('en-IN')}</td>
                                        <td>${e.paymentMethod || 'N/A'}</td>
                                        <td>
                                            ${canManageFinancials ? `
                                                <button class="btn btn-info btn-small" onclick="OMS.editExpense('${e.id}')">Edit</button>
                                                <button class="btn btn-danger btn-small" onclick="OMS.deleteExpense('${e.id}')">Delete</button>
                                            ` : '<span style="color: var(--text-gray); font-style: italic;">View Only</span>'}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : `<p style="text-align: center; padding: 2rem; color: var(--text-gray);">No expense records found. Click "Add Expense" to get started.</p>`}
                </div>
            </div>
        `;
    },

    /**
     * Set financial date range preset
     * @param {Object} oms - Reference to OMS
     * @param {string} range - Range preset (today, week, month, quarter, year)
     */
    setFinancialRange(oms, range) {
        const now = new Date();
        let startDate, endDate;

        switch(range) {
            case 'today':
                startDate = endDate = now;
                break;
            case 'week':
                startDate = new Date(now.setDate(now.getDate() - now.getDay()));
                endDate = new Date(now.setDate(startDate.getDate() + 6));
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
                endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31);
                break;
        }

        Utils.set('finStartDate', Utils.toDateString(startDate));
        Utils.set('finEndDate', Utils.toDateString(endDate));
    },

    /**
     * Apply selected financial date range filter
     * @param {Object} oms - Reference to OMS
     */
    applyFinancialRange(oms) {
        this.renderFinancials(oms);
    },

    /**
     * Show add payment modal
     * @param {Object} oms - Reference to OMS
     */
    async showAddPaymentModal(oms) {
        const orders = oms.data.orders.filter(o => o.status !== 'Cancelled');
        console.log(`💳 Opening payment modal with ${orders.length} active orders`);

        const modalHTML = `
            <div class="modal show" id="paymentModal" onclick="if(event.target === this) OMS.closeModal('paymentModal')">
                <div class="modal-content" style="max-width: 800px;">
                    <button class="modal-close" onclick="OMS.closeModal('paymentModal')">×</button>
                    <h2>💵 Add Payment</h2>
                    <form id="paymentForm" onsubmit="OMS.savePayment(event)" style="display: block;">
                        <div class="form-group" style="margin-bottom: 1.5rem;">
                            <label class="form-label required">Select Order</label>
                            <select id="paymentOrderId" class="form-select" required onchange="OMS.loadOrderForPayment()" style="width: 100%; padding: 0.75rem; font-size: 1rem;">
                                <option value="">Choose an order...</option>
                                ${orders.map(o => {
                                    const orderTotal = parseFloat(o.financials?.grandTotal || o.totalAmount || 0);
                                    const balanceDue = parseFloat(o.financials?.balanceDue || orderTotal);
                                    const displayText = `${o.orderId || 'Pending'} - ${o.clientName} (Balance: ₹${balanceDue.toLocaleString('en-IN')})`;
                                    return `<option value="${o.docId || o.orderId}">${displayText}</option>`;
                                }).join('')}
                            </select>
                        </div>

                        <!-- Order Details Section (hidden until order selected) -->
                        <div id="orderDetailsSection" style="display: none;">
                            <div class="card" style="background: #f5f5f5; padding: 1rem; margin-bottom: 1rem;">
                                <h3 style="margin: 0 0 1rem 0;">Order Summary</h3>
                                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1rem;">
                                    <div>
                                        <label style="font-size: 0.85rem; color: #666;">Order Total</label>
                                        <div style="font-size: 1.25rem; font-weight: bold; color: #2196F3;">₹<span id="displayOrderTotal">0</span></div>
                                    </div>
                                    <div>
                                        <label style="font-size: 0.85rem; color: #666;">Already Paid</label>
                                        <div style="font-size: 1.25rem; font-weight: bold; color: #4caf50;">₹<span id="displayAlreadyPaid">0</span></div>
                                    </div>
                                    <div>
                                        <label style="font-size: 0.85rem; color: #666;">Pending Amount</label>
                                        <div style="font-size: 1.25rem; font-weight: bold; color: #f44336;">₹<span id="displayPendingAmount">0</span></div>
                                    </div>
                                </div>

                                <!-- Previous Payments -->
                                <div id="previousPaymentsSection" style="display: none; margin-top: 1rem; padding-top: 1rem; border-top: 2px solid #ddd;">
                                    <h4 style="margin: 0 0 0.75rem 0; color: #667eea;">📜 Previous Payments</h4>
                                    <div id="previousPaymentsList" style="max-height: 200px; overflow-y: auto;"></div>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label required">Payment Date</label>
                                    <input type="date" id="paymentDate" class="form-input" value="${Utils.toDateString(new Date())}" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label required">Amount (₹)</label>
                                    <input type="number" id="paymentAmount" class="form-input" min="0" step="0.01" required oninput="OMS.updateRemainingAfterNewPayment()">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label required">Payment Method</label>
                                    <select id="paymentMethod" class="form-select" required>
                                        <option value="Cash">Cash</option>
                                        <option value="UPI">UPI</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Cheque">Cheque</option>
                                        <option value="Card">Card</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Transaction ID</label>
                                    <input type="text" id="paymentTransactionId" class="form-input" placeholder="Optional">
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Notes</label>
                                <textarea id="paymentNotes" class="form-input" rows="2" placeholder="Optional payment notes"></textarea>
                            </div>

                            <!-- Remaining Balance After Payment -->
                            <div class="card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem; margin-top: 1rem;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: 1rem;">💰 Balance After This Payment:</span>
                                    <span id="newRemainingBalance" style="font-size: 1.5rem; font-weight: bold;">₹0</span>
                                </div>
                            </div>
                        </div>

                        <div class="btn-group" style="margin-top: 1.5rem;">
                            <button type="submit" class="btn btn-success">💾 Save Payment</button>
                            <button type="button" class="btn btn-secondary" onclick="OMS.closeModal('paymentModal')">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('modalsContainer').innerHTML = modalHTML;
    },

    /**
     * Load order data for payment modal
     * @param {Object} oms - Reference to OMS
     */
    async loadOrderForPayment(oms) {
        const orderId = Utils.get('paymentOrderId');
        if (!orderId) {
            document.getElementById('orderDetailsSection').style.display = 'none';
            return;
        }

        const order = oms.data.orders.find(o => (o.docId || o.orderId) === orderId);
        if (!order) {
            console.error('Order not found:', orderId);
            return;
        }

        console.log('📦 Loading order for payment:', order);

        // Store order reference globally for later use
        window.currentPaymentOrder = order;

        // Calculate order totals
        const orderTotal = parseFloat(order.financials?.grandTotal || order.totalAmount || 0);
        const alreadyPaid = parseFloat(order.financials?.advancePaid || 0);
        const balanceDue = parseFloat(order.financials?.balanceDue || orderTotal - alreadyPaid);

        // Display summary
        document.getElementById('displayOrderTotal').textContent = orderTotal.toLocaleString('en-IN');
        document.getElementById('displayAlreadyPaid').textContent = alreadyPaid.toLocaleString('en-IN');
        document.getElementById('displayPendingAmount').textContent = balanceDue.toLocaleString('en-IN');

        // Get and display previous payments
        console.log('🔍 Checking payments for order:', { orderDocId: order.docId, orderId: order.orderId });
        console.log('🔍 Total payments in system:', oms.data.payments.length);

        const previousPayments = oms.data.payments.filter(p => p.orderDocId === order.docId || p.orderId === order.orderId);
        console.log('🔍 Filtered payments for this order:', previousPayments.length);

        if (previousPayments.length > 0) {
            const paymentsHTML = previousPayments.map(p => `
                <div style="padding: 0.75rem 0; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                    <div style="flex: 1;">
                        <div style="margin-bottom: 0.25rem;">
                            <strong style="color: #1976d2;">${Utils.formatDate(p.paymentDate)}</strong>:
                            <span style="font-weight: bold; color: #4caf50;">₹${parseFloat(p.amount).toLocaleString('en-IN')}</span>
                        </div>
                        <div style="font-size: 0.85rem; color: #666;">
                            ${p.paymentMethod}${p.transactionId ? ` - ${p.transactionId}` : ''}${p.notes ? ` - ${p.notes}` : ''}
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">
                        <button class="btn btn-warning btn-small" onclick="OMS.editPayment('${p.id}')" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" title="Edit payment">✏️ Edit</button>
                        <button class="btn btn-danger btn-small" onclick="OMS.deletePayment('${p.id}')" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" title="Delete payment">🗑️ Delete</button>
                    </div>
                </div>
            `).join('');
            document.getElementById('previousPaymentsList').innerHTML = paymentsHTML;
            document.getElementById('previousPaymentsSection').style.display = 'block';
        } else {
            document.getElementById('previousPaymentsSection').style.display = 'none';
        }

        // Store current balance for calculation
        window.currentOrderBalance = balanceDue;

        document.getElementById('orderDetailsSection').style.display = 'block';
        console.log('✅ Order loaded for payment');
    },

    /**
     * Update remaining balance after new payment
     * @param {Object} oms - Reference to OMS
     */
    updateRemainingAfterNewPayment(oms) {
        const paymentAmount = parseFloat(document.getElementById('paymentAmount')?.value) || 0;
        const currentBalance = window.currentOrderBalance || 0;
        const newBalance = Math.max(0, currentBalance - paymentAmount);

        const newRemainingElement = document.getElementById('newRemainingBalance');
        if (newRemainingElement) {
            newRemainingElement.textContent = `₹${newBalance.toLocaleString('en-IN')}`;

            // Change color based on payment status
            if (newBalance === 0) {
                newRemainingElement.style.color = '#4caf50'; // Green - Fully paid
            } else if (newBalance < currentBalance) {
                newRemainingElement.style.color = '#ff9800'; // Orange - Partial payment
            } else {
                newRemainingElement.style.color = '#f44336'; // Red - No payment or overpayment
            }
        }
    },

    /**
     * Save new payment
     * @param {Object} oms - Reference to OMS
     * @param {Event} event - Form submit event
     */
    async savePayment(oms, event) {
        event.preventDefault();

        const orderId = Utils.get('paymentOrderId');
        const order = oms.data.orders.find(o => (o.docId || o.orderId) === orderId);

        if (!order) {
            oms.showToast('Order not found!', 'error');
            return;
        }

        const paymentAmount = parseFloat(Utils.get('paymentAmount'));
        if (!paymentAmount || paymentAmount <= 0) {
            oms.showToast('Please enter a valid payment amount!', 'error');
            return;
        }

        const paymentDate = Utils.get('paymentDate');

        // Calculate current order financials
        const orderTotal = parseFloat(order.financials?.grandTotal || order.totalAmount || 0);
        const alreadyPaid = parseFloat(order.financials?.advancePaid || 0);
        const currentBalance = parseFloat(order.financials?.balanceDue || orderTotal);
        const newBalance = Math.max(0, currentBalance - paymentAmount);
        const totalPaid = alreadyPaid + paymentAmount;

        // Calculate credit due date (1 month after event date)
        let creditDueDate = null;
        if (newBalance > 0) {
            const eventDate = new Date(order.isMultiDay ? order.endDate : order.date);
            creditDueDate = new Date(eventDate);
            creditDueDate.setMonth(creditDueDate.getMonth() + 1);
            creditDueDate = Utils.toDateString(creditDueDate);
        }

        const payment = {
            orderId: order.orderId || 'Pending',
            orderDocId: order.docId,
            customerName: order.clientName,
            eventDate: order.isMultiDay ? order.endDate : order.date,
            amount: paymentAmount,
            orderTotal: orderTotal,
            totalPaid: totalPaid,
            remainingBalance: newBalance,
            paymentDate: paymentDate,
            paymentMethod: Utils.get('paymentMethod'),
            transactionId: Utils.get('paymentTransactionId'),
            notes: Utils.get('paymentNotes'),
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            createdAt: new Date().toISOString()
        };

        try {
            // Save payment to Firestore
            const docRef = await window.db.collection('payments').add(payment);
            payment.id = docRef.id;

            // Update order financials in Firestore
            const updateData = {
                'financials.advancePaid': totalPaid,
                'financials.balanceDue': newBalance,
                'financials.paymentStatus': newBalance <= 0 ? 'paid' : newBalance < orderTotal ? 'partial' : 'pending',
                'financials.lastPaymentDate': paymentDate
            };

            // Add credit due date only if balance remains
            if (creditDueDate) {
                updateData['financials.creditDueDate'] = creditDueDate;
            }

            await window.db.collection('orders').doc(order.docId).update(updateData);

            oms.showToast('✅ Payment recorded successfully!', 'success');
            oms.closeModal('paymentModal');

            // Reload orders from Firestore to ensure data consistency
            await oms.loadOrdersFromFirestore();

            // Now update displays with fresh data
            this.renderFinancials(oms);
            if (oms.currentTab === 'history') {
                oms.renderHistory();
            }
        } catch (error) {
            console.error('Error saving payment:', error);
            oms.showToast('Error saving payment: ' + error.message, 'error');
        }
    },

    /**
     * Toggle payment breakdown visibility
     * @param {Object} oms - Reference to OMS
     * @param {string} paymentId - Payment ID
     */
    togglePaymentBreakdown(oms, paymentId) {
        const breakdownRow = document.getElementById(`breakdown_${paymentId}`);
        if (breakdownRow) {
            if (breakdownRow.style.display === 'none') {
                breakdownRow.style.display = 'table-row';
            } else {
                breakdownRow.style.display = 'none';
            }
        }
    },

    /**
     * Delete payment record
     * @param {Object} oms - Reference to OMS
     * @param {string} paymentId - Payment ID to delete
     */
    async deletePayment(oms, paymentId) {
        const payment = oms.data.payments.find(p => p.id === paymentId);
        if (!payment) {
            oms.showToast('Payment not found!', 'error');
            return;
        }

        if (!confirm(`Delete payment of ₹${parseFloat(payment.amount).toLocaleString('en-IN')} dated ${Utils.formatDate(payment.paymentDate)}?`)) {
            return;
        }

        try {
            // Delete payment from Firestore
            await window.db.collection('payments').doc(paymentId).delete();
            console.log('✅ Payment deleted from Firestore');

            // Recalculate order financials
            const order = oms.data.orders.find(o => o.docId === payment.orderDocId || o.orderId === payment.orderId);
            if (order) {
                // Get all remaining payments for this order (excluding the deleted one)
                const remainingPayments = oms.data.payments.filter(p =>
                    p.id !== paymentId && (p.orderDocId === order.docId || p.orderId === order.orderId)
                );

                // Calculate new totals
                const orderTotal = parseFloat(order.financials?.grandTotal || order.totalAmount || 0);
                const newTotalPaid = remainingPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
                const newBalance = orderTotal - newTotalPaid;

                // Calculate credit due date if balance remains
                let creditDueDate = null;
                if (newBalance > 0) {
                    const eventDate = new Date(order.isMultiDay ? order.endDate : order.date);
                    creditDueDate = new Date(eventDate);
                    creditDueDate.setMonth(creditDueDate.getMonth() + 1);
                    creditDueDate = Utils.toDateString(creditDueDate);
                }

                // Update order financials in Firestore
                const updateData = {
                    'financials.advancePaid': newTotalPaid,
                    'financials.balanceDue': newBalance,
                    'financials.paymentStatus': newBalance <= 0 ? 'paid' : newBalance < orderTotal ? 'partial' : 'pending'
                };

                if (creditDueDate) {
                    updateData['financials.creditDueDate'] = creditDueDate;
                } else {
                    // Remove credit due date if fully paid
                    updateData['financials.creditDueDate'] = firebase.firestore.FieldValue.delete();
                }

                // Update last payment date if there are remaining payments
                if (remainingPayments.length > 0) {
                    const lastPayment = remainingPayments.reduce((latest, p) =>
                        new Date(p.paymentDate) > new Date(latest.paymentDate) ? p : latest
                    );
                    updateData['financials.lastPaymentDate'] = lastPayment.paymentDate;
                } else {
                    updateData['financials.lastPaymentDate'] = firebase.firestore.FieldValue.delete();
                }

                await window.db.collection('orders').doc(order.docId).update(updateData);
                console.log('✅ Order financials updated after payment deletion');
            }

            oms.showToast('✅ Payment deleted successfully!', 'success');

            // Reload data from Firestore
            await oms.loadPaymentsFromFirestore();
            await oms.loadOrdersFromFirestore();

            // Refresh the payment modal if open
            if (window.currentPaymentOrder) {
                await this.loadOrderForPayment(oms);
            }

            // Update all displays
            this.renderFinancials(oms);
            if (oms.currentTab === 'history') {
                oms.renderHistory();
            }
        } catch (error) {
            console.error('Error deleting payment:', error);
            oms.showToast('Error deleting payment: ' + error.message, 'error');
        }
    },

    /**
     * Edit payment record
     * @param {Object} oms - Reference to OMS
     * @param {string} paymentId - Payment ID to edit
     */
    async editPayment(oms, paymentId) {
        const payment = oms.data.payments.find(p => p.id === paymentId);
        if (!payment) {
            oms.showToast('Payment not found!', 'error');
            return;
        }

        const order = oms.data.orders.find(o => o.docId === payment.orderDocId || o.orderId === payment.orderId);

        const modalHTML = `
            <div class="modal show" id="editPaymentModal" onclick="if(event.target === this) OMS.closeModal('editPaymentModal')">
                <div class="modal-content" style="max-width: 600px;">
                    <button class="modal-close" onclick="OMS.closeModal('editPaymentModal')">×</button>
                    <h2>✏️ Edit Payment</h2>
                    <form id="editPaymentForm" onsubmit="OMS.saveEditedPayment(event, '${paymentId}')" style="display: block;">
                        <div class="form-group">
                            <label class="form-label">Order</label>
                            <input type="text" class="form-input" value="${order ? (order.orderId || 'Pending') + ' - ' + order.clientName : 'Unknown'}" readonly style="background: #f5f5f5;">
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label required">Payment Date</label>
                                <input type="date" id="editPaymentDate" class="form-input" value="${payment.paymentDate}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label required">Amount (₹)</label>
                                <input type="number" id="editPaymentAmount" class="form-input" value="${payment.amount}" min="0" step="0.01" required>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label required">Payment Method</label>
                                <select id="editPaymentMethod" class="form-select" required>
                                    <option value="Cash" ${payment.paymentMethod === 'Cash' ? 'selected' : ''}>Cash</option>
                                    <option value="UPI" ${payment.paymentMethod === 'UPI' ? 'selected' : ''}>UPI</option>
                                    <option value="Bank Transfer" ${payment.paymentMethod === 'Bank Transfer' ? 'selected' : ''}>Bank Transfer</option>
                                    <option value="Cheque" ${payment.paymentMethod === 'Cheque' ? 'selected' : ''}>Cheque</option>
                                    <option value="Card" ${payment.paymentMethod === 'Card' ? 'selected' : ''}>Card</option>
                                    <option value="Other" ${payment.paymentMethod === 'Other' ? 'selected' : ''}>Other</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Transaction ID</label>
                                <input type="text" id="editPaymentTransactionId" class="form-input" value="${payment.transactionId || ''}" placeholder="Optional">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Notes</label>
                            <textarea id="editPaymentNotes" class="form-input" rows="3" placeholder="Optional notes">${payment.notes || ''}</textarea>
                        </div>

                        <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                            <button type="submit" class="btn btn-primary" style="flex: 1;">💾 Save Changes</button>
                            <button type="button" class="btn btn-secondary" onclick="OMS.closeModal('editPaymentModal')" style="flex: 1;">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('modalsContainer').innerHTML = modalHTML;
    },

    /**
     * Save edited payment
     * @param {Object} oms - Reference to OMS
     * @param {Event} event - Form submit event
     * @param {string} paymentId - Payment ID to update
     */
    async saveEditedPayment(oms, event, paymentId) {
        event.preventDefault();

        const payment = oms.data.payments.find(p => p.id === paymentId);
        if (!payment) {
            oms.showToast('Payment not found!', 'error');
            return;
        }

        const oldAmount = parseFloat(payment.amount);
        const newAmount = parseFloat(Utils.get('editPaymentAmount'));

        if (!newAmount || newAmount <= 0) {
            oms.showToast('Please enter a valid payment amount!', 'error');
            return;
        }

        try {
            // Update payment in Firestore
            const updateData = {
                amount: newAmount,
                paymentDate: Utils.get('editPaymentDate'),
                paymentMethod: Utils.get('editPaymentMethod'),
                transactionId: Utils.get('editPaymentTransactionId') || '',
                notes: Utils.get('editPaymentNotes') || ''
            };

            await window.db.collection('payments').doc(paymentId).update(updateData);
            console.log('✅ Payment updated in Firestore');

            // If amount changed, recalculate order financials
            if (oldAmount !== newAmount) {
                const order = oms.data.orders.find(o => o.docId === payment.orderDocId || o.orderId === payment.orderId);
                if (order) {
                    // Reload payments to get fresh data
                    await oms.loadPaymentsFromFirestore();

                    // Get all payments for this order
                    const orderPayments = oms.data.payments.filter(p =>
                        p.orderDocId === order.docId || p.orderId === order.orderId
                    );

                    // Calculate new totals
                    const orderTotal = parseFloat(order.financials?.grandTotal || order.totalAmount || 0);
                    const totalPaid = orderPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
                    const newBalance = orderTotal - totalPaid;

                    // Calculate credit due date if balance remains
                    let creditDueDate = null;
                    if (newBalance > 0) {
                        const eventDate = new Date(order.isMultiDay ? order.endDate : order.date);
                        creditDueDate = new Date(eventDate);
                        creditDueDate.setMonth(creditDueDate.getMonth() + 1);
                        creditDueDate = Utils.toDateString(creditDueDate);
                    }

                    // Update order financials
                    const orderUpdateData = {
                        'financials.advancePaid': totalPaid,
                        'financials.balanceDue': newBalance,
                        'financials.paymentStatus': newBalance <= 0 ? 'paid' : newBalance < orderTotal ? 'partial' : 'pending'
                    };

                    if (creditDueDate) {
                        orderUpdateData['financials.creditDueDate'] = creditDueDate;
                    } else {
                        orderUpdateData['financials.creditDueDate'] = firebase.firestore.FieldValue.delete();
                    }

                    await window.db.collection('orders').doc(order.docId).update(orderUpdateData);
                    console.log('✅ Order financials updated after payment edit');
                }
            }

            oms.showToast('✅ Payment updated successfully!', 'success');
            oms.closeModal('editPaymentModal');

            // Reload data
            await oms.loadPaymentsFromFirestore();
            await oms.loadOrdersFromFirestore();

            // Refresh displays
            this.renderFinancials(oms);
            if (oms.currentTab === 'history') {
                oms.renderHistory();
            }

            // Refresh payment modal if open
            if (window.currentPaymentOrder) {
                await this.loadOrderForPayment(oms);
            }
        } catch (error) {
            console.error('Error updating payment:', error);
            oms.showToast('Error updating payment: ' + error.message, 'error');
        }
    },

    /**
     * Recalculate order financial data from payment records
     * @param {Object} oms - Reference to OMS
     * @param {string} orderDocId - Order document ID
     */
    async recalculateOrderFinancials(oms, orderDocId) {
        if (!orderDocId) {
            oms.showToast('Order ID is required', 'error');
            return;
        }

        try {
            console.log('🔄 Recalculating financials for order:', orderDocId);

            // Get all payments for this order from Firestore
            const paymentsSnapshot = await window.db.collection('payments')
                .where('orderDocId', '==', orderDocId)
                .get();

            const orderPayments = [];
            paymentsSnapshot.forEach(doc => {
                orderPayments.push({ id: doc.id, ...doc.data() });
            });

            console.log(`📊 Found ${orderPayments.length} payment records for this order`);

            // Calculate total paid from actual payment records
            const totalPaid = orderPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

            // Get order data
            const order = oms.data.orders.find(o => o.docId === orderDocId);
            if (!order) {
                oms.showToast('Order not found', 'error');
                return;
            }

            const orderTotal = parseFloat(order.financials?.grandTotal || order.totalAmount || 0);
            const newBalance = orderTotal - totalPaid;

            // Calculate credit due date if balance remains
            let creditDueDate = null;
            if (newBalance > 0) {
                const eventDate = new Date(order.isMultiDay ? order.endDate : order.date);
                creditDueDate = new Date(eventDate);
                creditDueDate.setMonth(creditDueDate.getMonth() + 1);
                creditDueDate = Utils.toDateString(creditDueDate);
            }

            // Update order financials in Firestore
            const updateData = {
                'financials.advancePaid': totalPaid,
                'financials.balanceDue': newBalance,
                'financials.paymentStatus': newBalance <= 0 ? 'paid' : newBalance < orderTotal ? 'partial' : 'pending'
            };

            if (creditDueDate) {
                updateData['financials.creditDueDate'] = creditDueDate;
            } else {
                updateData['financials.creditDueDate'] = firebase.firestore.FieldValue.delete();
            }

            // Update last payment date if there are payments
            if (orderPayments.length > 0) {
                const lastPayment = orderPayments.reduce((latest, p) =>
                    new Date(p.paymentDate) > new Date(latest.paymentDate) ? p : latest
                );
                updateData['financials.lastPaymentDate'] = lastPayment.paymentDate;
            } else {
                updateData['financials.lastPaymentDate'] = firebase.firestore.FieldValue.delete();
            }

            await window.db.collection('orders').doc(orderDocId).update(updateData);

            console.log('✅ Order financials recalculated successfully');
            console.log(`   Total Paid: ₹${totalPaid.toLocaleString('en-IN')}`);
            console.log(`   Balance Due: ₹${newBalance.toLocaleString('en-IN')}`);

            oms.showToast(`✅ Financials updated! Total Paid: ₹${totalPaid.toLocaleString('en-IN')}, Balance: ₹${newBalance.toLocaleString('en-IN')}`, 'success');

            // Reload data
            await oms.loadOrdersFromFirestore();

            // Refresh the payment modal if open
            if (window.currentPaymentOrder) {
                await this.loadOrderForPayment(oms);
            }

            // Update all displays
            this.renderFinancials(oms);
            if (oms.currentTab === 'history') {
                oms.renderHistory();
            }
        } catch (error) {
            console.error('Error recalculating order financials:', error);
            oms.showToast('Error: ' + error.message, 'error');
        }
    },

    /**
     * Quick add payment for specific order
     * @param {Object} oms - Reference to OMS
     * @param {string} orderId - Order ID
     */
    async addPaymentForOrder(oms, orderId) {
        // Open payment modal with pre-selected order
        await this.showAddPaymentModal(oms);

        // Wait for modal to be fully rendered in DOM
        setTimeout(() => {
            const selectElement = document.getElementById('paymentOrderId');
            if (selectElement) {
                selectElement.value = orderId;
                // Trigger change event and load order details
                selectElement.dispatchEvent(new Event('change'));
                this.loadOrderForPayment(oms);
            } else {
                console.error('❌ Payment order select element not found!');
            }
        }, 100);
    },

    /**
     * Show add expense modal
     * @param {Object} oms - Reference to OMS
     */
    async showAddExpenseModal(oms) {
        const modalHTML = `
            <div class="modal show" id="expenseModal" onclick="if(event.target === this) OMS.closeModal('expenseModal')">
                <div class="modal-content" style="max-width: 600px;">
                    <button class="modal-close" onclick="OMS.closeModal('expenseModal')">×</button>
                    <h2>💸 Add Expense</h2>
                    <form id="expenseForm" onsubmit="OMS.saveExpense(event)">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label required">Date</label>
                                <input type="date" id="expenseDate" class="form-input" value="${Utils.toDateString(new Date())}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label required">Amount</label>
                                <input type="number" id="expenseAmount" class="form-input" min="1" step="0.01" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label required">Category</label>
                                <select id="expenseCategory" class="form-select" required>
                                    <option value="Materials Purchase">Materials Purchase</option>
                                    <option value="Salaries & Wages">Salaries & Wages</option>
                                    <option value="Transportation & Fuel">Transportation & Fuel</option>
                                    <option value="Equipment Maintenance">Equipment Maintenance</option>
                                    <option value="Rent & Utilities">Rent & Utilities</option>
                                    <option value="Marketing & Advertising">Marketing & Advertising</option>
                                    <option value="Office Supplies">Office Supplies</option>
                                    <option value="Insurance">Insurance</option>
                                    <option value="Taxes & Licenses">Taxes & Licenses</option>
                                    <option value="Miscellaneous">Miscellaneous</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Vendor/Supplier</label>
                                <input type="text" id="expenseVendor" class="form-input">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label required">Description</label>
                            <input type="text" id="expenseDescription" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Payment Method</label>
                            <select id="expensePaymentMethod" class="form-select">
                                <option value="Cash">Cash</option>
                                <option value="UPI">UPI</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Cheque">Cheque</option>
                                <option value="Card">Card</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="btn-group">
                            <button type="submit" class="btn btn-success">💾 Save Expense</button>
                            <button type="button" class="btn btn-secondary" onclick="OMS.closeModal('expenseModal')">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('modalsContainer').innerHTML = modalHTML;
    },

    /**
     * Save new expense
     * @param {Object} oms - Reference to OMS
     * @param {Event} event - Form submit event
     */
    async saveExpense(oms, event) {
        event.preventDefault();

        const expense = {
            date: Utils.get('expenseDate'),
            amount: parseFloat(Utils.get('expenseAmount')),
            category: Utils.get('expenseCategory'),
            vendor: Utils.get('expenseVendor'),
            description: Utils.get('expenseDescription'),
            paymentMethod: Utils.get('expensePaymentMethod'),
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            const docRef = await window.db.collection('expenses').add(expense);
            expense.id = docRef.id;
            oms.data.expenses.push(expense);

            oms.showToast('Expense added successfully!', 'success');
            oms.closeModal('expenseModal');
            this.renderFinancials(oms);
        } catch (error) {
            console.error('Error saving expense:', error);
            oms.showToast('Error saving expense: ' + error.message, 'error');
        }
    },

    /**
     * Delete expense record
     * @param {Object} oms - Reference to OMS
     * @param {string} expenseId - Expense ID to delete
     */
    async deleteExpense(oms, expenseId) {
        if (!confirm('Are you sure you want to delete this expense record?')) return;

        try {
            await window.db.collection('expenses').doc(expenseId).delete();
            oms.data.expenses = oms.data.expenses.filter(e => e.id !== expenseId);
            oms.showToast('Expense deleted!', 'success');
            this.renderFinancials(oms);
        } catch (error) {
            console.error('Error deleting expense:', error);
            oms.showToast('Error deleting expense: ' + error.message, 'error');
        }
    },

    /**
     * Edit expense record
     * @param {Object} oms - Reference to OMS
     * @param {string} expenseId - Expense ID to edit
     */
    async editExpense(oms, expenseId) {
        const expense = oms.data.expenses.find(e => e.id === expenseId);
        if (!expense) {
            oms.showToast('Expense not found!', 'error');
            return;
        }

        const modalHTML = `
            <div class="modal show" id="editExpenseModal" onclick="if(event.target === this) OMS.closeModal('editExpenseModal')">
                <div class="modal-content" style="max-width: 600px;">
                    <button class="modal-close" onclick="OMS.closeModal('editExpenseModal')">×</button>
                    <h2>✏️ Edit Expense</h2>
                    <form id="editExpenseForm" onsubmit="OMS.updateExpense(event, '${expenseId}')">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label required">Date</label>
                                <input type="date" id="editExpenseDate" class="form-input" value="${expense.date || Utils.toDateString(expense.timestamp?.toDate?.() || new Date())}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label required">Amount</label>
                                <input type="number" id="editExpenseAmount" class="form-input" min="1" step="0.01" value="${expense.amount}" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label required">Category</label>
                                <select id="editExpenseCategory" class="form-select" required>
                                    <option value="Materials Purchase" ${expense.category === 'Materials Purchase' ? 'selected' : ''}>Materials Purchase</option>
                                    <option value="Salaries & Wages" ${expense.category === 'Salaries & Wages' ? 'selected' : ''}>Salaries & Wages</option>
                                    <option value="Transportation & Fuel" ${expense.category === 'Transportation & Fuel' ? 'selected' : ''}>Transportation & Fuel</option>
                                    <option value="Equipment Maintenance" ${expense.category === 'Equipment Maintenance' ? 'selected' : ''}>Equipment Maintenance</option>
                                    <option value="Rent & Utilities" ${expense.category === 'Rent & Utilities' ? 'selected' : ''}>Rent & Utilities</option>
                                    <option value="Marketing & Advertising" ${expense.category === 'Marketing & Advertising' ? 'selected' : ''}>Marketing & Advertising</option>
                                    <option value="Office Supplies" ${expense.category === 'Office Supplies' ? 'selected' : ''}>Office Supplies</option>
                                    <option value="Insurance" ${expense.category === 'Insurance' ? 'selected' : ''}>Insurance</option>
                                    <option value="Taxes & Licenses" ${expense.category === 'Taxes & Licenses' ? 'selected' : ''}>Taxes & Licenses</option>
                                    <option value="Miscellaneous" ${expense.category === 'Miscellaneous' ? 'selected' : ''}>Miscellaneous</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Vendor</label>
                                <input type="text" id="editExpenseVendor" class="form-input" value="${expense.vendor || ''}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Payment Method</label>
                            <select id="editExpensePaymentMethod" class="form-select">
                                <option value="Cash" ${expense.paymentMethod === 'Cash' ? 'selected' : ''}>Cash</option>
                                <option value="UPI" ${expense.paymentMethod === 'UPI' ? 'selected' : ''}>UPI</option>
                                <option value="Bank Transfer" ${expense.paymentMethod === 'Bank Transfer' ? 'selected' : ''}>Bank Transfer</option>
                                <option value="Cheque" ${expense.paymentMethod === 'Cheque' ? 'selected' : ''}>Cheque</option>
                                <option value="Card" ${expense.paymentMethod === 'Card' ? 'selected' : ''}>Card</option>
                                <option value="Other" ${expense.paymentMethod === 'Other' ? 'selected' : ''}>Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Description</label>
                            <textarea id="editExpenseDescription" class="form-input" rows="3">${expense.description || ''}</textarea>
                        </div>
                        <div class="btn-group">
                            <button type="submit" class="btn btn-success">💾 Update Expense</button>
                            <button type="button" class="btn btn-secondary" onclick="OMS.closeModal('editExpenseModal')">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('modalsContainer').innerHTML = modalHTML;
    },

    /**
     * Update expense record
     * @param {Object} oms - Reference to OMS
     * @param {Event} event - Form submit event
     * @param {string} expenseId - Expense ID to update
     */
    async updateExpense(oms, event, expenseId) {
        event.preventDefault();

        const updatedExpense = {
            date: Utils.get('editExpenseDate'),
            amount: parseFloat(Utils.get('editExpenseAmount')),
            category: Utils.get('editExpenseCategory'),
            vendor: Utils.get('editExpenseVendor'),
            description: Utils.get('editExpenseDescription'),
            paymentMethod: Utils.get('editExpensePaymentMethod')
        };

        try {
            await window.db.collection('expenses').doc(expenseId).update(updatedExpense);

            // Update local data
            const expenseIndex = oms.data.expenses.findIndex(e => e.id === expenseId);
            if (expenseIndex !== -1) {
                oms.data.expenses[expenseIndex] = { ...oms.data.expenses[expenseIndex], ...updatedExpense };
            }

            oms.showToast('Expense updated successfully!', 'success');
            oms.closeModal('editExpenseModal');
            this.renderFinancials(oms);
        } catch (error) {
            console.error('Error updating expense:', error);
            oms.showToast('Error updating expense: ' + error.message, 'error');
        }
    },

    /**
     * Export financial report as JSON
     * @param {Object} oms - Reference to OMS
     */
    exportFinancialReport(oms) {
        const startDate = Utils.get('finStartDate');
        const endDate = Utils.get('finEndDate');

        const data = {
            period: `${startDate} to ${endDate}`,
            generatedAt: new Date().toISOString(),
            orders: oms.data.orders,
            payments: oms.data.payments,
            expenses: oms.data.expenses
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-report-${startDate}-to-${endDate}.json`;
        a.click();
        URL.revokeObjectURL(url);

        oms.showToast('Financial report exported!', 'success');
    },

    /**
     * Show monthly comparison report
     * @param {Object} oms - Reference to OMS
     */
    showMonthlyComparison(oms) {
        // Calculate monthly stats for the past 12 months
        const months = [];
        const now = new Date();

        for (let i = 11; i >= 0; i--) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

            const monthOrders = oms.data.orders.filter(o => {
                const orderDate = new Date(o.orderDate || o.createdAt);
                return orderDate >= monthDate && orderDate <= monthEnd;
            });

            const revenue = monthOrders.reduce((sum, o) => sum + parseFloat(o.financials?.grandTotal || o.totalAmount || 0), 0);

            months.push({
                month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                revenue: revenue,
                orders: monthOrders.length
            });
        }

        const modalHTML = `
            <div class="modal show" id="monthlyComparisonModal" onclick="if(event.target === this) OMS.closeModal('monthlyComparisonModal')">
                <div class="modal-content" style="max-width: 900px;">
                    <button class="modal-close" onclick="OMS.closeModal('monthlyComparisonModal')">×</button>
                    <h2>📈 Monthly Revenue Comparison (Last 12 Months)</h2>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Orders</th>
                                    <th>Revenue</th>
                                    <th>Avg per Order</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${months.map(m => `
                                    <tr>
                                        <td>${m.month}</td>
                                        <td>${m.orders}</td>
                                        <td>₹${m.revenue.toLocaleString('en-IN')}</td>
                                        <td>₹${m.orders > 0 ? (m.revenue / m.orders).toFixed(0).toLocaleString('en-IN') : 0}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr style="font-weight: bold;">
                                    <td>TOTAL</td>
                                    <td>${months.reduce((sum, m) => sum + m.orders, 0)}</td>
                                    <td>₹${months.reduce((sum, m) => sum + m.revenue, 0).toLocaleString('en-IN')}</td>
                                    <td>₹${(months.reduce((sum, m) => sum + m.revenue, 0) / months.reduce((sum, m) => sum + m.orders, 0)).toFixed(0).toLocaleString('en-IN')}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalsContainer').innerHTML = modalHTML;
    }
};

// Export to window for global access
window.Financials = Financials;

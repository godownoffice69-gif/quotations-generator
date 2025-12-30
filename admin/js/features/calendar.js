/**
 * Calendar Module
 *
 * Extracted from monolithic OMS class for better code organization.
 * Handles:
 * - Calendar grid rendering with orders and tasks
 * - Month navigation
 * - Day details modal
 * - Task management (add, edit, delete)
 * - Order integration with calendar
 *
 * All functions accept `oms` as first parameter following the modular pattern.
 */

import { Utils } from '../utils/helpers.js';

export const Calendar = {

    // ==================== PHASE 11A: CALENDAR RENDERING ====================

    /**
     * Render calendar grid with orders and tasks
     * @param {Object} oms - Reference to OMS
     * @param {Date} date - Date to display (defaults to today)
     * @returns {string} HTML string for calendar
     */
    renderCalendar(oms, date = new Date()) {
        const year = date.getFullYear();
        const month = date.getMonth();

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];

        let html = `
            <div class="calendar-container">
                <div class="calendar-header">
                    <div class="calendar-nav">
                        <button class="btn btn-primary btn-small" onclick="Calendar.changeMonth(window.OMS, -1)">${oms.t('previousMonth')}</button>
                        <h3>${monthNames[month]} ${year}</h3>
                        <button class="btn btn-primary btn-small" onclick="Calendar.changeMonth(window.OMS, 1)">${oms.t('nextMonth')}</button>
                    </div>
                    <button class="btn btn-secondary btn-small" onclick="Calendar.showToday(window.OMS)">${oms.t('today')}</button>
                </div>
                <div class="calendar-grid">
                    ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day =>
                        `<div class="calendar-day-header">${day}</div>`
                    ).join('')}
                    ${Array(firstDay).fill('').map(() => '<div class="calendar-day"></div>').join('')}
                    ${Array.from({length: daysInMonth}, (_, i) => {
                        const day = i + 1;
                        const dateStr = Utils.toDateString(new Date(year, month, day));
                        const today = Utils.toDateString(new Date());

                        // ENHANCED CALENDAR FILTERING with fuzzy date matching
                        const orders = oms.data.orders.filter(o => {
                            if (o.isMultiDay) {
                                // Use fuzzy date matcher for multi-day range check
                                if (o.startDate && o.endDate) {
                                    return fuzzyDateMatcher.isInRange(dateStr, o.startDate, o.endDate);
                                }
                            }
                            // Use fuzzy date matcher for single-day check
                            return o.date && fuzzyDateMatcher.matches(o.date, dateStr);
                        });
                        const tasks = oms.data.tasks.filter(t => t.date === dateStr);
                        const festival = oms.festivals[dateStr];

                        let classes = 'calendar-day';
                        if (dateStr === today) classes += ' today';
                        if (orders.length) classes += ' has-orders';
                        if (tasks.length) classes += ' has-tasks';
                        if (festival) classes += ' has-festival';

                        // Get color indicators for this day's orders
                        const orderColorDots = orders.slice(0, 3).map(o => {
                            const color = oms.getOrderColor(o);
                            return `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};margin:0 2px;"></span>`;
                        }).join('');

                        return `
                            <div class="${classes}" onclick="Calendar.showDayDetails(window.OMS, '${dateStr}')">
                                <div class="calendar-day-number">${day}</div>
                                ${festival ? `<div class="festival-text">${festival[1]}</div>` : ''}
                                ${orders.length ? `<div class="order-count" title="${orders.length} ${oms.t('ordersText')}">${orderColorDots}${orders.length > 3 ? '+' : ''}</div>` : ''}
                                ${tasks.length ? `<div class="calendar-day-content">${tasks.length} ${tasks.length > 1 ? oms.t('ordersText') : oms.t('order')}</div>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <div class="card">
                <h3 class="card-title">${oms.t('calendar')}</h3>
                <div class="form-row">
                    <div class="form-group">
                        <input type="date" id="taskDate" class="form-input" value="${Utils.toDateString(new Date())}">
                    </div>
                    <div class="form-group">
                        <input type="text" id="taskDescription" class="form-input" placeholder="${oms.t('enterNotes')}">
                    </div>
                    <div class="form-group">
                        <button class="btn btn-primary" onclick="Calendar.addTask(window.OMS)">${oms.t('add')}</button>
                    </div>
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Render calendar tab (wrapper for renderCalendar)
     * @param {Object} oms - Reference to OMS
     */
    renderCalendarTab(oms) {
        document.getElementById('calendar').innerHTML = this.renderCalendar(oms, oms.currentCalendarDate || new Date());
    },

    // ==================== PHASE 11B: DATE NAVIGATION ====================

    /**
     * Change calendar month
     * @param {Object} oms - Reference to OMS
     * @param {number} delta - Number of months to change (+1 or -1)
     */
    changeMonth(oms, delta) {
        oms.currentCalendarDate = oms.currentCalendarDate || new Date();
        oms.currentCalendarDate.setMonth(oms.currentCalendarDate.getMonth() + delta);
        oms.switchTab('calendar');
    },

    /**
     * Show today's date in calendar
     * @param {Object} oms - Reference to OMS
     */
    showToday(oms) {
        oms.currentCalendarDate = new Date();
        oms.switchTab('calendar');
    },

    // ==================== PHASE 11C: DAY DETAILS & TASKS ====================

    /**
     * Show details for a specific day (orders and tasks)
     * @param {Object} oms - Reference to OMS
     * @param {string} dateStr - Date string in YYYY-MM-DD format
     */
    showDayDetails(oms, dateStr) {
        const date = Utils.getLocalDate(dateStr);

        // ============ ENHANCED FILTERING WITH LOGGING ============
        const startTime = performance.now();
        const normalizedDate = fuzzyDateMatcher.normalize(dateStr);

        filterLogger.log('showDayDetails_started', {
            operation: 'showDayDetails',
            filterDate: dateStr,
            normalizedDate,
            totalOrdersAvailable: oms.data.orders.length
        });

        const matchedOrders = [];
        const orders = oms.data.orders.filter(o => {
            if (o.isMultiDay) {
                // Use fuzzy date matcher for multi-day range check
                if (o.startDate && o.endDate && fuzzyDateMatcher.isInRange(dateStr, o.startDate, o.endDate)) {
                    matchedOrders.push(o);
                    return true;
                }
            }
            // Use fuzzy date matcher for single-day check
            if (o.date && fuzzyDateMatcher.matches(o.date, dateStr)) {
                matchedOrders.push(o);
                return true;
            }
            return false;
        });

        const filterTime = (performance.now() - startTime).toFixed(2);

        // Log and learn from this filter
        filterLogger.log('showDayDetails_completed', {
            operation: 'showDayDetails',
            filterDate: dateStr,
            matchedCount: orders.length,
            filterTimeMs: filterTime
        });

        patternLearner.recordFilterResult(normalizedDate, orders.length, oms.data.orders.length, 'showDayDetails');

        // Validate and alert if needed
        const validationResult = orderValidator.validate({
            date: normalizedDate,
            orderCount: orders.length,
            totalAvailable: oms.data.orders.length,
            matchedOrders,
            allOrders: oms.data.orders
        });

        if (validationResult.some(a => a.level === 'error' || a.level === 'warning')) {
            orderValidator.showAlerts(validationResult, dateStr);
        }
        // ============ END ENHANCED FILTERING ============

        const tasks = oms.data.tasks.filter(t => t.date === dateStr);
        const festival = oms.festivals[dateStr];

        let content = `<h3>${oms.t('details')} ${oms.t('for')} ${Utils.formatDate(dateStr)}</h3>`;

        if (festival) {
            content += `<div class="festival-text" style="font-size: 1.2rem; margin: 1rem 0;">🎉 ${festival[1]} (${festival[0]})</div>`;
        }

        if (orders.length > 0) {
            content += `<h4>${oms.t('orders')} (${orders.length})</h4>`;
            orders.forEach(o => {
                const color = oms.getOrderColor(o);
                let dateInfo = '';
                if (o.isMultiDay) {
                    dateInfo = `<br><small style="color:#666;">${oms.t('multiDayOrder')}: ${Utils.formatDate(o.startDate)} ${oms.t('to')} ${Utils.formatDate(o.endDate)}</small>`;
                }
                content += `
                    <div style="padding:10px;margin:8px 0;border-left:4px solid ${color};background:#f9f9f9;border-radius:4px;">
                        <strong>${o.orderId || '[No ID]'}</strong> - ${o.clientName}
                        <br>
                        <span style="color:${color};font-weight:bold;">${o.eventType || oms.t('event')}</span> |
                        <span style="background:${color};color:white;padding:2px 6px;border-radius:3px;font-size:12px;">${oms.t(o.status.toLowerCase())}</span>
                        ${dateInfo}
                    </div>
                `;
            });
        }

        if (tasks.length > 0) {
            content += `<h4>${oms.t('calendar')} (${tasks.length})</h4><ul>`;
            tasks.forEach(t => {
                content += `<li>
                    ${t.description}
                    <button class="btn btn-secondary btn-small" data-action="edit" data-type="task" data-id="${t.id}">${oms.t('edit')}</button>
                    <button class="btn btn-danger btn-small" data-action="delete" data-type="task" data-id="${t.id}">${oms.t('delete')}</button>
                </li>`;
            });
            content += '</ul>';
        }

        content += `
            <div class="btn-group">
                <button class="btn btn-primary" onclick="Calendar.addTaskForDate(window.OMS, '${dateStr}')">${oms.t('add')}</button>
                <button class="btn btn-secondary" onclick="Calendar.createOrderForDate(window.OMS, '${dateStr}')">${oms.t('orders')}</button>
            </div>
        `;

        oms.showModal(oms.t('details'), content);
    },

    /**
     * Add a new task
     * @param {Object} oms - Reference to OMS
     */
    addTask(oms) {
        const date = Utils.get('taskDate');
        const description = Utils.get('taskDescription');
        
        if (!date || !description) {
            oms.showToast('Enter date and description', 'error');
            return;
        }
        
        const task = {
            id: Utils.generateId(),
            date: date,
            description: description,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        oms.createItem('task', task);
        oms.saveToStorage();
        oms.switchTab('calendar');
        Utils.set('taskDescription', '');
        oms.showToast('Task added!');
    },

    /**
     * Add task for specific date
     * @param {Object} oms - Reference to OMS
     * @param {string} date - Date string
     */
    addTaskForDate(oms, date) {
        oms.switchTab('calendar');
        setTimeout(() => {
            Utils.set('taskDate', date);
            document.getElementById('taskDescription').focus();
        }, 100);
    },

    /**
     * Create order for specific date
     * @param {Object} oms - Reference to OMS
     * @param {string} date - Date string
     */
    createOrderForDate(oms, date) {
        oms.switchTab('orders');
        Utils.set('orderDate', date);
    },

    /**
     * Show task edit modal
     * @param {Object} oms - Reference to OMS
     * @param {Object} task - Task object
     */
    showTaskEditModal(oms, task) {
        const content = `
            <div class="form-group">
                <label class="form-label">Date</label>
                <input type="date" id="editTaskDate" class="form-input" value="${task.date}">
            </div>
            <div class="form-group">
                <label class="form-label">Description</label>
                <input type="text" id="editTaskDescription" class="form-input" value="${task.description}">
            </div>
            <div class="btn-group">
                <button class="btn btn-primary" onclick="Calendar.saveTaskEdit(window.OMS, '${task.id}')">Save</button>
                <button class="btn btn-secondary" onclick="OMS.closeModal()">Cancel</button>
            </div>
        `;
        oms.showModal('Edit Task', content);
    },

    /**
     * Save task edit
     * @param {Object} oms - Reference to OMS
     * @param {string} taskId - Task ID
     */
    saveTaskEdit(oms, taskId) {
        const newData = {
            date: Utils.get('editTaskDate'),
            description: Utils.get('editTaskDescription')
        };
        
        if (oms.updateItem('task', taskId, newData)) {
            oms.saveToStorage();
            oms.switchTab('calendar');
            oms.closeModal();
            oms.showToast('Task updated!');
        }
    }

};

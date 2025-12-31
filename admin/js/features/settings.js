/* ============================================
   SETTINGS - System configuration, print settings, data management
   ============================================ */

/**
 * Settings Feature Module
 *
 * Provides:
 * - System preferences and configuration
 * - Print/PDF settings (paper format, colors, fonts)
 * - Table layout settings
 * - Weather API integration
 * - Data import/export
 * - Settings persistence via Firestore
 *
 * @exports Settings
 */

import { Utils } from '../utils/helpers.js';

export const Settings = {
    /**
     * Render settings interface
     * @param {Object} oms - Reference to OMS
     */
    renderSettings(oms) {
        const container = document.getElementById('settings');
        const s = oms.data.settings;
        const ts = s.tableSettings;
        const colors = s.printColors;

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">${oms.t('systemSettings')}</h2>
                </div>

                <div class="card">
                    <h3>${oms.t('tableLayoutSettings')}</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1rem;">
                        <div class="form-group">
                            <label class="form-label">${oms.t('srColumnWidth')}: <span id="srWidthValue">${ts.columnWidthSr}%</span></label>
                            <input type="range" id="columnWidthSr" class="form-input" min="5" max="25" value="${ts.columnWidthSr}"
                                   oninput="document.getElementById('srWidthValue').textContent = this.value + '%'">
                        </div>
                        <div class="form-group">
                            <label class="form-label">${oms.t('itemColumnWidth')}: <span id="itemWidthValue">${ts.columnWidthItem}%</span></label>
                            <input type="range" id="columnWidthItem" class="form-input" min="15" max="60" value="${ts.columnWidthItem}"
                                   oninput="document.getElementById('itemWidthValue').textContent = this.value + '%'">
                        </div>
                        <div class="form-group">
                            <label class="form-label">${oms.t('qtyColumnWidth')}: <span id="qtyWidthValue">${ts.columnWidthQty}%</span></label>
                            <input type="range" id="columnWidthQty" class="form-input" min="5" max="30" value="${ts.columnWidthQty}"
                                   oninput="document.getElementById('qtyWidthValue').textContent = this.value + '%'">
                        </div>
                        <div class="form-group">
                            <label class="form-label">${oms.t('remarksColumnWidth')}: <span id="remarksWidthValue">${ts.columnWidthRemarks}%</span></label>
                            <input type="range" id="columnWidthRemarks" class="form-input" min="15" max="60" value="${ts.columnWidthRemarks}"
                                   oninput="document.getElementById('remarksWidthValue').textContent = this.value + '%'">
                        </div>
                        <div class="form-group">
                            <label class="form-label">${oms.t('leftMarginFiling')}: <span id="leftMarginValue">${ts.leftMargin}mm</span></label>
                            <input type="range" id="leftMargin" class="form-input" min="30" max="100" value="${ts.leftMargin}"
                                   oninput="document.getElementById('leftMarginValue').textContent = this.value + 'mm'">
                        </div>
                    </div>
                </div>

                <div class="card">
                    <h3>${oms.t('colorCustomization')}</h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem;">
                        <div class="form-group">
                            <label class="form-label">${oms.t('headerBackground')}</label>
                            <input type="color" id="printHeaderBg" class="form-input" value="${colors.headerBg}" style="height: 50px;">
                        </div>
                        <div class="form-group">
                            <label class="form-label">${oms.t('headerText')}</label>
                            <input type="color" id="printHeaderText" class="form-input" value="${colors.headerText}" style="height: 50px;">
                        </div>
                        <div class="form-group">
                            <label class="form-label">${oms.t('orderIdBackground')}</label>
                            <input type="color" id="printOrderIdBg" class="form-input" value="${colors.orderIdBg || '#667eea'}" style="height: 50px;">
                        </div>
                        <div class="form-group">
                            <label class="form-label">${oms.t('orderIdText')}</label>
                            <input type="color" id="printOrderIdText" class="form-input" value="${colors.orderIdText || '#ffffff'}" style="height: 50px;">
                        </div>
                        <div class="form-group">
                            <label class="form-label">${oms.t('tableHeaderBackground')}</label>
                            <input type="color" id="printTableHeaderBg" class="form-input" value="${colors.tableHeaderBg}" style="height: 50px;">
                        </div>
                        <div class="form-group">
                            <label class="form-label">${oms.t('tableHeaderText')}</label>
                            <input type="color" id="printTableHeaderText" class="form-input" value="${colors.tableHeaderText}" style="height: 50px;">
                        </div>
                        <div class="form-group">
                            <label class="form-label">${oms.t('tableBorder')}</label>
                            <input type="color" id="printTableBorder" class="form-input" value="${colors.tableBorder}" style="height: 50px;">
                        </div>
                        <div class="form-group">
                            <label class="form-label">${oms.t('notesBackground')}</label>
                            <input type="color" id="printNotesBg" class="form-input" value="${colors.notesBg}" style="height: 50px;">
                        </div>
                    </div>
                </div>

                <div class="card">
                    <h3>${oms.t('printSettings')}</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1rem;">
                        <div class="form-group">
                            <label class="form-label">${oms.t('fontSize')}: <span id="fontSizeValue">${s.printFontSize}px</span></label>
                            <input type="range" id="printFontSize" class="form-input" min="16" max="80" value="${s.printFontSize}"
                                   oninput="document.getElementById('fontSizeValue').textContent = this.value + 'px'">
                            <small style="color: var(--text-gray);">${oms.t('multiOrderNote')}</small>
                        </div>

                        <div class="form-group">
                            <label class="form-label">${oms.t('paperFormat')}</label>
                            <select id="paperFormat" class="form-select">
                                <option value="A4" ${s.paperFormat === 'A4' ? 'selected' : ''}>A4 (210 × 297 mm)</option>
                                <option value="Legal" ${s.paperFormat === 'Legal' ? 'selected' : ''}>Legal (216 × 356 mm)</option>
                                <option value="Letter" ${s.paperFormat === 'Letter' ? 'selected' : ''}>Letter (216 × 279 mm)</option>
                                <option value="A3" ${s.paperFormat === 'A3' ? 'selected' : ''}>A3 (297 × 420 mm)</option>
                                <option value="A5" ${s.paperFormat === 'A5' ? 'selected' : ''}>A5 (148 × 210 mm)</option>
                                <option value="Tabloid" ${s.paperFormat === 'Tabloid' ? 'selected' : ''}>Tabloid (279 × 432 mm)</option>
                            </select>
                            <small style="color: var(--text-gray);">${oms.t('chooseFormat')}</small>
                        </div>

                        <div class="form-group">
                            <label class="form-label">${oms.t('pageOrientation')}</label>
                            <select id="paperOrientation" class="form-select">
                                <option value="portrait" ${s.paperOrientation === 'portrait' ? 'selected' : ''}>${oms.t('portrait')}</option>
                                <option value="landscape" ${s.paperOrientation === 'landscape' ? 'selected' : ''}>${oms.t('landscape')}</option>
                            </select>
                            <small style="color: var(--text-gray);">${oms.t('portraitOrLandscape')}</small>
                        </div>

                        <div class="form-group">
                            <label class="form-label">${oms.t('imageQuality')}</label>
                            <select id="imageQuality" class="form-select">
                                <option value="1" ${s.imageQuality === 1 ? 'selected' : ''}>${oms.t('low')} (${oms.t('faster')})</option>
                                <option value="2" ${s.imageQuality === 2 ? 'selected' : ''}>${oms.t('medium')} (${oms.t('balanced')})</option>
                                <option value="3" ${s.imageQuality === 3 ? 'selected' : ''}>${oms.t('high')} (${oms.t('betterQuality')})</option>
                                <option value="4" ${s.imageQuality === 4 ? 'selected' : ''}>${oms.t('ultra')} (${oms.t('bestQuality')})</option>
                            </select>
                            <small style="color: var(--text-gray);">${oms.t('higherQualityNote')}</small>
                        </div>

                        <div class="form-group">
                            <label class="form-label">${oms.t('functionColor')}</label>
                            <input type="color" id="functionColor" class="form-input" value="${s.functionColor || '#667eea'}" style="height: 50px;">
                            <small style="color: var(--text-gray);">${oms.t('customColorNote')}</small>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Background Color</label>
                            <input type="color" id="printBgColor" class="form-input" value="${s.printBgColor || '#ffffff'}" style="height: 50px;">
                            <small style="color: var(--text-gray);">Set the background color for downloaded images</small>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Text Color</label>
                            <input type="color" id="printTextColor" class="form-input" value="${s.printTextColor || '#000000'}" style="height: 50px;">
                            <small style="color: var(--text-gray);">Set the text color for downloaded images</small>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <h3>${oms.t('systemPreferences')}</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${oms.t('defaultOrderStatus')}</label>
                            <select id="defaultOrderStatus" class="form-select">
                                <option value="Confirmed" ${s.defaultOrderStatus === 'Confirmed' ? 'selected' : ''}>${oms.t('confirmed')}</option>
                                <option value="Completed" ${s.defaultOrderStatus === 'Completed' ? 'selected' : ''}>${oms.t('completed')}</option>
                                <option value="Cancelled" ${s.defaultOrderStatus === 'Cancelled' ? 'selected' : ''}>${oms.t('cancelled')}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${oms.t('lowStockThreshold')}</label>
                            <input type="number" id="lowStockThreshold" class="form-input" value="${s.lowStockThreshold}" min="1">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${oms.t('language')}</label>
                            <select id="appLanguage" class="form-select">
                                <option value="en" ${s.language === 'en' ? 'selected' : ''}>English</option>
                                <option value="gu" ${s.language === 'gu' ? 'selected' : ''}>ગુજરાતી</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${oms.t('invoiceFormat')}</label>
                            <select id="invoiceFormat" class="form-select">
                                <option value="FP" ${s.invoicePrefix === 'FP' ? 'selected' : ''}>FP001</option>
                                <option value="ORD" ${s.invoicePrefix === 'ORD' ? 'selected' : ''}>ORD001</option>
                                <option value="INV" ${s.invoicePrefix === 'INV' ? 'selected' : ''}>INV001</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <h3>🌤️ Weather Integration</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">OpenWeatherMap API Key</label>
                            <input type="text" id="weatherApiKey" class="form-input" value="${s.weatherApiKey || ''}" placeholder="Enter your API key">
                            <small style="color: var(--text-gray);">Get a free API key from <a href="https://openweathermap.org/api" target="_blank">OpenWeatherMap</a></small>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Default City</label>
                            <input type="text" id="defaultCity" class="form-input" value="${s.defaultCity || 'Delhi'}" placeholder="Delhi">
                            <small style="color: var(--text-gray);">Default city for weather data (e.g., Delhi, Mumbai, etc.)</small>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <h3>🔔 Push Notifications</h3>

                    <div style="padding: 1rem; background: #f0f4f8; border-radius: 8px; margin-bottom: 1.5rem;">
                        <strong>Status:</strong> <span id="notifStatusText" style="font-weight: bold;">Checking...</span>
                    </div>

                    <div class="btn-group" style="margin-bottom: 1.5rem;">
                        <button id="enableNotificationsBtn" class="btn btn-primary" onclick="if(window.NotificationService) NotificationService.subscribe(window.OMS)">
                            🔔 Enable Push Notifications
                        </button>
                        <button id="disableNotificationsBtn" class="btn btn-secondary" style="display: none;" onclick="if(window.NotificationService) NotificationService.unsubscribe(window.OMS)">
                            🔕 Disable Notifications
                        </button>
                    </div>

                    <div>
                        <h4 style="margin-bottom: 1rem; color: var(--text-dark);">Notification Types:</h4>
                        <div style="display: grid; gap: 0.75rem;">
                            <label style="display: flex; align-items: center; cursor: pointer;">
                                <input type="checkbox" id="notifyOrderChanges" class="notification-preference" checked style="margin-right: 0.5rem;">
                                <span>📦 Order Status Changes</span>
                            </label>
                            <label style="display: flex; align-items: center; cursor: pointer;">
                                <input type="checkbox" id="notifyLowStock" class="notification-preference" checked style="margin-right: 0.5rem;">
                                <span>📉 Low Stock Alerts</span>
                            </label>
                            <label style="display: flex; align-items: center; cursor: pointer;">
                                <input type="checkbox" id="notifyNewOrders" class="notification-preference" checked style="margin-right: 0.5rem;">
                                <span>🆕 New Orders</span>
                            </label>
                            <label style="display: flex; align-items: center; cursor: pointer;">
                                <input type="checkbox" id="notifyPayments" class="notification-preference" checked style="margin-right: 0.5rem;">
                                <span>💰 Payment Received</span>
                            </label>
                            <label style="display: flex; align-items: center; cursor: pointer;">
                                <input type="checkbox" id="notifyTeamUpdates" class="notification-preference" checked style="margin-right: 0.5rem;">
                                <span>👥 Team Updates</span>
                            </label>
                        </div>
                        <button class="btn btn-info" style="margin-top: 1rem;" onclick="OMS.saveNotificationPreferences()">
                            💾 Save Notification Preferences
                        </button>
                    </div>
                </div>

                <div class="btn-group">
                    <button class="btn btn-primary" onclick="OMS.saveSettings()">${oms.t('saveAllSettings')}</button>
                    <button class="btn btn-secondary" onclick="OMS.resetSettings()">${oms.t('resetToDefaults')}</button>
                </div>

                <div class="card">
                    <h3>${oms.t('dataManagement')}</h3>
                    <div class="btn-group">
                        <button class="btn btn-info" data-action="exportData">${oms.t('exportJSON')}</button>
                        <button class="btn btn-success" onclick="OMS.exportData('csv')">${oms.t('exportCSV')}</button>
                        <button class="btn btn-warning" data-action="importData">${oms.t('importBackup')}</button>
                        <button class="btn btn-danger" onclick="OMS.resetAllData()">${oms.t('resetAllData')}</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Save all settings
     * @param {Object} oms - Reference to OMS
     */
    async saveSettings(oms) {
        // Save table settings
        oms.data.settings.tableSettings = {
            columnWidthSr: parseInt(Utils.get('columnWidthSr')) || 8,
            columnWidthItem: parseInt(Utils.get('columnWidthItem')) || 40,
            columnWidthQty: parseInt(Utils.get('columnWidthQty')) || 12,
            columnWidthRemarks: parseInt(Utils.get('columnWidthRemarks')) || 40,
            leftMargin: parseInt(Utils.get('leftMargin')) || 50
        };

        // Save colors
        oms.data.settings.printColors = {
            headerBg: Utils.get('printHeaderBg') || '#667eea',
            headerText: Utils.get('printHeaderText') || '#ffffff',
            orderIdBg: Utils.get('printOrderIdBg') || '#667eea',
            orderIdText: Utils.get('printOrderIdText') || '#ffffff',
            tableHeaderBg: Utils.get('printTableHeaderBg') || '#f8f9fa',
            tableHeaderText: Utils.get('printTableHeaderText') || '#333333',
            tableBorder: Utils.get('printTableBorder') || '#333333',
            notesBg: Utils.get('printNotesBg') || '#f9f9f9'
        };

        // Save other settings
        oms.data.settings.printFontSize = parseInt(Utils.get('printFontSize')) || 26;
        oms.data.settings.printBgColor = Utils.get('printBgColor') || '#ffffff';
        oms.data.settings.printTextColor = Utils.get('printTextColor') || '#000000';
        oms.data.settings.defaultOrderStatus = Utils.get('defaultOrderStatus') || 'Confirmed';
        oms.data.settings.lowStockThreshold = parseInt(Utils.get('lowStockThreshold')) || 5;
        oms.data.settings.language = Utils.get('appLanguage') || 'en';
        oms.data.settings.invoicePrefix = Utils.get('invoiceFormat') || 'FP';

        // Save new print settings
        oms.data.settings.paperFormat = Utils.get('paperFormat') || 'A4';
        oms.data.settings.paperOrientation = Utils.get('paperOrientation') || 'portrait';
        oms.data.settings.imageQuality = parseInt(Utils.get('imageQuality')) || 2;
        oms.data.settings.functionColor = Utils.get('functionColor') || '#667eea';

        // Save weather settings
        oms.data.settings.weatherApiKey = Utils.get('weatherApiKey') || '';
        oms.data.settings.defaultCity = Utils.get('defaultCity') || 'Delhi';

        // Save to localStorage
        oms.saveToStorage();

        // Save to Firestore for persistence across devices
        const saved = await this.saveSettingsToFirestore(oms);

        if (saved) {
            oms.refreshOrderId();
            oms.showToast('All settings saved successfully!');
        } else {
            oms.showToast('Settings saved locally, but Firestore sync failed. Check permissions.');
        }
    },

    /**
     * Reset all data (dangerous operation)
     * @param {Object} oms - Reference to OMS
     */
    resetAllData(oms) {
        if (!confirm('⚠️ This will delete ALL data permanently. Are you absolutely sure?')) return;
        if (!confirm('Last chance! This action CANNOT be undone. Confirm data reset?')) return;

        localStorage.removeItem('oms_data');
        oms.showToast('Data reset! Reloading...');
        setTimeout(() => location.reload(), 1000);
    },

    /**
     * Reset settings to defaults
     * @param {Object} oms - Reference to OMS
     */
    resetSettings(oms) {
        if (!confirm('Reset all settings?')) return;

        oms.data.settings = {
            printFontSize: 26,
            printBgColor: '#ffffff',
            printTextColor: '#000000',
            orderIdCounter: oms.data.settings.orderIdCounter,
            invoicePrefix: 'FP',
            lowStockThreshold: 5,
            language: 'en',
            defaultOrderStatus: 'Confirmed',
            paperFormat: 'A4',
            paperOrientation: 'portrait',
            imageQuality: 2,
            functionColor: '#667eea',
            weatherApiKey: '',
            defaultCity: 'Delhi',
            tableSettings: {
                columnWidthSr: 8,
                columnWidthItem: 40,
                columnWidthQty: 12,
                columnWidthRemarks: 40,
                leftMargin: 50
            },
            printColors: {
                headerBg: '#667eea',
                headerText: '#ffffff',
                orderIdBg: '#667eea',
                orderIdText: '#ffffff',
                tableHeaderBg: '#f8f9fa',
                tableHeaderText: '#333333',
                tableBorder: '#333333',
                notesBg: '#f9f9f9'
            },
            eventTypeColors: {
                'Wedding': '#e91e63',
                'Birthday': '#ff9800',
                'Corporate': '#2196f3',
                'Anniversary': '#9c27b0',
                'Festival': '#4caf50',
                'Party': '#ff5722',
                'Meeting': '#607d8b',
                'Conference': '#3f51b5',
                'default': '#667eea'
            },
            statusColors: {
                'pending': '#ff9800',
                'confirmed': '#2196f3',
                'completed': '#4caf50',
                'cancelled': '#f44336'
            }
        };

        oms.saveToStorage();
        this.renderSettings(oms);
        oms.showToast('Settings reset!');
    },

    /**
     * Save settings to Firestore
     * @param {Object} oms - Reference to OMS
     * @returns {Promise<boolean>} Success status
     */
    async saveSettingsToFirestore(oms) {
        try {
            const user = window.auth.currentUser;
            if (!user) return false;

            await window.db.collection('settings').doc('app_settings').set({
                ...oms.data.settings,
                updatedBy: user.email,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('✅ Settings saved to Firestore');
            return true;
        } catch (error) {
            console.error('❌ Error saving settings to Firestore:', error);
            return false;
        }
    },

    /**
     * Load settings from Firestore
     * @param {Object} oms - Reference to OMS
     * @returns {Promise<boolean>} Success status
     */
    async loadSettingsFromFirestore(oms) {
        try {
            console.log('⚙️ Loading settings from Firestore...');

            const settingsDoc = await window.db.collection('settings').doc('app_settings').get();

            if (settingsDoc.exists) {
                const firestoreSettings = settingsDoc.data();
                // Merge with default settings
                oms.data.settings = {
                    ...oms.data.settings,
                    ...firestoreSettings
                };
                console.log('✅ Settings loaded from Firestore');
                return true;
            } else {
                console.log('📝 No settings in Firestore, using defaults');
                // Save default settings to Firestore
                await this.saveSettingsToFirestore(oms);
                return true;
            }
        } catch (error) {
            console.error('❌ Error loading settings from Firestore:', error);
            return false;
        }
    }
};

// Make globally available for backward compatibility
if (typeof window !== 'undefined') {
    window.Settings = Settings;
}

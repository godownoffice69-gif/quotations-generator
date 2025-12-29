/**
 * Inventory Module
 *
 * Extracted from monolithic OMS class for better code organization.
 * Handles:
 * - Inventory and category rendering
 * - Product photos management
 * - Item management (add, edit, delete, batch operations)
 * - Item usage history tracking
 *
 * All functions accept `oms` as first parameter following the modular pattern.
 */

export const Inventory = {

    // ==================== PHASE 4A: RENDERING FUNCTIONS ====================

    /**
     * Render main inventory management interface
     * Shows categories and items with add/edit controls
     */
    renderInventory(oms) {
        const container = document.getElementById('inventory');
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">${oms.t('inventoryManagement')}</h2>
                </div>
                <div class="btn-group">
                    <button class="btn btn-warning" onclick="Inventory.batchUpdateInventory(window.OMS)">${oms.t('batchUpdate')}</button>
                </div>
                <div class="card">
                    <h3>${oms.t('categories')}</h3>
                    <div class="form-row">
                        <input type="text" id="categoryName" class="form-input" placeholder="${oms.t('enterCategoryName')}">
                        <button class="btn btn-primary" onclick="Inventory.addCategory(window.OMS)">${oms.t('add')}</button>
                    </div>
                    <div id="categoriesContainer"></div>
                </div>
                <div class="card">
                    <h3>${oms.t('items')}</h3>
                    <div class="form-row">
                        <select id="itemCategory" class="form-select"></select>
                        <input type="text" id="itemName" class="form-input" placeholder="${oms.t('enterItemName')}">
                        <input type="number" id="itemQuantity" class="form-input" placeholder="${oms.t('quantity')}" min="0">
                        <button class="btn btn-primary" onclick="Inventory.addItem(window.OMS)">${oms.t('add')}</button>
                    </div>
                    <div id="itemsContainer"></div>
                </div>
            </div>
        `;

        Inventory.updateInventoryDisplay(oms);
    },

    /**
     * Render product photos management interface
     * Allows uploading/changing product images and controlling website visibility
     */
    renderProductPhotos(oms) {
        const container = document.getElementById('productPhotos');
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">📸 Product Photos Management</h2>
                    <p style="color: var(--text-gray); margin-top: 0.5rem;">
                        Upload product photos to display on quotation website. Click any product to upload/change its image.
                    </p>
                </div>
                <div id="productPhotosGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem; padding: 1.5rem;">
                    ${oms.data.inventory.items.map(item => {
                        const category = oms.data.inventory.categories.find(c => c.id === item.categoryId);
                        const imageUrl = item.imageUrl;

                        return `
                            <div class="product-photo-card" style="border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: transform 0.2s; cursor: pointer;" onclick="Inventory.uploadProductPhoto(window.OMS, '${item.id}')">
                                <div style="position: relative; padding-top: 66.67%; background: ${item.imageUrl ? '#f5f5f5' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};">
                                    ${item.imageUrl ? `
                                        <img src="${imageUrl}" alt="${item.name}"
                                            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;"
                                            onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: white; font-size: 14px; font-weight: 600;\\'>No Image<br/>Click to Upload</div>';">
                                    ` : `
                                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: white; font-size: 16px; font-weight: 600;">
                                            📸<br/>No Image<br/><span style="font-size: 12px; font-weight: 400;">Click to Upload</span>
                                        </div>
                                    `}
                                    <div style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px;">
                                        ${category?.name || 'No Category'}
                                    </div>
                                </div>
                                <div style="padding: 1rem;">
                                    <h4 style="margin: 0 0 0.5rem 0; font-size: 15px; font-weight: 600; color: #1a1a1a;">${item.name}</h4>
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.75rem;">
                                        <span style="font-size: 12px; color: #666;">Stock: ${item.quantity}</span>
                                        <button class="btn btn-primary btn-small" style="font-size: 12px; padding: 6px 12px;" onclick="event.stopPropagation(); Inventory.uploadProductPhoto(window.OMS, '${item.id}')">
                                            📤 ${item.imageUrl ? 'Change' : 'Upload'} Photo
                                        </button>
                                    </div>
                                    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e0e0e0; display: flex; align-items: center; justify-content: space-between;">
                                        <span style="font-size: 13px; color: #333; font-weight: 500;">👁️ Show on Website</span>
                                        <label class="visibility-toggle" style="position: relative; display: inline-block; width: 48px; height: 24px; cursor: pointer;" onclick="event.stopPropagation();">
                                            <input type="checkbox" ${item.visibleOnWebsite !== false ? 'checked' : ''} onchange="event.stopPropagation(); Inventory.toggleItemVisibility(window.OMS, '${item.id}', this.checked)" style="opacity: 0; width: 0; height: 0;">
                                            <span style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: ${item.visibleOnWebsite !== false ? '#4CAF50' : '#ccc'}; border-radius: 24px; transition: 0.3s;"></span>
                                            <span style="position: absolute; content: ''; height: 18px; width: 18px; left: ${item.visibleOnWebsite !== false ? '27px' : '3px'}; bottom: 3px; background-color: white; border-radius: 50%; transition: 0.3s;"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <input type="file" id="productPhotoInput" accept="image/*" style="display: none;" onchange="Inventory.handleProductPhotoSelect(window.OMS, event)">
        `;

        // Add hover effect with CSS
        const style = document.createElement('style');
        style.textContent = `
            .product-photo-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 4px 16px rgba(0,0,0,0.12) !important;
            }
        `;
        document.head.appendChild(style);
    },

    /**
     * Render item usage history interface
     * Shows which items were used in completed orders
     */
    renderItemHistory(oms) {
        const container = document.getElementById('itemHistory');
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">📜 Item Usage History</h2>
                    <p style="color: var(--text-gray); margin-top: 0.5rem;">
                        Track which items were used in which completed orders
                    </p>
                </div>
                <div class="form-row" style="margin-bottom: 1rem;">
                    <input type="text" id="itemHistorySearch" class="form-input" placeholder="Search by item name, order ID, or client...">
                    <select id="itemHistoryFilter" class="form-select">
                        <option value="all">All Items</option>
                        ${[...new Set(oms.data.itemHistory.map(h => h.itemName))].sort().map(name =>
                            `<option value="${name}">${name}</option>`
                        ).join('')}
                    </select>
                </div>
                <div id="itemHistoryContainer"></div>
            </div>
        `;

        Inventory.renderItemHistoryTable(oms);

        // Add search and filter handlers
        document.getElementById('itemHistorySearch')?.addEventListener('input', () => Inventory.renderItemHistoryTable(oms));
        document.getElementById('itemHistoryFilter')?.addEventListener('change', () => Inventory.renderItemHistoryTable(oms));
    },

    /**
     * Render the item history table with search/filter applied
     */
    renderItemHistoryTable(oms) {
        const searchTerm = document.getElementById('itemHistorySearch')?.value.toLowerCase() || '';
        const filterItem = document.getElementById('itemHistoryFilter')?.value || 'all';

        // Filter history
        let filteredHistory = oms.data.itemHistory;

        if (filterItem !== 'all') {
            filteredHistory = filteredHistory.filter(h => h.itemName === filterItem);
        }

        if (searchTerm) {
            filteredHistory = filteredHistory.filter(h =>
                h.itemName?.toLowerCase().includes(searchTerm) ||
                h.orderId?.toLowerCase().includes(searchTerm) ||
                h.clientName?.toLowerCase().includes(searchTerm)
            );
        }

        // Sort by most recent first
        filteredHistory.sort((a, b) => new Date(b.usedAt) - new Date(a.usedAt));

        // Render table
        oms.renderTable('itemHistoryContainer', [
            { key: 'itemName', label: 'Item Name', render: h => `<strong style="color: #1976D2;">${h.itemName}</strong>` },
            { key: 'quantity', label: 'Quantity Used', render: h => `<span style="font-weight: 600; color: #D84315;">${h.quantity}</span>` },
            { key: 'orderId', label: 'Order ID', render: h => `<span class="order-id-highlight">${h.orderId}</span>` },
            { key: 'clientName', label: 'Client' },
            { key: 'venue', label: 'Venue', render: h => h.venue || 'N/A' },
            { key: 'eventDate', label: 'Event Date', render: h => Utils.formatDate(h.eventDate) },
            { key: 'functionType', label: 'Function', render: h => h.functionType || 'N/A' },
            { key: 'usedAt', label: 'Recorded On', render: h => new Date(h.usedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }
        ], filteredHistory, (row) => ``);
    },

    /**
     * Update inventory display (categories and items tables)
     */
    updateInventoryDisplay(oms) {
        // Populate category dropdown
        const select = document.getElementById('itemCategory');
        if (select) {
            select.innerHTML = `<option value="">${oms.t('selectCategory')}</option>` +
                oms.data.inventory.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        }

        // Render categories table
        oms.renderTable('categoriesContainer', [
            { key: 'name', label: oms.t('category') },
            { key: 'id', label: oms.t('items'), render: c => oms.data.inventory.items.filter(i => i.categoryId === c.id).length }
        ], oms.data.inventory.categories, (row) => `
            <button class="btn btn-danger btn-small" data-action="delete" data-type="category" data-id="${row.id}">${oms.t('delete')}</button>
        `);

        // Render items table
        oms.renderTable('itemsContainer', [
            { key: 'name', label: oms.t('item') },
            { key: 'categoryId', label: oms.t('category'), render: i => oms.data.inventory.categories.find(c => c.id === i.categoryId)?.name || oms.t('na') },
            { key: 'quantity', label: oms.t('stock') }
        ], oms.data.inventory.items, (row) => `
            <button class="btn btn-success btn-small" onclick="Inventory.increaseItemQuantity(window.OMS, '${row.id}')">+</button>
            <button class="btn btn-warning btn-small" onclick="Inventory.decreaseItemQuantity(window.OMS, '${row.id}')">-</button>
            <button class="btn btn-primary btn-small" onclick="Inventory.editInventoryItem(window.OMS, '${row.id}')">✏️ ${oms.t('edit')}</button>
            <button class="btn btn-danger btn-small" data-action="delete" data-type="item" data-id="${row.id}">🗑️ ${oms.t('delete')}</button>
        `);
    },

    // ==================== PHASE 4B: ITEM MANAGEMENT ====================

    /**
     * Add new category
     */
    addCategory(oms) {
        const name = Utils.get('categoryName');
        if (!name) return;

        const category = {
            id: Utils.generateId(),
            name: name,
            createdAt: new Date().toISOString()
        };

        oms.createItem('category', category);

        Utils.set('categoryName', '');
        oms.saveToStorage();

        // Save to Firestore
        oms.saveInventoryCategoryToFirestore(category);

        Inventory.updateInventoryDisplay(oms);
        oms.showToast('Category added and synced!');
    },

    /**
     * Add new inventory item
     */
    addItem(oms) {
        const categoryId = Utils.get('itemCategory');
        const name = Utils.get('itemName');
        const quantity = parseInt(Utils.get('itemQuantity')) || 0;

        if (!categoryId || !name) {
            oms.showToast('Select category and enter name', 'error');
            return;
        }

        const item = {
            id: Utils.generateId(),
            categoryId: categoryId,
            name: name,
            quantity: quantity,
            createdAt: new Date().toISOString()
        };

        oms.createItem('item', item);

        Utils.set('itemName', '');
        Utils.set('itemQuantity', '');
        oms.saveToStorage();

        // Save to Firestore
        oms.saveInventoryItemToFirestore(item);

        Inventory.updateInventoryDisplay(oms);
        oms.showToast('Item added and synced!');
    },

    /**
     * Show edit modal for inventory item
     */
    editInventoryItem(oms, id) {
        const item = oms.data.inventory.items.find(i => i.id === id);
        if (!item) return;

        // Show edit modal
        oms.showModal('Edit Inventory Item', `
            <div class="form-group">
                <label class="form-label required">Item Name</label>
                <input type="text" id="editItemName" class="form-input" value="${item.name}">
            </div>
            <div class="form-group">
                <label class="form-label required">Category</label>
                <select id="editItemCategory" class="form-select">
                    ${oms.data.inventory.categories.map(c => `
                        <option value="${c.id}" ${c.id === item.categoryId ? 'selected' : ''}>${c.name}</option>
                    `).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label required">Pieces</label>
                <input type="number" id="editItemQuantity" class="form-input" value="${item.quantity}" min="0">
            </div>
            <div class="btn-group">
                <button class="btn btn-primary" onclick="Inventory.saveInventoryItemEdit(window.OMS, '${id}')">💾 Save Changes</button>
                <button class="btn btn-secondary" onclick="OMS.closeModal()">Cancel</button>
            </div>
        `);
    },

    /**
     * Save edited inventory item
     */
    saveInventoryItemEdit(oms, id) {
        const item = oms.data.inventory.items.find(i => i.id === id);
        if (!item) return;

        const name = Utils.get('editItemName');
        const categoryId = Utils.get('editItemCategory');
        const quantity = parseInt(Utils.get('editItemQuantity')) || 0;

        if (!name || !categoryId) {
            oms.showToast('Please fill all required fields', 'error');
            return;
        }

        // Update item
        item.name = name;
        item.categoryId = categoryId;
        item.quantity = quantity;
        item.updatedAt = new Date().toISOString();

        oms.saveToStorage();

        // Save to Firestore
        oms.saveInventoryItemToFirestore(item);

        oms.closeModal();
        Inventory.updateInventoryDisplay(oms);
        oms.showToast('Item updated and synced!');
    },

    /**
     * Increase item quantity by 1
     */
    async increaseItemQuantity(oms, id) {
        const item = oms.data.inventory.items.find(i => i.id === id);
        if (!item) return;

        item.quantity = (item.quantity || 0) + 1;
        item.updatedAt = new Date().toISOString();

        oms.saveToStorage();

        // Save to Firestore
        await oms.saveInventoryItemToFirestore(item);

        Inventory.updateInventoryDisplay(oms);
        oms.showToast(`${item.name} quantity increased to ${item.quantity}`);
    },

    /**
     * Decrease item quantity by 1
     */
    async decreaseItemQuantity(oms, id) {
        const item = oms.data.inventory.items.find(i => i.id === id);
        if (!item) return;

        if (item.quantity > 0) {
            item.quantity -= 1;
            item.updatedAt = new Date().toISOString();

            oms.saveToStorage();

            // Save to Firestore
            await oms.saveInventoryItemToFirestore(item);

            Inventory.updateInventoryDisplay(oms);
            oms.showToast(`${item.name} quantity decreased to ${item.quantity}`);
        } else {
            oms.showToast('Quantity cannot be negative', 'error');
        }
    },

    // ==================== PHASE 4C: BATCH OPERATIONS & PHOTOS ====================

    /**
     * Show batch update inventory modal
     */
    batchUpdateInventory(oms) {
        const content = `
            <h3>Batch Update Inventory</h3>
            <div class="form-group">
                <label class="form-label">Select Operation</label>
                <select id="batchOp" class="form-select">
                    <option value="increase">Increase All Stock</option>
                    <option value="decrease">Decrease All Stock</option>
                    <option value="set">Set All Stock</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Amount</label>
                <input type="number" id="batchAmount" class="form-input" min="0">
            </div>
            <div class="btn-group">
                <button class="btn btn-primary" onclick="Inventory.executeBatchInventory(window.OMS)">Execute</button>
                <button class="btn btn-secondary" onclick="OMS.closeModal()">Cancel</button>
            </div>
        `;
        oms.showModal('Batch Operations', content);
    },

    /**
     * Execute batch inventory operation
     */
    executeBatchInventory(oms) {
        const op = Utils.get('batchOp');
        const amount = parseInt(Utils.get('batchAmount')) || 0;

        oms.data.inventory.items.forEach(item => {
            if (op === 'increase') item.quantity += amount;
            else if (op === 'decrease') item.quantity = Math.max(0, item.quantity - amount);
            else if (op === 'set') item.quantity = amount;
        });

        oms.saveToStorage();
        oms.updateAllDisplays();
        oms.closeModal();
        oms.showToast('Inventory updated!');
    },

    /**
     * Trigger photo upload for a product
     */
    uploadProductPhoto(oms, itemId) {
        oms.currentProductItemId = itemId;
        document.getElementById('productPhotoInput').click();
    },

    /**
     * Handle product photo file selection and upload
     */
    async handleProductPhotoSelect(oms, event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            oms.showToast('❌ Please select an image file', 'error');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            oms.showToast('❌ Image size must be less than 5MB', 'error');
            return;
        }

        const itemId = oms.currentProductItemId;
        const item = oms.data.inventory.items.find(i => i.id === itemId);
        if (!item) {
            oms.showToast('❌ Item not found', 'error');
            return;
        }

        const loading = oms.showLoading('Uploading image...');

        try {
            // Use the old Firebase SDK (not modular)
            const storage = firebase.storage();

            // Create filename: products/{itemId}_{timestamp}.jpg
            const timestamp = Date.now();
            const extension = file.name.split('.').pop();
            const filename = `products/${itemId}_${timestamp}.${extension}`;

            // Upload to Firebase Storage
            const storageRef = storage.ref(filename);
            const uploadTask = await storageRef.put(file);

            // Get download URL
            const imageUrl = await uploadTask.ref.getDownloadURL();

            // Update item in local data
            item.imageUrl = imageUrl;
            item.updatedAt = new Date().toISOString();

            // Save to Firestore
            await oms.saveInventoryItemToFirestore(item);

            // Save to localStorage
            oms.saveToStorage();

            oms.hideLoading(loading);
            oms.showToast(`✅ Photo uploaded successfully for ${item.name}!`, 'success');

            // Re-render to show new image
            Inventory.renderProductPhotos(oms);

            // Reset file input
            event.target.value = '';

        } catch (error) {
            console.error('❌ Error uploading photo:', error);
            oms.hideLoading(loading);
            oms.showToast('❌ Upload failed: ' + error.message, 'error');
        }
    },

    /**
     * Toggle item visibility on quotation website
     */
    async toggleItemVisibility(oms, itemId, isVisible) {
        const item = oms.data.inventory.items.find(i => i.id === itemId);
        if (!item) {
            oms.showToast('❌ Item not found', 'error');
            return;
        }

        const loading = oms.showLoading(isVisible ? 'Showing on website...' : 'Hiding from website...');

        try {
            // Update item in local data
            item.visibleOnWebsite = isVisible;
            item.updatedAt = new Date().toISOString();

            // Save to Firestore
            await oms.saveInventoryItemToFirestore(item);

            // Save to localStorage
            oms.saveToStorage();

            oms.hideLoading(loading);
            oms.showToast(
                isVisible
                    ? `✅ "${item.name}" is now visible on quotation website`
                    : `🔒 "${item.name}" is now hidden from quotation website`,
                'success'
            );

            // Re-render to update toggle state
            Inventory.renderProductPhotos(oms);

        } catch (error) {
            console.error('❌ Error toggling visibility:', error);
            oms.hideLoading(loading);
            oms.showToast('❌ Failed to update visibility: ' + error.message, 'error');
        }
    }

};

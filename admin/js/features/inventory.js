/* ============================================
   INVENTORY - Inventory management display logic
   ============================================ */

/**
 * Inventory Feature Module
 *
 * Provides:
 * - Category and item table rendering
 * - Inventory display updates
 *
 * @exports Inventory
 */

export const Inventory = {
    /**
     * Update inventory display (categories dropdown and tables)
     * @param {Object} oms - Reference to OMS
     */
    updateDisplay(oms) {
        this.updateCategoryDropdown(oms);
        this.renderCategoriesTable(oms);
        this.renderItemsTable(oms);
    },

    /**
     * Update category dropdown for item creation
     * @param {Object} oms - Reference to OMS
     */
    updateCategoryDropdown(oms) {
        const select = document.getElementById('itemCategory');
        if (select) {
            select.innerHTML = `<option value="">${oms.t('selectCategory')}</option>` +
                oms.data.inventory.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        }
    },

    /**
     * Render categories table
     * @param {Object} oms - Reference to OMS
     */
    renderCategoriesTable(oms) {
        oms.renderTable('categoriesContainer', [
            { key: 'name', label: oms.t('category') },
            { key: 'id', label: oms.t('items'), render: c => oms.data.inventory.items.filter(i => i.categoryId === c.id).length }
        ], oms.data.inventory.categories, (row) => `
            <button class="btn btn-danger btn-small" data-action="delete" data-type="category" data-id="${row.id}">${oms.t('delete')}</button>
        `);
    },

    /**
     * Render items table with stock levels
     * @param {Object} oms - Reference to OMS
     */
    renderItemsTable(oms) {
        oms.renderTable('itemsContainer', [
            { key: 'name', label: oms.t('item') },
            { key: 'categoryId', label: oms.t('category'), render: i => oms.data.inventory.categories.find(c => c.id === i.categoryId)?.name || oms.t('na') },
            { key: 'quantity', label: oms.t('stock') }
        ], oms.data.inventory.items, (row) => `
            <button class="btn btn-success btn-small" onclick="OMS.increaseItemQuantity('${row.id}')">+</button>
            <button class="btn btn-warning btn-small" onclick="OMS.decreaseItemQuantity('${row.id}')">-</button>
            <button class="btn btn-primary btn-small" onclick="OMS.editInventoryItem('${row.id}')">✏️ ${oms.t('edit')}</button>
            <button class="btn btn-danger btn-small" data-action="delete" data-type="item" data-id="${row.id}">🗑️ ${oms.t('delete')}</button>
        `);
    },

    /**
     * Get low stock items (below threshold)
     * @param {Object} data - OMS data
     * @param {number} threshold - Low stock threshold
     * @returns {Array} Low stock items
     */
    getLowStockItems(data, threshold) {
        return data.inventory.items.filter(i => i.quantity <= threshold);
    },

    /**
     * Get items by category
     * @param {Object} data - OMS data
     * @param {string} categoryId - Category ID
     * @returns {Array} Items in category
     */
    getItemsByCategory(data, categoryId) {
        return data.inventory.items.filter(i => i.categoryId === categoryId);
    }
};

// Make globally available
if (typeof window !== 'undefined') {
    window.Inventory = Inventory;
}

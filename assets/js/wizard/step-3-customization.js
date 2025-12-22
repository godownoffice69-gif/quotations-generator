/**
 * ============================================
 * STEP 3: ITEM CUSTOMIZATION
 * ============================================
 *
 * Allows customer to:
 * - View items in selected package
 * - Adjust quantities
 * - Add more items from catalog
 * - Remove items
 */

export class Step3Customization {
    constructor(wizard) {
        this.wizard = wizard;
        this.allItems = [];
        this.categories = [];
        this.selectedCategory = 'all';
    }

    /**
     * Initialize step
     */
    async init() {
        console.log('🎨 Step 3 initialized');
        await this.loadInventory();
        this.setupEventListeners();
    }

    /**
     * Load inventory from Firebase
     */
    async loadInventory() {
        try {
            const { getFirestore, doc, collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const db = getFirestore();

            console.log('📦 Loading inventory from correct Firestore location (same as PackageManager)...');

            // Load categories from: inventory/categories/items
            const categoriesRef = collection(doc(db, 'inventory', 'categories'), 'items');
            const categoriesSnapshot = await getDocs(categoriesRef);
            this.categories = [];
            categoriesSnapshot.forEach(docSnap => {
                this.categories.push({ id: docSnap.id, ...docSnap.data() });
            });

            // Load items from: inventory/items/list
            const itemsRef = collection(doc(db, 'inventory', 'items'), 'list');
            const itemsSnapshot = await getDocs(itemsRef);
            this.allItems = [];
            itemsSnapshot.forEach(docSnap => {
                this.allItems.push({ id: docSnap.id, ...docSnap.data() });
            });

            console.log(`✅ Loaded ${this.allItems.length} items, ${this.categories.length} categories`);

        } catch (error) {
            console.error('❌ Error loading inventory:', error);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for step enter
        document.addEventListener('wizardStepEnter', (e) => {
            if (e.detail.step === 3) {
                this.onStepEnter();
            }
        });

        // Listen for validation
        document.addEventListener('wizardStepValidate', (e) => {
            if (e.detail.step === 3) {
                if (!this.validate()) {
                    e.preventDefault();
                }
            }
        });

        // Category filter
        document.addEventListener('click', (e) => {
            if (e.target.closest('.category-filter-btn')) {
                const btn = e.target.closest('.category-filter-btn');
                this.filterByCategory(btn.dataset.categoryId);
            }
        });

        // Add item
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-item-btn')) {
                const btn = e.target.closest('.add-item-btn');
                const itemId = btn.dataset.itemId;
                this.addItemToSelection(itemId);
            }
        });

        // Remove item
        document.addEventListener('click', (e) => {
            if (e.target.closest('.remove-item-btn')) {
                const btn = e.target.closest('.remove-item-btn');
                const itemId = btn.dataset.itemId;
                this.removeItemFromSelection(itemId);
            }
        });

        // Quantity controls
        document.addEventListener('click', (e) => {
            if (e.target.closest('.qty-decrease')) {
                const btn = e.target.closest('.qty-decrease');
                const itemId = btn.dataset.itemId;
                this.decreaseQuantity(itemId);
            }

            if (e.target.closest('.qty-increase')) {
                const btn = e.target.closest('.qty-increase');
                const itemId = btn.dataset.itemId;
                this.increaseQuantity(itemId);
            }
        });

        // Toggle view (selected items vs catalog)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-toggle-btn')) {
                const btn = e.target.closest('.view-toggle-btn');
                this.toggleView(btn.dataset.view);
            }
        });
    }

    /**
     * Called when step is entered
     */
    onStepEnter() {
        console.log('👋 Entered Step 3');
        this.renderView();
    }

    /**
     * Render the view
     */
    renderView() {
        this.renderSelectedItems();
        this.renderCatalog();
        this.updateNextButton();
    }

    /**
     * Render selected items (current package)
     */
    renderSelectedItems() {
        const container = document.getElementById('selected-items-container');
        if (!container) return;

        const leadData = this.wizard.getLeadData();
        const selectedItems = leadData.customItems;

        if (selectedItems.length === 0) {
            container.innerHTML = `
                <div class="empty-selection">
                    <div class="empty-icon">📦</div>
                    <h3>No items selected yet</h3>
                    <p>Browse the catalog below to add effects to your package</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="selected-items-header">
                <h3>Your Selected Effects (${selectedItems.length} items)</h3>
                <p>Adjust quantities or remove items as needed</p>
            </div>

            <div class="selected-items-grid">
        `;

        selectedItems.forEach(item => {
            const fullItem = this.allItems.find(i => i.id === item.id);
            const imageUrl = fullItem?.imageUrl || 'https://via.placeholder.com/300x200?text=Effect';

            html += `
                <div class="selected-item-card">
                    <div class="selected-item-image">
                        <img src="${imageUrl}" alt="${item.name}" loading="lazy">
                        <button class="remove-item-btn" data-item-id="${item.id}" title="Remove">
                            ❌
                        </button>
                    </div>
                    <div class="selected-item-info">
                        <h4>${item.name}</h4>
                        <p class="selected-item-category">${item.categoryName || ''}</p>
                        <div class="selected-item-qty">
                            <button class="qty-decrease" data-item-id="${item.id}">➖</button>
                            <span class="qty-value">${item.quantity}</span>
                            <button class="qty-increase" data-item-id="${item.id}">➕</button>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
            </div>
        `;

        container.innerHTML = html;
    }

    /**
     * Render catalog (all available items)
     */
    renderCatalog() {
        const container = document.getElementById('catalog-container');
        if (!container) return;

        const leadData = this.wizard.getLeadData();
        const selectedItemIds = leadData.customItems.map(i => i.id);

        // Render category filters
        let filterHtml = `
            <div class="catalog-header">
                <h3>Add More Effects</h3>
                <p>Browse our complete catalog by category</p>
            </div>

            <div class="category-filters">
                <button class="category-filter-btn ${this.selectedCategory === 'all' ? 'active' : ''}" data-category-id="all">
                    All Effects
                </button>
        `;

        this.categories.forEach(cat => {
            filterHtml += `
                <button class="category-filter-btn ${this.selectedCategory === cat.id ? 'active' : ''}" data-category-id="${cat.id}">
                    ${cat.name}
                </button>
            `;
        });

        filterHtml += `</div>`;

        // Filter items
        let filteredItems = this.allItems;
        if (this.selectedCategory !== 'all') {
            filteredItems = this.allItems.filter(item => item.categoryId === this.selectedCategory);
        }

        // Render items
        let itemsHtml = `<div class="catalog-grid">`;

        filteredItems.forEach(item => {
            const isSelected = selectedItemIds.includes(item.id);
            const imageUrl = item.imageUrl || 'https://via.placeholder.com/300x200?text=Effect';

            itemsHtml += `
                <div class="catalog-item-card ${isSelected ? 'already-selected' : ''}">
                    <div class="catalog-item-image">
                        <img src="${imageUrl}" alt="${item.name}" loading="lazy">
                        ${isSelected ? '<div class="already-selected-badge">✓ Added</div>' : ''}
                    </div>
                    <div class="catalog-item-info">
                        <h4>${item.name}</h4>
                        <p class="catalog-item-category">${this.getCategoryName(item.categoryId)}</p>
                        ${!isSelected ? `
                            <button class="add-item-btn" data-item-id="${item.id}">
                                ➕ Add to Package
                            </button>
                        ` : `
                            <button class="add-item-btn" data-item-id="${item.id}" disabled>
                                Already Added
                            </button>
                        `}
                    </div>
                </div>
            `;
        });

        itemsHtml += `</div>`;

        container.innerHTML = filterHtml + itemsHtml;
    }

    /**
     * Get category name by ID
     */
    getCategoryName(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        return category ? category.name : '';
    }

    /**
     * Filter by category
     */
    filterByCategory(categoryId) {
        this.selectedCategory = categoryId;

        // Update active button
        document.querySelectorAll('.category-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeBtn = document.querySelector(`[data-category-id="${categoryId}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        this.renderCatalog();
    }

    /**
     * Add item to selection
     */
    addItemToSelection(itemId) {
        const item = this.allItems.find(i => i.id === itemId);
        if (!item) return;

        const category = this.categories.find(c => c.id === item.categoryId);

        this.wizard.addItem({
            id: item.id,
            name: item.name,
            categoryId: item.categoryId,
            categoryName: category?.name || '',
            imageUrl: item.imageUrl || ''
        });

        this.renderView();
        this.wizard.showSuccess(`Added ${item.name} to your package`);
    }

    /**
     * Remove item from selection
     */
    removeItemFromSelection(itemId) {
        this.wizard.removeItem(itemId);
        this.renderView();
        this.wizard.showSuccess('Item removed from package');
    }

    /**
     * Increase quantity
     */
    increaseQuantity(itemId) {
        const leadData = this.wizard.getLeadData();
        const item = leadData.customItems.find(i => i.id === itemId);
        if (item) {
            this.wizard.updateItemQuantity(itemId, item.quantity + 1);
            this.renderView();
        }
    }

    /**
     * Decrease quantity
     */
    decreaseQuantity(itemId) {
        const leadData = this.wizard.getLeadData();
        const item = leadData.customItems.find(i => i.id === itemId);
        if (item && item.quantity > 1) {
            this.wizard.updateItemQuantity(itemId, item.quantity - 1);
            this.renderView();
        }
    }

    /**
     * Update next button state
     */
    updateNextButton() {
        const nextBtn = document.querySelector('#step-3 [data-wizard-next]');
        const leadData = this.wizard.getLeadData();

        if (nextBtn) {
            nextBtn.disabled = leadData.customItems.length === 0;
        }
    }

    /**
     * Validate step
     */
    validate() {
        const leadData = this.wizard.getLeadData();
        if (leadData.customItems.length === 0) {
            this.wizard.showError('Please add at least one effect to your package');
            return false;
        }
        return true;
    }
}

// Make globally available
if (typeof window !== 'undefined') {
    window.Step3Customization = Step3Customization;
}

/**
 * ============================================
 * PACKAGE MANAGER - Admin package CRUD operations
 * ============================================
 *
 * Provides:
 * - Create packages
 * - Edit packages
 * - Delete packages
 * - Manage package items
 */

export class PackageManager {
    constructor() {
        this.packages = [];
        this.inventory = {
            items: [],
            categories: []
        };
        this.currentPackage = null;
        this.editMode = false;
    }

    /**
     * Initialize package manager
     */
    async init() {
        console.log('📦 Package Manager initialized');

        try {
            await this.loadInventory();
            await this.loadPackages();
        } catch (error) {
            console.error('❌ Error initializing package manager:', error);
            // Still render even if loading fails
        }

        this.setupEventListeners();
        this.render(); // Always render, even if loading failed
    }

    /**
     * Load inventory from Firebase
     */
    async loadInventory() {
        try {
            const { getFirestore, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const db = getFirestore();

            const dataDoc = await getDoc(doc(db, 'admin', 'data'));
            if (dataDoc.exists()) {
                const data = dataDoc.data();
                this.inventory.items = data.inventory?.items || [];
                this.inventory.categories = data.inventory?.categories || [];
                console.log(`✅ Loaded ${this.inventory.items.length} items`);
            }
        } catch (error) {
            console.error('❌ Error loading inventory:', error);
        }
    }

    /**
     * Load packages from Firebase
     */
    async loadPackages() {
        try {
            const { getFirestore, collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const db = getFirestore();

            const snapshot = await getDocs(collection(db, 'packages'));
            this.packages = [];

            snapshot.forEach(doc => {
                this.packages.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            console.log(`✅ Loaded ${this.packages.length} packages`);
        } catch (error) {
            console.error('❌ Error loading packages:', error);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Create new package button
        document.addEventListener('click', (e) => {
            if (e.target.matches('#create-package-btn')) {
                this.openCreateModal();
            }

            if (e.target.matches('#save-package-btn')) {
                this.savePackage();
            }

            if (e.target.matches('#cancel-package-btn')) {
                this.closeModal();
            }

            if (e.target.closest('.edit-package-btn')) {
                const btn = e.target.closest('.edit-package-btn');
                const packageId = btn.dataset.packageId;
                this.editPackage(packageId);
            }

            if (e.target.closest('.delete-package-btn')) {
                const btn = e.target.closest('.delete-package-btn');
                const packageId = btn.dataset.packageId;
                this.deletePackage(packageId);
            }

            if (e.target.matches('#add-item-to-package-btn')) {
                this.addItemToPackage();
            }

            if (e.target.closest('.remove-package-item-btn')) {
                const btn = e.target.closest('.remove-package-item-btn');
                const itemId = btn.dataset.itemId;
                this.removeItemFromPackage(itemId);
            }

            if (e.target.closest('.package-item-qty-decrease')) {
                const btn = e.target.closest('.package-item-qty-decrease');
                const itemId = btn.dataset.itemId;
                this.adjustItemQuantity(itemId, -1);
            }

            if (e.target.closest('.package-item-qty-increase')) {
                const btn = e.target.closest('.package-item-qty-increase');
                const itemId = btn.dataset.itemId;
                this.adjustItemQuantity(itemId, 1);
            }
        });
    }

    /**
     * Render packages list
     */
    render() {
        const container = document.getElementById('packages-container');
        if (!container) return;

        // Check if there was a loading error (packages array exists but is empty AND inventory is empty too)
        if (this.packages.length === 0 && this.inventory.items.length === 0) {
            console.error('⚠️ PACKAGES TAB ERROR: Unable to load data from Firestore');
            console.error('📋 This usually means Firestore security rules are not deployed yet');
            console.error('🔧 Follow the instructions shown on screen to fix this');

            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #64748B;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
                    <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: #1E293B;">Firestore Rules Not Deployed</h3>
                    <p style="margin-bottom: 1rem; color: #DC2626; font-weight: 600;">The Firestore security rules need to be deployed to Firebase Console</p>
                    <div style="background: #FEE2E2; border: 2px solid #DC2626; padding: 1.5rem; border-radius: 8px; margin: 1rem auto; max-width: 600px; text-align: left;">
                        <strong style="color: #991B1B; font-size: 1.1rem;">⚡ REQUIRED ACTION - Deploy Firestore Rules:</strong>
                        <ol style="margin: 1rem 0 0 1.5rem; color: #991B1B; line-height: 1.8;">
                            <li>Open <a href="https://console.firebase.google.com/project/firepowersfx-2558/firestore/rules" target="_blank" style="color: #DC2626; text-decoration: underline;">Firebase Console → Firestore Rules</a></li>
                            <li>Click the "Publish" button to deploy the rules from your firestore.rules file</li>
                            <li>Wait for deployment to complete (usually 10-30 seconds)</li>
                            <li>Return here and click the Reload button below</li>
                        </ol>
                    </div>
                    <div style="background: #DBEAFE; padding: 1rem; border-radius: 8px; margin: 1rem auto; max-width: 600px; text-align: left;">
                        <strong style="color: #1E40AF;">ℹ️ Why is this needed?</strong>
                        <p style="margin: 0.5rem 0 0 0; color: #1E40AF; font-size: 0.9rem;">
                            The new Packages and Leads features require updated Firestore security rules.
                            These rules are already in your firestore.rules file, but must be deployed to Firebase Console to take effect.
                        </p>
                    </div>
                    <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 1.5rem; padding: 1rem 2rem; font-size: 1.1rem;">
                        🔄 Reload Page After Deploying Rules
                    </button>
                </div>
            `;
            return;
        }

        if (this.packages.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #64748B;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">📦</div>
                    <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: #1E293B;">No packages yet</h3>
                    <p>Create your first package to get started</p>
                    <button id="create-package-btn" class="btn btn-primary" style="margin-top: 1rem;">
                        + Create Package
                    </button>
                </div>
            `;
            return;
        }

        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h3 style="font-size: 1.5rem; font-weight: 700;">Packages (${this.packages.length})</h3>
                <button id="create-package-btn" class="btn btn-primary">
                    + Create Package
                </button>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem;">
        `;

        this.packages.forEach(pkg => {
            const badgeClass = pkg.type === 'premium' ? 'badge-warning' : 'badge-info';
            const badgeText = pkg.type === 'premium' ? '💎 Premium' : '⭐ Basic';

            html += `
                <div class="package-admin-card">
                    <div class="package-admin-header">
                        <span class="badge ${badgeClass}">${badgeText}</span>
                        <span class="badge badge-secondary">${pkg.eventType || 'All Events'}</span>
                    </div>

                    <h4 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">
                        ${pkg.name}
                    </h4>

                    <p style="color: #64748B; margin-bottom: 1rem; font-size: 0.875rem;">
                        ${pkg.description || 'No description'}
                    </p>

                    <div class="package-admin-stats">
                        <div class="stat-item">
                            <div class="stat-value">${pkg.items.length}</div>
                            <div class="stat-label">Items</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${pkg.items.reduce((sum, item) => sum + item.quantity, 0)}</div>
                            <div class="stat-label">Total Units</div>
                        </div>
                    </div>

                    <div class="package-admin-actions">
                        <button class="edit-package-btn btn btn-primary btn-small" data-package-id="${pkg.id}">
                            ✏️ Edit
                        </button>
                        <button class="delete-package-btn btn btn-danger btn-small" data-package-id="${pkg.id}">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
        });

        html += `</div>`;

        container.innerHTML = html;
    }

    /**
     * Open create modal
     */
    openCreateModal() {
        this.currentPackage = {
            name: '',
            type: 'basic',
            eventType: 'wedding',
            description: '',
            items: []
        };
        this.editMode = false;
        this.showModal();
    }

    /**
     * Edit package
     */
    async editPackage(packageId) {
        const pkg = this.packages.find(p => p.id === packageId);
        if (!pkg) return;

        this.currentPackage = { ...pkg };
        this.editMode = true;
        this.showModal();
    }

    /**
     * Show modal
     */
    showModal() {
        const modal = document.getElementById('package-modal');
        if (!modal) return;

        // Populate form
        document.getElementById('package-name').value = this.currentPackage.name || '';
        document.getElementById('package-type').value = this.currentPackage.type || 'basic';
        document.getElementById('package-event-type').value = this.currentPackage.eventType || 'wedding';
        document.getElementById('package-description').value = this.currentPackage.description || '';

        // Update modal title
        const modalTitle = document.getElementById('package-modal-title');
        if (modalTitle) {
            modalTitle.textContent = this.editMode ? 'Edit Package' : 'Create Package';
        }

        // Render items
        this.renderPackageItems();

        modal.style.display = 'block';
    }

    /**
     * Close modal
     */
    closeModal() {
        const modal = document.getElementById('package-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.currentPackage = null;
        this.editMode = false;
    }

    /**
     * Render package items in modal
     */
    renderPackageItems() {
        const container = document.getElementById('package-items-list');
        if (!container) return;

        if (!this.currentPackage.items || this.currentPackage.items.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #64748B;">
                    <p>No items added yet</p>
                </div>
            `;
            return;
        }

        let html = '';
        this.currentPackage.items.forEach(item => {
            const inventoryItem = this.inventory.items.find(i => i.id === item.id);
            const categoryName = this.inventory.categories.find(c => c.id === inventoryItem?.categoryId)?.name || '';

            html += `
                <div class="package-item-row">
                    <div class="package-item-info">
                        <div class="package-item-name">${item.name}</div>
                        <div class="package-item-category">${categoryName}</div>
                    </div>
                    <div class="package-item-qty-controls">
                        <button class="package-item-qty-decrease" data-item-id="${item.id}">➖</button>
                        <span class="package-item-qty-value">${item.quantity}</span>
                        <button class="package-item-qty-increase" data-item-id="${item.id}">➕</button>
                    </div>
                    <button class="remove-package-item-btn btn btn-danger btn-small" data-item-id="${item.id}">
                        ❌
                    </button>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    /**
     * Add item to package
     */
    addItemToPackage() {
        const selectItem = document.getElementById('select-inventory-item');
        if (!selectItem) return;

        const selectedItemId = selectItem.value;
        if (!selectedItemId) {
            alert('Please select an item');
            return;
        }

        const inventoryItem = this.inventory.items.find(i => i.id === selectedItemId);
        if (!inventoryItem) return;

        // Check if item already exists
        const existingItem = this.currentPackage.items.find(i => i.id === selectedItemId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.currentPackage.items.push({
                id: inventoryItem.id,
                name: inventoryItem.name,
                categoryId: inventoryItem.categoryId,
                categoryName: this.inventory.categories.find(c => c.id === inventoryItem.categoryId)?.name || '',
                quantity: 1,
                imageUrl: inventoryItem.imageUrl || ''
            });
        }

        this.renderPackageItems();
        selectItem.value = '';
    }

    /**
     * Remove item from package
     */
    removeItemFromPackage(itemId) {
        this.currentPackage.items = this.currentPackage.items.filter(i => i.id !== itemId);
        this.renderPackageItems();
    }

    /**
     * Adjust item quantity
     */
    adjustItemQuantity(itemId, delta) {
        const item = this.currentPackage.items.find(i => i.id === itemId);
        if (!item) return;

        item.quantity = Math.max(1, item.quantity + delta);
        this.renderPackageItems();
    }

    /**
     * Save package
     */
    async savePackage() {
        try {
            // Validate
            const name = document.getElementById('package-name').value.trim();
            const type = document.getElementById('package-type').value;
            const eventType = document.getElementById('package-event-type').value;
            const description = document.getElementById('package-description').value.trim();

            if (!name) {
                alert('Please enter a package name');
                return;
            }

            if (this.currentPackage.items.length === 0) {
                alert('Please add at least one item to the package');
                return;
            }

            const { getFirestore, collection, doc, setDoc, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const db = getFirestore();

            const packageData = {
                name,
                type,
                eventType,
                description,
                items: this.currentPackage.items,
                updatedAt: serverTimestamp()
            };

            if (this.editMode) {
                // Update existing package
                await setDoc(doc(db, 'packages', this.currentPackage.id), packageData);
                console.log('✅ Package updated:', this.currentPackage.id);

                // Update local data
                const pkgIndex = this.packages.findIndex(p => p.id === this.currentPackage.id);
                if (pkgIndex >= 0) {
                    this.packages[pkgIndex] = { id: this.currentPackage.id, ...packageData };
                }

                OMS.showNotification('Package updated successfully', 'success');
            } else {
                // Create new package
                packageData.createdAt = serverTimestamp();
                const docRef = await addDoc(collection(db, 'packages'), packageData);
                console.log('✅ Package created:', docRef.id);

                // Add to local data
                this.packages.push({
                    id: docRef.id,
                    ...packageData
                });

                OMS.showNotification('Package created successfully', 'success');
            }

            this.closeModal();
            this.render();

        } catch (error) {
            console.error('❌ Error saving package:', error);
            OMS.showNotification('Error saving package', 'error');
        }
    }

    /**
     * Delete package
     */
    async deletePackage(packageId) {
        if (!confirm('Are you sure you want to delete this package? This cannot be undone.')) {
            return;
        }

        try {
            const { getFirestore, doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const db = getFirestore();

            await deleteDoc(doc(db, 'packages', packageId));
            console.log('✅ Package deleted:', packageId);

            // Remove from local data
            this.packages = this.packages.filter(p => p.id !== packageId);

            this.render();
            OMS.showNotification('Package deleted successfully', 'success');

        } catch (error) {
            console.error('❌ Error deleting package:', error);
            OMS.showNotification('Error deleting package', 'error');
        }
    }
}

// Make globally available
if (typeof window !== 'undefined') {
    window.PackageManager = PackageManager;
}

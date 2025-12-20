/**
 * ============================================
 * STEP 2: PACKAGE SELECTION
 * ============================================
 *
 * Allows customer to choose:
 * - Pre-made package (Basic/Premium)
 * - Build from scratch
 */

export class Step2PackageSelection {
    constructor(wizard) {
        this.wizard = wizard;
        this.selectedOption = null; // 'premade' or 'custom'
        this.selectedPackageId = null;
        this.packages = [];
    }

    /**
     * Initialize step
     */
    async init() {
        console.log('📦 Step 2 initialized');
        await this.loadPackages();
        this.setupEventListeners();
        this.restoreSelection();
    }

    /**
     * Load packages from Firebase
     */
    async loadPackages() {
        try {
            const { getFirestore, collection, getDocs, query, where } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const db = getFirestore();

            const leadData = this.wizard.getLeadData();
            const eventType = leadData.eventType;

            // Load packages for this event type
            const packagesQuery = query(
                collection(db, 'packages'),
                where('eventType', '==', eventType)
            );

            const snapshot = await getDocs(packagesQuery);
            this.packages = [];

            snapshot.forEach(doc => {
                this.packages.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            console.log(`✅ Loaded ${this.packages.length} packages for ${eventType}`);
            this.renderPackages();

        } catch (error) {
            console.error('❌ Error loading packages:', error);
            // If no packages, show only custom option
            this.renderPackages();
        }
    }

    /**
     * Render packages in UI
     */
    renderPackages() {
        const container = document.getElementById('packages-list');
        if (!container) return;

        const basicPackages = this.packages.filter(p => p.type === 'basic');
        const premiumPackages = this.packages.filter(p => p.type === 'premium');

        let html = '';

        // Show pre-made packages section only if packages exist
        if (this.packages.length > 0) {
            html += `
                <div class="package-section">
                    <h3 class="package-section-title">✨ Pre-Made Packages</h3>
                    <p class="package-section-subtitle">Curated selections perfect for your event</p>

                    <div class="packages-grid">
            `;

            // Basic packages
            basicPackages.forEach(pkg => {
                html += this.renderPackageCard(pkg, 'basic');
            });

            // Premium packages
            premiumPackages.forEach(pkg => {
                html += this.renderPackageCard(pkg, 'premium');
            });

            html += `
                    </div>
                </div>

                <div class="package-divider">
                    <span>OR</span>
                </div>
            `;
        }

        // Custom option always available
        html += `
            <div class="package-section">
                <h3 class="package-section-title">🎨 Build Your Own</h3>
                <p class="package-section-subtitle">Create a custom package from scratch</p>

                <div class="custom-package-card" data-package-option="custom">
                    <div class="custom-package-icon">🎯</div>
                    <h4>Build From Scratch</h4>
                    <p>Select exactly what you need from our complete catalog of effects</p>
                    <ul class="custom-package-features">
                        <li>✓ Full control over every item</li>
                        <li>✓ Perfect for unique events</li>
                        <li>✓ Mix and match as you like</li>
                    </ul>
                    <button class="custom-package-btn">
                        Start Building →
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    /**
     * Render individual package card
     */
    renderPackageCard(pkg, type) {
        const badge = type === 'premium' ? '💎 PREMIUM' : '⭐ BASIC';
        const badgeClass = type === 'premium' ? 'premium-badge' : 'basic-badge';

        return `
            <div class="package-card" data-package-id="${pkg.id}" data-package-option="premade">
                <div class="package-badge ${badgeClass}">${badge}</div>
                <h4 class="package-name">${pkg.name}</h4>
                <p class="package-description">${pkg.description || ''}</p>

                <div class="package-items-preview">
                    <h5>Included Effects:</h5>
                    <ul class="package-items-list">
                        ${pkg.items.slice(0, 5).map(item => `
                            <li>
                                <span class="package-item-name">${item.name}</span>
                                <span class="package-item-qty">×${item.quantity}</span>
                            </li>
                        `).join('')}
                        ${pkg.items.length > 5 ? `<li class="package-more">+ ${pkg.items.length - 5} more effects</li>` : ''}
                    </ul>
                </div>

                <button class="package-select-btn">
                    Select This Package →
                </button>
            </div>
        `;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for step enter
        document.addEventListener('wizardStepEnter', (e) => {
            if (e.detail.step === 2) {
                this.onStepEnter();
            }
        });

        // Listen for validation
        document.addEventListener('wizardStepValidate', (e) => {
            if (e.detail.step === 2) {
                if (!this.validate()) {
                    e.preventDefault();
                }
            }
        });

        // Package selection
        document.addEventListener('click', (e) => {
            // Pre-made package
            if (e.target.closest('.package-card')) {
                const card = e.target.closest('.package-card');
                const packageId = card.dataset.packageId;
                this.selectPremadePackage(packageId);
            }

            // Custom package
            if (e.target.closest('.custom-package-card')) {
                this.selectCustomOption();
            }
        });
    }

    /**
     * Called when step is entered
     */
    async onStepEnter() {
        console.log('👋 Entered Step 2');
        await this.loadPackages();
    }

    /**
     * Select pre-made package
     */
    selectPremadePackage(packageId) {
        const pkg = this.packages.find(p => p.id === packageId);
        if (!pkg) return;

        this.selectedOption = 'premade';
        this.selectedPackageId = packageId;

        // Update UI
        document.querySelectorAll('.package-card').forEach(card => {
            card.classList.remove('selected');
        });

        const selectedCard = document.querySelector(`[data-package-id="${packageId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }

        document.querySelector('.custom-package-card')?.classList.remove('selected');

        // Update wizard data
        this.wizard.setPackage('premade', packageId, pkg.name);

        // Load package items into wizard
        this.wizard.leadData.customItems = pkg.items.map(item => ({
            id: item.id,
            name: item.name,
            categoryId: item.categoryId || '',
            categoryName: item.categoryName || '',
            quantity: item.quantity,
            imageUrl: item.imageUrl || ''
        }));

        this.wizard.updateItemCounter();

        // Enable next button
        const nextBtn = document.querySelector('#step-2 [data-wizard-next]');
        if (nextBtn) {
            nextBtn.disabled = false;
        }

        console.log('✅ Selected package:', pkg.name);
    }

    /**
     * Select custom build option
     */
    selectCustomOption() {
        this.selectedOption = 'custom';
        this.selectedPackageId = null;

        // Update UI
        document.querySelectorAll('.package-card').forEach(card => {
            card.classList.remove('selected');
        });

        const customCard = document.querySelector('.custom-package-card');
        if (customCard) {
            customCard.classList.add('selected');
        }

        // Update wizard data
        this.wizard.setPackage('custom', null, null);

        // Clear items (will be added in step 3)
        this.wizard.leadData.customItems = [];
        this.wizard.updateItemCounter();

        // Enable next button
        const nextBtn = document.querySelector('#step-2 [data-wizard-next]');
        if (nextBtn) {
            nextBtn.disabled = false;
        }

        console.log('✅ Selected custom build');
    }

    /**
     * Validate step
     */
    validate() {
        if (!this.selectedOption) {
            this.wizard.showError('Please select a package or choose to build from scratch');
            return false;
        }
        return true;
    }

    /**
     * Restore previous selection
     */
    restoreSelection() {
        const leadData = this.wizard.getLeadData();
        if (leadData.packageType === 'premade' && leadData.selectedPackageId) {
            this.selectPremadePackage(leadData.selectedPackageId);
        } else if (leadData.packageType === 'custom') {
            this.selectCustomOption();
        }
    }
}

// Make globally available
if (typeof window !== 'undefined') {
    window.Step2PackageSelection = Step2PackageSelection;
}

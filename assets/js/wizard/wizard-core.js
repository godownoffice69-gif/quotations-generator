/**
 * ============================================
 * WIZARD CORE - Main wizard navigation & data management
 * ============================================
 *
 * Handles:
 * - Multi-step navigation
 * - Progress tracking
 * - Data collection across steps
 * - Lead submission
 */

export class WizardCore {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.leadData = {
            eventType: null,
            packageType: null, // 'premade' or 'custom'
            selectedPackageId: null,
            selectedPackageName: null,
            customItems: [], // [{id, name, categoryId, categoryName, quantity, imageUrl}]
            venue: {
                name: '',
                address: '',
                coordinates: null
            },
            eventDate: null,
            eventTime: null,
            customer: {
                name: '',
                phone: '',
                email: '',
                specialRequests: ''
            },
            sessionInfo: {},
            timestamp: null
        };
    }

    /**
     * Initialize wizard
     */
    init() {
        console.log('🎯 Wizard Core initialized');
        this.setupEventListeners();
        this.showStep(1);
        this.updateProgress();
        this.captureSessionInfo();
    }

    /**
     * Capture session information (IP, device, etc.)
     */
    async captureSessionInfo() {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            this.leadData.sessionInfo = {
                ip: data.ip,
                city: data.city,
                region: data.region,
                country: data.country_name,
                device: /mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
                browser: navigator.userAgent.split(')')[0].split('(')[1],
                screen: `${window.screen.width}x${window.screen.height}`,
                sessionId: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
            console.log('📍 Session captured:', this.leadData.sessionInfo.city);
        } catch (error) {
            this.leadData.sessionInfo = {
                device: /mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
                sessionId: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
        }
    }

    /**
     * Setup event listeners for navigation
     */
    setupEventListeners() {
        // Navigation buttons will be added by individual steps
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-wizard-next]')) {
                this.nextStep();
            }
            if (e.target.matches('[data-wizard-prev]')) {
                this.prevStep();
            }
            if (e.target.matches('[data-wizard-jump]')) {
                const step = parseInt(e.target.dataset.wizardJump);
                if (step <= this.currentStep) {
                    this.goToStep(step);
                }
            }
        });
    }

    /**
     * Show specific step
     */
    showStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.wizard-step').forEach(step => {
            step.classList.remove('active');
            step.style.display = 'none';
        });

        // Show current step
        const currentStepEl = document.getElementById(`step-${stepNumber}`);
        if (currentStepEl) {
            currentStepEl.classList.add('active');
            currentStepEl.style.display = 'block';

            // Trigger step enter event
            const event = new CustomEvent('wizardStepEnter', {
                detail: { step: stepNumber, leadData: this.leadData }
            });
            document.dispatchEvent(event);
        }

        this.currentStep = stepNumber;
        this.updateProgress();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Go to next step (with validation)
     */
    nextStep() {
        if (this.validateCurrentStep()) {
            if (this.currentStep < this.totalSteps) {
                this.showStep(this.currentStep + 1);
            }
        }
    }

    /**
     * Go to previous step
     */
    prevStep() {
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
        }
    }

    /**
     * Jump to specific step
     */
    goToStep(stepNumber) {
        if (stepNumber >= 1 && stepNumber <= this.totalSteps) {
            this.showStep(stepNumber);
        }
    }

    /**
     * Validate current step before proceeding
     */
    validateCurrentStep() {
        const event = new CustomEvent('wizardStepValidate', {
            detail: { step: this.currentStep, leadData: this.leadData },
            cancelable: true
        });
        document.dispatchEvent(event);

        // If event was cancelled, validation failed
        return !event.defaultPrevented;
    }

    /**
     * Update progress bar
     */
    updateProgress() {
        const progressBar = document.querySelector('.wizard-progress-fill');
        const progressText = document.querySelector('.wizard-progress-text');
        const progressSteps = document.querySelectorAll('.wizard-progress-step');

        const percentage = ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;

        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }

        if (progressText) {
            progressText.textContent = `Step ${this.currentStep} of ${this.totalSteps}`;
        }

        // Update step indicators
        progressSteps.forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove('active', 'completed');

            if (stepNum < this.currentStep) {
                step.classList.add('completed');
            } else if (stepNum === this.currentStep) {
                step.classList.add('active');
            }
        });
    }

    /**
     * Set event type
     */
    setEventType(eventType) {
        this.leadData.eventType = eventType;
        console.log('✅ Event type set:', eventType);
    }

    /**
     * Set package selection
     */
    setPackage(packageType, packageId = null, packageName = null) {
        this.leadData.packageType = packageType;
        this.leadData.selectedPackageId = packageId;
        this.leadData.selectedPackageName = packageName;
        console.log('✅ Package set:', packageType, packageId);
    }

    /**
     * Add item to custom selection
     */
    addItem(item) {
        const existingIndex = this.leadData.customItems.findIndex(i => i.id === item.id);

        if (existingIndex >= 0) {
            // Item already exists, increase quantity
            this.leadData.customItems[existingIndex].quantity += 1;
        } else {
            // New item
            this.leadData.customItems.push({
                id: item.id,
                name: item.name,
                categoryId: item.categoryId,
                categoryName: item.categoryName,
                quantity: 1,
                imageUrl: item.imageUrl || ''
            });
        }

        console.log('✅ Item added:', item.name);
        this.updateItemCounter();
    }

    /**
     * Remove item from selection
     */
    removeItem(itemId) {
        this.leadData.customItems = this.leadData.customItems.filter(i => i.id !== itemId);
        console.log('🗑️ Item removed:', itemId);
        this.updateItemCounter();
    }

    /**
     * Update item quantity
     */
    updateItemQuantity(itemId, quantity) {
        const item = this.leadData.customItems.find(i => i.id === itemId);
        if (item) {
            item.quantity = Math.max(1, Math.min(99, quantity));
            console.log('✅ Quantity updated:', item.name, item.quantity);
        }
        this.updateItemCounter();
    }

    /**
     * Update item counter in UI
     */
    updateItemCounter() {
        const counter = document.querySelector('.wizard-item-counter');
        if (counter) {
            const totalItems = this.leadData.customItems.reduce((sum, item) => sum + item.quantity, 0);
            counter.textContent = totalItems;
            counter.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    /**
     * Set venue details
     */
    setVenue(venue) {
        this.leadData.venue = {
            name: venue.name || '',
            address: venue.address || '',
            coordinates: venue.coordinates || null
        };
        console.log('✅ Venue set:', venue.name);
    }

    /**
     * Set event date and time
     */
    setEventDateTime(date, time) {
        this.leadData.eventDate = date;
        this.leadData.eventTime = time;
        console.log('✅ Event date/time set:', date, time);
    }

    /**
     * Set customer information
     */
    setCustomerInfo(customer) {
        this.leadData.customer = {
            name: customer.name || '',
            phone: customer.phone || '',
            email: customer.email || '',
            specialRequests: customer.specialRequests || ''
        };
        console.log('✅ Customer info set:', customer.name);
    }

    /**
     * Get lead data
     */
    getLeadData() {
        return this.leadData;
    }

    /**
     * Submit lead to Firebase
     */
    async submitLead() {
        try {
            console.log('📤 Submitting lead...');

            // Add timestamp
            this.leadData.timestamp = new Date().toISOString();

            // Check for popup offer in localStorage
            let popupOffer = null;
            const storedOffer = localStorage.getItem('activePopupOffer');
            if (storedOffer) {
                try {
                    popupOffer = JSON.parse(storedOffer);
                    console.log('🎯 Popup offer detected for this lead:', popupOffer);
                } catch (e) {
                    console.warn('⚠️ Failed to parse popup offer:', e);
                }
            }

            // Import Firebase
            const { getFirestore, collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const db = getFirestore();

            // Generate lead ID
            const leadId = `LEAD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

            // Prepare lead document
            const leadDoc = {
                leadId: leadId,
                status: 'new',
                eventType: this.leadData.eventType,
                packageType: this.leadData.packageType,
                selectedPackageId: this.leadData.selectedPackageId,
                selectedPackageName: this.leadData.selectedPackageName,
                items: this.leadData.customItems,
                venue: this.leadData.venue,
                eventDate: this.leadData.eventDate,
                eventTime: this.leadData.eventTime,
                customer: this.leadData.customer,
                sessionInfo: this.leadData.sessionInfo,
                popupOffer: popupOffer, // Add popup offer if exists
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                source: popupOffer ? 'exit_popup' : 'quotation_wizard'
            };

            // Save to Firestore
            const docRef = await addDoc(collection(db, 'leads'), leadDoc);
            console.log('✅ Lead submitted:', docRef.id);

            // Clear popup offer from localStorage after successful submission
            if (popupOffer) {
                localStorage.removeItem('activePopupOffer');
                console.log('🗑️ Popup offer cleared from storage');
            }

            // Mark that user has created a quotation (prevents popup from showing again)
            localStorage.setItem('quotationCreated', 'true');
            console.log('✅ Quotation created flag set - popup will not show again');

            // Track submission
            await this.trackLeadSubmission(leadId, popupOffer);

            return { success: true, leadId: leadId, docId: docRef.id };

        } catch (error) {
            console.error('❌ Error submitting lead:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Track lead submission in analytics
     */
    async trackLeadSubmission(leadId, popupOffer = null) {
        try {
            const { getFirestore, collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const db = getFirestore();

            await addDoc(collection(db, 'tracking'), {
                type: 'lead_submission',
                leadId: leadId,
                sessionId: this.leadData.sessionInfo.sessionId,
                timestamp: serverTimestamp(),
                eventType: this.leadData.eventType,
                packageType: this.leadData.packageType,
                itemCount: this.leadData.customItems.length,
                userInfo: this.leadData.sessionInfo,
                fromPopup: popupOffer ? true : false,
                popupId: popupOffer?.popupId || null,
                popupTitle: popupOffer?.popupTitle || null
            });

            console.log('📊 Lead submission tracked', popupOffer ? '(from popup)' : '');
        } catch (error) {
            console.error('⚠️ Error tracking lead:', error);
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'wizard-error';
        errorDiv.innerHTML = `
            <div class="wizard-error-content">
                <span class="wizard-error-icon">⚠️</span>
                <span class="wizard-error-text">${message}</span>
            </div>
        `;

        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'wizard-success';
        successDiv.innerHTML = `
            <div class="wizard-success-content">
                <span class="wizard-success-icon">✅</span>
                <span class="wizard-success-text">${message}</span>
            </div>
        `;

        document.body.appendChild(successDiv);

        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }
}

// Make globally available
if (typeof window !== 'undefined') {
    window.WizardCore = WizardCore;
}

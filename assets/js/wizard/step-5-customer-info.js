/**
 * ============================================
 * STEP 5: CUSTOMER INFORMATION
 * ============================================
 *
 * Collects:
 * - Customer name
 * - WhatsApp number
 * - Email (optional)
 * - Special requests
 * - Submits lead
 */

export class Step5CustomerInfo {
    constructor(wizard) {
        this.wizard = wizard;
        this.isSubmitting = false;
    }

    /**
     * Initialize step
     */
    init() {
        console.log('👤 Step 5 initialized');
        this.setupEventListeners();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for step enter
        document.addEventListener('wizardStepEnter', (e) => {
            if (e.detail.step === 5) {
                this.onStepEnter();
            }
        });

        // Listen for validation (submission)
        document.addEventListener('wizardStepValidate', (e) => {
            if (e.detail.step === 5) {
                if (!this.validate()) {
                    e.preventDefault();
                }
            }
        });

        // Form inputs - real-time validation
        const nameInput = document.getElementById('customer-name');
        const phoneInput = document.getElementById('customer-phone');
        const emailInput = document.getElementById('customer-email');
        const requestsInput = document.getElementById('special-requests');

        [nameInput, phoneInput, emailInput, requestsInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    this.handleInputChange();
                    this.updateSubmitButton();
                });
            }
        });

        // Phone number formatting
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                // Remove non-digits
                let value = e.target.value.replace(/\D/g, '');

                // Limit to 10 digits
                if (value.length > 10) {
                    value = value.slice(0, 10);
                }

                e.target.value = value;
            });
        }

        // Submit button
        const submitBtn = document.getElementById('submit-lead-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.handleSubmit();
            });
        }
    }

    /**
     * Called when step is entered
     */
    onStepEnter() {
        console.log('👋 Entered Step 5');
        this.restoreData();
        this.displaySummary();
        this.updateSubmitButton();
    }

    /**
     * Handle input change
     */
    handleInputChange() {
        const nameInput = document.getElementById('customer-name');
        const phoneInput = document.getElementById('customer-phone');
        const emailInput = document.getElementById('customer-email');
        const requestsInput = document.getElementById('special-requests');

        this.wizard.setCustomerInfo({
            name: nameInput?.value || '',
            phone: phoneInput?.value || '',
            email: emailInput?.value || '',
            specialRequests: requestsInput?.value || ''
        });
    }

    /**
     * Display summary of selections
     */
    displaySummary() {
        const container = document.getElementById('lead-summary');
        if (!container) return;

        const leadData = this.wizard.getLeadData();

        // Event Type
        const eventTypeText = this.getEventTypeText(leadData.eventType);

        // Package info
        let packageText = '';
        if (leadData.packageType === 'premade') {
            packageText = `${leadData.selectedPackageName}`;
        } else {
            packageText = 'Custom Package';
        }

        // Items count
        const totalItems = leadData.customItems.reduce((sum, item) => sum + item.quantity, 0);

        // Venue
        const venueText = leadData.venue?.name || 'Not specified';

        // Date & Time
        const dateText = leadData.eventDate ? this.formatDate(leadData.eventDate) : 'Not specified';
        const timeText = leadData.eventTime || 'Not specified';

        const html = `
            <div class="summary-section">
                <h3>📋 Review Your Request</h3>
                <p>Please verify your details before submitting</p>

                <div class="summary-grid">
                    <div class="summary-item">
                        <div class="summary-label">Event Type</div>
                        <div class="summary-value">${eventTypeText}</div>
                    </div>

                    <div class="summary-item">
                        <div class="summary-label">Package</div>
                        <div class="summary-value">${packageText}</div>
                    </div>

                    <div class="summary-item">
                        <div class="summary-label">Total Effects</div>
                        <div class="summary-value">${leadData.customItems.length} items (${totalItems} units)</div>
                    </div>

                    <div class="summary-item">
                        <div class="summary-label">Venue</div>
                        <div class="summary-value">${venueText}</div>
                    </div>

                    <div class="summary-item">
                        <div class="summary-label">Event Date</div>
                        <div class="summary-value">${dateText}</div>
                    </div>

                    <div class="summary-item">
                        <div class="summary-label">Event Time</div>
                        <div class="summary-value">${timeText}</div>
                    </div>
                </div>

                <div class="summary-items-list">
                    <h4>Selected Effects:</h4>
                    <ul>
                        ${leadData.customItems.map(item => `
                            <li>${item.name} × ${item.quantity}</li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    /**
     * Get event type display text
     */
    getEventTypeText(eventType) {
        const types = {
            'wedding': '💍 Wedding',
            'corporate': '🏢 Corporate Event',
            'birthday': '🎂 Birthday',
            'anniversary': '🎊 Anniversary',
            'other': '🎉 Other Celebration'
        };
        return types[eventType] || eventType;
    }

    /**
     * Format date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-IN', options);
    }

    /**
     * Update submit button state
     */
    updateSubmitButton() {
        const submitBtn = document.getElementById('submit-lead-btn');
        const leadData = this.wizard.getLeadData();

        if (submitBtn) {
            const hasName = leadData.customer.name && leadData.customer.name.trim().length > 0;
            const hasPhone = leadData.customer.phone && leadData.customer.phone.length === 10;

            submitBtn.disabled = !(hasName && hasPhone) || this.isSubmitting;

            if (this.isSubmitting) {
                submitBtn.innerHTML = '<span class="spinner"></span> Submitting...';
            } else {
                submitBtn.innerHTML = '🎯 Get My Personalized Quotation';
            }
        }
    }

    /**
     * Validate step
     */
    validate() {
        const leadData = this.wizard.getLeadData();

        if (!leadData.customer.name || leadData.customer.name.trim().length === 0) {
            this.wizard.showError('Please enter your name');
            return false;
        }

        if (!leadData.customer.phone || leadData.customer.phone.length !== 10) {
            this.wizard.showError('Please enter a valid 10-digit WhatsApp number');
            return false;
        }

        // Email is optional, but validate if provided
        if (leadData.customer.email && leadData.customer.email.trim().length > 0) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(leadData.customer.email)) {
                this.wizard.showError('Please enter a valid email address');
                return false;
            }
        }

        return true;
    }

    /**
     * Handle form submission
     */
    async handleSubmit() {
        if (this.isSubmitting) return;

        // Validate first
        if (!this.validate()) {
            return;
        }

        this.isSubmitting = true;
        this.updateSubmitButton();

        try {
            console.log('📤 Submitting lead...');

            // Submit lead
            const result = await this.wizard.submitLead();

            if (result.success) {
                console.log('✅ Lead submitted successfully:', result.leadId);

                // Show thank you page
                this.showThankYouPage(result.leadId);

            } else {
                throw new Error(result.error || 'Failed to submit lead');
            }

        } catch (error) {
            console.error('❌ Error submitting lead:', error);
            this.wizard.showError('Something went wrong. Please try again or contact us directly.');
            this.isSubmitting = false;
            this.updateSubmitButton();
        }
    }

    /**
     * Show thank you page
     */
    showThankYouPage(leadId) {
        // Hide wizard
        document.querySelector('.wizard-container')?.classList.add('hidden');

        // Show thank you
        const thankYouPage = document.getElementById('thank-you-page');
        if (thankYouPage) {
            thankYouPage.style.display = 'block';

            // Update lead ID
            const leadIdDisplay = document.getElementById('lead-id-display');
            if (leadIdDisplay) {
                leadIdDisplay.textContent = leadId;
            }

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Track conversion
            this.trackConversion(leadId);
        }
    }

    /**
     * Track conversion (Google Analytics)
     */
    trackConversion(leadId) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'generate_lead', {
                event_category: 'Lead Generation',
                event_label: leadId,
                value: 1
            });
            console.log('📊 Conversion tracked in Google Analytics');
        }
    }

    /**
     * Restore previous data
     */
    restoreData() {
        const leadData = this.wizard.getLeadData();

        const nameInput = document.getElementById('customer-name');
        const phoneInput = document.getElementById('customer-phone');
        const emailInput = document.getElementById('customer-email');
        const requestsInput = document.getElementById('special-requests');

        if (nameInput) nameInput.value = leadData.customer.name || '';
        if (phoneInput) phoneInput.value = leadData.customer.phone || '';
        if (emailInput) emailInput.value = leadData.customer.email || '';
        if (requestsInput) requestsInput.value = leadData.customer.specialRequests || '';
    }
}

// Make globally available
if (typeof window !== 'undefined') {
    window.Step5CustomerInfo = Step5CustomerInfo;
}

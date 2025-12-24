/**
 * ============================================
 * STEP 1: EVENT TYPE SELECTION
 * ============================================
 *
 * Allows customer to select their event type
 */

export class Step1EventType {
    constructor(wizard) {
        this.wizard = wizard;
        this.selectedType = null;
    }

    /**
     * Initialize step
     */
    init() {
        console.log('📋 Step 1 initialized');
        this.setupEventListeners();
        this.restoreSelection();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for step enter
        document.addEventListener('wizardStepEnter', (e) => {
            if (e.detail.step === 1) {
                this.onStepEnter();
            }
        });

        // Listen for validation
        document.addEventListener('wizardStepValidate', (e) => {
            if (e.detail.step === 1) {
                if (!this.validate()) {
                    e.preventDefault();
                }
            }
        });

        // Event type selection - use multiple approaches for better compatibility
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.event-type-card');
            if (card) {
                const eventType = card.dataset.eventType || card.getAttribute('data-event-type');
                if (eventType) {
                    console.log('🎯 Event type card clicked:', eventType);
                    this.selectEventType(eventType);
                }
            }
        });

        // Direct click handler as backup
        const cards = document.querySelectorAll('.event-type-card');
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                const eventType = card.dataset.eventType || card.getAttribute('data-event-type');
                if (eventType) {
                    console.log('🎯 Event type card clicked (direct):', eventType);
                    this.selectEventType(eventType);
                }
            });
        });

        console.log(`✅ Step 1 event listeners set up for ${cards.length} cards`);
    }

    /**
     * Called when step is entered
     */
    onStepEnter() {
        console.log('👋 Entered Step 1');
    }

    /**
     * Select event type
     */
    selectEventType(eventType) {
        this.selectedType = eventType;

        // Update UI
        document.querySelectorAll('.event-type-card').forEach(card => {
            card.classList.remove('selected');
        });

        const selectedCard = document.querySelector(`[data-event-type="${eventType}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }

        // Update wizard data
        this.wizard.setEventType(eventType);

        // Enable next button
        const nextBtn = document.querySelector('#step-1 [data-wizard-next]');
        if (nextBtn) {
            nextBtn.disabled = false;
        }
    }

    /**
     * Validate step
     */
    validate() {
        if (!this.selectedType) {
            this.wizard.showError('Please select your event type');
            return false;
        }
        return true;
    }

    /**
     * Restore previous selection
     */
    restoreSelection() {
        const leadData = this.wizard.getLeadData();
        if (leadData.eventType) {
            this.selectEventType(leadData.eventType);
        }
    }
}

// Make globally available
if (typeof window !== 'undefined') {
    window.Step1EventType = Step1EventType;
}

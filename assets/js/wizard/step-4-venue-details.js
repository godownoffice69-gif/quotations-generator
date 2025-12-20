/**
 * ============================================
 * STEP 4: VENUE DETAILS
 * ============================================
 *
 * Allows customer to:
 * - Search and select venue using Google Maps autocomplete
 * - Set event date and time
 */

export class Step4VenueDetails {
    constructor(wizard) {
        this.wizard = wizard;
        this.autocomplete = null;
        this.selectedPlace = null;
    }

    /**
     * Initialize step
     */
    init() {
        console.log('📍 Step 4 initialized');
        this.setupEventListeners();
        this.initializeGoogleMaps();
    }

    /**
     * Initialize Google Maps autocomplete
     */
    initializeGoogleMaps() {
        // Wait for Google Maps to load
        if (typeof google === 'undefined' || !google.maps) {
            console.log('⏳ Waiting for Google Maps to load...');
            setTimeout(() => this.initializeGoogleMaps(), 500);
            return;
        }

        const venueInput = document.getElementById('venue-search');
        if (!venueInput) return;

        // Create autocomplete
        this.autocomplete = new google.maps.places.Autocomplete(venueInput, {
            componentRestrictions: { country: 'in' }, // India only
            fields: ['name', 'formatted_address', 'geometry', 'place_id']
        });

        // Listen for place selection
        this.autocomplete.addListener('place_changed', () => {
            const place = this.autocomplete.getPlace();

            if (!place.geometry) {
                console.warn('No details available for input:', place.name);
                return;
            }

            this.selectedPlace = {
                name: place.name,
                address: place.formatted_address,
                coordinates: {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                },
                placeId: place.place_id
            };

            console.log('✅ Venue selected:', this.selectedPlace.name);

            // Update wizard data
            this.wizard.setVenue(this.selectedPlace);

            // Show selected venue
            this.displaySelectedVenue();

            // Enable next if all fields are filled
            this.updateNextButton();
        });

        console.log('✅ Google Maps autocomplete initialized');
    }

    /**
     * Display selected venue
     */
    displaySelectedVenue() {
        const container = document.getElementById('selected-venue-display');
        if (!container || !this.selectedPlace) return;

        container.innerHTML = `
            <div class="selected-venue-card">
                <div class="selected-venue-icon">📍</div>
                <div class="selected-venue-info">
                    <h4>${this.selectedPlace.name}</h4>
                    <p>${this.selectedPlace.address}</p>
                </div>
                <button class="selected-venue-change" onclick="document.getElementById('venue-search').focus()">
                    Change
                </button>
            </div>
        `;
        container.style.display = 'block';
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for step enter
        document.addEventListener('wizardStepEnter', (e) => {
            if (e.detail.step === 4) {
                this.onStepEnter();
            }
        });

        // Listen for validation
        document.addEventListener('wizardStepValidate', (e) => {
            if (e.detail.step === 4) {
                if (!this.validate()) {
                    e.preventDefault();
                }
            }
        });

        // Date and time inputs
        const dateInput = document.getElementById('event-date');
        const timeInput = document.getElementById('event-time');

        if (dateInput) {
            dateInput.addEventListener('change', () => {
                this.handleDateTimeChange();
            });
        }

        if (timeInput) {
            timeInput.addEventListener('change', () => {
                this.handleDateTimeChange();
            });
        }
    }

    /**
     * Called when step is entered
     */
    onStepEnter() {
        console.log('👋 Entered Step 4');
        this.restoreData();
        this.setMinDate();
    }

    /**
     * Set minimum date to today
     */
    setMinDate() {
        const dateInput = document.getElementById('event-date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
        }
    }

    /**
     * Handle date/time change
     */
    handleDateTimeChange() {
        const dateInput = document.getElementById('event-date');
        const timeInput = document.getElementById('event-time');

        const date = dateInput?.value || null;
        const time = timeInput?.value || null;

        if (date || time) {
            this.wizard.setEventDateTime(date, time);
        }

        this.updateNextButton();
    }

    /**
     * Update next button state
     */
    updateNextButton() {
        const nextBtn = document.querySelector('#step-4 [data-wizard-next]');
        const leadData = this.wizard.getLeadData();

        if (nextBtn) {
            const hasVenue = leadData.venue && leadData.venue.name;
            const hasDate = leadData.eventDate;
            const hasTime = leadData.eventTime;

            nextBtn.disabled = !(hasVenue && hasDate && hasTime);
        }
    }

    /**
     * Validate step
     */
    validate() {
        const leadData = this.wizard.getLeadData();

        if (!leadData.venue || !leadData.venue.name) {
            this.wizard.showError('Please search and select your venue');
            return false;
        }

        if (!leadData.eventDate) {
            this.wizard.showError('Please select your event date');
            return false;
        }

        if (!leadData.eventTime) {
            this.wizard.showError('Please select your event time');
            return false;
        }

        return true;
    }

    /**
     * Restore previous data
     */
    restoreData() {
        const leadData = this.wizard.getLeadData();

        // Restore venue
        if (leadData.venue && leadData.venue.name) {
            const venueInput = document.getElementById('venue-search');
            if (venueInput) {
                venueInput.value = leadData.venue.name;
            }
            this.selectedPlace = leadData.venue;
            this.displaySelectedVenue();
        }

        // Restore date
        if (leadData.eventDate) {
            const dateInput = document.getElementById('event-date');
            if (dateInput) {
                dateInput.value = leadData.eventDate;
            }
        }

        // Restore time
        if (leadData.eventTime) {
            const timeInput = document.getElementById('event-time');
            if (timeInput) {
                timeInput.value = leadData.eventTime;
            }
        }

        this.updateNextButton();
    }
}

// Make globally available
if (typeof window !== 'undefined') {
    window.Step4VenueDetails = Step4VenueDetails;
}

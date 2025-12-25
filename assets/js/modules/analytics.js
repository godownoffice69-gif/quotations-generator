/**
 * ANALYTICS TRACKING MODULE
 * Handles Google Analytics event tracking for user interactions
 */

/**
 * Track CTA button clicks
 */
export function initCTATracking() {
  const ctaButtons = document.querySelectorAll('.btn-primary');

  ctaButtons.forEach((btn, index) => {
    btn.addEventListener('click', function() {
      const section = this.closest('section');
      const sectionId = section ? section.id || section.className : 'unknown';

      // Track CTA clicks
      if (typeof gtag !== 'undefined') {
        gtag('event', 'cta_click', {
          'event_category': 'conversion',
          'event_label': `CTA_${index + 1}_${sectionId}`,
          'value': index + 1
        });
      }
    });
  });

  console.log('✅ CTA tracking initialized');
}

/**
 * Track WhatsApp floating button clicks
 */
export function initWhatsAppTracking() {
  const whatsappButton = document.querySelector('.whatsapp-float');

  if (whatsappButton) {
    whatsappButton.addEventListener('click', function() {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'whatsapp_click', {
          'event_category': 'engagement',
          'event_label': 'floating_button'
        });
      }
    });

    console.log('✅ WhatsApp tracking initialized');
  }
}

/**
 * Track exit intent (mouse leaving viewport from top)
 */
export function initExitIntentTracking() {
  let exitIntentShown = false;

  document.addEventListener('mouseout', function(e) {
    // Only trigger on desktop
    if (window.innerWidth < 768) return;

    // Check if mouse is leaving from top
    if (e.clientY < 10 && !exitIntentShown) {
      exitIntentShown = true;

      // Track exit intent
      if (typeof gtag !== 'undefined') {
        gtag('event', 'exit_intent', {
          'event_category': 'engagement'
        });
      }

      // Log for debugging
      console.log('Exit intent detected - Could show offer modal');

      // Future: Add modal implementation here if needed
      // showExitModal();
    }
  });

  console.log('✅ Exit intent tracking initialized');
}

/**
 * Initialize all analytics tracking
 */
export function initAnalytics() {
  initCTATracking();
  initWhatsAppTracking();
  initExitIntentTracking();
}

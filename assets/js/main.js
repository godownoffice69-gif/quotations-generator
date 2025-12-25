/**
 * ═══════════════════════════════════════════════════════════════════
 * FIREPOWERSFX - MAIN JAVASCRIPT (Modular ES6)
 * Orchestrates all interactive features for the landing page
 * ═══════════════════════════════════════════════════════════════════
 */

// Import all feature modules
import { initFAQAccordion } from './modules/faq-accordion.js';
import { initSmoothScroll } from './modules/smooth-scroll.js';
import { initScrollAnimations } from './modules/scroll-animations.js';
import { initGalleryFilters, setupGalleryFilterReinitialization } from './modules/gallery-filters.js';
import { initAnalytics } from './modules/analytics.js';
import { initParallax } from './modules/parallax.js';
import { initScrollProgress } from './modules/scroll-progress.js';
import { initNumberAnimations } from './modules/number-animations.js';
import { initLazyLoading } from './modules/lazy-loading.js';

/**
 * Initialize all features when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('%c🎆 FirepowerSFX - Creating Spectacular Moments', 'color: #8B5CF6; font-size: 20px; font-weight: bold;');
  console.log('%cWebsite by FirepowerSFX Team | www.firepowersfx.com', 'color: #F59E0B; font-size: 12px;');
  console.log('\n🚀 Initializing modular features...\n');

  // Initialize all modules
  try {
    // Core interactions
    initFAQAccordion();
    initSmoothScroll();

    // Visual effects
    initScrollAnimations();
    initParallax();
    initScrollProgress();
    initNumberAnimations();

    // Gallery features
    initGalleryFilters();
    setupGalleryFilterReinitialization();

    // Performance optimizations
    initLazyLoading();

    // Analytics & tracking
    initAnalytics();

    console.log('\n✅ All interactive features loaded successfully');
  } catch (error) {
    console.error('❌ Error initializing features:', error);
  }
});

/**
 * Service Worker Registration (Optional - Future PWA Enhancement)
 */
if ('serviceWorker' in navigator) {
  // Can register service worker for offline support
  // navigator.serviceWorker.register('/sw.js');
}

/**
 * LAZY LOADING MODULE
 * Handles performance optimization for images using native lazy loading
 * with fallback for older browsers
 */

export function initLazyLoading() {
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');

  if ('loading' in HTMLImageElement.prototype) {
    // Browser supports native lazy loading
    lazyImages.forEach(img => {
      img.src = img.dataset.src || img.src;
    });

    console.log('✅ Lazy loading initialized (native browser support)');
  } else {
    // Fallback for older browsers using Intersection Observer
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          imageObserver.unobserve(img);
        }
      });
    });

    lazyImages.forEach(img => imageObserver.observe(img));

    console.log('✅ Lazy loading initialized (fallback mode)');
  }
}

/**
 * SMOOTH SCROLL MODULE
 * Handles smooth scrolling for anchor links
 */

export function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');

      // Don't prevent default for empty href
      if (href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);

      if (target) {
        const offset = 80; // Offset for fixed header if any
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  console.log('✅ Smooth scroll initialized');
}

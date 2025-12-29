/**
 * PARALLAX MODULE
 * Handles parallax scrolling effect for hero background
 */

export function initParallax() {
  const heroBackground = document.querySelector('.hero-background');

  if (heroBackground) {
    window.addEventListener('scroll', function() {
      const scrolled = window.pageYOffset;
      const parallaxSpeed = 0.5;

      if (scrolled < window.innerHeight) {
        heroBackground.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
      }
    });

    console.log('✅ Parallax effect initialized');
  }
}

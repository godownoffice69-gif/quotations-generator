// ═══════════════════════════════════════════════════════════════════
// FIREPOWERSFX - MAIN JAVASCRIPT
// Interactive Features for Landing Page
// ═══════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function() {

  // ═══════════════════════════════════════════════════════════════════
  // FAQ ACCORDION
  // ═══════════════════════════════════════════════════════════════════

  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(question => {
    question.addEventListener('click', function() {
      const faqItem = this.parentElement;
      const isActive = faqItem.classList.contains('active');

      // Close all other FAQ items
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
      });

      // Toggle current item
      if (!isActive) {
        faqItem.classList.add('active');
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ═══════════════════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════════════════
  // SCROLL ANIMATIONS (Fade in on scroll)
  // ═══════════════════════════════════════════════════════════════════

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe all sections for fade-in effect
  document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(section);
  });

  // ═══════════════════════════════════════════════════════════════════
  // GALLERY FILTER SYSTEM
  // ═══════════════════════════════════════════════════════════════════

  function initializeGalleryFilters() {
    console.log('🎯 Initializing gallery filters...');

    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    console.log(`Found ${filterButtons.length} filter buttons and ${galleryItems.length} gallery items`);

    // Remove old event listeners by cloning and replacing buttons
    filterButtons.forEach(button => {
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
    });

    // Re-query after replacement
    const newFilterButtons = document.querySelectorAll('.filter-btn');

    newFilterButtons.forEach(button => {
      button.addEventListener('click', function() {
        const filter = this.getAttribute('data-filter');
        const currentGalleryItems = document.querySelectorAll('.gallery-item');

        console.log(`Filter clicked: ${filter}, items to filter: ${currentGalleryItems.length}`);

        // Update active button
        newFilterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');

        // Filter gallery items
        currentGalleryItems.forEach(item => {
          const category = item.getAttribute('data-category');

          if (filter === 'all') {
            item.classList.remove('hidden');
            setTimeout(() => {
              item.style.opacity = '1';
              item.style.transform = 'scale(1)';
            }, 10);
          } else {
            if (category && category.includes(filter)) {
              item.classList.remove('hidden');
              setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
              }, 10);
            } else {
              item.style.opacity = '0';
              item.style.transform = 'scale(0.8)';
              setTimeout(() => {
                item.classList.add('hidden');
              }, 300);
            }
          }
        });

        // Track filter usage
        if (typeof gtag !== 'undefined') {
          gtag('event', 'gallery_filter', {
            'event_category': 'engagement',
            'event_label': filter
          });
        }
      });
    });

    console.log('✅ Gallery filters initialized');
  }

  // Initialize filters on page load
  initializeGalleryFilters();

  // Re-initialize filters when videos are dynamically loaded
  document.addEventListener('videosLoaded', function(e) {
    console.log('📢 Received videosLoaded event, re-initializing filters...');
    initializeGalleryFilters();
  });

  // ═══════════════════════════════════════════════════════════════════
  // GALLERY LIGHTBOX (Simple implementation)
  // ═══════════════════════════════════════════════════════════════════

  // Note: Lightbox functionality disabled for video gallery
  // Videos are played inline via iframe embeds

  // ═══════════════════════════════════════════════════════════════════
  // CTA BUTTON TRACKING
  // ═══════════════════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════════════════
  // WHATSAPP BUTTON TRACKING
  // ═══════════════════════════════════════════════════════════════════

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
  }

  // ═══════════════════════════════════════════════════════════════════
  // PARALLAX EFFECT FOR HERO BACKGROUND
  // ═══════════════════════════════════════════════════════════════════

  const heroBackground = document.querySelector('.hero-background');

  if (heroBackground) {
    window.addEventListener('scroll', function() {
      const scrolled = window.pageYOffset;
      const parallaxSpeed = 0.5;

      if (scrolled < window.innerHeight) {
        heroBackground.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // SCROLL PROGRESS INDICATOR (Optional)
  // ═══════════════════════════════════════════════════════════════════

  function createScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 4px;
      background: linear-gradient(90deg, var(--primary), var(--accent));
      z-index: 9999;
      transition: width 0.2s ease;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', function() {
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (window.pageYOffset / windowHeight) * 100;
      progressBar.style.width = scrolled + '%';
    });
  }

  createScrollProgress();

  // ═══════════════════════════════════════════════════════════════════
  // ANIMATE NUMBERS (Trust Indicators)
  // ═══════════════════════════════════════════════════════════════════

  function animateNumber(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target + '+';
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current) + '+';
      }
    }, 16);
  }

  // Observe trust indicators for animation
  const trustNumbers = document.querySelectorAll('.trust-number');
  const trustObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
        const text = entry.target.textContent;
        const number = parseInt(text.replace(/\D/g, ''));

        if (!isNaN(number) && number > 0 && number < 1000) {
          entry.target.classList.add('animated');
          animateNumber(entry.target, number);
        }
      }
    });
  }, { threshold: 0.5 });

  trustNumbers.forEach(num => {
    if (num.textContent.includes('500')) {
      trustObserver.observe(num);
    }
  });

  // ═══════════════════════════════════════════════════════════════════
  // TESTIMONIAL CAROUSEL AUTO-ROTATE (Optional Enhancement)
  // ═══════════════════════════════════════════════════════════════════

  // Can be implemented later for automatic rotation of testimonials

  // ═══════════════════════════════════════════════════════════════════
  // MOBILE MENU (If needed in future)
  // ═══════════════════════════════════════════════════════════════════

  // Mobile navigation can be added here if header menu is needed

  // ═══════════════════════════════════════════════════════════════════
  // EXIT INTENT POPUP (Optional - Use Sparingly)
  // ═══════════════════════════════════════════════════════════════════

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

      // You can show a modal here
      console.log('Exit intent detected - Could show offer modal');

      // For now, just log. Add modal implementation if needed:
      // showExitModal();
    }
  });

  // ═══════════════════════════════════════════════════════════════════
  // PERFORMANCE: LAZY LOAD IMAGES
  // ═══════════════════════════════════════════════════════════════════

  const lazyImages = document.querySelectorAll('img[loading="lazy"]');

  if ('loading' in HTMLImageElement.prototype) {
    // Browser supports native lazy loading
    lazyImages.forEach(img => {
      img.src = img.dataset.src || img.src;
    });
  } else {
    // Fallback for older browsers
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
  }

  // ═══════════════════════════════════════════════════════════════════
  // CONSOLE MESSAGE (Branding)
  // ═══════════════════════════════════════════════════════════════════

  console.log('%c🎆 FirepowerSFX - Creating Spectacular Moments', 'color: #8B5CF6; font-size: 20px; font-weight: bold;');
  console.log('%cWebsite by FirepowerSFX Team | www.firepowersfx.com', 'color: #F59E0B; font-size: 12px;');

  // ═══════════════════════════════════════════════════════════════════
  // PAGE LOAD COMPLETE
  // ═══════════════════════════════════════════════════════════════════

  console.log('✅ All interactive features loaded successfully');
});

// ═══════════════════════════════════════════════════════════════════
// SERVICE WORKER REGISTRATION (For PWA - Optional Future Enhancement)
// ═══════════════════════════════════════════════════════════════════

if ('serviceWorker' in navigator) {
  // Can register service worker for offline support
  // navigator.serviceWorker.register('/sw.js');
}

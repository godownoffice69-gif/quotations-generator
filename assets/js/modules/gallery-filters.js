/**
 * GALLERY FILTERS MODULE
 * Handles photo/video gallery filtering with smooth transitions
 */

export function initGalleryFilters() {
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

// Re-initialize filters when videos are dynamically loaded
export function setupGalleryFilterReinitialization() {
  document.addEventListener('videosLoaded', function(e) {
    console.log('📢 Received videosLoaded event, re-initializing filters...');
    initGalleryFilters();
  });
}

/**
 * NUMBER ANIMATIONS MODULE
 * Animates numbers counting up when they come into view (trust indicators)
 */

/**
 * Animate a number from 0 to target value
 */
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

/**
 * Initialize number animations using Intersection Observer
 */
export function initNumberAnimations() {
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

  console.log('✅ Number animations initialized');
}

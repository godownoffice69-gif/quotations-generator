/**
 * FAQ ACCORDION MODULE
 * Handles collapsible FAQ items with smooth transitions
 */

export function initFAQAccordion() {
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

  console.log('✅ FAQ accordion initialized');
}

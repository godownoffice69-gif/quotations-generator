// ============================================
// INITIALIZATION CODE
// ============================================

// This code runs after all other scripts have loaded
// and sets up event listeners and initial state

// Setup order form
const form = document.getElementById('orderForm');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    OMS.saveOrder();
});

// Transport custom field
document.getElementById('transport').addEventListener('change', (e) => {
    const group = document.getElementById('customTransportGroup');
    if (e.target.value === 'Other') {
        group.classList.remove('hidden');
    } else {
        group.classList.add('hidden');
    }
});

// Order ID visibility based on status
document.getElementById('orderStatus').addEventListener('change', (e) => {
    const orderIdGroup = document.getElementById('orderIdGroup');
    const orderIdInput = document.getElementById('orderId');

    if (e.target.value === 'Completed') {
        orderIdGroup.style.display = 'block';
        orderIdInput.required = false;
    } else {
        orderIdGroup.style.display = 'none';
        orderIdInput.required = false;
        orderIdInput.value = '';
    }
});

// Set initial date (NO restrictions - allow past dates for historical orders)
const today = Utils.toDateString(new Date());
Utils.set('orderDate', today);

// NO date restrictions - allow adding past, present, and future orders
console.log('✅ Date restrictions removed - can add orders from any date');
console.log('✅ App initialization complete!');

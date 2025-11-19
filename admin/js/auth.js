// ============================================
// AUTHENTICATION
// ============================================

// Check if user is logged in
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is logged in
        console.log('✅ User logged in:', user.email);
        document.getElementById('loginScreen').style.display = 'none';
        document.querySelector('.app-container').style.display = 'flex';
        OMS.init().then(() => OMS.updateAllDisplays());
    } else {
        // User is logged out
        console.log('❌ User not logged in');
        document.getElementById('loginScreen').style.display = 'flex';
        document.querySelector('.app-container').style.display = 'none';
    }
});

// Handle login form
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const loginBtn = document.getElementById('loginBtn');
    const loginError = document.getElementById('loginError');

    loginBtn.textContent = 'Logging in...';
    loginBtn.disabled = true;
    loginError.style.display = 'none';

    try {
        await auth.signInWithEmailAndPassword(email, password);
        console.log('✅ Login successful!');
    } catch (error) {
        console.error('❌ Login error:', error);
        loginError.textContent = 'Invalid email or password. Please try again.';
        loginError.style.display = 'block';
        loginBtn.textContent = 'Login';
        loginBtn.disabled = false;
    }
});

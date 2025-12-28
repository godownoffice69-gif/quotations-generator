/**
 * Firebase Configuration & Initialization
 * Provides Firebase app, auth, and firestore instances
 *
 * @exports firebase, auth, db
 */

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyC5c2BmVHnbWlBwwHtFwll97nq_xOdqxCc",
    authDomain: "firepowersfx-2558.firebaseapp.com",
    projectId: "firepowersfx-2558",
    storageBucket: "firepowersfx-2558.firebasestorage.app",
    messagingSenderId: "723483292867",
    appId: "1:723483292867:web:d6d83a79ba87cd2dee5e76"
};

// Initialize Firebase (using compat SDK for backward compatibility)
let auth, db;

export function initializeFirebase() {
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase SDK not loaded. Make sure firebase scripts are included before this module.');
        return { auth: null, db: null };
    }

    try {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();

        // Make globally available for backward compatibility
        window.auth = auth;
        window.db = db;

        console.log('✅ Firebase initialized successfully!');

        // Set up token refresh error monitoring
        setupTokenMonitoring();

        return { auth, db };
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        return { auth: null, db: null };
    }
}

/**
 * Monitor for token refresh errors
 * Signs out user after consecutive failures to force fresh login
 */
function setupTokenMonitoring() {
    let tokenErrorCount = 0;
    let lastTokenError = 0;
    const TOKEN_ERROR_THRESHOLD = 3; // Sign out after 3 consecutive errors
    const TOKEN_ERROR_WINDOW = 10000; // 10 seconds window

    // Intercept fetch to catch token refresh errors
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        return originalFetch.apply(this, args).catch(error => {
            // Check if this is a token refresh error
            if (args[0] && typeof args[0] === 'string' && args[0].includes('securetoken.googleapis.com')) {
                const now = Date.now();

                // Reset counter if errors are not consecutive (more than 10s apart)
                if (now - lastTokenError > TOKEN_ERROR_WINDOW) {
                    tokenErrorCount = 0;
                }

                tokenErrorCount++;
                lastTokenError = now;

                console.warn(`⚠️ Firebase token refresh failed (${tokenErrorCount}/${TOKEN_ERROR_THRESHOLD})`);

                // If too many consecutive errors, sign out user to force fresh login
                if (tokenErrorCount >= TOKEN_ERROR_THRESHOLD) {
                    console.error('❌ Multiple token refresh failures detected. Signing out to force fresh login...');
                    tokenErrorCount = 0; // Reset counter

                    // Sign out user
                    if (window.auth && window.auth.currentUser) {
                        window.auth.signOut().catch(err => {
                            console.error('Sign out error:', err);
                        });
                    }
                }
            }
            throw error;
        });
    };
}

// Export for ES modules
export { auth, db };

// Export for backward compatibility
export default {
    initializeFirebase,
    get auth() { return auth; },
    get db() { return db; }
};

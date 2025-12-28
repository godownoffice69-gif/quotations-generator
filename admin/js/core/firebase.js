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
 * Immediately signs out user on 403 to prevent console spam
 */
function setupTokenMonitoring() {
    let tokenErrorLogged = false; // Only log once
    let hasSignedOut = false; // Prevent multiple sign-out attempts

    // Listen for auth state changes to detect when user is signed out
    if (auth) {
        auth.onAuthStateChanged((user) => {
            if (!user && hasSignedOut) {
                // User was signed out due to token error - reload to show login
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
        });
    }

    // Intercept fetch to catch token refresh errors
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        return originalFetch.apply(this, args).then(response => {
            // Check if this is a 403 token refresh error
            if (args[0] && typeof args[0] === 'string' &&
                args[0].includes('securetoken.googleapis.com') &&
                response.status === 403) {

                if (!tokenErrorLogged) {
                    console.warn('⚠️ Firebase token expired or invalid. Signing out...');
                    tokenErrorLogged = true;
                }

                // Sign out immediately on first 403 to prevent spam
                if (!hasSignedOut && window.auth && window.auth.currentUser) {
                    hasSignedOut = true;

                    // **CRITICAL: Save any unsaved work BEFORE signing out**
                    try {
                        // Save current order draft if user is working on one
                        if (window.OMS && window.OMS.hasUnsavedChanges && window.OMS.hasUnsavedChanges()) {
                            const draftData = window.OMS.collectFormData();
                            draftData.savedAt = new Date().toISOString();
                            draftData.reason = 'session_expired';
                            localStorage.setItem('oms_draft', JSON.stringify(draftData));
                            console.log('💾 Emergency draft saved before sign-out');
                        }
                    } catch (err) {
                        console.warn('Could not save draft:', err);
                    }

                    // Show user-friendly message
                    if (window.OMS && window.OMS.showToast) {
                        window.OMS.showToast('Session expired. Your work has been saved. Please login again.', 'warning');
                    }

                    // Sign out user
                    window.auth.signOut().then(() => {
                        console.log('✅ Signed out successfully');
                        // Page will reload via onAuthStateChanged
                    }).catch(err => {
                        console.error('Sign out error:', err);
                        // Force reload anyway
                        window.location.reload();
                    });
                }

                // Return the response without throwing to suppress console spam
                return response;
            }

            return response;
        }).catch(error => {
            // For actual network errors (not 403), still throw
            if (!args[0] || !args[0].includes('securetoken.googleapis.com')) {
                throw error;
            }

            // Suppress token refresh errors to prevent console spam
            if (!tokenErrorLogged) {
                console.warn('⚠️ Token refresh network error. Signing out...');
                tokenErrorLogged = true;
            }

            if (!hasSignedOut && window.auth && window.auth.currentUser) {
                hasSignedOut = true;

                // Save any unsaved work before sign-out
                try {
                    if (window.OMS && window.OMS.hasUnsavedChanges && window.OMS.hasUnsavedChanges()) {
                        const draftData = window.OMS.collectFormData();
                        draftData.savedAt = new Date().toISOString();
                        draftData.reason = 'session_expired';
                        localStorage.setItem('oms_draft', JSON.stringify(draftData));
                        console.log('💾 Emergency draft saved (network error)');
                    }
                } catch (err) {
                    // Silent fail - don't block sign-out
                }

                window.auth.signOut().catch(() => {});
            }

            // Don't re-throw to suppress console spam
            return Promise.reject(error);
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

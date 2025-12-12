/* ============================================
   FIREBASE CONFIG - Firebase Initialization & Auth
   ============================================ */

/**
 * Firebase Configuration and Initialization Module
 *
 * This module handles:
 * - Firebase app initialization with project credentials
 * - Firebase Authentication instance
 * - Firestore Database instance
 * - Token refresh error handling to prevent infinite loops
 *
 * @exports auth - Firebase Authentication instance
 * @exports db - Firestore Database instance
 */

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyC5c2BmVHnbWlBwwHtFwll97nq_xOdqxCc",
    authDomain: "firepowersfx-2558.firebaseapp.com",
    projectId: "firepowersfx-2558",
    storageBucket: "firepowersfx-2558.firebasestorage.app",
    messagingSenderId: "723483292867",
    appId: "1:723483292867:web:d6d83a79ba87cd2dee5e76"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export Firebase instances
export const auth = firebase.auth();
export const db = firebase.firestore();

console.log('✅ Firebase initialized successfully!');

// ========== TOKEN REFRESH ERROR HANDLING ==========

/**
 * Track token refresh errors to prevent infinite loops
 * If multiple consecutive token errors occur, force user sign out
 * to require fresh login and regenerate valid tokens
 */
let tokenErrorCount = 0;
let lastTokenError = 0;
const TOKEN_ERROR_THRESHOLD = 3; // Sign out after 3 consecutive errors
const TOKEN_ERROR_WINDOW = 10000; // 10 seconds window

// Monitor for token refresh errors by intercepting fetch API
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
                        console.error('Error during forced sign out:', err);
                    });
                }
            }
        }
        throw error;
    }).then(response => {
        // Check for 403 errors on token refresh
        if (args[0] && typeof args[0] === 'string' &&
            args[0].includes('securetoken.googleapis.com') &&
            response.status === 403) {

            const now = Date.now();

            // Reset counter if errors are not consecutive
            if (now - lastTokenError > TOKEN_ERROR_WINDOW) {
                tokenErrorCount = 0;
            }

            tokenErrorCount++;
            lastTokenError = now;

            console.warn(`⚠️ Firebase token refresh 403 error (${tokenErrorCount}/${TOKEN_ERROR_THRESHOLD})`);

            // If too many consecutive 403 errors, sign out user
            if (tokenErrorCount >= TOKEN_ERROR_THRESHOLD) {
                console.error('❌ Multiple 403 token errors detected. Signing out to force fresh login...');
                tokenErrorCount = 0;

                if (window.auth && window.auth.currentUser) {
                    window.auth.signOut().catch(err => {
                        console.error('Error during forced sign out:', err);
                    });
                }
            }
        } else {
            // Reset counter on successful non-token requests
            if (response.ok) {
                tokenErrorCount = 0;
            }
        }
        return response;
    });
};

// Make auth and db available globally for backward compatibility
if (typeof window !== 'undefined') {
    window.auth = auth;
    window.db = db;

    // Export token error count for monitoring
    window.getTokenErrorCount = () => tokenErrorCount;
}

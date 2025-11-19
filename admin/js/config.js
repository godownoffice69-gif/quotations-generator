// ============================================
// FIREBASE CONFIGURATION
// ============================================

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
window.auth = firebase.auth();
window.db = firebase.firestore();
console.log('✅ Firebase initialized successfully!');

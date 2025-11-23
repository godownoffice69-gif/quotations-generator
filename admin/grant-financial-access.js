/**
 * BROWSER CONSOLE SCRIPT: Grant Financial Tab Access
 *
 * HOW TO USE:
 * 1. Open your admin panel in the browser
 * 2. Make sure you're logged in
 * 3. Press F12 to open Developer Console
 * 4. Copy and paste this entire script into the console
 * 5. Press Enter to run
 * 6. Refresh the page to see the Financial tab
 *
 * This script will set your current user role to 'owner' which grants
 * full access to the Financial tab and all other features.
 */

(async function grantFinancialAccess() {
    console.log('🔐 Starting Financial Access Setup...\n');

    try {
        // Get current authenticated user
        const authUser = auth.currentUser;

        if (!authUser) {
            console.error('❌ ERROR: No user is currently logged in!');
            console.log('👉 Please log in first, then run this script again.');
            return;
        }

        console.log('✅ Found logged in user:');
        console.log('   Email:', authUser.email);
        console.log('   UID:', authUser.uid);
        console.log('');

        // Get user's name
        const userName = authUser.displayName || authUser.email.split('@')[0];

        // Set role to 'owner' in Firestore
        console.log('📝 Setting role to OWNER in Firestore...');

        await db.collection('user_roles').doc(authUser.uid).set({
            email: authUser.email,
            name: userName,
            role: 'owner',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            grantedBy: 'console-script',
            grantedAt: new Date().toISOString()
        });

        console.log('');
        console.log('✨ SUCCESS! Your access has been updated!\n');
        console.log('━'.repeat(60));
        console.log('📋 Your New Permissions:');
        console.log('   Email:', authUser.email);
        console.log('   Role: OWNER');
        console.log('   Access: Full access to Financial tab and all features');
        console.log('━'.repeat(60));
        console.log('');
        console.log('🔄 Please REFRESH THE PAGE to see the changes!');
        console.log('');
        console.log('After refresh, you should see:');
        console.log('   ✅ Financial tab visible in the navigation');
        console.log('   ✅ Ability to view all financial data');
        console.log('   ✅ Access to payment tracking and reports');
        console.log('');

        // Ask if user wants to refresh automatically
        const autoRefresh = confirm('✅ Role updated successfully!\n\nDo you want to refresh the page now to apply changes?');
        if (autoRefresh) {
            location.reload();
        }

    } catch (error) {
        console.error('❌ ERROR:', error.message);
        console.log('');
        console.log('🔍 Troubleshooting:');
        console.log('   1. Make sure you are logged into the admin panel');
        console.log('   2. Check your Firestore security rules allow writes to user_roles');
        console.log('   3. Verify your Firebase connection is working');
        console.log('');
    }
})();

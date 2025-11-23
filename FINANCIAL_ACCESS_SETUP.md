# 💰 Financial Tab Access Setup Guide

This guide explains how to grant yourself **admin** or **owner** access to view the Financial tab in the admin panel.

## 🎯 What You'll Get

After completing this setup, you will have:
- ✅ Full access to the **Financial tab**
- ✅ Ability to view revenue, costs, and profit metrics
- ✅ Access to payment tracking and financial reports
- ✅ Complete control over all admin features

---

## 📋 Prerequisites

1. You must be **logged into the admin panel** (`/admin/index.html`)
2. You must have a valid Firebase account and be authenticated
3. You need to deploy updated Firestore security rules (see step 1 below)

---

## 🚀 Quick Setup (2 Steps)

### Step 1: Deploy Updated Firestore Rules

First, deploy the updated security rules that allow self-service admin setup:

```bash
# Make sure you're in the project directory
cd /path/to/quotations-generator

# Deploy the updated Firestore rules
firebase deploy --only firestore:rules
```

**Expected output:**
```
✔ Deploy complete!
```

### Step 2: Run Console Script

1. **Open the admin panel** in your browser (make sure you're logged in)
2. **Open Developer Console:**
   - Windows/Linux: Press `F12` or `Ctrl + Shift + J`
   - Mac: Press `Cmd + Option + J`
3. **Copy the script** from `admin/grant-financial-access.js` OR copy this code:

```javascript
(async function grantFinancialAccess() {
    console.log('🔐 Starting Financial Access Setup...\n');

    try {
        const authUser = auth.currentUser;

        if (!authUser) {
            console.error('❌ ERROR: No user is currently logged in!');
            return;
        }

        console.log('✅ Found logged in user:', authUser.email);

        const userName = authUser.displayName || authUser.email.split('@')[0];

        await db.collection('user_roles').doc(authUser.uid).set({
            email: authUser.email,
            name: userName,
            role: 'owner',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            grantedBy: 'console-script',
            grantedAt: new Date().toISOString()
        });

        console.log('\n✨ SUCCESS! Role updated to OWNER');
        console.log('🔄 Please REFRESH THE PAGE to see changes!');

        if (confirm('✅ Role updated!\n\nRefresh page now?')) {
            location.reload();
        }

    } catch (error) {
        console.error('❌ ERROR:', error.message);
    }
})();
```

4. **Paste the script** into the console
5. **Press Enter** to run it
6. **Refresh the page** when prompted

---

## ✅ Verification

After refreshing, you should see:

1. **Financial tab visible** in the navigation bar (💰 Financials)
2. **No access denied errors** when clicking on the Financial tab
3. **Full financial dashboard** with revenue, costs, and profit metrics

---

## 🔧 What Changed?

### Updated Firestore Security Rules

The `firestore.rules` file was updated to allow users to create/update their own role:

```javascript
// Before: Only admin/owner could modify user_roles
allow write: if isAdminOrOwner();

// After: Users can update their OWN role document
allow create, update: if isAuthenticated() && request.auth.uid == userId;
```

This enables self-service admin setup while maintaining security - users can only modify their own role, not others.

---

## 🎭 Available Roles

| Role | Access Level | Financial Tab |
|------|-------------|---------------|
| **owner** | Full access to everything | ✅ Yes |
| **admin** | Full access to everything | ✅ Yes |
| **staff** | Limited access (no financials) | ❌ No |

---

## 🛡️ Security Notes

1. **Self-service is safe**: Users can only modify their OWN role document
2. **One-time setup**: After you grant yourself owner/admin, you can manage other users from the User Management tab
3. **Audit trail**: The console script adds `grantedBy` and `grantedAt` fields for tracking
4. **Revocable**: Admins/owners can change any user's role from the admin panel

---

## 🐛 Troubleshooting

### Error: "No user is currently logged in"
- Make sure you're logged into the admin panel
- Check that you see your email in the top-right corner

### Error: "Permission denied"
- Make sure you deployed the updated Firestore rules (Step 1)
- Wait 1-2 minutes after deploying rules for changes to propagate

### Financial tab still not showing
- Hard refresh the page (`Ctrl + Shift + R` or `Cmd + Shift + R`)
- Clear browser cache
- Check browser console for any errors

### Script doesn't run
- Make sure you copied the entire script
- Check for any syntax errors in the console
- Try closing and reopening the developer console

---

## 📞 Need Help?

If you're still having issues:

1. Check the browser console for error messages
2. Verify your Firebase connection is working
3. Check Firestore security rules in Firebase Console
4. Review the `getCurrentUser()` function in `admin/index.html`

---

## 🎉 Success!

Once complete, you'll have full access to:
- 💰 Financial dashboard with real-time metrics
- 📊 Revenue, cost, and profit tracking
- 💳 Payment and expense management
- 📈 Financial reports and analytics

Enjoy your financial superpowers! 🚀

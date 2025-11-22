# Admin User Setup Guide - FirepowersFX Quotations Generator

## 📋 Overview

This document explains how the user role system works and how to configure admin access for:
- **Admin User**: `admin@firepowersfx.com`
- **Owner User**: `owner@firepowersfx.com`

## 🏗️ System Architecture

### 1. Firebase Authentication
- Users must first be created in Firebase Authentication
- Each user gets a unique UID (User ID)

### 2. Firestore User Roles Collection
- Collection: `user_roles`
- Document ID: User's Firebase UID
- Structure:
  ```json
  {
    "email": "admin@firepowersfx.com",
    "name": "Admin User",
    "role": "admin",
    "createdAt": "2025-11-22T...",
    "updatedAt": "2025-11-22T..."
  }
  ```

### 3. Role Types
- **owner**: Full access to all features including financials
- **admin**: Full access to all features including financials
- **staff**: Limited access (no financial tab)

### 4. Financial Access Control
Financial features are restricted to users with `admin` or `owner` roles:
- Payments collection
- Expenses collection
- Financial summary
- Financial tab in admin panel

## 🔐 Firebase Security Rules

Current security rules (firestore.rules:100-115):

```javascript
// FINANCIAL COLLECTIONS - RESTRICTED TO ADMIN/OWNER ONLY

// Payments collection - only admin/owner can access
match /payments/{paymentId} {
  allow read, write: if isAdminOrOwner();
}

// Expenses collection - only admin/owner can access
match /expenses/{expenseId} {
  allow read, write: if isAdminOrOwner();
}

// Financial summary collection - only admin/owner can access
match /financial_summary/{summaryId} {
  allow read, write: if isAdminOrOwner();
}
```

The `isAdminOrOwner()` helper function (lines 16-18):
```javascript
function isAdminOrOwner() {
  return isAuthenticated() && getUserRole() in ['admin', 'owner'];
}
```

## 🚀 Setup Methods

### Method 1: Automated Setup (Recommended)

1. **Access the setup tool**:
   - Open: `admin/setup-admin-users.html`
   - Or navigate to: `http://your-domain/admin/setup-admin-users.html`

2. **Prerequisites**:
   - Both users must exist in Firebase Authentication
   - You must be signed in as an existing admin/owner

3. **Steps**:
   - Click "Check Current Authentication" to verify you're signed in
   - Click "Check User Roles Status" to see current configuration
   - Click "Setup Both Users" to configure roles

### Method 2: Manual Setup via Firebase Console

#### Step 1: Create Users in Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **firepowersfx-2558**
3. Navigate to: **Authentication → Users**
4. Click **"Add user"**
5. Create user:
   - Email: `admin@firepowersfx.com`
   - Password: (set a secure password)
6. Repeat for `owner@firepowersfx.com`
7. **Note the UID** for each user (you'll need this)

#### Step 2: Add User Roles in Firestore

1. In Firebase Console, navigate to: **Firestore Database**
2. Go to collection: **user_roles**
3. Click **"Add document"**
4. Set document ID: (paste the UID from step 1)
5. Add fields:
   ```
   email: admin@firepowersfx.com
   name: Admin User
   role: admin
   createdAt: [current timestamp]
   updatedAt: [current timestamp]
   ```
6. Repeat for owner user with:
   ```
   email: owner@firepowersfx.com
   name: Owner User
   role: owner
   ```

### Method 3: Using Debug Tool

If you're already signed in as a user and want to promote yourself:

1. Open: `admin/debug-role.html`
2. Click "Set My Role to Admin"
3. Refresh the admin panel

## ✅ Verification Steps

After setup, verify the configuration:

1. **Check Authentication**:
   - Sign in at `admin/index.html`
   - Confirm you see your email in the top-right corner

2. **Check Role Badge**:
   - You should see a colored badge with your role (ADMIN or OWNER)
   - Admin = Red badge
   - Owner = Orange badge

3. **Check Financial Tab**:
   - The "Financials" tab should be visible
   - Click it to verify access (should not show "Access Denied")

4. **Test Financial Data**:
   - Try accessing: Payments, Expenses, Financial Summary
   - All should be accessible

## 🔍 Troubleshooting

### Problem: Financial tab not showing

**Solution**:
1. Open browser console (F12)
2. Check for role in console logs
3. Verify role document exists in Firestore
4. Clear cache and refresh: `admin/debug-role.html` → "Clear Cache & Reload"

### Problem: "Access Denied" when accessing financials

**Cause**: Your role is not set to 'admin' or 'owner'

**Solution**:
1. Check your role: `admin/debug-role.html` → "Check User Role"
2. If role is wrong, use "Set My Role to Admin"
3. Or update role manually in Firestore

### Problem: Can't write to user_roles collection

**Cause**: Security rules require admin/owner role to write

**Solution**:
1. You need an existing admin to set up new users
2. OR manually add role via Firebase Console (bypass security rules)
3. OR temporarily modify security rules to allow self-registration

### Problem: Users don't exist in Firebase Authentication

**Solution**:
You must create users in Firebase Authentication first before assigning roles. Use Firebase Console or Firebase Admin SDK.

## 📊 Current Configuration Status

### Configured Emails:
- ✅ `admin@firepowersfx.com` - Intended role: **admin**
- ✅ `owner@firepowersfx.com` - Intended role: **owner**

### Firebase Project:
- Project ID: `firepowersfx-2558`
- Auth Domain: `firepowersfx-2558.firebaseapp.com`

### Required Permissions:
Both users will have:
- ✅ Full read/write access to all collections
- ✅ Access to financial data (payments, expenses, summaries)
- ✅ Ability to manage other user roles
- ✅ Access to all admin panel features

## 🛠️ Admin Tools Reference

1. **Main Admin Panel**: `admin/index.html`
   - Full admin interface
   - User management
   - Financial tab (admin/owner only)

2. **Setup Tool**: `admin/setup-admin-users.html`
   - Configure admin@firepowersfx.com and owner@firepowersfx.com
   - Check user status
   - Automated role assignment

3. **Debug Tool**: `admin/debug-role.html`
   - Diagnose authentication issues
   - Check and set your own role
   - Test Firestore rules

## 📝 Notes

- Firebase API keys in `firebase-config.js` are meant to be public
- Security is enforced through Firestore rules, not API key secrecy
- Never share authentication credentials
- Regular users (staff role) cannot access financial features
- Only admin/owner can manage user roles

## 🔗 Quick Links

- Firebase Console: https://console.firebase.google.com/project/firepowersfx-2558
- Setup Tool: `/admin/setup-admin-users.html`
- Debug Tool: `/admin/debug-role.html`
- Admin Panel: `/admin/index.html`

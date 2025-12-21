#!/bin/bash

# Deployment script for Packages & Leads feature
# Version: 2024-12-20-v3

echo "🚀 Deploying Packages & Leads Feature"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "firebase.json" ]; then
    echo "❌ Error: firebase.json not found. Are you in the project root?"
    exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📌 Current branch: $CURRENT_BRANCH"
echo ""

# Step 1: Deploy Firestore Rules
echo "📋 Step 1: Deploying Firestore Rules..."
echo "========================================"
firebase deploy --only firestore:rules

if [ $? -ne 0 ]; then
    echo "❌ Failed to deploy Firestore rules"
    echo "Please ensure:"
    echo "  1. Firebase CLI is installed (npm install -g firebase-tools)"
    echo "  2. You are logged in (firebase login)"
    echo "  3. Your firestore.rules file is valid"
    exit 1
fi

echo "✅ Firestore rules deployed successfully"
echo ""

# Step 2: Deploy Hosting
echo "🌐 Step 2: Deploying Hosting Files..."
echo "====================================="
firebase deploy --only hosting

if [ $? -ne 0 ]; then
    echo "❌ Failed to deploy hosting"
    echo "Please check your firebase.json configuration"
    exit 1
fi

echo "✅ Hosting deployed successfully"
echo ""

# Success message
echo "============================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "============================================"
echo ""
echo "📝 Next Steps:"
echo "1. Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
echo "2. Open version check page: https://your-domain.com/admin/version-check.html"
echo "3. Verify version shows: 2024-12-20-v3-PACKAGES-TAB-FIX"
echo "4. Open admin panel and check Packages tab"
echo ""
echo "📚 For detailed instructions, see: DEPLOY_PACKAGES_FEATURE.md"
echo ""

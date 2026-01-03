# Admin Setup Scripts

This folder contains Node.js scripts for Firebase admin setup.

**Important:** These files are NOT deployed to Vercel. They are only for local admin user setup.

## Files:
- `package.json` - Node.js dependencies (firebase-admin)
- `setup-admin-simple.js` - Script to create admin users in Firebase
- `firebase-config.js` - Firebase configuration

## Usage:
```bash
cd scripts
npm install
node setup-admin-simple.js
```

## Why this folder?
Keeping these files in `/scripts` prevents Vercel from detecting the project as a Node.js app, allowing it to serve the site as pure static files.

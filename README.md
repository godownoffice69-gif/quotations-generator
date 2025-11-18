# Quotations Generator - Order Management System

A comprehensive order management system with quotation generation, multi-day event support, and real-time tracking.

## Features

- 📝 Order Management (Single & Multi-day events)
- 👥 Customer Database
- 📊 Business Analytics
- 📅 Calendar View
- 🎨 Customizable Print Templates
- 🔐 Secure Firebase Backend

## Security

### About the Firebase API Key

⚠️ **Important:** The Firebase API key in this repository is **intentionally public** and is NOT a security risk.

For web applications, Firebase API keys are designed to be included in client-side code. They are **not secrets** and do not grant access to your data.

**Security is enforced through:**
1. ✅ **Firebase Security Rules** - All data requires authentication
2. ✅ **API Key Restrictions** - Restricted to specific domains in Google Cloud Console
3. ✅ **Firebase Authentication** - Required for all admin operations

See [SECURITY.md](SECURITY.md) for detailed information.

### Recommended Security Setup

1. **Restrict API Key** (Google Cloud Console):
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to APIs & Services → Credentials
   - Edit your API key and add HTTP referrer restrictions
   - Limit to your domain(s) only

2. **Deploy Security Rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Enable Firebase Authentication**:
   - Ensure only authorized users can access the admin panel

## Setup

1. Clone the repository
2. Update Firebase config if needed (see `firebase-config.js`)
3. Deploy security rules: `firebase deploy --only firestore:rules`
4. Open `index.html` in a web browser or deploy to your hosting

## Firebase Security Rules

Security rules are defined in `firestore.rules`. Deploy them using:

```bash
firebase deploy --only firestore:rules
```

## License

Private/Proprietary - All rights reserved

## Support

For issues or questions, please open an issue on GitHub.

# Security Policy

## Firebase API Key in Public Code

**This is NOT a security vulnerability.**

The Firebase API key visible in our client-side code is **intentionally public** and is the standard practice for Firebase web applications. According to [Firebase documentation](https://firebase.google.com/docs/projects/api-keys):

> "Unlike how API keys are typically used, API keys for Firebase services are not used to control access to backend resources; that can only be done with Firebase Security Rules. Usually, you need to fastidiously guard API keys; however, API keys for Firebase services are ok to include in code or checked-in config files."

## Our Security Measures

Security is enforced through multiple layers:

### 1. **Firebase Security Rules** (`firestore.rules`)
- All sensitive data requires authentication
- Read/write operations are restricted to authenticated users only
- Granular permissions per collection

### 2. **API Key Restrictions** (Google Cloud Console)
The Firebase API key is restricted to:
- Specific HTTP referrers (your domain only)
- Specific Firebase APIs only
- No backend access without authentication

### 3. **Firebase Authentication**
- Admin panel requires authentication
- User sessions are managed securely
- Unauthorized access is blocked at the database level

## What Attackers CANNOT Do

Even with the public API key, attackers cannot:
- ❌ Read your data (blocked by Security Rules)
- ❌ Write/modify data (requires authentication)
- ❌ Delete data (requires authentication)
- ❌ Access admin functions (requires authentication)
- ❌ Use the key on other domains (blocked by HTTP referrer restrictions)

## Reporting a Vulnerability

If you discover an actual security vulnerability (e.g., Security Rules bypass, authentication issue), please report it by:
1. Opening a private security advisory on GitHub
2. Or emailing the repository owner directly

**DO NOT** report the Firebase API key being public as a vulnerability - this is by design.

## References

- [Firebase: Using API Keys](https://firebase.google.com/docs/projects/api-keys)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Google Cloud: API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)

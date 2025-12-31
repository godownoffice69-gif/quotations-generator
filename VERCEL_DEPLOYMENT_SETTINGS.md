# Vercel Deployment Settings for OMS + Quotation Site

## Critical Problem Identified

The OMS (Order Management System) was vanishing because:
1. **cleanUrls: true** was interfering with `/admin` directory routing
2. **rewrites** were not explicit enough for Vercel to route correctly
3. Vercel was serving the root `index.html` (quotation site) for ALL requests

## Solution: Routes-Based Configuration

Changed from `rewrites` to `routes` in vercel.json for explicit control.

---

## Required Vercel Dashboard Settings

### 1. Project Settings → General

| Setting | Value | Why |
|---------|-------|-----|
| **Framework Preset** | Other | This is a static site, no framework |
| **Root Directory** | `.` (leave empty or dot) | Files are in repository root |
| **Build Command** | Leave EMPTY | No build step needed - pure static files |
| **Output Directory** | `.` (leave empty or dot) | Serve from root directory |
| **Install Command** | `echo "No install needed"` | No dependencies to install |

### 2. Project Settings → Environment Variables

**NONE REQUIRED** - This is a static site with no server-side code.

### 3. Project Settings → Domains

Set up your domains:
- **Production**: `firepowersfx-admin.vercel.app`
- **Custom Domain** (if any): Your custom domain

### 4. Deployment Configuration (Auto-detected from vercel.json)

The `vercel.json` file handles all routing automatically. DO NOT override these in the dashboard.

---

## How the Routing Works

### Routes Order (CRITICAL - Order Matters!)

```
1. /admin/service-worker.js → admin/service-worker.js (PWA service worker)
2. /admin/manifest.json → admin/manifest.json (PWA manifest)
3. /admin/icons/*.png → admin/icons/*.png (PWA icons)
4. /admin/*.png → admin/*.png (logos, images)
5. /admin/*.js → admin/*.js (JavaScript files)
6. /admin/*.css → admin/*.css (CSS files)
7. /admin/*.html → admin/*.html (HTML pages)
8. /admin OR /admin/ → admin/index.html (OMS entry point) ⭐ CRITICAL
9. /admin/* → admin/* (catch-all for admin directory)
10. /assets/* → assets/* (shared assets)
11. /* → /* (root - quotation site)
```

### What Gets Served Where

| URL | File Served | Description |
|-----|-------------|-------------|
| `/` | `/index.html` | Quotation website homepage |
| `/quotation` | `/quotation.html` | Quotation page |
| `/admin` | `/admin/index.html` | OMS login/dashboard ⭐ |
| `/admin/` | `/admin/index.html` | OMS (with trailing slash) ⭐ |
| `/admin/index.html` | `/admin/index.html` | OMS (direct) |
| `/admin/service-worker.js` | `/admin/service-worker.js` | PWA service worker |
| `/admin/logo.png` | `/admin/logo.png` | Company logo |
| `/admin/icons/*` | `/admin/icons/*` | PWA icons |

---

## Files Structure in Repository

```
/
├── index.html              ← Quotation website (ROOT)
├── quotation.html          ← Quotation page
├── admin/                  ← OMS directory
│   ├── index.html          ← OMS entry point ⭐
│   ├── service-worker.js   ← PWA service worker
│   ├── manifest.json       ← PWA manifest
│   ├── logo.png            ← Company logo (actual file, not symlink)
│   ├── firepowersfx.png    ← Logo source
│   ├── icons/              ← PWA icons directory
│   │   ├── icon-72x72.png
│   │   ├── icon-96x96.png
│   │   ├── icon-128x128.png
│   │   ├── icon-144x144.png
│   │   ├── icon-152x152.png
│   │   ├── icon-192x192.png
│   │   ├── icon-384x384.png
│   │   └── icon-512x512.png
│   └── js/                 ← JavaScript modules
├── assets/                 ← Shared assets
├── vercel.json             ← Deployment configuration ⭐
└── .vercelignore           ← Files to exclude from deployment
```

---

## Troubleshooting in Vercel Dashboard

### If OMS Still Shows Quotation Site:

1. **Check Deployment Logs**:
   - Vercel Dashboard → Deployments → Click latest
   - Click "View Build Logs"
   - Look for errors related to `vercel.json`

2. **Verify File Deployment**:
   - In deployment details, click "View Source"
   - Confirm `admin/index.html` exists in deployed files
   - Confirm file size is ~839KB (not empty)

3. **Force Clean Deployment**:
   - Deployments → Latest → "..." menu
   - Click "Redeploy"
   - **Turn OFF** "Use existing Build Cache"
   - Click "Redeploy"

4. **Check Runtime Logs** (if issues persist):
   - Deployment → "View Function Logs"
   - Look for 404 or routing errors

### If Service Worker Gets 404:

1. **Check Headers**:
   - Open browser DevTools → Network tab
   - Look for `service-worker.js` request
   - Check Response Headers should include:
     - `Content-Type: application/javascript; charset=utf-8`
     - `Service-Worker-Allowed: /admin/`

2. **Verify Route Match**:
   - The route `/admin/service-worker\\.js` must match exactly
   - Check for typos in vercel.json

### If Icons Get 404:

1. **Verify Icon Files Exist**:
   - SSH/Terminal: `ls -la admin/icons/*.png`
   - Should show 8-9 PNG files

2. **Check File Sizes**:
   - All icons should be > 0 bytes
   - If any are 0 bytes, regenerate them

---

## Testing After Deployment

### 1. Test Quotation Site
```
https://your-domain.vercel.app/
```
Should show: **FirepowerSFX quotation website**

### 2. Test Admin Panel
```
https://your-domain.vercel.app/admin
https://your-domain.vercel.app/admin/
```
Should show: **Order Management System (OMS)**

### 3. Test Service Worker
Open admin panel, press F12, check console:
```
✅ Service Worker registered successfully
📱 PWA features enabled
```

### 4. Test Logo
- Browser tab should show FirePowersFX logo as favicon
- No 404 errors for `/admin/logo.png`

### 5. Test Icons
Check Network tab for:
```
✅ /admin/icons/icon-144x144.png - Status 200
✅ /admin/icons/icon-192x192.png - Status 200
✅ /admin/icons/icon-512x512.png - Status 200
```

---

## Common Vercel Deployment Mistakes

❌ **DON'T**:
- Set Build Command to anything (leave empty)
- Set Output Directory to `public` or `dist`
- Use Framework Preset other than "Other"
- Add `cleanUrls: true` to vercel.json
- Use `trailingSlash: true` or `false` with routes

✅ **DO**:
- Leave Build Command empty
- Set Output Directory to `.` (dot) or leave empty
- Use Framework Preset: "Other"
- Use `routes` instead of `rewrites` for explicit control
- Keep vercel.json simple and explicit

---

## Expected Deployment Output

When Vercel deploys successfully:

```
✓ Deployment completed
✓ Serving static files from repository root
✓ Routes configured from vercel.json
✓ 0 build steps executed
✓ Files deployed: 200+ files

Routing:
  /admin → /admin/index.html ✓
  /admin/ → /admin/index.html ✓
  / → /index.html ✓
```

---

## Critical Files Checklist

Before each deployment, verify these files exist:

- [ ] `/admin/index.html` (839KB, 17631 lines)
- [ ] `/admin/service-worker.js` (contains cache v1.2.0)
- [ ] `/admin/manifest.json` (valid JSON)
- [ ] `/admin/logo.png` (actual PNG, not symlink, 1.1MB)
- [ ] `/admin/icons/icon-144x144.png` (valid PNG)
- [ ] `/vercel.json` (uses "routes", not "rewrites")
- [ ] `/.vercelignore` (minimal, doesn't exclude admin/)

---

## Contact Vercel Support

If OMS still doesn't work after following all steps:

1. Go to Vercel Dashboard → Help
2. Click "Contact Support"
3. Include:
   - Project name
   - Deployment URL
   - Screenshot of error
   - This message: "Static site with /admin subdirectory not routing correctly despite proper vercel.json routes configuration"

---

**Last Updated**: 2025-12-31
**OMS Version**: v9-PACKAGES-WORKING
**Service Worker**: v1.2.0

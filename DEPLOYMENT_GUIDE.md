# 🚀 FirepowerSFX Deployment Guide

## Complete Guide to Deploy Your New Website to www.firepowersfx.com

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [GoDaddy DNS Configuration](#godaddy-dns-configuration)
3. [Vercel Custom Domain Setup](#vercel-custom-domain-setup)
4. [Testing & Verification](#testing-verification)
5. [Troubleshooting](#troubleshooting)
6. [Next Steps](#next-steps)

---

## 🎯 Overview

**Current Status:**
- ✅ New landing page created with all 9 sections
- ✅ Quotation builder moved to `/quotation.html`
- ✅ Professional design with purple/gold theme
- ✅ Fully responsive and optimized
- 📍 Currently on Vercel subdomain

**Goal:**
- Point www.firepowersfx.com to your Vercel deployment
- Keep using Vercel (free, fast, automatic deployments)
- SSL certificate auto-provisioned

---

## 🌐 Step 1: GoDaddy DNS Configuration

### Login to GoDaddy

1. Go to [GoDaddy.com](https://www.godaddy.com)
2. Click **Sign In** (top right)
3. Navigate to **My Products**
4. Find **firepowersfx.com** and click **DNS**

### Configure DNS Records

You need to add these DNS records:

#### Record 1: CNAME for www subdomain
```
Type:  CNAME
Name:  www
Value: cname.vercel-dns.com
TTL:   1 Hour (or default)
```

#### Record 2: A Record for root domain
```
Type:  A
Name:  @
Value: 76.76.21.21
TTL:   1 Hour (or default)
```

### Step-by-Step Instructions:

1. **Delete any existing A or CNAME records** for `@` and `www` (if they exist)

2. **Add CNAME Record:**
   - Click "Add" button
   - Select "CNAME" from dropdown
   - Name: `www`
   - Value: `cname.vercel-dns.com`
   - TTL: 1 Hour
   - Click "Save"

3. **Add A Record:**
   - Click "Add" button
   - Select "A" from dropdown
   - Name: `@`
   - Value: `76.76.21.21`
   - TTL: 1 Hour
   - Click "Save"

4. **Save all changes**

⏰ **DNS Propagation:** Changes can take 1-48 hours to propagate globally, but usually work within 10-30 minutes.

---

## ⚡ Step 2: Vercel Custom Domain Setup

### Login to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign In**
3. Select your **quotations-generator** project

### Add Custom Domain

1. **Go to Project Settings:**
   - Click on your project
   - Go to "Settings" tab
   - Click "Domains" in the sidebar

2. **Add firepowersfx.com:**
   - Enter: `firepowersfx.com`
   - Click "Add"
   - Vercel will show DNS configuration instructions
   - Wait for verification (can take a few minutes)

3. **Add www.firepowersfx.com:**
   - Enter: `www.firepowersfx.com`
   - Click "Add"
   - This should verify faster since CNAME is already set

4. **Set Primary Domain:**
   - Click the three dots (...) next to `www.firepowersfx.com`
   - Select "Set as Primary"
   - This ensures `firepowersfx.com` redirects to `www.firepowersfx.com`

### SSL Certificate

Vercel automatically provisions SSL certificates! ✅

- Once domain is verified, SSL is auto-enabled
- Certificate renews automatically
- Your site will be accessible via HTTPS

---

## ✅ Step 3: Testing & Verification

### Check DNS Propagation

Use these tools to verify DNS changes:

1. **Online Tools:**
   - [whatsmydns.net](https://www.whatsmydns.net) - Check global DNS propagation
   - [dnschecker.org](https://dnschecker.org) - Another DNS checker

2. **Command Line (Windows):**
   ```cmd
   nslookup www.firepowersfx.com
   ```

3. **Command Line (Mac/Linux):**
   ```bash
   dig www.firepowersfx.com
   ```

### Test Your Website

Once DNS propagates, test these URLs:

- ✅ https://www.firepowersfx.com (main landing page)
- ✅ https://www.firepowersfx.com/quotation.html (package builder)
- ✅ https://firepowersfx.com (should redirect to www)

### Verify Features

Check all sections work:
- [ ] Hero section loads with lily background
- [ ] Trust indicators display
- [ ] Video embeds play
- [ ] Gallery images load
- [ ] Testimonials display
- [ ] Services section shows
- [ ] FAQ accordion works
- [ ] WhatsApp button floats bottom-right
- [ ] All CTAs link to `/quotation.html`
- [ ] Mobile responsive design works

---

## 🔧 Troubleshooting

### Issue: Domain Not Resolving

**Solution:**
1. Wait 1-2 hours for DNS propagation
2. Clear browser cache (Ctrl+Shift+Del)
3. Try incognito/private window
4. Use mobile data instead of WiFi

### Issue: "Invalid Configuration" on Vercel

**Solution:**
1. Double-check DNS records in GoDaddy
2. Ensure no extra spaces in values
3. Wait 30 minutes and click "Refresh" in Vercel
4. Remove and re-add the domain

### Issue: SSL Certificate Not Working

**Solution:**
1. Wait 10-20 minutes after domain verification
2. Check Vercel domain status (should show "Valid")
3. Force HTTPS redirect in Vercel settings

### Issue: Old Subdomain Still Shows

**Solution:**
1. Update all social media links to new domain
2. Set up redirects in Vercel (if needed)
3. Update Google Analytics property

### Issue: Images/CSS Not Loading

**Solution:**
1. Check file paths are relative (not absolute)
2. Verify `assets/` folder deployed correctly
3. Check browser console for errors

---

## 🎯 Next Steps

### After Successful Deployment

1. **Update Content:**
   - Replace placeholder YouTube video (line 269 in `index.html`)
   - Add your real event photos to gallery
   - Update phone numbers if needed
   - Customize testimonials with real clients

2. **Add Real Media:**
   ```
   /assets/images/
   ├── hero-lily-bg.jpg (high-quality lily photo)
   ├── gallery/
   │   ├── wedding-1.jpg
   │   ├── wedding-2.jpg
   │   ├── corporate-1.jpg
   │   └── ... (9 total images)
   ```

3. **Update Social Links:**
   - Instagram: Line 677
   - YouTube: Line 678
   - Add Facebook if needed

4. **SEO Optimization:**
   - Submit sitemap to Google Search Console
   - Add structured data (schema.org)
   - Create `robots.txt`
   - Add `sitemap.xml`

5. **Analytics Setup:**
   - Already has Google Analytics (GA4: G-R7SXFLHW48)
   - Set up conversion tracking for quotation submissions
   - Monitor CTA click rates

6. **Performance:**
   - Run Google PageSpeed Insights
   - Optimize images (use WebP format)
   - Enable Vercel Analytics (optional)

### Future Enhancements

Consider adding:
- [ ] Instagram feed widget
- [ ] Blog section for SEO
- [ ] Email newsletter signup
- [ ] Live chat widget (Tawk.to)
- [ ] Customer reviews integration
- [ ] Google My Business link
- [ ] Event photo gallery with filtering
- [ ] Video testimonials section
- [ ] Before/After slider
- [ ] Booking calendar integration

---

## 📞 Need Help?

**GoDaddy Support:**
- Phone: 1-480-505-8877
- Chat: Available on GoDaddy.com

**Vercel Support:**
- Documentation: [vercel.com/docs](https://vercel.com/docs)
- Community: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

---

## 📝 Quick Reference

### Important Files

```
/
├── index.html              # Main landing page
├── quotation.html          # Package builder (old index.html)
├── vercel.json            # Vercel configuration
├── firebase-config.js     # Firebase setup
├── /assets/
│   ├── /css/
│   │   └── styles.css     # Main stylesheet
│   ├── /js/
│   │   └── main.js        # Interactive features
│   └── /images/           # Images folder
└── logo.png               # FirepowerSFX logo
```

### Key URLs After Deployment

- **Main Site:** https://www.firepowersfx.com
- **Package Builder:** https://www.firepowersfx.com/quotation.html
- **Admin Panel:** https://www.firepowersfx.com/admin/

### Color Palette

```css
--primary: #8B5CF6 (Purple)
--accent:  #F59E0B (Gold)
--dark:    #1E293B (Dark Blue-Gray)
--white:   #FFFFFF
```

---

## ✨ Summary

1. ✅ Configure GoDaddy DNS (CNAME + A record)
2. ✅ Add custom domain in Vercel
3. ✅ Wait for DNS propagation (10-60 mins)
4. ✅ Verify SSL certificate auto-provisions
5. ✅ Test all features on live site
6. ✅ Update content with real photos/videos
7. ✅ Monitor analytics and conversions

**Estimated Time:** 30 minutes to 2 hours (mostly waiting for DNS)

---

🎆 **Your new professional FirepowerSFX website is ready to launch!**

Good luck with your new website! 🚀

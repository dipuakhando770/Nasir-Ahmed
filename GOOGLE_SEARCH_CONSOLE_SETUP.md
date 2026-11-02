# Google Search Console Verification & Setup Guide
**Domain Property:** `urlshort.nasirdigitalhub.com`  
**Verification Method:** Meta Tag & DNS TXT Record  
**Status:** Verification Tag Installed (`google-site-verification: nNC_6sZlQCSTbyCWAiIP__5d1jbVJGNqrxMtpZ64qMo`)

---

## 1. Google Search Console Verification Instructions

### Method A: HTML Meta Tag Verification (Already Pre-Injected)
The Google Search Console site verification meta tag has been permanently injected into the root HTML documents of your web server (`/index.html`, `server.ts`, and `src/worker.ts` SPA templates):

```html
<meta name="google-site-verification" content="nNC_6sZlQCSTbyCWAiIP__5d1jbVJGNqrxMtpZ64qMo" />
```

**Steps to Complete in Google Search Console:**
1. Open [Google Search Console](https://search.google.com/search-console).
2. Click **Add Property**.
3. Select **URL prefix** and enter: `https://urlshort.nasirdigitalhub.com/`
4. Choose **HTML Tag** as your verification method.
5. Click **Verify**. Search Console will read the live `<meta>` tag and confirm ownership instantly.

---

### Method B: DNS TXT Verification (Recommended for Domain Property)
To verify ownership at the domain level across all subdomains:
1. In Search Console, select **Domain** property and enter: `nasirdigitalhub.com`
2. Copy the provided TXT record (e.g. `google-site-verification=nNC_6sZlQCSTbyCWAiIP__5d1jbVJGNqrxMtpZ64qMo`).
3. Log into your DNS provider (Cloudflare / Namecheap / Cpanel).
4. Add a new **TXT** record:
   - **Name / Host:** `@` or `nasirdigitalhub.com`
   - **TTL:** Auto or `3600`
   - **Content / Value:** `google-site-verification=nNC_6sZlQCSTbyCWAiIP__5d1jbVJGNqrxMtpZ64qMo`
5. Click **Verify** in Search Console once DNS propagates.

---

## 2. Submitting Your XML Sitemap

After verifying property ownership:
1. In the left navigation menu of Google Search Console, click **Sitemaps**.
2. Under **Add a new sitemap**, type: `sitemap.xml`
3. Click **Submit**.

**Submitted Sitemap URL:** `https://urlshort.nasirdigitalhub.com/sitemap.xml`  
**Expected Indexable Pages Included:**
- `/` (Homepage Hub)
- `/url-shortener`
- `/free-url-shortener`
- `/link-shortener`
- `/short-url-generator`
- `/custom-url-shortener`
- `/branded-url-shortener`
- `/url-shortener-with-analytics`
- `/bulk-url-shortener`
- `/qr-code-generator`
- `/pricing`
- `/blog` (Knowledge Hub)
- 10 Educational Blog Articles (`/blog/*`)
- `/about`, `/contact`, `/privacy`, `/terms`, `/abuse`

---

## 3. Monitoring & Post-Submission Checklist

1. **URL Inspection:** Use the Search Console URL Inspection Tool to test live indexing for `https://urlshort.nasirdigitalhub.com/` and ensure Googlebot renders the page without errors.
2. **Page Indexing Status:** Monitor the **Pages** report weekly. Verify that private app routes (`/admin`, `/nachid`, `/dashboard`) remain properly excluded under `noindex`.
3. **Core Web Vitals:** Check the **Core Web Vitals** tab for Mobile and Desktop performance metrics (LCP < 2.5s, CLS < 0.1, INP < 200ms).
4. **Structured Data Validation:** Inspect the **Enhancements** tab to ensure Google detects valid `SoftwareApplication`, `Organization`, `FAQPage`, `BreadcrumbList`, and `Article` JSON-LD schema markup.

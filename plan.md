# Plan: Fix Two Desktop-Only Issues

## Issue 1: Navbar Under Topbar (Desktop Z-Index)

**File:** `apps/web/components/web/navbar.tsx` line 83

**Problem:** Navbar has `z-40`, TitleBar has `z-50` - Navbar renders under TitleBar on desktop

**Fix:** Change `z-40` to `z-50` (or higher) so Navbar sits above TitleBar

```diff
- className={`sticky transition-shadow duration-300 z-40 ${...}`}
+ className={`sticky transition-shadow duration-300 z-50 ${...}`}
```

---

## Issue 2: "Can't Reach Contact Server" on Desktop

**File:** `apps/web/components/web/Contact.tsx` lines 74-77

**Problem:** Desktop mode uses hardcoded `PRODUCTION_URL` (`https://george-shenoda.vercel.app`) instead of local server URL. The desktop app runs a local Next.js server (both dev and production) at `http://127.0.0.1:<port>`. API calls should go to local origin.

**Fix:** Use `window.location.origin` (works everywhere: local dev, Vercel, desktop app) or relative `/api/contact` URL

```diff
- const result = window.electronAPI?.isDesktop === true
-   ? await submitContact(PRODUCTION_URL, submitFormData)
-   : await sendContactEmail(submitFormData);
+ const result = window.electronAPI?.isDesktop === true
+   ? await submitContact(window.location.origin, submitFormData)
+   : await sendContactEmail(submitFormData);
```

Alternative: Use relative URL `/api/contact` (works in all environments via fetch)

---

## Testing

1. Run `npm run desktop:dev` - verify Navbar above TitleBar, contact form works
2. Run `npm run desktop:build` + test built app - verify both fixes in production build
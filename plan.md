# Plan — Google Analytics (gtag.js)

## Branch: feat/google-analytics

User request: install GA4 gtag.js (`G-JMPFJDFM5T`) on every page of the website.

### Approach

1. `apps/web/components/Analytics.tsx` (new) — component wrapping `next/script`
   - Loads `https://www.googletagmanager.com/gtag/js?id=…` with
     `strategy="afterInteractive"` (non render-blocking; protects LCP work from
     perf/web-vitals-google-verification)
   - Inlines the dataLayer/gtag bootstrap in a second `afterInteractive` script
   - Measurement ID read from `NEXT_PUBLIC_GA_ID`, falling back to the hardcoded
     `G-JMPFJDFM5T` (IDs are public; `.env` files are untracked in this repo so a
     code fallback guarantees it renders on Vercel without extra config)
2. `apps/web/app/layout.tsx` — render `<Analytics />` once for all routes
3. `README.md` — document `NEXT_PUBLIC_GA_ID` env override

### Notes / accepted behavior

- Runs on web AND inside the Electron desktop shell + any origin (GA4 accepts
  localhost/127.0.0.1 hostnames). Offline desktop: script request fails silently.
- No cookie-consent gating requested; privacy page already exists.

### Verification

- [ ] typecheck/lint/build green; tests untouched but re-run
- [ ] Built homepage HTML contains `googletagmanager.com/gtag/js?id=G-JMPFJDFM5T`
- [ ] Commit message = branch name; push; PR → main

### Files

- `apps/web/components/Analytics.tsx` (new)
- `apps/web/app/layout.tsx`
- `README.md`

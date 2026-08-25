# Plan — Google Analytics (gtag.js)

## Branches: feat/google-analytics → chore/remove-hardcoded-ga-id → chore/rename-ga-env-var

User request: install GA4 gtag.js (`G-JMPFJDFM5T`) on every page, remove any
hardcoded ID from source, and silence Vercel's "public framework prefix" warning
when saving the env var.

### Final approach

1. `apps/web/components/Analytics.tsx` — `next/script` wrapper
   - `strategy="afterInteractive"` (non render-blocking; LCP-safe)
   - **ID read exclusively from `GOOGLE_ANALYTICS_ID`; no hardcoded fallback —
     renders nothing when unset**
   - No `NEXT_PUBLIC_` prefix: Analytics is a Server Component, so the value is
     interpolated into HTML server-side and stays out of the client bundle
     (this also clears Vercel's public-prefix warning on save)
2. Local `apps/web/.env` (untracked): `GOOGLE_ANALYTICS_ID=G-JMPFJDFM5T`
3. **User follow-up in Vercel:** env var name is now `GOOGLE_ANALYTICS_ID`
   (see README); analytics stays off until set
4. README documents the variable as server-side-only

### User follow-ups

- [ ] typecheck/lint/build green
- [ ] Built homepage HTML contains `googletagmanager.com/gtag/js` (env present locally)
- [ ] Commit message = branch name; push; PR → main


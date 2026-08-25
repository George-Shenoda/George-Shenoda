# Plan — Google Analytics (gtag.js)

## Branch: feat/google-analytics + chore/remove-hardcoded-ga-id

User request: install GA4 gtag.js (`G-JMPFJDFM5T`) on every page of the website,
then (revision) remove the hardcoded measurement-ID fallback from code.

### Final approach

1. `apps/web/components/Analytics.tsx` — `next/script` wrapper
   - `strategy="afterInteractive"` (non render-blocking; LCP-safe)
   - **ID read exclusively from `NEXT_PUBLIC_GA_ID`; no hardcoded fallback —
     renders nothing when unset** (user request: no IDs in source)
2. Local `apps/web/.env` (untracked) gets `NEXT_PUBLIC_GA_ID=G-JMPFJDFM5T`
3. **Required follow-up for the user:** add `NEXT_PUBLIC_GA_ID=G-JMPFJDFM5T`
   to Vercel project env vars — analytics stays off until then
4. README documents the variable as env-only

### Verification

- [ ] typecheck/lint/build green; tests untouched but re-run
- [ ] Built homepage HTML contains `googletagmanager.com/gtag/js` (env present locally)
- [ ] Commit message = branch name; push; PR → main


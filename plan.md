# Plan — Google site verification + mobile web-vitals fixes

## Branch: perf/web-vitals-google-verification

Two user-requested items. Baseline: Lighthouse mobile 86 / desktop 99
(LCP 3.7s with 3,570ms element-render delay; 257 KiB image savings;
non-composited animations ×5; 13.7 KiB legacy polyfills).

### A. Google Search Console verification

1. `apps/web/app/layout.tsx` — add `metadata.verification.google` via the Next
   Metadata API (emits `<meta name="google-site-verification" …>` in `<head>`
   for the homepage). Content: `2nJ2vS3BR09ScS2fBNtftH9_PhwL6jU2VWB3_jGVtSs`

### B. Mobile web vitals

1. **LCP (biggest win)** — hero content is JS-gated invisible:
   `Reveal.tsx` renders `opacity-0` until hydration + IntersectionObserver.
   - `Reveal.tsx`: new `immediate` prop → static CSS-only entrance classes
     (`motion-safe:animate-in fade-in slide-in-from-bottom-4`), no opacity-0 gating
   - `hero.tsx`: all five hero Reveals use `immediate`
2. **Images (~257 KiB)** — `Project.tsx` uses `<Image unoptimized>`:
   - Remove `unoptimized`; strip the baked `LIVE_BASE` prefix so web serves a
     relative src through the Vercel optimizer (AVIF/WebP, right-sized)
   - True cross-origin srcs (desktop live-fetch case) fall back to lazy `<img>`
3. **Non-composited animations** — replace `transition-all` with explicit
   transform/box-shadow/border-color transitions (hero CTA, project card,
   other hot paths found by grep)
4. **Legacy JS** — modern `browserslist` in `apps/web/package.json`
   (chrome ≥107, edge ≥107, firefox ≥104, safari ≥16) to shed core-js polyfills
5. **Font audit** — confirm each loaded family (`Inter`, `Plus_Jakarta_Sans`,
   `JetBrains_Mono`) is referenced in `globals.css`; drop dead ones

### Files to modify

- `apps/web/app/layout.tsx`
- `apps/web/components/web/Reveal.tsx`
- `apps/web/components/web/hero.tsx`
- `apps/web/components/web/Project.tsx`
- `apps/web/package.json`
- possibly `apps/web/globals.css` (font cleanup)

### Verification

- [ ] `npm test`, web `typecheck`/`lint`/`build` green
- [ ] Built HTML contains `google-site-verification` meta tag
- [ ] No core-js polyfill chunk in build output (grep chunks for `Array.prototype.at`)
- [ ] No `opacity-0` gating above the fold (grep hero)
- [ ] User re-runs PageSpeed on Vercel preview (target: LCP <2.5s, mobile ≥95)

### Git workflow

- Commit message = branch name, push, PR → main

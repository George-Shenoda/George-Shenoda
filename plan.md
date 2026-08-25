# Fix Plan — Portfolio Multi-Platform Issues

## Branch: fix/multi-platform-issues

### Tasks

1. **Button nativeButton warning (web)**
   - Fix `DropdownMenuTrigger` wrapper in `apps/web/components/web/navbar.tsx:136`
   - Keep `View CV` link correct (`nativeButton={false}` + `<Link>`)
   - Revert trigger to default (`nativeButton={true}`) or render non-`<button>`

2. **Back button on /cv and /privacy (web + desktop)**
   - Add sticky header with Back + Print to `apps/web/app/cv/page.tsx`
   - Add sticky header with Back to `apps/web/app/privacy/page.tsx`
   - Use `router.back()` fallback to `router.push("/")`

3. **Navbar cross-route navigation (web + desktop)**
   - Update `apps/web/utils/scroll.ts` and `navbar.tsx` to handle `/cv`/`/privacy` routes
   - Use `usePathname` + `useRouter` from `next/navigation`
   - If not on `/`, navigate to `/#section` instead of scrolling

4. **Mobile workflow/projects scroll fix**
   - Audit `apps/mobile/App.tsx` layout measurement
   - Fix `navigate` to wait for `sectionTops` and subtract `barHeight + insets.top + SCROLL_MARGIN`
   - Ensure `BusinessSection`/`TrustSection` don't interfere

5. **Mobile PrivacySheet dark mode**
   - Mirror `CVSheet` theming: use `usePalette()`/`useThemeMode()`
   - Switch `backdrop`, `sheet`, `topBar`, `title`, `SectionTitle/Body/Bullet` colors

6. **Contact form fixes**
   - **Offline detection**: Fix `NetInfo`/`fetch` error handling in `packages/shared/src/contact-client.ts`, `apps/mobile/src/components/ContactForm.tsx`, `apps/web/components/web/Contact.tsx`
   - **Email routing**: Fix Nodemailer `from`/`to`/`replyTo` in `apps/web/app/api/contact/route.ts`
   - Distinguish `networkError` vs validation/server error

7. **TrustSection badge count (mobile)**
   - Remove hardcoded `import { projects } from '@portfolio/shared'`
   - Use live fetched count from `ProjectsSection` (lift state or context)

8. **Release/tag documentation**
   - Add note to README: project edits = no tag (live fetch), code changes = tag

### Files to Modify

- `apps/web/components/web/navbar.tsx`
- `apps/web/components/ui/button.tsx` (if needed)
- `apps/web/components/ui/dropdown-menu.tsx` (if needed)
- `apps/web/utils/scroll.ts`
- `apps/web/app/cv/page.tsx`
- `apps/web/app/privacy/page.tsx`
- `apps/mobile/App.tsx`
- `apps/mobile/src/scroll.tsx`
- `apps/mobile/src/components/Navbar.tsx`
- `apps/mobile/src/components/PrivacySheet.tsx`
- `apps/mobile/src/components/ProjectsSection.tsx`
- `apps/mobile/src/components/TrustSection.tsx`
- `apps/mobile/src/components/ContactForm.tsx`
- `apps/mobile/src/outbox-storage.ts`
- `packages/shared/src/contact-client.ts`
- `apps/web/components/web/Contact.tsx`
- `apps/web/app/api/contact/route.ts`
- `apps/web/app/api/projects/route.ts` (verify)

### Verification

- `npm run typecheck -w @portfolio/web` + `npm run lint -w @portfolio/web` + `npm run build -w @portfolio/web`
- `npm run typecheck -w @portfolio/mobile` + `expo start --clear`
- Manual contact form test on web/mobile/desktop
- Tag release for code changes only
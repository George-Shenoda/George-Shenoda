# Plan: Fix Email Service & Make Download Page Web-Only

## Issue 1: Email Service Not Configured in Desktop App ✅ COMPLETED

**Root Cause**: When running the desktop app (`npm run desktop:dev`), the Electron main process starts the Next.js dev server with `cwd: WEB_DIR`, but the environment variables from `apps/web/.env` were not being loaded by Next.js because the process was spawned from the desktop directory context.

**Solution**: 
- Added `dotenv` package to desktop app dependencies
- Modified `apps/desktop/electron/main.mjs` to load `apps/web/.env` before starting the Next.js server
- The loaded env vars are now passed to the spawned Next.js process

**Files Modified**:
1. `apps/desktop/package.json` - Added dotenv dependency
2. `apps/desktop/electron/main.mjs` - Load .env from web directory using dotenv.config()

**Verification**: Desktop dev server now shows "Environments: .env" in the startup logs, confirming the .env file is loaded.

---

## Issue 2: Download Page Should Be Web-Only (Remove from Desktop) ✅ COMPLETED

**Root Cause**: The download page (`/download`) was accessible via the navbar in both web and desktop apps. The navbar already detects desktop mode via `window.electronAPI?.isDesktop`.

**Solution**:
- Modified the navbar component (`apps/web/components/web/navbar.tsx`) to conditionally exclude the "Download" link from `NAV_LINKS` when running in desktop mode
- Used `useMemo` to create filtered nav links based on `isDesktop` state
- Updated both the desktop nav and mobile dropdown menu
- The download page itself remains accessible at `/download` on the web (for direct URL access), but is not linked from the desktop app's navbar

**Files Modified**:
1. `apps/web/components/web/navbar.tsx` - Conditionally hide Download link in desktop mode

**Verification**: Lint and typecheck pass. Build completes successfully.

---

## Summary

Both issues have been resolved:

1. **Email service** - The desktop app now correctly loads the `.env` file from the web directory, so EMAIL_USER and EMAIL_PASS are available to the Next.js server when running in the Electron desktop app.

2. **Download page** - The download page is now web-only. It's not accessible via the navbar in the desktop app, but remains available at `/download` on the web for direct access.
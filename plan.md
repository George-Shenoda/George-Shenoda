# Implementation Plan: Desktop Contact Fix, Cooldown Update, Build Targets, Download Page

**Status**: Complete (Ready for Release)  
**Last Updated**: 2026-08-28

---

## Phase 1: Fix Desktop Contact Form Submission (HIGHEST PRIORITY)

**File**: `apps/web/components/web/Contact.tsx`

**Problem**: Desktop app uses `SITE_URL` (defaults to `https://localhost:3000`) for contact submissions, hitting local standalone server without email credentials → "Email service is not configured" error.

**Solution**: 
- Add constant `PRODUCTION_URL = 'https://george-shenoda.vercel.app'`
- In `handleSubmit`, when `isDesktop`, use `PRODUCTION_URL` for `submitContact()` call
- This ensures desktop app always hits Vercel API with proper email config

**Test**: Create local test script to verify desktop contact form works with production URL before pushing.

---

## Phase 2: Update Cooldown Logic (Web + Mobile)

**Files**: 
- `apps/web/components/web/Contact.tsx`
- `apps/mobile/src/components/ContactForm.tsx`

**Changes**:
| Current | New |
|---------|-----|
| `COOLDOWN_MS = 10_000` | `COOLDOWN_MS = 5_000` |
| Shows cooldown UI immediately after success | Cooldown UI **hidden** after success; status stays `'success'` |
| Button shows "Wait Xs..." during cooldown | Button shows "Send Message" (enabled visually) |
| | On click during cooldown: set status `'loading'`, disable button, show spinner |
| | `setTimeout(remainingMs)` → then execute actual submit |
| | If submit succeeds → reset cooldown; if fails → show error |

**Logic Flow**:
```
User clicks Send → 
  if (Date.now() < cooldownUntil) → 
    status = 'loading' (spinner, disabled) → 
    wait (cooldownUntil - now) ms → 
    execute submit → 
    on success: status = 'success', cooldownUntil = Date.now() + 5000
  else → 
    normal submit
```

**Cooldown Queue Behavior**: If user clicks multiple times during cooldown, only the first click triggers the delayed send. Subsequent clicks ignored until current send completes.

---

## Phase 3: Adjust Build Targets

**File**: `electron-builder.yml`

| Platform | Current Targets | New Targets |
|----------|----------------|-------------|
| Windows | `nsis`, `portable` | `nsis` only (Setup.exe) |
| macOS | `dmg` (x64, arm64), `zip` (x64, arm64) | `dmg` only (x64, arm64) — **both .dmg files** |
| Linux | `AppImage`, `deb` | `deb` only |

---

## Phase 4: Android APK Renaming

**File**: `.github/workflows/release.yml`

In Android job (after APK download):
```bash
VERSION=$(node -e "console.log(require('./package.json').version)")
mv app-release.apk "George-Shenoda-Portfolio-v${VERSION}.apk"
```
Update upload artifact path to match new filename.

---

## Phase 5: Create Download Page

**New File**: `apps/web/app/download/page.tsx`

**Features**:
- **Client-side fetch** from `https://api.github.com/repos/George-Shenoda/George-Shenoda/releases/latest` (always current)
- **Cached fallback**: If GitHub API fails, use static version from `package.json` + known asset naming patterns
- Platform cards grid: Windows, macOS (both x64 & arm64), Linux, Android
- Each card: icon, name, version, file type, download button
- Auto-detect OS via `navigator.userAgent` → highlight recommended card
- Download URLs: `https://github.com/George-Shenoda/George-Shenoda/releases/latest/download/<asset-filename>`
- "View all releases" link to GitHub Releases page
- Responsive design matching site aesthetic

**Asset Filenames** (from workflow):
- Windows: `George Shenoda Setup 0.1.0.exe`
- macOS x64: `George Shenoda-0.1.0.dmg`
- macOS arm64: `George Shenoda-0.1.0-arm64.dmg`
- Linux: `my_portfolio-0.1.0.deb` (or similar)
- Android: `George-Shenoda-Portfolio-v0.1.0.apk`

---

## Phase 6: Add Download Navigation

**File**: `apps/web/components/web/navbar.tsx` (or wherever nav is defined)

Add "Download" link to `/download` in main navigation.

---

## Phase 7: Test & Deploy

1. **Local test**: Verify desktop contact form submits to production API
2. **Build & test**: Run full build pipeline (web + desktop)
3. **Push to main**: Trigger CI to verify workflows
4. **Tag release**: `git tag v0.1.1` (or next version) → triggers release workflow with new configs
5. **Verify GitHub Release**: Check all artifacts uploaded correctly with new naming

---

## Progress Tracker

| Phase | Task | Status |
|-------|------|--------|
| 1 | Fix desktop contact form (Contact.tsx) | ✅ Done |
| 1 | Create local test script | ✅ Done |
| 2 | Update web cooldown (Contact.tsx) | ✅ Done |
| 2 | Update mobile cooldown (ContactForm.tsx) | ✅ Done |
| 3 | Adjust build targets (electron-builder.yml) | ✅ Done |
| 4 | Android APK rename (release.yml) | ✅ Done |
| 5 | Create download page (download/page.tsx) | ✅ Done |
| 6 | Add nav link (navbar.tsx) | ✅ Done |
| 7 | Local build test | ✅ Done |
| 7 | Push to main & tag release | ⬜ Pending |

---

## Notes

- **Production URL constant**: Hardcoded as `https://george-shenoda.vercel.app` in Contact.tsx
- **Download page**: Client-side fetching with cached fallback for resilience
- **macOS**: Both x64 and arm64 .dmg files shown with architecture labels
- **Linux**: Only .deb package
- **Windows**: Only Setup.exe (NSIS installer), no portable
- **Android**: Renamed to `George-Shenoda-Portfolio-v{version}.apk`
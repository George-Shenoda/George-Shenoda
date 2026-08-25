# Plan — Firebase Analytics (Android now, iOS prepped)

## Branch: feat/firebase-analytics

User completed the GA→Firebase wizard manually after the app-stream flake;
`google-services.json` provided (package `com.georgeshenoda.portfolio`,
project `geogrge-shenoda`). Approved scope: full native SDK (Expo Go dropped),
Android wired now, iOS prepared but not activated.

### Changes

1. Move `google-services.json` → `apps/mobile/google-services.json` (committed;
   Firebase-classified non-secret; required in-repo for EAS cloud builds)
2. Deps: `@react-native-firebase/app` + `@react-native-firebase/analytics`
   via `npx expo install` (new-arch compatible; Expo SDK 57 minSdk 24 ≥ requirement)
3. `apps/mobile/app.json`:
   - `"android": { "googleServicesFile": "./google-services.json" }`
   - plugins += `"@react-native-firebase/app"`
   - iOS `googleServicesFile` NOT added yet — activates when user provides
     `GoogleService-Info.plist` (documented in README)
4. New `apps/mobile/src/analytics.ts`: safe wrapper — every call try/catch
   no-op so analytics can never crash the app
5. Instrumentation:
   - `logAppOpen()` on mount in PortfolioApp
   - `screen_view` for workflow/projects/contact deduped on `activeSection`
     change (existing ScrollProvider state — no new scroll logic)
6. README: dev workflow now requires a dev build (`npx expo run:android`);
   Expo Go no longer supported for this app; iOS plist steps documented

### Verification

- [ ] mobile typecheck green
- [ ] expo config sanity (`npx expo config --type prebuild` dry check or doctor)
- [ ] Runtime verify needs device/emulator (user side): DebugView instructions in README
- [ ] Commit message = branch name; push; PR → main

### Out of scope / later

- iOS `GoogleService-Info.plist` wiring (file not yet available)
- Custom events beyond app_open + screen_view
- New release tag (ships with next tagged APK)

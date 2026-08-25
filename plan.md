# Plan — Firebase Analytics (Android now, iOS prepped)

## Branch: feat/firebase-analytics (rebuilt — secret scrub)

> **Incident note:** the first push of this branch committed
> `apps/mobile/google-services.json`; GitHub flagged the embedded API key.
> Remediation (user-approved): key rotated in Google Cloud (old `AIzaSyBHdX…`
> deleted, fresh config downloaded), branch history rebuilt without the file and
> force-pushed, config now injected via `GOOGLE_SERVICES_JSON_B64` Actions secret.
> File is gitignored locally.

## Changes

1. `apps/mobile/google-services.json` — **untracked** local file only (gitignored)
2. Deps: `@react-native-firebase/app` + `@react-native-firebase/analytics` v26.3.2
3. `apps/mobile/app.json`: android.googleServicesFile + `@react-native-firebase/app` plugin
4. New `apps/mobile/src/analytics.ts`: fail-safe wrapper (v26 named-export API)
5. Instrumentation: `app_open` on launch; deduped `screen_view` per section via existing activeSection state
6. `.github/workflows/release.yml`: Android job decodes `GOOGLE_SERVICES_JSON_B64`
   into place before `eas build`, fail-fast with clear error if unset
7. README: untracked-config setup (local + CI), rotation playbook, DebugView, iOS prep

## Verification

- [x] mobile typecheck green
- [x] prebuild config resolves plugin + googleServicesFile
- [ ] Runtime DebugView check on device (user side)
- [ ] Branch contains no google-services.json in history (rebuilt from main)

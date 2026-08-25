# Plan: Rotate leaked Google API key (`chore/rotate-firebase-key`)

## Incident

- GitHub secret scanning flagged a Google API key (`AIzaSyDvp-WUlZGEU-Iah…`) committed in
  `0135aa7` at `apps/mobile/android/app/google-services.json`.
- That commit is reachable from `main` (PR #20) **and** contained in tag `v0.1.0`, so it is
  permanently part of published history.
- At HEAD the file is already untracked (rotated-secret policy): Firebase configs arrive in
  cloud builds via EAS env vars `GOOGLE_SERVICES_JSON_B64` / `GOOGLE_SERVICES_PLIST_B64`
  consumed by `apps/mobile/scripts/eas-write-firebase-configs.mjs`.

## Context

- Prior `plan.md` (`chore/release-v0.1.0`, commit 6b6f882) recorded an earlier rotation:
  "old key is dead per rotation". However, both local `google-services.json` copies still
  embed the flagged key and GitHub has re-flagged it, so its status is uncertain.
- **Step 4 below therefore starts with verifying the key's live status in GCP** — if it is
  already disabled/removed, only the alert needs closing; otherwise full rotation applies.

## Decisions (approved)

| Decision | Choice |
| --- | --- |
| Key handling | Rotate + restrict (new key, delete old) |
| New tag / rebuild | **None** — accept that v0.1.0-installed APKs lose Firebase analytics once the old key is deleted |
| Git history purge | Leave as-is (key becomes inert once revoked; no force-push of `main`/tag) |

## Steps

### Automated on this branch (no tag/rebuild required)

1. ✅ Branch `chore/rotate-firebase-key` created.
2. This `plan.md` documents the incident response.
3. New helper `apps/mobile/scripts/apply-rotated-firebase-configs.mjs`:
   - installs freshly downloaded Firebase configs into all three untracked locations
     (`apps/mobile/android/app/google-services.json`, `apps/mobile/google-services.json`,
     `apps/mobile/GoogleService-Info.plist`),
   - refuses to install any file still containing the old key,
   - scans `apps/mobile/` for leftover references to the old key (`--check-only`),
   - base64-encodes the new configs and updates the EAS env vars
     (`--update-eas`, requires Expo login).

### Manual — Google Cloud Console (owner)

4. APIs & Services → Credentials: locate `AIzaSyDvp-WUlZGEU-IahTyX_uE7kUINjQeM3c0`.
   - Already absent/disabled → skip to step 11 (close alert), nothing else needed.
   - Still active → create replacement: **Create credentials → API key**.
5. Restrict the new key:
   - *Application restrictions* → Android apps → add package name + SHA-1 fingerprints
     (release via `cd apps/mobile && npx eas-cli credentials`, debug keystore as needed);
     add iOS bundle ID if the plist stays in use.
   - *API restrictions* → only Firebase-required APIs (Firebase Installations, Analytics).
6. Skim the **old** key's usage metrics for signs of abuse while it is still listed.

### Manual — Firebase console (owner)

7. Project settings → re-download `google-services.json` (Android) and
   `GoogleService-Info.plist` (iOS).
8. Run the helper to install them locally:
   ```
   node apps/mobile/scripts/apply-rotated-firebase-configs.mjs \
     --android <path-to-downloaded-google-services.json> \
     --ios <path-to-downloaded-GoogleService-Info.plist> \
     --update-eas
   ```

### Verify (before revoking)

9. Launch the app locally; confirm analytics events reach GA4/Firebase DebugView.
10. Optional: trigger an EAS preview build to prove the cloud path picks up the rotated key.

### Revoke & close

11. Delete the old key in GCP → Credentials.
12. Close the GitHub secret-scanning alert as **Revoked**.
13. History left untouched; no new tag. Known accepted impact: installs built from `v0.1.0`
    stop reporting analytics after step 11.

### Wrap-up

14. Commit (message = branch name), push, open PR to `main`.

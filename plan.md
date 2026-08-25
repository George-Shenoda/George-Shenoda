# Plan — Release reset: single tag v0.1.0 + hardened release.yml

## Branch: chore/release-v0.1.0

User request: wipe all existing tags, cut one fresh `v0.1.0`, and finalize
release.yml. During prep, an incident was discovered & handled:

> **Incident:** PR #16 merged the pre-scrub firebase commit, putting the
> (already-rotated) google-services.json back on public main and re-tracking it.
> This branch removes it again (`git rm --cached`, gitignored) — old key is dead
> per rotation, so historical copies are inert. Remote feature branch should be
> deleted after merge.

### Changes

1. Remove `apps/mobile/google-services.json` from tracking (untracked local file kept)
2. `.gitignore`: firebase config entries (lost in the bad merge)
3. `.github/workflows/release.yml`:
   - desktop web build bakes `GOOGLE_ANALYTICS_ID` + `NEXT_PUBLIC_SITE_URL`
     from Actions secrets (desktop installers were shipping without analytics)
   - android job: restore `google-services.json` from `GOOGLE_SERVICES_JSON_B64`
     (fail-fast if unset)
   - ios job: matching `GOOGLE_SERVICES_PLIST_B64` restore step for when iOS is enabled
4. Tag reset: delete `v0.1.0/v0.1.1/v0.1.2/v0.2.0` (remote+local), create fresh
   annotated `v0.1.0` on this commit → triggers full Release build

### User follow-ups

- Merge this PR, then delete stale GitHub Releases (v0.1.x / v0.2.0 pages+assets) manually
- Ensure Actions secrets exist: GOOGLE_ANALYTICS_ID, GOOGLE_SERVICES_JSON_B64,
  (later) GOOGLE_SERVICES_PLIST_B64, NEXT_PUBLIC_SITE_URL
- Optionally set EXPO_PUBLIC_SITE_URL via `eas env` so release APKs reach prod APIs
- Delete stale remote branch feat/firebase-analytics

## Verification

- [x] YAML parses; mobile typecheck green
- [x] No firebase config tracked anywhere in tree
- [ ] Workflow run green after tag push

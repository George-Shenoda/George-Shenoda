# Plan — Desktop live projects + setup-file release workflow

## Branch: feat/desktop-live-projects

Two deliverables in this feature (user-approved):

### A. Desktop fetches projects live from the deployed website

Currently the Electron desktop app serves `/api/projects` from its own bundled
Next server, so new projects/images only appear after a tagged release. Make it
load live like mobile already does:

1. `apps/web/components/web/projects.tsx`
   - `const LIVE_BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "")`
   - Fetch `${LIVE_BASE}/api/projects`; on failure retry relative `/api/projects`
     (preserves offline bundled-snapshot behavior)
   - Resolve card images through `LIVE_BASE` (`<Image unoptimized>` already used,
     so absolute URLs need no next.config changes)
2. `apps/web/app/api/projects/route.ts`
   - Add `Access-Control-Allow-Origin: *` (public read-only data; Electron window
     origin is `http://127.0.0.1:<random-port>` → CORS otherwise blocks reading)
3. Tests: extend `tests/integration/web/projects-route.test.ts` (CORS header)
4. README: document that adding a project updates ALL platforms via site deploy;
   tags are only needed for code releases

### B. Release workflow produces installable setup files

`.github/workflows/release.yml` gaps found while researching:

1. **Android bug**: job uses `--profile production`, but `eas.json` production
   builds an **app-bundle (.aab)** while the workflow renames it `.apk`.
   → Build with `--profile preview` (real `.apk`, per eas.json `preview.android.buildType: apk`)
2. **macOS**: build both x64 and arm64 DMG/zip (runner default is arm64-only)
3. **Desktop installers not uploaded as workflow artifacts** (only tag-publish).
   → Upload NSIS Setup `.exe`, portable `.exe`, `.dmg`, `.zip`, `.AppImage`, `.deb`
   via `actions/upload-artifact` so they exist even without publishing
4. Add `workflow_dispatch` trigger to produce setup files on demand without a tag;
   publish step runs `--publish always` only on tag pushes, else `--publish never`;
   Release-creation job gated to tag pushes

### Files to modify

- `apps/web/components/web/projects.tsx`
- `apps/web/app/api/projects/route.ts`
- `tests/integration/web/projects-route.test.ts`
- `.github/workflows/release.yml`
- `README.md`

### Out of scope

- Code signing secrets (already wired via env passthrough, untouched)
- iOS IPA flow (kept as-is; separate store distribution)
- Removing dead `apps/mobile/assets/projects/` copies (separate cleanup)

### Verification

- [ ] `npm test` green (incl. new CORS assertion)
- [ ] web `typecheck`, `lint`, `build`
- [ ] Workflow YAML sanity (`npm run` unaffected); actionlint not available — manual review
- [ ] Manual desktop check optional (needs display): dev run shows live data

### Git workflow (per repo rules)

- Branch `feat/desktop-live-projects` from latest `origin/main`
- Commit message = branch name, push after commit, PR → `main`

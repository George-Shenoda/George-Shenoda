# Plan: Final Cleanup — Email/Footer/Dummy/Mobile APK (fix/final-cleanup-email-footer-dummy)

## Previous: Desktop OTA Project Images (fix/desktop-projects-image-ota + v2) — merged
### Issue 1 — Desktop: new/updated project images not visible after `git push` without rebuilding Electron (DONE)

**Verified root cause:**
- `apps/desktop/electron/assemble.mjs:24-25` copies `apps/web/.next/static` + `apps/web/public` into the standalone bundle ONCE at `desktop:build`. `apps/desktop/electron/main.mjs:102-130` serves that frozen copy. Any file added to `apps/web/public/assets/projects/` after that build is not in installed binaries — Vercel deploy alone does not update desktop.
- `apps/web/components/web/projects.tsx:39-45,80` does OTA-fetch the JSON list via `${LIVE_BASE}/api/projects` (`packages/shared/src/projects.ts` -> `apps/web/app/api/projects/route.ts:1-9`), so NEW project entries appear, but images stay local:
- `apps/web/components/web/Project.tsx:18-24` strips `LIVE_BASE` prefix (`optimizedSrc = image.slice(LIVE_BASE.length)`) and forces `next/image` from `http://127.0.0.1:<port>/assets/...` (frozen local copy). Cross-origin `<img>` branch `42-50` is never taken for `LIVE_BASE` images.

**Chosen solution — Desktop A (OTA cross-origin, offline fallback):**
- When running inside Electron (`window.electronAPI?.isDesktop === true`) and `NEXT_PUBLIC_SITE_URL` is set, keep remote `src` as `https://site.vercel.app/assets/projects/*.png` and render as plain `<img>` (cross-origin), not `next/image`. No stripping.
- Otherwise (web, or desktop without `LIVE_BASE`, or offline with fetch failure) fall back to local `/assets/...` via `next/image`.
- Add `onError` fallback: if remote image 404/offline, swap to local bundled path so offline desktop still shows snapshot.
- Add `cache: 'no-store'` to client fetch (`projects.tsx:19-27`) and `Cache-Control: no-store, must-revalidate` to `apps/web/app/api/projects/route.ts:6` + `next.config.ts` headers so JSON list is never CDN-cached.
- `next/image` stays `unoptimized: true` — no change needed for images domain; cross-origin `<img>` bypasses Next optimizer.

**Files to modify (v1 + v2 hotfix):**
1. `apps/web/components/web/Project.tsx` — detect `isDesktop` synchronously via `useState(()=> window.electronAPI?.isDesktop)` (fixes blank first-render for new OTA images not in bundled snapshot), `LIVE_BASE` fallback to `https://george-shenoda.vercel.app` when `NEXT_PUBLIC_SITE_URL` not baked (fixes `LIVE_BASE=""` on `ELECTRON_BUILD` without local `.env`), `shouldUseRemote` + `onError` fallback to local.
2. `apps/web/components/web/projects.tsx` — same `LIVE_BASE` fallback, `fetchProjectsJson` with `fetch(url,{cache:'no-store'})`.
3. `apps/web/app/api/projects/route.ts` — add `Cache-Control: no-store, must-revalidate`, `CDN-Cache-Control: no-store`, `Vary: Origin`.
4. `apps/web/next.config.ts` — add `async headers()` for `/api/projects` to enforce no-store (defense in depth, Vercel respects `next.config` headers).

**Non-goals (desktop-only):**
- Mobile not touched (`apps/mobile/src/components/ProjectsSection.tsx`, `apps/mobile/src/config.ts`, `apps/mobile/App.tsx` unchanged).
- No `electron-updater`, no asset hash renaming, no `expo-image` migration.

**Verification:**
- `npm run typecheck -w @portfolio/web` + `npm run lint -w @portfolio/web` + `npm run build -w @portfolio/web` pass.
- Dev: `NEXT_PUBLIC_SITE_URL=https://george-shenoda.vercel.app npm run desktop:dev` — add new entry + new PNG to `packages/shared/src/projects.ts` + `public/assets/projects/`, push to Vercel, confirm installed/dev desktop shows new image without `desktop:build` (live URL loads). Overwrite existing PNG same name, confirm desktop shows new bytes (remote URL reflects new Vercel deploy).
- Offline: disconnect network, relaunch desktop — `/api/projects` fallback renders `bundledProjects`, remote image `onError` swaps to local bundled PNG (no blank).
- Headers: `curl -I https://.../api/projects` shows `no-store`.

**Branches:**
- `fix/desktop-projects-image-ota` (merged) — initial OTA + headers.
- `fix/desktop-projects-image-ota-v2` (merged) — hotfix fallback URL + sync desktop detect (fixes "images isn't rendering at all").

**Why v2:** Without `apps/web/.env`, `LIVE_BASE` baked as `""` → desktop never took remote branch and tried local `v1.png` missing in old bundle → blank. Async `isDesktop` also caused 1-tick local 404 flash.

**OTA Test (feat/dummy-project-ota-test):** Added `dummy-ota-project` for verification (removed before release — dummy file deleted from `public/assets` and `packages/shared` on `main`).

---

## Current Tasks (fix/final-cleanup-email-footer-dummy)

### 1. Email service is not configured in desktop — FIXED
**Root cause:** `apps/web/lib/mailer.ts:248` requires `EMAIL_USER`/`EMAIL_PASS`; desktop spawns Next via `apps/desktop/electron/main.mjs:88-124` with only `PORT`/`HOSTNAME`/`ELECTRON_RUN_AS_NODE`, so local `/api/contact` (called via `apps/web/components/web/Contact.tsx:74` `submitContact(window.location.origin)`) fails with “Email service is not configured…” on any machine without a bundled `.env` (secrets should not be shipped in the installer).
**Fix:**
- `apps/web/components/web/Contact.tsx` — use remote `LIVE_BASE` (`https://george-shenoda.vercel.app`) for desktop: `submitContact(LIVE_BASE)` + outbox `submit(LIVE_BASE)` so production Vercel env handles SMTP. Keeps web path `sendContactEmail` server action.
- `apps/desktop/electron/main.mjs` — add `dotenv` import and load `apps/web/.env` + `REPO_ROOT/.env` best-effort so local dev still works if .env exists; add `dotenv` to `apps/desktop/package.json:14`.
- No secrets baked into desktop binary; offline queue still works via `packages/shared/src/outbox.ts`.

### 2. Remove 2 dummy projects — DONE
- `packages/shared/src/projects.ts` — removed `dummy-ota-project` + `dummy-ota-project-2`.
- `apps/web/public/assets/projects/dummy-ota-project.png` + `dummy-ota-project-2.png` deleted.

### 3. Remove Download link from footer in desktop — DONE
- `apps/web/components/web/footer.tsx` — made `'use client'`, added `ALL_FOOTER_LINKS`, `isDesktop` detection (`window.electronAPI?.isDesktop`), filter out `/download` when desktop. Mirrors `navbar.tsx:121` already hiding Download in desktop header.

### 4. GitHub workflow for mobile production APK — DONE
- `apps/mobile/eas.json:16-19` — changed `production.android.buildType` from `app-bundle` → `apk` per prompt’s Expo workflow (production now produces apk).
- New `.github/workflows/mobile-production-apk.yml` — two jobs:
  - `eas-production-apk` (when `EXPO_TOKEN` set): `expo-github-action`, `eas build --platform android --profile production --wait`, download `artifacts.buildUrl` → `George-Shenoda-Portfolio-v*.apk`.
  - `bare-production-apk` (fallback when no token): `setup-java@17` + `setup-android`, `expo prebuild`, keystore restore/generation (`keytool -genkeypair ... my-release-key.keystore` from prompt), write `MYAPP_RELEASE_*` to `android/gradle.properties`, patch `android/app/build.gradle` `signingConfigs.release` + `buildTypes.release.signingConfig`, `./gradlew assembleRelease` → `app-release.apk`.

**Verification:** `typecheck`/`lint`/`build` pass, `isDesktop` footer hides Download, contact on desktop hits `https://george-shenoda.vercel.app/api/contact` (check Network tab), mobile workflow triggers on `v*` tag or `workflow_dispatch`.

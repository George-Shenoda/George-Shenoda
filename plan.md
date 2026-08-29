# Plan: Desktop OTA Project Images (fix/desktop-projects-image-ota)

## Scope: Desktop only (as requested). Mobile unchanged.

### Issue 1 — Desktop: new/updated project images not visible after `git push` without rebuilding Electron

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

**OTA Test (feat/dummy-project-ota-test):** Adds `dummy-ota-project` (`packages/shared/src/projects.ts:45`, `apps/web/public/assets/projects/dummy-ota-project.png` 1280x720) to verify installed desktop (built before this) loads new project + image without rebuild via `https://george-shenoda.vercel.app/assets/projects/dummy-ota-project.png`.

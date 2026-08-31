# Plan: Desktop app — Electron shell for portfolio (feat/desktop-app)

## Context
User removed desktop/mobile and now wants a new desktop app, any easy language. Web is `apps/web` (Next.js 16, React 19, monorepo). Per AGENTS.md: branch first, plan, no commit until approved, PR to main. Branch `feat/desktop-app` created.

## Branch
`feat/desktop-app` — commit messages = branch name per AGENTS.md.

## Chosen stack — Electron (Node + JS)
**Why Electron:** zero new language/toolchain, reuses existing Next.js build, smallest risk, fastest to ship. Alternatives considered:
- **Tauri (Rust + WebView)** — lighter binary (~10 MB vs ~150 MB) but requires Rust, slower setup.
- **Python (PyQt/Tkinter) / C# (WPF)** — native but needs full rewrite of UI, not web-reuse.

If user prefers Tauri/Python/C# we can swap after approval — Electron is the default proposal.

## Goal
Ship a desktop shell that launches the Next.js portfolio locally (dev) or bundled (prod), with installer artifacts.

## Deliverables
1. `apps/desktop/` package:
   - `apps/desktop/package.json` (`@portfolio/desktop`, electron, electron-builder)
   - `apps/desktop/electron/main.mjs` — single-instance lock, `net` port probe, `child_process` spawn of Next server (dev: `next dev -p 34567`, prod: `.next/standalone/apps/web/server.js`), `BrowserWindow` with WCO overlay on Windows, `ipcMain` theme sync, navigation guard + `shell.openExternal`
   - `apps/desktop/electron/preload.cjs` — `contextBridge` → `window.electronAPI { isDesktop, platform, setTheme }`
   - `apps/desktop/electron/assemble.mjs` — copy `.next/static` + `public/` into standalone for packaging
2. Root:
   - `electron-builder.yml` — `appId com.georgeshenoda.portfolio`, `productName`, NSIS (win), DMG+zip (mac), deb/AppImage (linux), `files` + `extraResources` (standalone)
   - `package.json` — restore `main: apps/desktop/electron/main.mjs`, workspaces `apps/*`, scripts `desktop:dev`, `desktop:build`, `desktop:dist`
3. Web integration:
   - `apps/web/next.config.ts` — `...(ELECTRON_BUILD ? {output:"standalone"}:{})`, `allowedDevOrigins`
   - `apps/web/types/electron.d.ts`
   - `apps/web/components/desktop/TitleBar.tsx` + `ElectronThemeSync.tsx` + `app/layout.tsx` wiring
   - `apps/web/app/api/projects/route.ts` — CORS + no-store note for Electron
   - `apps/web/lib/site.ts` — `LIVE_BASE` fallback comment
4. Web components restore:
   - `apps/web/components/web/Project.tsx` — OTA remote image path for installed app
   - `apps/web/components/web/Contact.tsx` — desktop outbox + `submitContact(LIVE_BASE)` path
   - `apps/web/components/web/navbar.tsx` / `footer.tsx` — `isDesktop` hide download, titlebar offset
5. Workflows & docs:
   - `.github/workflows/release.yml` — restore desktop matrix (windows/macos/ubuntu) + package/upload artifacts; keep web build
   - `ELECTRON.md` — dev/build/release/signing docs
   - `.gitignore` — electron release, code-sign, etc.
   - `tsconfig.json` — `@mobile` alias not needed unless mobile returns (keep web only)
6. Scripts & tests:
   - `scripts/test-desktop-contact.mjs` (optional smoke), keep `make-icons.mjs` desktop icon comment

## Auto-update (requested)
- **Module:** `electron-updater` (`^6.x`) added to `apps/desktop/package.json` (dependency, not dev).
- **`electron-builder.yml`:** add `publish.provider: github` (`owner: George-Shenoda`, `repo: George-Shenoda`, `releaseType: draft|release` via env), plus `generateUpdatesFilesForAllChannels: true`.
- **`apps/desktop/electron/main.mjs`:** import `autoUpdater` from `electron-updater`, configure `autoUpdater.logger`, call `autoUpdater.checkForUpdatesAndNotify()` after `app.whenReady` + window created (prod only, `!isDev`). Handle events: `update-available`, `update-downloaded` (show dialog or silent), `error` (log). Add `ipcMain` handlers `check-for-update` / `install-update` if renderer wants manual trigger.
- **`apps/desktop/electron/preload.cjs`:** expose `checkForUpdate`, `onUpdateAvailable`, `onUpdateDownloaded` if needed (or keep auto-only).
- **`apps/web/components/desktop/UpdateBanner.tsx` (new, optional):** small banner using `window.electronAPI` events to show “Update available → Restart”.
- **Release flow:** `release.yml` desktop job runs `electron-builder --publish always` on tags (needs `GH_TOKEN = secrets.GITHUB_TOKEN`). Generates `latest.yml` / `latest-mac.yml` + blockmaps needed by updater.
- **Dev smoke:** in dev, `autoUpdater` is no-op (skip `checkForUpdates` when `isDev`).

## Out of scope
- Mobile (Expo) — not restored unless requested.
- Code signing cert (`certs/…pfx`) — gitignored, user provides `WIN_CSC_LINK`.

## Order
1. Scaffold `apps/desktop` + root configs (`package.json` with `electron-updater`, `electron-builder.yml` with `publish`, `.gitignore`, `tsconfig`).
2. Add `next.config` standalone toggle + web desktop components/types + layout (+ `UpdateBanner` if needed).
3. Add `Project/Contact/navbar/footer` desktop branching.
4. Add updater logic in `main.mjs`/`preload.cjs` (auto-check on app ready, prod-only).
5. Add `release.yml` (with `--publish always` + `GH_TOKEN`) + `ELECTRON.md` (auto-update section).
6. Verify: `npm install --package-lock-only`, `npm run typecheck -w @portfolio/web`, `npm test`, `npm run desktop:build` → `apps/desktop/release` + `latest.yml`; manual check `autoUpdater` no-op in dev.
7. Commit `feat/desktop-app` → push → PR to `main`.

## Verification
- `npm run typecheck -w @portfolio/web` passes
- `npm run build -w @portfolio/web` with `ELECTRON_BUILD=true` produces `.next/standalone`
- `npm run assemble -w @portfolio/desktop` copies static
- `npx electron-builder --publish never` produces exe/dmg/deb (smoke on windows)
- `npx electron-builder --publish always` (dry-run in CI) would emit `latest.yml` for updater — verify file exists after build
- `rg -r "electronAPI|autoUpdater"` shows integration points
- Manual prod smoke: launch installed app, check `autoUpdater` log for “checking for update” (no error in dev due to guard)

## Risks
- Standalone path `apps/web/.next/standalone` is fragile to Next version — `assemble.mjs` fails fast if missing.
- `ELECTRON_BUILD=true` changes `next.config` output — must not leak to Vercel (`env` only in `release.yml`).
- `electron-builder` hoisted `node_modules` pruning — build from repo root only (see ELECTRON.md).

## Options if user wants different language
- **Tauri:** replace `apps/desktop` with `src-tauri/` + `tauri.conf.json`, Rust needed.
- **Python/C#:** new top-level `desktop/` with native window loading `http://localhost:3000` — more code, not recommended for first iteration.

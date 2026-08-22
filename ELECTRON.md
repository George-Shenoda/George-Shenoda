# Desktop App (Electron) — Dev / Build / Release

The desktop app (`apps/desktop`) renders the Next.js web app inside Electron. It spawns the web app's own server as a child process and points a BrowserWindow at it — so every visual and data change to `apps/web` automatically lands in the desktop app.

## Layout

| Path | Purpose |
|---|---|
| `apps/desktop/electron/main.mjs` | Window lifecycle, child Next server (dev + prod), WCO overlay, IPC |
| `apps/desktop/electron/preload.cjs` | contextBridge → `{ isDesktop, platform, setTheme }` |
| `apps/desktop/electron/assemble.mjs` | Merges `.next/static` + `public/` into the standalone output for packaging |
| `electron-builder.yml` (repo root) | Packaging config: NSIS+portable (win), DMG+zip (mac), AppImage+deb (linux) |

## Development

```bash
npm run desktop:dev          # from repo root
```

Starts `next dev -p 34567` as a child of Electron, waits until it responds, then opens a 1280×800 window. Hot reload works like normal web dev.

## Local production build (Windows)

```bash
npm run desktop:dist         # from repo root
# outputs:
#   apps/desktop/release/George Shenoda Setup 0.1.0.exe   (NSIS installer)
#   apps/desktop/release/George Shenoda 0.1.0.exe         (portable)
```

This runs `ELECTRON_BUILD=true next build` in `apps/web` (switches on standalone output), assembles static/public files into the bundle, then runs electron-builder from the **repo root**.

> Run electron-builder from the root only. Running it inside `apps/desktop` triggers its internal `npm install --production`, which — in this npm-workspaces layout — prunes devDependencies out of the hoisted root `node_modules`.

### Windows-only quirks

- If your global `%USERPROFILE%\.npmrc` sets npm ≥11 `allow-scripts`, prefix local dist runs with an empty userconfig:
  `$env:NPM_CONFIG_USERCONFIG = "<path-to-empty-file>"; npm run desktop:dist`
- First run downloads the winCodeSign cache whose extraction fails on symlink privileges (two macOS dylibs). Seed it manually once — download `winCodeSign-2.6.0.7z`, extract with 7-Zip into `%LOCALAPPDATA%\electron-builder\Cache\winCodeSign\winCodeSign-2.6.0`, ignoring the two symlink errors.

## Release

1. Tag the commit: `git tag v0.1.0 && git push origin v0.1.0`
2. `.github/workflows/electron-release.yml` builds all three OS targets on `windows-latest` / `macos-latest` / `ubuntu-latest` and attaches installers to the GitHub release via `electron-builder --publish always`.
3. Binaries are unsigned by design (accepted tradeoff): expect SmartScreen/Gatekeeper warnings until code signing certificates are added.

## Vercel environment variables

Required by the deployed site (which the desktop/mobile apps call for live data + contact):

| Variable | Used for |
|---|---|
| `EMAIL_USER` | Gmail SMTP account sending contact messages |
| `EMAIL_PASS` | Gmail app password |
| `EMAIL_TO` *(optional)* | Recipient; defaults to `EMAIL_USER` |
| `NEXT_PUBLIC_SITE_URL` | Base URL used by desktop contact form fallback, mobile app API calls, SEO canonical/sitemap URLs |

Local reference copy: `apps/web/.env.example`. Mobile builds additionally need `EXPO_PUBLIC_SITE_URL` set at EAS build time.

## Theming

The renderer reports theme changes through `window.electronAPI.setTheme(...)` (see `apps/web/components/desktop/ElectronThemeSync.tsx`). The main process syncs the Windows title bar overlay color accordingly (`#151d1d` dark / `#eee` light). Linux keeps a standard system frame.

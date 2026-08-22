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
3. Signing: see below — Windows installers are signed whenever `WIN_CSC_LINK`/`WIN_CSC_KEY_PASSWORD` are present (locally or as CI secrets); unsigned builds remain the fallback.

## Code signing

### Windows (current setup — self-signed Authenticode)

A self-signed code-signing certificate lives at `certs/george-shenoda-codesign.pfx` (**git-ignored, never commit**; password is not stored anywhere in the repo). Local signed build:

```powershell
$env:NPM_CONFIG_USERCONFIG = "<path-to-empty-file>"   # only needed with the allow-scripts npm policy
$env:WIN_CSC_LINK = "D:\projects\me\my_portfolio\certs\george-shenoda-codesign.pfx"   # plain path, NOT file:///
$env:WIN_CSC_KEY_PASSWORD = "<pfx-password>"
npm run desktop:dist
```

Verify a binary:

```powershell
(Get-AuthenticodeSignature "apps\desktop\release\George Shenoda Setup 0.1.0.exe").SignerCertificate.Subject
```

`Status=UnknownError` on these builds means *untrusted root* — expected for self-signed certs. The signature is cryptographically valid; recipients who import the PFX's public cert into their Trusted Root store (or trust you out-of-band) see `Valid`. SmartScreen still warns either way.

To re-create the cert after expiry:

```powershell
$pw = ConvertTo-SecureString -String "<password>" -Force -AsPlainText
$cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject "CN=George Shenoda, O=George Shenoda Portfolio" `
  -KeyUsage DigitalSignature -CertStoreLocation Cert:\CurrentUser\My -NotAfter (Get-Date).AddYears(3)
Export-PfxCertificate -Cert $cert -FilePath certs\george-shenoda-codesign.pfx -Password $pw
```

**Upgrade to trusted signing** (removes SmartScreen warnings): buy an OV/EV code-signing certificate (e.g. Sectigo/DigiCert) or set up Azure Trusted Signing, export/save it as a PFX, then swap what `WIN_CSC_LINK` points at — nothing else changes. For CI, base64-encode the PFX (`[Convert]::ToBase64String([IO.File]::ReadAllBytes("certs\...pfx")) | Set-Content csc.b64`) into the repo secret.

### CI secrets (`.github/workflows/electron-release.yml`)

electron-builder reads these env vars automatically when present; empty/unset = unsigned build:

| Secret | Signs | Notes |
|---|---|---|
| `WIN_CSC_LINK`, `WIN_CSC_KEY_PASSWORD` | NSIS/portable exe + uninstaller | base64 or path to PFX |
| `CSC_LINK`, `CSC_KEY_PASSWORD` | macOS DMG/zip | Developer ID Application cert |
| `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID` | notarization | enables Gatekeeper-clean mac builds |

### Mobile (Android / iOS)

Signing happens through EAS — no local keystore management needed:

```powershell
cd apps/mobile
npx eas-cli credentials        # inspect/manage Android keystore + iOS certs (remote by default)
npx eas-cli build --profile production --platform android   # EAS generates & stores the upload keystore automatically
```

- **Android**: first production build auto-generates a keystore stored on EAS servers; Play App Signing re-signs for distribution. Back it up via `eas credentials`.
- **iOS**: requires an Apple Developer Program account ($99/yr); EAS manages the distribution certificate + provisioning profile once logged in.
- To use your own Android keystore instead: create one with `keytool -genkeypair -v -keystore release.keystore -alias gs-upload -keyalg RSA -keysize 2048 -validity 10000`, then switch `"credentialsSource": "local"` in the relevant `eas.json` profile.

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

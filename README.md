# George Shenoda — Portfolio Monorepo

Personal portfolio delivered as a single monorepo powering three platforms from one shared codebase:

| App | Path | Stack |
|-----|------|-------|
| **Web** | [`apps/web`](apps/web) | Next.js 16, React 19, Tailwind CSS 4 |
| **Mobile** | [`apps/mobile`](apps/mobile) | Expo SDK 57, React Native 0.86, Reanimated |
| **Desktop** | [`apps/desktop`](apps/desktop) | Electron 33 (wraps the web build) |

Shared data (projects, CV content, contact client, outbox queue) lives in [`packages/shared`](packages/shared) and is consumed by all three apps.

## Features

- Single source of truth for projects & CV content (`@portfolio/shared`)
- Working contact form with offline outbox — messages queue locally and auto-send on reconnect (mobile + desktop)
- Live project list fetched from `/api/projects`, with an offline cache on mobile
- Dark/light mode across every platform
- CV page with print support (`/cv`) and a privacy policy page (`/privacy`)
- Hardened contact API: rate limiting, honeypot, input validation, HTML-escaped emails

## Getting Started

**Prerequisites:** Node.js 20+, npm 10+. For mobile: [Expo Go](https://expo.dev/go) on a device, or an Android/iOS emulator. For desktop builds: platform-specific Electron build tools.

```bash
# install everything (workspaces)
npm install
```

### Environment variables

Copy the example and fill in real values:

```bash
cp apps/web/.env.example apps/web/.env
```

| Variable | Required | Purpose |
|----------|----------|---------|
| `EMAIL_USER` | yes (contact form) | Gmail address used as SMTP sender |
| `EMAIL_PASS` | yes (contact form) | Gmail app password |
| `NEXT_PUBLIC_SITE_URL` | yes | Public site URL; mobile/desktop apps use it to reach `/api/contact` and `/api/projects` |
| `CONTACT_AUTO_REPLY` | no | Set to `false` to disable auto-reply emails |
| `GOOGLE_ANALYTICS_ID` | no (analytics off without it) | Google Analytics 4 measurement ID — server-side only (no `NEXT_PUBLIC_` prefix), never hardcoded |

## Development

All commands run from the repo root:

```bash
npm run dev            # web dev server → http://localhost:3000
npm run desktop:dev    # Electron desktop shell (dev)
```

Mobile (dev build — required since Firebase native modules landed):

```bash
cd apps/mobile
npx expo run:android    # build + install a development APK on a device/emulator
npx expo start          # then start Metro bundler
```

> Expo Go is no longer supported for this app (native Firebase SDK). If native dependencies change, restart Metro with `npx expo start --clear`.

## Analytics

- **Web/Desktop**: GA4 gtag.js via `GOOGLE_ANALYTICS_ID` (see env table).
- **Mobile**: Firebase Analytics (`@react-native-firebase/*`), configured by `apps/mobile/google-services.json`.
  - **This file is intentionally NOT committed** (contains an API key). Setup:
    - **Locally**: place your `google-services.json` at `apps/mobile/google-services.json` (gitignored).
    - **CI (release workflow)**: add an Actions secret `GOOGLE_SERVICES_JSON_B64` = base64 of the file:
      ```powershell
      [Convert]::ToBase64String([IO.File]::ReadAllBytes("apps\mobile\google-services.json")) | Set-Clipboard
      ```
      The Android job decodes it before `eas build` and fails fast if missing.
  - Events: `app_open` + `screen_view` per section (`home`, `workflow`, `projects`, `contact`) — all calls are fail-safe no-ops.
  - Verify on device with Debug View:
    ```bash
    adb shell setprop debug.firebase.analytics.app com.georgeshenoda.portfolio
    ```
    then check Firebase console → Analytics → DebugView.
  - If a config ever leaks: rotate the key in Google Cloud → Credentials, re-download from Firebase console, update the local file + Actions secret.
  - **iOS prep** (activate when an Apple build is needed): register the iOS app in Firebase with bundle id `com.georgeshenoda.portfolio`, download `GoogleService-Info.plist` into `apps/mobile/` (gitignored), then add `"ios": { "googleServicesFile": "./GoogleService-Info.plist" }` to `app.json`. The JS code needs no changes.

## Production Build

```bash
npm run build          # production web build
npm run desktop:build  # web standalone build + assemble for Electron
npm run desktop:dist   # full desktop distributable via electron-builder
```

The desktop app spawns the Next.js standalone server on `127.0.0.1` inside Electron and loads it in a sandboxed window (`contextIsolation`, `sandbox`, no `nodeIntegration`). Contact submissions route through the deployed site, so no SMTP secrets ship with the binary.

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/contact` | POST | Sends contact email via Gmail SMTP |
| `/api/projects` | GET | Returns the project list |

## Security

The contact endpoint includes defense in depth:

- **Rate limiting** — 5 requests/min/IP (in-memory), returns `429`
- **Honeypot field** — hidden `website` input rejects bot submissions
- **Input limits** — name ≤ 100, email ≤ 254, message ≤ 5000 chars; body ≤ 10KB
- **HTML escaping + CRLF stripping** — prevents injection into emails/headers
- **Sanitized errors** — internal SMTP details never leak to clients
- **CORS** — restricted to `NEXT_PUBLIC_SITE_URL`
- **Electron hardening** — SMTP env vars filtered out of spawned processes, `will-navigate` blocked to external URLs

## Release Workflow

Tagging a version (e.g. `v0.1.2`) triggers `.github/workflows/release.yml`, which builds the desktop apps (Windows/macOS/Linux) and Android/iOS artifacts and publishes a GitHub Release with installable setup files:

| Platform | Setup files |
|----------|-------------|
| Windows | NSIS installer `.exe` + portable `.exe` |
| macOS | `.dmg` + `.zip` (Intel & Apple Silicon) |
| Linux | `.AppImage` + `.deb` |
| Android | `.apk` (EAS `preview` profile; requires `EXPO_TOKEN` secret) |
| iOS | `.ipa` (disabled until signing credentials are configured) |

The workflow can also be run manually (`workflow_dispatch`) to produce setup files without publishing — artifacts appear under the workflow run. Publishing to a GitHub Release only happens on tag pushes.

### Adding a project (no tag needed)

Project content updates do **not** require a new release. Edit `packages/shared/src/projects.ts`, drop a 1280×720 PNG into `apps/web/public/assets/projects/<id>.png`, then deploy the site — web, mobile **and** desktop all load the list and images live from `/api/projects`. Tags are only needed when app code changes.

## Project Scripts (asset generation)

```bash
npm run icons   # generate app icons
npm run shots   # generate project screenshots
npm run cv:pdf  # generate CV PDF from the /cv page
```

## Repository Conventions

- One branch per feature; branch name is used as the commit message
- PRs target `main`; releases are tagged `vX.Y.Z`

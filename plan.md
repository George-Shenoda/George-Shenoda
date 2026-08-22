# Master Plan — Portfolio → Website + Desktop App + Mobile App

> Status: IN PROGRESS — planning finalized 2026-08-22. Execute steps in order.
> Stack: Next.js 16.3 (App Router), React 19, Tailwind 4, tw-animate-css, nodemailer server action.
> Next session prompt: "read plan.md and start Step 5".

## Goal

One codebase, four deliverables, zero interference:

1. **Published website** (Vercel free tier) — current behavior preserved, real branding + SEO later.
2. **Electron desktop app** — installers for Windows (NSIS + portable), macOS (DMG + zip), Linux (AppImage + deb).
3. **React Native mobile app** (Expo) — Android APK/AAB + iOS IPA, store-ready.
4. **Store listings** prepared for Play Store + App Store.

## Locked decisions

| Decision | Choice |
|---|---|
| Repo shape | npm-workspaces monorepo: `apps/web`, `apps/desktop`, `apps/mobile`, `packages/shared` |
| Distribution | Full installers for ALL OS via GitHub Actions matrix; EAS Build for mobile |
| Contact email | Routed through the deployed website's API (`/api/contact`) — no secrets in any binary |
| Live data | `/api/projects` endpoint; all apps fetch remote-first with bundled offline fallback (edits to projects propagate to installed apps on next launch, no new installers) |
| Window chrome | Frameless via **Window Controls Overlay** (`titleBarStyle: hidden` + `titleBarOverlay`); native min/max/snap preserved; Linux falls back to standard frame |
| App / installer name | **George Shenoda** everywhere (installer, window title, stores); metadata title becomes "George Shenoda \| Full-Stack Developer" |
| Icon | User supplies later → single source `assets/brand/icon.svg` → `scripts/make-icons.mjs` generates ico/icns/PNGs + drop copy in `app/` for web favicon. Until then Electron default icon |
| SEO / sitemap | LAST phase (no dependency on apps). Reuses `NEXT_PUBLIC_SITE_URL` for `metadataBase` |

## Single-source guarantees

### Data (one file rules all)

```
packages/shared/src/projects.ts        ← EDIT ONLY HERE
packages/shared/src/theme.ts           ← palette/tokens once
        │
        ├─ apps/web       imports @portfolio/shared
        ├─ apps/mobile    imports @portfolio/shared
        └─ apps/desktop   renders apps/web's build (inherits automatically)
```

Plus the live-data pattern so already-installed apps update without reinstall:

```
website  GET /api/projects  → JSON of shared projects array
all apps startup: try remote → fallback to bundled snapshot (offline-safe)
```

### Design (what is / isn't shared)

| Layer | Shared? | Mechanism |
|---|---|---|
| Colors, spacing, radii, type scale | YES | `packages/shared/theme.ts` drives web CSS vars + RN theme object |
| Desktop visuals | YES 100% | renders the web app itself |
| Section structure, copy, interaction logic | YES | mirrored implementations fed by same tokens/data |
| Pixel-level component code | NO | HTML/Tailwind vs native views need separate impls — kept visually consistent via tokens |

---

## Step 0 — Monorepo restructure (FIRST — everything lands into this shape) ✅ DONE 2026-08-22

- [x] Root `package.json`: workspaces `["apps/*", "packages/*"]`, root orchestration scripts (`dev`, `build`, `lint`, `typecheck` with `-w` flags)
- [x] `git mv` entire Next.js app → `apps/web` (preserve history); internal `@/` imports untouched
- [x] Create `packages/shared`:
  - `src/projects.ts` ← moved from `apps/web/data/project.ts` (single source of truth)
  - `src/theme.ts` ← extracted tokens: primary `#0f7173`, secondary `#0e7490`, tertiary `#00f5ff`, surfaces `#151d1d`/`#192020`/`#eee`, fonts
  - `src/contact-client.ts` ← `submitContact(baseUrl, payload)` used by mobile + desktop fallback
  - `package.json` name `@portfolio/shared`
- [x] `apps/web/next.config.ts`: `transpilePackages: ['@portfolio/shared']`
- [x] New `apps/web/app/api/projects/route.ts`: GET → JSON of shared projects array
- [x] Web data-loading refactor: remote-first fetch of `/api/projects` with bundled-import fallback (SSR-friendly; no UI change when remote unavailable)
- [ ] Vercel project setting: Root Directory = `apps/web`; verify deploy parity BEFORE proceeding *(USER ACTION in Vercel dashboard — code side is ready)*
- [x] `.gitignore`: add `release/`, `apps/mobile/.expo`, EAS artifacts
- [x] GATE: lint + tsc + build green from new layout; deployed site identical *(local gate green; deploy parity pending the Vercel setting above)*

## Step 1 — Web-safe foundations (verify with plain `npm run dev` inside apps/web) ✅ DONE 2026-08-22

- [x] `app/api/contact/route.ts`: POST endpoint wrapping existing `sendContactEmail` logic as JSON; extract mailer to shared lib (`apps/web/lib/mailer.ts`); keep server action working for web
- [x] `Contact.tsx`: dual-path submit — web keeps server action; inside Electron POSTs to `${NEXT_PUBLIC_SITE_URL}/api/contact` via `submitContact()` from shared; graceful inline error if unreachable
- [x] `components/desktop/TitleBar.tsx`: draggable bar (`-webkit-app-region: drag`), brand left; renders ONLY when `window.electronAPI?.isDesktop === true`; content padding uses `env(titlebar-area-*)`
- [x] `app/layout.tsx`: mount `<TitleBar/>` above Navbar; metadata title `"Create Next App"` → `"George Shenoda | Full-Stack Developer"` + real description
- [x] Document `NEXT_PUBLIC_SITE_URL` env (used by desktop contact fallback, mobile contact, future SEO metadataBase) → `.env.example`

## Step 2 — Electron shell (apps/desktop) ✅ DONE 2026-08-22

- [x] Deps (in workspace): `electron`, `electron-builder`, `cross-env` *(deviation: `concurrently`/`wait-on` not needed — main.mjs spawns and health-checks the Next server itself)*
- [x] `apps/desktop/electron/main.mjs`:
  - Dev: programmatic Next server on port 34567 → loadURL
  - Prod: spawn `apps/web/.next/standalone/apps/web/server.js` child via `process.execPath` + `ELECTRON_RUN_AS_NODE=1`, HOSTNAME=127.0.0.1
  - BrowserWindow 1280×800 (min 1024×640), bg `#0d1515`, show on ready-to-show, kill child on quit, single-instance lock
  - Security: contextIsolation true, nodeIntegration false, sandboxed preload, `setWindowOpenHandler` → `shell.openExternal` for http(s)
  - `titleBarOverlay: { color:'#151d1d', symbolColor:'#e6e6e6', height:40 }`; sync overlay color with theme toggle via IPC (`theme-changed`; Linux keeps standard frame)
- [x] `preload.cjs`: contextBridge exposing `{ isDesktop, platform }` + narrow `setTheme(theme)` sender for overlay sync
- [x] Scripts: `electron:dev`, `electron:build` (`cross-env ELECTRON_BUILD=true next build` in apps/web + assemble standalone + electron-builder)
- [x] `apps/web/next.config.ts`: `output:'standalone'` ONLY when `ELECTRON_BUILD=true` — normal builds byte-identical to today *(verified: no standalone dir on normal build)*
- [x] `electron-builder.yml`: appId `com.georgeshenoda.portfolio`, productName `George Shenoda`, output `release/`, win nsis+portable / mac dmg+zip / linux AppImage+deb, extraResources standalone (+public/static merged by assemble script), exclude `.env`
- [x] `scripts/make-icons.mjs` pipeline stubbed for future `assets/brand/icon.svg`
- Verified locally on Windows: dev mode (window + API through shell), prod standalone mode (server.js child + API 200); installer dist deferred to Step 3

## Step 3 — CI + local verification ✅ DONE 2026-08-22

- [x] `.github/workflows/electron-release.yml`: matrix `[windows-latest, macos-latest, ubuntu-latest]`, trigger ONLY on tag `v*`, electron-builder `--publish always` attaches artifacts to release
- [x] Verify web unchanged: lint, tsc, build clean, all sections render (hero/workflow/projects/contact/footer checked in prod server HTML)
- [x] Verify desktop: window opens + API through shell (dev AND packaged prod), live-data endpoint 200, contact API validation/error paths return graceful JSON. *(Theme overlay color sync, scroll reveals, external-link handoff: implemented + code-reviewed; visual pass pending human eyes)*
- [x] Local Windows installer smoke test from `release/`: NSIS `George Shenoda Setup 0.1.0.exe` + portable both built; portable exe launched → embedded server 200 → correct page title
- Local Windows build notes (CI unaffected): run electron-builder from REPO ROOT (`npm run desktop:dist`) — running it inside apps/desktop triggers its internal npm install against hoisted node_modules and prunes devDeps. If global `.npmrc` sets npm≥11 `allow-scripts`, prefix local dist runs with `$env:NPM_CONFIG_USERCONFIG="<empty file>"`. First-run winCodeSign cache extraction fails on symlink privilege — seed `%LOCALAPPDATA%\electron-builder\Cache\winCodeSign\winCodeSign-2.6.0` manually ignoring the two darwin dylib errors

## Step 4 — React Native app (apps/mobile) ✅ DONE 2026-08-22

- [x] Expo app (SDK 57) — single-scroll screen mirroring site order *(chose plain entry over expo-router, allowed by this line)*
- [x] Imports `@portfolio/shared` (projects, theme tokens, submitContact) — metro.config.js wires workspace resolution
- [x] Hero: gradient headline (MaskedView + expo-linear-gradient mask), JetBrains Mono capabilities line (@expo-google-fonts), entrance stagger via Reanimated (FadeInDown, 700ms ease-out cubic = web Reveal vocabulary)
- [x] Workflow cards → horizontal snap carousel (FlatList snapToInterval, native idiom replacing 4-col grid)
- [x] Business section parity
- [x] Projects: FlatList scroll-disabled inside screen scroll, same 6-at-a-time Load More over shared data, images via `${EXPO_PUBLIC_SITE_URL}` resolver, remote-first fetch with bundled fallback like web
- [x] Contact form → `submitContact(SITE_URL, …)` from shared; offline/network errors surface inline
- [x] Dark/light follows OS theme (`useColorScheme`, same palette tokens both modes)
- [x] `eas.json` profiles: development / preview (APK sideload) / production (AAB + IPA)
- Gate: `tsc --noEmit` clean + `expo export --platform android` produces Hermes bundle. Env note: mobile uses `EXPO_PUBLIC_SITE_URL` (Expo's native env prefix) instead of `NEXT_PUBLIC_SITE_URL`; set it at EAS build time

## Step 5 — Store listings prep (both stores)

- [ ] Website route `/privacy` privacy policy page (required by both stores)
- [ ] Store copy: name/subtitle/full descriptions, keyword sets, category (Productivity/Business)
- [ ] Data-safety declarations: contact form collects name/email/message; no trackers/analytics
- [ ] Screenshot sets per required device sizes (scripted simulator captures)
- [ ] Bundle ID `com.georgeshenoda.portfolio`; flag prerequisites user must create: Google Play account ($25 once), Apple Developer ($99/yr)

## Step 6 — SEO phase (needs final domain)

- [ ] Full metadata object: title template, description, keywords, authors, OpenGraph + Twitter card, canonical via `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? …)`
- [ ] `app/sitemap.ts` (single-page portfolio)
- [ ] `app/robots.ts` — allow all, disallow `/api/`
- [ ] Optional JSON-LD `Person` schema

---

## Known tradeoffs (accepted)

- Unsigned binaries → SmartScreen/Gatekeeper warnings until code signing exists (documented, not blocking)
- App footprint ≈200 MB (ships Node runtime + standalone server)
- macOS desktop builds only on macOS runners (hence CI matrix), not locally from Windows
- Workspaces touch every future pipeline path (Vercel root-dir, GH Actions working-directory) — accepted for cleaner long-term structure

## Docs deliverable

- `ELECTRON.md` at repo root: dev/build/release instructions + Vercel env setup (`EMAIL_USER`, `EMAIL_PASS`, `EMAIL_TO`, `NEXT_PUBLIC_SITE_URL`)

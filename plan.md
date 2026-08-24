# Master Plan — Portfolio → Website + Desktop App + Mobile App

> Status: PHASE 1 COMPLETE — all steps executed 2026-08-22. Remaining items are flagged USER ACTIONS (Vercel root dir, store accounts, screenshots, final domain).
> Stack: Next.js 16.3 (App Router), React 19, Tailwind 4, tw-animate-css, nodemailer server action.
> PHASE 2 PLANNED (2026-08-24), not started — see below.

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

## Step 5 — Store listings prep (both stores) ✅ DONE 2026-08-22

- [x] Website route `/privacy` privacy policy page (required by both stores) — `apps/web/app/privacy/page.tsx`
- [x] Store copy: name/subtitle/full descriptions, keyword sets, category (Productivity/Business) — `docs/store-listings.md`
- [x] Data-safety declarations: contact form collects name/email/message; no trackers/analytics — in `docs/store-listings.md`
- [~] Screenshot sets per required device sizes (scripted simulator captures) — capture commands + size matrix documented in `docs/store-listings.md`; actual capture needs emulators/simulators = USER ACTION
- [x] Bundle ID `com.georgeshenoda.portfolio` set in `apps/mobile/app.json`; prerequisites flagged in `docs/store-listings.md`: Google Play account ($25 once), Apple Developer ($99/yr), EAS account/link, EXPO_PUBLIC_SITE_URL at build time

## Step 6 — SEO phase (needs final domain) ✅ DONE 2026-08-22

- [x] Full metadata object: title template, description, keywords, authors, OpenGraph + Twitter card, canonical via `metadataBase: new URL(SITE_URL)` — `apps/web/app/layout.tsx` + `lib/site.ts`
- [x] `app/sitemap.ts` (home + /privacy)
- [x] `app/robots.ts` — allow all, disallow `/api/`, sitemap linked
- [x] JSON-LD `Person` schema injected on home page
- Verified: robots.txt/sitemap.xml prerendered at build; og:title + ld+json present in served HTML. URLs fall back to localhost until `NEXT_PUBLIC_SITE_URL` is set with the final domain

## Step 7 — Code signing + brand icons ✅ DONE 2026-08-23

- [x] Brand mark: `assets/brand/icon.svg` — dark `#0d1515` bg + teal→cyan gradient "GS"; generator `scripts/make-icons.mjs` (`npm run icons`) renders all targets via @resvg/resvg-js
- [x] Web: `apps/web/app/favicon.ico` (16/32/48), `icon.png`, `apple-icon.png`
- [x] Desktop: `assets/icons/icon.ico` (16–256) + 1024px png, wired into `electron-builder.yml`
- [x] Mobile: icon, adaptive fg/bg/monochrome, splash-icon, favicon regenerated with GS
- [x] Windows Authenticode signing: self-signed cert → `certs/*.pfx` (git-ignored), signed local installers verified via Get-AuthenticodeSignature; untrusted-root status documented
- [x] CI signing env passthrough (WIN_CSC_*, CSC_*, Apple notarization vars) in electron-release.yml; empty = unsigned fallback
- [x] Mobile signing via EAS remote credentials flow documented (Android auto-keystore, iOS needs Apple Developer account)
- [x] Signing docs rewritten in ELECTRON.md (local build commands, cert renewal, CA/EV upgrade path, secrets table)

---

## Known tradeoffs (accepted)

- Self-signed Windows signing → signature present but untrusted-root until a CA/EV cert or Azure Trusted Signing replaces the PFX (upgrade path in ELECTRON.md)
- App footprint ≈200 MB (ships Node runtime + standalone server)
- macOS desktop builds only on macOS runners (hence CI matrix), not locally from Windows
- Workspaces touch every future pipeline path (Vercel root-dir, GH Actions working-directory) — accepted for cleaner long-term structure

## Docs deliverable

- `ELECTRON.md` at repo root: dev/build/release instructions + Vercel env setup (`EMAIL_USER`, `EMAIL_PASS`, `EMAIL_TO`, `NEXT_PUBLIC_SITE_URL`)

---

# PHASE 2 — CV System, Offline Mode & Mobile Parity Redesign

> Status: **PLANNED 2026-08-24 — NOT STARTED.** Work through steps in order; tick boxes + note commit hashes as each lands. One commit per step.

## Goal

1. A real CV system: `/cv` page (minimalist editorial) + regenerated `resume.pdf`, fed by one shared data file.
2. Desktop + mobile apps fully usable offline: cached projects, queued contact mail, offline CV viewing/PDF.
3. Mobile app redesigned to match the web app's mobile viewport 100% (layout, type, colors, motion, sections).

## Locked decisions (Phase 2)

| Decision | Choice |
|---|---|
| CV positioning | "Full-Stack Developer \| Mechatronics Engineering Student" (matches site) |
| CV design | Minimalist editorial — warm paper, near-black ink, typographic hierarchy, zero clutter |
| Experience entries | ① Founder & Full-Stack Dev — G-Stack (Feb–May 2026): Elevate Studio site, client portal, landing page · ② IoT Intern — Samsung Innovation Campus (Aug–Oct 2025) |
| Project cut (full-stack-first, 4) | GVMT Marketplace + Admin · GStack Client Portal · Elevate Studio website · IoT Smart Office System |
| Links | linkedin.com/in/george-shenoda · github.com/george-shenoda (verify handles resolve before final PDF) |
| Offline semantics | Apps render/function with no network; external handoffs (mailto, cert drive, live links) stay OS-level actions |
| Projects offline | Remote-first fetch → persist to AsyncStorage; offline renders last-cached ("Last updated…" caption) → bundled snapshot as final fallback |
| Contact offline | Outbox queue: failed/offline submissions persisted locally, auto-flushed on reconnect (NetInfo / `online` event); visible "saved, will send automatically" state |
| CV offline | Mobile: native sheet from shared data + bundled resume.pdf shared via expo-file-system/expo-sharing. Desktop: `/cv` via localhost + `window.print()` |
| Section order parity | Hero → Workflow → Business → Projects → Trust → Contact → Footer (**Trust is missing on mobile today**) |

## Known mobile-vs-web gaps driving Step 12–13 (audit 2026-08-24)

- Fonts: web renders Inter (+ JetBrains Mono accents); mobile ships neither globally
- Colors off: dark bg `#0a0a0a` vs web's actual `#0d1515`; muted text/borders/cards all mismatched shades
- Layout divergences: horizontal workflow carousel vs web's vertical stack; project cards capped at 360px vs full-width; inline navbar links vs web's hamburger dropdown (<768px behavior)
- Missing: Trust section, scroll-progress bar, navbar scroll shadow/blur, theme-switcher dropdown, SafeArea insets, scroll-triggered reveals (mobile fires on mount)
- Type scale undersized throughout (13–15px vs web's 16px bodies, 28 vs 30 headings)

## Step 8 — Shared CV data layer + portable assets `[commit: feat(shared): cv data layer + portable project assets]`

- [x] `packages/shared/src/cv.ts`: typed CV model (profile, links, summary, experience[], education[], projects[], skillGroups{}, certifications[], languages[]) with Phase-2 locked content; export via `src/index.ts`
- [x] `packages/shared/src/projects.ts`: add stable `id` per project; replace `placehold.co` image with local asset path
- [x] Real screenshots into `apps/web/public/assets/projects/*` (GVMT, client portal, Elevate Studio, IoT Smart Office) *(branded placeholder art generated by `npm run shots` until real captures replace the PNGs — same filenames)*
- [x] Verify new GitHub/LinkedIn handles resolve; then freeze them in cv.ts *(github.com/george-shenoda + linkedin.com/in/george-shenoda both resolve to George; education/certs/languages sourced from the LinkedIn profile)*

## Step 9 — Web `/cv` route `[commit: feat(web): printable /cv page]`

- [x] READ `node_modules/next/dist/docs/` guides first (project structure, metadata — Next 16 breaking changes per AGENTS.md)
- [x] `apps/web/app/cv/page.tsx` server component rendering shared cv data, minimalist editorial, A4 proportions
- [x] `@media print` styles: exact A4, margins, controlled page breaks; screen-only "Save as PDF" toolbar (window.print)
- [x] Metadata + `app/sitemap.ts` entry; "View CV" link added beside existing download buttons (hero + navbar)

## Step 10 — PDF pipeline `[commit: chore(resume): generate pdf from /cv]`

- [ ] `scripts/make-cv-pdf.mjs`: headless Edge `--print-to-pdf` against built site → writes `apps/web/public/assets/resume.pdf` (zero new deps)
- [ ] Regenerate PDF; verify hero/navbar blob-download serves the new file

## Step 11 — Offline foundation (desktop + shared) `[commit: feat(offline): queued contact sending]`

- [ ] `packages/shared/src/outbox.ts`: storage-pluggable contact queue (add/list/dequeue/mark-sent, retry semantics)
- [ ] `apps/web/components/web/Contact.tsx` Electron path: localStorage adapter + auto-flush on window `online` event and on mount; queued/pending status UI
- [ ] Grep-audit: zero runtime remote refs left in desktop surface (fonts safe — next/font self-hosts at build)

## Step 12 — Mobile foundation rebuild `[commit: feat(mobile): parity foundation]`

- [ ] `npx expo install`: react-native-safe-area-context, @react-native-async-storage/async-storage, @react-native-community/netinfo, expo-file-system, expo-sharing, expo-blur, expo-splash-screen
- [ ] Add deps: `@expo-google-fonts/inter` (global Inter), `lucide-react-native` + `react-native-svg` (exact icon parity)
- [ ] Theme token fixes: dark bg `#0d1515`, mutedText `#4b4b4b`/`#bec6c6`, card `#192020`, contact-card `#161d1d`, border `#d4d4d4`, bands `#eee`/`#151d1d`
- [ ] SafeArea insets wired; global font loading behind splash screen; StatusBar per scheme
- [ ] Scroll-context provider (scrollY) feeding navbar shadow (>8px), 2px teal→cyan progress bar, active-section logic (top ≤160px)
- [ ] Reveal rewrite: FadeInUp 16px→0, 700ms ease-out cubic, fires once when ~10% visible & 40px above fold, delay map kept, reduced-motion respected; remove dead `Stagger`
- [ ] Rotation-safe geometry (`useWindowDimensions`, no module-scope Dimensions)

## Step 13 — Mobile sections 1:1 port `[commit: feat(mobile): 1:1 section parity with web]`

- [ ] Navbar: brand 20 bold · 44×44 theme button w/ Light/Dark/System popover (radius 22, p6, 100ms fade-zoom-drop) · 44×44 hamburger dropdown (min-w 176, rounded-22, active item primary semibold) · blur bg + scroll shadow · progress bar
- [ ] Hero: glow ellipse + 28px dot-grid backdrops · padding 20/80/96 · H1+H2 36px bold (H2 gradient-clipped, MaskedView auto-height — fixes fixed-96 bug) · para 16/26 muted max-w 576 · mono 14 capabilities · stacked full-width CTAs gap-3 mt-9 (gradient "Start a Project", outlined "View My Work", both 72px tall radius 26 scale .98) · muted "Download CV" FileDown text-link mt-5 · bouncing chevron
- [ ] Workflow: replace carousel with vertical stacked cards (band, H2 30 mb-5, cards p24/r14/gap16, alternating 18px tinted icon tiles: Lightbulb/DraftingCompass/Code/Rocket)
- [ ] Business: py-96 px-16 gap-48, checklist upgraded to 20px CheckCircle icons + 16px medium labels (gear graphic stays hidden = web <768px truth)
- [ ] Projects: full-width cards (screen−32), r14/shadow-md, title row 20 bold + ArrowUpRight 20 muted, chips 13px px12/py4 pill secondary tints, whole card pressable, bundled images keyed by `id`, AsyncStorage last-cached fallback + caption
- [ ] Trust (NEW section): raw-bg strip between bands, stats `{N}+ / 24h / 100%` 36px JetBrains Mono primary + labels 16 medium muted (gaps 56×32), three Cards mt-56 gap-24 delays 0/150/300 (CalendarCheck/FileText/KeyRound)
- [ ] Contact: band wrapper p-24, elevated card r22 shadow-2xl `#161d1d`/white, H2 30 mb-4, inputs r14 focus-primary border, error banner (destructive/10, AlertCircle 20), full-width gradient submit 72px r26 + Loader2 spin, caption "Typically replies within 24 hours…", success screen (emerald CheckCircle2 64-circle), outbox queued banner
- [ ] Footer: centered vertical stack, gaps 16, padding 32, copyright 14px

## Step 14 — Mobile CV + connectivity `[commit: feat(mobile): offline cv sheet + auto-flush queue]`

- [ ] `src/components/CVSheet.tsx`: core-RN Modal (zero nav deps), own ScrollView, paper-surface document rendered from shared cv data regardless of app theme; close button; footer actions
- [ ] Hero/Navbar CV buttons open CVSheet (replace remote-PDF Linking)
- [ ] "Save PDF": bundled resume.pdf → cache copy (expo-file-system) → share/open (expo-sharing) — works in airplane mode
- [ ] NetInfo listener flushes outbox on reconnect; launch + AppState→active triggers too

## Step 15 — Verification matrix `[fixes committed as needed]`

- [ ] Web: lint + typecheck + build green; `/cv` visual pass (desktop/mobile widths) + print preview; fresh PDF downloads correctly
- [ ] Desktop: `dev` smoke test of `/cv`; airplane-mode run makes zero non-localhost requests; queued contact flushes when back online
- [ ] Mobile: `tsc --noEmit` clean; Expo Go matrix — airplane-mode cold start (cached projects render, CV sheet opens, PDF shares offline, message queues) → reconnect → auto-send observed; section-by-section side-by-side vs web at 390px & 430px widths
- [ ] Regenerate resume.pdf one final time after any content tweaks

## Phase 2 honest caveats (approximations, not pixel-clones)

- Blur intensity: expo-blur ≠ CSS backdrop-blur-md (closest possible)
- Hero dot-grid edge mask approximated with gradient fades
- CSS `text-wrap: balance/pretty` has no RN equivalent

## Phase 2 new dependencies (approved scope)

| Package | Why |
|---|---|
| react-native-safe-area-context | notch/status-bar safety (absent today) |
| @react-native-async-storage/async-storage | projects cache + mail outbox persistence |
| @react-native-community/netinfo | instant reconnect detection for auto-flush |
| expo-file-system + expo-sharing | fully-offline PDF export/share |
| expo-blur | navbar backdrop-blur approximation |
| expo-splash-screen | hold splash while fonts load |
| @expo-google-fonts/inter | web's effective UI font |
| lucide-react-native + react-native-svg | exact icon parity with web's lucide set |

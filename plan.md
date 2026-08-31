# Plan: Remove desktop & mobile apps — web-only portfolio (remove-desktop-mobile)

## Context
User requested removal of all files associated with the desktop (Electron) and mobile (Expo) apps. The portfolio will become a web-only Next.js project. Per AGENTS.md: create branch first, write plan, wait for approval, then execute and open PR. Branch already created.

## Branch
`remove-desktop-mobile` — commit messages = branch name per AGENTS.md.

## Goal
Delete every desktop/mobile artefact and scrub remaining web/root configs so the project builds, type-checks, and tests as a pure web monorepo with no dangling refs.

## Inventory — files/dirs to delete (verified in repo)

1. Entire directories:
   - `apps/desktop/` (electron/main.mjs, preload.cjs, assemble.mjs, release/, node_modules — generated release stays gitignored but top dir is removed)
   - `apps/mobile/` (app.json, eas.json, expo code in src/, android/, ios generated, dist/, assets, google-services.json, GoogleService-Info.plist, .easignore, etc.)
2. Root configs:
   - `electron-builder.yml` (packager config, desktop-only)
   - `app.json` (root Expo/EAS config — duplicate of mobile, not used by web)
   - `eas.json` (root EAS config, mobile-only)
   - `.easignore` (root + mobile copy goes away with apps/mobile)
   - `ELECTRON.md` (desktop docs)
   - `certs/` (code-signing PFX gitignored — directory already empty except ignored file; remove dir entry and keep ignore rule cleanup)
3. Web cross-references:
   - `apps/web/components/desktop/TitleBar.tsx`
   - `apps/web/components/desktop/ElectronThemeSync.tsx`
   - `apps/web/types/electron.d.ts`
   - `apps/web/app/download/page.tsx` — **KEEP per user request** (do not delete; leave as-is).
4. Workflows:
   - `.github/workflows/mobile-production-apk.yml` considered; actual file is `.github/workflows/release.yml` which currently builds desktop+android+ios Matrix; strip to web-only CI or delete mobile/desktop jobs.

## Configs to patch (not delete)

- `package.json` (root):
  - `description` → remove "desktop and mobile apps"
  - `main` → remove `apps/desktop/electron/main.mjs`
  - `workspaces` → change from `["apps/*","packages/*"]` to `["apps/web","packages/*"]`
  - `scripts` → remove `desktop:dev`, `desktop:build`, `desktop:dist`
  - `allowScripts` / `devDependencies` audit: `png-to-ico`/resvg etc stay if used by web; `cross-env` only for desktop — remove if unused elsewhere.
- `apps/web/next.config.ts`: remove `...(ELECTRON_BUILD ? {output:"standalone"}:{})` and `allowedDevOrigins` comment if desktop-only.
- `apps/web/app/layout.tsx`: remove imports + JSX for `TitleBar` and `ElectronThemeSync`.
- `apps/web/lib/site.ts`: keep `SITE_URL` canonical; drop comment about desktop/Electron fallback.
- `apps/web/app/api/projects/route.ts`: drop comment about Electron desktop shell.
- `.gitignore`: remove sections `monorepo: electron release output`, `monorepo: expo/EAS artifacts`, `code signing material`, `expo export output`, `Firebase configs`, `generated native projects` entries tied to desktop/mobile (keep generic ignores).
- `tsconfig.json`: remove `paths.@mobile/*`.
- `vitest.config.ts`: remove alias `@mobile`, `include` entries `apps/mobile/src/**` coverage, keep web/shared.
- `README.md`: rewrite to web-only stack, remove Download table & desktop/mobile highlights.
- `docs/store-listings.md`: delete or trim (store listings are mobile-only) — delete file if present.
- `.github/workflows/release.yml`: either delete desktop/android/ios jobs or replace with single web build/deploy job; follow up with user preference — for now strip to web-only publish.
- `scripts/` audit: `scripts/test-desktop-contact.mjs` → delete; `make-icons.mjs`, `make-project-shots.mjs`, `make-cv-pdf.mjs` are web/shared → keep.
- `tests/` audit: `tests/unit/mobile/*`, `tests/integration/shared/outbox.test.ts` references mobile, `tests/feature/offline-contact-queue.test.ts` has mobile context — evaluate each file and delete mobile-only suites or strip mobile branches; keep shared/web.

## Order

1. Delete filesystem artefacts (`apps/desktop`, `apps/mobile`, `electron-builder.yml`, root `app.json/eas.json/.easignore`, `ELECTRON.md`, `certs/`, `docs/store-listings.md`, web desktop components; **download page is NOT deleted per user request**).
2. Patch configs (`package.json`, `next.config.ts`, `layout.tsx`, `electron.d.ts` removal, `.gitignore`, `tsconfig.json`, `vitest.config.ts`, `README.md`, `lib/site.ts`, `api/projects/route.ts`).
3. Patch workflows + reconcile `package-lock.json` via `npm install` (workspace list changed).
4. Prune tests referring to mobile/desktop.
5. Verify: `npm run typecheck -w @portfolio/web`, `npm run build -w @portfolio/web`, `npm test`.

## Risks

- `npm install` will drop `apps/desktop`/`apps/mobile` from lockfile; if CI caches by lockfile hash it will invalidate — expected.
- Removing `app.json`/`eas.json` root breaks `expo` CLI outside apps/mobile; not needed for web.
- Old git branches/workflows referencing `apps/desktop/release` will fail — covered by workflow rewrite.
- `vitest` coverage thresholds may need recalibration after mobile src removal.

## Verification

- `npm run typecheck -w @portfolio/web` passes.
- `npm run build -w @portfolio/web` produces `.next` without `output: standalone` requirement.
- `npm test` passes (after mobile suite removal, adjust count).
- `rg -i "electron|expo|eas|desktop|mobile"` shows no remaining source refs except historical comments if explicitly retained.
- No git-tracked file under deleted paths (`git ls-files | rg "apps/(desktop|mobile)"` empty).

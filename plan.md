# Plan: Audit fixes A+B+C + workflow invalid file (audit/fix-a-b-c-workflow)

## Context
User approved PASS 1 findings fix in three groups plus workflow check failure:
`Invalid workflow file .github/workflows/mobile-production-apk.yml (Line 15, Col 9): Unrecognized named-value: 'secrets' at jobs.<job>.if`

Root cause: `secrets` context is not available in `jobs.<job>.if` (GitHub Actions docs: `secrets` only at step/job `env`/`with`, not at job `if` in reusable workflows on some runners). The file used `if: ${{ secrets.EXPO_TOKEN != '' }}` at job level for both jobs, causing parser error.

## Branch
`audit/fix-a-b-c-workflow` — commit messages = branch name per AGENTS.md

## Group A — Security (may change behavior, intentional)
1. S-01 `apps/web/lib/mailer.ts:266` — sanitize email with `stripCrlf` before `replyTo`/`to`; also escape `"` in display name (S-11).
2. S-03 `apps/web/lib/rate-limit.ts` — prune expired entries, cap map size (prevent unbounded Map).
3. S-04 `apps/web/components/Analytics.tsx:29` — escape `GA_ID` via `JSON.stringify` instead of `'${GA_ID}'`.
4. S-07 `apps/web/app/api/contact/route.ts:57` — enforce body size after `JSON.parse`, not just `content-length`.
5. S-02 `apps/web/lib/rate-limit.ts:33` — document trust for `x-forwarded-for`; on Vercel prefer `x-vercel-forwarded-for` or take last entry; add helper to pick client IP safely.
6. S-05 `apps/desktop/electron/main.mjs:32` — make `filterEnv` actually filter or remove dead code (no behavior change for desktop prod via LIVE_BASE fallback).
7. S-08/H-05 — add `queuedAt` note / warn on `EMAIL_TO` fallback (minimal).

Tests: `npm test` covers mailer/rate-limit; desktop main.mjs has 0 tests — risky, verify manually with `npm run build -w @portfolio/web`.

## Group B — Dependencies (patch/minor only, no breaking majors)
Update via `npm update` / manual bumps (wanted → latest where safe):
- `expo 57.0.16→57.0.18`, `expo-asset 57.0.14→57.0.15`, `expo-file-system 57.0.5→57.0.6`, `expo-font 57.0.1→57.0.2`, `expo-sharing 57.0.15→57.0.16`
- `nodemailer 9.0.5→9.0.6`, `lucide-react 1.33→1.38`, `lucide-react-native 1.34→1.38`, `resend 6.22→6.25`
- `next 16.3.0→16.3.3`, `eslint-config-next 16.3.0→16.3.3`, `@testing-library/react 16.3.2→16.3.3`, `@types/react-dom 19.2.4→19.2.5`
- Seal lockfile with `npm install` after bumps.

**Deferred majors (flag only, no apply):** `electron 33→44`, `electron-builder 25→26.15.3` (fixes critical `tar`), `typescript 7`, `eslint 10`, `@types/node 26`, `@react-native-async-storage 3`, `cross-env 10`, `expo major`. Will list migration notes.

## Group C — Safe cleanups (must NOT change behavior)
- R-02 `apps/web/next.config.ts:8` — migrate `images.domains` → `images.remotePatterns` for `placehold.co`.
- R-01 delete dead `pendingSubmitRef` in `Contact.tsx:31-32` and `mobile/ContactForm.tsx:51-52`.
- R-03 `apps/web/app/download/page.tsx:219` — collapse duplicate recommended loop.
- D-01 extract `LIVE_BASE` to `apps/web/lib/site.ts` and import in `Project.tsx`/`projects.tsx`/`Contact.tsx`.
- D-02 shared `isValidEmail` in `packages/shared` or `apps/web/lib/sanitize.ts`, reuse in mailer + both Contact forms.
- D-04 extract `emailLayout` helper in `mailer.ts`.
- R-06 `apps/mobile/src/components/ContactForm.tsx:212` — fix spinner leak with `cancelAnimation`.
- H-01/H-02 add `AbortSignal.timeout(8000)` and `cache: 'no-store'` to GitHub API + projects fetch.
- H-06 workflow env hygiene (use `env:` not `$GITHUB_ENV` for secrets) — low priority, note only.

## Workflow fix — mobile-production-apk.yml
- Remove `jobs.<job>.if: ${{ secrets.EXPO_TOKEN ... }}` (15,65).
- Replace with step-level gate: add `Check Expo token present` step that sets `output` via `if: true` then `if: steps.check.outputs.has_token == 'true'` for EAS job steps, or make jobs unconditional and early-exit. Simpler: remove job-level if entirely and add `if: ${{ secrets.EXPO_TOKEN != '' }}` at step level + make `bare-production-apk` run only when EAS didn't run via `needs` or via inverse step check.
- Correct pattern per GitHub docs: keep jobs without `if: secrets`, use `if: ${{ vars.HAS_EXPO_TOKEN }}` is not ideal; simplest robust: remove job `if`, add first step `Check for EXPO_TOKEN` that does `if [ -z "${{ secrets.EXPO_TOKEN }}" ]; then echo "skip=true" >> $GITHUB_OUTPUT; fi` and gate remaining steps with `if: steps.check.outputs.skip != 'true'`. For two jobs, gate each job's steps inversely.
- Ensure workflow parses: `actionlint` equivalent — `secrets` only in `steps.with`/`env`.

## Order & verification
1. Fix workflow file first (otherwise CI fails on every push).
2. Group A → `npm run build -w @portfolio/web` + `npm test` → `git commit -m "audit/fix-a-b-c-workflow"` → `git push -u origin audit/fix-a-b-c-workflow`
3. Group B → same verify → commit+push
4. Group C → same verify → commit+push
5. Final PR to `main` via `gh pr create`.

## Risks
- Rate-limit helper change is sensitive — Vercel header behavior must be tested (`x-forwarded-for` can contain multiple IPs).
- Email CRLF fix is safe (additive sanitization).
- GA escaping safe.
- Dependency bumps are patch/minor, covered by 116 tests.

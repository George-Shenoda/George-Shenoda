# Plan: Web-only + secure admin panel (CRUD projects)

## Branch
`feature/secure-admin-crud` — commit messages = branch name per AGENTS.md.

## Goal
1. Delete the desktop project; keep web + backend (web API) only.
2. Add a secure admin panel: password-protected, secret URL, not indexed by Google.
3. Admin panel CRUD: add / update / delete portfolio projects. Edits show live on the public site.

## Storage (user decision)
Vercel KV / Upstash Redis. Public `/api/projects` reads from Redis, seeding from bundled `@portfolio/shared` projects on first load (existing bundled list stays as fallback).

## New dependencies (web workspace only)
- `@upstash/redis` — project store + session store
- `@upstash/ratelimit` — shared-store login rate limiting (serverless-safe)

## Environment (`.env.example`)
- `ADMIN_PASSWORD` — admin login password (secret, Vercel env)
- `ADMIN_PATH` — secret slug for the admin URL (e.g. `x9k-admin-dash`); page 404s unless the path segment matches
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — from Vercel KV integration
- `ADMIN_SESSION_TTL_HOURS` (optional, default 24)

## Files

### New
- `apps/web/lib/admin/auth.ts` — constant-time password check (`crypto.timingSafeEqual` over SHA-256 of env password), create/verify/revoke opaque session token stored in Redis
- `apps/web/lib/admin/store.ts` — Redis projects store: read + seed-on-first-load, write; typed
- `apps/web/lib/admin/validate.ts` — `Project` boundary validation (id slug, title≤120, techstack ≤20 items each ≤40, link/image http(s) ≤500)
- `apps/web/app/api/admin/login/route.ts` — POST; rate-limited auth, sets `httpOnly secure SameSite=Lax` session cookie
- `apps/web/app/api/admin/logout/route.ts` — revokes session
- `apps/web/app/api/admin/session/route.ts` — GET; used by UI to check login state
- `apps/web/app/api/admin/projects/route.ts` — GET list, POST create (auth required)
- `apps/web/app/api/admin/projects/[id]/route.ts` — PUT update, DELETE (auth required)
- `apps/web/app/admin/[panel]/page.tsx` — server component; returns 404 unless `panel === ADMIN_PATH`; `robots: noindex` metadata + `X-Robots-Tag: noindex` header
- `apps/web/components/admin/AdminLogin.tsx` — password form (client)
- `apps/web/components/admin/ProjectsManager.tsx` — list + add/edit/delete form (client, reuses existing `Button` + plain inputs)

### Changed
- `apps/web/app/api/projects/route.ts` — read from store (seed on first load), fallback to bundled `projects`
- `apps/web/app/robots.ts` — disallow `/api/` (already) + `/admin/`
- `apps/web/.env.example` — add vars above, drop desktop comments
- **Delete** `apps/desktop/` (untracked dir on disk; `.gitignore` unchanged)
- `apps/web/app/api/contact/route.ts` — remove Electron/file-origin allowance (backend is web-only now)
- Lockfile via `npm install` (new deps)

## Security controls
- Password from env only; constant-time compare; generic 401 on failure; never logged.
- Session: random 256-bit token (Redis-backed, TTL), cookie `httpOnly`, `secure`, `SameSite=Lax`.
- Login rate limit: 10/15 min per IP using shared store (works on serverless).
- Every admin API route checks the session before acting.
- All admin input validated at the boundary; React auto-escaping renders output (no XSS).
- Secret URL: not linked anywhere, noindexed, excluded from robots + sitemap.

## Tests (vitest)
- `tests/unit/admin-validate.test.ts` — validation accept/reject cases
- `tests/unit/admin-auth.test.ts` — password check + session verify/revoke using an in-memory Redis fake (store client injectable)

## Verification
- `npm run typecheck -w @portfolio/web`
- `npm run build -w @portfolio/web`
- `npm test`
- Manual: login from `/admin/ADMIN_PATH`, add/edit/delete a project, confirm `/api/projects` reflects it.

## Order
1. Branch created (done)
2. Delete `apps/desktop/`, scrub contact-route Electron allowance
3. Add deps
4. `lib/admin/*`
5. Public projects route → store
6. Admin API routes
7. Admin page + components + robots/noindex
8. `.env.example`
9. Tests
10. Verify, then PR to `main`

## Risks
- Redis unset in dev → admin/login 500s; auth helper fails closed (public site keeps bundled fallback).
- `@upstash/ratelimit` needs same Redis vars; both set together.
- Session revoked on Redis flush (KV restart) → re-login, acceptable.
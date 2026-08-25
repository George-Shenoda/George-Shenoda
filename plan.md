# Plan — Testing Suite (unit / integration / feature)

## Branch: feat/testing-suite

Stack (already installed at root): `vitest@4` + `@vitest/coverage-v8`, `msw@2`, `jsdom`.

---

## 0. Infrastructure

1. Root `vitest.config.ts` with two projects:
   - `node` — all shared/web/mobile logic tests (default env)
   - `jsdom` — browser-dependent tests only (`*.dom.test.ts`)
   - `resolve.alias`: `@` → `apps/web` (matches web tsconfig paths)
2. `tests/setup/msw.ts` — msw node server lifecycle (`beforeAll listen`, `afterEach resetHandlers`, `afterAll close`)
3. Root scripts: `test`, `test:watch`, `test:coverage`

## 1. Unit tests (pure logic, no network)

| File | Covers |
|---|---|
| `tests/unit/shared/data-invariants.test.ts` | `cv` shape (non-empty arrays, valid emails/URLs, unique ids), `projects` links match `https://…`, `theme` token presence |
| `tests/unit/shared/index.test.ts` | Barrel exports full public API surface |
| `tests/unit/shared/localstorage-storage.dom.test.ts` | `createLocalStorageStorage`: SSR guard, corrupt/non-array JSON tolerance, round-trip |
| `tests/unit/web/sanitize.test.ts` | `escapeHtml` entity encoding (`& < > " '`), `stripCrlf` removes `\r\n` |
| `tests/unit/web/rate-limit.test.ts` | Fixed-window counting, `count >= limit` boundary, window expiry (fake timers), key isolation, `getClientIp` header precedence (`x-forwarded-for` → `x-real-ip` → `unknown`) |
| `tests/unit/web/utils.test.ts` | `cn()` conditionals, tailwind-merge last-wins |
| `tests/unit/web/site.test.ts` | `NEXT_PUBLIC_SITE_URL` default/override (resetModules + stubEnv) |
| `tests/unit/mobile/config.test.ts` | `resolveAssetUrl` absolute passthrough / relative prefix; `SITE_URL` trailing-slash strip |
| `tests/unit/mobile/outbox-storage.test.ts` | `createAsyncStorageStorage` with mocked AsyncStorage: read fallback `[]`, corrupt JSON, write serialization |

## 2. Integration tests (module boundaries + seams)

| File | Covers |
|---|---|
| `tests/integration/shared/contact-client.msw.test.ts` | Via msw: URL building (trailing `/` strip, `/api/contact` append), `{error}` JSON parse + status-text fallback, **`networkError:false` on HTTP errors vs `true` on fetch throw** (core retry contract) |
| `tests/integration/shared/outbox.test.ts` | `add/list/pendingCount/clear`; flush: oldest-first, stops at first failure, increments `attempts`, records `lastError`, drops at `maxAttempts`, skips persistence when nothing changed |
| `tests/integration/web/mailer.test.ts` | Nodemailer mocked: name/email/message validation branches, missing-creds error, auto-reply skipped iff `CONTACT_AUTO_REPLY === 'false'`, CRLF stripped from headers, `sendMail` args (`replyTo`, `from`, html content) |
| `tests/integration/web/contact-route.test.ts` | Real `POST`/`OPTIONS` handlers, mailer mocked, real rate limiter: CORS origin allow/deny, `X-RateLimit-*` headers, 429, `content-length > 10240` → 413, bad JSON → 400, honeypot → 400, field length caps (100/254/5000), success/failure delegation |
| `tests/integration/web/projects-route.test.ts` | `GET` → 200 + projects array payload |

## 3. Feature tests (end-to-end user journeys)

| File | Journey |
|---|---|
| `tests/feature/offline-contact-queue.test.ts` | Network down → `submitContact` returns `networkError:true` → messages queued in outbox → network restored → `flush()` delivers both, storage persisted, `pendingCount === 0` |
| `tests/feature/contact-api-journey.test.ts` | Real route + real rate limiter: valid human submit → 200 + email sent; bot honeypot → 400 spam; burst of 5 rapid submits → 429; window expires (fake timers) → allowed again |
| `tests/feature/web/navbar-routing.dom.test.ts` | Cross-route nav sets `location.href = '/#id'`; same-route nav smooth-scrolls target element |

## 4. Bugs surfaced while planning (fixes included in this branch — needs confirmation)

1. **`apps/web/lib/sanitize.ts` — `escapeHtml` is a no-op**: every char maps to *itself* (e.g. `.replace(/</g, '<')`). No HTML entity is ever produced. Fix: encode to `&amp; &lt; &gt; &quot; &#39;`. Tests are written against the corrected spec.
2. **`packages/shared/src/projects.ts`** — `gstack-client-portal` link is `https:/gstack-ashen.vercel.app` (single slash). Fix URL; data-invariant test enforces `^https://`.

## 5. Out of scope (deferred)

- React Native component/hook tests (`scroll.tsx`, `theme-mode.tsx`) — reanimated/worklet mocking cost is high; prefer extracting pure logic later
- Electron `main.mjs` — top-level side effects; needs refactor to extract testable helpers
- E2E browser automation (Playwright)

## 6. Verification

- [x] `npm test` (root) — 116/116 green
- [x] `npm run test:coverage` — 99.4% statements / 95.5% branches
- [x] `npm run typecheck:tests`
- [x] Existing gates untouched: `npm run typecheck -w @portfolio/web`, `lint`, `build`
- [x] Mobile `typecheck` still passes

## 7. Git workflow (per project rules)

- No commit until plan approved
- Commit message = branch name (`feat/testing-suite`), push after each commit
- PR to `main` after completion

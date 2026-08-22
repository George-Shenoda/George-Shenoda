# Store Listings — George Shenoda

> Prepared 2026-08-22. Bundle ID / package name for both stores: `com.georgeshenoda.portfolio` (already set in `apps/mobile/app.json`).
> App name everywhere: **George Shenoda**.

## User prerequisites (cannot be done for you)

- [ ] **Google Play developer account** — one-time $25 registration: https://play.google.com/console
- [ ] **Apple Developer Program** — $99/year: https://developer.apple.com/programs (required for App Store Connect + EAS iOS builds)
- [ ] EAS CLI login (`npx eas-cli login`) + project link (`npx eas-cli init`) inside `apps/mobile`
- [ ] Set `EXPO_PUBLIC_SITE_URL` secret in EAS build profiles (points at the deployed site)

## Google Play listing

| Field | Value |
|---|---|
| App name | George Shenoda |
| Short description (≤80 chars) | Portfolio of a full-stack developer bridging mechatronics and code. |
| Full description | See below. |
| Category | Business (secondary: Productivity) |
| Tags | developer, portfolio, automation |

**Full description:**

> Bridging Mechatronics & Code.
>
> Explore the work of George Shenoda — a full-stack developer who applies engineering logic to software. This official portfolio app presents responsive full-stack applications and business automation projects, from concept to deployment.
>
> • Featured projects with tech-stack breakdowns, loaded live and available offline
> • Structured workflow: Discovery, Architecture, Development, Launch
> • Business automation expertise: email workflows, real-time dashboards, API integrations
> • Built-in contact form — reach out directly from the app
> • Light and dark mode following your device settings

## App Store listing

| Field | Value |
|---|---|
| App name | George Shenoda |
| Subtitle (≤30 chars) | Full-Stack Developer |
| Promotional text | Engineering logic applied to software — explore full-stack projects and business automation work. |
| Description | Same as Play full description. |
| Primary category | Business |
| Secondary category | Productivity |
| Keywords (≤100 chars, comma separated) | developer,portfolio,fullstack,automation,web,projects,engineer,business,dashboard,iot |

## Data safety declarations

### Google Play Data safety form
- Does your app collect or share any of the required user data types? → **Yes**
- Data collected: **Name**, **Email address**, **Other user content (message text)** — all *user-provided via contact form*
- Purpose: **Contacting the developer / app functionality only**
- Shared with third parties: **No**
- All items marked as: collected but NOT shared; encrypted in transit ✓; users can request deletion ✓ (contact via form)
- No data types beyond the above; no analytics/advertising identifiers.

### Apple App Privacy ("nutrition labels")
- Data Linked to You: **Contact Info — name, email address** (user-provided, used only to reply)
- Data Not Linked to You: **None**
- Tracking: **No**

### Website privacy policy
Published at `/privacy` (source: `apps/web/app/privacy/page.tsx`) — required by both stores as the linked privacy policy URL. Point both store forms at `https://<your-domain>/privacy`.

## Screenshots

Scripted captures (run after `npm run start -w @expo/mobile`… i.e. with the app open in a simulator/emulator):

| Platform | Device class | Size (px) | Count |
|---|---|---|---|
| Android (Play) | Phone | 1080×1920 minimum, up to 3840×2160 | ≥2 (hero + projects recommended) |
| Android (Play) | 7" tablet *(optional)* | 1200×1920 | 1+ |
| iOS (App Store) | iPhone 6.9" | 1290×2796 | required set |
| iOS (App Store) | iPhone 6.5" *(if supporting)* | 1284×2778 / 1242×2688 | optional legacy set |
| iOS (App Store) | iPad 13" *(if supporting iPad)* | 2048×2732 | required if tablet supported |

Capture commands:

```bash
# Android emulator (after boot + app install):
adb exec-out screencap -p > android-phone-1.png

# iOS simulator:
xcrun simctl io booted screenshot ios-69-1.png
```

Suggested capture sequence per device: (1) hero section visible, (2) scrolled to Featured Projects, (3) contact form. No status-bar redaction needed.

## Build submission commands

```bash
cd apps/mobile
npx eas-cli build --profile production --platform android   # AAB → Play Console
npx eas-cli build --profile production --platform ios       # IPA → App Store Connect
```

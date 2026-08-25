import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Materializes firebase configs inside EAS cloud builds.
 *
 * EAS Build only uploads git-tracked files, and our firebase configs are
 * intentionally untracked (rotated-secret policy). This script runs as
 * `eas-build-pre-install` and writes them from EAS environment variables:
 *
 *   GOOGLE_SERVICES_JSON_B64   -> apps/mobile/google-services.json   (Android)
 *   GOOGLE_SERVICES_PLIST_B64  -> apps/mobile/GoogleService-Info.plist (iOS)
 *
 * Behavior:
 * - Local dev builds: files already exist on disk -> skip silently.
 * - On EAS (process.env.EAS_BUILD): missing env var + missing file = hard fail,
 *   so builds break loudly instead of shipping without analytics wiring.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const targets = [
  {
    envVar: 'GOOGLE_SERVICES_JSON_B64',
    file: path.join(root, 'google-services.json'),
    label: 'google-services.json',
  },
  {
    envVar: 'GOOGLE_SERVICES_PLIST_B64',
    file: path.join(root, 'GoogleService-Info.plist'),
    label: 'GoogleService-Info.plist',
  },
];

const onEas = process.env.EAS_BUILD === 'true';
let failed = false;

for (const { envVar, file, label } of targets) {
  if (fs.existsSync(file)) {
    console.log(`[firebase-config] ${label} already present — skipping.`);
    continue;
  }

  const b64 = process.env[envVar];
  if (!b64) {
    const message = `[firebase-config] ${label} missing and ${envVar} not set.`;
    if (onEas) {
      console.error(`::error::${message} Create it via \`eas env:create\` or the Expo dashboard.`);
      failed = true;
    } else {
      console.warn(`[firebase-config] ${message} Skipping (local build).`);
    }
    continue;
  }

  fs.writeFileSync(file, Buffer.from(b64, 'base64'));
  console.log(`[firebase-config] wrote ${label}.`);
}

if (failed) process.exit(1);

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const LEAKED_KEY_PREFIX = ['AIzaSyDvp-', 'WUlZGEU'].join('');
const mobileRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const targets = {
  androidRoot: path.join(mobileRoot, 'android', 'app', 'google-services.json'),
  androidEas: path.join(mobileRoot, 'google-services.json'),
  ios: path.join(mobileRoot, 'GoogleService-Info.plist'),
};
const scanExcludes = new Set([
  'node_modules',
  '.expo',
  '.expo-shared',
  '.gradle',
  'build',
  'dist',
  '.turbo',
  'coverage',
  '.git',
]);

const args = process.argv.slice(2);
const flags = {
  checkOnly: args.includes('--check-only'),
  updateEas: args.includes('--update-eas'),
};
function optionValue(name) {
  const index = args.indexOf(name);
  return index !== -1 ? args[index + 1] : undefined;
}
const androidSource = optionValue('--android');
const iosSource = optionValue('--ios');

if (!flags.checkOnly && !androidSource && !iosSource) {
  console.error(
    [
      'Usage:',
      '  node scripts/apply-rotated-firebase-configs.mjs --check-only',
      '  node scripts/apply-rotated-firebase-configs.mjs --android <google-services.json> [--ios <GoogleService-Info.plist>] [--update-eas]',
      '',
      'Downloads fresh configs at console.firebase.google.com -> Project settings first.',
    ].join('\n'),
  );
  process.exit(2);
}

function walk(dir, hits) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (scanExcludes.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, hits);
    } else if (entry.isFile()) {
      let content;
      try {
        content = fs.readFileSync(fullPath, 'utf8');
      } catch {
        continue;
      }
      if (content.includes(LEAKED_KEY_PREFIX)) hits.push(path.relative(mobileRoot, fullPath));
    }
  }
  return hits;
}

function scan() {
  const hits = walk(mobileRoot, []);
  if (hits.length === 0) {
    console.log(`[rotate] Clean - no references to the leaked key (${LEAKED_KEY_PREFIX}...) under ${path.basename(mobileRoot)}/.`);
    return true;
  }
  console.error(`[rotate] Leaked key still referenced in ${hits.length} file(s):`);
  for (const hit of hits) console.error(`  - ${hit}`);
  return false;
}

function assertNotLeaked(content, label) {
  if (content.includes(LEAKED_KEY_PREFIX)) {
    console.error(`[rotate] Refusing to install ${label}: it still contains the leaked key.`);
    process.exit(1);
  }
}

function projectIdOfAndroidConfig(content) {
  try {
    return JSON.parse(content).project_info?.project_id ?? null;
  } catch {
    return null;
  }
}

function install(sourcePath, destinationPaths, label) {
  if (!sourcePath) return null;
  const resolved = path.resolve(sourcePath);
  if (!fs.existsSync(resolved)) {
    console.error(`[rotate] ${label} source not found: ${resolved}`);
    process.exit(2);
  }
  const content = fs.readFileSync(resolved, 'utf8');
  assertNotLeaked(content, label);
  if (label === 'google-services.json') {
    const parsedOk = (() => {
      try {
        const parsed = JSON.parse(content);
        return Array.isArray(parsed.client) && parsed.project_info;
      } catch {
        return false;
      }
    })();
    if (!parsedOk) {
      console.error('[rotate] Downloaded google-services.json does not look like a Firebase Android config.');
      process.exit(1);
    }
    const current = fs.existsSync(targets.androidEas)
      ? projectIdOfAndroidConfig(fs.readFileSync(targets.androidEas, 'utf8'))
      : projectIdOfAndroidConfig(fs.readFileSync(targets.androidRoot, 'utf8'));
    const nextProjectId = projectIdOfAndroidConfig(content);
    if (current && nextProjectId && current !== nextProjectId) {
      console.error(`[rotate] Project mismatch: existing=${current}, downloaded=${nextProjectId}. Wrong download?`);
      process.exit(1);
    }
  }
  for (const destination of destinationPaths) {
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(resolved, destination);
    console.log(`[rotate] Wrote ${path.relative(process.cwd(), destination)}`);
  }
  return content;
}

if (!flags.checkOnly) {
  install(androidSource, [targets.androidRoot, targets.androidEas], 'google-services.json');
  install(iosSource, [targets.ios], 'GoogleService-Info.plist');
}

const clean = scan();

if (flags.updateEas) {
  if (!clean) {
    console.error('[rotate] Skipping EAS update until leaked-key references are gone.');
    process.exit(1);
  }
  const easVars = [
    { name: 'GOOGLE_SERVICES_JSON_B64', file: targets.androidEas },
    ...(fs.existsSync(targets.ios)
      ? [{ name: 'GOOGLE_SERVICES_PLIST_B64', file: targets.ios }]
      : []),
  ];
  for (const environment of ['preview', 'production']) {
    for (const { name, file } of easVars) {
      const b64File = path.join(os.tmpdir(), `${name}-${environment}.b64`);
      fs.writeFileSync(b64File, fs.readFileSync(file).toString('base64'));
      console.log(`[rotate] eas env:create ${name} -> ${environment}`);
      execFileSync('npx', ['eas-cli', 'env:create', '--name', name, '--value-file', b64File,
        '--type', 'string', '--visibility', 'secret', '--environment', environment,
        '--scope', 'project', '--force', '--non-interactive'], { stdio: 'inherit' });
      fs.rmSync(b64File, { force: true });
    }
  }
  console.log('[rotate] EAS secrets updated for preview + production.');
}

process.exit(clean ? 0 : 1);

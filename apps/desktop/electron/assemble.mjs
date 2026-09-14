import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_DIR = path.resolve(__dirname, '..', '..', 'web');
const STANDALONE = path.join(WEB_DIR, '.next', 'standalone');
const APP_ENTRY_DIR = path.join(STANDALONE, 'apps', 'web');

function copy(from, to) {
  if (!fs.existsSync(from)) {
    throw new Error(`Missing expected build output: ${from}`);
  }
  fs.cpSync(from, to, { recursive: true });
}

if (!fs.existsSync(path.join(APP_ENTRY_DIR, 'server.js'))) {
  console.error(
    `[assemble] standalone server.js not found under ${STANDALONE}. Run the ELECTRON_BUILD=true web build first.`
  );
  process.exit(1);
}

copy(path.join(WEB_DIR, '.next', 'static'), path.join(APP_ENTRY_DIR, '.next', 'static'));
copy(path.join(WEB_DIR, 'public'), path.join(APP_ENTRY_DIR, 'public'));

console.log('[assemble] standalone bundle ready for packaging');

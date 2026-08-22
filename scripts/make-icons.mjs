import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ICON_SVG = path.join(ROOT, 'assets', 'brand', 'icon.svg');

if (!fs.existsSync(ICON_SVG)) {
  console.log(
    '[icons] assets/brand/icon.svg not found — skipping. Drop a square SVG there and re-run to generate ico/icns/PNGs.'
  );
  process.exit(0);
}

console.error('[icons] generation pipeline not implemented yet — svg found at', ICON_SVG);
process.exit(1);

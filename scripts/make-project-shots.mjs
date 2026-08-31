import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";

/**
 * Generates 1280x720 branded project card images into
 * apps/web/public/assets/projects/.
 *
 * Drop real screenshots over the generated PNGs (same filenames)
 * whenever they become available.
 */

const ROOT = process.cwd();
const WEB_DIR = path.join(ROOT, "apps", "web", "public", "assets", "projects");

const W = 1280;
const H = 720;

const projects = [
  { id: "gvmt-marketplace", title: "GVMT Marketplace + Admin" },
  { id: "gstack-client-portal", title: "GStack Client Portal" },
  { id: "elevate-studio", title: "Elevate Studio Website" },
  { id: "iot-smart-office", title: "IoT Smart Office System" },
];

const escapeXml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function dotGrid() {
  const dots = [];
  for (let x = 40; x < W; x += 32) {
    for (let y = 40; y < H; y += 32) {
      dots.push(`<circle cx="${x}" cy="${y}" r="1.2" fill="#2a3535"/>`);
    }
  }
  return `<mask id="fade"><rect width="${W}" height="${H}" fill="url(#fadegrad)"/></mask>
  <g mask="url(#fade)">${dots.join("")}</g>`;
}

function shotSvg(id, title) {
  const safe = escapeXml(title);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="glow" cx="50%" cy="42%" r="55%">
      <stop offset="0%" stop-color="#0f7173" stop-opacity="0.45"/>
      <stop offset="60%" stop-color="#0f7173" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#0d1515" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="accent" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0f7173"/>
      <stop offset="50%" stop-color="#0e7490"/>
      <stop offset="100%" stop-color="#00f5ff"/>
    </linearGradient>
    <linearGradient id="fadegrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="70%" stop-color="#3c3c3c"/>
      <stop offset="100%" stop-color="#000000"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#0d1515"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  ${dotGrid()}
  <rect x="0" y="0" width="${W}" height="6" fill="url(#accent)"/>
  <text x="72" y="150" font-family="Segoe UI" font-weight="700" font-size="34" fill="#0f7173">GEORGE SHENODA</text>
  <text x="72" y="330" font-family="Segoe UI" font-weight="700" font-size="64" letter-spacing="-1" fill="#eee">${safe}</text>
  <rect x="74" y="368" width="120" height="5" rx="2.5" fill="url(#accent)"/>
  <text x="72" y="466" font-family="Segoe UI" font-size="24" fill="#647777">apps/web/public/assets/projects/${escapeXml(id)}.png</text>
</svg>
`;
}

await mkdir(WEB_DIR, { recursive: true });

for (const project of projects) {
  const png = new Resvg(shotSvg(project.id, project.title), {
    fitTo: { mode: "width", value: W },
    font: { loadSystemFonts: true, defaultFontFamily: "Segoe UI" },
  })
    .render()
    .asPng();
  await writeFile(path.join(WEB_DIR, `${project.id}.png`), png);
  console.log(`wrote ${project.id}.png (${W}x${H})`);
}

console.log("done");

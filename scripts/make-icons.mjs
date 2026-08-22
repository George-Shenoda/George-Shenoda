import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";
import pngToIco from "png-to-ico";

const ROOT = process.cwd();
const BRAND = path.join(ROOT, "assets", "brand");
const DESKTOP_ICONS = path.join(ROOT, "assets", "icons");
const WEB_APP = path.join(ROOT, "apps", "web", "app");
const MOBILE_ASSETS = path.join(ROOT, "apps", "mobile", "assets");

const FONT = `font-family="Segoe UI" font-weight="700" letter-spacing="-16" text-anchor="middle"`;

function glyph(scale = 1, mono = false) {
  const fill = mono ? "#ffffff" : "url(#gs)";
  const transform =
    scale === 1 ? "" : ` transform="translate(512 512) scale(${scale}) translate(-512 -512)"`;
  return `<g${transform}><text x="512" y="660" font-size="430" ${FONT} fill="${fill}">GS</text></g>`;
}

function defs() {
  return `<defs>
    <radialGradient id="glow" cx="50%" cy="46%" r="52%">
      <stop offset="0%" stop-color="#0f7173" stop-opacity="0.55"/>
      <stop offset="55%" stop-color="#0f7173" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#0d1515" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gs" x1="15%" y1="85%" x2="85%" y2="15%">
      <stop offset="0%" stop-color="#0f7173"/>
      <stop offset="45%" stop-color="#0e7490"/>
      <stop offset="100%" stop-color="#00f5ff"/>
    </linearGradient>
  </defs>`;
}

/** Full-bleed dark square + glow + GS — the master brand mark. */
function masterSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${defs()}
  <rect width="1024" height="1024" fill="#0d1515"/>
  <rect width="1024" height="1024" fill="url(#glow)"/>
  ${glyph()}
</svg>
`;
}

/** Transparent background; glyph scaled into the Android adaptive safe zone (~66%). */
function foregroundSvg(mono = false) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${mono ? "" : defs()}
  ${glyph(0.62, mono)}
</svg>
`;
}

async function renderPng(svg, width) {
  return new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: { loadSystemFonts: true, defaultFontFamily: "Segoe UI" },
  })
    .render()
    .asPng();
}

async function writePng(svg, filePath, width) {
  await writeFile(filePath, await renderPng(svg, width));
  console.log(`wrote ${path.relative(ROOT, filePath)} (${width}px)`);
}

await Promise.all([
  mkdir(BRAND, { recursive: true }),
  mkdir(DESKTOP_ICONS, { recursive: true }),
  mkdir(WEB_APP, { recursive: true }),
]);

const master = masterSvg();
const fg = foregroundSvg(false);
const mono = foregroundSvg(true);

// Master source of truth (committed)
await writeFile(path.join(BRAND, "icon.svg"), master);
console.log("wrote assets/brand/icon.svg");

// Desktop (electron-builder): multi-size .ico for win, big png for mac/linux
const icoSizes = [16, 24, 32, 48, 64, 128, 256];
const icoPngs = await Promise.all(icoSizes.map((s) => renderPng(master, s)));
await writeFile(
  path.join(DESKTOP_ICONS, "icon.ico"),
  await pngToIco(icoPngs),
);
console.log(`wrote assets/icons/icon.ico (${icoSizes.join("/")})`);
await writePng(master, path.join(DESKTOP_ICONS, "icon.png"), 1024);

// Web (Next.js app-router metadata files)
await writeFile(
  path.join(WEB_APP, "favicon.ico"),
  await pngToIco(await Promise.all([16, 32, 48].map((s) => renderPng(master, s)))),
);
console.log("wrote apps/web/app/favicon.ico (16/32/48)");
await writePng(master, path.join(WEB_APP, "icon.png"), 512);
await writePng(master, path.join(WEB_APP, "apple-icon.png"), 180);

// Mobile (Expo)
await writePng(master, path.join(MOBILE_ASSETS, "icon.png"), 1024);
await writePng(fg, path.join(MOBILE_ASSETS, "android-icon-foreground.png"), 1024);
await writePng(master, path.join(MOBILE_ASSETS, "android-icon-background.png"), 1024);
await writePng(mono, path.join(MOBILE_ASSETS, "android-icon-monochrome.png"), 1024);
await writePng(fg, path.join(MOBILE_ASSETS, "splash-icon.png"), 512);
await writePng(master, path.join(MOBILE_ASSETS, "favicon.png"), 48);

console.log("done");

import { spawn } from "node:child_process";
import { copyFile, access, rm, stat } from "node:fs/promises";
import { mkdtemp } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { tmpdir } from "node:os";
import { createRequire } from "node:module";

/**
 * Builds a fresh resume.pdf by printing the deployed /cv page with
 * headless Edge (or Chrome). Zero new dependencies.
 *
 * Usage: npm run cv:pdf   (expects `npm run build` to have been run)
 */

const ROOT = process.cwd();
const WEB_DIR = path.join(ROOT, "apps", "web");
const OUT = path.join(WEB_DIR, "public", "assets", "resume.pdf");
const PORT = 34577;
const URL_BASE = `http://127.0.0.1:${PORT}`;

const CANDIDATES = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/microsoft-edge",
  "/usr/bin/google-chrome",
];

async function findBrowser() {
  for (const candidate of CANDIDATES) {
    try {
      await access(candidate);
      return candidate;
    } catch {}
  }
  throw new Error("No Edge/Chrome executable found for --print-to-pdf.");
}

function waitForServer(url, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const res = await fetch(url);
        if (res.ok) return resolve();
      } catch {}
      if (Date.now() > deadline) return reject(new Error("Server did not start in time."));
      setTimeout(tick, 500);
    };
    tick();
  });
}

const browser = await findBrowser();
console.log(`browser: ${browser}`);

const requireFromWeb = createRequire(path.join(WEB_DIR, "package.json"));
const nextBin = path.join(path.dirname(requireFromWeb.resolve("next/package.json")), "dist", "bin", "next");

const server = spawn(process.execPath, [nextBin, "start", "-p", String(PORT)], {
  cwd: WEB_DIR,
  stdio: ["ignore", "pipe", "pipe"],
});
server.stderr.on("data", (chunk) => process.stderr.write(chunk));

try {
  await waitForServer(`${URL_BASE}/cv`);
  console.log(`server up: ${URL_BASE}/cv`);

  const profileDir = await mkdtemp(path.join(tmpdir(), "cv-pdf-"));
  const tmpPdf = path.join(profileDir, "resume.pdf");

  const exitCode = await new Promise((resolve) => {
    const child = spawn(
      browser,
      [
        "--headless",
        "--disable-gpu",
        "--no-first-run",
        "--disable-extensions",
        `--user-data-dir=${profileDir}`,
        "--no-pdf-header-footer",
        "--virtual-time-budget=15000",
        `--print-to-pdf=${tmpPdf}`,
        `${URL_BASE}/cv`,
      ],
      { stdio: "ignore" }
    );
    const timeout = setTimeout(() => {
      console.error("print timed out, killing browser");
      child.kill();
      resolve(1);
    }, 60000);
    child.on("exit", (code) => {
      clearTimeout(timeout);
      resolve(code ?? 0);
    });
  });

  if (exitCode !== 0) throw new Error(`Browser exited with code ${exitCode}.`);

  const info = await stat(tmpPdf);
  if (info.size < 10_000) throw new Error(`PDF suspiciously small (${info.size} bytes).`);

  await copyFile(tmpPdf, OUT);
  console.log(`wrote ${path.relative(ROOT, OUT)} (${(info.size / 1024).toFixed(0)} KB)`);
  await rm(profileDir, { recursive: true, force: true });
} finally {
  server.kill();
  if (process.platform === "win32") {
    // next start spawns a child on Windows; make sure the port is freed
    spawn("taskkill", ["/F", "/T", "/PID", String(server.pid)], { stdio: "ignore" });
  }
}

import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { spawn } from 'node:child_process';
import net from 'node:net';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DESKTOP_DIR = path.resolve(__dirname, '..');
const APPS_DIR = path.resolve(DESKTOP_DIR, '..');
const WEB_DIR = path.join(APPS_DIR, 'web');
const REPO_ROOT = path.resolve(APPS_DIR, '..');

const BASE_PORT = 34567;
const WINDOW_BG = '#0d1515';
const OVERLAY = {
  dark: { color: '#151d1d', symbolColor: '#e6e6e6', height: 40 },
  light: { color: '#eeeeee', symbolColor: '#111111', height: 40 },
};

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let win = null;
let serverChild = null;

function killServerChild() {
  if (serverChild && !serverChild.killed) {
    serverChild.kill();
  }
  serverChild = null;
}

function probeFreePort(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: '127.0.0.1' });
    const settle = (busy) => {
      socket.destroy();
      if (busy && port < BASE_PORT + 20) {
        resolve(probeFreePort(port + 1));
      } else {
        resolve(port);
      }
    };
    socket.once('connect', () => settle(true));
    socket.once('error', () => settle(false));
  });
}

function waitForServer(url, timeoutMs = 45000) {
  const startedAt = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.once('error', () => {
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error(`Next server did not become reachable at ${url}`));
        } else {
          setTimeout(attempt, 300);
        }
      });
    };
    attempt();
  });
}

function findNextCli() {
  const candidates = [
    path.join(REPO_ROOT, 'node_modules', 'next', 'dist', 'bin', 'next'),
    path.join(WEB_DIR, 'node_modules', 'next', 'dist', 'bin', 'next'),
  ];
  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) {
    throw new Error('Could not locate the next CLI — run npm install first.');
  }
  return found;
}

function startDevServer(port) {
  const cli = findNextCli();
  serverChild = spawn(process.execPath, [cli, 'dev', '-p', String(port)], {
    cwd: WEB_DIR,
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
    stdio: 'inherit',
  });
  serverChild.once('exit', () => {
    if (!win?.isDestroyed() && !app.isQuitting) {
      app.quit();
    }
  });
}

function startProdServer(port) {
  const standaloneRoot = app.isPackaged
    ? path.join(process.resourcesPath, 'standalone')
    : path.join(WEB_DIR, '.next', 'standalone');
  const serverEntry = path.join(standaloneRoot, 'apps', 'web', 'server.js');

  if (!fs.existsSync(serverEntry)) {
    throw new Error(
      `Standalone server not found at ${serverEntry} — run "npm run build" in apps/desktop first.`
    );
  }

  serverChild = spawn(process.execPath, [serverEntry], {
    cwd: path.dirname(serverEntry),
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      NODE_ENV: 'production',
      PORT: String(port),
      HOSTNAME: '127.0.0.1',
    },
    stdio: 'inherit',
  });
  serverChild.once('exit', () => {
    if (!win?.isDestroyed() && !app.isQuitting) {
      app.quit();
    }
  });
}

function applyOverlayTheme(theme) {
  if (process.platform !== 'win32' || !win || win.isDestroyed()) return;
  try {
    win.setTitleBarOverlay(theme === 'light' ? OVERLAY.light : OVERLAY.dark);
  } catch {}
}

function createWindow(port) {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: WINDOW_BG,
    show: false,
    titleBarStyle: process.platform === 'linux' ? 'default' : 'hidden',
    ...(process.platform === 'win32'
      ? { titleBarOverlay: OVERLAY.dark }
      : {}),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.once('ready-to-show', () => win.show());

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  win.loadURL(`http://127.0.0.1:${port}`);
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.whenReady().then(async () => {
    try {
      const port = await probeFreePort(BASE_PORT);

      if (isDev) {
        startDevServer(port);
      } else {
        startProdServer(port);
      }

      await waitForServer(`http://127.0.0.1:${port}`);
      createWindow(port);
    } catch (err) {
      console.error('[desktop] failed to start:', err);
      killServerChild();
      app.quit();
    }
  });

  ipcMain.on('theme-changed', (_event, theme) => {
    applyOverlayTheme(theme);
  });

  app.on('before-quit', () => {
    app.isQuitting = true;
    killServerChild();
  });

  app.on('quit', killServerChild);

  app.on('window-all-closed', () => {
    app.quit();
  });
}

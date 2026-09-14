const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isDesktop: true,
  platform: process.platform,
  setTheme: (theme) => ipcRenderer.send('theme-changed', theme),
  checkForUpdate: () => ipcRenderer.send('check-for-update'),
  installUpdate: () => ipcRenderer.send('install-update'),
  onUpdateAvailable: (cb) => ipcRenderer.on('update-available', () => cb()),
  onUpdateDownloaded: (cb) => ipcRenderer.on('update-downloaded', () => cb()),
});

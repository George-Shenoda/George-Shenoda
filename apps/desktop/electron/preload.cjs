const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isDesktop: true,
  platform: process.platform,
  setTheme: (theme) => ipcRenderer.send('theme-changed', theme),
});

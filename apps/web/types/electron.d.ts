export type ElectronAPI = {
  isDesktop: true;
  platform: NodeJS.Platform;
  setTheme: (theme: string) => void;
  checkForUpdate: () => void;
  installUpdate: () => void;
  onUpdateAvailable: (cb: () => void) => void;
  onUpdateDownloaded: (cb: () => void) => void;
};

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};

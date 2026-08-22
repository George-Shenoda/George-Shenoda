export type ElectronAPI = {
  isDesktop: true;
  platform: NodeJS.Platform;
  setTheme: (theme: string) => void;
};

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};

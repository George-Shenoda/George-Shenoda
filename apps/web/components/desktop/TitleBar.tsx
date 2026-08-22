'use client';

import { useSyncExternalStore } from 'react';

const OVERLAY_FALLBACK_HEIGHT = 40;

const emptySubscribe = () => () => {};
const getClientSnapshot = () => window.electronAPI?.isDesktop === true;
const getServerSnapshot = () => false;

function TitleBar() {
  const isDesktop = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  if (!isDesktop) return null;

  return (
    <>
      <div
        aria-hidden
        style={{
          height: `env(titlebar-area-height, ${OVERLAY_FALLBACK_HEIGHT}px)`,
        }}
      />
      <div
        className="fixed top-0 left-0 z-50 flex items-center px-4 dark:bg-[#151d1d] bg-[#eee] dark:text-white/90 text-black/90 select-none"
        style={{
          height: `env(titlebar-area-height, ${OVERLAY_FALLBACK_HEIGHT}px)`,
          width: `env(titlebar-area-width, 100%)`,
          marginLeft: `env(titlebar-area-x, 0)`,
          WebkitAppRegion: 'drag',
        } as React.CSSProperties}
      >
        <span className="text-xs font-mono tracking-widest uppercase">
          George Shenoda
        </span>
      </div>
    </>
  );
}

export default TitleBar;

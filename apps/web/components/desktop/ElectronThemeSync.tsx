'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

function ElectronThemeSync() {
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        if (window.electronAPI?.isDesktop && resolvedTheme) {
            window.electronAPI.setTheme(resolvedTheme);
        }
    }, [resolvedTheme]);

    return null;
}

export default ElectronThemeSync;

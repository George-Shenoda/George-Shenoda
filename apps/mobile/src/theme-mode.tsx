import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { palette, type Palette } from './theme';

export type ThemePreference = 'light' | 'dark' | 'system';

type ThemeModeValue = {
  preference: ThemePreference;
  scheme: 'light' | 'dark';
  setPreference: (preference: ThemePreference) => void;
};

const STORAGE_KEY = 'theme-preference';

const ThemeModeContext = createContext<ThemeModeValue | null>(null);

/** Web parity with next-themes: Light / Dark / System, persisted across launches. */
export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const osScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setPreferenceState(stored);
        }
      })
      .catch(() => {});
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const scheme: 'light' | 'dark' =
    preference === 'system'
      ? osScheme === 'light'
        ? 'light'
        : 'dark'
      : preference;

  const value = useMemo(
    () => ({ preference, scheme, setPreference }),
    [preference, scheme, setPreference]
  );

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode(): ThemeModeValue {
  const value = useContext(ThemeModeContext);
  if (!value) throw new Error('useThemeMode must be used inside <ThemeModeProvider>.');
  return value;
}

export function usePalette(): Palette {
  const { scheme } = useThemeMode();
  return scheme === 'light' ? palette.light : palette.dark;
}

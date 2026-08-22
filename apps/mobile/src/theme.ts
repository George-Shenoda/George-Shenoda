import { theme } from '@portfolio/shared';

const { primary, secondary, tertiary, surfaceLight } = theme.colors;

/**
 * Mirrors apps/web/app/globals.css CSS variables exactly
 * (oklch values converted to hex; bands use the explicit
 * #151d1d / #eee overrides the web navbar/footer hardcode).
 */
export const palette = {
  dark: {
    background: '#0a0a0a',
    section: '#262626',
    card: '#171717',
    band: '#151d1d',
    text: '#fafafa',
    mutedText: '#a1a1a1',
    border: 'rgba(255, 255, 255, 0.10)',
    primary,
    secondary,
    tertiary,
    gradient: [tertiary, secondary] as const,
  },
  light: {
    background: '#ffffff',
    section: '#f8fafc',
    card: '#ffffff',
    band: surfaceLight,
    text: '#0a0a0a',
    mutedText: '#737373',
    border: '#e5e5e5',
    primary,
    secondary,
    tertiary,
    gradient: [primary, secondary] as const,
  },
} as const;

export type Palette = (typeof palette)[keyof typeof palette];

export function usePalette(
  colorScheme: 'light' | 'dark' | null | undefined | 'unspecified'
): Palette {
  return colorScheme === 'light' ? palette.light : palette.dark;
}

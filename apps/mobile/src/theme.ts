import { theme } from '@portfolio/shared';

const { primary, secondary, tertiary } = theme.colors;

/**
 * Mirrors apps/web/app/globals.css CSS variables exactly
 * (oklch values converted to hex; bands use the explicit
 * #eee / #151d1d overrides the web sections hardcode).
 *
 * Audit 2026-08-24: dark bg #0d1515 (was #0a0a0a), card #192020,
 * contact card #161d1d, muted #bec6c6/#4b4b4b, borders per web.
 */
export const palette = {
  dark: {
    background: '#0d1515',
    band: '#151d1d',
    section: '#151d1d',
    card: '#192020',
    contactCard: '#161d1d',
    text: '#fafafa',
    mutedText: '#bec6c6',
    border: 'rgba(255, 255, 255, 0.16)',
    primary,
    secondary,
    tertiary,
    gradient: [tertiary, secondary] as const,
  },
  light: {
    background: '#ffffff',
    band: '#eeeeee',
    section: '#eeeeee',
    card: '#ffffff',
    contactCard: '#ffffff',
    text: '#171717',
    mutedText: '#4b4b4b',
    border: '#d4d4d4',
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

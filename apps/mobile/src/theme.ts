import { theme } from '@portfolio/shared';

const { primary, secondary, tertiary, surfaceLight } = theme.colors;

export const palette = {
  dark: {
    background: theme.colors.surfaceDark1,
    section: theme.colors.surfaceDark2,
    card: theme.colors.surfaceDark3,
    text: '#e6e6e6',
    mutedText: 'rgba(230, 230, 230, 0.6)',
    border: 'rgba(255, 255, 255, 0.1)',
    primary,
    secondary,
    tertiary,
    gradient: [tertiary, secondary] as const,
  },
  light: {
    background: '#ffffff',
    section: surfaceLight,
    card: '#ffffff',
    text: '#111111',
    mutedText: 'rgba(17, 17, 17, 0.6)',
    border: 'rgba(0, 0, 0, 0.08)',
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

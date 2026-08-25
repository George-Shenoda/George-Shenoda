import { theme } from '@portfolio/shared';

const { primary, secondary, tertiary } = theme.colors;

/**
 * Mirrors apps/web/app/globals.css CSS variables exactly
 * (oklch values converted to hex; bands use the explicit
 * #eee / #151d1d overrides the web sections hardcode).
 *
 * Audit 2026-08-24: dark bg #0d1515 (was #0a0a0a), card #192020,
 * contact card #161d1d, muted #bec6c6/#4b4b4b, borders per web.
 *
 * Step 13 additions mirror component-level web tokens: card borders
 * (black/10 · white/10), input borders (gray-300 · gray-600),
 * destructive (red-600 · red-400), popover surface, navbar tint
 * (#eeeeeef2 · #151d1dee) and the hero dot-grid ink (--border).
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
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    inputBorder: '#525252',
    accent: '#2e2e2e',
    destructive: '#f87171',
    destructiveTint: 'rgba(248, 113, 113, 0.2)',
    popover: '#262626',
    emerald: '#10b981',
    emeraldTint: 'rgba(16, 185, 129, 0.2)',
    navbarBg: 'rgba(21, 29, 29, 0.93)',
    glow: 'rgba(15, 113, 115, 0.2)',
    dot: 'rgba(255, 255, 255, 0.16)',
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
    cardBorder: 'rgba(0, 0, 0, 0.1)',
    inputBorder: '#d4d4d4',
    accent: '#f5f5f5',
    destructive: '#dc2626',
    destructiveTint: 'rgba(220, 38, 38, 0.1)',
    popover: '#ffffff',
    emerald: '#10b981',
    emeraldTint: 'rgba(16, 185, 129, 0.1)',
    navbarBg: 'rgba(238, 238, 238, 0.95)',
    glow: 'rgba(15, 113, 115, 0.1)',
    dot: '#d4d4d4',
    primary,
    secondary,
    tertiary,
    gradient: [primary, secondary] as const,
  },
} as const;

export type Palette = (typeof palette)[keyof typeof palette];

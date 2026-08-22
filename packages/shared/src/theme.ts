export const theme = {
  colors: {
    primary: "#0f7173",
    secondary: "#0e7490",
    tertiary: "#00f5ff",
    surfaceDark1: "#0d1515",
    surfaceDark2: "#151d1d",
    surfaceDark3: "#192020",
    surfaceLight: "#eee",
    overlayBg: "#151d1d",
    overlaySymbol: "#e6e6e6",
  },
  fonts: {
    sans: "Plus Jakarta Sans",
    mono: "JetBrains Mono",
  },
} as const;

export type Theme = typeof theme;

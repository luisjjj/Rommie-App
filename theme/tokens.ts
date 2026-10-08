// Roomie design tokens — warm, friendly, modern. Light-first, dark-ready.
export const colors = {
  // Brand
  forest: '#1B4332',       // primary brand / important actions
  forestDeep: '#143626',
  forestSoft: '#E6EFE8',
  cream: '#FAF6EE',         // primary light background
  creamDark: '#F1E9D7',
  charcoal: '#22271F',      // main text
  gray: '#6B7280',          // secondary text
  grayLight: '#E5E1D8',     // dividers
  grayMuted: '#F4F1E9',     // muted surfaces
  yellow: '#F2B705',        // highlights / badges / playful accents
  yellowSoft: '#FCEFB4',
  white: '#FFFFFF',
  danger: '#C0392B',
  success: '#2D6A4F',
  // Dark-mode ready (future)
  darkBg: '#131714',
  darkSurface: '#1D231F',
  darkText: '#F4F1E9',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

export const radii = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
} as const;

export const typography = {
  display: { fontSize: 30, lineHeight: 36, fontWeight: '800' as const },
  h1: { fontSize: 24, lineHeight: 30, fontWeight: '800' as const },
  h2: { fontSize: 20, lineHeight: 26, fontWeight: '700' as const },
  h3: { fontSize: 17, lineHeight: 22, fontWeight: '700' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
} as const;

export const shadows = {
  card: {
    shadowColor: '#22271F',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
} as const;

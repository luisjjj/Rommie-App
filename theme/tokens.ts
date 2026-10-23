// Roomie design tokens — warm, friendly, modern. Light-first, dark-ready.
export const colors = {
  // Brand
  forest: '#1B4332',       // primary brand / important actions
  forestDeep: '#143626',
  forestSoft: '#E6EFE8',
  lime: '#C8F04B',          // accent of the moment: match badges, CTAs, highlights
  limeSoft: '#EDF9CF',
  tangerine: '#F2762E',     // playful color-block shapes
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

// Typefaces — loaded once in app/_layout.tsx via expo-font.
// display = chunky expressive grotesque for hero moments; sans = UI text.
export const fonts = {
  display: 'BricolageGrotesque_800ExtraBold',
  sans: 'Manrope_400Regular',
  sansMedium: 'Manrope_500Medium',
  sansSemi: 'Manrope_600SemiBold',
  sansExtra: 'Manrope_800ExtraBold',
} as const;

export const typography = {
  // Hero moments: landing, screen titles, big stats. Tight, chunky, loud.
  hero: { fontFamily: fonts.display, fontSize: 56, lineHeight: 54, letterSpacing: -1, color: colors.charcoal },
  heroSmall: { fontFamily: fonts.display, fontSize: 40, lineHeight: 38, letterSpacing: -0.5, color: colors.charcoal },
  display: { fontFamily: fonts.display, fontSize: 32, lineHeight: 34, letterSpacing: -0.5, color: colors.charcoal },
  h1: { fontFamily: fonts.display, fontSize: 30, lineHeight: 33, letterSpacing: -0.3, color: colors.charcoal },
  h2: { fontFamily: fonts.sansExtra, fontSize: 20, lineHeight: 26, color: colors.charcoal },
  h3: { fontFamily: fonts.sansSemi, fontSize: 17, lineHeight: 22, color: colors.charcoal },
  stat: { fontFamily: fonts.display, fontSize: 24, lineHeight: 26, color: colors.charcoal },
  body: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, color: colors.gray },
  bodySmall: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: colors.gray },
  chip: { fontFamily: fonts.sansSemi, fontSize: 14, lineHeight: 18 },
  caption: { fontFamily: fonts.sansMedium, fontSize: 12, lineHeight: 16, color: colors.gray },
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

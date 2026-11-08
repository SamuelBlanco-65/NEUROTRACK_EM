// Espaciado y radios del export de Stitch (valores en rem → dp, 1rem = 16dp).
export const Spacing = {
  xs: 6, // space-xs
  sm: 12, // space-sm
  md: 16, // space-md / gutter
  lg: 24, // space-lg
  xl: 36, // space-xl
  margin: 20, // margin-mobile
} as const;

export const Radius = {
  default: 16, // 1rem
  lg: 32, // 2rem
  xl: 48, // 3rem
  full: 9999,
} as const;

// RNF-005: área táctil mínima 44x44 pt / 48x48 dp.
export const MinTouchSize = 48;

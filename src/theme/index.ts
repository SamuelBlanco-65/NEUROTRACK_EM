import { useColorScheme as useSystemColorScheme } from '@/hooks/use-color-scheme';
import { useAppSelector } from '@/store/hooks';
import { TEXT_SCALE_MULTIPLIER } from '@/store/slices/settings-slice';
import { applyHighContrast, DarkColors, LightColors, type ResolvedColorRoles } from './colors';

export { applyHighContrast, DarkColors, LightColors } from './colors';
export type { ColorRoleName, ColorRoles, ResolvedColorRoles } from './colors';
export { Radius, MinTouchSize, Spacing } from './spacing';
export { FontFamily, TypeScale } from './typography';
export type { TypeScaleName } from './typography';

/** Resuelve el esquema de color efectivo: preferencia guardada o el del sistema (RNF-007). */
export function useAppColorScheme(): 'light' | 'dark' {
  const systemScheme = useSystemColorScheme();
  const preference = useAppSelector((state) => state.settings.colorScheme);
  if (preference === 'light' || preference === 'dark') return preference;
  return systemScheme === 'dark' ? 'dark' : 'light';
}

/** Tokens de color resueltos para el esquema activo, con alto contraste si está activado. */
export function useThemeColors(): ResolvedColorRoles {
  const scheme = useAppColorScheme();
  const highContrast = useAppSelector((state) => state.settings.highContrast);
  const base = scheme === 'dark' ? DarkColors : LightColors;
  return highContrast ? applyHighContrast(base, scheme) : base;
}

/** Multiplicador de tamaño de texto elegido en Accesibilidad, además del que ya aplica el SO. */
export function useTextScaleMultiplier(): number {
  const textScale = useAppSelector((state) => state.settings.textScale);
  return TEXT_SCALE_MULTIPLIER[textScale];
}

/** Si el usuario pidió reducir animaciones/transiciones transitorias (Accesibilidad). */
export function useReduceMotion(): boolean {
  return useAppSelector((state) => state.settings.reduceMotion);
}

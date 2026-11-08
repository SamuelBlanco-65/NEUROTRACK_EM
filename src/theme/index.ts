import { useColorScheme as useSystemColorScheme } from '@/hooks/use-color-scheme';
import { useAppSelector } from '@/store/hooks';
import { DarkColors, LightColors } from './colors';

export { DarkColors, LightColors } from './colors';
export type { ColorRoleName, ColorRoles } from './colors';
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

/** Tokens de color resueltos para el esquema activo. */
export function useThemeColors() {
  const scheme = useAppColorScheme();
  return scheme === 'dark' ? DarkColors : LightColors;
}

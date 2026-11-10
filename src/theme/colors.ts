/**
 * Paleta Material 3 exportada de Stitch (ver docs/diseno/stitch-export/*\/code.html).
 * El esquema oscuro no vino en el export; se deriva de los roles `inverse-*` que sí
 * trae la paleta clara (son, por convención M3, el "otro esquema" visto desde el claro).
 * Validado por `accessibility-reviewer` (RNF-003, RNF-007): todos los pares texto/fondo
 * en uso superan 4.5:1 en ambos esquemas. Única nota: `onPrimaryContainer` sobre
 * `primaryContainer` en claro da 4.54:1 (justo en el límite); sin uso actual como texto,
 * pero si se usa en el futuro conviene separar un poco más la luminosidad de ese par.
 */

export const LightColors = {
  primary: '#00424d',
  onPrimary: '#ffffff',
  primaryContainer: '#1e5a66',
  onPrimaryContainer: '#98cfdd',
  secondary: '#526162',
  onSecondary: '#ffffff',
  secondaryContainer: '#d5e6e7',
  onSecondaryContainer: '#576768',
  tertiary: '#46392d',
  onTertiary: '#ffffff',
  tertiaryContainer: '#5e5043',
  onTertiaryContainer: '#d6c3b2',
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  background: '#fcf9f4',
  onBackground: '#1c1c19',
  surface: '#fcf9f4',
  onSurface: '#1c1c19',
  surfaceVariant: '#e5e2dd',
  onSurfaceVariant: '#40484a',
  // Solo para bordes/separadores: sobre `surface` da 4.29:1, por debajo del mínimo de
  // texto (4.5:1, RNF-003). Para texto atenuado usar `onSurfaceVariant` o `secondary`.
  outline: '#70787b',
  outlineVariant: '#bfc8ca',
  surfaceDim: '#dcdad5',
  surfaceBright: '#fcf9f4',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f6f3ee',
  surfaceContainer: '#f0ede9',
  surfaceContainerHigh: '#ebe8e3',
  surfaceContainerHighest: '#e5e2dd',
  inverseSurface: '#31302d',
  inverseOnSurface: '#f3f0eb',
  inversePrimary: '#98cfdd',
  primaryFixed: '#b3ecfa',
  onPrimaryFixed: '#001f25',
  primaryFixedDim: '#98cfdd',
  onPrimaryFixedVariant: '#0b4e5a',
  secondaryFixed: '#d5e6e7',
  onSecondaryFixed: '#0f1e1f',
  secondaryFixedDim: '#b9cacb',
  onSecondaryFixedVariant: '#3a494b',
  tertiaryFixed: '#f3dfcd',
  onTertiaryFixed: '#241a0f',
  tertiaryFixedDim: '#d6c3b2',
  onTertiaryFixedVariant: '#514437',
} as const;

/**
 * Paleta oscura real, tomada del export de Stitch en `artifacts/modo-oscuro-stitch/`
 * (el usuario la generó pidiéndole a Stitch una variante oscura de cada pantalla; la
 * fuente más completa y coherente de las ~35 exportadas es `cuidador_inicio_modo_oscuro`,
 * que trae los 41 roles M3). Reemplaza la primera versión (derivada a mano de los roles
 * `inverse-*`), que el usuario probó en emulador y rechazó: ver nota de "paleta oscura"
 * en `docs/STATUS.md` T6 — las superficies no se aclaraban con la elevación y las tarjetas
 * grandes con rol `tertiaryFixed` se veían como un recorte claro flotando sobre negro.
 *
 * Excepción deliberada a la convención M3 de roles "Fixed" (deberían ser constantes entre
 * esquemas): `tertiaryFixed`/`onTertiaryFixed`/`tertiaryFixedDim`/`onTertiaryFixedVariant`
 * SÍ cambian aquí. Es justo el problema de arriba — en light-mode-only estos roles están
 * pensados para acentos pequeños (ver comentario de T6), pero esta app los usa también para
 * tarjetas grandes (tip de "Un paso a la vez", "¿Necesitas hablar con alguien?", banner de
 * tranquilidad del wizard). El propio export oscuro de Stitch para esas pantallas (overrides
 * en `paciente_inicio_modo_oscuro/code.html`, `paciente_registrar_c_mo_me_siento_paso_2_modo_oscuro/
 * code.html`) confirma el arreglo: en vez de reusar el durazno claro constante, esas tarjetas
 * pasan a un marrón oscuro cálido con texto crema — se adoptan esos valores aquí tal cual.
 */
export const DarkColors = {
  primary: '#6ec6d6',
  onPrimary: '#00363f',
  primaryContainer: '#223a40',
  onPrimaryContainer: '#6ec6d6',
  secondary: '#9eaab2',
  onSecondary: '#1c1c19',
  secondaryContainer: '#29343b',
  onSecondaryContainer: '#d5e6e7',
  tertiary: '#d6c3b2',
  onTertiary: '#241a0f',
  tertiaryContainer: '#5e5043',
  onTertiaryContainer: '#f3dfcd',
  error: '#ffb4ab',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',
  background: '#181b1f',
  onBackground: '#e5e9ee',
  surface: '#181b1f',
  onSurface: '#e5e9ee',
  surfaceVariant: '#2b3037',
  onSurfaceVariant: '#8e98a4',
  outline: '#6e7882',
  outlineVariant: '#3b444c',
  // La escala de elevación que trae el export (surfaceContainer/Low/Lowest todos a ~1-2
  // valores de luminosidad del fondo) deja las tarjetas invisibles sobre negro — se nota
  // en "Tu plan de hoy" de inicio.tsx, que usa `surfaceContainer` para el fondo de cada
  // tarjeta. Separada a mano para que cada nivel se note, conservando el tono frío de base.
  surfaceDim: '#101215',
  surfaceBright: '#383f48',
  surfaceContainerLowest: '#121417',
  surfaceContainerLow: '#1c2024',
  surfaceContainer: '#20262c',
  surfaceContainerHigh: '#272e35',
  surfaceContainerHighest: '#313941',
  inverseSurface: '#fcf9f4',
  inverseOnSurface: '#1c1c19',
  inversePrimary: '#00424d',
  primaryFixed: '#b3ecfa',
  onPrimaryFixed: '#001f25',
  primaryFixedDim: '#98cfdd',
  onPrimaryFixedVariant: '#0b4e5a',
  secondaryFixed: '#d5e6e7',
  onSecondaryFixed: '#0f1e1f',
  secondaryFixedDim: '#b9cacb',
  onSecondaryFixedVariant: '#3a494b',
  // Deliberadamente NO constante entre esquemas — ver comentario de arriba.
  tertiaryFixed: '#30261c',
  onTertiaryFixed: '#f5f1eb',
  tertiaryFixedDim: '#4a3b2a',
  onTertiaryFixedVariant: '#d5c2af',
} as const;

export type ColorRoles = typeof LightColors;
export type ColorRoleName = keyof ColorRoles;
/** Versión "ancha" de `ColorRoles`: mismas claves, valores `string` en vez de literales
 * exactos. Hace falta porque el modo alto contraste combina colores de las dos paletas
 * (claro y oscuro no comparten los mismos literales por rol). */
export type ResolvedColorRoles = Record<ColorRoleName, string>;

/**
 * Modo alto contraste (opt-in desde Accesibilidad, RNF-003/007): sube el contraste de
 * texto/bordes por encima del mínimo AA ya validado, hasta casi AAA (7:1). A diferencia del
 * tema oscuro por defecto, aquí SÍ se usa blanco/negro puro — es una excepción deliberada
 * porque el usuario lo pide explícitamente, no el comportamiento de base de la app.
 */
export function applyHighContrast(colors: ResolvedColorRoles, scheme: 'light' | 'dark'): ResolvedColorRoles {
  if (scheme === 'light') {
    return {
      ...colors,
      onSurface: '#000000',
      onBackground: '#000000',
      onSurfaceVariant: '#000000',
      secondary: '#1c2b2c',
      onSecondaryContainer: '#0f1e1f',
      outline: '#000000',
      outlineVariant: '#3a3a38',
      surface: '#ffffff',
      background: '#ffffff',
      surfaceContainerLowest: '#ffffff',
    };
  }
  return {
    ...colors,
    onSurface: '#ffffff',
    onBackground: '#ffffff',
    onSurfaceVariant: '#ffffff',
    secondary: '#e5e2dd',
    onSecondaryContainer: '#f3f0eb',
    outline: '#ffffff',
    outlineVariant: '#c7c7c5',
    surface: '#000000',
    background: '#000000',
    surfaceContainerLowest: '#000000',
  };
}

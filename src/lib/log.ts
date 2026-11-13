/**
 * Registro de errores inesperados. Son datos de salud: no se imprime el objeto del error completo
 * (puede traer filas o textos de la consulta), solo su nombre y código, y solo en desarrollo.
 */
export function logUnexpected(scope: string, error: unknown): void {
  if (!__DEV__) return;
  const name = error instanceof Error ? error.name : typeof error;
  const code =
    typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : '';
  console.warn(`[${scope}] error inesperado`, name, code);
}

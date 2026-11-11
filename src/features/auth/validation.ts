/** Forma mínima de un correo (algo@dominio.ext, sin espacios). La validación real la hace Supabase. */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

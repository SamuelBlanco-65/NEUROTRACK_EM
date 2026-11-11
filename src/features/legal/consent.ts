import { LEGAL_VERSION } from './documents';

/**
 * Constancia de la autorización que la persona da al crear su cuenta (términos y tratamiento de datos de
 * salud). Se envía en los metadatos del registro; la fecha del servidor queda además en `created_at`.
 */
export function buildConsentMetadata(now: Date = new Date()): {
  accepted_terms_at: string;
  accepted_terms_version: string;
} {
  return { accepted_terms_at: now.toISOString(), accepted_terms_version: LEGAL_VERSION };
}

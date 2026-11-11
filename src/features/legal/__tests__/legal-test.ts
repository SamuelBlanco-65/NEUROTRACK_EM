import { buildConsentMetadata } from '../consent';
import { LEGAL_DOCUMENTS, LEGAL_VERSION, SUPPORT_EMAIL, isLegalDocId } from '../documents';

const allText = (id: 'terminos' | 'privacidad') =>
  LEGAL_DOCUMENTS[id].sections.flatMap((s) => [s.heading, ...s.body]).join('\n');

describe('documentos legales', () => {
  it('usan un correo de contacto y no un enlace a GitHub', () => {
    expect(SUPPORT_EMAIL).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    for (const id of ['terminos', 'privacidad'] as const) {
      expect(allText(id)).not.toMatch(/github\.com/i);
      expect(allText(id)).toContain(SUPPORT_EMAIL);
    }
  });

  it('la política identifica al responsable, los terceros, la retención y los plazos', () => {
    const texto = allText('privacidad');
    expect(texto).toMatch(/responsable del tratamiento/i);
    expect(texto).toMatch(/Supabase/);
    expect(texto).toMatch(/Gmail/);
    expect(texto).toMatch(/Vercel/);
    expect(texto).toMatch(/otro país/);
    expect(texto).toMatch(/Cuánto tiempo/);
    expect(texto).toMatch(/10 días hábiles/);
    expect(texto).toMatch(/15 días hábiles/);
  });

  it('exigen mayoría de edad sin excepciones', () => {
    const texto = allText('terminos');
    expect(texto).toMatch(/mayor de 18 años/);
    expect(texto).not.toMatch(/persona adulta responsable/);
  });

  it('no dejan secciones vacías ni encabezados repetidos', () => {
    for (const doc of Object.values(LEGAL_DOCUMENTS)) {
      const headings = doc.sections.map((s) => s.heading);
      expect(new Set(headings).size).toBe(headings.length);
      for (const section of doc.sections) expect(section.body.length).toBeGreaterThan(0);
    }
  });

  it('isLegalDocId solo acepta los dos documentos', () => {
    expect(isLegalDocId('terminos')).toBe(true);
    expect(isLegalDocId('privacidad')).toBe(true);
    expect(isLegalDocId('otro')).toBe(false);
    expect(isLegalDocId(undefined)).toBe(false);
  });
});

describe('buildConsentMetadata', () => {
  it('guarda la fecha en ISO y la versión vigente de los documentos', () => {
    const meta = buildConsentMetadata(new Date('2026-11-11T15:30:00.000Z'));
    expect(meta).toEqual({
      accepted_terms_at: '2026-11-11T15:30:00.000Z',
      accepted_terms_version: LEGAL_VERSION,
    });
  });
});

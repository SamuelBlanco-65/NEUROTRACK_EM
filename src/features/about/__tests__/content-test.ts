import {
  ABOUT_AUDIENCES,
  ABOUT_COMFORT,
  ABOUT_FAQ,
  ABOUT_FEATURES,
  ABOUT_PRIVACY,
  ABOUT_STEPS,
} from '../content';

function ids(items: { id: string }[]): string[] {
  return items.map((item) => item.id);
}

describe('contenido de «¿Qué es Neurotrack EM?»', () => {
  it('no repite ids dentro de cada lista', () => {
    for (const list of [ABOUT_AUDIENCES, ABOUT_FEATURES, ABOUT_COMFORT, ABOUT_FAQ]) {
      expect(new Set(ids(list)).size).toBe(list.length);
    }
  });

  it('mantiene los textos cortos (baja fatiga, RNF-010)', () => {
    for (const item of [...ABOUT_AUDIENCES, ...ABOUT_FEATURES]) {
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.text.length).toBeLessThanOrEqual(120);
    }
    for (const faq of ABOUT_FAQ) {
      expect(faq.question.length).toBeGreaterThan(0);
      expect(faq.answer.length).toBeLessThanOrEqual(160);
    }
    for (const line of [...ABOUT_PRIVACY, ...ABOUT_STEPS]) {
      expect(line.length).toBeLessThanOrEqual(120);
    }
  });

  it('incluye la aclaración de que no reemplaza al médico', () => {
    const medico = ABOUT_FAQ.find((faq) => faq.id === 'medico');
    expect(medico?.answer).toMatch(/no diagnostica/i);
  });
});

import { dayDetailScript, guideScript, homeScript, progressScript, screenIntroScript } from '../screen-scripts';
import { splitForSpeech } from '../voice';

describe('guiones de pantallas principales', () => {
  it('screenIntroScript lee título, pista y opciones sin duplicar puntuación', () => {
    const text = screenIntroScript('¿Qué estás sintiendo?', 'Elige lo que más se acerque.', [
      { title: 'Fatiga', description: 'Cansancio o falta de energía' },
      { title: 'Dolor', description: 'Molestia física' },
    ]);
    expect(text).toBe(
      '¿Qué estás sintiendo? Elige lo que más se acerque. Las opciones son: Fatiga, cansancio o falta de energía. Dolor, molestia física.'
    );
  });

  it('screenIntroScript sin opciones solo lee título y pista', () => {
    expect(screenIntroScript('¿Quieres agregar algo?', 'Es opcional')).toBe('¿Quieres agregar algo? Es opcional.');
  });

  it('homeScript incluye el plan de hoy, o avisa que no hay recordatorios', () => {
    const withPlan = homeScript({
      greeting: 'Hola, Ana',
      dateLabel: 'Lunes 9 de noviembre',
      reminders: [{ time: '8:00 a. m.', title: 'Tomar medicación' }],
    });
    expect(withPlan).toContain('Hola, Ana. Lunes 9 de noviembre.');
    expect(withPlan).toContain('A las 8:00 a. m., Tomar medicación.');
    const empty = homeScript({ greeting: 'Hola', dateLabel: 'Martes', reminders: [] });
    expect(empty).toContain('No tienes recordatorios para hoy.');
    expect(empty).not.toContain('Tu plan de hoy');
  });

  it('homeScript lee el mensaje de ánimo solo si existe', () => {
    const base = { greeting: 'Hola', dateLabel: 'Martes', reminders: [] };
    expect(homeScript({ ...base, cheer: 'Estoy contigo' })).toContain('Tienes un mensaje de ánimo: Estoy contigo.');
    expect(homeScript({ ...base, cheer: null })).not.toContain('mensaje de ánimo');
  });

  it('dayDetailScript: día vacío, un registro y varios con nota', () => {
    expect(dayDetailScript('lunes 9 de noviembre', [])).toBe('lunes 9 de noviembre. Sin síntomas registrados este día.');
    const text = dayDetailScript('lunes 9 de noviembre', [
      { type: 'Fatiga', severity: 'Moderado', time: '3:00 p. m.', note: 'Dormí poco' },
      { type: 'Dolor', severity: 'Leve', time: '6:30 p. m.', note: null },
    ]);
    expect(text).toContain('2 registros.');
    expect(text).toContain('Fatiga, intensidad moderado, a las 3:00 p. m. Nota: Dormí poco.');
    expect(text).toContain('Dolor, intensidad leve, a las 6:30 p. m.');
    expect(dayDetailScript('hoy', [{ type: 'Dolor', severity: 'Leve', time: '1:00 p. m.', note: null }])).toContain(
      '1 registro.'
    );
  });

  it('progressScript lee el titular y cada patrón; sin patrones, solo el titular', () => {
    expect(progressScript('Este es tu progreso.', [])).toBe('Este es tu progreso.');
    expect(progressScript('Va bien', [{ title: 'Constancia', description: 'Registraste 5 días' }])).toBe(
      'Va bien. Lo que notamos: Constancia. Registraste 5 días.'
    );
  });

  it('guideScript une título, resumen y todos los párrafos', () => {
    expect(
      guideScript({ title: 'Respirar', summary: 'Una pausa breve', body: ['Inhala lento', 'Exhala despacio.'] })
    ).toBe('Respirar. Una pausa breve. Inhala lento. Exhala despacio.');
  });
});

describe('splitForSpeech', () => {
  it('deja intacto un texto corto', () => {
    expect(splitForSpeech('Hola. Esto es corto.', 100)).toEqual(['Hola. Esto es corto.']);
  });

  it('parte por frases sin pasar del máximo y sin perder texto', () => {
    const text = 'Primera frase larga. Segunda frase larga. Tercera frase larga.';
    const chunks = splitForSpeech(text, 45);
    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach((chunk) => expect(chunk.length).toBeLessThanOrEqual(45));
    expect(chunks.join(' ')).toBe(text);
  });

  it('corta una frase sola demasiado larga en un espacio', () => {
    const chunks = splitForSpeech('uno dos tres cuatro cinco seis siete', 12);
    chunks.forEach((chunk) => expect(chunk.length).toBeLessThanOrEqual(12));
    expect(chunks.join(' ')).toBe('uno dos tres cuatro cinco seis siete');
  });

  it('trata los saltos de línea como límite de frase y descarta vacíos', () => {
    expect(splitForSpeech('Uno\n\nDos', 100)).toEqual(['Uno Dos']);
    expect(splitForSpeech('   ', 100)).toEqual([]);
  });
});

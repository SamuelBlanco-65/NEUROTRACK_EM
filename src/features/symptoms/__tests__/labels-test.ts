import { symptomDisplayLabel } from '../constants';

describe('symptomDisplayLabel', () => {
  it('muestra la etiqueta estándar de los síntomas de siempre', () => {
    expect(symptomDisplayLabel('fatiga')).toBe('Fatiga');
    expect(symptomDisplayLabel('dolor', 'no se usa')).toBe('Dolor');
  });

  it('en «otro» muestra lo que el paciente escribió', () => {
    expect(symptomDisplayLabel('otro', '  Hormigueo en la mano  ')).toBe('Hormigueo en la mano');
  });

  it('en «otro» sin texto queda como «Otro»', () => {
    expect(symptomDisplayLabel('otro')).toBe('Otro');
    expect(symptomDisplayLabel('otro', null)).toBe('Otro');
    expect(symptomDisplayLabel('otro', '   ')).toBe('Otro');
  });
});

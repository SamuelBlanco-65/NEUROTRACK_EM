import { chooseSpanishVoice } from '../voice';

describe('chooseSpanishVoice', () => {
  it('prefiere español de Colombia sobre cualquier otro', () => {
    const voices = [
      { identifier: 'mx', language: 'es-MX' },
      { identifier: 'co', language: 'es-CO' },
      { identifier: 'en', language: 'en-US' },
    ];
    expect(chooseSpanishVoice(voices)).toBe('co');
  });

  it('acepta guion bajo (formato de Android) y mayúsculas distintas', () => {
    expect(chooseSpanishVoice([{ identifier: 'a', language: 'es_CO' }])).toBe('a');
    expect(chooseSpanishVoice([{ identifier: 'b', language: 'ES-419' }])).toBe('b');
  });

  it('sigue el orden latinoamericano: es-419, es-US, es-MX', () => {
    expect(
      chooseSpanishVoice([
        { identifier: 'mx', language: 'es-MX' },
        { identifier: 'us', language: 'es-US' },
        { identifier: 'lat', language: 'es-419' },
      ])
    ).toBe('lat');
    expect(
      chooseSpanishVoice([
        { identifier: 'mx', language: 'es-MX' },
        { identifier: 'us', language: 'es-US' },
      ])
    ).toBe('us');
  });

  it('si solo hay otro español (p. ej. es-ES), lo usa en vez de nada', () => {
    expect(chooseSpanishVoice([{ identifier: 'es', language: 'es-ES' }])).toBe('es');
  });

  it('devuelve undefined si no hay ninguna voz en español', () => {
    expect(chooseSpanishVoice([{ identifier: 'en', language: 'en-US' }])).toBeUndefined();
    expect(chooseSpanishVoice([])).toBeUndefined();
  });
});

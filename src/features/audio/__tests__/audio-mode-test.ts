import { logicaOptionsScript, logicaScript, memoriaTapScript, narrationFor } from '../scripts';

type NarrationInput = Parameters<typeof narrationFor>[0];

function logicaSession(): NarrationInput {
  return {
    area: 'logica',
    phase: 'responder',
    roundIndex: 1,
    roundsCorrect: 0,
    newLevel: null,
    lastResult: null,
    memoriaRound: null,
    atencionRound: null,
    logicaRound: { sequence: [3, 5, 7, 9], options: [10, 11, 12, 13] },
    movimientoRound: null,
    completedStepIndices: [],
  };
}

describe('logicaOptionsScript', () => {
  it('nombra las opciones separadas por comas y con «y» antes de la última', () => {
    expect(logicaOptionsScript([12, 14, 15, 18])).toBe('Las opciones son: 12, 14, 15 y 18.');
  });

  it('con una sola opción usa el singular, y sin opciones no dice nada', () => {
    expect(logicaOptionsScript([7])).toBe('La opción es 7.');
    expect(logicaOptionsScript([])).toBe('');
  });
});

describe('logicaScript en la versión auditiva', () => {
  it('sin opciones lee solo la serie (las opciones se ven en pantalla)', () => {
    const text = logicaScript([3, 5, 7, 9]);
    expect(text).toContain('3, 5, 7, 9');
    expect(text).not.toContain('opciones');
  });

  it('con opciones las nombra, porque la serie y las opciones no se ven', () => {
    const text = logicaScript([3, 5, 7, 9], [10, 11, 12, 13]);
    expect(text).toContain('3, 5, 7, 9');
    expect(text).toContain('Las opciones son: 10, 11, 12 y 13.');
  });
});

describe('narrationFor con audioOnly', () => {
  it('por defecto no nombra las opciones de Lógica', () => {
    expect(narrationFor(logicaSession())?.text).not.toContain('opciones');
  });

  it('con audioOnly las incluye y mantiene la misma clave del momento', () => {
    const normal = narrationFor(logicaSession());
    const audio = narrationFor(logicaSession(), { audioOnly: true });
    expect(audio?.text).toContain('Las opciones son: 10, 11, 12 y 13.');
    expect(audio?.key).toBe(normal?.key);
  });
});

describe('memoriaTapScript', () => {
  it('confirma la figura tocada con la primera letra en mayúscula', () => {
    expect(memoriaTapScript('circulo')).toBe('Círculo, bien.');
    expect(memoriaTapScript('triangulo')).toBe('Triángulo, bien.');
  });
});

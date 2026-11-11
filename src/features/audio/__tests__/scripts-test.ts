import {
  MEMORIA_RESPONDER_SCRIPT,
  atencionScript,
  completedScript,
  logicaScript,
  movimientoIntroScript,
  movimientoProgressScript,
  narrationFor,
  resultScript,
  sequenceScript,
} from '../scripts';

type NarrationInput = Parameters<typeof narrationFor>[0];

function session(overrides: Partial<NarrationInput>): NarrationInput {
  return {
    area: 'memoria',
    phase: 'memorizar',
    roundIndex: 0,
    roundsCorrect: 0,
    newLevel: null,
    lastResult: null,
    memoriaRound: null,
    atencionRound: null,
    logicaRound: null,
    movimientoRound: null,
    completedStepIndices: [],
    ...overrides,
  };
}

describe('sequenceScript', () => {
  it('nombra primero, luego y por último, en orden', () => {
    expect(sequenceScript(['circulo', 'cuadrado', 'triangulo'])).toBe(
      'Memoriza esta secuencia. Primero círculo. Luego cuadrado. Por último, triángulo. Tómate el tiempo que necesites.'
    );
  });

  it('con dos figuras no usa "luego"', () => {
    const text = sequenceScript(['circulo', 'diamante']);
    expect(text).toContain('Primero círculo. Por último, diamante.');
    expect(text).not.toContain('Luego');
  });
});

describe('textos de resultado y movimiento', () => {
  it('resultScript distingue acierto y error sin culpar', () => {
    expect(resultScript('correcto')).toBe('¡Bien hecho!');
    expect(resultScript('incorrecto')).toContain('vas avanzando');
  });

  it('atencionScript dice cuántas opciones hay', () => {
    expect(atencionScript(7)).toContain('Hay 7 opciones');
  });

  it('movimientoIntroScript lee todos los pasos numerados desde 1', () => {
    const text = movimientoIntroScript(['Levanta los brazos.', 'Respira hondo.']);
    expect(text).toContain('Paso 1: Levanta los brazos.');
    expect(text).toContain('Paso 2: Respira hondo.');
  });

  it('movimientoProgressScript anuncia el primer paso pendiente, aunque se hayan hecho fuera de orden', () => {
    const steps = ['A', 'B', 'C'];
    expect(movimientoProgressScript(steps, [1])).toBe('Muy bien. Paso 1: A');
    expect(movimientoProgressScript(steps, [0, 2])).toBe('Muy bien. Paso 2: B');
  });

  it('movimientoProgressScript avisa cuando ya no quedan pasos', () => {
    expect(movimientoProgressScript(['A', 'B'], [0, 1])).toContain('Terminaste todos los pasos');
  });

  it('completedScript usa "pasos" en Movimiento y "rondas" en el resto', () => {
    expect(completedScript('movimiento', 4, 4, 2)).toContain('4 de 4 pasos');
    expect(completedScript('memoria', 2, 3, 1)).toContain('2 de 3 rondas');
    expect(completedScript('memoria', 2, 3, 1)).toContain('nivel en Memoria es 1');
  });
});

describe('narrationFor', () => {
  const memoriaRound = { sequence: ['circulo', 'cuadrado'] as ('circulo' | 'cuadrado')[] };

  it('memorizar lee la secuencia', () => {
    const n = narrationFor(session({ phase: 'memorizar', memoriaRound }));
    expect(n?.key).toBe('memorizar-0');
    expect(n?.text).toBe(sequenceScript(memoriaRound.sequence));
  });

  it('la key de Memoria/responder no cambia con cada toque (no repite la lectura)', () => {
    const base = session({ phase: 'responder', memoriaRound });
    const a = narrationFor(base);
    const b = narrationFor({ ...base, roundsCorrect: 0 });
    expect(a?.text).toBe(MEMORIA_RESPONDER_SCRIPT);
    expect(a?.key).toBe(b?.key);
  });

  it('la key cambia entre rondas y entre fases de la misma ronda', () => {
    const keys = [
      narrationFor(session({ phase: 'memorizar', roundIndex: 0, memoriaRound }))?.key,
      narrationFor(session({ phase: 'responder', roundIndex: 0, memoriaRound }))?.key,
      narrationFor(session({ phase: 'memorizar', roundIndex: 1, memoriaRound }))?.key,
    ];
    expect(new Set(keys).size).toBe(3);
  });

  it('Atención/responder lee cuántas opciones hay', () => {
    const n = narrationFor(
      session({ area: 'atencion', phase: 'responder', atencionRound: { options: [1, 2, 3, 4, 5] } })
    );
    expect(n?.text).toBe(atencionScript(5));
  });

  it('resultado lee el veredicto, y no hay nada que leer si aún no hay resultado', () => {
    expect(narrationFor(session({ phase: 'resultado', lastResult: 'correcto' }))?.text).toBe('¡Bien hecho!');
    expect(narrationFor(session({ phase: 'resultado', lastResult: null }))).toBeNull();
  });

  it('Movimiento: introducción sin pasos hechos, aliento + siguiente paso al marcar', () => {
    const movimientoRound = { steps: ['A', 'B'] };
    const start = narrationFor(session({ area: 'movimiento', phase: 'responder', movimientoRound }));
    const after = narrationFor(
      session({ area: 'movimiento', phase: 'responder', movimientoRound, completedStepIndices: [0] })
    );
    expect(start?.text).toBe(movimientoIntroScript(['A', 'B']));
    expect(after?.text).toBe('Muy bien. Paso 2: B');
    expect(start?.key).not.toBe(after?.key);
  });

  it('completada: usa aciertos de pasos en Movimiento y rondas acertadas en el resto', () => {
    const mov = narrationFor(
      session({
        area: 'movimiento',
        phase: 'completada',
        newLevel: 2,
        movimientoRound: { steps: ['A', 'B', 'C'] },
        completedStepIndices: [0, 1, 2],
      })
    );
    expect(mov?.text).toContain('3 de 3 pasos');

    const mem = narrationFor(session({ phase: 'completada', newLevel: 1, roundsCorrect: 2 }));
    expect(mem?.text).toContain('2 de 3 rondas');
  });

  it('completada sin nivel calculado aún no narra', () => {
    expect(narrationFor(session({ phase: 'completada', newLevel: null }))).toBeNull();
  });
});

describe('Lógica (REC-002)', () => {
  it('logicaScript lee la serie completa y pide el siguiente número', () => {
    expect(logicaScript([2, 4, 6, 8])).toBe(
      'Descubre qué número sigue en la serie. 2, 4, 6, 8, y luego, ¿cuál sigue? Tómate tu tiempo, sin prisas.'
    );
  });

  it('narra la serie al responder y cambia de momento por ronda', () => {
    const narration = narrationFor(
      session({ area: 'logica', phase: 'responder', roundIndex: 1, logicaRound: { sequence: [1, 2, 3, 4] } })
    );
    expect(narration?.key).toBe('responder-1');
    expect(narration?.text).toContain('1, 2, 3, 4');
  });
});

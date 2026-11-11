import {
  checkAtencionAnswer,
  checkLogicaAnswer,
  checkMemoriaAnswer,
  generateAtencionRound,
  generateLogicaRound,
  generateMemoriaRound,
  generateMovimientoRound,
  nextLevel,
} from '../logic';
import { MOVIMIENTO_STEP_POOL, ROUNDS_TO_LEVEL_UP } from '../constants';
import type { ShapeId } from '../types';

describe('generateMemoriaRound', () => {
  test('la secuencia crece con el nivel (nivel 1 → 3, nivel 5 → 7)', () => {
    expect(generateMemoriaRound(1).sequence).toHaveLength(3);
    expect(generateMemoriaRound(5).sequence).toHaveLength(7);
  });

  test('un nivel por encima del máximo se recorta a 7', () => {
    expect(generateMemoriaRound(9).sequence).toHaveLength(7);
  });
});

describe('checkMemoriaAnswer', () => {
  test('acierta solo si la respuesta coincide en orden y longitud', () => {
    const round = { sequence: ['circulo', 'cuadrado', 'triangulo'] as ShapeId[] };
    expect(checkMemoriaAnswer(round, ['circulo', 'cuadrado', 'triangulo'])).toBe(true);
    expect(checkMemoriaAnswer(round, ['cuadrado', 'circulo', 'triangulo'])).toBe(false);
    expect(checkMemoriaAnswer(round, ['circulo', 'cuadrado'])).toBe(false);
  });
});

describe('generateAtencionRound', () => {
  test('el número de opciones crece con el nivel (nivel 1 → 5, nivel 5 → 9)', () => {
    expect(generateAtencionRound(1).options).toHaveLength(5);
    expect(generateAtencionRound(5).options).toHaveLength(9);
  });

  test('siempre hay exactamente una opción distinta ("el intruso")', () => {
    const round = generateAtencionRound(3);
    expect(round.options.filter((option) => option.isOdd)).toHaveLength(1);
  });
});

describe('checkAtencionAnswer', () => {
  test('acierta solo si el id elegido es el marcado como intruso', () => {
    const round = generateAtencionRound(2);
    const oddOption = round.options.find((option) => option.isOdd)!;
    const evenOption = round.options.find((option) => !option.isOdd)!;
    expect(checkAtencionAnswer(round, oddOption.id)).toBe(true);
    expect(checkAtencionAnswer(round, evenOption.id)).toBe(false);
  });

  test('un id que no existe no cuenta como acierto', () => {
    const round = generateAtencionRound(2);
    expect(checkAtencionAnswer(round, 'id-inexistente')).toBe(false);
  });
});

describe('generateMovimientoRound', () => {
  test('el número de pasos crece con el nivel (nivel 1 → 3, nivel 4 → 6) sin repetir pasos', () => {
    const round1 = generateMovimientoRound(1);
    expect(round1.steps).toHaveLength(3);
    expect(new Set(round1.steps).size).toBe(3);

    const round4 = generateMovimientoRound(4);
    expect(round4.steps).toHaveLength(6);
    expect(round4.steps.length).toBeLessThanOrEqual(MOVIMIENTO_STEP_POOL.length);
  });
});

describe('nextLevel', () => {
  test('sube de nivel al alcanzar el umbral de rondas correctas', () => {
    expect(nextLevel(1, 5, ROUNDS_TO_LEVEL_UP)).toBe(2);
  });

  test('no sube si no se alcanza el umbral', () => {
    expect(nextLevel(1, 5, ROUNDS_TO_LEVEL_UP - 1)).toBe(1);
  });

  test('no sube más allá del nivel máximo', () => {
    expect(nextLevel(5, 5, ROUNDS_TO_LEVEL_UP)).toBe(5);
  });
});

describe('generateLogicaRound', () => {
  // Generador pseudoaleatorio determinista para que las pruebas no dependan del azar.
  function seeded(seed: number) {
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }

  const LEVELS = [1, 2, 3, 4, 5];

  test.each(LEVELS)('nivel %i: 4 opciones distintas, no negativas y con la respuesta correcta entre ellas', (level) => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const round = generateLogicaRound(level, seeded(seed));
      expect(round.options).toHaveLength(4);
      expect(new Set(round.options).size).toBe(4);
      expect(round.options.every((option) => option >= 0)).toBe(true);
      expect(round.options).toContain(round.answer);
      expect(round.rule.length).toBeGreaterThan(0);
    }
  });

  test('niveles 1-3: la serie es aritmética y la respuesta continúa la regla', () => {
    for (const level of [1, 2, 3]) {
      for (let seed = 1; seed <= 100; seed += 1) {
        const { sequence, answer } = generateLogicaRound(level, seeded(seed));
        const diff = sequence[1] - sequence[0];
        sequence.forEach((value, index) => {
          if (index > 0) expect(value - sequence[index - 1]).toBe(diff);
        });
        expect(answer - sequence[sequence.length - 1]).toBe(diff);
      }
    }
  });

  test('nivel 3 resta (diferencia negativa) y nunca da una respuesta negativa', () => {
    for (let seed = 1; seed <= 100; seed += 1) {
      const { sequence, answer } = generateLogicaRound(3, seeded(seed));
      expect(sequence[1]).toBeLessThan(sequence[0]);
      expect(answer).toBeGreaterThanOrEqual(0);
    }
  });

  test('nivel 4: multiplica por un factor constante', () => {
    for (let seed = 1; seed <= 100; seed += 1) {
      const { sequence, answer } = generateLogicaRound(4, seeded(seed));
      const factor = sequence[1] / sequence[0];
      expect([2, 3]).toContain(factor);
      expect(sequence[3] * factor).toBe(answer);
    }
  });

  test('nivel 5: alterna dos pasos y muestra 5 términos', () => {
    for (let seed = 1; seed <= 100; seed += 1) {
      const { sequence, answer } = generateLogicaRound(5, seeded(seed));
      expect(sequence).toHaveLength(5);
      const a = sequence[1] - sequence[0];
      const b = sequence[2] - sequence[1];
      expect(a).not.toBe(b);
      expect(sequence[3] - sequence[2]).toBe(a);
      expect(sequence[4] - sequence[3]).toBe(b);
      expect(answer - sequence[4]).toBe(a);
    }
  });

  test('un nivel fuera de rango se recorta al rango válido', () => {
    expect(() => generateLogicaRound(0)).not.toThrow();
    expect(generateLogicaRound(9).sequence).toHaveLength(5);
  });
});

describe('checkLogicaAnswer', () => {
  test('solo acierta con la respuesta de la regla', () => {
    const round = generateLogicaRound(1);
    expect(checkLogicaAnswer(round, round.answer)).toBe(true);
    expect(checkLogicaAnswer(round, round.answer + 1000)).toBe(false);
  });
});

import {
  checkAtencionAnswer,
  checkMemoriaAnswer,
  generateAtencionRound,
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

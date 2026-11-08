import { ALL_SHAPES, MOVIMIENTO_STEP_POOL, ROUNDS_TO_LEVEL_UP } from './constants';
import type { AtencionRound, MemoriaRound, MovimientoRound, ShapeId } from './types';

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffled<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Nivel 1 → secuencia de 3 figuras; nivel 5 → secuencia de 7. */
export function generateMemoriaRound(level: number): MemoriaRound {
  const length = Math.min(level, 5) + 2;
  const sequence = Array.from({ length }, () => pickRandom(ALL_SHAPES));
  return { sequence };
}

export function checkMemoriaAnswer(round: MemoriaRound, answer: ShapeId[]): boolean {
  return answer.length === round.sequence.length && answer.every((shape, index) => shape === round.sequence[index]);
}

/** Nivel 1 → 5 opciones; nivel 5 → 9 opciones, una de ellas distinta (el intruso). */
export function generateAtencionRound(level: number): AtencionRound {
  const optionCount = Math.min(level, 5) + 4;
  const baseShape = pickRandom(ALL_SHAPES);
  const oddShape = pickRandom(ALL_SHAPES.filter((shape) => shape !== baseShape));
  const oddIndex = Math.floor(Math.random() * optionCount);

  const options = Array.from({ length: optionCount }, (_, index) => ({
    id: `opcion-${index}`,
    shape: index === oddIndex ? oddShape : baseShape,
    isOdd: index === oddIndex,
  }));

  return { shape: baseShape, options };
}

export function checkAtencionAnswer(round: AtencionRound, optionId: string): boolean {
  return round.options.find((option) => option.id === optionId)?.isOdd ?? false;
}

/** Nivel 1 → 3 pasos; nivel 4 → 6 pasos. */
export function generateMovimientoRound(level: number): MovimientoRound {
  const stepCount = Math.min(level, 4) + 2;
  const steps = shuffled(MOVIMIENTO_STEP_POOL).slice(0, stepCount);
  return { steps };
}

/** RF-003: la precisión decide el nivel, no el tiempo de respuesta. */
export function nextLevel(currentLevel: number, maxLevel: number, roundsCorrect: number): number {
  if (roundsCorrect >= ROUNDS_TO_LEVEL_UP && currentLevel < maxLevel) {
    return currentLevel + 1;
  }
  return currentLevel;
}

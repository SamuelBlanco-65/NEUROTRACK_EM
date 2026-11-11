import { ALL_SHAPES, MOVIMIENTO_STEP_POOL, ROUNDS_TO_LEVEL_UP } from './constants';
import type { AtencionRound, LogicaRound, MemoriaRound, MovimientoRound, ShapeId } from './types';

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

// ---------------------------------------------------------------------------------------
// Lógica: series numéricas
// ---------------------------------------------------------------------------------------

type Rng = () => number;

function randInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function shuffledWith<T>(items: readonly T[], rng: Rng): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** 4 opciones distintas y no negativas: la respuesta y 3 valores cercanos que parecen razonables. */
function buildLogicaOptions(answer: number, step: number, rng: Rng): number[] {
  const near = [answer - 1, answer + 1, answer - step, answer + step, answer + 2, answer - 2, answer + 2 * step];
  const distractors = shuffledWith(
    [...new Set(near)].filter((value) => value >= 0 && value !== answer),
    rng
  ).slice(0, 3);
  for (let extra = 3; distractors.length < 3; extra += 1) {
    const candidate = answer + extra;
    if (!distractors.includes(candidate)) distractors.push(candidate);
  }
  return shuffledWith([answer, ...distractors], rng);
}

/**
 * Nivel 1: suma de 1, 2, 5 o 10 · 2: suma de 2 a 9 · 3: resta · 4: multiplicar por 2 o 3 ·
 * 5: dos pasos que se alternan (p. ej. +2, +5, +2, +5). Siempre hay una sola respuesta correcta
 * y ninguna regla pide velocidad (RF-003).
 */
export function generateLogicaRound(level: number, rng: Rng = Math.random): LogicaRound {
  const lvl = Math.min(Math.max(level, 1), 5);
  let sequence: number[];
  let answer: number;
  let rule: string;
  let step: number;

  if (lvl === 1 || lvl === 2) {
    const d = lvl === 1 ? [1, 2, 5, 10][randInt(rng, 0, 3)] : randInt(rng, 2, 9);
    const start = randInt(rng, 1, lvl === 1 ? 10 : 20);
    sequence = Array.from({ length: 4 }, (_, i) => start + i * d);
    answer = start + 4 * d;
    rule = `Se suma ${d} cada vez.`;
    step = d;
  } else if (lvl === 3) {
    const d = randInt(rng, 2, 9);
    const start = 4 * d + randInt(rng, 0, 20);
    sequence = Array.from({ length: 4 }, (_, i) => start - i * d);
    answer = start - 4 * d;
    rule = `Se resta ${d} cada vez.`;
    step = d;
  } else if (lvl === 4) {
    const factor = randInt(rng, 2, 3);
    const start = randInt(rng, 1, 3);
    sequence = Array.from({ length: 4 }, (_, i) => start * factor ** i);
    answer = start * factor ** 4;
    rule = `Se multiplica por ${factor} cada vez.`;
    step = answer - sequence[3];
  } else {
    const a = randInt(rng, 1, 5);
    let b = randInt(rng, 2, 9);
    if (b === a) b += 1;
    const start = randInt(rng, 1, 10);
    sequence = [start];
    for (let i = 0; i < 4; i += 1) sequence.push(sequence[i] + (i % 2 === 0 ? a : b));
    answer = sequence[4] + a;
    rule = `Se suma ${a}, luego ${b}, y se repite.`;
    step = b;
  }

  return { sequence, options: buildLogicaOptions(answer, step, rng), answer, rule };
}

export function checkLogicaAnswer(round: LogicaRound, option: number): boolean {
  return option === round.answer;
}

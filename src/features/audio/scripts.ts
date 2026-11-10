import { AREA_META, MAX_LEVEL, ROUNDS_PER_SESSION, SHAPE_META } from '@/features/activities/constants';
import type { ActivityArea, RoundResult, ShapeId } from '@/features/activities/types';

/**
 * Guiones de la versión auditiva de las actividades (REC-002). Son funciones puras de texto:
 * no tocan la voz ni la UI, para poder probarlas aparte (ver `__tests__/scripts-test.ts`).
 * Frases cortas y en tono de acompañamiento (RNF-010): se leen en voz alta, no se escanean.
 */

function shapeWord(shape: ShapeId): string {
  return SHAPE_META[shape].label.toLowerCase();
}

/** "Primero círculo. Luego cuadrado. Por último, triángulo." */
export function sequenceScript(sequence: ShapeId[]): string {
  const parts = sequence.map((shape, index) => {
    if (index === 0) return `Primero ${shapeWord(shape)}.`;
    if (index === sequence.length - 1) return `Por último, ${shapeWord(shape)}.`;
    return `Luego ${shapeWord(shape)}.`;
  });
  return `Memoriza esta secuencia. ${parts.join(' ')} Tómate el tiempo que necesites.`;
}

export const MEMORIA_RESPONDER_SCRIPT = 'Toca las figuras en el mismo orden en que aparecieron.';

export function atencionScript(optionsCount: number): string {
  return `Encuentra la figura distinta. Hay ${optionsCount} opciones. Tómate tu tiempo, sin prisas.`;
}

export function resultScript(result: RoundResult): string {
  return result === 'correcto' ? '¡Bien hecho!' : 'Esta vez no, pero vas avanzando.';
}

export function stepScript(index: number, step: string): string {
  return `Paso ${index + 1}: ${step}`;
}

/** Introducción de Movimiento: todos los pasos, para poder seguirlos sin mirar la pantalla. */
export function movimientoIntroScript(steps: string[]): string {
  const list = steps.map((step, index) => stepScript(index, step)).join(' ');
  return `Sigue estos pasos a tu propio ritmo. ${list}`;
}

/** Al marcar un paso como hecho: aliento + el siguiente paso pendiente (si queda alguno). */
export function movimientoProgressScript(steps: string[], completedIndices: number[]): string {
  const nextIndex = steps.findIndex((_, index) => !completedIndices.includes(index));
  if (nextIndex === -1) return 'Terminaste todos los pasos. Toca terminar la sesión.';
  return `Muy bien. ${stepScript(nextIndex, steps[nextIndex])}`;
}

export function completedScript(area: ActivityArea, aciertos: number, total: number, level: number): string {
  const what = area === 'movimiento' ? `${aciertos} de ${total} pasos` : `${aciertos} de ${total} rondas`;
  return `Sesión completada. Hiciste bien ${what}. Tu nivel en ${AREA_META[area].title} es ${level} de ${MAX_LEVEL[area]}. Cada práctica cuenta.`;
}

/** Lo que se lee solo en cada momento de una sesión (cuando "Lectura en voz alta" está activa). */
export type Narration = { key: string; text: string };

/**
 * Qué narrar para el estado actual de la sesión, o `null` si no hay nada que leer. `key`
 * identifica el momento: la pantalla solo vuelve a hablar cuando cambia la `key`, no con cada
 * toque que actualiza la sesión sin cambiar de momento (p. ej. tocar figuras en Memoria).
 */
export function narrationFor(session: {
  area: ActivityArea;
  phase: 'memorizar' | 'responder' | 'resultado' | 'completada';
  roundIndex: number;
  roundsCorrect: number;
  newLevel: number | null;
  lastResult: RoundResult | null;
  memoriaRound: { sequence: ShapeId[] } | null;
  atencionRound: { options: unknown[] } | null;
  movimientoRound: { steps: string[] } | null;
  completedStepIndices: number[];
}): Narration | null {
  const { area, phase, roundIndex } = session;

  if (phase === 'completada') {
    if (session.newLevel === null) return null;
    const isMovimiento = area === 'movimiento';
    const aciertos = isMovimiento ? session.completedStepIndices.length : session.roundsCorrect;
    const total = isMovimiento ? (session.movimientoRound?.steps.length ?? 0) : ROUNDS_PER_SESSION;
    return { key: 'completada', text: completedScript(area, aciertos, total, session.newLevel) };
  }

  if (area === 'movimiento' && session.movimientoRound) {
    const { steps } = session.movimientoRound;
    const done = session.completedStepIndices;
    return {
      key: `movimiento-${done.length}`,
      text: done.length === 0 ? movimientoIntroScript(steps) : movimientoProgressScript(steps, done),
    };
  }

  if (phase === 'memorizar' && session.memoriaRound) {
    return { key: `memorizar-${roundIndex}`, text: sequenceScript(session.memoriaRound.sequence) };
  }
  if (phase === 'resultado' && session.lastResult) {
    return { key: `resultado-${roundIndex}`, text: resultScript(session.lastResult) };
  }
  if (phase === 'responder') {
    if (area === 'memoria') return { key: `responder-${roundIndex}`, text: MEMORIA_RESPONDER_SCRIPT };
    if (area === 'atencion' && session.atencionRound) {
      return { key: `responder-${roundIndex}`, text: atencionScript(session.atencionRound.options.length) };
    }
  }
  return null;
}

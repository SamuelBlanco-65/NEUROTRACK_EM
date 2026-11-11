export type ActivityArea = 'memoria' | 'atencion' | 'logica' | 'movimiento';

export type AreaProgress = {
  area: ActivityArea;
  level: number;
};

export type ActivitiesErrorClass = 'sin-conexion' | 'servidor' | 'inesperado';

export type ActivitiesError = {
  errorClass: ActivitiesErrorClass;
  message: string;
};

export type ShapeId = 'circulo' | 'cuadrado' | 'triangulo' | 'diamante';

/** Una ronda de memoria: secuencia a memorizar. */
export type MemoriaRound = {
  sequence: ShapeId[];
};

/** Una ronda de atención: opciones con un intruso a encontrar. */
export type AtencionRound = {
  shape: ShapeId;
  options: { id: string; shape: ShapeId; isOdd: boolean }[];
};

/**
 * Una ronda de lógica: una serie de números con una regla oculta; hay que elegir el que sigue.
 * `rule` se muestra después de responder, para que cada ronda enseñe algo (sin presión).
 */
export type LogicaRound = {
  /** Términos visibles de la serie; el siguiente es `answer`. */
  sequence: number[];
  options: number[];
  answer: number;
  rule: string;
};

/** Una ronda de movimiento: lista de pasos guiados a completar. */
export type MovimientoRound = {
  steps: string[];
};

export type RoundResult = 'correcto' | 'incorrecto';

/** Una sesión de actividad completada, para el historial de Progreso (RF-005). */
export type ActivitySession = {
  id: string;
  area: ActivityArea;
  completedAt: string;
};

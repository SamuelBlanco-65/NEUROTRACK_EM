export type ActivityArea = 'memoria' | 'atencion' | 'movimiento';

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

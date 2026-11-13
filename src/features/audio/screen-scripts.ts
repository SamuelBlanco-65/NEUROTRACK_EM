/**
 * Guiones de las pantallas principales (REC-002). Igual que los de actividades
 * (`scripts.ts`): funciones puras de texto, con las cadenas ya resueltas por la pantalla, para
 * poder probarlas sin voz ni UI. Frases cortas, en tono de acompañamiento (RNF-010).
 */

/** Cierra la frase con punto salvo que ya termine en puntuación. */
function sentence(text: string): string {
  const trimmed = text.trim();
  return /[.!?…:]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

type TitledOption = { title: string; description: string };

/** Título + pista de un paso, y las opciones si las hay: «Fatiga, cansancio o falta de energía.» */
export function screenIntroScript(title: string, hint: string, options?: TitledOption[]): string {
  const parts = [sentence(title), sentence(hint)];
  if (options && options.length > 0) {
    parts.push('Las opciones son:');
    parts.push(...options.map((option) => sentence(`${option.title}, ${option.description.toLowerCase()}`)));
  }
  return parts.join(' ');
}

export type HomeReminder = { time: string; title: string };

/** Inicio del paciente: saludo, mensaje de ánimo (si hay) y el plan de hoy. */
export function homeScript(input: {
  greeting: string;
  dateLabel: string;
  cheer?: string | null;
  reminders: HomeReminder[];
}): string {
  const parts = [sentence(input.greeting), sentence(input.dateLabel)];
  if (input.cheer) parts.push(sentence(`Tienes un mensaje de ánimo: ${input.cheer}`));
  parts.push('¿Cómo te sientes hoy? Toca lo que notes. Puedes cambiarlo después.');
  if (input.reminders.length === 0) {
    parts.push('No tienes recordatorios para hoy.');
  } else {
    parts.push('Tu plan de hoy:');
    parts.push(...input.reminders.map((reminder) => sentence(`A las ${reminder.time}, ${reminder.title}`)));  }
  return parts.join(' ');
}

export type DayLogSummary = { type: string; severity: string; time: string; note: string | null };

/** Detalle de un día del calendario de síntomas. */
export function dayDetailScript(dateLabel: string, logs: DayLogSummary[]): string {
  if (logs.length === 0) return `${sentence(dateLabel)} Sin síntomas registrados este día.`;
  const count = logs.length === 1 ? '1 registro' : `${logs.length} registros`;
  const items = logs.map((log) => {
    const base = sentence(`${log.type}, intensidad ${log.severity.toLowerCase()}, a las ${log.time}`);
    return log.note ? `${base} Nota: ${sentence(log.note)}` : base;
  });
  return [sentence(dateLabel), `${count}.`, ...items].join(' ');
}

/** Resumen de Progreso: el titular y los patrones que se notan. */
export function progressScript(headline: string, insights: { title: string; description: string }[]): string {
  const parts = [sentence(headline)];
  if (insights.length > 0) {
    parts.push('Lo que notamos:');
    parts.push(...insights.map((insight) => `${sentence(insight.title)} ${sentence(insight.description)}`));
  }
  return parts.join(' ');
}

/** Guía de Apoyo: título, resumen y el contenido completo (transcripción incluida). */
export function guideScript(input: { title: string; summary: string; body: string[] }): string {
  return [sentence(input.title), sentence(input.summary), ...input.body.map(sentence)].join(' ');
}

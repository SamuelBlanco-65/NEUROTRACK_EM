import { CATEGORY_META } from './constants';
import type { ReminderCategory } from './types';

/** Texto de la categoría: el nombre propio si es «otro» y lo escribieron, si no el estándar. */
export function reminderCategoryLabel(category: ReminderCategory, categoryLabel?: string | null): string {
  const custom = categoryLabel?.trim();
  return category === 'otro' && custom ? custom : CATEGORY_META[category].label;
}

/** Próxima hora en punto (p. ej. a las 10:20 → 11:00): una propuesta razonable que se puede cambiar. */
export function defaultReminderDate(now: Date = new Date()): Date {
  const next = new Date(now);
  next.setMinutes(0, 0, 0);
  next.setHours(next.getHours() + 1);
  return next;
}

/** Une el día de `datePart` con la hora de `timePart` (los selectores nativos devuelven fecha y hora por separado). */
export function combineDateAndTime(datePart: Date, timePart: Date): Date {
  const combined = new Date(datePart);
  combined.setHours(timePart.getHours(), timePart.getMinutes(), 0, 0);
  return combined;
}

/** Un recordatorio nuevo debe quedar en el futuro (con un minuto de margen por lo que tarda en guardarse). */
export function isFutureReminder(date: Date, now: Date = new Date()): boolean {
  return date.getTime() > now.getTime() - 60_000;
}

import type { ProgressPeriod } from './types';

export const MONTH_NAMES_LONG = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export const MONTH_NAMES_SHORT = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

export const WEEKDAY_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

/** Umbral para la vista "datos insuficientes": al menos dos semanas de días distintos
 * con registro (no necesariamente seguidos), como en el export de Stitch. */
export const MIN_DISTINCT_DAYS_FOR_INSIGHTS = 10;

export const PERIOD_OPTIONS: { id: ProgressPeriod; label: string }[] = [
  { id: 'semana', label: 'Semana' },
  { id: 'mes', label: 'Mes' },
  { id: 'tresMeses', label: '3 meses' },
];

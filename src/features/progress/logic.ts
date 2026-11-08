import { isoDateOfDate } from '@/features/symptoms/calendar';
import { symptomTypeLabel } from '@/features/symptoms/constants';
import type { SymptomLog, SymptomType } from '@/features/symptoms/types';
import type { ActivitySession } from '@/features/activities/types';
import { MIN_DISTINCT_DAYS_FOR_INSIGHTS, MONTH_NAMES_LONG, MONTH_NAMES_SHORT, WEEKDAY_SHORT } from './constants';
import type { ProgressBucket, ProgressInsight, ProgressPeriod } from './types';

export type PeriodRange = { start: Date; end: Date; label: string };

type BucketBoundary = { id: string; label: string; start: Date; end: Date };

function startOfWeek(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const mondayFirstWeekday = (start.getDay() + 6) % 7; // 0 = lunes
  start.setDate(start.getDate() - mondayFirstWeekday);
  return start;
}

/** Calcula el rango [start, end) de un período, anclado en `reference` (RF-005). */
export function getPeriodRange(period: ProgressPeriod, reference: Date): PeriodRange {
  if (period === 'semana') {
    const start = startOfWeek(reference);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const lastDay = new Date(end);
    lastDay.setDate(lastDay.getDate() - 1);
    const label = `${start.getDate()} – ${lastDay.getDate()} de ${MONTH_NAMES_LONG[lastDay.getMonth()]} ${lastDay.getFullYear()}`;
    return { start, end, label };
  }
  if (period === 'mes') {
    const start = new Date(reference.getFullYear(), reference.getMonth(), 1);
    const end = new Date(reference.getFullYear(), reference.getMonth() + 1, 1);
    return { start, end, label: `${MONTH_NAMES_LONG[reference.getMonth()]} ${reference.getFullYear()}` };
  }
  const start = new Date(reference.getFullYear(), reference.getMonth() - 2, 1);
  const end = new Date(reference.getFullYear(), reference.getMonth() + 1, 1);
  const label = `${MONTH_NAMES_SHORT[start.getMonth()]} – ${MONTH_NAMES_SHORT[reference.getMonth()]} ${reference.getFullYear()}`;
  return { start, end, label };
}

/** Mueve la fecha de referencia un período hacia adelante (1) o hacia atrás (-1). */
export function shiftReference(period: ProgressPeriod, reference: Date, direction: 1 | -1): Date {
  if (period === 'semana') {
    const next = new Date(reference);
    next.setDate(next.getDate() + 7 * direction);
    return next;
  }
  if (period === 'mes') {
    return new Date(reference.getFullYear(), reference.getMonth() + direction, 1);
  }
  return new Date(reference.getFullYear(), reference.getMonth() + 3 * direction, 1);
}

export function getPreviousPeriodRange(period: ProgressPeriod, reference: Date): PeriodRange {
  return getPeriodRange(period, shiftReference(period, reference, -1));
}

/** Límites de los grupos ("buckets") que se grafican dentro de un período. */
export function buildBucketBoundaries(period: ProgressPeriod, range: PeriodRange): BucketBoundary[] {
  if (period === 'semana') {
    return WEEKDAY_SHORT.map((label, index) => {
      const start = new Date(range.start);
      start.setDate(start.getDate() + index);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      return { id: `dia-${index}`, label, start, end };
    });
  }
  if (period === 'mes') {
    const boundaries: BucketBoundary[] = [];
    let start = new Date(range.start);
    let index = 1;
    while (start < range.end) {
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      const cappedEnd = end < range.end ? end : range.end;
      boundaries.push({ id: `semana-${index}`, label: `Semana ${index}`, start: new Date(start), end: cappedEnd });
      start = cappedEnd;
      index += 1;
    }
    return boundaries;
  }
  return Array.from({ length: 3 }, (_, index) => {
    const start = new Date(range.start.getFullYear(), range.start.getMonth() + index, 1);
    const end = new Date(range.start.getFullYear(), range.start.getMonth() + index + 1, 1);
    return { id: `mes-${index}`, label: MONTH_NAMES_SHORT[start.getMonth()], start, end };
  });
}

/** Agrega registros crudos en los buckets del período: días distintos con síntomas y
 * sesiones de actividad completadas, por grupo. */
export function aggregateBuckets(
  boundaries: BucketBoundary[],
  symptomLogs: SymptomLog[],
  activitySessions: ActivitySession[]
): ProgressBucket[] {
  return boundaries.map((boundary) => {
    const symptomDays = new Set<string>();
    for (const log of symptomLogs) {
      const occurred = new Date(log.occurredAt);
      if (occurred >= boundary.start && occurred < boundary.end) symptomDays.add(isoDateOfDate(occurred));
    }
    const activities = activitySessions.filter((session) => {
      const completed = new Date(session.completedAt);
      return completed >= boundary.start && completed < boundary.end;
    }).length;
    return {
      id: boundary.id,
      label: boundary.label,
      startISO: boundary.start.toISOString(),
      endISO: boundary.end.toISOString(),
      symptomDays: symptomDays.size,
      activities,
    };
  });
}

function distinctDaysByType(logs: SymptomLog[], start: Date, end: Date): Partial<Record<SymptomType, number>> {
  const byType = new Map<SymptomType, Set<string>>();
  for (const log of logs) {
    const occurred = new Date(log.occurredAt);
    if (occurred < start || occurred >= end) continue;
    const days = byType.get(log.symptomType) ?? new Set<string>();
    days.add(isoDateOfDate(occurred));
    byType.set(log.symptomType, days);
  }
  const result: Partial<Record<SymptomType, number>> = {};
  byType.forEach((days, type) => {
    result[type] = days.size;
  });
  return result;
}

const PERIOD_WORDS: Record<ProgressPeriod, { current: string; previous: string; unitSingular: string; unitPlural: string }> = {
  semana: { current: 'esta semana', previous: 'la semana pasada', unitSingular: 'día', unitPlural: 'días' },
  mes: { current: 'este mes', previous: 'el mes pasado', unitSingular: 'semana', unitPlural: 'semanas' },
  tresMeses: { current: 'estos 3 meses', previous: 'los 3 meses anteriores', unitSingular: 'mes', unitPlural: 'meses' },
};

/** "Lo que notamos": hasta 3 observaciones, comparando el período actual contra el anterior
 * y la racha de constancia más reciente (RF-005, RNF-006: siempre ícono + texto). */
export function buildInsights(
  period: ProgressPeriod,
  currentRange: PeriodRange,
  previousRange: PeriodRange,
  currentBuckets: ProgressBucket[],
  symptomLogs: SymptomLog[]
): ProgressInsight[] {
  const words = PERIOD_WORDS[period];
  const currentByType = distinctDaysByType(symptomLogs, currentRange.start, currentRange.end);
  const previousByType = distinctDaysByType(symptomLogs, previousRange.start, previousRange.end);
  const trackedTypes = (Object.keys(currentByType) as SymptomType[]).sort(
    (a, b) => (currentByType[b] ?? 0) - (currentByType[a] ?? 0)
  );

  const insights: ProgressInsight[] = [];
  for (const type of trackedTypes.slice(0, 2)) {
    const currentCount = currentByType[type] ?? 0;
    const previousCount = previousByType[type] ?? 0;
    let icon: ProgressInsight['icon'] = 'remove';
    let description = 'Igual que el período anterior.';
    if (currentCount < previousCount) {
      icon = 'arrow-downward';
      description = `${currentCount} ${currentCount === 1 ? 'día' : 'días'} ${words.current}, ${previousCount} ${words.previous}.`;
    } else if (currentCount > previousCount) {
      icon = 'arrow-upward';
      description = `${currentCount} ${currentCount === 1 ? 'día' : 'días'} ${words.current}, ${previousCount} ${words.previous}.`;
    }
    insights.push({ id: `tipo-${type}`, icon, title: symptomTypeLabel(type), description });
  }

  let streak = 0;
  for (let i = currentBuckets.length - 1; i >= 0; i--) {
    if (currentBuckets[i].symptomDays > 0) streak += 1;
    else break;
  }
  if (streak > 0) {
    const unit = streak === 1 ? words.unitSingular : words.unitPlural;
    insights.push({
      id: 'constancia',
      icon: 'check',
      title: 'Constancia',
      description: `Registraste ${streak} ${unit} seguidos.`,
    });
  }

  return insights.slice(0, 3);
}

/** La frase destacada de la tarjeta de resumen, derivada de la observación más relevante. */
export function buildHeadline(range: PeriodRange, insights: ProgressInsight[]): string {
  const first = insights[0];
  if (!first) return `Este es tu progreso de ${range.label}.`;
  if (first.id === 'constancia') return first.description;
  if (first.icon === 'arrow-downward') {
    return `En ${range.label} registraste menos días con ${first.title.toLowerCase()} que en el período anterior.`;
  }
  if (first.icon === 'arrow-upward') {
    return `En ${range.label} registraste más días con ${first.title.toLowerCase()} que en el período anterior.`;
  }
  return `${first.title} se mantuvo igual que en el período anterior.`;
}

export function countDistinctSymptomDays(symptomLogs: SymptomLog[]): number {
  return new Set(symptomLogs.map((log) => isoDateOfDate(new Date(log.occurredAt)))).size;
}

/** Hace falta al menos ~2 semanas de días distintos con registro para mostrar tendencias. */
export function hasEnoughData(symptomLogs: SymptomLog[]): boolean {
  return countDistinctSymptomDays(symptomLogs) >= MIN_DISTINCT_DAYS_FOR_INSIGHTS;
}

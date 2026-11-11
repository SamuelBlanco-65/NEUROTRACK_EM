import { isoDateOfDate } from './calendar';
import type { SymptomLog, SymptomType } from './types';

/** Días distintos con cada tipo de síntoma (un tipo con dos registros el mismo día cuenta 1), de más a menos. */
export function symptomDaysByType(logs: SymptomLog[]): { type: SymptomType; days: number }[] {
  const byType = new Map<SymptomType, Set<string>>();
  for (const log of logs) {
    const days = byType.get(log.symptomType) ?? new Set<string>();
    days.add(isoDateOfDate(new Date(log.occurredAt)));
    byType.set(log.symptomType, days);
  }
  return [...byType.entries()]
    .map(([type, days]) => ({ type, days: days.size }))
    .sort((a, b) => b.days - a.days);
}

/** Días distintos con algún síntoma registrado. */
export function distinctSymptomDays(logs: SymptomLog[]): number {
  return new Set(logs.map((log) => isoDateOfDate(new Date(log.occurredAt)))).size;
}

import type { Severity, SymptomLog } from './types';

export type CalendarDay = {
  date: number;
  isoDate: string;
  worstSeverity: Severity | null;
  logCount: number;
};

const SEVERITY_RANK: Record<Severity, number> = { leve: 1, moderado: 2, fuerte: 3 };

function isoDateOf(year: number, month: number, date: number): string {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(date).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

/** Agrupa los registros del mes por día y calcula la severidad más alta de cada uno (RF-002). */
export function buildMonthGrid(year: number, month: number, logs: SymptomLog[]): CalendarDay[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const logsByIsoDate = new Map<string, SymptomLog[]>();
  for (const log of logs) {
    const occurred = new Date(log.occurredAt);
    const iso = isoDateOf(occurred.getFullYear(), occurred.getMonth(), occurred.getDate());
    const bucket = logsByIsoDate.get(iso) ?? [];
    bucket.push(log);
    logsByIsoDate.set(iso, bucket);
  }

  const days: CalendarDay[] = [];
  for (let date = 1; date <= daysInMonth; date++) {
    const iso = isoDateOf(year, month, date);
    const dayLogs = logsByIsoDate.get(iso) ?? [];
    const worstSeverity = dayLogs.reduce<Severity | null>((worst, log) => {
      if (!worst || SEVERITY_RANK[log.severity] > SEVERITY_RANK[worst]) return log.severity;
      return worst;
    }, null);
    days.push({ date, isoDate: iso, worstSeverity, logCount: dayLogs.length });
  }
  return days;
}

/** Columnas vacías antes del día 1, con la semana empezando en lunes. */
export function leadingBlankCount(year: number, month: number): number {
  const firstWeekday = new Date(year, month, 1).getDay(); // 0 = domingo
  return (firstWeekday + 6) % 7;
}

export function logsForIsoDate(logs: SymptomLog[], isoDate: string): SymptomLog[] {
  return logs.filter((log) => {
    const occurred = new Date(log.occurredAt);
    return isoDateOf(occurred.getFullYear(), occurred.getMonth(), occurred.getDate()) === isoDate;
  });
}

export function isoDateOfDate(date: Date): string {
  return isoDateOf(date.getFullYear(), date.getMonth(), date.getDate());
}

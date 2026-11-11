import { ACTIVITY_AREAS, AREA_META } from '@/features/activities/constants';
import type { ActivitySession, AreaProgress } from '@/features/activities/types';
import { MONTH_NAMES_SHORT } from '@/features/progress/constants';
import type { PeriodRange } from '@/features/progress/logic';
import type { ProgressPeriod } from '@/features/progress/types';
import { isoDateOfDate } from '@/features/symptoms/calendar';
import { symptomTypeLabel } from '@/features/symptoms/constants';
import type { Severity, SymptomLog, SymptomType } from '@/features/symptoms/types';
import { DURATION_OPTIONS, MIN_DAYS_TO_COMPARE, NOT_A_DIAGNOSIS } from './constants';
import type {
  ActivityAreaSummary,
  DoctorAccessDuration,
  DoctorLink,
  SeverityDistribution,
  SymptomComparison,
  SymptomNote,
} from './types';


const MS_PER_DAY = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------------------
// Vigencia del acceso
// ---------------------------------------------------------------------------------------

/** Fecha de fin del acceso (ISO) según la duración que eligió el paciente; `null` = sin fecha de fin. */
export function expiresAtFromDuration(duration: DoctorAccessDuration, now: Date = new Date()): string | null {
  const months = DURATION_OPTIONS.find((option) => option.id === duration)?.months ?? null;
  if (months === null) return null;
  const end = new Date(now);
  end.setMonth(end.getMonth() + months);
  return end.toISOString();
}

/** `true` si el vínculo sigue aceptado pero su fecha de fin ya pasó. */
export function isLinkExpired(link: Pick<DoctorLink, 'status' | 'expiresAt'>, now: Date = new Date()): boolean {
  return link.status === 'aceptado' && link.expiresAt !== null && new Date(link.expiresAt) <= now;
}

/** El médico puede ver datos solo con vínculo aceptado y sin vencer. */
export function isLinkActive(link: Pick<DoctorLink, 'status' | 'expiresAt'>, now: Date = new Date()): boolean {
  return link.status === 'aceptado' && !isLinkExpired(link, now);
}

/** Iniciales para el avatar: «Laura Gómez» → «LG»; sin nombre → «P». */
export function initialsOf(name: string | null): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'P';
  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

/** «12 feb 2027» */
export function formatShortDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getDate()} ${MONTH_NAMES_SHORT[date.getMonth()].toLowerCase()} ${date.getFullYear()}`;
}

export function describeExpiry(expiresAt: string | null): string {
  return expiresAt ? `Acceso hasta: ${formatShortDate(expiresAt)}` : 'Acceso sin fecha de fin';
}

/** Lista de lo que el paciente comparte, para chips y resúmenes. */
export function sharedCategories(
  permissions: Pick<DoctorLink, 'shareSintomas' | 'shareNotas' | 'shareProgreso'>
): { sintomas: boolean; notas: boolean; actividades: boolean } {
  return {
    sintomas: permissions.shareSintomas,
    // Las notas son parte de los síntomas: sin síntomas no hay notas que mostrar.
    notas: permissions.shareSintomas && permissions.shareNotas,
    actividades: permissions.shareProgreso,
  };
}

// ---------------------------------------------------------------------------------------
// Resumen de síntomas
// ---------------------------------------------------------------------------------------

function inRange(iso: string, range: PeriodRange): boolean {
  const date = new Date(iso);
  return date >= range.start && date < range.end;
}

export function logsInRange(logs: SymptomLog[], range: PeriodRange): SymptomLog[] {
  return logs.filter((log) => inRange(log.occurredAt, range));
}

function distinctDaysByType(logs: SymptomLog[], range: PeriodRange): Map<SymptomType, number> {
  const days = new Map<SymptomType, Set<string>>();
  for (const log of logsInRange(logs, range)) {
    const set = days.get(log.symptomType) ?? new Set<string>();
    set.add(isoDateOfDate(new Date(log.occurredAt)));
    days.set(log.symptomType, set);
  }
  const counts = new Map<SymptomType, number>();
  days.forEach((set, type) => counts.set(type, set.size));
  return counts;
}

const PREVIOUS_LABEL: Record<ProgressPeriod, string> = {
  semana: 'la semana anterior',
  mes: 'el mes anterior',
  tresMeses: 'los 3 meses anteriores',
};

export function previousPeriodLabel(period: ProgressPeriod): string {
  return PREVIOUS_LABEL[period];
}

function daysWord(count: number): string {
  return `${count} ${count === 1 ? 'día' : 'días'}`;
}

/**
 * Días con cada tipo de síntoma en el período actual frente al anterior. Diferencias neutras
 * («3 días más»), sin juzgar si es mejor o peor (RT-004: la app no interpreta clínicamente).
 */
export function compareSymptoms(
  logs: SymptomLog[],
  current: PeriodRange,
  previous: PeriodRange,
  period: ProgressPeriod
): SymptomComparison[] {
  const currentByType = distinctDaysByType(logs, current);
  const previousByType = distinctDaysByType(logs, previous);
  const types = new Set<SymptomType>([...currentByType.keys(), ...previousByType.keys()]);
  const previousText = PREVIOUS_LABEL[period];

  return [...types]
    .map((type): SymptomComparison => {
      const currentDays = currentByType.get(type) ?? 0;
      const previousDays = previousByType.get(type) ?? 0;
      const delta = currentDays - previousDays;
      if (delta > 0) {
        return { type, currentDays, previousDays, direction: 'mas', text: `${daysWord(delta)} más que ${previousText}` };
      }
      if (delta < 0) {
        return { type, currentDays, previousDays, direction: 'menos', text: `${daysWord(-delta)} menos que ${previousText}` };
      }
      return { type, currentDays, previousDays, direction: 'igual', text: `Igual que ${previousText}` };
    })
    .sort((a, b) => b.currentDays - a.currentDays || b.previousDays - a.previousDays);
}

/** Una frase que va ANTES del detalle (los gráficos y tablas siempre llevan un resumen en texto). */
export function buildComparisonSentence(comparisons: SymptomComparison[], period: ProgressPeriod): string {
  if (comparisons.length === 0) return 'No hay síntomas registrados en este período ni en el anterior.';
  const changed = comparisons.filter((item) => item.direction !== 'igual');
  if (changed.length === 0) {
    return `Los síntomas registrados se mantuvieron parecidos a ${PREVIOUS_LABEL[period]}.`;
  }
  return changed
    .slice(0, 3)
    .map((item) => `${symptomTypeLabel(item.type)}: ${item.text}`)
    .join('. ')
    .concat('.');
}

/** Texto corto para el chip de cada síntoma: «3 días más», «1 día menos» o «Igual». */
export function shortDelta(item: Pick<SymptomComparison, 'currentDays' | 'previousDays'>): string {
  const delta = item.currentDays - item.previousDays;
  if (delta === 0) return 'Igual';
  return `${daysWord(Math.abs(delta))} ${delta > 0 ? 'más' : 'menos'}`;
}

/** Porcentaje entero de días con registro sobre los transcurridos (0 si aún no transcurre ninguno). */
export function coveragePercent(coverage: { daysWithRecords: number; elapsedDays: number }): number {
  if (coverage.elapsedDays <= 0) return 0;
  return Math.round((Math.min(coverage.daysWithRecords, coverage.elapsedDays) / coverage.elapsedDays) * 100);
}

/**
 * Frase que acompaña al gráfico por semana o por mes: dice dónde se concentraron los días con síntomas,
 * sin valorarlo. Los gráficos siempre llevan un resumen en texto (accesibilidad).
 */
export function describeBuckets(buckets: { label: string; symptomDays: number }[]): string {
  const max = Math.max(0, ...buckets.map((bucket) => bucket.symptomDays));
  if (max === 0) return 'No hubo días con síntomas registrados en este período.';
  const top = buckets.filter((bucket) => bucket.symptomDays === max).map((bucket) => bucket.label);
  const list = top.length === 1 ? top[0] : `${top.slice(0, -1).join(', ')} y ${top[top.length - 1]}`;
  return `${list} ${top.length === 1 ? 'concentró' : 'concentraron'} más días con síntomas (${daysWord(max)}).`;
}

export function severityDistribution(logs: SymptomLog[], range: PeriodRange): SeverityDistribution {
  const result: SeverityDistribution = { leve: 0, moderado: 0, fuerte: 0 };
  for (const log of logsInRange(logs, range)) {
    result[log.severity as Severity] += 1;
  }
  return result;
}

export function countSymptomDays(logs: SymptomLog[], range: PeriodRange): number {
  return new Set(logsInRange(logs, range).map((log) => isoDateOfDate(new Date(log.occurredAt)))).size;
}

/**
 * Constancia de registro: días con algún registro frente a los días transcurridos del período.
 * Un día sin registro NO significa un día sin síntomas.
 */
export function recordingCoverage(
  logs: SymptomLog[],
  range: PeriodRange,
  now: Date = new Date()
): { daysWithRecords: number; elapsedDays: number } {
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const limit = range.end < tomorrow ? range.end : tomorrow;
  const elapsedDays = limit <= range.start ? 0 : Math.round((limit.getTime() - range.start.getTime()) / MS_PER_DAY);
  return { daysWithRecords: countSymptomDays(logs, range), elapsedDays };
}

export function hasFewRecords(daysWithRecords: number): boolean {
  return daysWithRecords < MIN_DAYS_TO_COMPARE;
}

export function notesInRange(logs: SymptomLog[], range: PeriodRange): SymptomNote[] {
  return logsInRange(logs, range)
    .filter((log) => (log.note ?? '').trim().length > 0)
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .map((log) => ({ id: log.id, occurredAt: log.occurredAt, symptomType: log.symptomType, note: (log.note ?? '').trim() }));
}

/** «8 nov» */
export function formatDayMonth(iso: string): string {
  const date = new Date(iso);
  return `${date.getDate()} ${MONTH_NAMES_SHORT[date.getMonth()].toLowerCase()}`;
}

// ---------------------------------------------------------------------------------------
// Actividades
// ---------------------------------------------------------------------------------------

export function summarizeActivities(
  sessions: ActivitySession[],
  progress: AreaProgress[],
  range: PeriodRange
): ActivityAreaSummary[] {
  return ACTIVITY_AREAS.map((area) => ({
    area,
    sessions: sessions.filter((session) => session.area === area && inRange(session.completedAt, range)).length,
    level: progress.find((item) => item.area === area)?.level ?? null,
  }));
}

// ---------------------------------------------------------------------------------------
// Texto para compartir
// ---------------------------------------------------------------------------------------

export type DoctorSummaryTextInput = {
  patientName: string;
  range: PeriodRange;
  period: ProgressPeriod;
  comparisonSentence: string;
  comparisons: SymptomComparison[];
  coverage: { daysWithRecords: number; elapsedDays: number };
  severity: SeverityDistribution;
  /** `null` si el paciente no compartió actividades. */
  activities: ActivityAreaSummary[] | null;
  /** `null` si el paciente no compartió sus notas. */
  notes: SymptomNote[] | null;
};

export function buildDoctorSummaryText(input: DoctorSummaryTextInput): string {
  const lines: string[] = [
    `Resumen de ${input.patientName} — ${input.range.label}`,
    'Datos registrados por el paciente en Neurotrack EM.',
    '',
    `Constancia: registró algo en ${input.coverage.daysWithRecords} de ${input.coverage.elapsedDays} días. Un día sin registro no significa un día sin síntomas.`,
    '',
    'Síntomas frente al período anterior:',
    input.comparisonSentence,
    ...input.comparisons.map(
      (item) => `- ${symptomTypeLabel(item.type)}: ${daysWord(item.currentDays)} (antes: ${item.previousDays}). ${item.text}.`
    ),
    '',
    `Intensidad registrada: leve ${input.severity.leve}, moderado ${input.severity.moderado}, fuerte ${input.severity.fuerte}.`,
  ];

  if (input.activities) {
    lines.push('', 'Actividades:');
    for (const item of input.activities) {
      const level = item.level === null ? 'sin nivel aún' : `nivel ${item.level}`;
      lines.push(`- ${AREA_META[item.area].title}: ${item.sessions} sesión(es), ${level}`);
    }
  }

  if (input.notes && input.notes.length > 0) {
    lines.push('', 'Notas del paciente:');
    for (const note of input.notes) {
      lines.push(`- ${formatDayMonth(note.occurredAt)} (${symptomTypeLabel(note.symptomType)}): ${note.note}`);
    }
  }

  lines.push('', NOT_A_DIAGNOSIS);
  return lines.join('\n');
}

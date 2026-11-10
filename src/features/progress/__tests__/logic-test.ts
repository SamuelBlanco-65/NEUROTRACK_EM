import {
  aggregateBuckets,
  buildBucketBoundaries,
  buildHeadline,
  buildInsights,
  countDistinctSymptomDays,
  getPeriodRange,
  getPreviousPeriodRange,
  hasEnoughData,
  shiftReference,
} from '../logic';
import { MIN_DISTINCT_DAYS_FOR_INSIGHTS } from '../constants';
import type { SymptomLog } from '@/features/symptoms/types';
import type { ActivitySession } from '@/features/activities/types';

function symptomLog(occurredAt: string, symptomType: SymptomLog['symptomType'] = 'fatiga'): SymptomLog {
  return { id: occurredAt, symptomType, severity: 'moderado', note: null, occurredAt };
}

function activitySession(completedAt: string): ActivitySession {
  return { id: completedAt, area: 'memoria', completedAt };
}

// Un miércoles fijo, para que "semana" y "mes" no dependan de la fecha de hoy.
const REFERENCE = new Date(2026, 10, 11); // 2026-11-11

describe('getPeriodRange', () => {
  test('"semana" empieza en lunes y cubre 7 días', () => {
    const range = getPeriodRange('semana', REFERENCE);
    expect(range.start.getDay()).toBe(1);
    expect((range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24)).toBe(7);
  });

  test('"mes" cubre del día 1 al primer día del mes siguiente', () => {
    const range = getPeriodRange('mes', REFERENCE);
    expect(range.start).toEqual(new Date(2026, 10, 1));
    expect(range.end).toEqual(new Date(2026, 11, 1));
  });

  test('"tresMeses" cubre los 2 meses anteriores más el actual', () => {
    const range = getPeriodRange('tresMeses', REFERENCE);
    expect(range.start).toEqual(new Date(2026, 8, 1));
    expect(range.end).toEqual(new Date(2026, 11, 1));
  });
});

describe('shiftReference / getPreviousPeriodRange', () => {
  test('retrocede una semana completa', () => {
    const previous = shiftReference('semana', REFERENCE, -1);
    expect(REFERENCE.getTime() - previous.getTime()).toBe(7 * 24 * 60 * 60 * 1000);
  });

  test('el rango anterior de "mes" es el mes calendario previo', () => {
    const previousRange = getPreviousPeriodRange('mes', REFERENCE);
    expect(previousRange.start).toEqual(new Date(2026, 9, 1));
    expect(previousRange.end).toEqual(new Date(2026, 10, 1));
  });
});

describe('buildBucketBoundaries', () => {
  test('"semana" produce 7 buckets, uno por día', () => {
    const range = getPeriodRange('semana', REFERENCE);
    expect(buildBucketBoundaries('semana', range)).toHaveLength(7);
  });

  test('"tresMeses" produce 3 buckets, uno por mes', () => {
    const range = getPeriodRange('tresMeses', REFERENCE);
    const boundaries = buildBucketBoundaries('tresMeses', range);
    expect(boundaries).toHaveLength(3);
    expect(boundaries[2].end).toEqual(range.end);
  });
});

describe('aggregateBuckets', () => {
  test('cuenta días distintos con síntomas (no registros) y sesiones completadas por bucket', () => {
    const range = getPeriodRange('semana', REFERENCE);
    const boundaries = buildBucketBoundaries('semana', range);
    const monday = boundaries[0].start;
    const sameDayLater = new Date(monday.getTime() + 2 * 60 * 60 * 1000);

    const logs = [symptomLog(monday.toISOString()), symptomLog(sameDayLater.toISOString())];
    const sessions = [activitySession(monday.toISOString())];

    const buckets = aggregateBuckets(boundaries, logs, sessions);
    expect(buckets[0].symptomDays).toBe(1);
    expect(buckets[0].activities).toBe(1);
    expect(buckets.slice(1).every((bucket) => bucket.symptomDays === 0 && bucket.activities === 0)).toBe(true);
  });
});

describe('countDistinctSymptomDays / hasEnoughData', () => {
  test('cuenta días calendario distintos, ignorando registros repetidos el mismo día', () => {
    const logs = [
      symptomLog(new Date(2026, 10, 1, 8).toISOString()),
      symptomLog(new Date(2026, 10, 1, 20).toISOString()),
      symptomLog(new Date(2026, 10, 2, 8).toISOString()),
    ];
    expect(countDistinctSymptomDays(logs)).toBe(2);
  });

  test('hasEnoughData exige el umbral mínimo de días distintos', () => {
    const fewLogs = [symptomLog(new Date(2026, 10, 1).toISOString())];
    expect(hasEnoughData(fewLogs)).toBe(false);

    const manyLogs = Array.from({ length: MIN_DISTINCT_DAYS_FOR_INSIGHTS }, (_, index) =>
      symptomLog(new Date(2026, 9, 1 + index).toISOString())
    );
    expect(hasEnoughData(manyLogs)).toBe(true);
  });
});

describe('buildInsights', () => {
  test('sin registros no genera insights', () => {
    const range = getPeriodRange('semana', REFERENCE);
    const previousRange = getPreviousPeriodRange('semana', REFERENCE);
    const buckets = buildBucketBoundaries('semana', range).map((boundary) => ({
      id: boundary.id,
      label: boundary.label,
      startISO: boundary.start.toISOString(),
      endISO: boundary.end.toISOString(),
      symptomDays: 0,
      activities: 0,
    }));
    expect(buildInsights('semana', range, previousRange, buckets, [])).toEqual([]);
  });

  test('detecta menos días con un síntoma que en el período anterior', () => {
    const range = getPeriodRange('semana', REFERENCE);
    const previousRange = getPreviousPeriodRange('semana', REFERENCE);
    const buckets = buildBucketBoundaries('semana', range).map((boundary) => ({
      id: boundary.id,
      label: boundary.label,
      startISO: boundary.start.toISOString(),
      endISO: boundary.end.toISOString(),
      symptomDays: 0,
      activities: 0,
    }));
    const logs = [
      symptomLog(range.start.toISOString(), 'fatiga'),
      symptomLog(previousRange.start.toISOString(), 'fatiga'),
      symptomLog(new Date(previousRange.start.getTime() + 24 * 60 * 60 * 1000).toISOString(), 'fatiga'),
    ];
    const insights = buildInsights('semana', range, previousRange, buckets, logs);
    expect(insights[0].icon).toBe('arrow-downward');
  });
});

describe('buildHeadline', () => {
  test('sin insights, usa el titular genérico del período', () => {
    const range = getPeriodRange('mes', REFERENCE);
    expect(buildHeadline(range, [])).toBe(`Este es tu progreso de ${range.label}.`);
  });

  test('con un insight de constancia, usa su descripción tal cual', () => {
    const range = getPeriodRange('semana', REFERENCE);
    const insights = [{ id: 'constancia', icon: 'check' as const, title: 'Constancia', description: 'Registraste 3 días seguidos.' }];
    expect(buildHeadline(range, insights)).toBe('Registraste 3 días seguidos.');
  });
});

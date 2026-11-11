import { getPeriodRange, getPreviousPeriodRange } from '@/features/progress/logic';
import type { ActivitySession } from '@/features/activities/types';
import type { SymptomLog } from '@/features/symptoms/types';
import { NOT_A_DIAGNOSIS } from '../constants';
import {
  buildComparisonSentence,
  buildDoctorSummaryText,
  compareSymptoms,
  coveragePercent,
  describeBuckets,
  expiresAtFromDuration,
  hasFewRecords,
  isLinkActive,
  isLinkExpired,
  notesInRange,
  recordingCoverage,
  severityDistribution,
  sharedCategories,
  shortDelta,
  summarizeActivities,
} from '../logic';

function log(
  occurredAt: string,
  symptomType: SymptomLog['symptomType'] = 'fatiga',
  severity: SymptomLog['severity'] = 'moderado',
  note: string | null = null
): SymptomLog {
  return { id: `${occurredAt}-${symptomType}`, symptomType, severity, note, occurredAt };
}

function session(completedAt: string, area: ActivitySession['area'] = 'memoria'): ActivitySession {
  return { id: `${completedAt}-${area}`, area, completedAt };
}

// Un día fijo para que los períodos no dependan de la fecha de hoy.
const REFERENCE = new Date(2026, 10, 11); // 2026-11-11
const CURRENT = getPeriodRange('mes', REFERENCE); // noviembre 2026
const PREVIOUS = getPreviousPeriodRange('mes', REFERENCE); // octubre 2026

describe('vigencia del acceso', () => {
  const now = new Date(2026, 10, 11, 12);

  test('expiresAtFromDuration suma los meses elegidos y "sin fecha" devuelve null', () => {
    expect(expiresAtFromDuration('sinFecha', now)).toBeNull();
    expect(new Date(expiresAtFromDuration('tresMeses', now) as string).getMonth()).toBe(1); // febrero
    expect(new Date(expiresAtFromDuration('unAnio', now) as string).getFullYear()).toBe(2027);
  });

  test('un vínculo aceptado sin fecha de fin está activo', () => {
    expect(isLinkActive({ status: 'aceptado', expiresAt: null }, now)).toBe(true);
  });

  test('un vínculo aceptado con fecha pasada está vencido y no activo', () => {
    const link = { status: 'aceptado' as const, expiresAt: new Date(2026, 9, 1).toISOString() };
    expect(isLinkExpired(link, now)).toBe(true);
    expect(isLinkActive(link, now)).toBe(false);
  });

  test('un vínculo revocado o pendiente nunca está activo, aunque no tenga fecha', () => {
    expect(isLinkActive({ status: 'revocado', expiresAt: null }, now)).toBe(false);
    expect(isLinkActive({ status: 'solicitado', expiresAt: null }, now)).toBe(false);
    expect(isLinkExpired({ status: 'revocado', expiresAt: new Date(2026, 9, 1).toISOString() }, now)).toBe(false);
  });
});

describe('sharedCategories', () => {
  test('las notas dependen de los síntomas: sin síntomas no hay notas', () => {
    expect(sharedCategories({ shareSintomas: false, shareNotas: true, shareProgreso: true })).toEqual({
      sintomas: false,
      notas: false,
      actividades: true,
    });
  });

  test('por defecto las notas no se comparten', () => {
    expect(sharedCategories({ shareSintomas: true, shareNotas: false, shareProgreso: true }).notas).toBe(false);
  });
});

describe('compareSymptoms', () => {
  const logs = [
    // Noviembre: fatiga 3 días (el 2 tiene dos registros del mismo tipo), dolor 1 día
    log(new Date(2026, 10, 2, 9).toISOString(), 'fatiga'),
    log(new Date(2026, 10, 2, 18).toISOString(), 'fatiga'),
    log(new Date(2026, 10, 5).toISOString(), 'fatiga'),
    log(new Date(2026, 10, 8).toISOString(), 'fatiga'),
    log(new Date(2026, 10, 9).toISOString(), 'dolor'),
    // Octubre: fatiga 1 día, dolor 4 días, visión 2 días
    log(new Date(2026, 9, 3).toISOString(), 'fatiga'),
    log(new Date(2026, 9, 4).toISOString(), 'dolor'),
    log(new Date(2026, 9, 5).toISOString(), 'dolor'),
    log(new Date(2026, 9, 6).toISOString(), 'dolor'),
    log(new Date(2026, 9, 7).toISOString(), 'dolor'),
    log(new Date(2026, 9, 8).toISOString(), 'vision_borrosa'),
    log(new Date(2026, 9, 9).toISOString(), 'vision_borrosa'),
  ];

  const result = compareSymptoms(logs, CURRENT, PREVIOUS, 'mes');
  const byType = Object.fromEntries(result.map((item) => [item.type, item]));

  test('cuenta días distintos por tipo, no registros', () => {
    expect(byType.fatiga.currentDays).toBe(3);
    expect(byType.fatiga.previousDays).toBe(1);
  });

  test('dirección y texto neutros, con singular y plural', () => {
    expect(byType.fatiga.direction).toBe('mas');
    expect(byType.fatiga.text).toBe('2 días más que el mes anterior');
    expect(byType.dolor.direction).toBe('menos');
    expect(byType.dolor.text).toBe('3 días menos que el mes anterior');
  });

  test('un tipo que solo estaba en el período anterior aparece con 0 días actuales', () => {
    expect(byType.vision_borrosa.currentDays).toBe(0);
    expect(byType.vision_borrosa.previousDays).toBe(2);
  });

  test('ordena por días del período actual, de más a menos', () => {
    expect(result[0].type).toBe('fatiga');
  });

  test('igual cuando no cambia', () => {
    const same = compareSymptoms(
      [log(new Date(2026, 10, 2).toISOString()), log(new Date(2026, 9, 2).toISOString())],
      CURRENT,
      PREVIOUS,
      'mes'
    );
    expect(same[0].direction).toBe('igual');
    expect(same[0].text).toBe('Igual que el mes anterior');
  });

  test('el texto no usa palabras clínicas ni de valoración', () => {
    const text = result.map((item) => item.text).join(' ') + buildComparisonSentence(result, 'mes');
    expect(text).not.toMatch(/mejor|peor|empeor|alerta|riesgo|anormal/i);
  });
});

describe('buildComparisonSentence', () => {
  test('sin síntomas en ningún período lo dice', () => {
    expect(buildComparisonSentence([], 'mes')).toMatch(/No hay síntomas registrados/);
  });

  test('si nada cambió dice que se mantuvieron parecidos', () => {
    const same = compareSymptoms(
      [log(new Date(2026, 10, 2).toISOString()), log(new Date(2026, 9, 2).toISOString())],
      CURRENT,
      PREVIOUS,
      'mes'
    );
    expect(buildComparisonSentence(same, 'mes')).toMatch(/se mantuvieron parecidos/);
  });
});

describe('severityDistribution', () => {
  test('cuenta registros por intensidad solo dentro del período', () => {
    const logs = [
      log(new Date(2026, 10, 2).toISOString(), 'fatiga', 'leve'),
      log(new Date(2026, 10, 3).toISOString(), 'fatiga', 'leve'),
      log(new Date(2026, 10, 4).toISOString(), 'dolor', 'fuerte'),
      log(new Date(2026, 9, 4).toISOString(), 'dolor', 'moderado'), // octubre: no cuenta
    ];
    expect(severityDistribution(logs, CURRENT)).toEqual({ leve: 2, moderado: 0, fuerte: 1 });
  });
});

describe('recordingCoverage', () => {
  test('en el mes en curso los días transcurridos llegan hasta hoy', () => {
    const now = new Date(2026, 10, 11, 15); // 11 de noviembre
    const logs = [log(new Date(2026, 10, 2).toISOString()), log(new Date(2026, 10, 5).toISOString())];
    expect(recordingCoverage(logs, CURRENT, now)).toEqual({ daysWithRecords: 2, elapsedDays: 11 });
  });

  test('en un mes ya terminado son todos los días del mes', () => {
    const now = new Date(2026, 10, 11);
    expect(recordingCoverage([], PREVIOUS, now).elapsedDays).toBe(31); // octubre
  });

  test('un período futuro no tiene días transcurridos', () => {
    const now = new Date(2026, 8, 1);
    expect(recordingCoverage([], CURRENT, now).elapsedDays).toBe(0);
  });

  test('hasFewRecords marca pocos registros con el umbral del módulo', () => {
    expect(hasFewRecords(3)).toBe(true);
    expect(hasFewRecords(5)).toBe(false);
  });
});

describe('notesInRange', () => {
  test('solo notas con texto, del período, la más reciente primero', () => {
    const logs = [
      log(new Date(2026, 10, 2).toISOString(), 'fatiga', 'leve', 'Me cansé al subir escaleras'),
      log(new Date(2026, 10, 3).toISOString(), 'fatiga', 'leve', '   '),
      log(new Date(2026, 10, 8).toISOString(), 'dolor', 'leve', 'Dolor de cabeza'),
      log(new Date(2026, 9, 8).toISOString(), 'dolor', 'leve', 'Nota de octubre'),
      log(new Date(2026, 10, 9).toISOString(), 'dolor', 'leve', null),
    ];
    const notes = notesInRange(logs, CURRENT);
    expect(notes.map((item) => item.note)).toEqual(['Dolor de cabeza', 'Me cansé al subir escaleras']);
  });
});

describe('summarizeActivities', () => {
  test('cuenta sesiones por área dentro del período y trae el nivel actual', () => {
    const sessions = [
      session(new Date(2026, 10, 2).toISOString(), 'memoria'),
      session(new Date(2026, 10, 3).toISOString(), 'memoria'),
      session(new Date(2026, 10, 4).toISOString(), 'movimiento'),
      session(new Date(2026, 9, 4).toISOString(), 'atencion'), // octubre: no cuenta
    ];
    const result = summarizeActivities(sessions, [{ area: 'memoria', level: 3 }], CURRENT);
    expect(result).toEqual([
      { area: 'memoria', sessions: 2, level: 3 },
      { area: 'atencion', sessions: 0, level: null },
      { area: 'movimiento', sessions: 1, level: null },
    ]);
  });
});

describe('textos cortos del resumen', () => {
  test('shortDelta da la diferencia con singular y plural, o «Igual»', () => {
    expect(shortDelta({ currentDays: 9, previousDays: 6 })).toBe('3 días más');
    expect(shortDelta({ currentDays: 1, previousDays: 2 })).toBe('1 día menos');
    expect(shortDelta({ currentDays: 2, previousDays: 2 })).toBe('Igual');
  });

  test('coveragePercent redondea y no pasa de 100 ni divide por cero', () => {
    expect(coveragePercent({ daysWithRecords: 18, elapsedDays: 26 })).toBe(69);
    expect(coveragePercent({ daysWithRecords: 3, elapsedDays: 0 })).toBe(0);
    expect(coveragePercent({ daysWithRecords: 40, elapsedDays: 30 })).toBe(100);
  });

  test('describeBuckets nombra la semana o semanas con más días, sin valorar', () => {
    expect(describeBuckets([{ label: 'Semana 1', symptomDays: 3 }, { label: 'Semana 2', symptomDays: 6 }])).toBe(
      'Semana 2 concentró más días con síntomas (6 días).'
    );
    expect(
      describeBuckets([
        { label: 'Semana 1', symptomDays: 5 },
        { label: 'Semana 2', symptomDays: 5 },
        { label: 'Semana 3', symptomDays: 1 },
      ])
    ).toBe('Semana 1 y Semana 2 concentraron más días con síntomas (5 días).');
    expect(describeBuckets([{ label: 'Semana 1', symptomDays: 0 }])).toMatch(/No hubo días/);
  });
});

describe('buildDoctorSummaryText', () => {
  const base = {
    patientName: 'Laura G.',
    range: CURRENT,
    period: 'mes' as const,
    comparisonSentence: 'Fatiga: 2 días más que el mes anterior.',
    comparisons: compareSymptoms([log(new Date(2026, 10, 2).toISOString())], CURRENT, PREVIOUS, 'mes'),
    coverage: { daysWithRecords: 1, elapsedDays: 11 },
    severity: { leve: 0, moderado: 1, fuerte: 0 },
  };

  test('siempre cierra con la aclaración de que no es un diagnóstico', () => {
    const text = buildDoctorSummaryText({ ...base, activities: null, notes: null });
    expect(text.trim().endsWith(NOT_A_DIAGNOSIS)).toBe(true);
  });

  test('sin permiso de actividades o notas, esas secciones no aparecen', () => {
    const text = buildDoctorSummaryText({ ...base, activities: null, notes: null });
    expect(text).not.toMatch(/Actividades:/);
    expect(text).not.toMatch(/Notas del paciente:/);
  });

  test('con notas y actividades compartidas, las incluye', () => {
    const text = buildDoctorSummaryText({
      ...base,
      activities: [{ area: 'memoria', sessions: 2, level: 3 }],
      notes: [{ id: '1', occurredAt: new Date(2026, 10, 8).toISOString(), symptomType: 'dolor', note: 'Dolor de cabeza' }],
    });
    expect(text).toMatch(/Memoria: 2 sesión\(es\), nivel 3/);
    expect(text).toMatch(/Dolor de cabeza/);
  });
});

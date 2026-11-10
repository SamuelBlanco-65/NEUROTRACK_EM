import { buildMonthGrid, isoDateOfDate, leadingBlankCount, logsForIsoDate } from '../calendar';
import type { SymptomLog } from '../types';

function log(occurredAt: string, severity: SymptomLog['severity'] = 'leve'): SymptomLog {
  return { id: occurredAt, symptomType: 'fatiga', severity, note: null, occurredAt };
}

describe('buildMonthGrid', () => {
  test('genera un día por cada día del mes', () => {
    const grid = buildMonthGrid(2026, 10, []); // noviembre 2026 tiene 30 días
    expect(grid).toHaveLength(30);
    expect(grid[0]).toMatchObject({ date: 1, isoDate: '2026-11-01', worstSeverity: null, logCount: 0 });
  });

  test('agrupa varios registros del mismo día y queda con la severidad más alta', () => {
    const logs = [
      log(new Date(2026, 10, 5, 8).toISOString(), 'leve'),
      log(new Date(2026, 10, 5, 20).toISOString(), 'fuerte'),
      log(new Date(2026, 10, 5, 12).toISOString(), 'moderado'),
    ];
    const grid = buildMonthGrid(2026, 10, logs);
    const day5 = grid.find((day) => day.date === 5)!;
    expect(day5.logCount).toBe(3);
    expect(day5.worstSeverity).toBe('fuerte');
  });

  test('no mezcla registros de otro mes', () => {
    const logs = [log(new Date(2026, 9, 5, 8).toISOString())]; // octubre
    const grid = buildMonthGrid(2026, 10, logs); // noviembre
    expect(grid.every((day) => day.logCount === 0)).toBe(true);
  });
});

describe('leadingBlankCount', () => {
  test('cuenta columnas vacías con la semana empezando en lunes', () => {
    // 1 de noviembre de 2026 es domingo → 6 columnas vacías antes del día 1.
    expect(leadingBlankCount(2026, 10)).toBe(6);
    // 1 de diciembre de 2026 es martes → 1 columna vacía.
    expect(leadingBlankCount(2026, 11)).toBe(1);
  });
});

describe('logsForIsoDate', () => {
  test('filtra solo los registros de la fecha exacta', () => {
    const logs = [
      log(new Date(2026, 10, 5, 8).toISOString()),
      log(new Date(2026, 10, 6, 8).toISOString()),
    ];
    expect(logsForIsoDate(logs, '2026-11-05')).toHaveLength(1);
    expect(logsForIsoDate(logs, '2026-11-07')).toHaveLength(0);
  });
});

describe('isoDateOfDate', () => {
  test('formatea con ceros a la izquierda', () => {
    expect(isoDateOfDate(new Date(2026, 0, 2))).toBe('2026-01-02');
  });
});

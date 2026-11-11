import { distinctSymptomDays, symptomDaysByType } from '../summary';
import type { SymptomLog } from '../types';

function log(day: number, hour: number, symptomType: SymptomLog['symptomType']): SymptomLog {
  const occurredAt = new Date(2026, 10, day, hour).toISOString();
  return { id: `${day}-${hour}-${symptomType}`, symptomType, severity: 'leve', note: null, occurredAt };
}

describe('symptomDaysByType', () => {
  test('cuenta días distintos por tipo y ordena de más a menos', () => {
    const logs = [log(2, 9, 'fatiga'), log(2, 18, 'fatiga'), log(3, 9, 'fatiga'), log(3, 9, 'dolor')];
    expect(symptomDaysByType(logs)).toEqual([
      { type: 'fatiga', days: 2 },
      { type: 'dolor', days: 1 },
    ]);
  });

  test('sin registros devuelve una lista vacía', () => {
    expect(symptomDaysByType([])).toEqual([]);
  });
});

describe('distinctSymptomDays', () => {
  test('varios registros el mismo día cuentan como un día', () => {
    expect(distinctSymptomDays([log(2, 9, 'fatiga'), log(2, 18, 'dolor'), log(4, 9, 'fatiga')])).toBe(2);
  });
});

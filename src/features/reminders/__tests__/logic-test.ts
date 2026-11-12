import { combineDateAndTime, defaultReminderDate, isFutureReminder, reminderCategoryLabel } from '../logic';

describe('reminderCategoryLabel', () => {
  it('usa la etiqueta estándar de las categorías de siempre', () => {
    expect(reminderCategoryLabel('medicacion')).toBe('Medicación');
    expect(reminderCategoryLabel('cita', 'ignorado')).toBe('Cita médica');
  });

  it('en «otro» usa el nombre propio, y si no lo escribieron, «Otro»', () => {
    expect(reminderCategoryLabel('otro', '  Terapia  ')).toBe('Terapia');
    expect(reminderCategoryLabel('otro', '   ')).toBe('Otro');
    expect(reminderCategoryLabel('otro', null)).toBe('Otro');
  });
});

describe('defaultReminderDate', () => {
  it('propone la próxima hora en punto', () => {
    const next = defaultReminderDate(new Date(2026, 10, 12, 10, 20, 35));
    expect(next.getHours()).toBe(11);
    expect(next.getMinutes()).toBe(0);
    expect(next.getSeconds()).toBe(0);
  });

  it('pasa al día siguiente si la próxima hora cae después de medianoche', () => {
    const next = defaultReminderDate(new Date(2026, 10, 12, 23, 30));
    expect(next.getDate()).toBe(13);
    expect(next.getHours()).toBe(0);
  });
});

describe('combineDateAndTime', () => {
  it('toma el día de la primera fecha y la hora de la segunda', () => {
    const combined = combineDateAndTime(new Date(2026, 10, 20, 8, 0), new Date(2026, 0, 1, 15, 45));
    expect(combined.getFullYear()).toBe(2026);
    expect(combined.getMonth()).toBe(10);
    expect(combined.getDate()).toBe(20);
    expect(combined.getHours()).toBe(15);
    expect(combined.getMinutes()).toBe(45);
  });

  it('no modifica las fechas originales', () => {
    const day = new Date(2026, 10, 20, 8, 0);
    combineDateAndTime(day, new Date(2026, 0, 1, 15, 45));
    expect(day.getHours()).toBe(8);
  });
});

describe('isFutureReminder', () => {
  const now = new Date(2026, 10, 12, 10, 0, 0);

  it('acepta una hora futura y rechaza una ya pasada', () => {
    expect(isFutureReminder(new Date(2026, 10, 12, 11, 0), now)).toBe(true);
    expect(isFutureReminder(new Date(2026, 10, 12, 9, 0), now)).toBe(false);
  });

  it('da un minuto de margen por lo que tarda en guardarse', () => {
    expect(isFutureReminder(new Date(2026, 10, 12, 9, 59, 30), now)).toBe(true);
  });
});

import { logUnexpected } from '../log';

describe('logUnexpected', () => {
  afterEach(() => jest.restoreAllMocks());

  test('registra solo el nombre y el código del error, nunca su mensaje ni sus datos', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const error = Object.assign(new Error('fila con nota privada: me duele mucho'), { code: '23505' });

    logUnexpected('prueba', error);

    expect(warn).toHaveBeenCalledTimes(1);
    const impreso = JSON.stringify(warn.mock.calls[0]);
    expect(impreso).toContain('Error');
    expect(impreso).toContain('23505');
    expect(impreso).not.toContain('nota privada');
  });

  test('acepta valores que no son errores', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(() => logUnexpected('prueba', 'texto suelto')).not.toThrow();
    expect(() => logUnexpected('prueba', null)).not.toThrow();
    expect(warn).toHaveBeenCalledTimes(2);
  });
});

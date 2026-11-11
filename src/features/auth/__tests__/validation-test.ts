import { isValidEmail } from '../validation';

describe('isValidEmail', () => {
  it('acepta correos normales', () => {
    expect(isValidEmail('ana@correo.com')).toBe(true);
    expect(isValidEmail('ana.perez+em@mail.co')).toBe(true);
  });

  it('ignora espacios al inicio y al final', () => {
    expect(isValidEmail('  ana@correo.com  ')).toBe(true);
  });

  it('rechaza vacío, sin arroba, sin dominio o con espacios dentro', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('   ')).toBe(false);
    expect(isValidEmail('ana.correo.com')).toBe(false);
    expect(isValidEmail('ana@correo')).toBe(false);
    expect(isValidEmail('ana @correo.com')).toBe(false);
  });
});

import { parseAuthLink } from '../deep-link';

describe('parseAuthLink', () => {
  it('lee el código PKCE de la consulta', () => {
    expect(parseAuthLink('neurotrackem://correo/restablecer?code=abc-123')).toEqual({
      code: 'abc-123',
      accessToken: undefined,
      refreshToken: undefined,
      error: undefined,
      errorCode: undefined,
      errorDescription: undefined,
    });
  });

  it('funciona con el prefijo de Expo Go', () => {
    const params = parseAuthLink('exp://192.168.40.71:8081/--/correo/confirmar?code=xyz');
    expect(params.code).toBe('xyz');
  });

  it('lee el error que Supabase deja en el fragmento y decodifica el texto', () => {
    const params = parseAuthLink(
      'neurotrackem://correo/restablecer#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired'
    );
    expect(params.error).toBe('access_denied');
    expect(params.errorCode).toBe('otp_expired');
    expect(params.errorDescription).toBe('Email link is invalid or has expired');
    expect(params.code).toBeUndefined();
  });

  it('acepta tokens directos como respaldo', () => {
    const params = parseAuthLink('neurotrackem://correo/confirmar#access_token=aa&refresh_token=bb&type=signup');
    expect(params.accessToken).toBe('aa');
    expect(params.refreshToken).toBe('bb');
  });

  it('no falla con entradas vacías o mal formadas', () => {
    expect(parseAuthLink(null).code).toBeUndefined();
    expect(parseAuthLink('').code).toBeUndefined();
    expect(parseAuthLink('neurotrackem://correo/confirmar').code).toBeUndefined();
    expect(parseAuthLink('neurotrackem://x?code=%E0%A4%A').code).toBe('%E0%A4%A');
  });
});

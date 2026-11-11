export type AuthLinkParams = {
  /** Código PKCE de un solo uso que se canjea por la sesión. */
  code?: string;
  /** Respaldo si el enlace trae los tokens directamente (flujo implícito). */
  accessToken?: string;
  refreshToken?: string;
  /** Supabase redirige con estos campos cuando el enlace falló (vencido, ya usado...). */
  error?: string;
  errorCode?: string;
  errorDescription?: string;
};

function decode(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return value;
  }
}

function parsePairs(source: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of source.split('&')) {
    if (!part) continue;
    const eq = part.indexOf('=');
    const key = decode(eq < 0 ? part : part.slice(0, eq));
    out[key] = eq < 0 ? '' : decode(part.slice(eq + 1));
  }
  return out;
}

/**
 * Lee los parámetros que Supabase deja en el enlace del correo, vengan en la consulta (`?code=`) o en
 * el fragmento (`#error=...`, `#access_token=...`). No usa `URL` porque en React Native su
 * soporte de `searchParams` es parcial.
 */
export function parseAuthLink(url: string | null | undefined): AuthLinkParams {
  if (!url) return {};
  const hashIndex = url.indexOf('#');
  const beforeHash = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
  const fragment = hashIndex >= 0 ? url.slice(hashIndex + 1) : '';
  const queryIndex = beforeHash.indexOf('?');
  const query = queryIndex >= 0 ? beforeHash.slice(queryIndex + 1) : '';

  const params = { ...parsePairs(query), ...parsePairs(fragment) };
  return {
    code: params.code || undefined,
    accessToken: params.access_token || undefined,
    refreshToken: params.refresh_token || undefined,
    error: params.error || undefined,
    errorCode: params.error_code || undefined,
    errorDescription: params.error_description || undefined,
  };
}

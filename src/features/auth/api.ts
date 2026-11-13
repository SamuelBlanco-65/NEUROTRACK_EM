import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js';

import { buildConsentMetadata } from '@/features/legal/consent';
import { supabase } from '@/lib/supabase';
import type { AuthError, Session } from './types';

// Los correos de confirmación y de recuperación llevan a la web `web-auth/` (D-014), no a la app:
// por eso aquí no hay `emailRedirectTo`/`redirectTo` ni manejo de enlaces profundos.

function toAuthError(error: unknown): AuthError {
  if (error instanceof AuthRetryableFetchError) {
    return { authClass: 'sin-conexion', message: 'Revisa tu conexión e inténtalo de nuevo' };
  }
  if (error instanceof AuthApiError) {
    const message = error.message.toLowerCase();
    if (message.includes('invalid login credentials')) {
      return { authClass: 'credenciales-invalidas', message: 'Correo o contraseña incorrectos' };
    }
    if (message.includes('email not confirmed')) {
      return {
        authClass: 'correo-sin-confirmar',
        message: 'Confirma tu correo antes de iniciar sesión: revisa tu bandeja de entrada',
      };
    }
    if (error.code === 'same_password') {
      return { authClass: 'validacion', message: 'Elige una contraseña distinta a la que tenías' };
    }
    if (error.code === 'weak_password') {
      return { authClass: 'validacion', message: 'Esa contraseña es muy fácil de adivinar. Prueba con otra más larga' };
    }
    if (error.code === 'otp_expired' || message.includes('expired') || message.includes('invalid or has expired')) {
      return {
        authClass: 'validacion',
        message: 'El enlace venció o ya se usó. Pide uno nuevo desde la pantalla de acceso',
      };
    }
    if (message.includes('user already registered')) {
      return { authClass: 'validacion', message: 'Ya existe una cuenta con ese correo' };
    }
    if (error.status === 429 || message.includes('rate limit')) {
      return { authClass: 'validacion', message: 'Demasiados intentos. Espera unos minutos y vuelve a probar' };
    }
    if (error.status >= 500) {
      return { authClass: 'servidor', message: 'Falló el servidor, inténtalo de nuevo en un momento' };
    }
    return { authClass: 'validacion', message: 'No pudimos procesar la solicitud, revisa los datos' };
  }
  return { authClass: 'inesperado', message: 'Algo salió mal, inténtalo de nuevo' };
}

type SessionUser = { id: string; email?: string | null; user_metadata?: Record<string, unknown> } | null | undefined;

function toSession(user: SessionUser): Session | null {
  if (!user?.id || !user.email) return null;
  const fullName = user.user_metadata?.full_name;
  const name = typeof fullName === 'string' && fullName.trim().length > 0 ? fullName.trim() : null;
  return { userId: user.id, email: user.email, name };
}

export async function signIn(email: string, password: string): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw toAuthError(error);
  const session = toSession(data.session?.user);
  if (!session) throw toAuthError(undefined);
  return session;
}

/** `null` significa registro correcto pero pendiente de confirmar el correo (sin sesión real aún). */
export async function signUp(name: string, email: string, password: string): Promise<Session | null> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // `buildConsentMetadata` deja constancia de cuándo y qué versión de los términos aceptó la persona.
      data: { full_name: name, ...buildConsentMetadata() },
    },
  });
  if (error) throw toAuthError(error);
  // Con la confirmación de correo activa, registrar un correo que ya existe no da error (Supabase no
  // revela qué correos tienen cuenta) sino un usuario sin identidades y sin enviar ningún correo.
  if (data.user && data.user.identities?.length === 0) {
    throw { authClass: 'validacion', message: 'Ya existe una cuenta con ese correo' } satisfies AuthError;
  }
  return toSession(data.session?.user);
}

/** Reenvía el correo de confirmación de una cuenta recién creada. */
export async function resendConfirmationEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim() });
  if (error) throw toAuthError(error);
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw toAuthError(error);
}

/** Envía el correo de recuperación. Siempre "funciona" aunque el correo no exista (no revela cuentas). */
export async function requestPasswordReset(email: string): Promise<void> {
  // El enlace del correo apunta a la web (`web-auth/`, D-014) con la URL del sitio; no lleva `redirectTo`.
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
  if (error) throw toAuthError(error);
}

/**
 * Borra la cuenta y todos sus datos (la función `delete_my_account` del servidor borra al usuario
 * y las tablas hijas caen por `on delete cascade`). Después cierra la sesión solo en este
 * dispositivo: el usuario ya no existe y un cierre global fallaría.
 */
export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.rpc('delete_my_account');
  if (error) throw toAuthError(error);
  await supabase.auth.signOut({ scope: 'local' });
}

export async function getActiveSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw toAuthError(error);
  return toSession(data.session?.user);
}

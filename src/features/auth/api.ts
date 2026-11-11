import {
  AuthApiError,
  AuthPKCECodeVerifierMissingError,
  AuthRetryableFetchError,
  AuthError as SupabaseAuthError,
} from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

import { supabase } from '@/lib/supabase';
import { parseAuthLink } from './deep-link';
import type { AuthError, Session } from './types';

/**
 * A dónde manda la app los enlaces de los correos. `Linking.createURL` da `neurotrackem://...` en una
 * build instalada y `exp://<ip>:8081/--/...` en Expo Go. Ambas formas deben estar en
 * Authentication > URL Configuration > Redirect URLs de Supabase (ver docs/SUPABASE-CORREO.md).
 */
const CONFIRM_REDIRECT_PATH = 'correo/confirmar';
const RESET_REDIRECT_PATH = 'correo/restablecer';

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
  if (error instanceof AuthPKCECodeVerifierMissingError) {
    return {
      authClass: 'validacion',
      message: 'Abre el enlace en el mismo teléfono donde lo pediste, o pide uno nuevo',
    };
  }
  if (error instanceof SupabaseAuthError) {
    return { authClass: 'inesperado', message: 'Algo salió mal, inténtalo de nuevo' };
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
    options: { data: { full_name: name }, emailRedirectTo: Linking.createURL(CONFIRM_REDIRECT_PATH) },
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
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email.trim(),
    options: { emailRedirectTo: Linking.createURL(CONFIRM_REDIRECT_PATH) },
  });
  if (error) throw toAuthError(error);
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw toAuthError(error);
}

/** Envía el correo de recuperación. Siempre "funciona" aunque el correo no exista (no revela cuentas). */
export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: Linking.createURL(RESET_REDIRECT_PATH),
  });
  if (error) throw toAuthError(error);
}

/**
 * Abre la sesión que trae el enlace de un correo (confirmación o recuperación): canjea el `code` de un
 * solo uso, o usa los tokens si vinieran directos. Si el enlace trae un error (vencido, ya usado),
 * lo traduce.
 */
export async function consumeAuthLink(url: string): Promise<void> {
  const params = parseAuthLink(url);

  if (params.error || params.errorCode) {
    const expired = params.errorCode === 'otp_expired' || params.error === 'access_denied';
    throw {
      authClass: 'validacion',
      message: expired
        ? 'El enlace venció o ya se usó. Pide uno nuevo desde la pantalla de acceso'
        : 'No pudimos abrir el enlace. Pide uno nuevo desde la pantalla de acceso',
    } satisfies AuthError;
  }

  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error) throw toAuthError(error);
    return;
  }

  if (params.accessToken && params.refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: params.accessToken,
      refresh_token: params.refreshToken,
    });
    if (error) throw toAuthError(error);
    return;
  }

  throw { authClass: 'validacion', message: 'El enlace está incompleto. Pide uno nuevo' } satisfies AuthError;
}

/**
 * Cambia la contraseña de la sesión de recuperación y cierra TODAS las sesiones de la cuenta (también
 * las de otros teléfonos): quien tuviera la contraseña vieja pierde el acceso.
 */
export async function setNewPassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw toAuthError(error);
  await supabase.auth.signOut({ scope: 'global' });
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

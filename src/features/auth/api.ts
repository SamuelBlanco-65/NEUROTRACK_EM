import { AuthApiError, AuthRetryableFetchError, AuthError as SupabaseAuthError } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { AuthError, Session } from './types';

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
        authClass: 'validacion',
        message: 'Confirma tu correo antes de iniciar sesión: revisa tu bandeja de entrada',
      };
    }
    if (message.includes('user already registered')) {
      return { authClass: 'validacion', message: 'Ya existe una cuenta con ese correo' };
    }
    if (error.status >= 500) {
      return { authClass: 'servidor', message: 'Falló el servidor, inténtalo de nuevo en un momento' };
    }
    return { authClass: 'validacion', message: 'No pudimos procesar la solicitud, revisa los datos' };
  }
  if (error instanceof SupabaseAuthError) {
    return { authClass: 'inesperado', message: 'Algo salió mal, inténtalo de nuevo' };
  }
  return { authClass: 'inesperado', message: 'Algo salió mal, inténtalo de nuevo' };
}

function toSession(userId: string | undefined, email: string | undefined | null): Session | null {
  if (!userId || !email) return null;
  return { userId, email };
}

export async function signIn(email: string, password: string): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw toAuthError(error);
  const session = toSession(data.session?.user.id, data.session?.user.email);
  if (!session) throw toAuthError(undefined);
  return session;
}

/** `null` significa registro correcto pero pendiente de confirmar el correo (sin sesión real aún). */
export async function signUp(name: string, email: string, password: string): Promise<Session | null> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });
  if (error) throw toAuthError(error);
  return toSession(data.session?.user.id, data.session?.user.email);
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw toAuthError(error);
}

export async function getActiveSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw toAuthError(error);
  return toSession(data.session?.user.id, data.session?.user.email);
}

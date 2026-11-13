import { logUnexpected } from '@/lib/log';
import { supabase } from '@/lib/supabase';
import type { ActivitiesError, ActivityArea, ActivitySession, AreaProgress } from './types';

type PostgrestLikeError = { code: string; message: string };

function isPostgrestLikeError(error: unknown): error is PostgrestLikeError {
  return typeof error === 'object' && error !== null && 'code' in error && 'message' in error;
}

function toActivitiesError(error: unknown): ActivitiesError {
  if (isPostgrestLikeError(error)) {
    if (error.code === 'PGRST205') {
      return {
        errorClass: 'servidor',
        message: 'Falta crear la tabla de progreso en la base de datos (ver supabase/migrations)',
      };
    }
    if (error.code === 'PGRST301' || error.code === '401') {
      return { errorClass: 'servidor', message: 'Tu sesión expiró, vuelve a iniciar sesión' };
    }
    return { errorClass: 'servidor', message: 'Falló el servidor, inténtalo de nuevo en un momento' };
  }
  if (error instanceof TypeError) {
    return { errorClass: 'sin-conexion', message: 'Revisa tu conexión e inténtalo de nuevo' };
  }
  logUnexpected('activities', error);
  return { errorClass: 'inesperado', message: 'Algo salió mal, inténtalo de nuevo' };
}

export async function listAreaProgress(patientId: string): Promise<AreaProgress[]> {
  const { data, error } = await supabase
    .from('activity_progress')
    .select('area, level')
    .eq('patient_id', patientId);

  if (error) throw toActivitiesError(error);
  return (data as { area: ActivityArea; level: number }[]).map((row) => ({ area: row.area, level: row.level }));
}

export async function saveAreaLevel(patientId: string, area: ActivityArea, level: number): Promise<void> {
  const { error } = await supabase
    .from('activity_progress')
    .upsert(
      { patient_id: patientId, area, level, updated_at: new Date().toISOString() },
      { onConflict: 'patient_id,area' }
    );

  if (error) throw toActivitiesError(error);
}

/** Registra una sesión completada para el historial de Progreso (RF-005). */
export async function logActivitySession(patientId: string, area: ActivityArea): Promise<void> {
  const { error } = await supabase.from('activity_sessions').insert({ patient_id: patientId, area });
  if (error) throw toActivitiesError(error);
}

export async function listActivitySessionsBetween(
  patientId: string,
  startISO: string,
  endISO: string
): Promise<ActivitySession[]> {
  const { data, error } = await supabase
    .from('activity_sessions')
    .select('id, area, completed_at')
    .eq('patient_id', patientId)
    .gte('completed_at', startISO)
    .lt('completed_at', endISO)
    .order('completed_at', { ascending: true });

  if (error) throw toActivitiesError(error);
  return (data as { id: string; area: ActivityArea; completed_at: string }[]).map((row) => ({
    id: row.id,
    area: row.area,
    completedAt: row.completed_at,
  }));
}

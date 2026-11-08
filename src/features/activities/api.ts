import { supabase } from '@/lib/supabase';
import type { ActivitiesError, ActivityArea, AreaProgress } from './types';

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
  console.warn('[activities] error inesperado', error);
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

import { logUnexpected } from '@/lib/log';
import { supabase } from '@/lib/supabase';
import type { SymptomLog, SymptomLogDraft, SymptomsError } from './types';

type PostgrestLikeError = { code: string; message: string; details?: string; hint?: string };

function isPostgrestLikeError(error: unknown): error is PostgrestLikeError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as { code: unknown }).code === 'string'
  );
}

type SymptomLogRow = {
  id: string;
  symptom_type: SymptomLog['symptomType'];
  custom_label?: string | null;
  severity: SymptomLog['severity'];
  note: string | null;
  occurred_at: string;
};

function toSymptomLog(row: SymptomLogRow): SymptomLog {
  return {
    id: row.id,
    symptomType: row.symptom_type,
    customLabel: row.custom_label ?? null,
    severity: row.severity,
    note: row.note,
    occurredAt: row.occurred_at,
  };
}

function toSymptomsError(error: unknown): SymptomsError {
  if (isPostgrestLikeError(error)) {
    if (error.code === 'PGRST205') {
      return {
        errorClass: 'servidor',
        message: 'Falta crear la tabla de síntomas en la base de datos (ver supabase/migrations)',
      };
    }
    if (error.code === 'PGRST202' || error.code === '42883') {
      return {
        errorClass: 'servidor',
        message: 'Falta actualizar la base de datos con la última migración (ver supabase/migrations)',
      };
    }
    if (error.code === 'PGRST301' || error.code === '401') {
      return { errorClass: 'validacion', message: 'Tu sesión expiró, vuelve a iniciar sesión' };
    }
    if (error.code.startsWith('23')) {
      return { errorClass: 'validacion', message: 'Revisa los datos del registro' };
    }
    return { errorClass: 'servidor', message: 'Falló el servidor, inténtalo de nuevo en un momento' };
  }
  if (error instanceof TypeError) {
    return { errorClass: 'sin-conexion', message: 'Revisa tu conexión e inténtalo de nuevo' };
  }
  logUnexpected('symptoms', error);
  return { errorClass: 'inesperado', message: 'Algo salió mal, inténtalo de nuevo' };
}

export async function createSymptomLog(patientId: string, draft: SymptomLogDraft): Promise<SymptomLog> {
  const { data, error } = await supabase
    .from('symptom_logs')
    .insert({
      patient_id: patientId,
      symptom_type: draft.symptomType,
      custom_label: draft.customLabel,
      severity: draft.severity,
      note: draft.note,
      // Reloj del dispositivo, no el del servidor: así coincide con el "hoy" que ve el
      // paciente en el calendario (evita que un registro caiga en otro día por desfase horario).
      occurred_at: new Date().toISOString(),
    })
    .select('id, symptom_type, custom_label, severity, note, occurred_at')
    .single();

  if (error) throw toSymptomsError(error);
  return toSymptomLog(data as SymptomLogRow);
}

/** `month` es 0-indexado (0 = enero), igual que `Date`. */
export async function listSymptomLogsForMonth(
  patientId: string,
  year: number,
  month: number
): Promise<SymptomLog[]> {
  const start = new Date(year, month, 1).toISOString();
  const end = new Date(year, month + 1, 1).toISOString();

  const { data, error } = await supabase
    .from('symptom_logs')
    .select('id, symptom_type, custom_label, severity, note, occurred_at')
    .eq('patient_id', patientId)
    .gte('occurred_at', start)
    .lt('occurred_at', end)
    .order('occurred_at', { ascending: true });

  if (error) throw toSymptomsError(error);
  return (data as SymptomLogRow[]).map(toSymptomLog);
}

/**
 * Síntomas de OTRA persona, leídos con su permiso: única vía de lectura para cuidadores y médicos
 * (la función `shared_symptom_logs` del servidor valida el vínculo y los permisos). La nota solo
 * llega al médico que el paciente autorizó a verlas; en los demás casos `note` es `null`.
 * Sin acceso devuelve cero filas, no un error. Rango `[fromISO, toISO)`.
 */
export async function listSharedSymptomLogs(
  patientId: string,
  fromISO: string,
  toISO: string
): Promise<SymptomLog[]> {
  const { data, error } = await supabase.rpc('shared_symptom_logs', {
    p_patient: patientId,
    p_from: fromISO,
    p_to: toISO,
  });

  if (error) throw toSymptomsError(error);
  return ((data ?? []) as SymptomLogRow[]).map(toSymptomLog);
}

/** Para la pantalla de Progreso (RF-005): un rango arbitrario en vez de un mes calendario. */
export async function listSymptomLogsBetween(
  patientId: string,
  startISO: string,
  endISO: string
): Promise<SymptomLog[]> {
  const { data, error } = await supabase
    .from('symptom_logs')
    .select('id, symptom_type, custom_label, severity, note, occurred_at')
    .eq('patient_id', patientId)
    .gte('occurred_at', startISO)
    .lt('occurred_at', endISO)
    .order('occurred_at', { ascending: true });

  if (error) throw toSymptomsError(error);
  return (data as SymptomLogRow[]).map(toSymptomLog);
}

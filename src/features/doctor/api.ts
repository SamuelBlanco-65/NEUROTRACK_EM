import { listActivitySessionsBetween, listAreaProgress } from '@/features/activities/api';
import { listSharedSymptomLogs } from '@/features/symptoms/api';
import { supabase } from '@/lib/supabase';
import type { DoctorError, DoctorLink, DoctorPermissions, PatientSummaryData } from './types';

type PostgrestLikeError = { code: string; message: string };

function isPostgrestLikeError(error: unknown): error is PostgrestLikeError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as { code: unknown }).code === 'string'
  );
}

const DOCTOR_ERROR_CLASSES: readonly string[] = ['sin-conexion', 'servidor', 'validacion', 'codigo-invalido', 'inesperado'];

function isKnownError(error: unknown): error is DoctorError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'errorClass' in error &&
    'message' in error &&
    DOCTOR_ERROR_CLASSES.includes((error as { errorClass: string }).errorClass)
  );
}

function toDoctorError(error: unknown): DoctorError {
  // Los errores ya traducidos (de este módulo o de `features/activities/api`) se respetan tal cual.
  if (isKnownError(error)) return error;
  if (isPostgrestLikeError(error)) {
    if (error.code === 'PGRST116') {
      return { errorClass: 'validacion', message: 'Esta solicitud ya no está disponible. Actualiza la pantalla.' };
    }
    if (error.code === 'P0003') {
      return { errorClass: 'validacion', message: 'Demasiados intentos. Espera unos minutos y vuelve a probar' };
    }
    if (error.code === '42501') {
      return { errorClass: 'validacion', message: 'No tienes permiso para hacer ese cambio' };
    }
    if (error.code === 'PGRST205' || error.code === '42883' || error.code === 'PGRST202') {
      return {
        errorClass: 'servidor',
        message: 'Falta crear las tablas del perfil médico en la base de datos (ver supabase/migrations)',
      };
    }
    if (error.code === 'PGRST301' || error.code === '401') {
      return { errorClass: 'validacion', message: 'Tu sesión expiró, vuelve a iniciar sesión' };
    }
    if (error.code.startsWith('23')) {
      return { errorClass: 'validacion', message: 'Revisa los datos' };
    }
    return { errorClass: 'servidor', message: 'Falló el servidor, inténtalo de nuevo en un momento' };
  }
  if (error instanceof TypeError) {
    return { errorClass: 'sin-conexion', message: 'Revisa tu conexión e inténtalo de nuevo' };
  }
  console.warn('[doctor] error inesperado', error);
  return { errorClass: 'inesperado', message: 'Algo salió mal, inténtalo de nuevo' };
}

type DoctorLinkRow = {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  patient_name: string | null;
  doctor_name: string | null;
  doctor_email: string | null;
  professional_id: string | null;
  invite_code: string;
  status: DoctorLink['status'];
  share_sintomas: boolean;
  share_notas: boolean;
  share_progreso: boolean;
  expires_at: string | null;
  last_viewed_at: string | null;
  created_at: string;
  responded_at: string | null;
};

const LINK_COLUMNS =
  'id, patient_id, doctor_id, patient_name, doctor_name, doctor_email, professional_id, invite_code, status, share_sintomas, share_notas, share_progreso, expires_at, last_viewed_at, created_at, responded_at';

function toDoctorLink(row: DoctorLinkRow): DoctorLink {
  return {
    id: row.id,
    patientId: row.patient_id,
    doctorId: row.doctor_id,
    patientName: row.patient_name,
    doctorName: row.doctor_name,
    doctorEmail: row.doctor_email,
    professionalId: row.professional_id,
    inviteCode: row.invite_code,
    status: row.status,
    shareSintomas: row.share_sintomas,
    shareNotas: row.share_notas,
    shareProgreso: row.share_progreso,
    expiresAt: row.expires_at,
    lastViewedAt: row.last_viewed_at,
    createdAt: row.created_at,
    respondedAt: row.responded_at,
  };
}

// ---------------------------------------------------------------------------------------
// Lado paciente
// ---------------------------------------------------------------------------------------

/**
 * El paciente tiene como máximo una invitación vigente (pendiente, sin reclamar, hasta 7 días).
 * El código lo genera el servidor con `create_doctor_invite`: si el cliente lo eligiera, podría
 * probar códigos ajenos sin pasar por el límite de intentos.
 */
export async function getOrCreateDoctorInvite(): Promise<DoctorLink> {
  const { data, error } = await supabase.rpc('create_doctor_invite');
  if (error) throw toDoctorError(error);
  const row = (Array.isArray(data) ? data[0] : data) as DoctorLinkRow | undefined;
  if (!row) throw toDoctorError({ code: 'PGRST116', message: 'sin invitación' });
  return toDoctorLink(row);
}

export async function regenerateDoctorInvite(inviteId: string): Promise<DoctorLink> {
  const { error: deleteError } = await supabase.from('doctor_links').delete().eq('id', inviteId);
  if (deleteError) throw toDoctorError(deleteError);
  return getOrCreateDoctorInvite();
}

export async function listDoctorRequests(patientId: string): Promise<DoctorLink[]> {
  const { data, error } = await supabase
    .from('doctor_links')
    .select(LINK_COLUMNS)
    .eq('patient_id', patientId)
    .eq('status', 'solicitado')
    .order('created_at', { ascending: false });

  if (error) throw toDoctorError(error);
  return (data as DoctorLinkRow[]).map(toDoctorLink);
}

export async function listAcceptedDoctors(patientId: string): Promise<DoctorLink[]> {
  const { data, error } = await supabase
    .from('doctor_links')
    .select(LINK_COLUMNS)
    .eq('patient_id', patientId)
    .eq('status', 'aceptado')
    .order('responded_at', { ascending: false });

  if (error) throw toDoctorError(error);
  return (data as DoctorLinkRow[]).map(toDoctorLink);
}

export async function respondToDoctorRequest(
  linkId: string,
  accept: boolean,
  permissions: DoctorPermissions,
  expiresAt: string | null
): Promise<DoctorLink> {
  const { data, error } = await supabase
    .from('doctor_links')
    .update({
      status: accept ? 'aceptado' : 'rechazado',
      share_sintomas: permissions.shareSintomas,
      share_notas: permissions.shareNotas,
      share_progreso: permissions.shareProgreso,
      expires_at: accept ? expiresAt : null,
      responded_at: new Date().toISOString(),
    })
    .eq('id', linkId)
    .eq('status', 'solicitado')
    .select(LINK_COLUMNS)
    .single();

  if (error) throw toDoctorError(error);
  return toDoctorLink(data as DoctorLinkRow);
}

export async function revokeDoctorAccess(linkId: string): Promise<DoctorLink> {
  const { data, error } = await supabase
    .from('doctor_links')
    .update({ status: 'revocado', responded_at: new Date().toISOString() })
    .eq('id', linkId)
    .eq('status', 'aceptado')
    .select(LINK_COLUMNS)
    .single();

  if (error) throw toDoctorError(error);
  return toDoctorLink(data as DoctorLinkRow);
}

// ---------------------------------------------------------------------------------------
// Lado médico
// ---------------------------------------------------------------------------------------

/**
 * El médico «reclama» el código del paciente: queda en `solicitado` hasta que el paciente acepte.
 * Lo hace la función `claim_doctor_invite` del servidor: nombre y correo salen de su sesión, no del cliente.
 */
export async function claimDoctorInvite(code: string, professionalId: string): Promise<DoctorLink> {
  const { data, error } = await supabase.rpc('claim_doctor_invite', {
    p_code: code,
    p_professional_id: professionalId.trim() === '' ? null : professionalId.trim(),
  });

  if (error) throw toDoctorError(error);
  const rows = (data ?? []) as DoctorLinkRow[];
  if (rows.length === 0) {
    throw { errorClass: 'codigo-invalido', message: 'Ese código no existe o ya se usó. Pídele a tu paciente uno nuevo.' } satisfies DoctorError;
  }
  return toDoctorLink(rows[0]);
}

/** Vínculos del médico (pendientes de aceptar, aceptados, vencidos...), el más reciente primero. */
export async function listMyPatients(doctorId: string): Promise<DoctorLink[]> {
  const { data, error } = await supabase
    .from('doctor_links')
    .select(LINK_COLUMNS)
    .eq('doctor_id', doctorId)
    .in('status', ['solicitado', 'aceptado'])
    .order('created_at', { ascending: false });

  if (error) throw toDoctorError(error);
  return (data as DoctorLinkRow[]).map(toDoctorLink);
}

export async function markDoctorViewed(linkId: string): Promise<void> {
  const { error } = await supabase.rpc('mark_doctor_viewed', { p_link: linkId });
  if (error) throw toDoctorError(error);
}

/**
 * Datos crudos del paciente en `[fromISO, toISO)`. Si el paciente no compartió una categoría, la
 * base de datos devuelve cero filas (no un error): la pantalla usa los permisos del vínculo para
 * explicar «no compartió esto» en vez de mostrar un vacío engañoso.
 */
export async function fetchPatientSummaryData(
  link: Pick<DoctorLink, 'patientId' | 'shareSintomas' | 'shareProgreso'>,
  fromISO: string,
  toISO: string
): Promise<PatientSummaryData> {
  try {
    const [symptomLogs, activitySessions, areaProgress] = await Promise.all([
      link.shareSintomas ? listSharedSymptomLogs(link.patientId, fromISO, toISO) : Promise.resolve([]),
      link.shareProgreso ? listActivitySessionsBetween(link.patientId, fromISO, toISO) : Promise.resolve([]),
      link.shareProgreso ? listAreaProgress(link.patientId) : Promise.resolve([]),
    ]);
    return { symptomLogs, activitySessions, areaProgress };
  } catch (error) {
    throw toDoctorError(error);
  }
}

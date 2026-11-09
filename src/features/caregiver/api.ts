import { supabase } from '@/lib/supabase';
import type {
  CaregiverCheer,
  CaregiverError,
  CaregiverLink,
  CaregiverObservation,
  CaregiverObservationDraft,
  CaregiverPermissions,
} from './types';

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

function toCaregiverError(error: unknown): CaregiverError {
  if (isPostgrestLikeError(error)) {
    if (error.code === 'PGRST116') {
      return { errorClass: 'codigo-invalido', message: 'Ese código no es válido o ya fue usado' };
    }
    if (error.code === 'PGRST205') {
      return {
        errorClass: 'servidor',
        message: 'Falta crear la tabla de vinculación en la base de datos (ver supabase/migrations)',
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
  console.warn('[caregiver] error inesperado', error);
  return { errorClass: 'inesperado', message: 'Algo salió mal, inténtalo de nuevo' };
}

type CaregiverLinkRow = {
  id: string;
  patient_id: string;
  caregiver_id: string | null;
  caregiver_email: string | null;
  caregiver_name: string | null;
  invite_code: string;
  status: CaregiverLink['status'];
  share_sintomas: boolean;
  share_progreso: boolean;
  share_recordatorios: boolean;
  created_at: string;
  responded_at: string | null;
};

const LINK_COLUMNS =
  'id, patient_id, caregiver_id, caregiver_email, caregiver_name, invite_code, status, share_sintomas, share_progreso, share_recordatorios, created_at, responded_at';

function toCaregiverLink(row: CaregiverLinkRow): CaregiverLink {
  return {
    id: row.id,
    patientId: row.patient_id,
    caregiverId: row.caregiver_id,
    caregiverEmail: row.caregiver_email,
    caregiverName: row.caregiver_name,
    inviteCode: row.invite_code,
    status: row.status,
    shareSintomas: row.share_sintomas,
    shareProgreso: row.share_progreso,
    shareRecordatorios: row.share_recordatorios,
    createdAt: row.created_at,
    respondedAt: row.responded_at,
  };
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin 0/O ni 1/I: se confunden al transcribir a mano

function generateInviteCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

/** El paciente siempre tiene como máximo una invitación pendiente sin reclamar a la vez. */
export async function getOrCreatePatientInvite(patientId: string): Promise<CaregiverLink> {
  const { data: existing, error: selectError } = await supabase
    .from('caregiver_links')
    .select(LINK_COLUMNS)
    .eq('patient_id', patientId)
    .eq('status', 'pendiente')
    .is('caregiver_id', null)
    .maybeSingle();

  if (selectError) throw toCaregiverError(selectError);
  if (existing) return toCaregiverLink(existing as CaregiverLinkRow);

  const { data, error } = await supabase
    .from('caregiver_links')
    .insert({ patient_id: patientId, invite_code: generateInviteCode() })
    .select(LINK_COLUMNS)
    .single();

  if (error) throw toCaregiverError(error);
  return toCaregiverLink(data as CaregiverLinkRow);
}

export async function regeneratePatientInvite(patientId: string, inviteId: string): Promise<CaregiverLink> {
  const { error: deleteError } = await supabase.from('caregiver_links').delete().eq('id', inviteId);
  if (deleteError) throw toCaregiverError(deleteError);
  return getOrCreatePatientInvite(patientId);
}

export async function listIncomingRequests(patientId: string): Promise<CaregiverLink[]> {
  const { data, error } = await supabase
    .from('caregiver_links')
    .select(LINK_COLUMNS)
    .eq('patient_id', patientId)
    .eq('status', 'solicitado')
    .order('created_at', { ascending: false });

  if (error) throw toCaregiverError(error);
  return (data as CaregiverLinkRow[]).map(toCaregiverLink);
}

export async function listAcceptedCaregivers(patientId: string): Promise<CaregiverLink[]> {
  const { data, error } = await supabase
    .from('caregiver_links')
    .select(LINK_COLUMNS)
    .eq('patient_id', patientId)
    .eq('status', 'aceptado')
    .order('responded_at', { ascending: false });

  if (error) throw toCaregiverError(error);
  return (data as CaregiverLinkRow[]).map(toCaregiverLink);
}

export async function respondToRequest(
  linkId: string,
  accept: boolean,
  permissions: CaregiverPermissions
): Promise<CaregiverLink> {
  const { data, error } = await supabase
    .from('caregiver_links')
    .update({
      status: accept ? 'aceptado' : 'rechazado',
      share_sintomas: permissions.shareSintomas,
      share_progreso: permissions.shareProgreso,
      share_recordatorios: permissions.shareRecordatorios,
      responded_at: new Date().toISOString(),
    })
    .eq('id', linkId)
    .select(LINK_COLUMNS)
    .single();

  if (error) throw toCaregiverError(error);
  return toCaregiverLink(data as CaregiverLinkRow);
}

export async function revokeCaregiverAccess(linkId: string): Promise<CaregiverLink> {
  const { data, error } = await supabase
    .from('caregiver_links')
    .update({ status: 'revocado', responded_at: new Date().toISOString() })
    .eq('id', linkId)
    .select(LINK_COLUMNS)
    .single();

  if (error) throw toCaregiverError(error);
  return toCaregiverLink(data as CaregiverLinkRow);
}

/** El cuidador "reclama" el código del paciente: queda en `solicitado` hasta que el paciente acepte. */
export async function claimInviteCode(
  code: string,
  caregiver: { id: string; email: string | null; name: string | null }
): Promise<CaregiverLink> {
  const { data, error } = await supabase
    .from('caregiver_links')
    .update({
      caregiver_id: caregiver.id,
      caregiver_email: caregiver.email,
      caregiver_name: caregiver.name,
      status: 'solicitado',
    })
    .eq('invite_code', code.toUpperCase())
    .eq('status', 'pendiente')
    .is('caregiver_id', null)
    .select(LINK_COLUMNS)
    .single();

  if (error) throw toCaregiverError(error);
  return toCaregiverLink(data as CaregiverLinkRow);
}

/** Vínculos del cuidador (como quien acompaña), el más reciente primero. */
export async function listMyLinksAsCaregiver(caregiverId: string): Promise<CaregiverLink[]> {
  const { data, error } = await supabase
    .from('caregiver_links')
    .select(LINK_COLUMNS)
    .eq('caregiver_id', caregiverId)
    .order('created_at', { ascending: false });

  if (error) throw toCaregiverError(error);
  return (data as CaregiverLinkRow[]).map(toCaregiverLink);
}

type ObservationRow = {
  id: string;
  link_id: string;
  patient_id: string;
  category: CaregiverObservation['category'];
  note: string;
  occurred_at: string;
};

const OBSERVATION_COLUMNS = 'id, link_id, patient_id, category, note, occurred_at';

function toObservation(row: ObservationRow): CaregiverObservation {
  return {
    id: row.id,
    linkId: row.link_id,
    patientId: row.patient_id,
    category: row.category,
    note: row.note,
    occurredAt: row.occurred_at,
  };
}

/** Bitácora privada del cuidador (RF-006): el paciente nunca accede a estas notas. */
export async function listMyObservations(caregiverId: string): Promise<CaregiverObservation[]> {
  const { data, error } = await supabase
    .from('caregiver_observations')
    .select(OBSERVATION_COLUMNS)
    .eq('caregiver_id', caregiverId)
    .order('occurred_at', { ascending: false });

  if (error) throw toCaregiverError(error);
  return (data as ObservationRow[]).map(toObservation);
}

export async function createObservation(
  caregiverId: string,
  draft: CaregiverObservationDraft
): Promise<CaregiverObservation> {
  const { data, error } = await supabase
    .from('caregiver_observations')
    .insert({
      caregiver_id: caregiverId,
      link_id: draft.linkId,
      patient_id: draft.patientId,
      category: draft.category,
      note: draft.note,
      occurred_at: new Date().toISOString(),
    })
    .select(OBSERVATION_COLUMNS)
    .single();

  if (error) throw toCaregiverError(error);
  return toObservation(data as ObservationRow);
}

type CheerRow = {
  id: string;
  link_id: string;
  patient_id: string;
  message: string;
  created_at: string;
  read_at: string | null;
};

const CHEER_COLUMNS = 'id, link_id, patient_id, message, created_at, read_at';

function toCheer(row: CheerRow): CaregiverCheer {
  return {
    id: row.id,
    linkId: row.link_id,
    patientId: row.patient_id,
    message: row.message,
    createdAt: row.created_at,
    readAt: row.read_at,
  };
}

/** Mensaje de ánimo del cuidador al paciente (RF-006), de una sola vía. */
export async function sendCheer(
  caregiverId: string,
  linkId: string,
  patientId: string,
  message: string
): Promise<CaregiverCheer> {
  const { data, error } = await supabase
    .from('caregiver_cheers')
    .insert({ caregiver_id: caregiverId, link_id: linkId, patient_id: patientId, message })
    .select(CHEER_COLUMNS)
    .single();

  if (error) throw toCaregiverError(error);
  return toCheer(data as CheerRow);
}

/** El cheer sin leer más reciente del paciente, si existe. */
export async function fetchLatestUnreadCheer(patientId: string): Promise<CaregiverCheer | null> {
  const { data, error } = await supabase
    .from('caregiver_cheers')
    .select(CHEER_COLUMNS)
    .eq('patient_id', patientId)
    .is('read_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw toCaregiverError(error);
  return data ? toCheer(data as CheerRow) : null;
}

export async function markCheerRead(cheerId: string): Promise<void> {
  const { error } = await supabase
    .from('caregiver_cheers')
    .update({ read_at: new Date().toISOString() })
    .eq('id', cheerId);

  if (error) throw toCaregiverError(error);
}

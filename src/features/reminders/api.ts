import { supabase } from '@/lib/supabase';
import type { Reminder, ReminderDraft, RemindersError } from './types';

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

function toRemindersError(error: unknown): RemindersError {
  if (isPostgrestLikeError(error)) {
    if (error.code === 'PGRST205') {
      return {
        errorClass: 'servidor',
        message: 'Falta crear la tabla de recordatorios en la base de datos (ver supabase/migrations)',
      };
    }
    if (error.code === 'PGRST301' || error.code === '401') {
      return { errorClass: 'validacion', message: 'Tu sesión expiró, vuelve a iniciar sesión' };
    }
    if (error.code.startsWith('23')) {
      return { errorClass: 'validacion', message: 'Revisa los datos del recordatorio' };
    }
    return { errorClass: 'servidor', message: 'Falló el servidor, inténtalo de nuevo en un momento' };
  }
  if (error instanceof TypeError) {
    return { errorClass: 'sin-conexion', message: 'Revisa tu conexión e inténtalo de nuevo' };
  }
  console.warn('[reminders] error inesperado', error);
  return { errorClass: 'inesperado', message: 'Algo salió mal, inténtalo de nuevo' };
}

type ReminderRow = {
  id: string;
  patient_id: string;
  created_by: string;
  title: string;
  category: Reminder['category'];
  scheduled_at: string;
  status: Reminder['status'];
  done_at: string | null;
};

const REMINDER_COLUMNS = 'id, patient_id, created_by, title, category, scheduled_at, status, done_at';

function toReminder(row: ReminderRow): Reminder {
  return {
    id: row.id,
    patientId: row.patient_id,
    createdBy: row.created_by,
    title: row.title,
    category: row.category,
    scheduledAt: row.scheduled_at,
    status: row.status,
    doneAt: row.done_at,
  };
}

export async function listReminders(patientId: string): Promise<Reminder[]> {
  const { data, error } = await supabase
    .from('reminders')
    .select(REMINDER_COLUMNS)
    .eq('patient_id', patientId)
    .order('scheduled_at', { ascending: true });

  if (error) throw toRemindersError(error);
  return (data as ReminderRow[]).map(toReminder);
}

export async function createReminder(createdBy: string, draft: ReminderDraft): Promise<Reminder> {
  const { data, error } = await supabase
    .from('reminders')
    .insert({
      patient_id: draft.patientId,
      created_by: createdBy,
      title: draft.title,
      category: draft.category,
      scheduled_at: draft.scheduledAt,
    })
    .select(REMINDER_COLUMNS)
    .single();

  if (error) throw toRemindersError(error);
  return toReminder(data as ReminderRow);
}

export async function markReminderDone(reminderId: string): Promise<Reminder> {
  const { data, error } = await supabase
    .from('reminders')
    .update({ status: 'hecho', done_at: new Date().toISOString() })
    .eq('id', reminderId)
    .select(REMINDER_COLUMNS)
    .single();

  if (error) throw toRemindersError(error);
  return toReminder(data as ReminderRow);
}

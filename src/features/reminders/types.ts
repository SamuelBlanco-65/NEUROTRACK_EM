export type ReminderCategory = 'medicacion' | 'cita' | 'bienestar' | 'otro';

/** Largo máximo del nombre de una categoría propia (igual que el check de la base de datos). */
export const CATEGORY_LABEL_MAX_LENGTH = 40;

export type ReminderStatus = 'pendiente' | 'hecho';

export type Reminder = {
  id: string;
  patientId: string;
  createdBy: string;
  title: string;
  category: ReminderCategory;
  /** Nombre propio cuando la categoría es «otro». */
  categoryLabel?: string | null;
  scheduledAt: string;
  status: ReminderStatus;
  doneAt: string | null;
};

export type ReminderDraft = {
  patientId: string;
  title: string;
  category: ReminderCategory;
  categoryLabel: string | null;
  scheduledAt: string;
};

export type RemindersErrorClass = 'sin-conexion' | 'servidor' | 'validacion' | 'inesperado';

export type RemindersError = {
  errorClass: RemindersErrorClass;
  message: string;
};

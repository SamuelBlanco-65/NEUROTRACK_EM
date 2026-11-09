export type ReminderCategory = 'medicacion' | 'cita' | 'bienestar';

export type ReminderStatus = 'pendiente' | 'hecho';

export type Reminder = {
  id: string;
  patientId: string;
  createdBy: string;
  title: string;
  category: ReminderCategory;
  scheduledAt: string;
  status: ReminderStatus;
  doneAt: string | null;
};

export type ReminderDraft = {
  patientId: string;
  title: string;
  category: ReminderCategory;
  scheduledAt: string;
};

export type RemindersErrorClass = 'sin-conexion' | 'servidor' | 'validacion' | 'inesperado';

export type RemindersError = {
  errorClass: RemindersErrorClass;
  message: string;
};

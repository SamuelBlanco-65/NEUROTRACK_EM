export type CaregiverLinkStatus = 'pendiente' | 'solicitado' | 'aceptado' | 'rechazado' | 'revocado';

export type CaregiverPermissions = {
  shareSintomas: boolean;
  shareProgreso: boolean;
  shareRecordatorios: boolean;
};

export type CaregiverLink = CaregiverPermissions & {
  id: string;
  patientId: string;
  caregiverId: string | null;
  caregiverEmail: string | null;
  caregiverName: string | null;
  inviteCode: string;
  status: CaregiverLinkStatus;
  createdAt: string;
  respondedAt: string | null;
};

export type CaregiverErrorClass = 'sin-conexion' | 'servidor' | 'validacion' | 'codigo-invalido' | 'inesperado';

export type CaregiverError = {
  errorClass: CaregiverErrorClass;
  message: string;
};

export type ObservationCategory = 'animo' | 'movilidad' | 'fatiga' | 'medicacion' | 'otro';

export type CaregiverObservation = {
  id: string;
  linkId: string;
  patientId: string;
  category: ObservationCategory;
  note: string;
  occurredAt: string;
};

export type CaregiverObservationDraft = {
  linkId: string;
  patientId: string;
  category: ObservationCategory;
  note: string;
};

export type CaregiverCheer = {
  id: string;
  linkId: string;
  patientId: string;
  message: string;
  createdAt: string;
  readAt: string | null;
};

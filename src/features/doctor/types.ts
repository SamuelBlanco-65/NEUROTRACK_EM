import type { ActivityArea, ActivitySession, AreaProgress } from '@/features/activities/types';
import type { Severity, SymptomLog, SymptomType } from '@/features/symptoms/types';

export type DoctorLinkStatus = 'pendiente' | 'solicitado' | 'aceptado' | 'rechazado' | 'revocado';

/** Lo que el paciente autoriza que vea su médico. Las notas libres van aparte y apagadas por defecto. */
export type DoctorPermissions = {
  shareSintomas: boolean;
  shareNotas: boolean;
  shareProgreso: boolean;
};

export type DoctorAccessDuration = 'tresMeses' | 'seisMeses' | 'unAnio' | 'sinFecha';

export type DoctorLink = DoctorPermissions & {
  id: string;
  patientId: string;
  doctorId: string | null;
  patientName: string | null;
  doctorName: string | null;
  doctorEmail: string | null;
  /** Autodeclarado por el médico; Neurotrack EM no lo verifica. */
  professionalId: string | null;
  inviteCode: string;
  status: DoctorLinkStatus;
  expiresAt: string | null;
  lastViewedAt: string | null;
  createdAt: string;
  respondedAt: string | null;
};

export type DoctorErrorClass = 'sin-conexion' | 'servidor' | 'validacion' | 'codigo-invalido' | 'inesperado';

export type DoctorError = {
  errorClass: DoctorErrorClass;
  message: string;
};

/** Datos crudos que el médico trae de un paciente para armar el resumen. */
export type PatientSummaryData = {
  symptomLogs: SymptomLog[];
  activitySessions: ActivitySession[];
  areaProgress: AreaProgress[];
};

export type SymptomComparisonDirection = 'mas' | 'menos' | 'igual';

export type SymptomComparison = {
  type: SymptomType;
  currentDays: number;
  previousDays: number;
  direction: SymptomComparisonDirection;
  /** Texto neutro con la diferencia, p. ej. «3 días más que el período anterior». */
  text: string;
};

export type SeverityDistribution = Record<Severity, number>;

export type ActivityAreaSummary = {
  area: ActivityArea;
  sessions: number;
  level: number | null;
};

export type SymptomNote = {
  id: string;
  occurredAt: string;
  symptomType: SymptomType;
  note: string;
};

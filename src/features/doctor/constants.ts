import type { DoctorAccessDuration } from './types';

export const DURATION_OPTIONS: { id: DoctorAccessDuration; label: string; months: number | null }[] = [
  { id: 'tresMeses', label: '3 meses', months: 3 },
  { id: 'seisMeses', label: '6 meses', months: 6 },
  { id: 'unAnio', label: '1 año', months: 12 },
  { id: 'sinFecha', label: 'Sin fecha de fin', months: null },
];

export const DEFAULT_DURATION: DoctorAccessDuration = 'tresMeses';

/** Aviso fijo del resumen del médico (RT-004: la app no diagnostica ni interpreta). */
export const DOCTOR_SUMMARY_NOTICE =
  'Datos registrados por el paciente desde su celular. No es una evaluación clínica ni reemplaza tu criterio.';

/** Menos días con registro que esto: se avisa «pocos registros para comparar» en vez de mostrar tendencias. */
export const MIN_DAYS_TO_COMPARE = 5;

export const NOT_A_DIAGNOSIS = 'Esto es un resumen de registros, no un diagnóstico.';

export type SymptomType = 'fatiga' | 'vision_borrosa' | 'dolor' | 'debilidad' | 'equilibrio' | 'otro';

export type Severity = 'leve' | 'moderado' | 'fuerte';

export type SymptomLog = {
  id: string;
  symptomType: SymptomType;
  /** Nombre que el paciente le dio a un síntoma «otro»; `null` en los demás (y siempre para terceros). */
  customLabel?: string | null;
  severity: Severity;
  note: string | null;
  occurredAt: string;
};

export type SymptomLogDraft = {
  symptomType: SymptomType;
  customLabel: string | null;
  severity: Severity;
  note: string | null;
};

/** Largo máximo del nombre propio de un síntoma (igual que el `check` de la base de datos). */
export const CUSTOM_LABEL_MAX_LENGTH = 60;

export type SymptomsErrorClass = 'sin-conexion' | 'servidor' | 'validacion' | 'inesperado';

export type SymptomsError = {
  errorClass: SymptomsErrorClass;
  message: string;
};

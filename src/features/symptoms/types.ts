export type SymptomType = 'fatiga' | 'vision_borrosa' | 'dolor' | 'debilidad' | 'equilibrio' | 'otro';

export type Severity = 'leve' | 'moderado' | 'fuerte';

export type SymptomLog = {
  id: string;
  symptomType: SymptomType;
  severity: Severity;
  note: string | null;
  occurredAt: string;
};

export type SymptomLogDraft = {
  symptomType: SymptomType;
  severity: Severity;
  note: string | null;
};

export type SymptomsErrorClass = 'sin-conexion' | 'servidor' | 'validacion' | 'inesperado';

export type SymptomsError = {
  errorClass: SymptomsErrorClass;
  message: string;
};

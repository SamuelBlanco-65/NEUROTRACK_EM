import type MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type ProgressPeriod = 'semana' | 'mes' | 'tresMeses';

export type ProgressView = 'grafico' | 'tabla';

export type ProgressBucket = {
  id: string;
  label: string;
  startISO: string;
  endISO: string;
  symptomDays: number;
  activities: number;
};

export type ProgressInsight = {
  id: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
};

export type ProgressErrorClass = 'sin-conexion' | 'servidor' | 'validacion' | 'inesperado';

export type ProgressError = {
  errorClass: ProgressErrorClass;
  message: string;
};

import type MaterialIcons from '@expo/vector-icons/MaterialIcons';

import type { Severity, SymptomType } from './types';

export const SYMPTOM_TYPE_OPTIONS: { id: SymptomType; title: string; description: string }[] = [
  { id: 'fatiga', title: 'Fatiga', description: 'Cansancio o falta de energía' },
  { id: 'vision_borrosa', title: 'Visión borrosa', description: 'Dificultad para ver con claridad' },
  { id: 'dolor', title: 'Dolor', description: 'Molestia física en alguna parte del cuerpo' },
  { id: 'debilidad', title: 'Debilidad o entumecimiento', description: 'Falta de fuerza u hormigueo' },
  { id: 'equilibrio', title: 'Problemas de equilibrio', description: 'Mareo o dificultad para mantenerte estable' },
  { id: 'otro', title: 'Otro', description: 'Algo distinto a lo anterior' },
];

export const SEVERITY_OPTIONS: { id: Severity; title: string; description: string }[] = [
  { id: 'leve', title: 'Leve', description: 'Puedo hacer mis cosas' },
  { id: 'moderado', title: 'Moderado', description: 'Me cuesta, pero puedo' },
  { id: 'fuerte', title: 'Fuerte', description: 'Necesito parar o descansar' },
];

export const SYMPTOM_TYPE_ICON: Record<SymptomType, keyof typeof MaterialIcons.glyphMap> = {
  fatiga: 'battery-alert',
  vision_borrosa: 'visibility',
  dolor: 'healing',
  debilidad: 'accessibility',
  equilibrio: 'directions-walk',
  otro: 'info',
};

export function symptomTypeLabel(id: SymptomType): string {
  return SYMPTOM_TYPE_OPTIONS.find((option) => option.id === id)?.title ?? id;
}

/** Lo que se muestra al paciente: su propio nombre si describió un síntoma «otro», si no la etiqueta estándar. */
export function symptomDisplayLabel(type: SymptomType, customLabel?: string | null): string {
  const custom = customLabel?.trim();
  return type === 'otro' && custom ? custom : symptomTypeLabel(type);
}

export function severityLabel(id: Severity): string {
  return SEVERITY_OPTIONS.find((option) => option.id === id)?.title ?? id;
}

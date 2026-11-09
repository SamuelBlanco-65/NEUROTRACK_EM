import type MaterialIcons from '@expo/vector-icons/MaterialIcons';

import type { ReminderCategory } from './types';

export const CATEGORY_META: Record<ReminderCategory, { label: string; icon: keyof typeof MaterialIcons.glyphMap }> = {
  medicacion: { label: 'Medicación', icon: 'medication' },
  cita: { label: 'Cita médica', icon: 'medical-services' },
  bienestar: { label: 'Bienestar', icon: 'self-improvement' },
};

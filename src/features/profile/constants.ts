import type { ProfileKind } from '@/store/slices/profile-slice';

/** Pantalla de inicio de cada perfil: un solo lugar para no repetir ternarios por perfil. */
export const PROFILE_HOME = {
  paciente: '/(paciente)/inicio',
  cuidador: '/(cuidador)/inicio',
  medico: '/(medico)/pacientes',
} as const satisfies Record<ProfileKind, string>;

export const PROFILE_LABEL: Record<ProfileKind, string> = {
  paciente: 'Paciente',
  cuidador: 'Cuidador',
  medico: 'Médico tratante',
};

import { Stack } from 'expo-router';

/** Perfil del médico tratante (REC-003): solo lectura, sin pestañas inferiores. */
export default function MedicoLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

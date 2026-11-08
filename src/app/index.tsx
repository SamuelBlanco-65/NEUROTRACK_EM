import { Redirect } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ProfileOption } from '@/components/profile-option';
import { profileSelected } from '@/store/slices/profile-slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Spacing } from '@/theme';

export default function SeleccionDePerfilScreen() {
  const dispatch = useAppDispatch();
  const selected = useAppSelector((state) => state.profile.selected);
  const authStatus = useAppSelector((state) => state.auth.status);

  if (selected && authStatus !== 'authenticated') return <Redirect href="/(auth)/acceder" />;
  if (selected === 'paciente') return <Redirect href="/(paciente)/inicio" />;
  if (selected === 'cuidador') return <Redirect href="/(cuidador)/inicio" />;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.heading}>
          <ThemedText variant="headlineLg" accessibilityRole="header">
            Te acompañamos en tu camino
          </ThemedText>
          <ThemedText variant="bodyMd" colorRole="secondary">
            ¿Cómo vas a usar la app?
          </ThemedText>
        </View>

        <View accessibilityRole="radiogroup" accessibilityLabel="Selección de perfil" style={styles.options}>
          <ProfileOption
            title="Soy paciente"
            description="Registra cómo te sientes y haz tus actividades"
            selected={selected === 'paciente'}
            onPress={() => dispatch(profileSelected('paciente'))}
            testID="profile-option-paciente"
          />
          <ProfileOption
            title="Acompaño a alguien"
            description="Familiar, pareja o cuidador"
            selected={selected === 'cuidador'}
            onPress={() => dispatch(profileSelected('cuidador'))}
            testID="profile-option-cuidador"
          />
        </View>

        <ThemedText variant="bodySm" colorRole="secondary" style={styles.note}>
          Puedes ajustar esta preferencia en cualquier momento
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.lg,
    gap: Spacing.lg,
  },
  heading: {
    gap: Spacing.xs,
  },
  options: {
    gap: Spacing.md,
  },
  note: {
    textAlign: 'center',
  },
});

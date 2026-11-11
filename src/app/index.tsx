import { Redirect, router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ProfileOption } from '@/components/profile-option';
import { profileSelected } from '@/store/slices/profile-slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

export default function SeleccionDePerfilScreen() {
  const dispatch = useAppDispatch();
  const selected = useAppSelector((state) => state.profile.selected);
  const authStatus = useAppSelector((state) => state.auth.status);
  const colors = useThemeColors();

  if (selected && authStatus !== 'authenticated') return <Redirect href="/(auth)/acceder" />;
  if (selected === 'paciente') return <Redirect href="/(paciente)/inicio" />;
  if (selected === 'cuidador') return <Redirect href="/(cuidador)/inicio" />;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.brandRow}>
          <View style={styles.brandLabel}>
            <View style={[styles.brandDot, { backgroundColor: colors.primary }]} />
            <ThemedText variant="labelSm" colorRole="secondary" style={styles.brandText}>
              NEUROTRACK EM
            </ThemedText>
          </View>
          <View style={[styles.stepPill, { backgroundColor: colors.surfaceContainer }]}>
            <ThemedText variant="labelSm" colorRole="onSurfaceVariant">
              Paso 1 de 2
            </ThemedText>
          </View>
        </View>

        <View style={[styles.hero, { backgroundColor: colors.surfaceContainerLow }]}>
          <Image
            accessibilityIgnoresInvertColors
            source={require('@/assets/images/ilustracion-acompanamiento.png')}
            style={styles.heroImage}
            resizeMode="contain"
            accessibilityLabel="Ilustración de acompañamiento de Neurotrack EM"
          />
        </View>

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
            icon="person"
            iconBackgroundColor={colors.secondaryContainer}
            iconColor={colors.primary}
            testID="profile-option-paciente"
          />
          <ProfileOption
            title="Acompaño a alguien"
            description="Familiar, pareja o cuidador"
            selected={selected === 'cuidador'}
            onPress={() => dispatch(profileSelected('cuidador'))}
            icon="groups"
            iconBackgroundColor={colors.tertiaryFixed}
            iconColor={colors.tertiary}
            testID="profile-option-cuidador"
          />
        </View>

        <View style={styles.noteRow}>
          <MaterialIcons name="spa" size={18} color={colors.primary} />
          <ThemedText variant="bodySm" colorRole="secondary" style={styles.noteText}>
            Puedes ajustar esta preferencia en cualquier momento
          </ThemedText>
        </View>

        <Pressable
          onPress={() => router.push('/acerca')}
          hitSlop={8}
          accessibilityRole="link"
          accessibilityLabel="¿Qué es Neurotrack EM?"
          accessibilityHint="Abre una pantalla con información sobre la app"
          style={styles.infoLink}
          testID="inicio-que-es">
          <ThemedText variant="bodyMd" colorRole="secondary" style={styles.infoLinkText}>
            ¿Qué es Neurotrack EM?
          </ThemedText>
          <MaterialIcons name="help-outline" size={20} color={colors.secondary} />
        </Pressable>
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
    paddingTop: Spacing.sm,
    gap: Spacing.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  brandDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  brandText: {
    letterSpacing: 1,
  },
  stepPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  hero: {
    width: '100%',
    height: 170,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroImage: {
    width: 140,
    height: 140,
  },
  heading: {
    gap: Spacing.xs,
  },
  options: {
    gap: Spacing.md,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  noteText: {
    textAlign: 'center',
  },
  infoLink: {
    minHeight: MinTouchSize,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  infoLinkText: {
    textDecorationLine: 'underline',
  },
});

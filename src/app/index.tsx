import { Redirect, router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ProfileOption } from '@/components/profile-option';
import { PROFILE_HOME } from '@/features/profile/constants';
import { profileSelected } from '@/store/slices/profile-slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

export default function SeleccionDePerfilScreen() {
  const dispatch = useAppDispatch();
  const selected = useAppSelector((state) => state.profile.selected);
  const authStatus = useAppSelector((state) => state.auth.status);
  const colors = useThemeColors();

  if (selected && authStatus !== 'authenticated') return <Redirect href="/(auth)/acceder" />;
  if (selected) return <Redirect href={PROFILE_HOME[selected]} />;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
            source={require('@/assets/images/perfil-hero.jpg')}
            style={styles.heroImage}
            resizeMode="cover"
            accessibilityLabel="Ilustración de dos personas caminando juntas por un sendero entre flores"
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
          <ThemedText variant="labelSm" colorRole="secondary" style={styles.optionalLabel}>
            Opcional
          </ThemedText>
          <ProfileOption
            title="Soy médico tratante"
            description="Revisa el resumen que tu paciente decide compartir contigo"
            selected={selected === 'medico'}
            onPress={() => dispatch(profileSelected('medico'))}
            icon="medical-services"
            iconBackgroundColor={colors.surfaceContainerHigh}
            iconColor={colors.primary}
            testID="profile-option-medico"
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
        </ScrollView>
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
  },
  content: {
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
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
    height: 190,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heading: {
    gap: Spacing.xs,
  },
  options: {
    gap: Spacing.sm,
  },
  optionalLabel: {
    textAlign: 'center',
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

import { Redirect, router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Alert, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ProfileOption } from '@/components/profile-option';
import { PROFILE_HOME, PROFILE_LABEL } from '@/features/profile/constants';
import { logout } from '@/store/slices/auth-slice';
import { profileSelected, type ProfileKind } from '@/store/slices/profile-slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

export default function SeleccionDePerfilScreen() {
  const dispatch = useAppDispatch();
  const selected = useAppSelector((state) => state.profile.selected);
  const authStatus = useAppSelector((state) => state.auth.status);
  const session = useAppSelector((state) => state.auth.session);
  const colors = useThemeColors();

  if (selected && authStatus !== 'authenticated') return <Redirect href="/(auth)/acceder" />;
  if (selected) return <Redirect href={PROFILE_HOME[selected]} />;

  const accountLabel = session ? (session.name ?? session.email) : null;

  /**
   * El perfil es una vista, no un permiso: lo que se ve lo deciden los vínculos y RLS. Con una sesión ya
   * abierta no se pide la contraseña otra vez, pero se deja claro con qué cuenta se entra y se ofrece usar otra.
   */
  function choose(profile: ProfileKind) {
    if (!session) {
      dispatch(profileSelected(profile));
      return;
    }
    Alert.alert(
      `Entrar como ${PROFILE_LABEL[profile].toLowerCase()}`,
      `Vas a usar la cuenta ${session.email} con el perfil de ${PROFILE_LABEL[profile].toLowerCase()}. ` +
        'Si acompañas a otra persona o eres su médico, usa otra cuenta.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Usar otra cuenta', onPress: () => dispatch(logout()) },
        { text: 'Continuar', onPress: () => dispatch(profileSelected(profile)) },
      ]
    );
  }

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
        </View>

        {session ? (
          <View style={[styles.accountCard, { backgroundColor: colors.surfaceContainerLow }]} testID="inicio-cuenta-activa">
            <View style={styles.accountTextGroup} accessible accessibilityLabel={`Sesión iniciada como ${accountLabel}`}>
              <ThemedText variant="labelSm" colorRole="secondary">
                Sesión iniciada como
              </ThemedText>
              <ThemedText variant="labelLg" numberOfLines={2}>
                {accountLabel}
              </ThemedText>
            </View>
            <Pressable
              onPress={() => dispatch(logout())}
              accessibilityRole="button"
              accessibilityLabel="Usar otra cuenta"
              accessibilityHint="Cierra la sesión actual para entrar con otra cuenta"
              hitSlop={8}
              style={[styles.accountButton, { backgroundColor: colors.surfaceContainerHigh }]}
              testID="inicio-usar-otra-cuenta">
              <MaterialIcons name="switch-account" size={20} color={colors.onSurface} />
              <ThemedText variant="labelMd">Usar otra cuenta</ThemedText>
            </Pressable>
          </View>
        ) : null}

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
            onPress={() => choose('paciente')}
            icon="person"
            iconBackgroundColor={colors.secondaryContainer}
            iconColor={colors.primary}
            testID="profile-option-paciente"
          />
          <ProfileOption
            title="Acompaño a alguien"
            description="Familiar, pareja o cuidador"
            selected={selected === 'cuidador'}
            onPress={() => choose('cuidador')}
            icon="groups"
            iconBackgroundColor={colors.tertiaryFixed}
            iconColor={colors.tertiary}
            testID="profile-option-cuidador"
          />
          <ProfileOption
            title="Soy médico tratante"
            description="Revisa el resumen que tu paciente decide compartir contigo"
            selected={selected === 'medico'}
            onPress={() => choose('medico')}
            icon="medical-services"
            iconBackgroundColor={colors.surfaceContainerHigh}
            iconColor={colors.primary}
            testID="profile-option-medico"
          />
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
    justifyContent: 'center',
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
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.default,
    padding: Spacing.md,
  },
  accountTextGroup: {
    flex: 1,
    gap: 2,
  },
  accountButton: {
    minHeight: MinTouchSize,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
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

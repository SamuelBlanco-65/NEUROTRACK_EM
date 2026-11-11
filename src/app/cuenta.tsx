import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PROFILE_LABEL } from '@/features/profile/constants';
import { logout, removeAccount } from '@/store/slices/auth-slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

type Busy = 'logout' | 'delete' | null;

/** Cuenta (paciente y cuidador): datos de la sesión, documentos legales, cerrar sesión y borrar cuenta. */
export default function CuentaScreen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const session = useAppSelector((state) => state.auth.session);
  const profile = useAppSelector((state) => state.profile.selected);
  const [busy, setBusy] = useState<Busy>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function cerrarSesion() {
    setBusy('logout');
    setErrorMessage(null);
    const result = await dispatch(logout());
    setBusy(null);
    if (logout.fulfilled.match(result)) {
      router.replace('/');
    } else {
      setErrorMessage('No pudimos cerrar tu sesión. Revisa tu conexión e inténtalo de nuevo.');
    }
  }

  function confirmarBorrado() {
    Alert.alert(
      'Eliminar mi cuenta',
      'Se borrarán tu cuenta y todos tus registros (síntomas, actividades, recordatorios y accesos de cuidadores y médicos). Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar para siempre', style: 'destructive', onPress: borrarCuenta },
      ]
    );
  }

  async function borrarCuenta() {
    setBusy('delete');
    setErrorMessage(null);
    const result = await dispatch(removeAccount());
    setBusy(null);
    if (removeAccount.fulfilled.match(result)) {
      router.replace('/');
    } else {
      setErrorMessage(result.payload?.message ?? 'No pudimos eliminar tu cuenta. Inténtalo de nuevo.');
    }
  }

  const working = busy !== null;
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={8}
            style={styles.backButton}
            testID="cuenta-volver">
            <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
          </Pressable>
          <ThemedText variant="headlineSm" accessibilityRole="header">
            Mi cuenta
          </ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest }]} accessible testID="cuenta-datos">
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <MaterialIcons name="person" size={28} color={colors.onPrimary} />
            </View>
            <View style={styles.cardText}>
              {session?.name ? <ThemedText variant="labelLg">{session.name}</ThemedText> : null}
              <ThemedText variant="bodyMd" colorRole="onSurfaceVariant">
                {session?.email}
              </ThemedText>
              {profile ? (
                <ThemedText variant="labelSm" colorRole="secondary">
                  Perfil: {PROFILE_LABEL[profile]}
                </ThemedText>
              ) : null}
            </View>
          </View>

          {errorMessage ? (
            <View
              style={[styles.errorBanner, { backgroundColor: colors.tertiaryFixed }]}
              accessibilityRole="alert"
              accessibilityLiveRegion="assertive"
              testID="cuenta-error">
              <MaterialIcons name="error" size={20} color={colors.onTertiaryFixed} />
              <ThemedText variant="labelMd" colorRole="onTertiaryFixed" style={styles.flex}>
                {errorMessage}
              </ThemedText>
            </View>
          ) : null}

          <View style={styles.group}>
            {profile === 'paciente' ? (
              <LinkRow icon="medical-services" label="Mi médico" onPress={() => router.push('/mi-medico')} testID="cuenta-mi-medico" />
            ) : null}
            <LinkRow icon="accessibility-new" label="Accesibilidad" onPress={() => router.push('/accesibilidad')} testID="cuenta-accesibilidad" />
            <LinkRow icon="description" label="Términos de uso" onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: 'terminos' } })} testID="cuenta-terminos" />
            <LinkRow icon="privacy-tip" label="Privacidad y datos de salud" onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: 'privacidad' } })} testID="cuenta-privacidad" />
          </View>

          <View style={[styles.notice, { backgroundColor: colors.surfaceContainerLow }]}>
            <MaterialIcons name="info" size={20} color={colors.primary} />
            <ThemedText variant="bodySm" colorRole="onSurfaceVariant" style={styles.flex}>
              Neurotrack EM es un apoyo, no reemplaza a tu equipo médico ni sirve para diagnosticar. Ante una urgencia llama al 123.
            </ThemedText>
          </View>

          <Pressable
            onPress={cerrarSesion}
            disabled={working}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
            accessibilityState={{ disabled: working, busy: busy === 'logout' }}
            style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: working ? 0.7 : 1 }]}
            testID="cuenta-cerrar-sesion">
            {busy === 'logout' ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <MaterialIcons name="logout" size={22} color={colors.onPrimary} />
            )}
            <ThemedText variant="labelLg" colorRole="onPrimary">
              {busy === 'logout' ? 'Cerrando…' : 'Cerrar sesión'}
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={confirmarBorrado}
            disabled={working}
            accessibilityRole="button"
            accessibilityLabel="Eliminar mi cuenta y todos mis datos"
            accessibilityHint="Pide confirmación antes de borrar"
            accessibilityState={{ disabled: working, busy: busy === 'delete' }}
            style={[styles.dangerButton, { borderColor: colors.tertiary, opacity: working ? 0.7 : 1 }]}
            testID="cuenta-eliminar">
            {busy === 'delete' ? (
              <ActivityIndicator color={colors.tertiary} />
            ) : (
              <MaterialIcons name="delete-forever" size={22} color={colors.tertiary} />
            )}
            <ThemedText variant="labelLg" colorRole="tertiary">
              {busy === 'delete' ? 'Eliminando…' : 'Eliminar mi cuenta'}
            </ThemedText>
          </Pressable>

          <ThemedText variant="labelSm" colorRole="secondary" style={styles.version}>
            Neurotrack EM · versión {version}
          </ThemedText>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function LinkRow({
  icon,
  label,
  onPress,
  testID,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
  testID: string;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.linkRow, { backgroundColor: colors.surfaceContainerLowest }]}
      testID={testID}>
      <MaterialIcons name={icon} size={22} color={colors.primary} />
      <ThemedText variant="labelLg" style={styles.flex}>
        {label}
      </ThemedText>
      <MaterialIcons name="chevron-right" size={22} color={colors.outline} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  backButton: {
    minWidth: MinTouchSize,
    minHeight: MinTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: Spacing.margin,
    paddingBottom: Spacing.xl * 2,
    gap: Spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1, gap: 2 },
  group: { gap: Spacing.xs },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: MinTouchSize + 8,
    borderRadius: Radius.default,
    paddingHorizontal: Spacing.md,
  },
  notice: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderRadius: Radius.default,
    padding: Spacing.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.default,
    padding: Spacing.sm,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: MinTouchSize + 8,
    borderRadius: Radius.full,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: MinTouchSize + 8,
    borderRadius: Radius.full,
    borderWidth: 2,
  },
  version: { textAlign: 'center' },
});

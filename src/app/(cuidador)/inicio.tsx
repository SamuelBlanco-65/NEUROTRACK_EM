import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenState } from '@/components/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { fetchMyLinksAsCaregiver } from '@/store/slices/caregiver-slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

export default function CuidadorInicioScreen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const { myLinksAsCaregiver, caregiverStatus, caregiverError } = useAppSelector((state) => state.caregiver);

  useEffect(() => {
    dispatch(fetchMyLinksAsCaregiver());
  }, [dispatch]);

  const activeLink = useMemo(
    () =>
      myLinksAsCaregiver.find((link) => link.status === 'aceptado') ??
      myLinksAsCaregiver.find((link) => link.status === 'solicitado') ??
      null,
    [myLinksAsCaregiver]
  );

  if (caregiverStatus === 'error') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <ScreenState
            kind="error"
            title="No pudimos cargar tu vínculo"
            description={caregiverError?.message ?? 'Inténtalo de nuevo'}
            testID="cuidador-inicio-error"
          />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (caregiverStatus === 'cargando' || caregiverStatus === 'idle') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <ScreenState kind="cargando" title="Cargando…" testID="cuidador-inicio-cargando" />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!activeLink) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <View style={styles.centerContainer}>
            <View style={[styles.icon, { backgroundColor: colors.secondaryContainer }]}>
              <MaterialIcons name="handshake" size={36} color={colors.primary} />
            </View>
            <ThemedText variant="headlineMd" style={styles.centerText}>
              Aún no estás vinculado
            </ThemedText>
            <ThemedText variant="bodyMd" colorRole="onSurfaceVariant" style={styles.centerText}>
              Pídele a la persona que quieres acompañar su código de invitación.
            </ThemedText>
            <Pressable
              onPress={() => router.push('/vincularme')}
              accessibilityRole="button"
              accessibilityLabel="Vincularme con un código"
              style={[styles.primaryButton, { backgroundColor: colors.primaryContainer }]}
              testID="cuidador-inicio-vincularme">
              <ThemedText variant="labelLg" colorRole="onPrimary">
                Vincularme
              </ThemedText>
            </Pressable>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (activeLink.status === 'solicitado') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <View style={styles.centerContainer} testID="cuidador-inicio-solicitud-pendiente">
            <View style={[styles.icon, { backgroundColor: colors.secondaryContainer }]}>
              <MaterialIcons name="hourglass-top" size={36} color={colors.primary} />
            </View>
            <ThemedText variant="headlineMd" style={styles.centerText}>
              Solicitud pendiente
            </ThemedText>
            <ThemedText variant="bodyMd" colorRole="onSurfaceVariant" style={styles.centerText}>
              Le avisamos que quieres acompañarla. En cuanto acepte, verás su información aquí.
            </ThemedText>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const nombre = activeLink.patientId ? 'la persona que acompañas' : 'tu paciente';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <ThemedText variant="headlineMd" accessibilityRole="header">
            Inicio
          </ThemedText>
        </View>
        <View style={styles.scroll}>
          <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest }]} testID="cuidador-inicio-vinculado">
            <ThemedText variant="labelLg">Estás acompañando a {nombre}</ThemedText>
            <ThemedText variant="bodySm" colorRole="onSurfaceVariant">
              Puedes ver: {[activeLink.shareSintomas && 'síntomas', activeLink.shareProgreso && 'progreso', activeLink.shareRecordatorios && 'recordatorios']
                .filter(Boolean)
                .join(', ') || 'nada por ahora'}
            </ThemedText>
          </View>
        </View>
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
  header: {
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  scroll: {
    paddingHorizontal: Spacing.margin,
    gap: Spacing.md,
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  centerText: {
    textAlign: 'center',
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  primaryButton: {
    minHeight: MinTouchSize + 8,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

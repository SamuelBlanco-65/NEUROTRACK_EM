import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountButton } from '@/components/account-button';
import { ScreenState } from '@/components/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CATEGORY_META } from '@/features/reminders/constants';
import { fetchCaregiverPatientActivity, fetchMyLinksAsCaregiver } from '@/store/slices/caregiver-slice';
import { fetchReminders } from '@/store/slices/reminders-slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function CuidadorInicioScreen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const { myLinksAsCaregiver, caregiverStatus, caregiverError, viewedWeekSessionCount, viewStatus } =
    useAppSelector((state) => state.caregiver);
  const { items: reminders } = useAppSelector((state) => state.reminders);

  const activeLink = useMemo(
    () =>
      myLinksAsCaregiver.find((link) => link.status === 'aceptado') ??
      myLinksAsCaregiver.find((link) => link.status === 'solicitado') ??
      null,
    [myLinksAsCaregiver]
  );

  useEffect(() => {
    dispatch(fetchMyLinksAsCaregiver());
  }, [dispatch]);

  useEffect(() => {
    if (!activeLink || activeLink.status !== 'aceptado') return;
    if (activeLink.shareProgreso) dispatch(fetchCaregiverPatientActivity(activeLink.patientId));
    if (activeLink.shareRecordatorios) dispatch(fetchReminders(activeLink.patientId));
  }, [dispatch, activeLink]);

  if (caregiverStatus === 'error') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <View style={styles.accountBar}>
            <AccountButton testID="cuidador-inicio-cuenta" />
          </View>
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
          <View style={styles.accountBar}>
            <AccountButton testID="cuidador-inicio-cuenta" />
          </View>
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
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
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
          <View style={styles.accountBar}>
            <AccountButton testID="cuidador-inicio-cuenta" />
          </View>
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

  const today = new Date();
  const todayReminders = reminders
    .filter((reminder) => sameDay(new Date(reminder.scheduledAt), today))
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <View style={styles.headerTitle}>
            <MaterialIcons name="spa" size={20} color={colors.primary} />
            <ThemedText variant="headlineSm" accessibilityRole="header">
              Inicio
            </ThemedText>
          </View>
          <AccountButton testID="cuidador-inicio-cuenta" />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <ThemedText variant="headlineLg" accessibilityRole="header">
            Hola
          </ThemedText>

          <View style={[styles.linkChip, { backgroundColor: colors.surfaceContainer }]} testID="cuidador-inicio-vinculado">
            <MaterialIcons name="favorite" size={16} color={colors.primary} />
            <ThemedText variant="labelMd" style={styles.linkChipText}>
              {activeLink?.patientName ? `Acompañas a ${activeLink.patientName}` : 'Acompañas a tu persona vinculada'}
            </ThemedText>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.surfaceContainerLowest }]}>
            <View>
              <ThemedText variant="headlineSm">Su semana</ThemedText>
              <ThemedText variant="bodySm" colorRole="secondary" style={{ marginTop: 2 }}>
                Información sincronizada con su consentimiento.
              </ThemedText>
            </View>

            {activeLink.shareProgreso ? (
              <View style={[styles.summaryRow, { backgroundColor: colors.surfaceContainer }]}>
                <View style={[styles.summaryIcon, { backgroundColor: colors.secondaryContainer }]}>
                  <MaterialIcons name="trending-up" size={20} color={colors.primary} />
                </View>
                <View style={styles.summaryBody}>
                  <ThemedText variant="labelMd">Actividades</ThemedText>
                  <ThemedText variant="bodySm" colorRole="secondary">
                    {viewStatus === 'cargando'
                      ? 'Cargando…'
                      : viewedWeekSessionCount === 0
                        ? 'Sin práctica esta semana'
                        : `${viewedWeekSessionCount} ${viewedWeekSessionCount === 1 ? 'sesión' : 'sesiones'} esta semana`}
                  </ThemedText>
                </View>
              </View>
            ) : null}

            {activeLink.shareRecordatorios && todayReminders.length > 0 ? (
              <View style={styles.remindersList}>
                {todayReminders.slice(0, 2).map((reminder) => (
                  <View key={reminder.id} style={[styles.summaryRow, { backgroundColor: colors.surfaceContainer }]}>
                    <View style={[styles.summaryIcon, { backgroundColor: colors.secondaryContainer }]}>
                      <MaterialIcons name={CATEGORY_META[reminder.category].icon} size={20} color={colors.primary} />
                    </View>
                    <View style={styles.summaryBody}>
                      <ThemedText variant="labelMd">{reminder.title}</ThemedText>
                      <ThemedText variant="bodySm" colorRole="secondary">
                        {new Date(reminder.scheduledAt).toLocaleTimeString('es-CO', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </ThemedText>
                    </View>
                    {reminder.status === 'hecho' ? (
                      <MaterialIcons name="check-circle" size={22} color={colors.primary} />
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}

            {!activeLink.shareProgreso && !activeLink.shareRecordatorios ? (
              <View style={styles.summaryRow}>
                <MaterialIcons name="visibility-off" size={20} color={colors.secondary} />
                <ThemedText variant="bodySm" colorRole="secondary" style={styles.summaryBody}>
                  Ves lo que decida compartir de forma autónoma.
                </ThemedText>
              </View>
            ) : null}

            <Pressable
              onPress={() => router.push('/nueva-observacion')}
              accessibilityRole="button"
              accessibilityLabel="Anotar una observación"
              style={[styles.observationButton, { backgroundColor: colors.primary }]}
              testID="cuidador-inicio-anotar-observacion">
              <MaterialIcons name="edit-note" size={22} color={colors.onPrimary} />
              <ThemedText variant="labelLg" colorRole="onPrimary">
                Anotar una observación
              </ThemedText>
            </Pressable>
          </View>

          <View style={[styles.selfCareCard, { backgroundColor: colors.tertiaryFixed }]}>
            <View style={styles.selfCareHeader}>
              <MaterialIcons name="spa" size={20} color={colors.onTertiaryFixed} />
              <ThemedText variant="headlineSm" style={{ color: colors.onTertiaryFixed }}>
                ¿Y tú cómo estás?
              </ThemedText>
            </View>
            <ThemedText variant="bodyMd" style={{ color: colors.tertiary }}>
              Cuidar con dedicación también agota. Tómate un minuto para respirar y revisar cómo te
              sientes tú hoy.
            </ThemedText>
            <Pressable
              onPress={() => router.push('/(cuidador)/apoyo')}
              accessibilityRole="link"
              accessibilityLabel="Ver apoyo y recursos para ti"
              hitSlop={8}
              style={styles.selfCareLink}>
              <ThemedText variant="labelMd" style={{ color: colors.onTertiaryFixedVariant }}>
                Ver apoyo y recursos para ti
              </ThemedText>
              <MaterialIcons name="arrow-forward" size={18} color={colors.onTertiaryFixedVariant} />
            </Pressable>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  accountBar: {
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.sm,
  },
  scroll: {
    paddingHorizontal: Spacing.margin,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  linkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
  },
  linkChipText: {
    flexShrink: 1,
  },
  summaryCard: {
    borderRadius: Radius.lg,
    padding: Spacing.md + 4,
    gap: Spacing.sm + 2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.default,
    padding: Spacing.sm + 2,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryBody: {
    flex: 1,
    gap: 2,
  },
  remindersList: {
    gap: Spacing.sm,
  },
  observationButton: {
    minHeight: 56,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  selfCareCard: {
    borderRadius: Radius.default,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  selfCareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  selfCareLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: MinTouchSize,
    alignSelf: 'flex-start',
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

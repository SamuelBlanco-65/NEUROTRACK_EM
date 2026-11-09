import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenState } from '@/components/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AREA_META, MAX_LEVEL } from '@/features/activities/constants';
import type { ActivityArea } from '@/features/activities/types';
import { fetchCaregiverPatientActivity, fetchMyLinksAsCaregiver, sendCheerMessage } from '@/store/slices/caregiver-slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

const CHEER_MESSAGES = [
  '🌸 ¡Orgulloso de tu constancia!',
  '☕ Tómate un rico descanso hoy',
  '💛 Cada paso cuenta muchísimo',
];

const AREAS: ActivityArea[] = ['memoria', 'atencion', 'movimiento'];

export default function CuidadorAcompanarScreen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const { myLinksAsCaregiver, viewedProgress, viewedWeekSessionCount, viewedLastPracticeByArea, viewStatus } =
    useAppSelector((state) => state.caregiver);
  const [cheerOpen, setCheerOpen] = useState(false);
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  const activeLink = useMemo(
    () => myLinksAsCaregiver.find((link) => link.status === 'aceptado') ?? null,
    [myLinksAsCaregiver]
  );

  useEffect(() => {
    dispatch(fetchMyLinksAsCaregiver());
  }, [dispatch]);

  useEffect(() => {
    if (activeLink) dispatch(fetchCaregiverPatientActivity(activeLink.patientId));
  }, [dispatch, activeLink]);

  async function enviarAnimo(message: string) {
    if (!activeLink) return;
    await dispatch(sendCheerMessage({ linkId: activeLink.id, patientId: activeLink.patientId, message }));
    setSentMessage(message);
    setTimeout(() => {
      setSentMessage(null);
      setCheerOpen(false);
    }, 2400);
  }

  if (!activeLink) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <ScreenState
            kind="vacio"
            title="Vincúlate primero"
            description="Necesitas acompañar a alguien para ver su progreso."
            testID="acompanar-sin-vinculo"
          />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!activeLink.shareProgreso) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <ScreenState
            kind="vacio"
            title="Sin acceso al progreso"
            description="La persona que acompañas no activó compartir su progreso."
            testID="acompanar-sin-permiso"
          />
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <ThemedText variant="headlineMd" accessibilityRole="header">
            Acompañar
          </ThemedText>
        </View>

        {viewStatus === 'error' ? (
          <ScreenState kind="error" title="No pudimos cargar el progreso" testID="acompanar-error" />
        ) : viewStatus === 'cargando' || viewStatus === 'idle' ? (
          <ScreenState kind="cargando" title="Cargando…" testID="acompanar-cargando" />
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={[styles.weekCard, { backgroundColor: colors.secondaryContainer }]}>
              <ThemedText variant="headlineSm" colorRole="onSecondaryFixed">
                {viewedWeekSessionCount === 0
                  ? 'Esta semana no ha practicado todavía.'
                  : `Esta semana hizo ${viewedWeekSessionCount} actividad${viewedWeekSessionCount === 1 ? '' : 'es'}.`}
              </ThemedText>
              <Pressable
                onPress={() => setCheerOpen((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel="Enviarle un mensaje de ánimo"
                style={[styles.cheerButton, { backgroundColor: colors.primaryContainer }]}
                testID="acompanar-animo-btn">
                <MaterialIcons name="favorite" size={20} color={colors.onPrimary} />
                <ThemedText variant="labelLg" colorRole="onPrimary">
                  Enviarle un mensaje de ánimo
                </ThemedText>
              </Pressable>
              {cheerOpen ? (
                <View style={styles.cheerOptions}>
                  {sentMessage ? (
                    <View
                      style={styles.cheerConfirmation}
                      accessible
                      accessibilityLiveRegion="polite"
                      testID="acompanar-animo-confirmacion">
                      <MaterialIcons name="check-circle" size={18} color={colors.primary} />
                      <ThemedText variant="labelSm">Mensaje enviado a su teléfono con ternura.</ThemedText>
                    </View>
                  ) : (
                    CHEER_MESSAGES.map((message) => (
                      <Pressable
                        key={message}
                        onPress={() => enviarAnimo(message)}
                        accessibilityRole="button"
                        accessibilityLabel={message}
                        style={[styles.cheerChip, { backgroundColor: colors.surfaceContainerLowest }]}
                        testID={`acompanar-animo-opcion-${message.slice(0, 4)}`}>
                        <ThemedText variant="bodySm">{message}</ThemedText>
                      </Pressable>
                    ))
                  )}
                </View>
              ) : null}
            </View>

            <View style={styles.section}>
              <ThemedText variant="headlineSm">Áreas de práctica</ThemedText>
              {AREAS.map((area) => {
                const level = viewedProgress.find((p) => p.area === area)?.level ?? 1;
                const lastPracticeISO = viewedLastPracticeByArea[area];
                const lastPractice = lastPracticeISO ? new Date(lastPracticeISO) : null;
                return (
                  <View key={area} style={[styles.areaCard, { backgroundColor: colors.surfaceContainerLowest }]}>
                    <View style={styles.areaHeaderRow}>
                      <View style={styles.areaTitleGroup}>
                        <View style={[styles.areaIcon, { backgroundColor: colors.secondaryContainer }]}>
                          <MaterialIcons name={AREA_META[area].icon} size={22} color={colors.primaryContainer} />
                        </View>
                        <ThemedText variant="labelLg">{AREA_META[area].title}</ThemedText>
                      </View>
                      <ThemedText variant="labelMd" colorRole="primary">
                        Nivel {level} de {MAX_LEVEL[area]}
                      </ThemedText>
                    </View>
                    <View
                      style={styles.progressBar}
                      accessibilityLabel={`Progreso: nivel ${level} de ${MAX_LEVEL[area]}`}>
                      {Array.from({ length: MAX_LEVEL[area] }, (_, index) => (
                        <View
                          key={index}
                          style={[
                            styles.progressSegment,
                            { backgroundColor: index < level ? colors.primaryContainer : colors.surfaceContainerHigh },
                          ]}
                        />
                      ))}
                    </View>
                    <ThemedText variant="bodySm" colorRole="onSurfaceVariant">
                      {lastPractice
                        ? `Última práctica: ${lastPractice.toLocaleDateString('es-CO', { weekday: 'long' })}`
                        : 'Sin práctica esta semana'}
                    </ThemedText>
                  </View>
                );
              })}
            </View>

            <View style={[styles.respectCard, { backgroundColor: colors.surfaceContainerLow }]}>
              <MaterialIcons name="shield" size={20} color={colors.primaryContainer} />
              <ThemedText variant="bodySm" colorRole="onSurfaceVariant" style={styles.respectText}>
                Los ejercicios y su ritmo son personales. Tu acompañamiento fortalece su motivación sin generar presión.
              </ThemedText>
            </View>
          </ScrollView>
        )}
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
    paddingBottom: Spacing.xl * 2,
    gap: Spacing.lg,
  },
  weekCard: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cheerButton: {
    minHeight: MinTouchSize + 8,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  cheerOptions: {
    gap: Spacing.xs,
  },
  cheerChip: {
    minHeight: MinTouchSize,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
  },
  cheerConfirmation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: Radius.full,
  },
  section: {
    gap: Spacing.sm,
  },
  areaCard: {
    borderRadius: Radius.default,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  areaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  areaTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  areaIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    flexDirection: 'row',
    gap: 4,
  },
  progressSegment: {
    flex: 1,
    height: 10,
    borderRadius: Radius.full,
  },
  respectCard: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderRadius: Radius.default,
    padding: Spacing.md,
  },
  respectText: {
    flex: 1,
  },
});

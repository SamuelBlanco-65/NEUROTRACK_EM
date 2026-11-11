import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenState } from '@/components/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AREA_META, MAX_LEVEL } from '@/features/activities/constants';
import type { ActivityArea } from '@/features/activities/types';
import { SYMPTOM_TYPE_ICON, symptomTypeLabel } from '@/features/symptoms/constants';
import { distinctSymptomDays, symptomDaysByType } from '@/features/symptoms/summary';
import {
  fetchCaregiverPatientActivity,
  fetchCaregiverPatientSymptoms,
  fetchMyLinksAsCaregiver,
  sendCheerMessage,
} from '@/store/slices/caregiver-slice';
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
  const {
    myLinksAsCaregiver,
    caregiverStatus,
    viewedProgress,
    viewedWeekSessionCount,
    viewedLastPracticeByArea,
    viewStatus,
    viewedSymptoms,
    symptomsStatus,
  } = useAppSelector((state) => state.caregiver);
  const [cheerOpen, setCheerOpen] = useState(false);
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [cheerError, setCheerError] = useState<string | null>(null);

  const activeLink = useMemo(
    () => myLinksAsCaregiver.find((link) => link.status === 'aceptado') ?? null,
    [myLinksAsCaregiver]
  );

  useEffect(() => {
    dispatch(fetchMyLinksAsCaregiver());
  }, [dispatch]);

  useEffect(() => {
    if (activeLink?.shareProgreso) dispatch(fetchCaregiverPatientActivity(activeLink.patientId));
    if (activeLink?.shareSintomas) dispatch(fetchCaregiverPatientSymptoms(activeLink.patientId));
  }, [dispatch, activeLink]);

  async function enviarAnimo(message: string) {
    if (!activeLink) return;
    setCheerError(null);
    const result = await dispatch(
      sendCheerMessage({ linkId: activeLink.id, patientId: activeLink.patientId, message })
    );
    if (sendCheerMessage.fulfilled.match(result)) {
      setSentMessage(message);
    } else {
      setCheerError(result.payload?.message ?? 'No pudimos enviar el mensaje. Inténtalo de nuevo.');
    }
  }

  function cerrarConfirmacion() {
    setSentMessage(null);
    setCheerError(null);
    setCheerOpen(false);
  }

  if (caregiverStatus === 'idle' || caregiverStatus === 'cargando') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <ScreenState kind="cargando" title="Cargando…" testID="acompanar-cargando-vinculo" />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (caregiverStatus === 'error') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <ScreenState kind="error" title="No pudimos cargar tu vínculo" testID="acompanar-error-vinculo" />
        </SafeAreaView>
      </ThemedView>
    );
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

  if (!activeLink.shareProgreso && !activeLink.shareSintomas) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <ScreenState
            kind="vacio"
            title="Sin acceso por ahora"
            description="La persona que acompañas no activó compartir su progreso ni sus síntomas."
            testID="acompanar-sin-permiso"
          />
        </SafeAreaView>
      </ThemedView>
    );
  }

  const symptomsSection = (
    <SymptomsWeekSection
      shared={activeLink.shareSintomas}
      status={symptomsStatus}
      logs={viewedSymptoms}
      colors={colors}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <ThemedText variant="headlineMd" accessibilityRole="header">
            Acompañar
          </ThemedText>
        </View>

        {!activeLink.shareProgreso ? (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {symptomsSection}
            <View
              style={[styles.respectCard, { backgroundColor: colors.surfaceContainerLow }]}
              accessible
              accessibilityLabel="Actividades: la persona que acompañas no compartió su progreso."
              testID="acompanar-progreso-no-compartido">
              <MaterialIcons name="visibility-off" size={20} color={colors.onSurfaceVariant} />
              <ThemedText variant="bodySm" colorRole="onSurfaceVariant" style={styles.respectText}>
                La persona que acompañas no compartió su progreso en las actividades.
              </ThemedText>
            </View>
          </ScrollView>
        ) : viewStatus === 'error' ? (
          <ScreenState kind="error" title="No pudimos cargar el progreso" testID="acompanar-error" />
        ) : viewStatus === 'cargando' || viewStatus === 'idle' ? (
          <ScreenState kind="cargando" title="Cargando…" testID="acompanar-cargando" />
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={[styles.weekCard, { backgroundColor: colors.secondaryContainer }]}>
              <ThemedText variant="headlineSm" colorRole="onSecondaryContainer">
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
                      <ThemedText variant="labelSm" style={styles.cheerConfirmationText}>
                        Mensaje enviado a su teléfono con ternura.
                      </ThemedText>
                      <Pressable
                        onPress={cerrarConfirmacion}
                        accessibilityRole="button"
                        accessibilityLabel="Cerrar"
                        hitSlop={8}
                        style={styles.cheerConfirmationClose}
                        testID="acompanar-animo-confirmacion-cerrar">
                        <MaterialIcons name="close" size={18} color={colors.primary} />
                      </Pressable>
                    </View>
                  ) : (
                    <>
                      {cheerError ? (
                        <View
                          style={[styles.cheerConfirmation, { backgroundColor: colors.tertiaryFixed }]}
                          accessibilityRole="alert"
                          accessibilityLiveRegion="assertive"
                          testID="acompanar-animo-error">
                          <MaterialIcons name="error" size={18} color={colors.onTertiaryFixed} />
                          <ThemedText variant="labelSm" colorRole="onTertiaryFixed" style={styles.cheerConfirmationText}>
                            {cheerError}
                          </ThemedText>
                        </View>
                      ) : null}
                      {CHEER_MESSAGES.map((message) => (
                      <Pressable
                        key={message}
                        onPress={() => enviarAnimo(message)}
                        accessibilityRole="button"
                        accessibilityLabel={message}
                        style={[styles.cheerChip, { backgroundColor: colors.surfaceContainerLowest }]}
                        testID={`acompanar-animo-opcion-${message.slice(0, 4)}`}>
                        <ThemedText variant="bodySm">{message}</ThemedText>
                      </Pressable>
                      ))}
                    </>
                  )}
                </View>
              ) : null}
            </View>

            {symptomsSection}

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText variant="headlineSm">Áreas de práctica</ThemedText>
                <ThemedText variant="labelMd" colorRole="secondary">
                  {AREAS.length} activas
                </ThemedText>
              </View>
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
                      accessibilityRole="progressbar"
                      accessibilityLabel={`Progreso: nivel ${level} de ${MAX_LEVEL[area]}`}
                      accessibilityValue={{ min: 1, max: MAX_LEVEL[area], now: level }}>
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

/** «Síntomas esta semana»: solo conteos por tipo, sin notas (las notas nunca llegan al cuidador). */
function SymptomsWeekSection({
  shared,
  status,
  logs,
  colors,
}: {
  shared: boolean;
  status: 'idle' | 'cargando' | 'listo' | 'error';
  logs: Parameters<typeof symptomDaysByType>[0];
  colors: ReturnType<typeof useThemeColors>;
}) {
  if (!shared) {
    return (
      <View
        style={[styles.respectCard, { backgroundColor: colors.surfaceContainerLow }]}
        accessible
        accessibilityLabel="Síntomas esta semana: la persona que acompañas no compartió sus síntomas."
        testID="acompanar-sintomas-no-compartido">
        <MaterialIcons name="visibility-off" size={20} color={colors.onSurfaceVariant} />
        <ThemedText variant="bodySm" colorRole="onSurfaceVariant" style={styles.respectText}>
          La persona que acompañas no compartió sus síntomas.
        </ThemedText>
      </View>
    );
  }

  const days = distinctSymptomDays(logs);
  const byType = symptomDaysByType(logs);

  return (
    <View style={styles.section} testID="acompanar-sintomas">
      <ThemedText variant="headlineSm" accessibilityRole="header">
        Síntomas esta semana
      </ThemedText>
      {status === 'error' ? (
        <View accessibilityRole="alert" accessibilityLiveRegion="assertive">
          <ThemedText variant="bodyMd" colorRole="onSurfaceVariant">
            No pudimos cargar los síntomas. Inténtalo de nuevo más tarde.
          </ThemedText>
        </View>
      ) : status === 'cargando' || status === 'idle' ? (
        <ThemedText variant="bodyMd" colorRole="onSurfaceVariant">
          Cargando…
        </ThemedText>
      ) : days === 0 ? (
        <ThemedText variant="bodyMd" colorRole="onSurfaceVariant">
          Esta semana no ha registrado síntomas.
        </ThemedText>
      ) : (
        <>
          <ThemedText variant="bodyMd" accessibilityLiveRegion="polite">
            Registró síntomas en {days} {days === 1 ? 'día' : 'días'} esta semana.
          </ThemedText>
          {byType.map((item) => (
            <View
              key={item.type}
              style={[styles.areaCard, styles.symptomRow, { backgroundColor: colors.surfaceContainerLowest }]}
              accessible
              accessibilityLabel={`${symptomTypeLabel(item.type)}: ${item.days} ${item.days === 1 ? 'día' : 'días'}`}>
              <View style={[styles.areaIcon, { backgroundColor: colors.secondaryContainer }]}>
                <MaterialIcons name={SYMPTOM_TYPE_ICON[item.type]} size={22} color={colors.primary} />
              </View>
              <ThemedText variant="labelLg" style={styles.respectText}>
                {symptomTypeLabel(item.type)}
              </ThemedText>
              <ThemedText variant="bodyMd" colorRole="onSurfaceVariant">
                {item.days} {item.days === 1 ? 'día' : 'días'}
              </ThemedText>
            </View>
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  symptomRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  cheerConfirmationText: {
    flex: 1,
  },
  cheerConfirmationClose: {
    minWidth: MinTouchSize - 16,
    minHeight: MinTouchSize - 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

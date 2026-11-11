import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenState } from '@/components/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AREA_META, MAX_LEVEL } from '@/features/activities/constants';
import { DOCTOR_SUMMARY_NOTICE, NOT_A_DIAGNOSIS } from '@/features/doctor/constants';
import {
  buildComparisonSentence,
  buildDoctorSummaryText,
  compareSymptoms,
  describeExpiry,
  formatDayMonth,
  formatShortDate,
  hasFewRecords,
  isLinkActive,
  isLinkExpired,
  notesInRange,
  previousPeriodLabel,
  recordingCoverage,
  severityDistribution,
  sharedCategories,
  summarizeActivities,
} from '@/features/doctor/logic';
import { SeverityBars } from '@/features/doctor/severity-bars';
import type { SymptomComparison } from '@/features/doctor/types';
import { aggregateBuckets, buildBucketBoundaries, getPeriodRange, getPreviousPeriodRange, shiftReference } from '@/features/progress/logic';
import type { ProgressPeriod } from '@/features/progress/types';
import { SYMPTOM_TYPE_ICON, symptomTypeLabel } from '@/features/symptoms/constants';
import type { SymptomLog } from '@/features/symptoms/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyPatients, fetchPatientSummary, markPatientViewed, summaryCleared } from '@/store/slices/doctor-slice';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

type DoctorPeriod = Extract<ProgressPeriod, 'mes' | 'tresMeses'>;

const PERIODS: { id: DoctorPeriod; label: string }[] = [
  { id: 'mes', label: 'Mes' },
  { id: 'tresMeses', label: '3 meses' },
];

const NO_LOGS: SymptomLog[] = [];

const DIRECTION_ICON: Record<SymptomComparison['direction'], keyof typeof MaterialIcons.glyphMap> = {
  mas: 'arrow-upward',
  menos: 'arrow-downward',
  igual: 'remove',
};

/** Médico: resumen de un paciente, período actual frente al anterior. Solo lectura, sin interpretación clínica. */
export default function ResumenPacienteScreen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { myPatients, doctorStatus, summary, summaryStatus, summaryError } = useAppSelector((state) => state.doctor);
  const link = myPatients.find((item) => item.id === id);

  const [period, setPeriod] = useState<DoctorPeriod>('mes');
  const [referenceISO, setReferenceISO] = useState(() => new Date().toISOString());

  const reference = useMemo(() => new Date(referenceISO), [referenceISO]);
  const currentRange = useMemo(() => getPeriodRange(period, reference), [period, reference]);
  const previousRange = useMemo(() => getPreviousPeriodRange(period, reference), [period, reference]);
  const active = link ? isLinkActive(link) : false;

  // Si se abre directo (sin pasar por la lista) y todavía no hay pacientes cargados.
  useEffect(() => {
    if (doctorStatus === 'idle') dispatch(fetchMyPatients());
  }, [dispatch, doctorStatus]);

  const linkId = link?.id;
  useEffect(() => {
    if (linkId && active) dispatch(markPatientViewed(linkId));
  }, [dispatch, linkId, active]);

  useEffect(() => {
    return () => {
      dispatch(summaryCleared());
    };
  }, [dispatch]);

  useEffect(() => {
    if (link && active) {
      dispatch(
        fetchPatientSummary({
          link,
          fromISO: previousRange.start.toISOString(),
          toISO: currentRange.end.toISOString(),
        })
      );
    }
  }, [dispatch, link, active, previousRange, currentRange]);

  const logs = summary?.symptomLogs ?? NO_LOGS;
  const sessions = summary?.activitySessions;
  const comparisons = useMemo(
    () => compareSymptoms(logs, currentRange, previousRange, period),
    [logs, currentRange, previousRange, period]
  );
  const comparisonSentence = useMemo(() => buildComparisonSentence(comparisons, period), [comparisons, period]);
  const severity = useMemo(() => severityDistribution(logs, currentRange), [logs, currentRange]);
  const coverage = useMemo(() => recordingCoverage(logs, currentRange), [logs, currentRange]);
  const notes = useMemo(() => notesInRange(logs, currentRange), [logs, currentRange]);
  const activities = useMemo(
    () => summarizeActivities(sessions ?? [], summary?.areaProgress ?? [], currentRange),
    [sessions, summary?.areaProgress, currentRange]
  );
  const buckets = useMemo(
    () => aggregateBuckets(buildBucketBoundaries(period, currentRange), logs, sessions ?? []),
    [period, currentRange, logs, sessions]
  );

  if (!link) {
    return (
      <Shell title="Resumen del paciente" colors={colors}>
        {doctorStatus === 'error' ? (
          <ScreenState kind="error" title="No pudimos cargar este paciente" description="Vuelve a la lista e inténtalo de nuevo." />
        ) : doctorStatus === 'listo' ? (
          <ScreenState kind="vacio" title="No encontramos a este paciente" description="Vuelve a la lista para elegir otro." />
        ) : (
          <ScreenState kind="cargando" title="Cargando…" />
        )}
      </Shell>
    );
  }

  const name = link.patientName ?? 'Paciente';
  const shared = sharedCategories(link);
  const expired = isLinkExpired(link);
  const subtitle = `Comparte: ${
    [shared.sintomas && 'síntomas', shared.actividades && 'actividades', shared.notas && 'notas'].filter(Boolean).join(', ') || 'nada'
  } · ${describeExpiry(link.expiresAt)}`;

  if (!active) {
    return (
      <Shell title={name} subtitle={expired ? undefined : 'Este vínculo no está activo'} colors={colors}>
        <View style={styles.centerBlock} testID="medico-resumen-vencido">
          <View style={[styles.stateIcon, { backgroundColor: colors.surfaceContainer }]}>
            <MaterialIcons name="lock" size={32} color={colors.primary} />
          </View>
          <View accessible accessibilityLiveRegion="polite" style={styles.stateText}>
            <ThemedText variant="headlineSm" accessibilityRole="header" style={styles.centerText}>
              Tu acceso a este resumen terminó
            </ThemedText>
            <ThemedText variant="bodyMd" colorRole="onSurfaceVariant" style={styles.centerText}>
              Si lo necesitas, pídele a tu paciente un código nuevo.
            </ThemedText>
          </View>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Volver a mis pacientes"
            style={[styles.secondaryButton, { backgroundColor: colors.surfaceContainer }]}
            testID="medico-resumen-volver-pacientes">
            <ThemedText variant="labelLg">Volver a mis pacientes</ThemedText>
          </Pressable>
        </View>
      </Shell>
    );
  }

  const isLatest = currentRange.end > new Date();
  const loadingFirst = summaryStatus === 'cargando' && !summary;
  const fewRecords = shared.sintomas && hasFewRecords(coverage.daysWithRecords);
  const maxDays = Math.max(1, ...buckets.map((bucket) => bucket.symptomDays));

  function cargar() {
    if (!link) return;
    dispatch(
      fetchPatientSummary({ link, fromISO: previousRange.start.toISOString(), toISO: currentRange.end.toISOString() })
    );
  }

  function cambiarPeriodo(next: DoctorPeriod) {
    setPeriod(next);
  }

  function moverPeriodo(direction: 1 | -1) {
    setReferenceISO(shiftReference(period, reference, direction).toISOString());
  }

  async function compartirResumen() {
    await Share.share({
      message: buildDoctorSummaryText({
        patientName: name,
        range: currentRange,
        period,
        comparisonSentence,
        comparisons,
        coverage,
        severity,
        activities: shared.actividades ? activities : null,
        notes: shared.notas ? notes : null,
      }),
    });
  }

  return (
    <Shell title={name} subtitle={subtitle} colors={colors}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.notice, { backgroundColor: colors.tertiaryFixed }]} testID="medico-resumen-aviso">
          <MaterialIcons name="info" size={20} color={colors.onTertiaryFixed} />
          <ThemedText variant="bodySm" colorRole="onTertiaryFixed" style={styles.flex}>
            {DOCTOR_SUMMARY_NOTICE}
          </ThemedText>
        </View>

        <View
          accessibilityRole="radiogroup"
          accessibilityLabel="Período"
          style={[styles.segmented, { backgroundColor: colors.surfaceContainerLow }]}>
          {PERIODS.map((option) => {
            const selected = option.id === period;
            return (
              <Pressable
                key={option.id}
                onPress={() => cambiarPeriodo(option.id)}
                accessibilityRole="radio"
                accessibilityLabel={option.label}
                accessibilityState={{ checked: selected }}
                style={[styles.segmentedOption, selected && { backgroundColor: colors.primary }]}
                testID={`medico-resumen-periodo-${option.id}`}>
                {selected ? <MaterialIcons name="check" size={18} color={colors.onPrimary} /> : null}
                <ThemedText variant="labelLg" colorRole={selected ? 'onPrimary' : 'onSurface'}>
                  {option.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.periodNav}>
          <Pressable
            onPress={() => moverPeriodo(-1)}
            accessibilityRole="button"
            accessibilityLabel="Período anterior"
            hitSlop={8}
            style={styles.navButton}
            testID="medico-resumen-anterior">
            <MaterialIcons name="chevron-left" size={24} color={colors.onSurface} />
          </Pressable>
          <View style={styles.periodLabel} accessible accessibilityLiveRegion="polite">
            <ThemedText variant="labelLg" style={styles.centerText}>
              {currentRange.label}
            </ThemedText>
            <ThemedText variant="labelSm" colorRole="secondary" style={styles.centerText}>
              frente a {previousRange.label}
            </ThemedText>
          </View>
          <Pressable
            onPress={() => moverPeriodo(1)}
            disabled={isLatest}
            accessibilityRole="button"
            accessibilityLabel={isLatest ? 'Período siguiente, no disponible: es el período actual' : 'Período siguiente'}
            accessibilityState={{ disabled: isLatest }}
            hitSlop={8}
            style={[styles.navButton, { opacity: isLatest ? 0.35 : 1 }]}
            testID="medico-resumen-siguiente">
            <MaterialIcons name="chevron-right" size={24} color={colors.onSurface} />
          </Pressable>
        </View>

        {summaryStatus === 'error' ? (
          <View style={styles.stateWrap}>
            <View style={styles.stateBox}>
              <ScreenState
                kind="error"
                title="No pudimos cargar el resumen"
                description={summaryError?.message ?? 'Revisa tu conexión.'}
                testID="medico-resumen-error"
              />
            </View>
            <Pressable
              onPress={cargar}
              accessibilityRole="button"
              accessibilityLabel="Reintentar"
              style={[styles.secondaryButton, { backgroundColor: colors.surfaceContainer }]}
              testID="medico-resumen-reintentar">
              <MaterialIcons name="refresh" size={20} color={colors.onSurface} />
              <ThemedText variant="labelLg">Reintentar</ThemedText>
            </Pressable>
          </View>
        ) : loadingFirst ? (
          <View style={styles.stateBox}>
            <ScreenState kind="cargando" title="Cargando el resumen…" testID="medico-resumen-cargando" />
          </View>
        ) : (
          <>
            {/* ----- Síntomas ----- */}
            {!shared.sintomas ? (
              <NotShared title="Síntomas" id="sintomas" colors={colors} />
            ) : (
              <>
                <SectionCard colors={colors} title="Constancia de registro" icon="event-available">
                  <ThemedText variant="headlineMd" testID="medico-resumen-constancia">
                    {coverage.daysWithRecords} de {coverage.elapsedDays} días
                  </ThemedText>
                  <View style={[styles.track, { backgroundColor: colors.surfaceContainerLow }]}>
                    <View
                      style={[
                        styles.fill,
                        {
                          width: `${coverage.elapsedDays === 0 ? 0 : Math.min(100, (coverage.daysWithRecords / coverage.elapsedDays) * 100)}%`,
                          backgroundColor: colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <ThemedText variant="bodySm" colorRole="secondary">
                    Registró algo en {coverage.daysWithRecords} {coverage.daysWithRecords === 1 ? 'día' : 'días'}. Los días sin registro no
                    significan días sin síntomas.
                  </ThemedText>
                </SectionCard>

                {fewRecords ? (
                  <View style={[styles.infoCard, { backgroundColor: colors.surfaceContainerLow }]} testID="medico-resumen-pocos-datos">
                    <MaterialIcons name="info-outline" size={22} color={colors.primary} />
                    <ThemedText variant="bodyMd" style={styles.flex}>
                      Hay pocos registros en este período para comparar ({coverage.daysWithRecords}{' '}
                      {coverage.daysWithRecords === 1 ? 'día' : 'días'}). Puedes revisar otro período.
                    </ThemedText>
                  </View>
                ) : (
                  <>
                    <SectionCard colors={colors} title={`Síntomas frente a ${previousPeriodLabel(period)}`} icon="compare-arrows">
                      <View accessible accessibilityLiveRegion="polite">
                        <ThemedText variant="bodyMd" testID="medico-resumen-frase">
                          {comparisonSentence}
                        </ThemedText>
                      </View>
                      {comparisons.map((item) => (
                        <View
                          key={item.type}
                          style={styles.compRow}
                          accessible
                          accessibilityLabel={`${symptomTypeLabel(item.type)}: ${item.currentDays} ${item.currentDays === 1 ? 'día' : 'días'}, antes ${item.previousDays}. ${item.text}`}
                          testID={`medico-resumen-tipo-${item.type}`}>
                          <View style={[styles.compIcon, { backgroundColor: colors.surfaceContainerLow }]}>
                            <MaterialIcons name={SYMPTOM_TYPE_ICON[item.type]} size={20} color={colors.primary} />
                          </View>
                          <View style={styles.flex}>
                            <ThemedText variant="labelLg">
                              {symptomTypeLabel(item.type)} · {item.currentDays} {item.currentDays === 1 ? 'día' : 'días'}
                              <ThemedText variant="bodySm" colorRole="secondary">
                                {'  '}(antes: {item.previousDays})
                              </ThemedText>
                            </ThemedText>
                            <View style={styles.compDelta}>
                              <MaterialIcons name={DIRECTION_ICON[item.direction]} size={16} color={colors.onSurfaceVariant} />
                              <ThemedText variant="bodySm" colorRole="onSurfaceVariant">
                                {item.text}
                              </ThemedText>
                            </View>
                          </View>
                        </View>
                      ))}
                    </SectionCard>

                    <SectionCard colors={colors} title="Intensidad registrada" icon="bar-chart">
                      <SeverityBars severity="leve" count={severity.leve} />
                      <SeverityBars severity="moderado" count={severity.moderado} />
                      <SeverityBars severity="fuerte" count={severity.fuerte} />
                    </SectionCard>

                    <SectionCard colors={colors} title={period === 'mes' ? 'Por semana' : 'Por mes'} icon="date-range">
                      <ThemedText variant="bodyMd">
                        Días con síntomas en {currentRange.label}: {coverage.daysWithRecords}.
                      </ThemedText>
                      {buckets.map((bucket) => (
                        <View
                          key={bucket.id}
                          style={styles.bucketRow}
                          accessible
                          accessibilityLabel={`${bucket.label}: ${bucket.symptomDays} ${bucket.symptomDays === 1 ? 'día' : 'días'} con síntomas`}>
                          <ThemedText variant="labelMd" style={styles.bucketLabel}>
                            {bucket.label}
                          </ThemedText>
                          <View style={[styles.bucketTrack, { backgroundColor: colors.surfaceContainerLow }]}>
                            <View
                              style={[
                                styles.fill,
                                { width: `${(bucket.symptomDays / maxDays) * 100}%`, backgroundColor: colors.primary },
                              ]}
                            />
                          </View>
                          <ThemedText variant="labelMd" style={styles.bucketValue}>
                            {bucket.symptomDays} {bucket.symptomDays === 1 ? 'día' : 'días'}
                          </ThemedText>
                        </View>
                      ))}
                    </SectionCard>
                  </>
                )}
              </>
            )}

            {/* ----- Actividades ----- */}
            {!shared.actividades ? (
              <NotShared title="Actividades" id="actividades" colors={colors} />
            ) : (
              <SectionCard colors={colors} title="Actividades" icon="extension">
                {activities.map((item) => (
                  <View
                    key={item.area}
                    style={styles.compRow}
                    accessible
                    accessibilityLabel={`${AREA_META[item.area].title}: ${item.sessions} ${item.sessions === 1 ? 'sesión' : 'sesiones'}, ${
                      item.level === null ? 'sin nivel aún' : `nivel ${item.level} de ${MAX_LEVEL[item.area]}`
                    }`}
                    testID={`medico-resumen-area-${item.area}`}>
                    <View style={[styles.compIcon, { backgroundColor: colors.surfaceContainerLow }]}>
                      <MaterialIcons name={AREA_META[item.area].icon} size={20} color={colors.primary} />
                    </View>
                    <ThemedText variant="labelLg" style={styles.flex}>
                      {AREA_META[item.area].title}
                    </ThemedText>
                    <View style={styles.areaValues}>
                      <ThemedText variant="bodyMd">
                        {item.sessions} {item.sessions === 1 ? 'sesión' : 'sesiones'}
                      </ThemedText>
                      <ThemedText variant="bodySm" colorRole="secondary">
                        {item.level === null ? 'Sin nivel aún' : `Nivel ${item.level} de ${MAX_LEVEL[item.area]}`}
                      </ThemedText>
                    </View>
                  </View>
                ))}
              </SectionCard>
            )}

            {/* ----- Notas (permiso aparte) ----- */}
            {shared.sintomas ? (
              !shared.notas ? (
                <NotShared title="Notas del paciente" id="notas" colors={colors} />
              ) : (
                <SectionCard colors={colors} title="Notas del paciente" icon="edit-note">
                  {notes.length === 0 ? (
                    <ThemedText variant="bodyMd" colorRole="onSurfaceVariant">
                      No escribió notas en este período.
                    </ThemedText>
                  ) : (
                    notes.map((item) => (
                      <View key={item.id} style={[styles.noteCard, { backgroundColor: colors.surfaceContainerLow }]} testID={`medico-resumen-nota-${item.id}`}>
                        <ThemedText variant="labelSm" colorRole="secondary">
                          {formatDayMonth(item.occurredAt)} · {symptomTypeLabel(item.symptomType)}
                        </ThemedText>
                        <ThemedText variant="bodyMd">«{item.note}»</ThemedText>
                      </View>
                    ))
                  )}
                </SectionCard>
              )
            ) : null}

            <View style={styles.infoRow}>
              <MaterialIcons name="info-outline" size={16} color={colors.onSurfaceVariant} />
              <ThemedText variant="bodySm" colorRole="secondary" style={styles.flex}>
                {NOT_A_DIAGNOSIS}
                {link.lastViewedAt ? ` Último acceso registrado: ${formatShortDate(link.lastViewedAt)}.` : ''}
              </ThemedText>
            </View>

            <Pressable
              onPress={compartirResumen}
              accessibilityRole="button"
              accessibilityLabel="Compartir resumen"
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              testID="medico-resumen-compartir">
              <MaterialIcons name="ios-share" size={22} color={colors.onPrimary} />
              <ThemedText variant="labelLg" colorRole="onPrimary">
                Compartir resumen
              </ThemedText>
            </Pressable>
            <ThemedText variant="bodySm" colorRole="secondary" style={styles.centerText}>
              Se envía como texto con el nombre del paciente (y sus notas, si las compartió) y la aclaración de que no es un
              diagnóstico. Compártelo solo por canales seguros.
            </ThemedText>
          </>
        )}
      </ScrollView>
    </Shell>
  );
}

type ThemeColors = ReturnType<typeof useThemeColors>;

function Shell({
  title,
  subtitle,
  colors,
  children,
}: {
  title: string;
  subtitle?: string;
  colors: ThemeColors;
  children: ReactNode;
}) {
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
            testID="medico-resumen-volver">
            <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
          </Pressable>
          <View style={styles.flex}>
            <ThemedText variant="headlineSm" accessibilityRole="header">
              {title}
            </ThemedText>
            {subtitle ? (
              <ThemedText variant="bodySm" colorRole="secondary">
                {subtitle}
              </ThemedText>
            ) : null}
          </View>
        </View>
        {children}
      </SafeAreaView>
    </ThemedView>
  );
}

function SectionCard({
  title,
  icon,
  colors,
  children,
}: {
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  colors: ThemeColors;
  children: ReactNode;
}) {
  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest }]}>
      <View style={styles.cardHeader}>
        <MaterialIcons name={icon} size={22} color={colors.primary} />
        <ThemedText variant="headlineSm" accessibilityRole="header" style={styles.flex}>
          {title}
        </ThemedText>
      </View>
      {children}
    </View>
  );
}

/** El permiso está apagado: se dice explícitamente en vez de ocultar la sección en silencio. */
function NotShared({ title, id, colors }: { title: string; id: string; colors: ThemeColors }) {
  return (
    <View
      style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}
      accessible
      accessibilityLabel={`${title}: el paciente no compartió esto.`}
      testID={`medico-resumen-no-compartido-${id}`}>
      <View style={styles.cardHeader}>
        <MaterialIcons name="visibility-off" size={22} color={colors.onSurfaceVariant} />
        <ThemedText variant="labelLg" style={styles.flex}>
          {title}
        </ThemedText>
      </View>
      <ThemedText variant="bodyMd" colorRole="onSurfaceVariant">
        El paciente no compartió esto.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  centerText: { textAlign: 'center' },
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
  notice: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderRadius: Radius.default,
    padding: Spacing.sm,
  },
  segmented: {
    flexDirection: 'row',
    borderRadius: Radius.full,
    padding: 4,
    gap: 4,
  },
  segmentedOption: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    minHeight: MinTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  periodNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    minWidth: MinTouchSize,
    minHeight: MinTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodLabel: { flex: 1, alignItems: 'center' },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  infoCard: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xs },
  track: { height: 8, borderRadius: Radius.full, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: Radius.full },
  compRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, minHeight: MinTouchSize },
  compIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compDelta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  areaValues: { alignItems: 'flex-end' },
  bucketRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, minHeight: 32 },
  bucketLabel: { minWidth: 74, flexShrink: 1 },
  bucketTrack: { flex: 1, height: 12, borderRadius: Radius.full, overflow: 'hidden' },
  bucketValue: { minWidth: 64, textAlign: 'right' },
  noteCard: {
    borderRadius: Radius.default,
    padding: Spacing.sm,
    gap: 2,
  },
  stateWrap: { gap: Spacing.sm, paddingVertical: Spacing.lg },
  stateBox: { minHeight: 180 },
  stateText: { gap: Spacing.xs, alignSelf: 'stretch' },
  centerBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  stateIcon: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    minHeight: 56,
    borderRadius: Radius.full,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    minHeight: MinTouchSize,
    borderRadius: Radius.full,
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
  },
});

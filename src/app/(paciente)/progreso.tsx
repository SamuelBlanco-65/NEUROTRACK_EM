import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenState } from '@/components/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MIN_DISTINCT_DAYS_FOR_INSIGHTS, PERIOD_OPTIONS } from '@/features/progress/constants';
import {
  aggregateBuckets,
  buildBucketBoundaries,
  buildHeadline,
  buildInsights,
  countDistinctSymptomDays,
  getPeriodRange,
  getPreviousPeriodRange,
  hasEnoughData,
} from '@/features/progress/logic';
import type { ProgressBucket } from '@/features/progress/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProgressData, periodChanged, referenceShifted, viewToggled } from '@/store/slices/progress-slice';
import { draftReset } from '@/store/slices/symptoms-slice';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

type ThemeColors = ReturnType<typeof useThemeColors>;

export default function PacienteProgresoScreen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const { period, referenceISO, view, status, error, symptomLogs, activitySessions } = useAppSelector(
    (state) => state.progress
  );

  useEffect(() => {
    dispatch(fetchProgressData());
  }, [dispatch, period, referenceISO]);

  const reference = useMemo(() => new Date(referenceISO), [referenceISO]);
  const currentRange = useMemo(() => getPeriodRange(period, reference), [period, reference]);
  const previousRange = useMemo(() => getPreviousPeriodRange(period, reference), [period, reference]);
  const boundaries = useMemo(() => buildBucketBoundaries(period, currentRange), [period, currentRange]);
  const buckets = useMemo(
    () => aggregateBuckets(boundaries, symptomLogs, activitySessions),
    [boundaries, symptomLogs, activitySessions]
  );
  const insights = useMemo(
    () => buildInsights(period, currentRange, previousRange, buckets, symptomLogs),
    [period, currentRange, previousRange, buckets, symptomLogs]
  );
  const distinctSymptomDays = useMemo(() => countDistinctSymptomDays(symptomLogs), [symptomLogs]);
  const enoughData = useMemo(() => hasEnoughData(symptomLogs), [symptomLogs]);
  const headline = useMemo(() => buildHeadline(currentRange, insights), [currentRange, insights]);
  const maxValue = Math.max(1, ...buckets.flatMap((bucket) => [bucket.symptomDays, bucket.activities]));
  const isInitialLoad = status === 'cargando' && symptomLogs.length === 0 && activitySessions.length === 0;

  function registrar() {
    dispatch(draftReset());
    router.push('/registrar-sintoma/paso-1');
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <ThemedText variant="headlineSm" accessibilityRole="header">
            Progreso
          </ThemedText>
        </View>

        <View style={[styles.segmented, { backgroundColor: colors.surfaceContainerLow }]}>
          {PERIOD_OPTIONS.map((option) => {
            const selected = option.id === period;
            return (
              <Pressable
                key={option.id}
                onPress={() => dispatch(periodChanged(option.id))}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                accessibilityState={{ selected }}
                style={[styles.segmentedOption, selected && { backgroundColor: colors.primary }]}
                testID={`progreso-periodo-${option.id}`}>
                <ThemedText variant="labelLg" colorRole={selected ? 'onPrimary' : 'onSurface'}>
                  {option.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.periodNav}>
          <Pressable
            onPress={() => dispatch(referenceShifted(-1))}
            accessibilityRole="button"
            accessibilityLabel="Período anterior"
            hitSlop={8}
            style={styles.navButton}
            testID="progreso-periodo-anterior">
            <MaterialIcons name="chevron-left" size={24} color={colors.onSurface} />
          </Pressable>
          <View style={styles.periodLabelRow}>
            <MaterialIcons name="calendar-today" size={18} color={colors.onSurfaceVariant} />
            <ThemedText variant="labelLg">{currentRange.label}</ThemedText>
          </View>
          <Pressable
            onPress={() => dispatch(referenceShifted(1))}
            accessibilityRole="button"
            accessibilityLabel="Período siguiente"
            hitSlop={8}
            style={styles.navButton}
            testID="progreso-periodo-siguiente">
            <MaterialIcons name="chevron-right" size={24} color={colors.onSurface} />
          </Pressable>
        </View>

        {status === 'error' ? (
          <ScreenState
            kind="error"
            title="No pudimos cargar tu progreso"
            description={error?.message ?? 'Inténtalo de nuevo'}
            testID="paciente-progreso-error"
          />
        ) : isInitialLoad ? (
          <ScreenState kind="cargando" title="Cargando tu progreso…" testID="paciente-progreso-cargando" />
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {!enoughData ? (
              <InsufficientDataCard colors={colors} distinctDays={distinctSymptomDays} onRegistrar={registrar} />
            ) : (
              <>
                <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest }]}>
                  <View
                    style={styles.summaryHeader}
                    accessible
                    accessibilityLiveRegion="polite">
                    <View style={[styles.summaryIcon, { backgroundColor: colors.surfaceContainerLow }]}>
                      <MaterialIcons name="insights" size={20} color={colors.primary} />
                    </View>
                    <ThemedText variant="headlineSm" style={styles.summaryHeadline}>
                      {headline}
                    </ThemedText>
                  </View>

                  {view === 'grafico' ? (
                    <ProgressChart buckets={buckets} maxValue={maxValue} colors={colors} />
                  ) : (
                    <ProgressTable buckets={buckets} colors={colors} />
                  )}

                  <Pressable
                    onPress={() => dispatch(viewToggled())}
                    accessibilityRole="button"
                    accessibilityLabel={view === 'grafico' ? 'Ver como tabla' : 'Ver como gráfico'}
                    style={styles.toggleButton}
                    testID="progreso-toggle-vista">
                    <MaterialIcons
                      name={view === 'grafico' ? 'table-chart' : 'show-chart'}
                      size={20}
                      color={colors.onSurfaceVariant}
                    />
                    <ThemedText variant="labelLg" colorRole="secondary">
                      {view === 'grafico' ? 'Ver como tabla' : 'Ver como gráfico'}
                    </ThemedText>
                  </Pressable>
                </View>

                <ThemedText variant="headlineSm" accessibilityRole="header">
                  Lo que notamos
                </ThemedText>

                {insights.length === 0 ? (
                  <ScreenState
                    kind="vacio"
                    title="Aún sin patrones claros"
                    description="Sigue registrando para ver tendencias."
                    testID="progreso-insights-vacio"
                  />
                ) : (
                  <View style={styles.insightsList}>
                    {insights.map((insight) => (
                      <View
                        key={insight.id}
                        style={[styles.insightCard, { backgroundColor: colors.surfaceContainerLow }]}
                        testID={`progreso-insight-${insight.id}`}>
                        <View style={[styles.insightIcon, { backgroundColor: colors.surfaceContainerLowest }]}>
                          <MaterialIcons name={insight.icon} size={20} color={colors.primary} />
                        </View>
                        <View style={styles.insightTextGroup}>
                          <ThemedText variant="labelLg">{insight.title}</ThemedText>
                          <ThemedText variant="bodySm" colorRole="secondary">
                            {insight.description}
                          </ThemedText>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.disclaimer}>
                  <MaterialIcons name="info-outline" size={16} color={colors.onSurfaceVariant} />
                  <ThemedText variant="bodySm" colorRole="secondary" style={styles.disclaimerText}>
                    Esto es un resumen de tus registros, no un diagnóstico.
                  </ThemedText>
                </View>
              </>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function ProgressChart({
  buckets,
  maxValue,
  colors,
}: {
  buckets: ProgressBucket[];
  maxValue: number;
  colors: ThemeColors;
}) {
  const barMaxHeight = 96;
  return (
    <View testID="progreso-grafico">
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <MaterialIcons name="circle" size={10} color={colors.primary} />
          <ThemedText variant="labelSm" colorRole="secondary">
            Días con síntomas
          </ThemedText>
        </View>
        <View style={styles.legendItem}>
          <MaterialIcons name="change-history" size={10} color={colors.tertiary} />
          <ThemedText variant="labelSm" colorRole="secondary">
            Actividades hechas
          </ThemedText>
        </View>
      </View>
      <View style={styles.chartArea}>
        {buckets.map((bucket) => (
          <View key={bucket.id} style={styles.chartColumn}>
            <View style={styles.barsRow}>
              <View style={styles.barWrap}>
                <ThemedText variant="labelSm">{bucket.symptomDays}</ThemedText>
                <View
                  style={[
                    styles.bar,
                    { height: Math.max(4, (bucket.symptomDays / maxValue) * barMaxHeight), backgroundColor: colors.primary },
                  ]}
                />
              </View>
              <View style={styles.barWrap}>
                <ThemedText variant="labelSm">{bucket.activities}</ThemedText>
                <View
                  style={[
                    styles.bar,
                    { height: Math.max(4, (bucket.activities / maxValue) * barMaxHeight), backgroundColor: colors.tertiary },
                  ]}
                />
              </View>
            </View>
            <ThemedText variant="labelSm" colorRole="secondary" style={styles.chartColumnLabel}>
              {bucket.label}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

function ProgressTable({ buckets, colors }: { buckets: ProgressBucket[]; colors: ThemeColors }) {
  return (
    <View testID="progreso-tabla">
      <View style={[styles.tableHeaderRow, { borderColor: colors.outlineVariant }]}>
        <ThemedText variant="labelSm" colorRole="secondary" style={styles.tableCellLabel}>
          Período
        </ThemedText>
        <ThemedText variant="labelSm" colorRole="secondary" style={styles.tableCellValue}>
          Días con síntomas
        </ThemedText>
        <ThemedText variant="labelSm" colorRole="secondary" style={styles.tableCellValue}>
          Actividades
        </ThemedText>
      </View>
      {buckets.map((bucket) => (
        <View key={bucket.id} style={[styles.tableRow, { borderColor: colors.outlineVariant }]} testID={`progreso-tabla-fila-${bucket.id}`}>
          <ThemedText variant="bodySm" style={styles.tableCellLabel}>
            {bucket.label}
          </ThemedText>
          <ThemedText variant="bodySm" style={styles.tableCellValue}>
            {bucket.symptomDays}
          </ThemedText>
          <ThemedText variant="bodySm" style={styles.tableCellValue}>
            {bucket.activities}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

function InsufficientDataCard({
  colors,
  distinctDays,
  onRegistrar,
}: {
  colors: ThemeColors;
  distinctDays: number;
  onRegistrar: () => void;
}) {
  const goal = MIN_DISTINCT_DAYS_FOR_INSIGHTS;
  const progressRatio = Math.min(1, distinctDays / goal);
  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest }]} testID="progreso-datos-insuficientes">
      <View style={[styles.summaryIcon, styles.insufficientIcon, { backgroundColor: colors.surfaceContainerLow }]}>
        <MaterialIcons name="spa" size={28} color={colors.primary} />
      </View>
      <ThemedText variant="headlineSm" style={styles.insufficientTitle}>
        Necesitamos al menos dos semanas de registros para mostrarte cambios.
      </ThemedText>
      <ThemedText variant="bodyMd" colorRole="secondary" style={styles.insufficientTitle}>
        Conforme vayas registrando tus días y haciendo actividades, aquí podrás ver cómo
        evolucionan tus síntomas y qué momentos te resultan más favorables.
      </ThemedText>
      <View style={styles.progressRow}>
        <ThemedText variant="labelMd" colorRole="secondary">
          Tu ritmo inicial
        </ThemedText>
        <ThemedText variant="labelMd" colorRole="secondary">
          {distinctDays} de {goal} días
        </ThemedText>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: colors.surfaceContainerLow }]}>
        <View style={[styles.progressFill, { width: `${progressRatio * 100}%`, backgroundColor: colors.primary }]} />
      </View>
      <Pressable
        onPress={onRegistrar}
        accessibilityRole="button"
        accessibilityLabel="Registrar cómo me siento"
        style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 }]}
        testID="progreso-registrar-cta">
        <MaterialIcons name="favorite-border" size={20} color={colors.onPrimary} />
        <ThemedText variant="labelLg" colorRole="onPrimary">
          Registrar cómo me siento
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  segmented: {
    flexDirection: 'row',
    marginHorizontal: Spacing.margin,
    borderRadius: Radius.full,
    padding: 4,
    gap: 4,
  },
  segmentedOption: {
    flex: 1,
    minHeight: MinTouchSize - 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  periodNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.margin,
    paddingVertical: Spacing.sm,
  },
  navButton: {
    minWidth: MinTouchSize,
    minHeight: MinTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  scroll: {
    paddingHorizontal: Spacing.margin,
    paddingBottom: Spacing.xl * 2,
    gap: Spacing.md,
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryHeadline: {
    flex: 1,
  },
  legendRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: Spacing.sm,
  },
  chartColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 120,
  },
  barWrap: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  bar: {
    width: 12,
    borderRadius: Radius.default / 2,
  },
  chartColumnLabel: {
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
  },
  tableCellLabel: {
    flex: 1.2,
  },
  tableCellValue: {
    flex: 1,
    textAlign: 'center',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    minHeight: MinTouchSize - 8,
    alignSelf: 'center',
  },
  insightsList: {
    gap: Spacing.sm,
  },
  insightCard: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderRadius: Radius.default,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTextGroup: {
    flex: 1,
    gap: 2,
  },
  disclaimer: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'flex-start',
  },
  disclaimerText: {
    flex: 1,
  },
  insufficientIcon: {
    width: 56,
    height: 56,
    alignSelf: 'center',
  },
  insufficientTitle: {
    textAlign: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressTrack: {
    height: 8,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    minHeight: MinTouchSize,
    borderRadius: Radius.full,
  },
});

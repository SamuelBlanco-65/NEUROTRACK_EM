import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenState } from '@/components/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { dayDetailScript } from '@/features/audio/screen-scripts';
import { SpeakButton } from '@/features/audio/speak-button';
import { buildMonthGrid, isoDateOfDate, leadingBlankCount, logsForIsoDate } from '@/features/symptoms/calendar';
import { SYMPTOM_TYPE_ICON, severityLabel, symptomTypeLabel } from '@/features/symptoms/constants';
import type { Severity, SymptomLog } from '@/features/symptoms/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { draftReset, fetchMonthLogs, monthKey } from '@/store/slices/symptoms-slice';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const EMPTY_LOGS: SymptomLog[] = [];
const SEVERITY_BAR_COUNT: Record<Severity, number> = { leve: 1, moderado: 2, fuerte: 3 };
const SEVERITY_ORDER: Severity[] = ['leve', 'moderado', 'fuerte'];

function severityColor(colors: ReturnType<typeof useThemeColors>, severity: Severity): string {
  if (severity === 'leve') return colors.outline;
  if (severity === 'moderado') return colors.tertiary;
  return colors.primary;
}

export default function PacienteCalendarioScreen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const today = useMemo(() => new Date(), []);

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedIsoDate, setSelectedIsoDate] = useState(isoDateOfDate(today));

  const key = monthKey(year, month);
  const monthEntry = useAppSelector((state) => state.symptoms.monthsByKey[key]);
  const status = monthEntry?.status ?? 'cargando';
  const logs = monthEntry?.logs ?? EMPTY_LOGS;

  useEffect(() => {
    dispatch(fetchMonthLogs({ year, month }));
  }, [dispatch, year, month]);

  function cambiarMes(delta: number) {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  function registrar() {
    dispatch(draftReset());
    router.push('/registrar-sintoma/paso-1');
  }

  const days = useMemo(() => buildMonthGrid(year, month, logs), [year, month, logs]);
  const blanks = leadingBlankCount(year, month);
  const selectedDayLogs = useMemo(() => logsForIsoDate(logs, selectedIsoDate), [logs, selectedIsoDate]);
  const selectedDate = new Date(`${selectedIsoDate}T00:00:00`);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <ThemedText variant="headlineSm" accessibilityRole="header">
            Calendario
          </ThemedText>
        </View>

        {status === 'error' ? (
          <ScreenState
            kind="error"
            title="No pudimos cargar tu calendario"
            description={monthEntry?.error?.message ?? 'Inténtalo de nuevo'}
            testID="paciente-calendario-error"
          />
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <ThemedText variant="bodyMd" colorRole="secondary">
              Tu mes, día a día.
            </ThemedText>

            <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest }]}>
              <View style={styles.monthRow}>
                <ThemedText variant="headlineSm">
                  {MONTH_NAMES[month]} {year}
                </ThemedText>
                <View style={styles.monthNav}>
                  <Pressable
                    onPress={() => cambiarMes(-1)}
                    accessibilityRole="button"
                    accessibilityLabel="Mes anterior"
                    hitSlop={8}
                    style={styles.navButton}
                    testID="calendario-mes-anterior">
                    <MaterialIcons name="chevron-left" size={24} color={colors.onSurface} />
                  </Pressable>
                  <Pressable
                    onPress={() => cambiarMes(1)}
                    accessibilityRole="button"
                    accessibilityLabel="Mes siguiente"
                    hitSlop={8}
                    style={styles.navButton}
                    testID="calendario-mes-siguiente">
                    <MaterialIcons name="chevron-right" size={24} color={colors.onSurface} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.weekRow}>
                {WEEKDAY_LABELS.map((label, index) => (
                  <ThemedText key={index} variant="labelMd" colorRole="secondary" style={styles.weekLabel}>
                    {label}
                  </ThemedText>
                ))}
              </View>

              {status === 'cargando' ? (
                <ScreenState kind="cargando" title="Cargando tu mes…" testID="paciente-calendario-cargando" />
              ) : (
                <View style={styles.grid}>
                  {Array.from({ length: blanks }, (_, index) => (
                    <View key={`blank-${index}`} style={styles.dayCell} />
                  ))}
                  {days.map((day) => {
                    const isSelected = day.isoDate === selectedIsoDate;
                    return (
                      <Pressable
                        key={day.isoDate}
                        onPress={() => setSelectedIsoDate(day.isoDate)}
                        accessibilityRole="button"
                        accessibilityLabel={
                          day.worstSeverity
                            ? `${day.date} de ${MONTH_NAMES[month]}, síntoma ${severityLabel(day.worstSeverity)}`
                            : `${day.date} de ${MONTH_NAMES[month]}, sin registros`
                        }
                        accessibilityState={{ selected: isSelected }}
                        style={[
                          styles.dayCell,
                          isSelected && { backgroundColor: colors.secondaryContainer },
                        ]}
                        testID={`calendario-dia-${day.date}`}>
                        <ThemedText
                          variant="bodyMd"
                          colorRole={isSelected ? 'onSecondaryContainer' : 'onSurface'}
                          style={styles.dayNumber}>
                          {day.date}
                        </ThemedText>
                        <View style={styles.dayBadge}>
                          {day.worstSeverity ? (
                            <View style={styles.severityBars}>
                              {Array.from({ length: SEVERITY_BAR_COUNT[day.worstSeverity] }, (_, index) => (
                                <View
                                  key={index}
                                  style={[
                                    styles.severityBar,
                                    { backgroundColor: severityColor(colors, day.worstSeverity as Severity) },
                                  ]}
                                />
                              ))}
                            </View>
                          ) : null}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              <View style={[styles.legend, { backgroundColor: colors.surfaceContainerLow }]}>
                {SEVERITY_ORDER.map((severity) => (
                  <View key={severity} style={styles.legendItem}>
                    <View style={styles.severityBars}>
                      {Array.from({ length: SEVERITY_BAR_COUNT[severity] }, (_, index) => (
                        <View
                          key={index}
                          style={[styles.severityBar, { backgroundColor: severityColor(colors, severity) }]}
                        />
                      ))}
                    </View>
                    <ThemedText variant="labelSm" colorRole="secondary">
                      {severityLabel(severity)}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.detailHeader}>
              <ThemedText variant="headlineSm">
                {selectedDate.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
              </ThemedText>
              <View style={[styles.countChip, { backgroundColor: colors.secondaryContainer }]}>
                <ThemedText variant="labelSm" colorRole="onSecondaryContainer">
                  {selectedDayLogs.length} registro{selectedDayLogs.length === 1 ? '' : 's'}
                </ThemedText>
              </View>
            </View>
            <SpeakButton
              text={dayDetailScript(
                selectedDate.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }),
                selectedDayLogs.map((log) => ({
                  type: symptomTypeLabel(log.symptomType),
                  severity: severityLabel(log.severity),
                  time: new Date(log.occurredAt).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' }),
                  note: log.note,
                }))
              )}
              label="Escuchar"
              accessibilityLabel="Escuchar el detalle de este día"
              style={{ alignSelf: 'flex-start' }}
              testID="paciente-calendario-escuchar"
            />

            {selectedDayLogs.length === 0 ? (
              <ScreenState
                kind="vacio"
                title="Sin síntomas registrados este día"
                description="Toca «Registrar» para anotar cómo te sientes."
                testID="paciente-calendario-dia-vacio"
              />
            ) : (
              <View style={styles.recordList}>
                {selectedDayLogs.map((log) => (
                  <View key={log.id} style={[styles.recordCard, { backgroundColor: colors.surfaceContainer }]}>
                    <View style={styles.recordRow}>
                      <View style={styles.recordTitleGroup}>
                        <View
                          style={[styles.recordIcon, { backgroundColor: colors.surfaceContainerLowest }]}>
                          <MaterialIcons name={SYMPTOM_TYPE_ICON[log.symptomType]} size={20} color={colors.primary} />
                        </View>
                        <View>
                          <ThemedText variant="labelLg">{symptomTypeLabel(log.symptomType)}</ThemedText>
                          <ThemedText variant="bodySm" colorRole="secondary">
                            {new Date(log.occurredAt).toLocaleTimeString('es-CO', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </ThemedText>
                        </View>
                      </View>
                      <View style={[styles.severityBadge, { backgroundColor: colors.tertiaryFixed }]}>
                        <View style={styles.severityBars}>
                          {Array.from({ length: SEVERITY_BAR_COUNT[log.severity] }, (_, index) => (
                            <View
                              key={index}
                              style={[styles.severityBar, { backgroundColor: colors.onTertiaryFixed }]}
                            />
                          ))}
                        </View>
                        <ThemedText variant="labelSm" colorRole="onTertiaryFixed">{severityLabel(log.severity)}</ThemedText>
                      </View>
                    </View>
                    {log.note ? (
                      <ThemedText variant="bodySm" colorRole="secondary" style={styles.recordNote}>
                        {log.note}
                      </ThemedText>
                    ) : null}
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        )}

        <Pressable
          onPress={registrar}
          accessibilityRole="button"
          accessibilityLabel="Registrar cómo te sientes"
          style={[styles.fab, { backgroundColor: colors.primary }]}
          testID="calendario-registrar-fab">
          <MaterialIcons name="add" size={24} color={colors.onPrimary} />
          <ThemedText variant="labelLg" colorRole="onPrimary">
            Registrar
          </ThemedText>
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
  },
  header: {
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  scroll: {
    paddingHorizontal: Spacing.margin,
    paddingBottom: Spacing.xl * 2,
    gap: Spacing.md,
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthNav: {
    flexDirection: 'row',
  },
  navButton: {
    minWidth: MinTouchSize,
    minHeight: MinTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekLabel: {
    flex: 1,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    minHeight: MinTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  dayNumber: {
    lineHeight: 18,
  },
  dayBadge: {
    height: 10,
    justifyContent: 'center',
  },
  severityBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  severityBar: {
    width: 3,
    height: 8,
    borderRadius: 1.5,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    borderRadius: Radius.default,
    padding: Spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  countChip: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  recordList: {
    gap: Spacing.sm,
  },
  recordCard: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  recordTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexShrink: 1,
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  recordNote: {
    paddingLeft: 48,
  },
  fab: {
    position: 'absolute',
    right: Spacing.margin,
    bottom: Spacing.lg,
    minHeight: 56,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});

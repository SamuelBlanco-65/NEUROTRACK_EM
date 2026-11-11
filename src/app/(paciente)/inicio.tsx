import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountButton } from '@/components/account-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { homeScript } from '@/features/audio/screen-scripts';
import { SpeakButton } from '@/features/audio/speak-button';
import { CATEGORY_META } from '@/features/reminders/constants';
import { SYMPTOM_TYPE_ICON, SYMPTOM_TYPE_OPTIONS } from '@/features/symptoms/constants';
import { dismissCheer, fetchMyLatestCheer } from '@/store/slices/caregiver-slice';
import { completeReminder, fetchReminders } from '@/store/slices/reminders-slice';
import { draftSymptomTypeSet, fetchMonthLogs, monthKey } from '@/store/slices/symptoms-slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

const WEEKDAY_LETTERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function startOfWeek(date: Date): Date {
  const day = date.getDay(); // 0 domingo .. 6 sábado
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(date.getDate() + diffToMonday);
  return monday;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function capitalize(text: string): string {
  return text.length > 0 ? text[0].toUpperCase() + text.slice(1) : text;
}

export default function PacienteInicioScreen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const session = useAppSelector((state) => state.auth.session);
  const { latestCheer } = useAppSelector((state) => state.caregiver);
  const { items: reminders } = useAppSelector((state) => state.reminders);
  const monthsByKey = useAppSelector((state) => state.symptoms.monthsByKey);

  const today = useMemo(() => new Date(), []);
  const weekDays = useMemo(() => {
    const monday = startOfWeek(today);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return date;
    });
  }, [today]);

  useEffect(() => {
    if (!session) return;
    dispatch(fetchMyLatestCheer());
    dispatch(fetchReminders(session.userId));
  }, [dispatch, session]);

  useEffect(() => {
    const keysNeeded = new Set(weekDays.map((date) => `${date.getFullYear()}-${date.getMonth()}`));
    keysNeeded.forEach((key) => {
      const [year, month] = key.split('-').map(Number);
      dispatch(fetchMonthLogs({ year, month }));
    });
  }, [dispatch, weekDays]);

  const greetingName = session?.name
    ? session.name.split(' ')[0]
    : session?.email
      ? capitalize(session.email.split('@')[0])
      : null;
  const dateLabel = capitalize(
    today.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
  );

  const todayReminders = reminders
    .filter((reminder) => sameDay(new Date(reminder.scheduledAt), today))
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  async function marcarHecho(reminderId: string) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await dispatch(completeReminder(reminderId));
  }

  function registrarSintoma(symptomType?: (typeof SYMPTOM_TYPE_OPTIONS)[number]['id']) {
    if (symptomType) dispatch(draftSymptomTypeSet(symptomType));
    router.push(symptomType ? '/registrar-sintoma/paso-2' : '/registrar-sintoma/paso-1');
  }

  function hasLogOnDay(date: Date): boolean {
    const key = monthKey(date.getFullYear(), date.getMonth());
    const logs = monthsByKey[key]?.logs ?? [];
    return logs.some((log) => sameDay(new Date(log.occurredAt), date));
  }

  const registeredDaysCount = weekDays.filter((date) => date <= today && hasLogOnDay(date)).length;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <ThemedText variant="headlineSm" accessibilityRole="header">
            Inicio
          </ThemedText>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => router.push('/accesibilidad')}
              accessibilityRole="button"
              accessibilityLabel="Accesibilidad: ajustar apariencia y lectura"
              hitSlop={8}
              style={[styles.profileButton, { backgroundColor: colors.surfaceContainerHigh }]}
              testID="paciente-inicio-accesibilidad">
              <MaterialIcons name="accessibility-new" size={18} color={colors.onSurface} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/permisos')}
              accessibilityRole="button"
              accessibilityLabel="Cuidadores: gestionar quién te acompaña"
              hitSlop={8}
              style={[styles.profileButton, { backgroundColor: colors.primary }]}
              testID="paciente-inicio-cuidadores">
              <MaterialIcons name="group" size={18} color={colors.onPrimary} />
            </Pressable>
            <AccountButton testID="paciente-inicio-cuenta" />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {latestCheer ? (
            <View
              style={[styles.cheerBanner, { backgroundColor: colors.secondaryContainer }]}
              accessible
              accessibilityLiveRegion="polite"
              testID="paciente-inicio-cheer">
              <MaterialIcons name="favorite" size={20} color={colors.primary} />
              <ThemedText variant="bodyMd" colorRole="onSecondaryContainer" style={styles.cheerText}>
                {latestCheer.message}
              </ThemedText>
              <Pressable
                onPress={() => dispatch(dismissCheer(latestCheer.id))}
                accessibilityRole="button"
                accessibilityLabel="Descartar mensaje"
                hitSlop={8}
                style={styles.cheerDismiss}
                testID="paciente-inicio-cheer-descartar">
                <MaterialIcons name="close" size={18} color={colors.onSecondaryContainer} />
              </Pressable>
            </View>
          ) : null}

          <View style={styles.greeting}>
            <ThemedText variant="headlineLg" accessibilityRole="header">
              {greetingName ? `Hola, ${greetingName}` : 'Hola'}
            </ThemedText>
            <ThemedText variant="bodyMd" colorRole="secondary">
              {dateLabel}
            </ThemedText>
            <SpeakButton
              text={homeScript({
                greeting: greetingName ? `Hola, ${greetingName}` : 'Hola',
                dateLabel,
                cheer: latestCheer?.message ?? null,
                reminders: todayReminders.map((reminder) => ({
                  time: new Date(reminder.scheduledAt).toLocaleTimeString('es-CO', {
                    hour: 'numeric',
                    minute: '2-digit',
                  }),
                  title: reminder.title,
                })),
              })}
              label="Escuchar"
              accessibilityLabel="Escuchar el resumen de hoy"
              style={{ alignSelf: 'flex-start', marginTop: Spacing.xs }}
              testID="paciente-inicio-escuchar"
            />
          </View>

          <View style={[styles.checkinCard, { backgroundColor: colors.tertiaryFixed }]}>
            <View>
              <ThemedText variant="headlineSm" style={{ color: colors.onTertiaryFixed }}>
                ¿Cómo te sientes hoy?
              </ThemedText>
              <ThemedText variant="bodySm" style={{ color: colors.tertiary, marginTop: 2 }}>
                Toca lo que notes. Puedes cambiarlo después.
              </ThemedText>
            </View>
            <View style={styles.chipsRow}>
              {SYMPTOM_TYPE_OPTIONS.filter((option) => option.id !== 'otro').map((option) => (
                <Pressable
                  key={option.id}
                  onPress={() => registrarSintoma(option.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Registrar ${option.title}`}
                  style={[styles.chip, { backgroundColor: colors.surfaceContainerLowest }]}
                  testID={`paciente-inicio-chip-${option.id}`}>
                  <MaterialIcons name={SYMPTOM_TYPE_ICON[option.id]} size={20} color={colors.tertiary} />
                  <ThemedText variant="labelMd">{option.title}</ThemedText>
                </Pressable>
              ))}
            </View>
            <Pressable
              onPress={() => registrarSintoma()}
              accessibilityRole="button"
              accessibilityLabel="Registrar cómo me siento"
              style={[styles.checkinButton, { backgroundColor: colors.primaryContainer }]}
              testID="paciente-inicio-registrar">
              <MaterialIcons name="favorite" size={22} color={colors.onPrimary} />
              <ThemedText variant="labelLg" style={{ color: colors.onPrimary }}>
                Registrar cómo me siento
              </ThemedText>
            </Pressable>
          </View>

          {todayReminders.length > 0 ? (
            <View style={styles.remindersSection}>
              <ThemedText variant="headlineSm">Tu plan de hoy</ThemedText>
              {todayReminders.map((reminder) => (
                <View
                  key={reminder.id}
                  style={[
                    styles.reminderCard,
                    { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant },
                  ]}>
                  <View style={styles.reminderTime}>
                    <ThemedText variant="labelMd">
                      {new Date(reminder.scheduledAt).toLocaleTimeString('es-CO', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </ThemedText>
                  </View>
                  <View style={[styles.reminderIcon, { backgroundColor: colors.secondaryContainer }]}>
                    <MaterialIcons name={CATEGORY_META[reminder.category].icon} size={20} color={colors.primary} />
                  </View>
                  <View style={styles.reminderBody}>
                    <ThemedText variant="labelMd">{reminder.title}</ThemedText>
                    <ThemedText variant="bodySm" colorRole="secondary">
                      {CATEGORY_META[reminder.category].label}
                    </ThemedText>
                  </View>
                  {reminder.status === 'hecho' ? (
                    <View style={[styles.doneChip, { backgroundColor: colors.surfaceContainerLow }]}>
                      <MaterialIcons name="check-circle" size={18} color={colors.primaryContainer} />
                      <ThemedText variant="labelSm" colorRole="primary">
                        Hecho
                      </ThemedText>
                    </View>
                  ) : (
                    <Pressable
                      onPress={() => marcarHecho(reminder.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Marcar ${reminder.title} como hecho`}
                      style={[styles.doneButton, { backgroundColor: colors.surfaceContainerLowest }]}
                      testID={`paciente-inicio-recordatorio-hecho-${reminder.id}`}>
                      <ThemedText variant="labelMd" colorRole="primary">
                        Marcar
                      </ThemedText>
                    </Pressable>
                  )}
                </View>
              ))}
            </View>
          ) : null}

          <View style={[styles.weekCard, { backgroundColor: colors.surfaceContainerLowest }]}>
            <View style={styles.weekHeader}>
              <ThemedText variant="headlineSm">Esta semana</ThemedText>
            </View>
            <View style={styles.weekGrid}>
              {weekDays.map((date, index) => {
                const isToday = sameDay(date, today);
                const isPast = date < today && !isToday;
                const logged = (isPast || isToday) && hasLogOnDay(date);
                return (
                  <View key={date.toISOString()} style={styles.weekDay}>
                    <ThemedText
                      variant="labelSm"
                      colorRole={isToday ? 'primary' : 'secondary'}
                      style={isToday ? styles.weekDayLetterToday : undefined}>
                      {WEEKDAY_LETTERS[index]}
                    </ThemedText>
                    <View
                      style={[
                        styles.weekDot,
                        {
                          backgroundColor: isToday
                            ? colors.secondaryContainer
                            : logged
                              ? colors.primaryContainer
                              : colors.surfaceContainerHigh,
                        },
                      ]}>
                      {isToday ? (
                        <ThemedText variant="labelMd" colorRole="primary">
                          Hoy
                        </ThemedText>
                      ) : logged ? (
                        <MaterialIcons name="check" size={18} color={colors.onPrimary} />
                      ) : (
                        <ThemedText variant="labelSm" colorRole="secondary">
                          {date.getDate()}
                        </ThemedText>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
            <ThemedText variant="bodySm" colorRole="secondary">
              Registraste {registeredDaysCount} {registeredDaysCount === 1 ? 'día' : 'días'}. Los días de
              descanso también cuentan.
            </ThemedText>
            <Pressable
              onPress={() => router.push('/(paciente)/progreso')}
              accessibilityRole="link"
              accessibilityLabel="Ver mi progreso"
              hitSlop={8}
              style={styles.progressLink}>
              <ThemedText variant="labelMd" colorRole="primary">
                Ver mi progreso
              </ThemedText>
              <MaterialIcons name="arrow-forward" size={20} color={colors.primary} />
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: Spacing.margin,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  cheerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.default,
    padding: Spacing.sm,
  },
  cheerText: {
    flex: 1,
  },
  cheerDismiss: {
    minWidth: MinTouchSize - 16,
    minHeight: MinTouchSize - 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    gap: 2,
  },
  checkinCard: {
    borderRadius: Radius.lg,
    padding: Spacing.md + 4,
    gap: Spacing.md,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm - 2,
  },
  chip: {
    minHeight: MinTouchSize,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm + 4,
    borderRadius: Radius.full,
  },
  checkinButton: {
    minHeight: 56,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  remindersSection: {
    gap: Spacing.sm,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.default,
    borderWidth: 1,
    padding: Spacing.sm + 2,
  },
  reminderTime: {
    width: 44,
  },
  reminderIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderBody: {
    flex: 1,
    gap: 2,
  },
  doneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  doneButton: {
    minWidth: 76,
    minHeight: MinTouchSize,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  weekCard: {
    borderRadius: Radius.default,
    padding: Spacing.md,
    gap: Spacing.sm + 4,
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weekGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDay: {
    alignItems: 'center',
    gap: 4,
  },
  weekDayLetterToday: {
    fontWeight: '700',
  },
  weekDot: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: MinTouchSize,
    alignSelf: 'flex-start',
  },
});

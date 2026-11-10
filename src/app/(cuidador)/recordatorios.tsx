import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenState } from '@/components/screen-state';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CATEGORY_META } from '@/features/reminders/constants';
import type { ReminderCategory } from '@/features/reminders/types';
import { fetchMyLinksAsCaregiver } from '@/store/slices/caregiver-slice';
import { addReminder, completeReminder, fetchReminders } from '@/store/slices/reminders-slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

const TIME_PRESETS = [
  { label: 'Hoy 8:00 a. m.', dayOffset: 0, hour: 8 },
  { label: 'Hoy 2:00 p. m.', dayOffset: 0, hour: 14 },
  { label: 'Hoy 8:00 p. m.', dayOffset: 0, hour: 20 },
  { label: 'Mañana 8:00 a. m.', dayOffset: 1, hour: 8 },
];

function presetToISO(dayOffset: number, hour: number): string {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

export default function CuidadorRecordatoriosScreen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const { myLinksAsCaregiver } = useAppSelector((state) => state.caregiver);
  const { items, status, creating } = useAppSelector((state) => state.reminders);
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ReminderCategory>('medicacion');
  const [presetIndex, setPresetIndex] = useState(0);

  const activeLink = useMemo(
    () => myLinksAsCaregiver.find((link) => link.status === 'aceptado') ?? null,
    [myLinksAsCaregiver]
  );

  useEffect(() => {
    dispatch(fetchMyLinksAsCaregiver());
  }, [dispatch]);

  useEffect(() => {
    if (activeLink) dispatch(fetchReminders(activeLink.patientId));
  }, [dispatch, activeLink]);

  async function crear() {
    if (!activeLink || title.trim().length === 0) return;
    const preset = TIME_PRESETS[presetIndex];
    await dispatch(
      addReminder({
        patientId: activeLink.patientId,
        title: title.trim(),
        category,
        scheduledAt: presetToISO(preset.dayOffset, preset.hour),
      })
    );
    setTitle('');
    setFormOpen(false);
  }

  async function marcarHecho(reminderId: string) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await dispatch(completeReminder(reminderId));
  }

  if (!activeLink) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <ScreenState
            kind="vacio"
            title="Vincúlate primero"
            description="Necesitas acompañar a alguien para ver sus recordatorios."
            testID="recordatorios-sin-vinculo"
          />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!activeLink.shareRecordatorios) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <ScreenState
            kind="vacio"
            title="Sin acceso a recordatorios"
            description="La persona que acompañas no activó compartir sus recordatorios."
            testID="recordatorios-sin-permiso"
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
            Recordatorios
          </ThemedText>
        </View>

        {status === 'error' ? (
          <ScreenState kind="error" title="No pudimos cargar los recordatorios" testID="recordatorios-error" />
        ) : status === 'cargando' || status === 'idle' ? (
          <ScreenState kind="cargando" title="Cargando…" testID="recordatorios-cargando" />
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {items.length === 0 ? (
              <ScreenState
                kind="vacio"
                title="Sin recordatorios todavía"
                description="Toca «Nuevo recordatorio» para crear uno."
                testID="recordatorios-sin-recordatorios"
              />
            ) : (
              items.map((reminder) => {
                const done = reminder.status === 'hecho';
                const overdue = !done && new Date(reminder.scheduledAt) < new Date();
                return (
                  <View key={reminder.id} style={[styles.card, { backgroundColor: colors.surfaceContainerLowest }]}>
                    <View style={[styles.cardIcon, { backgroundColor: colors.secondaryContainer }]}>
                      <MaterialIcons name={CATEGORY_META[reminder.category].icon} size={22} color={colors.primaryContainer} />
                    </View>
                    <View style={styles.cardBody}>
                      <View style={styles.cardTitleRow}>
                        <ThemedText variant="labelLg">{reminder.title}</ThemedText>
                        {overdue ? (
                          <View style={[styles.overdueTag, { backgroundColor: colors.tertiaryFixed }]}>
                            <MaterialIcons name="schedule" size={14} color={colors.onTertiaryFixed} />
                            <ThemedText variant="labelSm" colorRole="onTertiaryFixed">
                              Se pasó
                            </ThemedText>
                          </View>
                        ) : null}
                      </View>
                      <ThemedText variant="bodySm" colorRole="onSurfaceVariant">
                        {new Date(reminder.scheduledAt).toLocaleString('es-CO', {
                          weekday: 'short',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}{' '}
                        · {CATEGORY_META[reminder.category].label}
                      </ThemedText>
                    </View>
                    {done ? (
                      <View style={[styles.statusBadge, { backgroundColor: colors.secondaryContainer }]}>
                        <MaterialIcons name="check-circle" size={18} color={colors.primary} />
                        <ThemedText variant="labelSm">Hecho</ThemedText>
                      </View>
                    ) : (
                      <Pressable
                        onPress={() => marcarHecho(reminder.id)}
                        accessibilityRole="button"
                        accessibilityLabel={`Marcar ${reminder.title} como hecho`}
                        style={[styles.doneButton, { backgroundColor: colors.secondaryContainer }]}
                        testID={`recordatorios-marcar-hecho-${reminder.id}`}>
                        <MaterialIcons name="done" size={18} color={colors.primary} />
                        <ThemedText variant="labelSm" colorRole="primary">
                          Hecho
                        </ThemedText>
                      </Pressable>
                    )}
                  </View>
                );
              })
            )}

            {formOpen ? (
              <View style={[styles.form, { backgroundColor: colors.surfaceContainerLowest }]}>
                <TextField
                  label="Título del recordatorio"
                  icon="notifications"
                  value={title}
                  onChangeText={setTitle}
                  placeholder="¿Qué hay que recordar?"
                  testID="recordatorios-form-titulo"
                />
                <View style={styles.chipRow} accessibilityRole="radiogroup" accessibilityLabel="Categoría">
                  {(Object.keys(CATEGORY_META) as ReminderCategory[]).map((key) => {
                    const selected = key === category;
                    return (
                      <Pressable
                        key={key}
                        onPress={() => setCategory(key)}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: selected }}
                        accessibilityLabel={CATEGORY_META[key].label}
                        style={[styles.chip, { backgroundColor: selected ? colors.primaryContainer : colors.surfaceContainerLow }]}
                        testID={`recordatorios-form-categoria-${key}`}>
                        <ThemedText variant="labelMd" colorRole={selected ? 'onPrimary' : 'onSurfaceVariant'}>
                          {CATEGORY_META[key].label}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
                <View style={styles.chipRow} accessibilityRole="radiogroup" accessibilityLabel="Cuándo">
                  {TIME_PRESETS.map((preset, index) => {
                    const selected = index === presetIndex;
                    return (
                      <Pressable
                        key={preset.label}
                        onPress={() => setPresetIndex(index)}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: selected }}
                        accessibilityLabel={preset.label}
                        style={[styles.chip, { backgroundColor: selected ? colors.primaryContainer : colors.surfaceContainerLow }]}
                        testID={`recordatorios-form-hora-${index}`}>
                        <ThemedText variant="labelMd" colorRole={selected ? 'onPrimary' : 'onSurfaceVariant'}>
                          {preset.label}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
                <Pressable
                  onPress={crear}
                  disabled={title.trim().length === 0 || creating}
                  accessibilityRole="button"
                  accessibilityLabel="Guardar recordatorio"
                  style={[styles.saveButton, { backgroundColor: colors.primaryContainer, opacity: title.trim().length === 0 ? 0.5 : 1 }]}
                  testID="recordatorios-form-guardar">
                  <ThemedText variant="labelLg" colorRole="onPrimary">
                    {creating ? 'Guardando…' : 'Guardar recordatorio'}
                  </ThemedText>
                </Pressable>
              </View>
            ) : null}
          </ScrollView>
        )}

        {!formOpen ? (
          <Pressable
            onPress={() => setFormOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Nuevo recordatorio"
            style={[styles.fab, { backgroundColor: colors.primaryContainer }]}
            testID="recordatorios-nuevo-fab">
            <MaterialIcons name="add" size={24} color={colors.onPrimary} />
            <ThemedText variant="labelLg" colorRole="onPrimary">
              Nuevo recordatorio
            </ThemedText>
          </Pressable>
        ) : null}
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
    gap: Spacing.sm,
  },
  card: {
    borderRadius: Radius.default,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  overdueTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  doneButton: {
    minWidth: MinTouchSize,
    minHeight: MinTouchSize,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  form: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    minHeight: MinTouchSize - 8,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    justifyContent: 'center',
  },
  saveButton: {
    minHeight: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
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

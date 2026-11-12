import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenState } from '@/components/screen-state';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CATEGORY_META } from '@/features/reminders/constants';
import {
  combineDateAndTime,
  defaultReminderDate,
  isFutureReminder,
  reminderCategoryLabel,
} from '@/features/reminders/logic';
import { CATEGORY_LABEL_MAX_LENGTH, type ReminderCategory } from '@/features/reminders/types';
import { fetchMyLinksAsCaregiver } from '@/store/slices/caregiver-slice';
import { addReminder, completeReminder, fetchReminders } from '@/store/slices/reminders-slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

const dateFormat: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
const timeFormat: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };

export default function CuidadorRecordatoriosScreen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const { myLinksAsCaregiver, caregiverStatus } = useAppSelector((state) => state.caregiver);
  const { items, status, creating } = useAppSelector((state) => state.reminders);
  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ReminderCategory>('medicacion');
  const [categoryLabel, setCategoryLabel] = useState('');
  const [when, setWhen] = useState<Date>(() => defaultReminderDate());

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

  function abrirFormulario() {
    setFormError(null);
    setWhen(defaultReminderDate());
    setFormOpen(true);
  }

  function cerrarFormulario() {
    setFormOpen(false);
    setFormError(null);
  }

  // Selectores nativos de fecha y hora (accesibles con TalkBack). En Android se abren como diálogo.
  function elegirFecha() {
    DateTimePickerAndroid.open({
      value: when,
      mode: 'date',
      minimumDate: new Date(),
      onChange: (event, date) => {
        if (event.type === 'set' && date) setWhen((current) => combineDateAndTime(date, current));
      },
    });
  }

  function elegirHora() {
    DateTimePickerAndroid.open({
      value: when,
      mode: 'time',
      onChange: (event, date) => {
        if (event.type === 'set' && date) setWhen((current) => combineDateAndTime(current, date));
      },
    });
  }

  async function crear() {
    if (!activeLink || title.trim().length === 0) return;
    if (!isFutureReminder(when)) {
      setFormError('Elige una fecha y una hora que todavía no hayan pasado.');
      return;
    }
    setFormError(null);
    const result = await dispatch(
      addReminder({
        patientId: activeLink.patientId,
        title: title.trim(),
        category,
        categoryLabel: category === 'otro' && categoryLabel.trim().length > 0 ? categoryLabel.trim() : null,
        scheduledAt: when.toISOString(),
      })
    );
    if (addReminder.fulfilled.match(result)) {
      setTitle('');
      setCategory('medicacion');
      setCategoryLabel('');
      setFormOpen(false);
    } else {
      // El formulario se queda abierto con lo escrito para poder reintentar.
      setFormError(result.payload?.message ?? 'No pudimos guardar el recordatorio. Inténtalo de nuevo.');
    }
  }

  async function marcarHecho(reminderId: string) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await dispatch(completeReminder(reminderId));
  }

  if (caregiverStatus === 'idle' || caregiverStatus === 'cargando') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <ScreenState kind="cargando" title="Cargando…" testID="recordatorios-cargando-vinculo" />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (caregiverStatus === 'error') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <ScreenState kind="error" title="No pudimos cargar tu vínculo" testID="recordatorios-error-vinculo" />
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
            {formOpen ? (
              <View style={[styles.form, { backgroundColor: colors.surfaceContainerLowest }]} testID="recordatorios-form">
                <ThemedText variant="headlineSm" accessibilityRole="header">
                  Nuevo recordatorio
                </ThemedText>
                <TextField
                  label="¿Qué hay que recordar?"
                  icon="notifications"
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Por ejemplo: tomar la pastilla de la noche"
                  testID="recordatorios-form-titulo"
                />

                <View style={styles.formSection}>
                  <ThemedText variant="labelMd">Tipo</ThemedText>
                  <View style={styles.chipRow} accessibilityRole="radiogroup" accessibilityLabel="Tipo de recordatorio">
                    {(Object.keys(CATEGORY_META) as ReminderCategory[]).map((key) => {
                      const selected = key === category;
                      return (
                        <Pressable
                          key={key}
                          onPress={() => setCategory(key)}
                          accessibilityRole="radio"
                          accessibilityState={{ checked: selected }}
                          accessibilityLabel={CATEGORY_META[key].label}
                          style={[styles.chip, { backgroundColor: selected ? colors.primary : colors.surfaceContainerLow }]}
                          testID={`recordatorios-form-categoria-${key}`}>
                          <MaterialIcons
                            name={CATEGORY_META[key].icon}
                            size={18}
                            color={selected ? colors.onPrimary : colors.onSurfaceVariant}
                          />
                          <ThemedText variant="labelMd" colorRole={selected ? 'onPrimary' : 'onSurfaceVariant'}>
                            {CATEGORY_META[key].label}
                          </ThemedText>
                        </Pressable>
                      );
                    })}
                  </View>
                  {category === 'otro' ? (
                    <TextField
                      label="Nombre del tipo (opcional)"
                      icon="label"
                      value={categoryLabel}
                      onChangeText={(text) => setCategoryLabel(text.slice(0, CATEGORY_LABEL_MAX_LENGTH))}
                      placeholder="Por ejemplo: terapia, ejercicio, trámite"
                      testID="recordatorios-form-categoria-nombre"
                    />
                  ) : null}
                </View>

                <View style={styles.formSection}>
                  <ThemedText variant="labelMd">Cuándo</ThemedText>
                  {Platform.OS === 'android' ? (
                    <View style={styles.dateRow}>
                      <Pressable
                        onPress={elegirFecha}
                        accessibilityRole="button"
                        accessibilityLabel={`Fecha: ${when.toLocaleDateString('es-CO', dateFormat)}`}
                        accessibilityHint="Abre el selector de fecha"
                        style={[styles.dateButton, { backgroundColor: colors.surfaceContainerLow }]}
                        testID="recordatorios-form-fecha">
                        <MaterialIcons name="event" size={22} color={colors.primary} />
                        <View style={styles.dateButtonText}>
                          <ThemedText variant="labelSm" colorRole="secondary">
                            Fecha
                          </ThemedText>
                          <ThemedText variant="labelLg">{when.toLocaleDateString('es-CO', dateFormat)}</ThemedText>
                        </View>
                      </Pressable>
                      <Pressable
                        onPress={elegirHora}
                        accessibilityRole="button"
                        accessibilityLabel={`Hora: ${when.toLocaleTimeString('es-CO', timeFormat)}`}
                        accessibilityHint="Abre el selector de hora"
                        style={[styles.dateButton, { backgroundColor: colors.surfaceContainerLow }]}
                        testID="recordatorios-form-hora">
                        <MaterialIcons name="schedule" size={22} color={colors.primary} />
                        <View style={styles.dateButtonText}>
                          <ThemedText variant="labelSm" colorRole="secondary">
                            Hora
                          </ThemedText>
                          <ThemedText variant="labelLg">{when.toLocaleTimeString('es-CO', timeFormat)}</ThemedText>
                        </View>
                      </Pressable>
                    </View>
                  ) : (
                    <DateTimePicker
                      value={when}
                      mode="datetime"
                      minimumDate={new Date()}
                      onChange={(_, date) => {
                        if (date) setWhen(date);
                      }}
                    />
                  )}
                </View>

                {formError ? (
                  <View
                    style={[styles.formError, { backgroundColor: colors.tertiaryFixed }]}
                    accessibilityRole="alert"
                    accessibilityLiveRegion="assertive"
                    testID="recordatorios-form-error">
                    <MaterialIcons name="error" size={20} color={colors.onTertiaryFixed} />
                    <ThemedText variant="labelMd" colorRole="onTertiaryFixed" style={styles.formErrorText}>
                      {formError}
                    </ThemedText>
                  </View>
                ) : null}

                <View style={styles.formActions}>
                  <Pressable
                    onPress={cerrarFormulario}
                    accessibilityRole="button"
                    accessibilityLabel="Cancelar"
                    style={[styles.cancelButton, { backgroundColor: colors.surfaceContainerHigh }]}
                    testID="recordatorios-form-cancelar">
                    <ThemedText variant="labelLg">Cancelar</ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={crear}
                    disabled={title.trim().length === 0 || creating}
                    accessibilityRole="button"
                    accessibilityLabel="Guardar recordatorio"
                    accessibilityState={{ disabled: title.trim().length === 0 || creating, busy: creating }}
                    style={[
                      styles.saveButton,
                      { backgroundColor: colors.primary, opacity: title.trim().length === 0 ? 0.5 : 1 },
                    ]}
                    testID="recordatorios-form-guardar">
                    <ThemedText variant="labelLg" colorRole="onPrimary">
                      {creating ? 'Guardando…' : 'Guardar recordatorio'}
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            ) : null}

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
                      <MaterialIcons name={CATEGORY_META[reminder.category].icon} size={22} color={colors.primary} />
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
                        · {reminderCategoryLabel(reminder.category, reminder.categoryLabel)}
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

          </ScrollView>
        )}

        <Pressable
          onPress={formOpen ? cerrarFormulario : abrirFormulario}
          accessibilityRole="button"
          accessibilityLabel={formOpen ? 'Cerrar el formulario de recordatorio' : 'Nuevo recordatorio'}
          style={[styles.fab, { backgroundColor: formOpen ? colors.surfaceContainerHigh : colors.primary }]}
          testID="recordatorios-nuevo-fab">
          <MaterialIcons
            name={formOpen ? 'close' : 'add'}
            size={24}
            color={formOpen ? colors.onSurface : colors.onPrimary}
          />
          <ThemedText variant="labelLg" colorRole={formOpen ? 'onSurface' : 'onPrimary'}>
            {formOpen ? 'Cerrar' : 'Nuevo recordatorio'}
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
    paddingBottom: 120,
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
  formError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.default / 2,
    padding: Spacing.sm,
  },
  formErrorText: {
    flex: 1,
  },
  chip: {
    minHeight: MinTouchSize,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  formSection: {
    gap: Spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  dateButton: {
    flexGrow: 1,
    minHeight: 56,
    borderRadius: Radius.default,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dateButtonText: {
    flexShrink: 1,
  },
  formActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  cancelButton: {
    minHeight: 56,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    flex: 1,
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

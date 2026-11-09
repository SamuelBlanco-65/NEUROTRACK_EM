import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CATEGORY_META } from '@/features/reminders/constants';
import { dismissCheer, fetchMyLatestCheer } from '@/store/slices/caregiver-slice';
import { completeReminder, fetchReminders } from '@/store/slices/reminders-slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

export default function PacienteInicioScreen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const session = useAppSelector((state) => state.auth.session);
  const { latestCheer } = useAppSelector((state) => state.caregiver);
  const { items: reminders } = useAppSelector((state) => state.reminders);

  useEffect(() => {
    if (!session) return;
    dispatch(fetchMyLatestCheer());
    dispatch(fetchReminders(session.userId));
  }, [dispatch, session]);

  const pendingToday = reminders.filter((reminder) => {
    if (reminder.status === 'hecho') return false;
    const scheduled = new Date(reminder.scheduledAt);
    const now = new Date();
    return scheduled.toDateString() === now.toDateString();
  });

  async function marcarHecho(reminderId: string) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await dispatch(completeReminder(reminderId));
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <ThemedText variant="headlineMd" accessibilityRole="header">
            Hola
          </ThemedText>
          <Pressable
            onPress={() => router.push('/permisos')}
            accessibilityRole="button"
            accessibilityLabel="Cuidadores: gestionar quién te acompaña"
            style={[styles.profileButton, { backgroundColor: colors.primaryContainer }]}
            testID="paciente-inicio-cuidadores">
            <MaterialIcons name="person" size={20} color={colors.onPrimary} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {latestCheer ? (
            <View
              style={[styles.cheerBanner, { backgroundColor: colors.secondaryContainer }]}
              accessible
              accessibilityLiveRegion="polite"
              testID="paciente-inicio-cheer">
              <MaterialIcons name="favorite" size={20} color={colors.primary} />
              <ThemedText variant="bodyMd" colorRole="onSecondaryFixed" style={styles.cheerText}>
                {latestCheer.message}
              </ThemedText>
              <Pressable
                onPress={() => dispatch(dismissCheer(latestCheer.id))}
                accessibilityRole="button"
                accessibilityLabel="Descartar mensaje"
                hitSlop={8}
                style={styles.cheerDismiss}
                testID="paciente-inicio-cheer-descartar">
                <MaterialIcons name="close" size={18} color={colors.onSecondaryFixed} />
              </Pressable>
            </View>
          ) : null}

          <ThemedText variant="bodyMd" colorRole="onSurfaceVariant">
            Aún no has registrado cómo te sientes hoy.
          </ThemedText>

          {pendingToday.length > 0 ? (
            <View style={styles.remindersSection}>
              <ThemedText variant="headlineSm">Hoy</ThemedText>
              {pendingToday.map((reminder) => (
                <View key={reminder.id} style={[styles.reminderCard, { backgroundColor: colors.surfaceContainerLowest }]}>
                  <View style={[styles.reminderIcon, { backgroundColor: colors.secondaryContainer }]}>
                    <MaterialIcons name={CATEGORY_META[reminder.category].icon} size={20} color={colors.primaryContainer} />
                  </View>
                  <View style={styles.reminderBody}>
                    <ThemedText variant="labelLg">{reminder.title}</ThemedText>
                    <ThemedText variant="bodySm" colorRole="onSurfaceVariant">
                      {new Date(reminder.scheduledAt).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })}
                    </ThemedText>
                  </View>
                  <Pressable
                    onPress={() => marcarHecho(reminder.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Marcar ${reminder.title} como hecho`}
                    style={[styles.doneButton, { backgroundColor: colors.secondaryContainer }]}
                    testID={`paciente-inicio-recordatorio-hecho-${reminder.id}`}>
                    <MaterialIcons name="done" size={18} color={colors.primary} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}
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
  profileButton: {
    width: MinTouchSize - 8,
    height: MinTouchSize - 8,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: Spacing.margin,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
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
  remindersSection: {
    gap: Spacing.sm,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.default,
    padding: Spacing.sm,
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
  doneButton: {
    width: MinTouchSize,
    height: MinTouchSize,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

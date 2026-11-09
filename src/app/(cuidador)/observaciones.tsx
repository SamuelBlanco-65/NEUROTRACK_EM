import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenState } from '@/components/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { CaregiverObservation, ObservationCategory } from '@/features/caregiver/types';
import { fetchMyLinksAsCaregiver, fetchMyObservations } from '@/store/slices/caregiver-slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Radius, Spacing, useThemeColors } from '@/theme';

const CATEGORY_ICON: Record<ObservationCategory, keyof typeof MaterialIcons.glyphMap> = {
  animo: 'sentiment-neutral',
  movilidad: 'directions-walk',
  fatiga: 'battery-alert',
  medicacion: 'medication',
  otro: 'edit-note',
};

const CATEGORY_LABEL: Record<ObservationCategory, string> = {
  animo: 'Ánimo',
  movilidad: 'Movilidad',
  fatiga: 'Fatiga',
  medicacion: 'Medicación',
  otro: 'Otro',
};

function dayGroupLabel(isoDate: string): string {
  const date = new Date(isoDate);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (sameDay(date, today)) return 'Hoy';
  if (sameDay(date, yesterday)) return 'Ayer';
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' });
}

function groupByDay(observations: CaregiverObservation[]): { label: string; items: CaregiverObservation[] }[] {
  const groups: { label: string; items: CaregiverObservation[] }[] = [];
  for (const obs of observations) {
    const label = dayGroupLabel(obs.occurredAt);
    const existing = groups.find((g) => g.label === label);
    if (existing) existing.items.push(obs);
    else groups.push({ label, items: [obs] });
  }
  return groups;
}

export default function CuidadorObservacionesScreen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const { myObservations, observationsStatus, observationsError, myLinksAsCaregiver } = useAppSelector(
    (state) => state.caregiver
  );

  const activeLink = useMemo(
    () => myLinksAsCaregiver.find((link) => link.status === 'aceptado') ?? null,
    [myLinksAsCaregiver]
  );

  useEffect(() => {
    dispatch(fetchMyLinksAsCaregiver());
    dispatch(fetchMyObservations());
  }, [dispatch]);

  const groups = useMemo(() => groupByDay(myObservations), [myObservations]);

  if (!activeLink) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <ScreenState
            kind="vacio"
            title="Vincúlate primero"
            description="Necesitas acompañar a alguien para registrar observaciones."
            testID="observaciones-sin-vinculo"
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
            Observaciones
          </ThemedText>
        </View>

        {observationsStatus === 'error' ? (
          <ScreenState
            kind="error"
            title="No pudimos cargar tus notas"
            description={observationsError?.message ?? 'Inténtalo de nuevo'}
            testID="observaciones-error"
          />
        ) : observationsStatus === 'cargando' || observationsStatus === 'idle' ? (
          <ScreenState kind="cargando" title="Cargando…" testID="observaciones-cargando" />
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <ThemedText variant="bodyMd" colorRole="onSurfaceVariant">
              Lo que notas también ayuda en la consulta. Estas notas son privadas: solo tú las ves.
            </ThemedText>

            {groups.length === 0 ? (
              <ScreenState
                kind="vacio"
                title="Sin notas todavía"
                description="Toca «Nueva observación» para registrar algo que notaste."
                testID="observaciones-sin-notas"
              />
            ) : (
              groups.map((group) => (
                <View key={group.label} style={styles.dayGroup}>
                  <ThemedText variant="headlineSm">{group.label}</ThemedText>
                  {group.items.map((obs) => (
                    <View key={obs.id} style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}>
                      <View style={[styles.categoryIcon, { backgroundColor: colors.secondaryContainer }]}>
                        <MaterialIcons name={CATEGORY_ICON[obs.category]} size={22} color={colors.primaryContainer} />
                      </View>
                      <View style={styles.cardBody}>
                        <View style={styles.cardHeaderRow}>
                          <ThemedText variant="labelLg">{CATEGORY_LABEL[obs.category]}</ThemedText>
                          <ThemedText variant="labelSm" colorRole="onSurfaceVariant">
                            {new Date(obs.occurredAt).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })}
                          </ThemedText>
                        </View>
                        <ThemedText variant="bodyMd" colorRole="onSurfaceVariant">
                          {obs.note}
                        </ThemedText>
                      </View>
                    </View>
                  ))}
                </View>
              ))
            )}
          </ScrollView>
        )}

        <Pressable
          onPress={() => router.push('/nueva-observacion')}
          accessibilityRole="button"
          accessibilityLabel="Registrar nueva observación"
          style={[styles.fab, { backgroundColor: colors.primaryContainer }]}
          testID="observaciones-nueva-fab">
          <MaterialIcons name="add" size={24} color={colors.onPrimary} />
          <ThemedText variant="labelLg" colorRole="onPrimary">
            Nueva observación
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
    gap: Spacing.lg,
  },
  dayGroup: {
    gap: Spacing.sm,
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    gap: Spacing.xs,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
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

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenState } from '@/components/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AreaTile } from '@/features/activities/area-tile';
import { ACTIVITY_AREAS, AREA_META, MAX_LEVEL } from '@/features/activities/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAreaProgress } from '@/store/slices/activities-slice';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

const AREAS = ACTIVITY_AREAS;

export default function PacienteActividadesScreen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const progress = useAppSelector((state) => state.activities.progress);
  const status = useAppSelector((state) => state.activities.progressStatus);
  const error = useAppSelector((state) => state.activities.progressError);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchAreaProgress());
  }, [status, dispatch]);

  if (status === 'cargando' || status === 'idle') {
    return <ScreenState kind="cargando" title="Cargando tus actividades…" testID="actividades-cargando" />;
  }

  if (status === 'error') {
    return (
      <ScreenState
        kind="error"
        title="No pudimos cargar tus actividades"
        description={error?.message ?? 'Inténtalo de nuevo en un momento'}
        testID="actividades-error"
      />
    );
  }

  const nextArea = [...AREAS].sort((a, b) => progress[a] - progress[b])[0];

  return (
    <ThemedView style={styles.container} testID="paciente-actividades-screen">
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <ThemedText variant="headlineSm" accessibilityRole="header">
            Actividades
          </ThemedText>
          <ThemedText variant="bodyMd" colorRole="secondary">
            A tu ritmo, sin cronómetro.
          </ThemedText>

          <Pressable
            onPress={() => router.push({ pathname: '/actividad/[area]', params: { area: nextArea } })}
            testID="actividades-sesion-hoy"
            accessibilityRole="button"
            accessibilityLabel={`Empezar sesión de ${AREA_META[nextArea].title}`}
            style={({ pressed }) => [
              styles.hero,
              { backgroundColor: colors.secondaryContainer, opacity: pressed ? 0.92 : 1 },
            ]}>
            <ThemedText variant="labelSm" colorRole="primary" style={styles.heroTag}>
              TU SESIÓN DE HOY
            </ThemedText>
            <ThemedText variant="headlineMd" colorRole="primary">
              {AREA_META[nextArea].title}
            </ThemedText>
            <ThemedText variant="bodySm" colorRole="onSecondaryContainer">
              Nivel {progress[nextArea]} de {MAX_LEVEL[nextArea]} · 3 a 5 minutos
            </ThemedText>
            <View style={[styles.heroButton, { backgroundColor: colors.primary }]}>
              <ThemedText variant="labelLg" colorRole="onPrimary">
                Empezar sesión
              </ThemedText>
              <MaterialIcons name="play-arrow" size={22} color={colors.onPrimary} />
            </View>
          </Pressable>

          <View style={styles.sectionHeader}>
            <ThemedText variant="headlineSm">Áreas</ThemedText>
            <ThemedText variant="labelMd" colorRole="secondary">
              {AREAS.length} disponibles
            </ThemedText>
          </View>
          <View style={styles.grid}>
            {AREAS.map((area) => (
              <AreaTile
                key={area}
                area={area}
                level={progress[area]}
                onPress={() => router.push({ pathname: '/actividad/[area]', params: { area } })}
                testID={`actividades-tile-${area}`}
              />
            ))}
          </View>

          <View style={[styles.footerCard, { backgroundColor: colors.surfaceContainer }]}>
            <MaterialIcons name="spa" size={20} color={colors.primary} />
            <ThemedText variant="bodySm" colorRole="onSurfaceVariant" style={styles.footerText}>
              Puedes salir de cualquier ejercicio cuando lo necesites.
            </ThemedText>
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
  scroll: {
    paddingHorizontal: Spacing.margin,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  hero: {
    marginTop: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  heroTag: {
    letterSpacing: 1,
  },
  heroButton: {
    marginTop: Spacing.md,
    minHeight: MinTouchSize,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  sectionHeader: {
    marginTop: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  footerCard: {
    marginTop: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.default,
  },
  footerText: {
    flexShrink: 1,
  },
});

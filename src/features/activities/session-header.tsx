import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

type SessionHeaderProps = {
  title: string;
  step?: number;
  total?: number;
  /** Qué se está contando: "Ronda" (sesión en general), "Figura" (secuencia a repetir), "Paso" (pasos guiados). */
  unit?: string;
  onExit: () => void;
  testID?: string;
};

/** Encabezado común de una sesión de actividad: pausar/salir, título, progreso (RF-003/RF-004). */
export function SessionHeader({ title, step, total, unit = 'Ronda', onExit, testID }: SessionHeaderProps) {
  const colors = useThemeColors();
  const showProgress = typeof step === 'number' && typeof total === 'number' && total > 0;

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.topRow}>
        <Pressable
          onPress={onExit}
          testID="actividad-pausar-salir"
          accessibilityRole="button"
          accessibilityLabel="Pausar y salir"
          hitSlop={8}
          style={({ pressed }) => [styles.exitButton, { opacity: pressed ? 0.7 : 1 }]}>
          <MaterialIcons name="pause-circle-outline" size={24} color={colors.onSurfaceVariant} />
        </Pressable>
        <ThemedText variant="headlineSm" accessibilityRole="header" style={styles.title} numberOfLines={1}>
          {title}
        </ThemedText>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]} accessibilityElementsHidden>
          <MaterialIcons name="person" size={16} color={colors.onPrimary} />
        </View>
      </View>

      {showProgress ? (
        <View
          style={styles.progressSection}
          accessibilityRole="progressbar"
          accessibilityLabel={`${unit} ${step} de ${total}`}
          accessibilityValue={{ min: 1, max: total, now: step }}>
          <View style={[styles.stepPill, { backgroundColor: colors.surfaceContainerHigh }]}>
            <View style={[styles.stepDot, { backgroundColor: colors.primaryContainer }]} />
            <ThemedText variant="labelMd" colorRole="primary">
              {unit} {step} de {total}
            </ThemedText>
          </View>
          <View style={styles.progressRow}>
            {Array.from({ length: total as number }, (_, index) => (
              <View
                key={index}
                style={[
                  styles.progressSegment,
                  { backgroundColor: index < (step as number) ? colors.primaryContainer : colors.surfaceContainerHigh },
                ]}
              />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  exitButton: {
    width: MinTouchSize,
    height: MinTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSection: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  stepPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
  },
  progressRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    width: '100%',
    maxWidth: 240,
  },
  progressSegment: {
    flex: 1,
    height: 6,
    borderRadius: Radius.full,
  },
});

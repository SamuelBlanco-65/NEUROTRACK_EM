import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

type WizardHeaderProps = {
  step: 1 | 2 | 3;
  onClose: () => void;
};

const TOTAL_STEPS = 3;

/** Encabezado común de los 3 pasos de registro de síntomas (RF-001). */
export function WizardHeader({ step, onClose }: WizardHeaderProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.titleStack}>
          <ThemedText variant="labelSm" colorRole="secondary">
            Paso {step} de {TOTAL_STEPS}
          </ThemedText>
          <ThemedText variant="headlineSm" accessibilityRole="header">
            Evaluar síntomas
          </ThemedText>
        </View>
        <Pressable
          onPress={onClose}
          testID="wizard-sintomas-cerrar"
          accessibilityRole="button"
          accessibilityLabel="Cerrar registro de síntomas"
          hitSlop={8}
          style={({ pressed }) => [
            styles.closeButton,
            { backgroundColor: colors.secondaryContainer, opacity: pressed ? 0.85 : 1 },
          ]}>
          <MaterialIcons name="close" size={18} color={colors.onSecondaryContainer} />
          <ThemedText variant="labelMd" colorRole="onSecondaryContainer">
            Cerrar
          </ThemedText>
        </Pressable>
      </View>
      <View
        style={styles.progressRow}
        accessibilityRole="progressbar"
        accessibilityLabel="Progreso del registro de síntomas"
        accessibilityValue={{ min: 1, max: TOTAL_STEPS, now: step }}>
        {Array.from({ length: TOTAL_STEPS }, (_, index) => (
          <View
            key={index}
            style={[
              styles.progressSegment,
              { backgroundColor: index < step ? colors.primary : colors.surfaceContainerHighest },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  titleStack: {
    flexShrink: 1,
  },
  closeButton: {
    minHeight: MinTouchSize,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  progressRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  progressSegment: {
    flex: 1,
    height: 8,
    borderRadius: Radius.full,
  },
});

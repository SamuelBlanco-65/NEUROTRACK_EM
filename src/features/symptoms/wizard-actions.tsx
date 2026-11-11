import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

type WizardActionsProps = {
  onBack?: () => void;
  primaryLabel: string;
  onPrimaryPress: () => void;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  primaryTestID: string;
};

/** Barra de acciones inferior común a los 3 pasos de registro de síntomas (RF-001). */
export function WizardActions({
  onBack,
  primaryLabel,
  onPrimaryPress,
  primaryDisabled,
  primaryLoading,
  primaryTestID,
}: WizardActionsProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.row}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          testID="wizard-sintomas-atras"
          accessibilityRole="button"
          accessibilityLabel="Volver al paso anterior"
          hitSlop={8}
          style={({ pressed }) => [
            styles.backButton,
            { backgroundColor: colors.surfaceContainerHigh, opacity: pressed ? 0.85 : 1 },
          ]}>
          <MaterialIcons name="arrow-back" size={20} color={colors.onSurface} />
          <ThemedText variant="labelMd">Atrás</ThemedText>
        </Pressable>
      ) : null}
      <Pressable
        onPress={onPrimaryPress}
        disabled={primaryDisabled || primaryLoading}
        testID={primaryTestID}
        accessibilityRole="button"
        accessibilityLabel={primaryLabel}
        accessibilityState={{ disabled: primaryDisabled || primaryLoading, busy: primaryLoading }}
        style={({ pressed }) => [
          styles.primaryButton,
          {
            backgroundColor: colors.primary,
            opacity: primaryDisabled ? 0.5 : pressed ? 0.9 : 1,
          },
        ]}>
        {primaryLoading ? (
          <ActivityIndicator size="small" color={colors.onPrimary} />
        ) : (
          <ThemedText variant="labelLg" colorRole="onPrimary">
            {primaryLabel}
          </ThemedText>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  backButton: {
    minHeight: 56,
    minWidth: MinTouchSize,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  primaryButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
});

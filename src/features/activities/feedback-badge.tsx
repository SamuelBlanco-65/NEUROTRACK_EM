import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, useThemeColors } from '@/theme';
import type { RoundResult } from './types';

type FeedbackBadgeProps = {
  result: RoundResult;
  testID?: string;
};

/** Resultado de una ronda: ícono + texto + color, nunca solo color (RNF-006). */
export function FeedbackBadge({ result, testID }: FeedbackBadgeProps) {
  const colors = useThemeColors();
  const isCorrect = result === 'correcto';

  return (
    <View
      style={[styles.badge, { backgroundColor: isCorrect ? colors.secondaryContainer : colors.errorContainer }]}
      testID={testID}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite">
      <MaterialIcons
        name={isCorrect ? 'check-circle' : 'info'}
        size={28}
        color={isCorrect ? colors.onSecondaryContainer : colors.onErrorContainer}
      />
      <ThemedText variant="labelLg" colorRole={isCorrect ? 'onSecondaryContainer' : 'onErrorContainer'}>
        {isCorrect ? '¡Bien hecho!' : 'Esta vez no, pero vas avanzando'}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.default,
  },
});

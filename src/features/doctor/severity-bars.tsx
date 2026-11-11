import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { SEVERITY_OPTIONS } from '@/features/symptoms/constants';
import type { Severity } from '@/features/symptoms/types';
import { Spacing, useThemeColors } from '@/theme';

const LEVEL: Record<Severity, number> = { leve: 1, moderado: 2, fuerte: 3 };

/**
 * Severidad sin depender del color (RNF-006): tres barras verticales, las llenas rellenas y las
 * vacías solo con contorno, del mismo color, y siempre con la palabra y la cantidad al lado.
 */
export function SeverityBars({ severity, count }: { severity: Severity; count: number }) {
  const colors = useThemeColors();
  const label = SEVERITY_OPTIONS.find((option) => option.id === severity)?.title ?? severity;
  const filled = LEVEL[severity];
  const countText = `${count} ${count === 1 ? 'registro' : 'registros'}`;

  return (
    <View style={styles.row} accessible accessibilityLabel={`${label}: ${countText}`} testID={`doctor-severidad-${severity}`}>
      <View style={styles.bars} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {[1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.bar,
              { height: 8 + index * 6, borderColor: colors.tertiary, backgroundColor: index <= filled ? colors.tertiary : 'transparent' },
            ]}
          />
        ))}
      </View>
      <ThemedText variant="labelLg" style={styles.label}>
        {label}
      </ThemedText>
      <ThemedText variant="bodyMd" colorRole="onSurfaceVariant">
        {countText}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 36,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    width: 36,
  },
  bar: {
    width: 8,
    borderWidth: 1.5,
    borderRadius: 2,
  },
  label: {
    flex: 1,
  },
});

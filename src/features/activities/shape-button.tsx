import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, useThemeColors } from '@/theme';
import { SHAPE_META } from './constants';
import type { ShapeId } from './types';

type ShapeButtonProps = {
  shape: ShapeId;
  label?: string;
  feedback?: 'correcto' | 'incorrecto';
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
};

/** Botón grande con figura, siempre con ícono + texto (nunca solo color, RNF-006). */
export function ShapeButton({ shape, label, feedback, onPress, disabled, testID }: ShapeButtonProps) {
  const colors = useThemeColors();
  const meta = SHAPE_META[shape];
  const feedbackLabel = feedback === 'correcto' ? ', correcta' : feedback === 'incorrecto' ? ', incorrecta' : '';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      testID={testID}
      accessibilityRole={onPress ? 'button' : 'image'}
      accessibilityLabel={`${label ?? meta.label}${feedbackLabel}`}
      hitSlop={4}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.surfaceContainerLowest, opacity: pressed ? 0.9 : 1 },
        feedback === 'correcto' ? { borderColor: colors.primaryContainer } : null,
        feedback === 'incorrecto' ? { borderColor: colors.error } : null,
      ]}>
      {feedback ? (
        <View
          style={[
            styles.badge,
            { backgroundColor: feedback === 'correcto' ? colors.primaryContainer : colors.error },
          ]}>
          <MaterialIcons
            name={feedback === 'correcto' ? 'check' : 'close'}
            size={16}
            color={feedback === 'correcto' ? colors.surfaceContainerLowest : colors.onError}
          />
        </View>
      ) : null}
      <View style={[styles.iconCircle, { backgroundColor: colors.secondaryContainer }]}>
        <MaterialIcons name={meta.icon} size={36} color={colors.primaryContainer} />
      </View>
      <ThemedText variant="labelLg" colorRole={feedback === 'correcto' ? 'primary' : 'onSurface'}>
        {meta.label}
      </ThemedText>
    </Pressable>
  );
}

/** Figura mostrada en la secuencia a memorizar, dentro de un marco numerado. */
export function ShapeSequenceItem({ shape, order }: { shape: ShapeId; order: number }) {
  const colors = useThemeColors();
  const meta = SHAPE_META[shape];

  return (
    <View
      style={[styles.sequenceItem, { backgroundColor: colors.surfaceContainerLowest }]}
      accessibilityLabel={`Paso ${order}: ${meta.label}`}>
      <MaterialIcons name={meta.icon} size={26} color={colors.primaryContainer} />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '47%',
    minHeight: 148,
    borderRadius: Radius.lg,
    borderWidth: 3,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  badge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sequenceItem: {
    width: 48,
    height: 48,
    borderRadius: Radius.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

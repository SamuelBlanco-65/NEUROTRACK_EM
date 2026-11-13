import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

type DictationButtonProps = {
  /** Enfoca el campo de texto asociado; el teclado del sistema trae su propio micrófono. */
  onStart: () => void;
  testID?: string;
};

/**
 * Entrada por voz para la nota del síntoma (REC-001). Usa el **dictado del teclado del
 * sistema** (el micrófono de Gboard u otro teclado), no un reconocedor propio: Expo SDK 58 no
 * trae reconocimiento de voz y las librerías de terceros exigen una build de desarrollo que
 * Expo Go no admite. Por eso el botón enfoca el campo y
 * explica dónde tocar; el texto dictado entra como cualquier otro texto, se puede corregir
 * antes de guardar, y el audio lo procesa el teclado del propio teléfono, no esta app.
 */
export function DictationButton({ onStart, testID }: DictationButtonProps) {
  const colors = useThemeColors();
  const [showHint, setShowHint] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={() => {
          setShowHint(true);
          onStart();
        }}
        accessibilityRole="button"
        accessibilityLabel="Dictar la nota con la voz"
        accessibilityHint="Abre el teclado. Toca el micrófono del teclado y habla."
        hitSlop={4}
        testID={testID}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.secondaryContainer, opacity: pressed ? 0.85 : 1 },
        ]}>
        <MaterialIcons name="mic" size={22} color={colors.onSecondaryContainer} />
        <ThemedText variant="labelMd" colorRole="onSecondaryContainer">
          Dictar con voz
        </ThemedText>
      </Pressable>

      {showHint ? (
        <View
          style={[styles.hint, { backgroundColor: colors.surfaceContainerLow }]}
          accessibilityLiveRegion="polite"
          testID="dictado-ayuda">
          <MaterialIcons name="info-outline" size={18} color={colors.primary} />
          <ThemedText variant="bodySm" colorRole="onSurfaceVariant" style={styles.hintText}>
            Toca el micrófono del teclado y habla: tu voz se escribirá aquí. Puedes corregir el texto
            antes de guardar.
          </ThemedText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.xs,
  },
  button: {
    minHeight: MinTouchSize,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
  },
  hint: {
    flexDirection: 'row',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: Radius.default,
  },
  hintText: {
    flex: 1,
  },
});
